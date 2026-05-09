/**
 * condCodes.ts — decoder for short condition codes shipped over the wire
 * from /api/scanner/feed (see SCANNER_FEED_COLUMNS / _compute_cond_codes
 * in trading-system/web/queries.py).
 *
 * The wire ships a small array per row, e.g. ["u125", "ml", "rh"], where
 * numeric multipliers are baked into the code itself (u125 = UNUSUAL 12.5x).
 * This module reverses that into the `{label, tier}` shape the existing
 * badge renderer (badge-styles.ts) consumes.
 *
 * Decoder is total — unknown codes return `null` and the caller skips them
 * rather than crashing the row. Forward-compatible: backend can add new
 * codes without breaking the frontend.
 */

export type Badge = { label: string; tier: string };

/**
 * Decode a single condition code into a renderable badge.
 * Returns null if the code is unrecognised.
 */
export function decodeCond(code: string): Badge | null {
  if (!code) return null;

  // Conviction — strength baked into suffix
  if (code === "cv-s") return { label: "★ STRONG", tier: "conviction" };
  if (code === "cv-m") return { label: "★ MODERATE", tier: "conviction" };
  if (code === "cv") return { label: "★ SOLID", tier: "conviction" };

  // Earnings proximity — er<days>
  if (code.startsWith("er")) {
    const d = code.slice(2);
    return { label: `EARNINGS ${d}d`, tier: "event" };
  }

  // ADV-multiple flow tiers
  if (code.startsWith("mf")) {
    return { label: `MEGA FLOW ${code.slice(2)}x`, tier: "institutional" };
  }
  if (code.startsWith("hf")) {
    return { label: `HEAVY FLOW ${code.slice(2)}x`, tier: "institutional" };
  }

  // Close-of-day timing
  if (code === "cd") return { label: "CLOSE-OF-DAY", tier: "timing" };

  // Unusual / V/OI — multiplier ×10 encoded (u125 = 12.5x)
  if (code.startsWith("u") && /^u\d+$/.test(code)) {
    const n = parseInt(code.slice(1), 10) / 10;
    return { label: `UNUSUAL ${n.toFixed(1)}x`, tier: "activity" };
  }
  if (code.startsWith("vo") && /^vo\d+$/.test(code)) {
    const n = parseInt(code.slice(2), 10) / 10;
    return { label: `V/OI ${n.toFixed(1)}x`, tier: "activity" };
  }

  // Accumulation — a<hits>
  if (code.startsWith("a") && /^a\d+$/.test(code)) {
    return { label: `ACCUM ${code.slice(1)}x`, tier: "accumulation" };
  }

  // Whale — w or w<$M>
  if (code === "w") return { label: "WHALE", tier: "size" };
  if (code.startsWith("w") && /^w\d+$/.test(code)) {
    return { label: `$${code.slice(1)}M+`, tier: "size" };
  }

  // Position
  if (code === "o") return { label: "OPENING", tier: "position" };
  // 2026-05-09: ROLL/HEDGE renamed to MIXED — the underlying signal is
  // position_action='ADJUSTING', PositionTracker._classify_action()'s residual
  // [0.35, 0.65] mixed-signal bucket. Old 'rh' label implied an active
  // roll-or-hedge classification; reality is "couldn't decide between OPENING
  // and CLOSING." Both 'rh' (legacy/cached wire) and 'mx' (new wire after the
  // queries.py producer rename ships) render the same MIXED label so deploy
  // ordering doesn't create a badge-display gap. tier=warning preserved —
  // mixed-signal trades are still anti-predictive per the original framing.
  if (code === "rh" || code === "mx") return { label: "MIXED", tier: "warning" };
  if (code === "mm") return { label: "MM", tier: "warning" };
  if (code === "dt") return { label: "DEEP ITM", tier: "position" };

  // OPRA condition-code passthrough — informational tape-level signals about
  // how the print executed. Backend at queries.py:_detect_opra_badges emits
  // these when corresponding OPRA codes appear in the trade's trade_conditions
  // array. Pre-2026-05 these only landed on the legacy /api/scanner/live-flow
  // path; Phase 2 streaming subscribers missed them. Tier strings align with
  // badge-styles.ts: "iso" → cyan, "cross" → fuchsia get distinct colors;
  // "auction", "floor" fall back to the neutral slate UNIFIED style — lower
  // visual prominence than UNUSUAL/V/OI/ACCUM/conviction signals, which is
  // the intended hierarchy. The "ml" short code is shared with the structure-
  // detection path (STRUCT map below); both produce the MULTI-LEG label.
  if (code === "iso") return { label: "ISO", tier: "iso" };
  if (code === "cr") return { label: "CROSS", tier: "cross" };
  if (code === "au") return { label: "AUCTION", tier: "auction" };
  if (code === "fl") return { label: "FLOOR", tier: "floor" };

  // Multi-leg structures
  const STRUCT: Record<string, string> = {
    ca: "CALENDAR SPREAD",
    di: "DIAGONAL SPREAD",
    vt: "VERTICAL SPREAD",
    st: "STRADDLE",
    sg: "STRANGLE",
    ic: "IRON CONDOR",
    bf: "BUTTERFLY",
    ml: "MULTI-LEG",
  };
  if (code in STRUCT) return { label: STRUCT[code], tier: "structure" };

  // Outcomes (historical view) — won, won<pnl>, sc
  if (code === "won") return { label: "WIN", tier: "strategy" };
  if (code.startsWith("won") && /^won\d+$/.test(code)) {
    return { label: `WIN +${code.slice(3)}%`, tier: "strategy" };
  }
  if (code === "sc") return { label: "SCRATCH", tier: "strategy" };

  return null;
}

/**
 * Decode a condition-code array into a list of renderable badges.
 * Drops unknown codes silently. Caps at 4 — scanner UI shows max 4
 * badges per row with a "+N" overflow elsewhere if needed.
 */
export function decodeConds(codes: string[] | null | undefined): Badge[] {
  if (!Array.isArray(codes)) return [];
  const out: Badge[] = [];
  for (const c of codes) {
    const b = decodeCond(c);
    if (b) out.push(b);
    if (out.length >= 4) break;
  }
  return out;
}
