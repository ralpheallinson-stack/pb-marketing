"use client"

import { useEffect, useMemo } from "react"
import { AgGridReact } from "ag-grid-react"
import {
  AllCommunityModule,
  ModuleRegistry,
  themeAlpine,
  colorSchemeDarkWarm,
  type ColDef,
  type RowClassRules,
} from "ag-grid-community"
import type { Trade } from "./SignalRow"

/**
 * ScannerAgGrid — Phase 2: column definitions + rowData binding.
 *
 * Builds on the Phase 1 harness (cd29729): same flag gating, same
 * dynamic-import boundary, same v35 JS Theming API. Adds 16 ColDef
 * entries matching the legacy SignalRow columns, cellClassRules for
 * color encoding (matching legacy logic verbatim — NOT the Cheddar
 * redesign; that's Phase 7), and rowClassRules for the BlackBox-style
 * OI row tints (oi_single yellow, oi_multi purple, late orange).
 *
 * No custom cellRenderers yet — TICK/EXPIRY/STRIKE focus-click handlers,
 * CONDS badge pills, and the sector subtext on TICK all land in Phase 3.
 *
 * mm_suspected rows are filtered out via useMemo before reaching
 * rowData, mirroring the legacy SignalRow's per-render
 * `if (!t || t.mm_suspected) return null` skip.
 *
 * Theming uses themeAlpine + colorSchemeDarkWarm. Phase 7 will
 * replace with a custom withParams() override matching PB's warm
 * theme tokens exactly.
 */

// Register Community modules once at module load. Required in v33+;
// without this the grid logs "Module not registered" warnings.
ModuleRegistry.registerModules([AllCommunityModule])

// ── Formatters (local copies — Phase 7 will consolidate if needed) ──
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
  // Phase 2: plain comma-joined string. Phase 3 cellRenderer will
  // restore the pill-styled badges via badgeClass(tier).
  if (!badges || badges.length === 0) return ""
  return badges.slice(0, 4).map((b) => b.label).join(" · ")
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
    width: 110,
    sortable: true,
    cellClass: "cf-bold",
  },
  {
    headerName: "Expiry",
    field: "expiration",
    valueFormatter: (p) => fmtExpiry(p.value),
    width: 110,
    sortable: true,
    cellClass: "cf-mono",
  },
  {
    headerName: "Strike",
    field: "strike",
    valueGetter: (p) => p.data?.strike_fmt ?? p.data?.strike,
    width: 80,
    sortable: true,
    type: "rightAligned",
    cellClass: "cf-mono",
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
    valueGetter: (p) => fmtCondsLabels(p.data?.badges),
    flex: 1,
    minWidth: 180,
    sortable: false,
    cellClass: "cf-conds",
  },
]

const ROW_CLASS_RULES: RowClassRules<Trade> = {
  "cf-row-oi-single": (p) => p.data?.flow_highlight === "oi_single",
  "cf-row-oi-multi": (p) => p.data?.flow_highlight === "oi_multi",
  "cf-row-late": (p) => p.data?.flow_highlight === "late",
}

interface ScannerAgGridProps {
  trades: Trade[]
}

export function ScannerAgGrid({ trades }: ScannerAgGridProps) {
  const theme = useMemo(() => themeAlpine.withPart(colorSchemeDarkWarm), [])

  // mm_suspected filter — mirrors the legacy SignalRow per-render skip
  // (page.tsx :2331 `if (!t || t.mm_suspected) return null`). Done at
  // the rowData boundary so AG Grid never sees MM rows.
  const rowData = useMemo(
    () => trades.filter((t) => !t.mm_suspected),
    [trades],
  )

  useEffect(() => {
    console.info("[scanner-ag] Phase 2 grid mounted with", rowData.length, "rows")
  }, [rowData.length])

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <style>{`
        /* Phase 2 minimal cell classes. Match legacy SignalRow color logic
           verbatim; Cheddar redesign lands in Phase 7. Phase 2 keeps these
           inline in the component so the styling surface stays bounded to
           this file. */
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

        .cf-conds { color: rgba(255,255,255,0.70); font-size: 11px; }

        /* Row-level OI status tints — matches legacy getRowStyle in
           SignalRow.tsx. Phase 7 refines to scoped theme tokens. */
        .ag-row.cf-row-oi-single { background-color: rgba(234,179,8,0.12); border-left: 3px solid rgba(234,179,8,0.7); }
        .ag-row.cf-row-oi-multi  { background-color: rgba(168,85,247,0.14); border-left: 3px solid rgba(168,85,247,0.8); }
        .ag-row.cf-row-late      { background-color: rgba(251,146,60,0.10); border-left: 3px solid rgba(251,146,60,0.6); }
      `}</style>
      <AgGridReact<Trade>
        theme={theme}
        columnDefs={COLUMN_DEFS}
        rowData={rowData}
        rowClassRules={ROW_CLASS_RULES}
        getRowId={(p) => String(p.data.id)}
        suppressCellFocus
      />
    </div>
  )
}
