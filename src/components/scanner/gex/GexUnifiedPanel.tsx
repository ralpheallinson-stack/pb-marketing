"use client";
import type { GexSnapshot } from "./gex.types";
import GexGammaProfile from "./GexGammaProfile";
import GexKeyLevels from "./GexKeyLevels";

// GEX Unified Panel (approved "fully folded-in" mock). Folds the GEX chrome row,
// the header hero, the Key Levels strip, and the gamma profile into ONE bordered
// container with hairline seams and a REGIME-DRIVEN left accent (red short γ /
// green long γ from total_net_gex sign). COMPOSES the existing pieces:
//   • <GexKeyLevels integrated />        — borderless metric strip; derivation unchanged.
//   • <GexGammaProfile embedded legendMode="minimal" /> — chart unchanged; legend = Spot + Flip.
// The hero re-authors the GexHeaderProfile bindings (832f9cd), identical values.
// DEDUP (per the mock): Net GEX = hero anchor only; walls = Key Levels only (dropped
// from the profile legend); flip in the read + Key Levels; Slope/Γ live in Key Levels
// (the hero carries NO secondary stat row). CHROME: "GAMMA" is a STATIC label (no
// onClick — view switch stays in the Sidebar); search + symbol-select handlers are
// passed from page.tsx and stay wired. Every binding from 832f9cd + 82be815 preserved.

const GREEN = "#22C55E";
const RED = "#FF605D";
const NEUTRAL = "rgba(255,255,255,0.10)";

