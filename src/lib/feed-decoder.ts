/**
 * feed-decoder.ts — single source of truth for /api/scanner/feed wire-format
 * decoding. Consumed by both /scanner and /historical so the trade-row shape
 * + badge-decode logic can't drift between routes.
 *
 * Pipeline:
 *   raw response → rowsToTrades(rows, columns) → Trade[]
 *   each row's `conds` array → decodeConds(codes) → Badge[]
 *
 * Backend producers: SCANNER_FEED_COLUMNS + _compute_cond_codes in
 * trading-system/web/queries.py.
 *
 * Consolidated 2026-05-17 from the prior scanner/condCodes.ts + the inline
 * rowsToTrades copies that lived in scanner/page.tsx and historical/page.tsx.
 */

import type { Trade } from "@/components/SignalRow"

// ─── Badge decoder (formerly src/app/scanner/condCodes.ts) ──────────────────

export type Badge = { label: string; tier: string }

/**
 * Decode a single condition code into a renderable badge.
 * Returns null if the code is unrecognised — caller skips it rather than
 * crashing the row. Forward-compatible: backend can add new codes without
 * breaking the frontend.
 */
export function decodeCond(code: string): Badge | null {
  if (!code) return null

  // Conviction — strength baked into suffix
  if (code === "cv-s") return { label: "★ STRONG", tier: "conviction" }
  if (code === "cv-m") return { label: "★ MODERATE", tier: "conviction" }
  if (code === "cv") return { label: "★ SOLID", tier: "conviction" }

  // Earnings proximity — er<days>
  if (code.startsWith("er")) {
    const d = code.slice(2)
    return { label: `EARNINGS ${d}d`, tier: "event" }
  }

  // ADV-multiple flow tiers
  if (code.startsWith("mf")) {
    return { label: `MEGA FLOW ${code.slice(2)}x`, tier: "institutional" }
  }
  if (code.startsWith("hf")) {
    return { label: `HEAVY FLOW ${code.slice(2)}x`, tier: "institutional" }
  }

  // Close-of-day timing
  if (code === "cd") return { label: "CLOSE-OF-DAY", tier: "timing" }

  // Unusual / V/OI — multiplier ×10 encoded (u125 = 12.5x)
  if (code.startsWith("u") && /^u\d+$/.test(code)) {
    const n = parseInt(code.slice(1), 10) / 10
    return { label: `UNUSUAL ${n.toFixed(1)}x`, tier: "activity" }
  }
  if (code.startsWith("vo") && /^vo\d+$/.test(code)) {
    const n = parseInt(code.slice(2), 10) / 10
    return { label: `V/OI ${n.toFixed(1)}x`, tier: "activity" }
  }

  // Accumulation — a<hits>
  if (code.startsWith("a") && /^a\d+$/.test(code)) {
    return { label: `ACCUM ${code.slice(1)}x`, tier: "accumulation" }
  }

  // Whale — w or w<$M>
  if (code === "w") return { label: "WHALE", tier: "size" }
  if (code.startsWith("w") && /^w\d+$/.test(code)) {
    return { label: `$${code.slice(1)}M+`, tier: "size" }
  }

  // Position
  if (code === "o") return { label: "OPENING", tier: "position" }
  // 2026-05-09: ROLL/HEDGE renamed to MIXED — both 'rh' (legacy/cached wire)
  // and 'mx' (new wire after queries.py producer rename) render the same
  // label so deploy ordering doesn't create a badge-display gap.
  if (code === "rh" || code === "mx") return { label: "MIXED", tier: "warning" }
  if (code === "mm") return { label: "MM", tier: "warning" }
  if (code === "dt") return { label: "DEEP ITM", tier: "position" }

  // OPRA passthrough — tape-level execution signals
  if (code === "iso") return { label: "ISO", tier: "iso" }
  if (code === "cr") return { label: "CROSS", tier: "cross" }
  if (code === "au") return { label: "AUCTION", tier: "auction" }
  if (code === "fl") return { label: "FLOOR", tier: "floor" }

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
  }
  if (code in STRUCT) return { label: STRUCT[code], tier: "structure" }

  // Outcomes (historical view) — won, won<pnl>, sc
  if (code === "won") return { label: "WIN", tier: "strategy" }
  if (code.startsWith("won") && /^won\d+$/.test(code)) {
    return { label: `WIN +${code.slice(3)}%`, tier: "strategy" }
  }
  if (code === "sc") return { label: "SCRATCH", tier: "strategy" }

  return null
}

