"use client";
import type { GexSnapshot } from "./gex.types";

// GEX Gamma Profile — Mockup v6 Phase 2. Full-width horizontal 27-bar viz of
// per-strike total net GEX with 4 marked strikes (spot/flip/call-wall/put-wall)
// + legend. Marker colors MATCH the heatmap row tags so the two read as one
// continuous story. Original PB palette; no new deps/tokens; fed from gexData.

const C = { spot: "#48DEFF", flip: "#A855F7", call: "#22C55E", put: "#FF605D" };

function fmtGex(v: number): string {
  const abs = Math.abs(v);
  const s = v < 0 ? "−" : "+";
  if (abs >= 1e12) return `${s}$${(abs / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `${s}$${(abs / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${s}$${(abs / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${s}$${(abs / 1e3).toFixed(0)}K`;
  return `${s}$${abs.toFixed(0)}`;
}

interface GexGammaProfileProps {
  data: GexSnapshot;
  liveSpot: number | null;
}

export default function GexGammaProfile({ data, liveSpot }: GexGammaProfileProps) {
  const spot = liveSpot ?? data.spot;
  const strikes = [...data.strikes].sort((a, b) => a - b);

  const totalFor = (strike: number) => {
    const sk = strike === Math.floor(strike) ? String(Math.floor(strike)) : String(strike);
    const row = data.matrix[sk] || {};
    return Object.values(row).reduce((s, c) => s + c.net_gex, 0);
  };
  const bars = strikes.map((strike) => ({ strike, total: totalFor(strike) }));
  const maxAbs = Math.max(...bars.map((b) => Math.abs(b.total)), 1);

  const nearest = (target: number | null | undefined) =>
    target == null ? null : strikes.reduce((best, s) => (Math.abs(s - target) < Math.abs(best - target) ? s : best), strikes[0]);
  const spotStrike = nearest(spot);
  const flipStrike = nearest(data.gamma_flip);
  // Call wall = largest positive node above spot; put wall = largest positive node below spot.
  // Wall = global gamma extremum: call wall = most positive net GEX, put wall = most negative.
  const callWall = bars.length ? [...bars].sort((a, b) => b.total - a.total)[0] : null;
  const putWall = bars.length ? [...bars].sort((a, b) => a.total - b.total)[0] : null;

  const markColor = (strike: number): string | null =>
    strike === spotStrike ? C.spot
    : strike === flipStrike ? C.flip
    : callWall && strike === callWall.strike ? C.call
    : putWall && strike === putWall.strike ? C.put
    : null;

  // primary expiry for a wall strike = expiry with max |net_gex| in its matrix row (client-side; no backend).
  const primaryExpiry = (strike: number | undefined): string | null => {
    if (strike == null) return null;
    const sk = strike === Math.floor(strike) ? String(Math.floor(strike)) : String(strike);
    const row = data.matrix[sk] || {};
    let best: string | null = null;
    let bestAbs = -1;
    for (const [exp, cell] of Object.entries(row)) {
      const a = Math.abs(cell.net_gex);
      if (a > bestAbs) { bestAbs = a; best = exp; }
    }
    return best;
  };
  const fmtExpShort = (exp: string | null) => {
    if (!exp) return "";
    const p = exp.split("-");
    if (p.length !== 3) return exp;
    const m = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    return `${m[parseInt(p[1]) - 1]} ${p[2]}`;
  };
  const distLabel = (strike: number | null | undefined) =>
    strike == null ? "" : `${Math.abs(strike - spot).toFixed(2)} ${strike >= spot ? "above" : "below"}`;

  const legend = (
    [
      { color: C.spot, label: "Spot", strike: spotStrike, total: null as number | null, exp: null as string | null },
      { color: C.flip, label: "Gamma Flip", strike: flipStrike, total: null, exp: null },
      callWall ? { color: C.call, label: "Call Wall", strike: callWall.strike, total: callWall.total, exp: primaryExpiry(callWall.strike) } : null,
      putWall ? { color: C.put, label: "Put Wall", strike: putWall.strike, total: putWall.total, exp: primaryExpiry(putWall.strike) } : null,
    ].filter(Boolean) as { color: string; label: string; strike: number | null; total: number | null; exp: string | null }[]
  );

  return (
    <div className="mx-5 mb-2 rounded-lg border border-white/[0.06] px-4 py-3" style={{ background: "#0B0F14" }}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">Gamma Profile</span>
        <span className="text-[10px] text-white/30">net γ per strike · all expiries</span>
      </div>

      {/* 27 bars — every-other strike hidden under 600px (mobile) */}
      <div className="flex items-end gap-[2px] h-[48px] max-[600px]:[&>*:nth-child(even)]:hidden">
        {bars.map(({ strike, total }) => {
          const mag = Math.abs(total) / maxAbs;
          const heightPct = total === 0 ? 0 : 12 + Math.pow(mag, 0.55) * 88;
          const opacity = 0.2 + Math.sqrt(mag) * 0.75;
          const pos = total >= 0;
          const mc = markColor(strike);
          return (
            <div key={strike} className="relative flex-1 flex flex-col items-center justify-end h-full min-w-[3px]">
              {mc && <span className="absolute -top-[6px] w-[6px] h-[6px] rounded-full" style={{ background: mc, boxShadow: `0 0 7px ${mc}` }} />}
              <div className="w-full rounded-t-[1px]" style={{ height: `${heightPct}%`, background: pos ? C.call : C.put, opacity, outline: mc ? `1.5px solid ${mc}` : "none", outlineOffset: -1 }} />
            </div>
          );
        })}
      </div>
      {/* Axis: every 3rd strike + all marked */}
      <div className="flex gap-[2px] mt-1 max-[600px]:[&>*:nth-child(even)]:hidden">
        {bars.map(({ strike }, i) => (
          <div key={strike} className="flex-1 text-center min-w-[3px]">
            {(i % 3 === 0 || markColor(strike) != null) && (
              <span className="text-[8px] font-mono tabular-nums" style={{ color: markColor(strike) ?? "rgba(255,255,255,0.3)" }}>{Math.round(strike)}</span>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-6 gap-y-1.5 mt-2 pt-2 border-t border-white/[0.06]">
        {legend.map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: l.color, boxShadow: `0 0 6px ${l.color}` }} />
            <span className="text-[10px] uppercase tracking-[0.1em] text-white/40">{l.label}</span>
            {l.strike != null && <span className="text-[11px] font-mono tabular-nums font-semibold text-white">${Math.round(l.strike)}</span>}
            {l.total != null && <span className="text-[11px] font-mono tabular-nums" style={{ color: l.color }}>{fmtGex(l.total)}</span>}
            {l.strike != null && <span className="text-[10px] font-mono tabular-nums text-white/40">· {distLabel(l.strike)}</span>}
            {l.exp && <span className="text-[10px] font-mono tabular-nums text-white/40">· {fmtExpShort(l.exp)}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
