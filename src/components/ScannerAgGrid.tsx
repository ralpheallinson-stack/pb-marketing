"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { Dispatch, RefObject, SetStateAction } from "react"
import { AgGridReact } from "ag-grid-react"
import {
  AllCommunityModule,
  ModuleRegistry,
  themeAlpine,
  type ColDef,
  type GridApi,
  type GridReadyEvent,
  type ICellRendererParams,
  type IRowNode,
  type RowClassRules,
  type SortChangedEvent,
} from "ag-grid-community"
import type { Trade } from "./SignalRow"
import { badgeClass } from "@/lib/badge-styles"
import { Button } from "@/components/ui/button-pill"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

/**
 * ScannerAgGrid — Phase 3: custom cellRenderers restore visual richness.
 *
 * Builds on Phase 2 (e5b14e6). Same 16 ColDef structure, same
 * rowClassRules, same cellClassRules. Adds 4 React cellRenderer
 * components that replace Phase 2's plain-text rendering:
 *
 *   TICK   — ticker on top + sector subtext below + focus-click
 *   EXPIRY — focus-click (sets expiry + ticker if unset)
 *   STRIKE — focus-click (sets strike + ticker if unset)
 *   CONDS  — pill-styled badges via badgeClass(tier) from
 *            @/lib/badge-styles (shared with legacy SignalRow)
 *
 * Focus setters flow through AG Grid's context prop, typed via
 * ScannerGridContext. Cleaner than per-renderer prop drilling
 * and avoids ColDef recreation on every render.
 *
 * Theming, SSE wiring, pagination, and final styling polish are
 * all deferred to later phases per
 * project_pb_scanner_ag_grid_migration_design.md §D.
 */

ModuleRegistry.registerModules([AllCommunityModule])

// ── Formatters (local copies; Phase 7 will consolidate if useful) ──
function fmtExpiry(exp: string | null | undefined): string {
  if (!exp) return "—"
  const [year, month, day] = exp.split("-")
  return year && month && day ? `${parseInt(month)}-${day}-${year}` : exp
}

function fmtTime(t: Trade, isMultiDay = false): string {
  // Single-day (/scanner live tape): show full HH:MM:SS AM/PM — seconds
  // matter for real-time tape reading. /historical single-day uses the
  // same format (no date prefix, just the time).
  const fullTime = t.time ?? t.date_time?.slice(11, 16) ?? "—"
  if (!isMultiDay || !t.timestampMs) return fullTime
  // Multi-day (/historical range): show "MMM d · HH:MM AM/PM" — seconds
  // dropped because cross-day research operates at minute-level clustering
  // (matching Cheddar/BlackBox compact multi-day views). Saves ~30px so
  // the cell fits in 145px without truncation. Builds time string from
  // ms-epoch timestampMs (not t.time, which has seconds baked in).
  const d = new Date(t.timestampMs)
  if (isNaN(d.getTime())) return fullTime
  const date = d.toLocaleDateString("en-US", {
    timeZone: "America/New_York", month: "short", day: "numeric",
  })
  const hm = d.toLocaleTimeString("en-US", {
    timeZone: "America/New_York", hour: "2-digit", minute: "2-digit", hour12: true,
  })
  return `${date} · ${hm}`
}

function fmtPrice(v: number | null | undefined): string {
  // 2026-05-18: $ prefix stripped — Price column now shows plain
  // tabular-numeric values. Prem column still carries the $ via
  // backend premium_fmt. Only caller: Price col valueFormatter.
  return v != null ? v.toFixed(2) : "—"
}

function fmtCount(v: number | null | undefined): string {
  return v != null && v > 0 ? v.toLocaleString("en-US") : "—"
}

function fmtCondsLabels(badges: Trade["badges"]): string {
  // Kept for export / accessibility / sort. cellRenderer below produces
  // the actual visual output for the grid display.
  if (!badges || badges.length === 0) return ""
  return badges.slice(0, 4).map((b) => b.label).join(" · ")
}

// ── cellRenderer context (typed) ──
interface ScannerGridContext {
  setFocusTicker: Dispatch<SetStateAction<string | null>>
  setFocusStrike: Dispatch<SetStateAction<string | null>>
  setFocusExpiry: Dispatch<SetStateAction<string | null>>
  setFilterOptType: Dispatch<SetStateAction<string>>
  setFilterSide: Dispatch<SetStateAction<string>>
  setFilterBuySell: Dispatch<SetStateAction<string>>
  setFilterType: Dispatch<SetStateAction<string>>
  isMultiDay: boolean
}

type TradeCellParams = ICellRendererParams<Trade, unknown, ScannerGridContext>

// ── Badge tier classifier (2026-05-19, Ralph spec) ──
// Numeric priority 1-4 for ordering badges left-to-right inside CONDS.
// Distinct axis from the existing Badge.tier (semantic color class).
// Stable sort preserves intra-tier order from decodeConds output.
type BadgeTier = 1 | 2 | 3 | 4
const tierOf = (text: string): BadgeTier => {
  const t = text.toUpperCase()
  // Tier 1 — conviction / size signals (always show first)
  if (/UNUSUAL\s+\d/.test(t)) return 1
  if (/ACCUM\s+\d/.test(t))   return 1
  if (/V\/OI\s+\d/.test(t))   return 1
  if (/WHALE/.test(t))         return 1
  if (/\$\d+M\+?/.test(t))    return 1
  if (/EARNINGS/.test(t))      return 1
  // Tier 2 — directional / context
  if (/^OPENING$/.test(t))     return 2
  if (/^CLOSING$/.test(t))     return 2
  if (/^MIXED$/.test(t))       return 2
  if (/DEEP\s+ITM/.test(t))    return 2
  if (/BLOCK_/.test(t))        return 2
  // Tier 3 — structure / OPRA mechanics
  if (/MULTI-LEG/.test(t))     return 3
  if (/STRADDLE/.test(t))      return 3
  if (/STRANGLE/.test(t))      return 3
  if (/AUCTION/.test(t))       return 3
  if (/^ISO$/.test(t))         return 3
  if (/^CLOSE/.test(t))        return 3
  return 4
}

// ── cellRenderers (match SignalRow.tsx legacy JSX byte-faithfully) ──

function TickCellRenderer(params: TradeCellParams) {
  const t = params.data
  if (!t) return null
  const ctx = params.context
  // Legacy semantics (SignalRow.tsx): direct setter on TICK click —
  // replaces the focused ticker AND clears strike/expiry focus.
  const onClick = () => {
    ctx.setFocusTicker(t.symbol)
    ctx.setFocusStrike(null)
    ctx.setFocusExpiry(null)
  }
  return (
    <button onClick={onClick} className="cf-tick-btn">
      <div className="cf-tick-symbol">{t.symbol}</div>
      {/* 2026-05-18: sector subtitle removed. Trade.sector still flows
          through the API for future filters/analytics; only the inline
          two-line render dropped. */}
    </button>
  )
}