/**
 * Decode a condition-code array into a list of renderable badges.
 * Drops unknown codes silently. Caps at 4 — scanner UI shows max 4
 * badges per row with a "+N" overflow elsewhere if needed.
 */
export function decodeConds(codes: string[] | null | undefined): Badge[] {
  if (!Array.isArray(codes)) return []
  const out: Badge[] = []
  for (const c of codes) {
    const b = decodeCond(c)
    if (b) out.push(b)
    if (out.length >= 4) break
  }
  return out
}

// ─── Wire-format response shape ─────────────────────────────────────────────

export interface FeedMeta {
  topic_id: string
  trading_day: string
  updated_at: string
  filter_count: number
  scorer_version: string
  is_historical: boolean
  columns: string[]
  page?: number
  page_size?: number
  has_more?: boolean
  since_id?: number | null
  total?: number
  requested_date?: string
  served_date?: string
}

export interface FeedAgg {
  sentiment: { label: string; score: number; _sort_score: number }
  pcr: number | null
  call_flow: { premium: string; count: number; _sort_premium: number }
  put_flow: { premium: string; count: number; _sort_premium: number }
}

export interface FeedResponse {
  meta: FeedMeta
  rows: RawRow[]
  agg: FeedAgg
  error?: string
}

// ─── Row decoder (formerly inline in scanner/page.tsx + historical/page.tsx) ─

export type RawRow = unknown[]

/**
 * Rehydrate the columnar wire format `{rows: RawRow[], meta.columns: string[]}`
 * into Trade objects. Backend ships column-array rows for ~70% wire-size
 * reduction over object-per-row; this reverses that.
 *
 * Field-name mismatches (e.g. `_sort_strike` / 100 → strike) are normalized
 * here so consumers see the canonical Trade shape.
 */
// Derive OPEN / CLOSE / ACCUM pills from the authoritative row fields
// (position_action, accum_hits) rather than the backend conds codes — the
// codes only emit OPENING ("o") / ACCUM ("a<n>") on a subset of rows and
// never emit a CLOSING code at all. Strip the partial code-derived
// OPENING/ACCUM badges to avoid duplicates, then prepend the authoritative
// versions so the open/close + accumulation read leads (ScannerAgGrid.tierOf
// promotes OPEN/CLOSE/ACCUM to tier 1). Shared by /scanner and /historical.
function deriveStackBadges(base: Badge[], positionAction: string, accumHits: number): Badge[] {
  const rest = base.filter((b) => b.label !== "OPENING" && !/^ACCUM \d+x$/.test(b.label))
  const lead: Badge[] = []
  if (positionAction === "OPENING") lead.push({ label: "OPEN", tier: "position-open" })
  else if (positionAction === "CLOSING") lead.push({ label: "CLOSE", tier: "position-close" })
  if (accumHits > 1) lead.push({ label: `ACCUM ${accumHits}x`, tier: "accumulation" })
  return [...lead, ...rest]
}