function fmtGex(v: number): string {
  const abs = Math.abs(v);
  const s = v < 0 ? "−" : "+";
  if (abs >= 1e12) return `${s}$${(abs / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `${s}$${(abs / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${s}$${(abs / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${s}$${(abs / 1e3).toFixed(0)}K`;
  return `${s}$${abs.toFixed(0)}`;
}

function Seam() {
  return <div className="h-px mx-5" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.10) 18%, rgba(255,255,255,0.10) 82%, transparent)" }} />;
}

interface GexUnifiedPanelProps {
  data: GexSnapshot | null;
  liveSpot: number | null;
  symbol: string;
  title: string;
  updatedAt: Date | null;
  symbols: string[];
  onSymbolChange: (s: string) => void;
  onSearch: () => void;
}

export default function GexUnifiedPanel({ data, liveSpot, symbol, title, updatedAt, symbols, onSymbolChange, onSearch }: GexUnifiedPanelProps) {
  const regimeColor = data ? (data.total_net_gex >= 0 ? GREEN : RED) : NEUTRAL;

  return (
    <div
      className="mx-5 mt-3 mb-2 rounded-lg border border-white/[0.06] border-l-[4px] overflow-hidden"
      style={{
        borderLeftColor: regimeColor,
        background: "linear-gradient(180deg, #0E1318 0%, #0B0F14 60%)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0 8px 24px rgba(0,0,0,0.30)",
      }}
    >
      {/* ── CHROME row (moved in from the page top app-bar) ── */}
      <div className="flex items-center px-5 py-2.5 gap-3">
        <div className="flex items-baseline gap-2 min-w-0">
          <span className="text-[14px] font-semibold text-white tracking-tight truncate">{title}</span>
          <span className="text-[9px] uppercase tracking-[0.18em] text-white/30 whitespace-nowrap">Gamma Exposure</span>
        </div>
        <div className="ml-auto flex items-center gap-1.5 flex-wrap justify-end">
          {updatedAt && (
            <span className="hidden sm:flex items-center gap-1.5 text-[10px] text-white/40 mr-1 whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
              Live · {updatedAt.toLocaleTimeString("en-US", { hour12: false, timeZone: "America/New_York" })} ET
            </span>
          )}
          {/* GAMMA — static label, no onClick (view switch stays in the Sidebar) */}
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/60 px-2.5 py-1 rounded bg-white/[0.03] border border-white/[0.08]">Gamma</span>
          <button
            onClick={onSearch}
            className="flex items-center gap-2 text-[11px] text-white/40 hover:text-white px-2.5 py-1 rounded border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] transition-colors"
            aria-label="Open search"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
            </svg>
            <span className="hidden sm:inline">to search</span>
            <kbd className="font-mono text-[9px] px-1 py-0.5 rounded bg-black/40 border border-white/[0.08]">S</kbd>
          </button>
          <select value={symbol} onChange={(e) => onSymbolChange(e.target.value)}
            className="sm:hidden bg-transparent border border-white/[0.1] text-white text-[11px] rounded px-2 py-1 font-semibold cursor-pointer focus:outline-none">
            {symbols.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {data && <Body data={data} liveSpot={liveSpot} symbol={symbol} regimeColor={regimeColor} />}
    </div>
  );
}

// hero + key levels + profile — only when data is present
function Body({ data, liveSpot, symbol, regimeColor }: { data: GexSnapshot; liveSpot: number | null; symbol: string; regimeColor: string }) {
  // --- hero bindings (identical to GexHeaderProfile @ 832f9cd) ---
  const effSpot = liveSpot ?? data.spot;          // FAST-LANE tick
  const prev = data.prev_close ?? data.spot;
  const delta = prev ? effSpot - prev : 0;
  const pct = prev ? (delta / prev) * 100 : 0;
  const changed = Math.abs(delta) >= 0.005;
  const up = delta > 0;
  const longGamma = data.total_net_gex >= 0;
  const flip = data.gamma_flip;
  const flipDist = flip != null ? effSpot - flip : null;

  return (
    <>
      <Seam />

      {/* ── HERO (price + regime read + Net GEX anchor; no secondary stats — those live in Key Levels) ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap px-5 pt-3 pb-2.5">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-baseline gap-2 whitespace-nowrap">
            <span className="text-[10px] uppercase tracking-[0.14em] text-white/40">{symbol}</span>
            <span className="text-[18px] font-mono tabular-nums font-semibold text-white/90 leading-none">${effSpot.toFixed(2)}</span>
            {liveSpot !== null && (
              <span className="inline-flex items-center gap-0.5">
                <span className="w-1 h-1 rounded-full animate-pulse" style={{ background: GREEN }} />
                <span className="text-[7px] font-bold tracking-[0.12em]" style={{ color: GREEN }}>LIVE</span>
              </span>
            )}
            {changed ? (
              <span className="text-[11px] font-semibold tabular-nums" style={{ color: up ? GREEN : RED }}>
                {up ? "▲" : "▼"} {up ? "+" : ""}{delta.toFixed(2)} · {up ? "+" : ""}{pct.toFixed(2)}%
              </span>
            ) : (
              <span className="text-[10px] font-mono tabular-nums text-white/30">unchanged</span>
            )}
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-bold tracking-[0.04em] border whitespace-nowrap"
              style={{ color: regimeColor, background: `${regimeColor}26`, borderColor: `${regimeColor}4D` }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "currentColor", boxShadow: "0 0 8px currentColor" }} />
              {longGamma ? "LONG GAMMA" : "SHORT GAMMA"}
            </span>
            <span className="text-[12px] text-white/55 tabular-nums whitespace-nowrap">
              {flipDist != null && flip != null && <>{Math.abs(flipDist).toFixed(2)} {flipDist >= 0 ? "above" : "below"} flip (${flip.toFixed(2)}) · </>}
              dealers {longGamma ? "suppress" : "amplify"}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end flex-shrink-0">
          <span className="text-[9px] uppercase tracking-[0.14em] text-white/40 whitespace-nowrap">Total Net GEX</span>
          <span className="text-[20px] font-mono tabular-nums font-bold leading-none mt-0.5" style={{ color: regimeColor }}>
            {fmtGex(data.total_net_gex)}
          </span>
        </div>
      </div>

      <Seam />
      {/* ── KEY LEVELS — relocated up; borderless integrated strip; derivation unchanged ── */}
      <GexKeyLevels data={data} liveSpot={liveSpot} integrated />

      <Seam />
      {/* ── PROFILE — chart unchanged; legend deduped to Spot + Flip (walls live in Key Levels) ── */}
      <GexGammaProfile data={data} liveSpot={liveSpot} embedded legendMode="minimal" />
    </>
  );
}
