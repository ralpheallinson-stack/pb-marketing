"use client";
import type { GexSnapshot } from "./gex.types";
import GexGammaProfile from "./GexGammaProfile";

// GEX Header + Profile — combined v6 card (approved combined mockup). Merges the
// former GexHeroCard (header stats) and GexGammaProfile (per-strike chart) into ONE
// bordered card with a REGIME-DRIVEN left accent: RED when short γ (total_net_gex < 0),
// GREEN when long γ (>= 0) — replaces the old static cyan. The profile is COMPOSED via
// <GexGammaProfile embedded /> — its chart/data/marker logic is UNCHANGED, only its
// outer card chrome is dropped. Every data binding from BOTH source components is
// preserved (see notes). Original PB palette; no new deps/tokens.

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

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center gap-2 whitespace-nowrap">
      <span className="text-[9px] uppercase tracking-[0.14em] text-white/40">{label}</span>
      <span className="text-[12px] font-mono tabular-nums font-semibold" style={{ color: color ?? "#fff" }}>{value}</span>
    </div>
  );
}

interface GexHeaderProfileProps {
  data: GexSnapshot;
  liveSpot: number | null;
  symbol: string;
}

export default function GexHeaderProfile({ data, liveSpot, symbol }: GexHeaderProfileProps) {
  // --- header bindings (identical to the former GexHeroCard) ---
  const effSpot = liveSpot ?? data.spot;            // FAST-LANE tick (liveSpot) → fallback data.spot
  const prev = data.prev_close ?? data.spot;
  const delta = prev ? effSpot - prev : 0;
  const pct = prev ? (delta / prev) * 100 : 0;
  const changed = Math.abs(delta) >= 0.005;
  const up = delta > 0;

  const longGamma = data.total_net_gex >= 0;        // regime from net_gex sign
  const flip = data.gamma_flip;
  const flipDist = flip != null ? effSpot - flip : null;
  const regimeColor = longGamma ? GREEN : RED;      // ← REGIME-DRIVEN accent + Net GEX color

  return (
    <div
      className="mx-5 mt-3 mb-2 rounded-lg border border-white/[0.06] border-l-[4px] overflow-hidden"
      style={{
        borderLeftColor: regimeColor,                                       // red short-γ / green long-γ
        background: "linear-gradient(180deg, #0E1318 0%, #0B0F14 60%)",      // depth, not flat
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0 8px 24px rgba(0,0,0,0.30)",
      }}
    >
      {/* ── TOP zone: refined header stats ── */}
      <div className="px-5 pt-3 pb-2.5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4 flex-wrap">
            {/* price (quiet) + LIVE pulse + % change */}
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

            {/* regime AS HERO: badge + plain-language read */}
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

          {/* Total Net GEX — anchored right */}
          <div className="flex flex-col items-end flex-shrink-0">
            <span className="text-[9px] uppercase tracking-[0.14em] text-white/40 whitespace-nowrap">Total Net GEX</span>
            <span className="text-[20px] font-mono tabular-nums font-bold leading-none mt-0.5" style={{ color: regimeColor }}>
              {fmtGex(data.total_net_gex)}
            </span>
          </div>
        </div>

        {/* quiet secondary stats — preserves slope_strike / total_call_gex / total_put_gex bindings */}
        <div className="flex items-center gap-x-7 gap-y-1 flex-wrap mt-2">
          <Stat label="Slope Strike" value={data.slope_strike != null ? `$${data.slope_strike.toFixed(2)}` : "N/A"} />
          <Stat label="Call γ" value={fmtGex(Math.abs(data.total_call_gex))} color={GREEN} />
          <Stat label="Put γ" value={fmtGex(-Math.abs(data.total_put_gex))} color={RED} />
        </div>
      </div>

      {/* ── hairline SEAM (fades at edges) ── */}
      <div className="h-px mx-5" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.10) 18%, rgba(255,255,255,0.10) 82%, transparent)" }} />

      {/* ── BOTTOM zone: the gamma profile, COMPOSED — chart/markers/axis/legend unchanged ── */}
      <GexGammaProfile data={data} liveSpot={liveSpot} embedded />
    </div>
  );
}