export function rowsToTrades(rows: RawRow[], columns: string[]): Trade[] {
  const idx: Record<string, number> = {}
  for (let i = 0; i < columns.length; i++) idx[columns[i]] = i
  const out: Trade[] = []
  for (const r of rows) {
    const condCodes = (r[idx["conds"]] as string[] | null) ?? []
    const positionAction = (r[idx["position_action"]] as string) || ""
    const accumHits = (r[idx["accum_hits"]] as number | null) ?? 0
    out.push({
      id: r[idx["id"]] as number,
      time: r[idx["time"]] as string,
      date_time: r[idx["date_time"]] as string,
      timestampMs: (r[idx["_sort_time"]] as number | undefined) ?? undefined,
      symbol: r[idx["symbol"]] as string,
      sector: r[idx["sector"]] as string,
      expiration: r[idx["expiration"]] as string,
      strike: ((r[idx["_sort_strike"]] as number) || 0) / 100,
      strike_fmt: r[idx["strike_fmt"]] as string,
      opt_type: r[idx["opt_type"]] as string,
      aggression: r[idx["side"]] as string | null,
      trade_direction: r[idx["bs"]] as string | null,
      direction: (r[idx["direction"]] as string) || undefined,
      spot_fmt: r[idx["spot_fmt"]] as string,
      contracts: r[idx["contracts"]] as number,
      flow_type: r[idx["flow_type"]] as string,
      premium: ((r[idx["_sort_premium"]] as number) || 0) / 100,
      premium_fmt: r[idx["premium_fmt"]] as string,
      day_volume: r[idx["day_volume"]] as number,
      open_interest: r[idx["open_interest"]] as number,
      iv: (r[idx["iv"]] as number | null) ?? null,
      iv_rank: (r[idx["iv_rank"]] as number | null) ?? null,
      ruoa_streak: (r[idx["ruoa_streak"]] as number | null) ?? null,
      grade: r[idx["grade"]] as string,
      bullish: !!(r[idx["bullish"]] as boolean),
      whale: !!(r[idx["whale"]] as boolean),
      mm_suspected: !!(r[idx["mm_suspected"]] as boolean),
      high_conviction: !!(r[idx["high_conviction"]] as boolean),
      structure: (r[idx["structure"]] as string | null) ?? null,
      position_action: (r[idx["position_action"]] as string) || "",
      row_color: (r[idx["row_color"]] as "bullish" | "bearish" | undefined) ?? undefined,
      flow_highlight: (r[idx["flow_highlight"]] as "oi_multi" | "oi_single" | "late" | null) ?? null,
      delta: (r[idx["delta"]] as number | null) ?? null,
      vol_oi: (r[idx["vol_oi"]] as number | undefined) ?? undefined,
      dte: (r[idx["dte"]] as number | undefined) ?? undefined,
      money: (r[idx["money"]] as string) || "",
      accum_hits: (r[idx["accum_hits"]] as number | null) ?? 0,
      accum_premium: (r[idx["accum_premium"]] as number | undefined) ?? undefined,
      adv_multiple: (r[idx["adv_multiple"]] as number | null) ?? null,
      conviction_strength: (r[idx["conviction_strength"]] as string | null) ?? null,
      is_event_driven: !!(r[idx["is_event_driven"]] as boolean),
      contract_volume_multiple: (r[idx["contract_volume_multiple"]] as number | null) ?? null,
      baseline_volume: (r[idx["baseline_volume"]] as number | null) ?? null,
      today_volume: (r[idx["today_volume"]] as number | null) ?? null,
      entry_price: (r[idx["entry_price"]] as number | null) ?? null,
      outcome: (r[idx["outcome"]] as string | undefined) ?? undefined,
      pnl_percent: (r[idx["pnl_percent"]] as number | undefined) ?? undefined,
      badges: deriveStackBadges(decodeConds(condCodes), positionAction, accumHits),
    })
  }
  return out
}


// ─── Day-separator injection (used by /historical multi-day ranges) ──────────

/**
 * Insert synthetic full-width separator rows between trades from different
 * ET calendar days. Consumed by ScannerAgGrid's isFullWidthRow predicate
 * which keys off __isDaySeparator and renders dayLabel via fullWidthCellRenderer.
 *
 * Single-day input is returned unchanged. Rows with missing/invalid date_time
 * pass through without triggering a separator.
 */
export function injectDaySeparators(rows: Trade[]): Trade[] {
  if (rows.length === 0) return rows
  const out: Trade[] = []
  let lastDayKey: string | null = null
  for (const row of rows) {
    // Use ms-epoch timestampMs (mapped from backend _sort_time in
    // rowsToTrades) — date_time is a no-year display string like "5/8 03:35
    // PM" which V8/JSC silently parse to year 2001.
    const ts = row.timestampMs
    if (!ts) { out.push(row); continue }
    const d = new Date(ts)
    if (isNaN(d.getTime())) { out.push(row); continue }
    const dayKey = d.toLocaleDateString("en-US", {
      timeZone: "America/New_York",
      year: "numeric", month: "2-digit", day: "2-digit",
    })
    if (dayKey !== lastDayKey) {
      // Drop year — implicit from picker range. Matches CheddarFlow /
      // BlackBox separator format: "TUE · MAY 15".
      const wd = d.toLocaleDateString("en-US", { timeZone: "America/New_York", weekday: "short" }).toUpperCase()
      const md = d.toLocaleDateString("en-US", { timeZone: "America/New_York", month: "short", day: "numeric" }).toUpperCase()
      const label = `${wd} · ${md}`
      const [m, day, y] = dayKey.split("/")
      const sepId = -parseInt(`${y}${m}${day}`, 10)
      out.push({ id: sepId, __isDaySeparator: true, dayLabel: label } as Trade)
      lastDayKey = dayKey
    }
    out.push(row)
  }
  return out
}
