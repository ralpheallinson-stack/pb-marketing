"use client"

import { useCallback, useEffect, useMemo } from "react"
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

function fmtTime(t: Trade): string {
  return t.time ?? t.date_time?.slice(11, 16) ?? "—"
}

function fmtPrice(v: number | null | undefined): string {
  return v != null ? `$${v.toFixed(2)}` : "—"
}

function fmtCount(v: number | null | undefined): string {
  return v != null && v > 0 ? v.toLocaleString() : "—"
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
  // Option 3 hybrid (2026-05-11): Button-Pill type="custom" emits no color
  // classes; badgeClass(tier) from @/lib/badge-styles supplies the 11
  // semantic tier colors (warning amber, iv_high red, iv_low cyan,
  // directional emerald, ruoa violet, ruoa_heavy bright violet, iso cyan,
  // cross fuchsia, rapid teal, plus unified slate for the 10 neutral
  // tiers). cursor-default + pointer-events-none neutralize Button's
  // hover/focus interactivity for badge use.
  return (
    <div className="cf-conds-wrap">
      {t.badges.slice(0, 4).map((b, i) => (
        <Button
          key={i}
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
      ))}
    </div>
  )
}

// ── Column definitions ──
const BASE_COLUMN_DEFS: ColDef<Trade>[] = [
  {
    headerName: "Time",
    field: "time",
    valueGetter: (p) => (p.data ? fmtTime(p.data) : "—"),
    width: 128,
    minWidth: 128,
    sortable: false,  // server pre-sorts time-DESC; resort is redundant
    cellClass: "cf-mono cf-muted",
  },
  {
    headerName: "Tick",
    field: "symbol",
    cellRenderer: TickCellRenderer,
    width: 116,
    minWidth: 116,
    sortable: false,  // alphabetic sort during live tape is jarring
    cellClass: "cf-tick-cell",
  },
  {
    headerName: "Expiry",
    field: "expiration",
    cellRenderer: ExpiryCellRenderer,
    valueFormatter: (p) => fmtExpiry(p.value),
    width: 118,
    minWidth: 118,
    sortable: false,  // multi-expiry per row makes sort comparison ambiguous
  },
  {
    headerName: "Strike",
    field: "strike",
    cellRenderer: StrikeCellRenderer,
    valueGetter: (p) => p.data?.strike_fmt ?? p.data?.strike,
    width: 95,
    minWidth: 95,
    sortable: true,
    type: "rightAligned",
  },
  {
    headerName: "C/P",
    valueGetter: (p) => (p.data?.opt_type === "C" ? "Call" : "Put"),
    width: 63,
    minWidth: 63,
    sortable: false,  // categorical — sort meaningless
    cellClass: "cf-center cf-semibold",
    headerClass: "ag-center-aligned-header",
    cellClassRules: {
      "cf-bullish": (p) => p.data?.row_color === "bullish",
      "cf-bearish": (p) => p.data?.row_color === "bearish",
    },
  },
  {
    headerName: "Side",
    field: "aggression",
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
    width: 75,
    minWidth: 75,
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
    headerName: "B/S",
    field: "trade_direction",
    headerClass: "ag-center-aligned-header",
    valueGetter: (p) => {
      const d = p.data?.trade_direction
      if (!d || d === "NEUTRAL") return "—"
      return d
    },
    width: 69,
    minWidth: 69,
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
    headerName: "Spot",
    field: "spot_fmt",
    width: 110,
    minWidth: 110,
    sortable: true,
    type: "rightAligned",
    cellClass: "cf-mono",
    cellStyle: { textAlign: "right" },
  },
  {
    headerName: "Size",
    field: "contracts",
    valueGetter: (p) => p.data?.contracts ?? 0,
    valueFormatter: (p) => (p.value as number).toLocaleString(),
    width: 82,
    minWidth: 82,
    sortable: true,
    type: "rightAligned",
    cellClass: "cf-mono",
    cellClassRules: {
      "cf-size-big": (p) => (p.data?.contracts ?? 0) >= 1000,
    },
    cellStyle: { textAlign: "right" },
  },
  {
    headerName: "Price",
    field: "entry_price",
    valueFormatter: (p) => fmtPrice(p.value),
    width: 100,
    minWidth: 100,
    sortable: true,
    type: "rightAligned",
    cellClass: "cf-mono",
    cellStyle: { textAlign: "right" },
  },
  {
    headerName: "Prem",
    field: "premium",
    valueGetter: (p) => p.data?.premium ?? 0,
    valueFormatter: (p) => p.data?.premium_fmt ?? "—",
    width: 100,
    minWidth: 100,
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
    headerName: "Type",
    field: "flow_type",
    headerClass: "ag-center-aligned-header",
    valueGetter: (p) => p.data?.flow_type || "—",
    width: 100,
    minWidth: 100,
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
    headerName: "Vol",
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
    headerName: "OI",
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
    headerName: "Conds",
    field: "badges",
    cellRenderer: CondsCellRenderer,
    valueGetter: (p) => fmtCondsLabels(p.data?.badges),
    flex: 1,
    minWidth: 175,
    maxWidth: 320,
    sortable: false,
    // Row height stays uniform at theme rowHeight (44px) regardless of
    // CONDS content. Prior autoHeight: true (7a5ecee) let wrapping
    // badges stretch individual rows to ~66-72px while neighbors
    // stayed 44px — visual chaos on streaming flow tape. Combined
    // with .cf-conds-wrap { flex-wrap: nowrap; overflow: hidden }
    // below, badges render single-line, any horizontal overflow
    // clips, every row locks to 44px. Adding future badge tiers
    // (EARNINGS_PROX, etc.) can no longer break row uniformity.
    autoHeight: false,
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
}

export function ScannerAgGrid({
  trades,
  setFocusTicker,
  setFocusStrike,
  setFocusExpiry,
  matchesFilterRef,
  onApiReady,
  enableSort,
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
        rowHeight: 44,
        fontFamily: "var(--font-inter), system-ui, -apple-system, sans-serif",
        fontSize: 14,
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
    () => ({ setFocusTicker, setFocusStrike, setFocusExpiry }),
    [setFocusTicker, setFocusStrike, setFocusExpiry],
  )

  const handleGridReady = useCallback(
    (event: GridReadyEvent<Trade>) => {
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
    () =>
      enableSort
        ? BASE_COLUMN_DEFS
        : BASE_COLUMN_DEFS.map((c) => ({ ...c, sortable: false })),
    [enableSort],
  )

  const handleSortChanged = useCallback((event: SortChangedEvent<Trade>) => {
    const active = event.api.getColumnState().filter((c) => c.sort)
    console.info("[scanner-ag] sort changed:", active)
  }, [])

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <style>{`
        /* ── Phase 7 (2026-05-11): theme-param gap-fillers ──
           AG Grid's withParams() covers colors, font, dimensions. These
           rules fill the gaps that aren't exposed as theme params:
           header text-transform / letter-spacing (legacy thead used
           "uppercase tracking-[0.08em]"), row border-bottom (legacy
           used "border-b border-white/[0.04]"), and the
           tabular-numeric default. */
        .ag-header-cell-text {
          text-transform: uppercase;
          /* Density refinement: removed letter-spacing 0.08em (= 0.96px
             at 12px font-size). Compact headers feel tabular. */
          font-size: 13px;
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
        .cf-bearish { color: #FF605D; }
        .cf-mid { color: #F59E0B; }
        .cf-muted { color: rgba(255,255,255,0.55); }
        .cf-mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-variant-numeric: tabular-nums; }
        .cf-bold { font-weight: 400; }  /* density: normalized to 400 (color carries hierarchy) */
        .cf-semibold { font-weight: 400; }  /* density: normalized to 400 */
        .cf-medium { font-weight: 400; }  /* density: normalized to 400 */
        .cf-center { text-align: center; }

        .cf-size-big { color: #22d3ee; }  /* density: dropped font-weight 600; color carries hierarchy */

        .cf-sweep { color: #F2C94C; }
        .cf-block { color: #48DEFF; }
        .cf-block-bold { color: #48DEFF; }  /* density: dropped font-weight 700; color carries hierarchy */

        /* ── Row-level OI status tints (Phase 2) ──
           border-left overrides AG Grid's row border on tinted rows. */
        .ag-row.cf-row-oi-single { background-color: rgba(234,179,8,0.12); border-left: 3px solid rgba(234,179,8,0.7); }
        .ag-row.cf-row-oi-multi  { background-color: rgba(168,85,247,0.14); border-left: 3px solid rgba(168,85,247,0.8); }
        .ag-row.cf-row-late      { background-color: rgba(251,146,60,0.10); border-left: 3px solid rgba(251,146,60,0.6); }

        /* ── Phase 3 cellRenderer styling (matches SignalRow.tsx legacy) ── */
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
          font-weight: 400;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-variant-numeric: tabular-nums;
          transition: color 120ms ease;
        }
        .cf-focus-btn:hover { color: #48DEFF; }

        .cf-conds-wrap {
          display: flex;
          flex-wrap: nowrap;
          gap: 4px;
          align-items: center;
          padding: 4px 0;
          overflow: hidden;
          /* Single-line render. Pairs with autoHeight: false on the
             CONDS ColDef so row height is theme-driven (44px), not
             content-driven. Horizontal overflow clips — acceptable
             tradeoff; CONDS column already has minWidth 175 + flex 1
             which gives ~175-320px, room for 2-3 typical badges. */
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
        isExternalFilterPresent={isExternalFilterPresent}
        doesExternalFilterPass={doesExternalFilterPass}
        pagination={false}
        suppressCellFocus
        suppressHorizontalScroll={false}
      />
    </div>
  )
}