function ExpiryCellRenderer(params: TradeCellParams) {
  const t = params.data
  if (!t) return null
  const ctx = params.context
  // Legacy semantics: setFocusExpiry direct, setFocusTicker functional
  // updater (only sets ticker if not already focused).
  const onClick = () => {
    ctx.setFocusExpiry(t.expiration)
    ctx.setFocusTicker((cur) => cur ?? t.symbol)
  }
  return (
    <button onClick={onClick} className="cf-focus-btn">
      {fmtExpiry(t.expiration)}
    </button>
  )
}

function StrikeCellRenderer(params: TradeCellParams) {
  const t = params.data
  if (!t) return null
  const ctx = params.context
  // Legacy semantics: setFocusStrike with RAW String(t.strike), NOT
  // strike_fmt; same functional updater on setFocusTicker as EXPIRY.
  const onClick = () => {
    ctx.setFocusStrike(String(t.strike))
    ctx.setFocusTicker((cur) => cur ?? t.symbol)
  }
  return (
    <button onClick={onClick} className="cf-focus-btn">
      {params.valueFormatted ?? t.strike_fmt ?? t.strike}
    </button>
  )
}

function renderBadgePill(b: { label: string; tier: string }, key: string | number) {
  return (
    <Button
      key={key}
      size="tiny"
      type="custom"
      shape="rounded"
      className={cn(
        badgeClass(b.tier),
        "text-[11px] font-medium uppercase tracking-[0.04em]",
        "cursor-default pointer-events-none",
      )}
    >
      {b.label}
    </Button>
  )
}

// Estimate a pill's rendered pixel width from its text. Inter at 12px
// uppercase with letter-spacing 0.04em averages ~6.5px/char; pill has
// padding: 1px 4px (8px horizontal) + 1px border on each side + 4px
// safety margin = 14px non-text. Tuned against measured widths in the
// Ralph DOM dump (5/19): "UNUSUAL 60.3x" → 99 vs measured 106 (~7%
// under); "AUCTION" → 60 vs measured 66 (~10% under). PLUS_N_RESERVE
// is bumped to 44px (vs the 36px the demo measured) to absorb that
// underestimate margin without re-introducing clipping.
const PILL_CHAR_PX = 6.5
const PILL_FIXED_PX = 14
const PILL_GAP_PX = 4
const PLUS_N_RESERVE_PX = 44
const CELL_HORIZONTAL_PADDING = 18  // .ag-cell padding-left + padding-right = 9 + 9
const estimatePillWidth = (label: string) =>
  Math.ceil(label.length * PILL_CHAR_PX) + PILL_FIXED_PX

