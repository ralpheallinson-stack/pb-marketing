"use client";
import type { GexSnapshot } from "./gex.types";

// GEX Hero Card — Mockup v6, Phase 1. Presentational; fed from page.tsx's
// existing gexData (no re-fetch — page.tsx already owns the gex-heatmap fetch).
// Original scanner palette only (cyan #48DEFF / green #22C55E / red #FF605D);
// NO new @theme tokens (consistent with the Phase-2C revert + Watchlist v3).
// NOTE: label kept as "Slope Strike" (not "Vol Trigger") pending methodology
// confirmation — see project_pb_gex_scanner_refresh §8 Q1.

const CYAN = "#48DEFF";
const GREEN = "#22C55E";
const RED = "#FF605D";

function fmtGex(v: number): string {
  const abs = Math.abs(v);
  const s = v < 0 ? "−" : "+";
  if (abs >= 1e12) return `${s}$${(abs / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `${s}$${(abs / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${s}$${(abs / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${s}$${(abs / 1e3).toFixed(0)}K`;
  return `${s}$${abs.toFixed(0)}`;
}

interface GexHeroCardProps {
  data: GexSnapshot;
  liveSpot: number | null;
  symbol: string;
}

export default function GexHeroCard({ data, liveSpot }: GexHeroCardProps) {
  const effSpot = liveSpot ?? data.spot;
  const prev = data.prev_close ?? data.spot;
  const delta = prev ? effSpot - prev : 0;
  const pct = prev ? (delta / prev) * 100 : 0;
  const changed = Math.abs(delta) >= 0.005;
  const up = delta > 0;

  // Regime + flip distance derived client-side (no server `regime` field needed).
  const longGamma = data.total_net_gex >= 0;
  const flip = data.gamma_flip;
  const flipDist = flip != null ? effSpot - flip : null;
  const regimeColor = longGamma ? GREEN : RED;

  const secondary = [
    { label: "Gamma Flip", value: flip != null ? `$${flip.toFixed(2)}` : "N/A", color: undefined as string | undefined },
    { label: "Slope Strike", value: data.slope_strike != null ? `$${data.slope_strike.toFixed(2)}` : "N/A", color: undefined },
    { label: "Call γ", value: fmtGex(Math.abs(data.total_call_gex)), color: GREEN },
    { label: "Put γ", value: fmtGex(-Math.abs(data.total_put_gex)), color: RED },
  ];

  return (
    <div
      className="mx-5 mt-3 mb-2 rounded-lg border border-white/[0.06] border-l-[4px] px-5 py-3"
      style={{ background: "#0B0F14", borderLeftColor: CYAN }}
    >
      {/* Top row: spot + change · regime pill · flip distance | Total Net GEX */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex flex-col gap-1">
            <div className="flex items-baseline gap-2">
              <span className="text-[28px] font-mono tabular-nums font-bold text-white leading-none">
                ${effSpot.toFixed(2)}
              </span>
              {liveSpot !== null && (
                <span className="inline-flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full animate-pulse" style={{ background: GREEN }} />
                  <span className="text-[8px] font-bold tracking-[0.12em]" style={{ color: GREEN }}>LIVE</span>
                </span>
              )}
            </div>
            {changed ? (
              <span
                className="inline-flex w-fit items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold tabular-nums border"
                style={{ color: up ? GREEN : RED, background: `${up ? GREEN : RED}1A`, borderColor: `${up ? GREEN : RED}4D` }}
              >
                {up ? "▲" : "▼"} {up ? "+" : ""}{delta.toFixed(2)} · {up ? "+" : ""}{pct.toFixed(2)}%
              </span>
            ) : (
              <span className="text-[11px] font-mono tabular-nums text-white/30">unchanged</span>
            )}
          </div>

          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border"
            style={{ color: regimeColor, background: `${regimeColor}26`, borderColor: `${regimeColor}4D` }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "currentColor", boxShadow: "0 0 8px currentColor" }} />
            {longGamma ? "LONG γ" : "SHORT γ"}
          </span>

          {flipDist != null && (
            <span className="text-[12px] text-white/50 tabular-nums">
              {Math.abs(flipDist).toFixed(2)} {flipDist >= 0 ? "above" : "below"} flip
            </span>
          )}
        </div>

        <div className="flex flex-col items-end">
          <span className="text-[9px] uppercase tracking-[0.14em] text-white/40 whitespace-nowrap">Total Net GEX</span>
          <span className="text-[20px] font-mono tabular-nums font-bold leading-none mt-0.5" style={{ color: regimeColor }}>
            {fmtGex(data.total_net_gex)}
          </span>
        </div>
      </div>

      <div className="h-px bg-white/[0.06] my-2.5" />

      {/* Secondary metrics: Gamma Flip · Slope Strike · Call γ · Put γ */}
      <div className="flex items-center gap-x-5 gap-y-1.5 flex-wrap">
        {secondary.map((m) => (
          <div key={m.label} className="flex items-center gap-2">
            <span className="text-[9px] uppercase tracking-[0.14em] text-white/40 whitespace-nowrap">{m.label}</span>
            <span className="text-[12px] font-mono tabular-nums font-semibold whitespace-nowrap" style={m.color ? { color: m.color } : { color: "#fff" }}>
              {m.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
