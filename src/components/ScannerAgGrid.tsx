"use client"

import { useEffect, useMemo } from "react"
import type { Dispatch, SetStateAction } from "react"
import { AgGridReact } from "ag-grid-react"
import {
  AllCommunityModule,
  ModuleRegistry,
  themeAlpine,
  colorSchemeDarkWarm,
  type ColDef,
  type ICellRendererParams,
  type RowClassRules,
} from "ag-grid-community"
import type { Trade } from "./SignalRow"
import { badgeClass } from "@/lib/badge-styles"

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

function fmtTime(t: Trade): string {
  return t.time ?? t.date_time?.slice(11, 16) ?? "—"
}

function fmtPrice(v: number | null | undefined): string {
  return v != null ? `$${v.toFixed(2)}` : "—"
}

function fmtCount(v: number | null | undefined): string {
  return v != null && v > 0 ? v.toLocaleString() : "—"
}

function fmtIV(v: number | null | undefined): string {
  return v == null ? "—" : `${v}%`
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
}

type TradeCellParams = ICellRendererParams<Trade, unknown, ScannerGridContext>

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
      {t.sector ? <div className="cf-tick-sector">{t.sector}</div> : null}
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
      {t.strike_fmt ?? t.strike}
    </button>
  )
}

function CondsCellRenderer(params: TradeCellParams) {
  const t = params.data
  if (!t?.badges?.length) return null
  // Match SignalRow.tsx: slice(0, 4) + badgeClass(tier). badgeClass
  // returns Tailwind classes already (bg-slate-500/60, etc.) so the
  // styling is inherited from the shared @/lib/badge-styles module.
  return (
    <div className="cf-conds-wrap">
      {t.badges.slice(0, 4).map((b, i) => (
        <span key={i} className={badgeClass(b.tier)}>
          {b.label}
        </span>
      ))}
    </div>
  )
}

// ── Column definitions ──
const COLUMN_DEFS: ColDef<Trade>[] = [
  {
    headerName: "Time",
    field: "time",
    valueGetter: (p) => (p.data ? fmtTime(p.data) : "—"),
    width: 80,
    sortable: true,
    sort: "desc",
    cellClass: "cf-mono cf-muted",
  },
  {
    headerName: "Tick",
    field: "symbol",
    cellRenderer: TickCellRenderer,
    width: 110,
    sortable: true,
    cellClass: "cf-tick-cell",
  },
  {
    headerName: "Expiry",
    field: "expiration",
    cellRenderer: ExpiryCellRenderer,
    valueFormatter: (p) => fmtExpiry(p.value),
    width: 110,
    sortable: true,
  },
  {
    headerName: "Strike",
    field: "strike",
    cellRenderer: StrikeCellRenderer,
    valueGetter: (p) => p.data?.strike_fmt ?? p.data?.strike,
    width: 80,
    sortable: true,
    type: "rightAligned",
  },
  {
    headerName: "C/P",
    valueGetter: (p) => (p.data?.opt_type === "C" ? "Call" : "Put"),
    width: 60,
    sortable: true,
    cellClass: "cf-center cf-semibold",
    cellClassRules: {
      "cf-bullish": (p) => p.data?.row_color === "bullish",
      "cf-bearish": (p) => p.data?.row_color === "bearish",
    },
  },
  {
    headerName: "Side",
    field: "aggression",
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
    width: 80,
    sortable: true,
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
    headerName: "B/S",
    field: "trade_direction",
    valueGetter: (p) => {
      const d = p.data?.trade_direction
      if (!d || d === "NEUTRAL") return "—"
      return d
    },
    width: 60,
    sortable: true,
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
    headerName: "Spot",
    field: "spot_fmt",
    width: 90,
    sortable: true,
    type: "rightAligned",
    cellClass: "cf-mono",
  },
  {
    headerName: "Size",
    field: "contracts",
    valueGetter: (p) => p.data?.contracts ?? 0,
    valueFormatter: (p) => (p.value as number).toLocaleString(),
    width: 80,
    sortable: true,
    type: "rightAligned",
    cellClass: "cf-mono",
    cellClassRules: {
      "cf-size-big": (p) => (p.data?.contracts ?? 0) >= 1000,
    },
  },
  {
    headerName: "Price",
    field: "entry_price",
    valueFormatter: (p) => fmtPrice(p.value),
    width: 80,
    sortable: true,
    type: "rightAligned",
    cellClass: "cf-mono",
  },
  {
    headerName: "Value",
    field: "premium",
    valueGetter: (p) => p.data?.premium ?? 0,
    valueFormatter: (p) => p.data?.premium_fmt ?? "—",
    width: 100,
    sortable: true,
    type: "rightAligned",
    cellClass: "cf-mono cf-bold",
    cellClassRules: {
      "cf-bullish": (p) => p.data?.row_color === "bullish",
      "cf-bearish": (p) => p.data?.row_color === "bearish",
    },
  },
  {
    headerName: "Type",
    field: "flow_type",
    valueGetter: (p) => p.data?.flow_type || "—",
    width: 90,
    sortable: true,
    cellClass: "cf-center cf-medium",
    cellClassRules: {
      "cf-sweep": (p) => p.data?.flow_type === "SWEEP",
      "cf-block": (p) => p.data?.flow_type === "BLOCK",
      "cf-block-bold": (p) =>
        p.data?.flow_type === "BLOCK" && (p.data?.premium ?? 0) >= 1_000_000,
    },
  },
  {
    headerName: "Vol",
    field: "day_volume",
    valueFormatter: (p) => fmtCount(p.value),
    width: 90,
    sortable: true,
    type: "rightAligned",
    cellClass: "cf-mono cf-muted",
  },
  {
    headerName: "OI",
    field: "open_interest",
    valueFormatter: (p) => fmtCount(p.value),
    width: 90,
    sortable: true,
    type: "rightAligned",
    cellClass: "cf-mono cf-muted",
  },
  {
    headerName: "IV",
    field: "iv",
    valueFormatter: (p) => fmtIV(p.value),
    width: 70,
    sortable: true,
    type: "rightAligned",
    cellClass: "cf-mono cf-semibold",
    cellClassRules: {
      "cf-iv-extreme": (p) => p.data?.iv != null && p.data.iv >= 100,
      "cf-iv-elevated": (p) =>
        p.data?.iv != null && p.data.iv >= 60 && p.data.iv < 100,
      "cf-iv-null": (p) => p.data?.iv == null,
    },
  },
  {
    headerName: "Conds",
    field: "badges",
    cellRenderer: CondsCellRenderer,
    valueGetter: (p) => fmtCondsLabels(p.data?.badges),
    flex: 1,
    minWidth: 180,
    sortable: false,
  },
]