function CondsCellRenderer(params: TradeCellParams) {
  const t = params.data
  if (!t?.badges?.length) return null
  // Tier sort (2026-05-19): stable sort by tierOf — conviction signals
  // (UNUSUAL/WHALE/EARNINGS/V-OI/ACCUM/$M) render leftmost so they stay
  // visible without horizontal scroll. Tier 4 (unknown) sinks to the
  // tail / +N popover.
  const sorted = [...t.badges].sort((a, b) => tierOf(a.label) - tierOf(b.label))

  // Width-aware truncation (2026-05-19 v2). Was: fixed slice(0, 3) which
  // missed the case where 3 wide tier-1 pills exceed the cell budget
  // (e.g. "UNUSUAL 184.1x" + "ACCUM 5x" + "$50M+" = ~270px into a
  // 204-380px cell). Now: iterate, accumulate estimated widths, stop at
  // the last pill that fits with the +N reserve also accounted for.
  // Always shows at least pill 0 (sorted by tier, so tier-1 first) even
  // if it'''s individually wider than the cell — the inner-scroll safety
  // net from 63e5568 handles that single-pill case.
  const cellWidth = (params.column?.getActualWidth?.() ?? 204) - CELL_HORIZONTAL_PADDING
  let cumWidth = 0
  let lastVisibleIdx = -1
  for (let i = 0; i < sorted.length; i++) {
    const w = estimatePillWidth(sorted[i].label)
    const gap = i > 0 ? PILL_GAP_PX : 0
    const needed = cumWidth + gap + w
    const willHaveMore = i < sorted.length - 1
    const budget = willHaveMore ? cellWidth - PILL_GAP_PX - PLUS_N_RESERVE_PX : cellWidth
    if (needed <= budget) {
      cumWidth = needed
      lastVisibleIdx = i
    } else {
      break
    }
  }
  // Floor: always show at least the first (tier-1) pill — single-pill
  // overflow falls through to the inner scrollbar from 63e5568.
  if (lastVisibleIdx === -1 && sorted.length > 0) lastVisibleIdx = 0
  const visible = sorted.slice(0, lastVisibleIdx + 1)
  const overflow = sorted.slice(lastVisibleIdx + 1)
  // Prior renderer: t.badges.slice(0, 4) — 4 flat badges, no priority.
  // Replaced with sort + 3 visible + +N popover-pill = same 4-slot
  // visual budget but the 4th slot is the overflow indicator instead
  // of an arbitrary 4th badge. Badge style choices (Button-Pill +
  // badgeClass + cursor-default) unchanged.
  return (
    <div className="cf-conds-wrap">
      {visible.map((b, i) => renderBadgePill(b, i))}
      {overflow.length > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="cf-overflow-pill"
              aria-label={`Show ${overflow.length} more badge${overflow.length === 1 ? "" : "s"}`}
              title={`+${overflow.length} more`}
            >
              +{overflow.length}
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            sideOffset={4}
            className="cf-conds-overflow-popover"
          >
            <div className="cf-conds-overflow-list">
              {overflow.map((b, i) => renderBadgePill(b, i))}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}

// Side enum → display label (mirrors valueGetter on the Side column).
const SIDE_LABEL: Record<string, string> = {
  ABOVE_ASK: "Above", AT_ASK: "Ask", AT_BID: "Bid", BELOW_BID: "Below",
}

function CPCellRenderer(params: TradeCellParams) {
  const t = params.data
  if (!t?.opt_type) return null
  const ctx = params.context
  return (
    <button onClick={() => ctx.setFilterOptType(t.opt_type)} className="cf-focus-btn">
      {t.opt_type === "C" ? "Call" : "Put"}
    </button>
  )
}

function SideCellRenderer(params: TradeCellParams) {
  const t = params.data
  if (!t) return null
  const a = t.aggression
  // Mid/NEUTRAL/MIDPOINT/null → display "Mid", non-clickable (no enum to filter on)
  if (!a || a === "NEUTRAL" || a === "MIDPOINT") return <span>Mid</span>
  const ctx = params.context
  return (
    <button onClick={() => ctx.setFilterSide(a)} className="cf-focus-btn">
      {SIDE_LABEL[a] ?? a}
    </button>
  )
}

function BSCellRenderer(params: TradeCellParams) {
  const t = params.data
  if (!t) return null
  const d = t.trade_direction
  if (!d || d === "NEUTRAL") return <span>—</span>
  const ctx = params.context
  // Verified = side came from a confirmed NBBO quote; inferred sides are softened
  // (muted, reusing cf-muted) so a confident arrow does not imply unearned certainty.
  const verified = !!t.nbbo_verifiable && (t.nbbo_side === "BUY" || t.nbbo_side === "SELL")
  return (
    <button
      onClick={() => ctx.setFilterBuySell(d)}
      className={verified ? "cf-focus-btn" : "cf-focus-btn cf-muted"}
      title={verified ? "Verified from NBBO quote" : "Inferred direction — side not confirmed by a quote"}
    >
      {d}
    </button>
  )
}

function TypeCellRenderer(params: TradeCellParams) {
  const t = params.data
  if (!t?.flow_type) return <span>—</span>
  const ctx = params.context
  return (
    <button onClick={() => ctx.setFilterType(t.flow_type)} className="cf-focus-btn">
      {t.flow_type}
    </button>
  )
}

function DaySeparatorRenderer(params: ICellRendererParams<Trade>) {
  return <div className="pb-day-separator">{params.data?.dayLabel}</div>
}

// ── Column definitions ──
const BASE_COLUMN_DEFS: ColDef<Trade>[] = [
  {
    headerName: "Time", headerTooltip: "Trade execution time (ET). Multi-day ranges prepend the date.",
    field: "time",
    // isMultiDay flag is threaded through the context (set by parent when
    // a multi-day range is picked) so the same ColDef serves both /scanner
    // (today-only, time-only) and /historical (range-aware, date-prefixed).
    valueGetter: (p) => (p.data ? fmtTime(p.data, !!(p.context as ScannerGridContext | undefined)?.isMultiDay) : "—"),
    width: 124,
    minWidth: 124,
    sortable: false,  // server pre-sorts time-DESC; resort is redundant
    cellClass: "cf-mono cf-muted",
  },
  {
    headerName: "Tick", headerTooltip: "Underlying ticker symbol. Click to filter the table to this ticker.",
    field: "symbol",
    cellRenderer: TickCellRenderer,
    width: 96,
    minWidth: 96,
    sortable: false,  // alphabetic sort during live tape is jarring
    cellClass: "cf-tick-cell",
  },
  {
    headerName: "Expiry", headerTooltip: "Option expiration date. Click to filter to this expiry.",
    field: "expiration",
    cellRenderer: ExpiryCellRenderer,
    valueFormatter: (p) => fmtExpiry(p.value),
    width: 92,
    minWidth: 92,
    sortable: false,  // multi-expiry per row makes sort comparison ambiguous
  },
  {
    headerName: "Strike", headerTooltip: "Option strike price. Click to filter to this strike.",
    field: "strike",
    cellRenderer: StrikeCellRenderer,
    valueGetter: (p) => p.data?.strike,
    valueFormatter: (p) => {
      const v = p.value
      if (v == null) return ""
      const n = typeof v === "string" ? parseFloat(v) : v
      if (isNaN(n)) return String(v)
      // 2026-05-18: $ prefix stripped per Ralph's read pass — keeps
      // thousand separators, drops the currency mark.
      return n.toLocaleString("en-US", {
        minimumFractionDigits: n % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2,
      })
    },
    width: 76,
    minWidth: 76,
    sortable: true,
    type: "rightAligned",
  },
  {
    headerName: "C/P", headerTooltip: "Call: right to buy at strike. Put: right to sell at strike.",
    colId: "cp",
    cellRenderer: CPCellRenderer,
    valueGetter: (p) => (p.data?.opt_type === "C" ? "Call" : "Put"),
    width: 64,
    minWidth: 64,
    sortable: false,  // categorical — sort meaningless
    cellClass: "cf-center cf-semibold",
    headerClass: "ag-center-aligned-header",
    cellClassRules: {
      "cf-bullish": (p) => p.data?.row_color === "bullish",
      "cf-bearish": (p) => p.data?.row_color === "bearish",
    },
  },
  {
    headerName: "Side", headerTooltip: "Fill vs midpoint: Ask/Above = aggressive buy, Bid/Below = aggressive sell, Mid = neutral.",
    field: "aggression",
    cellRenderer: SideCellRenderer,
    headerClass: "ag-center-aligned-header",
    valueGetter: (p) => {
      const a = p.data?.aggression
      if (!a || a === "NEUTRAL" || a === "MIDPOINT") return "Mid"
      const map: Record<string, string> = {
        ABOVE_ASK: "Above",
        AT_ASK: "Ask",
        AT_BID: "Bid",
        BELOW_BID: "Below",
      }
      return map[a] ?? a
    },
    width: 76,
    minWidth: 76,
    sortable: false,  // categorical — sort meaningless
    cellClass: "cf-center",
    cellClassRules: {
      "cf-bullish": (p) =>
        p.data?.aggression === "ABOVE_ASK" || p.data?.aggression === "AT_ASK",
      "cf-bearish": (p) =>
        p.data?.aggression === "BELOW_BID" || p.data?.aggression === "AT_BID",
      "cf-mid": (p) => {
        const a = p.data?.aggression
        return !a || a === "NEUTRAL" || a === "MIDPOINT"
      },
    },
  },
  {
    headerName: "B/S", headerTooltip: "Inferred direction: BUY = opening long, SELL = opening short.",
    field: "trade_direction",
    cellRenderer: BSCellRenderer,
    headerClass: "ag-center-aligned-header",
    valueGetter: (p) => {
      const d = p.data?.trade_direction
      if (!d || d === "NEUTRAL") return "—"
      return d
    },
    width: 68,
    minWidth: 68,
    sortable: false,  // categorical — sort meaningless
    cellClass: "cf-center cf-medium",
    cellClassRules: {
      "cf-bullish": (p) => p.data?.trade_direction === "BUY",
      "cf-bearish": (p) => p.data?.trade_direction === "SELL",
      "cf-muted": (p) => {
        const d = p.data?.trade_direction
        return !d || d === "NEUTRAL"
      },
    },
  },
  {
    headerName: "Spot", headerTooltip: "Underlying spot price at time of trade.",
    field: "spot_fmt",
    // 2026-05-18: spot_fmt arrives from backend pre-formatted as "$7,403.04".
    // Trade interface doesn't expose raw spot — strip the leading $ on
    // display so the column matches the no-dollar convention of Strike + Price.
    valueFormatter: (p) => (p.value as string ?? "").replace(/^\$/, ""),
    width: 104,
    minWidth: 104,
    sortable: true,
    type: "rightAligned",
    cellClass: "cf-mono",
    cellStyle: { textAlign: "right" },
  },
  {
    headerName: "Size", headerTooltip: "Number of contracts (each contract = 100 shares of underlying).",
    field: "contracts",
    valueGetter: (p) => p.data?.contracts ?? 0,
    valueFormatter: (p) => (p.value as number).toLocaleString("en-US"),
    width: 80,
    minWidth: 80,
    sortable: true,
    type: "rightAligned",
    cellClass: "cf-mono",
    cellClassRules: {
      "cf-size-big": (p) => (p.data?.contracts ?? 0) >= 1000,
    },
    cellStyle: { textAlign: "right" },
  },
  {
    headerName: "Price", headerTooltip: "Option premium per contract (entry price).",
    field: "entry_price",
    valueFormatter: (p) => fmtPrice(p.value),
    width: 80,
    minWidth: 80,
    sortable: true,
    type: "rightAligned",
    cellClass: "cf-mono",
    cellStyle: { textAlign: "right" },
  },
  {
    headerName: "Prem", headerTooltip: "Total premium: Size × Price × 100. Notional dollar size of the trade.",
    field: "premium",
    valueGetter: (p) => p.data?.premium ?? 0,
    valueFormatter: (p) => p.data?.premium_fmt ?? "—",
    width: 80,
    minWidth: 80,
    sortable: true,
    type: "rightAligned",
    cellClass: "cf-mono cf-bold",
    cellClassRules: {
      "cf-bullish": (p) => p.data?.row_color === "bullish",
      "cf-bearish": (p) => p.data?.row_color === "bearish",
    },
    cellStyle: { textAlign: "right" },
  },
  {
    headerName: "Type", headerTooltip: "Order type: BLOCK = single-venue fill. SWEEP = split across exchanges (urgency signal).",
    field: "flow_type",
    cellRenderer: TypeCellRenderer,
    headerClass: "ag-center-aligned-header",
    valueGetter: (p) => p.data?.flow_type || "—",
    width: 80,
    minWidth: 80,
    sortable: false,  // categorical — sort meaningless
    cellClass: "cf-center cf-medium",
    cellClassRules: {
      "cf-sweep": (p) => p.data?.flow_type === "SWEEP",
      "cf-block": (p) => p.data?.flow_type === "BLOCK",
      "cf-block-bold": (p) =>
        p.data?.flow_type === "BLOCK" && (p.data?.premium ?? 0) >= 1_000_000,
    },
  },
  {
    headerName: "Vol", headerTooltip: "Total contracts traded today for this option strike.",
    field: "day_volume",
    valueFormatter: (p) => fmtCount(p.value),
    width: 88,
    minWidth: 88,
    sortable: true,
    type: "rightAligned",
    cellClass: "cf-mono cf-muted",
    cellStyle: { textAlign: "right" },
  },
  {
    headerName: "OI", headerTooltip: "Open Interest: contracts outstanding (not yet closed). Vol > OI = new positioning.",
    field: "open_interest",
    valueFormatter: (p) => fmtCount(p.value),
    width: 88,
    minWidth: 88,
    sortable: true,
    type: "rightAligned",
    cellClass: "cf-mono cf-muted",
    cellStyle: { textAlign: "right" },
  },
  {
    headerName: "Conds", headerTooltip: "Conditions: WHALE = $10M+, OPENING = new position, MIXED = adjusting (open/close-ambiguous intent), V/OI = unusual volume.",
    field: "badges",
    cellRenderer: CondsCellRenderer,
    valueGetter: (p) => fmtCondsLabels(p.data?.badges),
    flex: 1,
    minWidth: 204,
    maxWidth: 380,
    sortable: false,
    // 2026-05-12: autoHeight re-enabled to let CONDS cell grow to
    // ~60px (capped via .cf-conds-wrap max-height) when 4+ badges
    // wrap to a second line. Reverses f1c4f85's single-line lock.
    // User accepted the variable-row-height tradeoff: 4+ badge rows
    // become ~70px while 1-2 badge rows stay 44px.
    //
    // TODO: implement "+N" overflow badge when CONDS row content
    // would exceed 2 wrap lines (max-height: 60px cap). Hidden 3rd-
    // line badges are clipped invisibly today — small inline pill
    // showing "+N more" preserves info density.
    //
    // Standing diagnosis: flex:1 still appears not to expand CONDS
    // into available viewport headroom at runtime (DOM-measured
    // scrollWidth tracks CONDS at minWidth not effective width).
    // With wrap re-enabled, this matters less for 4-badge clipping
    // (vertical room replaces horizontal) but a wider CONDS column
    // would still reduce wrap frequency. Candidates: sizeColumnsToFit
    // on onGridReady + resize, OR static width ~290. Track separately.
    autoHeight: true,
  },
]

const ROW_CLASS_RULES: RowClassRules<Trade> = {
  // OI tints — frontend-derived from raw fields (2026-05-15). Calibrated
  // against measured distribution: backend's vol_oi > 1 fired on ~32% of
  // rows under default subscriber filters; user target ≤10-15% yellow,
  // ≤2-3% purple. Multi gates first so single doesn't also fire on
  // multi rows (matches AG Grid evaluation order + intent: "this is
  // purple, not yellow"). Late stays backend-owned for forward compat.
  "cf-row-oi-multi": (p) =>
    (p.data?.accum_hits ?? 0) >= 2 &&
    (p.data?.vol_oi ?? 0) >= 2,
  "cf-row-oi-single": (p) => {
    if (!p.data) return false
    if ((p.data.accum_hits ?? 0) >= 2 && (p.data.vol_oi ?? 0) >= 2) return false
    const size = p.data.contracts ?? 0
    const oi = p.data.open_interest ?? Infinity
    const volOi = p.data.vol_oi ?? 0
    return size > oi * 2 || volOi >= 5
  },
  "cf-row-bull": (p) => p.data?.row_color === "bullish",
  "cf-row-bear": (p) => p.data?.row_color === "bearish",
}

interface ScannerAgGridProps {
  trades: Trade[]
  setFocusTicker: Dispatch<SetStateAction<string | null>>
  setFocusStrike: Dispatch<SetStateAction<string | null>>
  setFocusExpiry: Dispatch<SetStateAction<string | null>>
  setFilterOptType: Dispatch<SetStateAction<string>>
  setFilterSide: Dispatch<SetStateAction<string>>
  setFilterBuySell: Dispatch<SetStateAction<string>>
  setFilterType: Dispatch<SetStateAction<string>>
  // External-filter ref (2026-05-11): page.tsx owns matchesFilter
  // (the canonical client-side predicate that mirrors server-side
  // filters + adds client-only filters search/focus/grade/etc).
  // Wired to AG Grid via isExternalFilterPresent / doesExternalFilterPass
  // so client-side filter state changes apply WITHOUT a refetch —
  // page.tsx calls gridApi.onFilterChanged() to trigger re-evaluation.
  matchesFilterRef: RefObject<(t: Trade) => boolean>
  // Phase 5 (2026-05-11): page.tsx captures gridApi via this callback
  // and dispatches imperative updates (setGridOption / applyTransaction)
  // alongside its existing setTrades calls. Avoids React prop-diff
  // overhead on every SSE batch flush.
  onApiReady?: (api: GridApi<Trade>) => void
  // Phase 6 (2026-05-11): when false, sort is disabled on every column
  // regardless of per-column sortable settings. Page.tsx sets this to
  // (timeRange === "today") so sort only works when the full result set
  // is in memory. For non-Today ranges, sorting would scope to the
  // current 2K-row server page — misleading subscribers expecting a
  // multi-page sort. Phase 7 / future may revisit with a backend-driven
  // multi-page sort. See memo §C5 + §F Q3.
  enableSort: boolean
  // Density: row height in px. 35 compact / 44 comfortable.
  rowHeight?: number
  // Server-side sort (2026-05-15). AG Grid header click → onSortChanged
  // → parent threads sort+order into the feed URL; backend ORDER BY on
  // the full result set, not just the current page. null/null = unsort.
  onSortChanged?: (field: string | null, dir: "asc" | "desc" | null) => void
  // When true, Time column prepends each row's date ("May 15 · 04:30 PM")
  // and a sticky day-banner overlay tracks the topmost visible day as the
  // user scrolls. Defaults false for /scanner (today-only). /historical
  // sets this to (range.from !== range.to).
  isMultiDay?: boolean
  // Infinite-scroll trigger (2026-05-18). Fired when the user scrolls to
  // within ~200 rows of the bottom. Parent decides whether to fetch the
  // next chunk (idempotent — should no-op if already loading or no more
  // pages). Called at most once per scroll event; throttled implicitly
  // because AG Grid only fires onBodyScroll on actual scroll movement.
  onScrollNearBottom?: () => void
  // Controlled sort (2026-05-18). When parent drives sort programmatically
  // (e.g. /historical's premium-DESC default, or chip toggle), the grid's
  // internal column-state must be synced so the header chevron + active-
  // column highlight appear. Parent passes the backend field name (e.g.
  // "premium", "vol") and direction; the grid translates back to its
  // internal colId via the inverse of FIELD_TO_SORT and calls
  // applyColumnState. Two-way: AG Grid still emits onSortChanged on
  // header clicks; applyColumnState is idempotent when state matches.
  controlledSort?: { field: string | null; dir: "asc" | "desc" | null }
}

export function ScannerAgGrid({
  trades,
  setFocusTicker,
  setFocusStrike,
  setFocusExpiry,
  setFilterOptType,
  setFilterSide,
  setFilterBuySell,
  setFilterType,
  matchesFilterRef,
  onApiReady,
  enableSort,
  onSortChanged,
  rowHeight = 44,
  isMultiDay = false,
  onScrollNearBottom,
  controlledSort,
}: ScannerAgGridProps) {
  // Phase 7 (2026-05-11): custom theme tokens matching PB warm theme.
  // Tokens captured from page.tsx legacy chrome (#1C1C1E body, #252430
  // header, #48DEFF cyan accent for hover, rgba(255,255,255,0.06)
  // borders). Replaces the Phase 1 colorSchemeDarkWarm part which only
  // got us into the right ballpark — withParams() pins specific values
  // so the grid renders pixel-identical to the legacy table at every
  // common state (empty / filtered / paginated / row-tinted / badged).
  const theme = useMemo(
    () =>
      themeAlpine.withParams({
        backgroundColor: "#1C1C1E",
        foregroundColor: "rgba(255,255,255,0.95)",
        headerBackgroundColor: "#252430",
        headerTextColor: "rgba(255,255,255,0.30)",
        headerFontFamily: "var(--font-inter), system-ui, -apple-system, sans-serif",
        headerFontWeight: 500,
        headerHeight: 36,
        fontFamily: "var(--font-inter), system-ui, -apple-system, sans-serif",
        fontSize: 12,
        borderColor: "rgba(255,255,255,0.06)",
        rowHoverColor: "rgba(255,255,255,0.05)",
        oddRowBackgroundColor: "transparent",
        accentColor: "#48DEFF",
      }),
    [],
  )

  // Phase 5: capture initial rowData ONCE at mount. Subsequent trades
  // changes are NOT propagated reactively through this prop — page.tsx
  // drives all updates imperatively via gridApi (setGridOption for
  // snapshot replaces; applyTransaction for SSE incremental adds).
  // The eslint-disable is intentional: we explicitly want a stale
  // snapshot of trades captured at mount.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const initialRowData = useMemo(() => trades.filter((t) => !t.mm_suspected), [])

  // Stable context object for cellRenderer focus dispatch. setters from
  // useState are reference-stable across renders, so this memo never
  // recreates after first render.
  const context = useMemo<ScannerGridContext>(
    () => ({ setFocusTicker, setFocusStrike, setFocusExpiry, setFilterOptType, setFilterSide, setFilterBuySell, setFilterType, isMultiDay }),
    [setFocusTicker, setFocusStrike, setFocusExpiry, setFilterOptType, setFilterSide, setFilterBuySell, setFilterType, isMultiDay],
  )

  // Sticky day-banner (multi-day only). Overlay sits outside the AG Grid
  // virtualized row container — CSS position:sticky doesn't work on AG
  // Grid rows because they're absolutely positioned for virtualization.
  // Map: ordered (displayed-index, dayLabel) for every separator row.
  // Rebuilt on row-data + sort + filter changes via onModelUpdated.
  const stickyMapRef = useRef<Array<{ index: number; label: string }>>([])
  const [stickyLabel, setStickyLabel] = useState<string | null>(null)
  const gridApiRef = useRef<GridApi<Trade> | null>(null)

  const rebuildStickyMap = useCallback((api: GridApi<Trade>) => {
    const map: Array<{ index: number; label: string }> = []
    const n = api.getDisplayedRowCount()
    for (let i = 0; i < n; i++) {
      const node = api.getDisplayedRowAtIndex(i)
      const data = node?.data
      if (data?.__isDaySeparator && data.dayLabel) {
        map.push({ index: i, label: data.dayLabel })
      }
    }
    stickyMapRef.current = map
  }, [])

  const updateStickyLabel = useCallback(() => {
    if (!isMultiDay) { setStickyLabel(null); return }
    const api = gridApiRef.current
    if (!api) { setStickyLabel(null); return }
    const map = stickyMapRef.current
    if (map.length === 0) { setStickyLabel(null); return }
    const firstIdx = api.getFirstDisplayedRowIndex()
    if (firstIdx < 0) { setStickyLabel(null); return }
    // Binary-search largest separator index ≤ firstIdx.
    let lo = 0, hi = map.length - 1, best = -1
    while (lo <= hi) {
      const mid = (lo + hi) >> 1
      if (map[mid].index <= firstIdx) { best = mid; lo = mid + 1 }
      else { hi = mid - 1 }
    }
    // If the topmost visible row IS a separator, the inline banner is
    // already on-screen — skip overlay to avoid double-banner.
    if (best === -1 || map[best].index === firstIdx) { setStickyLabel(null); return }
    setStickyLabel(map[best].label)
  }, [isMultiDay])

  // Bridge AG Grid's async onGridReady into React's effect graph. The
  // controlledSort useEffect needs to re-run once gridApiRef.current is
  // populated; refs don't trigger effects so we flip this flag instead.
  const [gridReady, setGridReady] = useState(false)

  const handleGridReady = useCallback(
    (event: GridReadyEvent<Trade>) => {
      gridApiRef.current = event.api
      setGridReady(true)
      onApiReady?.(event.api)
      console.info(
        "[scanner-ag] Phase 5 grid ready —",
        initialRowData.length,
        "initial rows; subsequent updates via gridApi",
      )
    },
    [onApiReady, initialRowData.length],
  )

  // External-filter API (canonical AG Grid since v22). Always present —
  // matchesFilter is a single closure over every client + mirrored
  // server predicate; returning true for "filter present" lets AG Grid
  // evaluate doesExternalFilterPass on every row, and a row that
  // matches every predicate falls through to `return true` so it
  // renders. matchesFilterRef.current is the live closure (kept fresh
  // by page.tsx's useEffect that syncs ref → callback identity).
  const isExternalFilterPresent = useCallback(() => true, [])
  const doesExternalFilterPass = useCallback(
    (node: IRowNode<Trade>) => (node.data ? matchesFilterRef.current(node.data) : true),
    [matchesFilterRef],
  )

  // Phase 6 (2026-05-11): apply enableSort gate. When enableSort is
  // false (non-Today ranges), force sortable: false on every column —
  // overrides each ColDef's per-column setting. This is the lighter-
  // weight UX-trap mitigation per memo §C5 option (a): disable sort
  // entirely on ranges where the current server page is only a slice
  // of the full result. Phase 7 may revisit with backend multi-page
  // sort if the user wants the feature.
  const columnDefs = useMemo<ColDef<Trade>[]>(
    () => BASE_COLUMN_DEFS.map((c) => {
      let next: ColDef<Trade> = c
      // enableSort gate (Phase 6): when false, every column becomes
      // unsortable regardless of per-column setting.
      if (!enableSort) next = { ...next, sortable: false }
      // Time-col width widens on multi-day so "May 15 · 04:30 PM" (~13
      // chars) doesn't truncate to "May 15 · 04...". Single-day keeps
      // the 124px baseline (just "04:30:49 PM").
      if (isMultiDay && c.field === "time") next = { ...next, width: 170, minWidth: 155 }
      return next
    }),
    [enableSort, isMultiDay],
  )

  // AG Grid field → backend API sort name. Frontend ColDefs use
  // semantic field names; backend whitelist uses short names
  // (spot, price, vol, oi). This map is the only place they touch.
  const FIELD_TO_SORT: Record<string, string> = useMemo(() => ({
    strike: "strike",
    spot_fmt: "spot",
    contracts: "contracts",
    entry_price: "price",
    premium: "premium",
    day_volume: "vol",
    open_interest: "oi",
  }), [])

  // Inverse of FIELD_TO_SORT — backend name → AG Grid colId. Used by the
  // controlledSort sync below to translate parent-owned sort state ("vol")
  // back to the grid's colId ("day_volume") for applyColumnState.
  const SORT_TO_FIELD: Record<string, string> = useMemo(() => {
    const inverse: Record<string, string> = {}
    for (const [colId, sortName] of Object.entries(FIELD_TO_SORT)) {
      inverse[sortName] = colId
    }
    return inverse
  }, [FIELD_TO_SORT])

  // Sync parent's controlledSort to AG Grid's internal column state.
  // Without this, programmatic parent sort changes (default state on
  // mount, chip toggle, URL deep-link) update the fetch but never reach
  // the grid → header chevron never appears. Depends on gridReady so the
  // first-paint sync runs once handleGridReady has populated gridApiRef.
  // applyColumnState is a no-op when target state matches current, so
  // this also safely re-runs after AG Grid emits its own onSortChanged.
  useEffect(() => {
    if (!gridReady) return
    const api = gridApiRef.current
    if (!api || !controlledSort) return
    const colId = controlledSort.field ? SORT_TO_FIELD[controlledSort.field] : null
    const state = colId && controlledSort.dir
      ? [{ colId, sort: controlledSort.dir }]
      : []
    api.applyColumnState({ state, defaultState: { sort: null } })
  }, [controlledSort, SORT_TO_FIELD, gridReady])

  const handleSortChanged = useCallback((event: SortChangedEvent<Trade>) => {
    const active = event.api.getColumnState().find((c) => c.sort)
    if (!active || !active.colId || !active.sort) {
      onSortChanged?.(null, null)
      return
    }
    const apiName = FIELD_TO_SORT[active.colId] ?? null
    if (!apiName) {
      onSortChanged?.(null, null)
      return
    }
    onSortChanged?.(apiName, active.sort as "asc" | "desc")
  }, [onSortChanged, FIELD_TO_SORT])

  return (
    <div style={{ height: "100%", width: "100%", position: "relative" }}>
      {stickyLabel && (
        <div className="pb-day-sticky" aria-hidden="true">{stickyLabel}</div>
      )}
      <style>{`
        /* ── Phase 7 (2026-05-11): theme-param gap-fillers ──
           AG Grid's withParams() covers colors, font, dimensions. These
           rules fill the gaps that aren't exposed as theme params:
           header text-transform / letter-spacing (legacy thead used
           "uppercase tracking-[0.08em]"), row border-bottom (legacy
           used "border-b border-white/[0.04]"), and the
           tabular-numeric default. */
        /* Active sort column — brighten header text + sort icon. Theme
           sets headerTextColor to rgba(255,255,255,0.30) for low-density
           reads; without this override the sorted-column indicator
           inherits that dim color and is nearly invisible. Active-sort
           gets full opacity + the cyan accent to match the rest of the
           interactive UI. */
        .ag-header-cell-sorted-asc .ag-header-cell-text,
        .ag-header-cell-sorted-desc .ag-header-cell-text {
          color: rgba(255,255,255,0.95);
        }
        .ag-header-cell-sorted-asc .ag-sort-ascending-icon,
        .ag-header-cell-sorted-desc .ag-sort-descending-icon {
          color: #48DEFF;
          opacity: 1;
        }
        .ag-header-cell-text {
          text-transform: uppercase;
          /* Density refinement: removed letter-spacing 0.08em (= 0.96px
             at 12px font-size). Compact headers feel tabular.
             2026-05-12: dropped from 13px → 12px to match Cheddar
             density alongside body fontSize 14 → 12. If headers feel
             too cramped, revert this single line only — body can stay
             at 12. */
          font-size: 12px;
        }
        /* Custom — not built-in v35 (ag-right-aligned-header IS built-in
           but ag-center-aligned-header has no first-party definition). */
        .ag-center-aligned-header .ag-header-cell-label {
          justify-content: center;
        }
        .ag-row {
          /* Density refinement: removed border-bottom rgba(0.04). Pure
             vertical spacing rhythm separates rows (Cheddar pattern). */
          font-variant-numeric: tabular-nums;
          /* Row-motion (2026-05-18 revised). Opacity-only fade-in;
             transform + top transitions removed because rows arriving
             faster than 240ms left the slide-down stuck mid-frame
             (visible gaps + out-of-order timestamps at high signal
             rates). Rows now snap to their correct Y instantly, only
             the soft fade signals "something new arrived." */
          transition: opacity 200ms cubic-bezier(0.32, 0.72, 0, 1) !important;
        }
        @media (prefers-reduced-motion: reduce) {
          .ag-row {
            transition: none !important;
          }
        }
        /* Edit 1: cell horizontal padding 15px → 9px. Frees ~180px
           across the row. AG Grid sets cell padding inline; !important
           is required to override. */
        .ag-cell {
          padding-left: 9px !important;
          padding-right: 9px !important;
        }
        /* Edit 2: badge tightening via scoped descendant selector —
           targets badges inside CondsCellRenderer only, not legacy
           SignalRow path (which doesn't wrap in cf-conds-wrap).
           Overrides BADGE_BASE Tailwind classes from
           @/lib/badge-styles.ts (which stays untouched per single-file
           constraint). */
        .cf-conds-wrap > span {
          height: 16px;
          font-size: 12px;
          letter-spacing: normal;
          padding: 1px 4px;
          border-radius: 2px;
        }

        /* ── Phase 2 cell classes (preserved) ── */
        .cf-bullish { color: #22C55E; }
        .cf-bearish { color: #ef4444; }
        .cf-mid { color: #F59E0B; }
        .cf-muted { color: rgba(255,255,255,0.55); }
        .cf-mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-variant-numeric: tabular-nums; }
        .cf-bold { font-weight: 400; }  /* density: normalized to 400 (color carries hierarchy) */
        .cf-semibold { font-weight: 400; }  /* density: normalized to 400 */
        .cf-medium { font-weight: 400; }  /* density: normalized to 400 */
        .cf-center { text-align: center; }

        .cf-size-big { color: #48DEFF; }  /* density: dropped font-weight 600; color carries hierarchy. Matches cf-block (≥1000 contracts = meaningful size). */

        .cf-sweep { color: #F2C94C; }
        .cf-block { color: #48DEFF; }
        .cf-block-bold { color: #48DEFF; }  /* density: dropped font-weight 700; color carries hierarchy */

        /* ── Row-level OI status tints (Phase 2) ──
           border-left overrides AG Grid's row border on tinted rows. */
        .ag-row.cf-row-oi-single { background-color: rgba(234,179,8,0.20); border-left: 3px solid rgba(234,179,8,1.0); }
        .ag-row.cf-row-oi-multi  { background-color: rgba(168,85,247,0.22); border-left: 3px solid rgba(168,85,247,1.0); }

        .pb-day-separator {
          height: 32px;
          display: flex;
          align-items: center;
          padding-left: 16px;
          background-color: #16191F;
          border-top: 1px solid rgba(255,255,255,0.06);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #7A8BA8;
        }
        .pb-day-sticky {
          position: absolute;
          top: 32px;
          left: 0;
          right: 0;
          height: 32px;
          display: flex;
          align-items: center;
          padding-left: 16px;
          background-color: rgba(22,25,31,0.96);
          border-top: 1px solid rgba(255,255,255,0.06);
          border-bottom: 1px solid rgba(255,255,255,0.08);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          color: rgba(255,255,255,0.65);
          z-index: 5;
          pointer-events: none;
          backdrop-filter: blur(4px);
          font-family: Inter, system-ui, -apple-system, sans-serif;
        }
        .ag-row:has(.pb-day-separator) { background: transparent !important; }


        /* ── Phase 3 cellRenderer styling (matches SignalRow.tsx legacy) ── */
        .cf-tick-cell { padding: 0 !important; }
        .cf-tick-btn {
          display: block;
          text-align: left;
          background: none;
          border: none;
          padding: 4px 9px;
          cursor: pointer;
          width: 100%;
          height: 100%;
          line-height: 1;
        }
        .cf-tick-symbol {
          font-weight: 600;
          font-size: 15px;
          color: #ffffff;
          line-height: 1;
          transition: color 120ms ease;
        }
        .cf-tick-btn:hover .cf-tick-symbol { color: #48DEFF; }

        .cf-focus-btn {
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          color: inherit;
          font-size: 13px;
          font-weight: 400;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-variant-numeric: tabular-nums;
          transition: color 120ms ease;
        }
        .cf-focus-btn:hover { color: #48DEFF; }

        .cf-conds-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          align-content: flex-start;
          align-items: center;
          padding: 4px 0;
          /* overflow path (2026-05-19 — third revision):
             - Original (pre-dc3f9dd): overflow: hidden + flex-wrap: wrap
               with max-height: 60px clip. Variable-height rows.
             - dc3f9dd: flex-wrap: nowrap via .ag-root .cf-conds-wrap
               override (single-line pills). overflow: hidden still
               clipped trailing pills with no recovery path.
             - Now: overflow-x: auto + overflow-y: hidden. Single-line
               preserved; pills past the 184px CONDS width are reachable
               via horizontal scroll within the cell (wheel/trackpad/
               keyboard). Row height stays uniform at theme rowHeight.
               Ralph empirical: 4-pill rows need ~266px of content into
               a 184px cell — auto-scroll lets users reach AUCTION/ISO/
               MULTI-LEG without sacrificing vertical alignment. */
          overflow-x: auto;
          overflow-y: hidden;
          max-height: 60px;
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.18) transparent;
        }
        .cf-conds-wrap::-webkit-scrollbar      { height: 4px; }
        .cf-conds-wrap::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.22); border-radius: 2px; }
        .cf-conds-wrap::-webkit-scrollbar-track { background: transparent; }

        /* +N overflow pill (2026-05-19). Matches the visual weight of the
           badge pills but neutral colored — signals "more available" without
           competing with the conviction/structure tier coloring. Click opens
           a Radix Popover containing the trailing tier-3/4 badges. */
        .cf-overflow-pill {
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          height: 18px;
          padding: 1px 6px;
          background: rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.7);
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.04em;
          border-radius: 2px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          cursor: pointer;
          transition: background 120ms ease, color 120ms ease;
          font-variant-numeric: tabular-nums;
        }
        .cf-overflow-pill:hover {
          background: rgba(255, 255, 255, 0.14);
          color: rgba(255, 255, 255, 0.95);
        }
        .cf-conds-overflow-popover {
          background: #16191F !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          padding: 8px !important;
          max-width: 320px;
          z-index: 50;
        }
        .cf-conds-overflow-list {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          align-items: center;
        }

        /* ─── Alignment ship (2026-05-18 evening) ──────────────────────────
           Three rules from Ralph's empirical DOM read on the rendered grid:

           1) Tabular-nums net widened beyond .cf-mono / .cf-focus-btn — the
              existing two classes covered numeric cells, but stray descendant
              spans (e.g. inside cellRenderers, badge wrappers) inherited
              proportional digits. Universal tnum + lnum eliminates any
              digit-width drift across the whole grid surface, headers included.

           2) Categorical columns (C/P, Side, B/S, Type) flipped from
              center-aligned to left-aligned. Reason: variable-width labels
              like "Call"/"Put" and "BUY"/"SELL" anchor cleanly to a fixed
              left edge but float when centered (content x-position shifts
              row-to-row by label length / 2). Higher-specificity selectors
              override the prior .cf-center + .ag-center-aligned-header rules.
              The class names stay as-is for backward compatibility; only the
              layout flips. */

        .ag-root,
        .ag-root .ag-cell,
        .ag-root .ag-cell *,
        .ag-root .ag-header-cell,
        .ag-root .ag-header-cell * {
          font-variant-numeric: tabular-nums;
          font-feature-settings: "tnum" 1, "lnum" 1;
        }

        .ag-root .ag-cell.cf-center {
          text-align: left;
          justify-content: flex-start;
        }
        .ag-root .ag-header-cell.ag-center-aligned-header .ag-header-cell-label,
        .ag-root .ag-header-cell.ag-center-aligned-header .ag-header-cell-text {
          justify-content: flex-start;
          text-align: left;
        }

        /* 3) Every row reserves 3px on the left; only highlighted rows paint
              it. Eliminates content-shift artifact when a tint class toggles
              on/off (non-tinted rows previously had zero left border, so the
              row content jumped right by 3px when a tint appeared). Existing
              .ag-row.cf-row-oi-* rules above keep their
              shorthand border-left: 3px solid colored which paints over
              this transparent default at higher specificity. */
        .ag-root .ag-row {
          border-left: 3px solid transparent;
        }
        /* Explicit tint-color overrides (redundant with the shorthand at
           lines ~898-900 above but kept per Ralph's spec for the new
           transparent-default baseline. The existing border-left shorthand
           wins on specificity ties via source order, but border-left-color
           alone is also correct and self-documenting). */
        .ag-root .ag-row.cf-row-oi-single {
          border-left-color: rgba(234, 179, 8, 1.0);
        }
        .ag-root .ag-row.cf-row-oi-multi {
          border-left-color: rgba(168, 85, 247, 1.0);
        }

        /* Single-line badge pills + clip at right edge (2026-05-18 evening).
           Reverses the 2026-05-12 wrap-allowed design (see 30-line comment
           on .cf-conds-wrap above). Rationale: row-to-row vertical alignment
           wins over preserving 4+ badge visibility. Trailing badges past the
           cell width clip silently; future +N overflow pill is the proper
           fix per the col-def TODO. autoHeight on the Conds col remains
           true — with nowrap, AG Grid measures uniform single-line height
           per row so the variable-height behavior naturally resolves. */
        .ag-root .cf-conds-wrap {
          flex-wrap: nowrap;
        }
        .ag-root .ag-cell[col-id="badges"] {
          overflow: hidden;
        }
      `}</style>
      <AgGridReact<Trade>
        theme={theme}
        columnDefs={columnDefs}
        rowData={initialRowData}
        rowClassRules={ROW_CLASS_RULES}
        getRowId={(p) => String(p.data.id)}
        context={context}
        onGridReady={handleGridReady}
        onSortChanged={handleSortChanged}
        onModelUpdated={(e) => { rebuildStickyMap(e.api); updateStickyLabel() }}
        onBodyScroll={(e) => {
          updateStickyLabel()
          // Infinite scroll: fire onScrollNearBottom when the user is
          // within 200 displayed rows of the last row. AG Grid fires
          // onBodyScroll on every scroll tick, so parents must guard
          // against double-fetch (loadingMore + hasMore checks).
          if (onScrollNearBottom) {
            const total = e.api.getDisplayedRowCount()
            const last = e.api.getLastDisplayedRowIndex()
            if (total > 0 && total - last < 200) onScrollNearBottom()
          }
        }}
        isExternalFilterPresent={isExternalFilterPresent}
        doesExternalFilterPass={doesExternalFilterPass}
        rowHeight={rowHeight}
        getRowHeight={(p) => (p.data?.__isDaySeparator ? 32 : rowHeight)}
        isFullWidthRow={(p) => !!(p.rowNode.data as Trade | undefined)?.__isDaySeparator}
        fullWidthCellRenderer={DaySeparatorRenderer}
        pagination={false}
        // animateRows={false} (2026-05-18). AG Grid's default true emits
        // `style="transition: transform 0.4s, top 0.4s, opacity 0.2s"`
        // inline on each .ag-row, beating our opacity-only CSS even with
        // !important (inline style takes precedence over CSS !important
        // when the library also injects inline !important). At high
        // signal rates the 0.4s transform/top slide left rows visibly
        // stuck mid-frame (out-of-order timestamps, empty gaps). With
        // animation off, rows snap to position instantly and our
        // `.ag-row { transition: opacity 200ms !important }` finally
        // takes effect for the soft fade-in.
        animateRows={false}
        suppressCellFocus
        suppressHorizontalScroll={false}
        overlayNoRowsTemplate='<div style="color: rgba(255,255,255,0.45); font-size: 13px; padding: 32px; text-align: center;">No flow matches the current filters.</div>'
      />
    </div>
  )
}
