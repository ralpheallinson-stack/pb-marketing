"use client";
import type { GexSnapshot } from "./gex.types";

// GEX Key Levels — Mockup v6 "bridge" band. Presentational summary strip placed
// BETWEEN the gamma profile and the net-GEX heatmap (overview → key levels →
// detail). EVERY value is read from the SAME gexData the profile/header already
// consume — no new fetch, no data-layer change. Call/Put wall strikes + $GEX are
// derived client-side from data.matrix the SAME way GexGammaProfile does (bars
// argmax), so the wall levels MATCH the profile markers and heatmap row tags.
// Marker colors mirror the profile (flip purple / call green / put red) + amber ★
// for the dominant (key-spot) levels. Original PB palette; no new deps/tokens.

const FLIP = "#a78bfa";
const GREEN = "#22C55E";
const RED = "#FF605D";
const AMBER = "#fbbf24";

function fmtGex(v: number): string {
  const abs = Math.abs(v);
  const s = v < 0 ? "−" : "+";
  if (abs >= 1e12) return `${s}$${(abs / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `${s}$${(abs / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${s}$${(abs / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${s}$${(abs / 1e3).toFixed(0)}K`;
  return `${s}$${abs.toFixed(0)}`;
}

interface GexKeyLevelsProps {
  data: GexSnapshot;
  liveSpot: number | null;
  integrated?: boolean;
}

// One centered tile: label (+ optional amber ★) · value · meta. whitespace-nowrap
// so a tile never breaks mid-value; the parent flex-wrap moves WHOLE tiles to a
// second row on narrow widths (graceful reflow, no clip/scroll).
function Tile({ label, star, value, valueColor, meta, integrated }: {
  label: string; star?: boolean; value: string; valueColor?: string; meta: string; integrated?: boolean;
}) {
  return (
    <div className={integrated ? "flex flex-col items-center justify-center text-center whitespace-nowrap px-3" : "flex flex-col items-center justify-center text-center whitespace-nowrap rounded-xl border border-white/[0.06] px-5 py-3"} style={integrated ? undefined : { background: "linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0) 55%), #0B0F14" }}>
      <span className="text-[9px] uppercase tracking-[0.14em] text-white/40 inline-flex items-center gap-1">
        {star && <span style={{ color: AMBER }}>★</span>}
        {label}
      </span>
      <span className="text-[17px] font-mono tabular-nums font-bold leading-tight mt-0.5" style={{ color: valueColor ?? "#fff" }}>
        {value}
      </span>
      <span className="text-[10px] tabular-nums text-white/40 mt-0.5">{meta}</span>
    </div>
  );
}

export default function GexKeyLevels({ data, liveSpot, integrated }: GexKeyLevelsProps) {
  const effSpot = liveSpot ?? data.spot;
  const longGamma = data.total_net_gex >= 0;

  // Walls derived client-side from the matrix — SAME method as GexGammaProfile,
  // so the strip's call/put wall match the profile markers + heatmap tags.
  const strikes = [...data.strikes].sort((a, b) => a - b);
  const totalFor = (strike: number) => {
    const sk = strike === Math.floor(strike) ? String(Math.floor(strike)) : String(strike);
    const row = data.matrix[sk] || {};
    return Object.values(row).reduce((s, c) => s + c.net_gex, 0);
  };
  const bars = strikes.map((strike) => ({ strike, total: totalFor(strike) }));
  const callWall = bars.length ? [...bars].sort((a, b) => b.total - a.total)[0] : null;
  const putWall = bars.length ? [...bars].sort((a, b) => a.total - b.total)[0] : null;

  const flip = data.gamma_flip;
  const flipDist = flip != null ? effSpot - flip : null;

  return (
    <div className={integrated ? "" : "mx-5 my-2"}>
      {/* Centered cluster of boxed card-tiles. flex-wrap → whole cards reflow to a
          2nd row on narrow widths; content-sized (no fixed width), so never clips/scrolls. */}
      <div className="flex flex-wrap items-stretch justify-center gap-3">
        <Tile
          integrated={integrated}
          label="Gamma Flip"
          value={flip != null ? `$${flip.toFixed(2)}` : "N/A"}
          valueColor={FLIP}
          meta={
            flipDist != null
              ? `spot ${Math.abs(flipDist).toFixed(2)} ${flipDist >= 0 ? "above" : "below"} · ${longGamma ? "LONG" : "SHORT"} γ`
              : `${longGamma ? "LONG" : "SHORT"} γ`
          }
        />
        <Tile
          integrated={integrated}
          label="Call Wall"
          star
          value={callWall ? `$${callWall.strike}` : "N/A"}
          valueColor={GREEN}
          meta={callWall ? `${fmtGex(callWall.total)} · ${Math.abs(callWall.strike - effSpot).toFixed(0)} ${callWall.strike >= effSpot ? "above" : "below"}` : "—"}
        />
        <Tile
          integrated={integrated}
          label="Put Wall"
          star
          value={putWall ? `$${putWall.strike}` : "N/A"}
          valueColor={RED}
          meta={putWall ? `${fmtGex(putWall.total)} · ${Math.abs(putWall.strike - effSpot).toFixed(0)} ${putWall.strike >= effSpot ? "above" : "below"}` : "—"}
        />
        {integrated ? (
          <Tile
            integrated
            label="Slope / Γ"
            value={data.slope_strike != null ? `$${data.slope_strike.toFixed(2)}` : "N/A"}
            meta={`C ${fmtGex(Math.abs(data.total_call_gex))} · P ${fmtGex(-Math.abs(data.total_put_gex))}`}
          />
        ) : (
          <Tile
            label="Total Net GEX"
            value={fmtGex(data.total_net_gex)}
            valueColor={longGamma ? GREEN : RED}
            meta={`dealers ${longGamma ? "long" : "short"} γ · ${longGamma ? "suppressing" : "amplifying"}`}
          />
        )}
      </div>
    </div>
  );
}