const ROW_CLASS_RULES: RowClassRules<Trade> = {
  "cf-row-oi-single": (p) => p.data?.flow_highlight === "oi_single",
  "cf-row-oi-multi": (p) => p.data?.flow_highlight === "oi_multi",
  "cf-row-late": (p) => p.data?.flow_highlight === "late",
}

interface ScannerAgGridProps {
  trades: Trade[]
  setFocusTicker: Dispatch<SetStateAction<string | null>>
  setFocusStrike: Dispatch<SetStateAction<string | null>>
  setFocusExpiry: Dispatch<SetStateAction<string | null>>
}

export function ScannerAgGrid({
  trades,
  setFocusTicker,
  setFocusStrike,
  setFocusExpiry,
}: ScannerAgGridProps) {
  const theme = useMemo(() => themeAlpine.withPart(colorSchemeDarkWarm), [])

  const rowData = useMemo(
    () => trades.filter((t) => !t.mm_suspected),
    [trades],
  )

  // Stable context object for cellRenderer focus dispatch. setters from
  // useState are reference-stable across renders, so this memo never
  // recreates after first render.
  const context = useMemo<ScannerGridContext>(
    () => ({ setFocusTicker, setFocusStrike, setFocusExpiry }),
    [setFocusTicker, setFocusStrike, setFocusExpiry],
  )

  useEffect(() => {
    console.info("[scanner-ag] Phase 3 cellRenderers mounted with", rowData.length, "rows")
  }, [rowData.length])

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <style>{`
        /* Phase 2 cell classes (preserved). */
        .cf-bullish { color: #22C55E; }
        .cf-bearish { color: #FF605D; }
        .cf-mid { color: #F59E0B; }
        .cf-muted { color: rgba(255,255,255,0.55); }
        .cf-mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-variant-numeric: tabular-nums; }
        .cf-bold { font-weight: 700; }
        .cf-semibold { font-weight: 600; }
        .cf-medium { font-weight: 500; }
        .cf-center { text-align: center; }

        .cf-size-big { color: #22d3ee; font-weight: 600; }

        .cf-sweep { color: #F2C94C; }
        .cf-block { color: #48DEFF; }
        .cf-block-bold { color: #48DEFF; font-weight: 700; }

        .cf-iv-extreme  { color: #FF605D; }
        .cf-iv-elevated { color: #FFA64D; }
        .cf-iv-null     { color: rgba(255,255,255,0.30); }

        /* Row-level OI status tints (Phase 2). */
        .ag-row.cf-row-oi-single { background-color: rgba(234,179,8,0.12); border-left: 3px solid rgba(234,179,8,0.7); }
        .ag-row.cf-row-oi-multi  { background-color: rgba(168,85,247,0.14); border-left: 3px solid rgba(168,85,247,0.8); }
        .ag-row.cf-row-late      { background-color: rgba(251,146,60,0.10); border-left: 3px solid rgba(251,146,60,0.6); }

        /* Phase 3 cellRenderer styling (matches SignalRow.tsx legacy). */
        .cf-tick-cell { padding: 0; }
        .cf-tick-btn {
          display: block;
          text-align: left;
          background: none;
          border: none;
          padding: 4px 0;
          cursor: pointer;
          width: 100%;
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
        .cf-tick-sector {
          color: rgba(255,255,255,0.25);
          font-size: 10px;
          margin-top: 2px;
          line-height: 1.2;
        }

        .cf-focus-btn {
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          color: #ffffff;
          font-size: 13px;
          font-weight: 500;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-variant-numeric: tabular-nums;
          transition: color 120ms ease;
        }
        .cf-focus-btn:hover { color: #48DEFF; }

        .cf-conds-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          align-items: center;
          height: 100%;
        }
      `}</style>
      <AgGridReact<Trade>
        theme={theme}
        columnDefs={COLUMN_DEFS}
        rowData={rowData}
        rowClassRules={ROW_CLASS_RULES}
        getRowId={(p) => String(p.data.id)}
        context={context}
        suppressCellFocus
      />
    </div>
  )
}
