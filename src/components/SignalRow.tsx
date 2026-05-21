import type { Dispatch, SetStateAction } from "react"
import type React from "react"
import { badgeClass } from "@/lib/badge-styles"

/**
 * SignalRow — per-row presentation for the scanner table.
 *
 * Extracted from src/app/scanner/page.tsx 2026-05-11. Mechanical move,
 * zero visual or behavioral change. Sets up future:
 *   - Cheddar-derived color discipline pass (next commit)
 *   - Tier 3 React.memo for render-skipping on identical rows
 *
 * The Trade interface lives here because the row is the primary consumer.
 * page.tsx imports the type back from this module.
 */

export interface Trade {
  id: number
  date_time: string
  timestampMs?: number  // ms epoch from backend _sort_time; date_time is a no-year display string and unsafe for new Date()
  __isDaySeparator?: boolean
  dayLabel?: string
  symbol: string
  strike: number
  opt_type: string
  expiration: string
  premium: number
  premium_fmt: string
  contracts: number
  bullish: boolean
  spot_fmt: string
  money: string
  grade: string
  day_volume: number
  open_interest: number
  iv: number | null
  iv_rank?: number | null
  symbol_iv_today?: number | null
  iv_history_days?: number | null
  ruoa_streak?: number | null
  flow_type: string
  sector: string
  accum_hits: number
  position_action: string
  mm_suspected: boolean
  conviction_strength: string | null
  accum_premium?: number
  outcome?: string
  pnl_percent?: number
  direction?: string
  high_conviction?: boolean
  // Fields present in full response but stripped in slim mode
  time?: string
  strike_fmt?: string
  dte?: number
  strategy?: string
  vol_oi?: number
  contract_volume_multiple?: number | null
  baseline_volume?: number | null
  today_volume?: number | null
  delta?: number | null
  whale?: boolean
  aggression?: string | null
  structure?: string | null
  structure_confidence?: number | null
  trade_direction?: string | null
  is_event_driven?: boolean
  adv_multiple?: number | null
  badges?: { label: string; tier: string }[]
  row_color?: 'bullish' | 'bearish'
  flow_highlight?: 'oi_multi' | 'oi_single' | 'late' | null
  entry_price?: number | null
}

function getRowStyle(t: Trade): React.CSSProperties {
  // BlackBox-style OI highlights from backend
  if (t.flow_highlight === 'oi_multi') return { backgroundColor: "rgba(168,85,247,0.14)", borderLeft: "3px solid rgba(168,85,247,0.8)" }
  if (t.flow_highlight === 'oi_single') return { backgroundColor: "rgba(234,179,8,0.12)", borderLeft: "3px solid rgba(234,179,8,0.7)" }
  if (t.flow_highlight === 'late') return { backgroundColor: "rgba(251,146,60,0.10)", borderLeft: "3px solid rgba(251,146,60,0.6)" }
  return {}
}

function fmtExpiry(exp: string) {
  if (!exp) return '—'
  const [year, month, day] = exp.split('-')
  return year && month && day ? `${parseInt(month)}-${day}-${year}` : exp
}

function aggrColor(a: string | null | undefined) {
  // Industry-standard 5-bucket aggression: ABOVE/ASK aggressive buy (green),
  // BID/BELOW aggressive sell (red), MIDPOINT neutral (amber — no directional info).
  if (a === "ABOVE_ASK" || a === "AT_ASK") return "text-[#22C55E]"
  if (a === "BELOW_BID" || a === "AT_BID") return "text-[#ef4444]"
  if (!a || a === "NEUTRAL" || a === "MIDPOINT") return "text-[#F59E0B]"   // MIDPOINT (industry standard) — backend (queries.py:962-964) emits literal "MIDPOINT"
  return "text-white/90"
}

function aggrLabel(a: string | null | undefined) {
  // NULL/NEUTRAL/MIDPOINT all map to "Mid" — backend (queries.py:962-964) emits the
  // literal "MIDPOINT" string when bid_at_trade and ask_at_trade are present;
  // null/NEUTRAL paths preserved for defensive handling of older feed shapes.
  if (!a || a === "NEUTRAL" || a === "MIDPOINT") return "Mid"
  const map: Record<string, string> = { ABOVE_ASK: "Above", AT_ASK: "Ask", AT_BID: "Bid", BELOW_BID: "Below" }
  return map[a] || a
}

function bsColor(d: string | null | undefined) {
  if (!d || d === "NEUTRAL") return "text-white/30"
  if (d === "BUY") return "text-[#22C55E]"
  if (d === "SELL") return "text-[#ef4444]"
  return "text-white/90"
}

function bsLabel(d: string | null | undefined) {
  if (!d || d === "NEUTRAL") return "—"
  return d
}

interface SignalRowProps {
  trade: Trade
  dataIndex: number
  measureRef: (node: Element | null) => void
  setFocusTicker: Dispatch<SetStateAction<string | null>>
  setFocusStrike: Dispatch<SetStateAction<string | null>>
  setFocusExpiry: Dispatch<SetStateAction<string | null>>
}

export function SignalRow({ trade: t, dataIndex, measureRef, setFocusTicker, setFocusStrike, setFocusExpiry }: SignalRowProps) {
  const rowStyle = getRowStyle(t)
  return (
    <tr
      data-index={dataIndex}
      ref={measureRef}
      className={`border-b border-white/[0.04] ${rowStyle.backgroundColor ? '' : 'hover:bg-white/[0.05]'}`}
      style={rowStyle}
    >
      <td className="px-3 py-2 text-white/50 text-[13px] font-medium font-mono whitespace-nowrap">{t.time ?? t.date_time?.slice(11, 16) ?? "—"}</td>
      <td className="px-2 py-2">
        <button onClick={() => { setFocusTicker(t.symbol); setFocusStrike(null); setFocusExpiry(null) }}
          className="text-left group">
          <div className="font-semibold text-[15px] text-white leading-none group-hover:text-[#48DEFF] transition-colors">{t.symbol}</div>
          {t.sector && <div className="text-white/25 text-[10px] mt-0.5">{t.sector}</div>}
        </button>
      </td>
      <td className="px-2 py-2">
        <button onClick={() => { setFocusExpiry(t.expiration); setFocusTicker(cur => cur ?? t.symbol) }}
          className="text-white hover:text-[#48DEFF] transition-colors text-[13px] font-medium font-mono">
          {fmtExpiry(t.expiration)}
        </button>
      </td>
      <td className="px-2 py-2 text-right">
        <button onClick={() => { setFocusStrike(String(t.strike)); setFocusTicker(cur => cur ?? t.symbol) }}
          className="text-white hover:text-[#48DEFF] transition-colors text-[13px] font-medium font-mono">
          {t.strike_fmt ?? t.strike}
        </button>
      </td>
      <td className="px-2 py-2 text-center text-[12px] font-semibold" style={{ color: t.row_color === 'bullish' ? '#22C55E' : '#ef4444' }}>
        {t.opt_type === "C" ? "Call" : "Put"}
      </td>
      <td className={`px-2 py-2 text-center text-[12px] ${aggrColor(t.aggression)}`}>
        {aggrLabel(t.aggression)}
      </td>
      <td className={`px-2 py-2 text-center text-[12px] font-medium ${bsColor(t.trade_direction)}`}>
        {bsLabel(t.trade_direction)}
      </td>
      <td className="px-2 py-2 text-right text-white text-[13px] font-medium font-mono">{t.spot_fmt}</td>
      <td className={`px-2 py-2 text-right text-[13px] font-medium font-mono ${(t.contracts ?? 0) >= 1000 ? "text-[#22d3ee] font-semibold" : "text-white"}`}>{(t.contracts ?? 0).toLocaleString("en-US")}</td>
      <td className="px-2 py-2 text-right text-white/90 text-[13px] font-medium font-mono">{t.entry_price ? `$${t.entry_price.toFixed(2)}` : "—"}</td>
      <td className="px-2 py-2 text-right text-[12px] font-bold" style={{ color: t.row_color === 'bullish' ? '#22C55E' : '#ef4444' }}>
        {t.premium_fmt}
      </td>
      <td className={`px-2 py-2 text-center text-[12px] font-medium ${
        t.flow_type === "SWEEP" ? "text-[#F2C94C]" : t.flow_type === "BLOCK" ? "text-[#48DEFF]" + (t.premium >= 1000000 ? " font-bold" : "") : "text-white/90"
      }`}>
        {t.flow_type || "—"}
      </td>
      <td className="px-2 py-2 text-right text-[13px] font-medium font-mono text-white/80">
        {(t.day_volume ?? 0) > 0 ? t.day_volume.toLocaleString("en-US") : "—"}
      </td>
      <td className="px-2 py-2 text-right text-white/80 text-[13px] font-medium font-mono">
        {(t.open_interest ?? 0) > 0 ? t.open_interest.toLocaleString("en-US") : "—"}
      </td>
      <td className="px-2 py-2 text-right text-[13px] font-semibold font-mono"
          style={{
            // Per-contract implied volatility (matches every broker).
            // Color hints elevated vs normal vol, but absolute thresholds
            // are loose because IV scales with DTE and moneyness.
            color: t.iv == null ? "rgba(255,255,255,0.3)"
                   : t.iv >= 100 ? "#ef4444"          // red — extremely elevated
                   : t.iv >= 60  ? "#FFA64D"          // amber — elevated
                   : "rgba(255,255,255,0.7)",         // normal — neutral
          }}
          title={t.iv == null ? "IV unavailable"
                 : `Implied volatility ${t.iv}% — per-contract IV at trade time`
                 + (t.iv_rank != null ? ` · ticker IV Rank ${t.iv_rank}` : "")}>
        {t.iv == null ? "—" : `${t.iv}%`}
      </td>
      <td className="px-2 py-2">
        <div className="flex flex-wrap gap-1">
          {t.badges?.slice(0, 4).map((b, i) => (
            <span key={i} className={badgeClass(b.tier)}>{b.label}</span>
          ))}
        </div>
      </td>
    </tr>
  )
}
