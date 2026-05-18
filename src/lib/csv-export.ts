/**
 * csv-export.ts — shared CSV serializer for /scanner + /historical.
 *
 * Manual blob+download because AG Grid Community 35.x doesn't ship
 * api.exportDataAsCsv() (Enterprise-only). Single helper avoids drift
 * between the two pages.
 *
 * Tier policy (2026-05-18 round 1):
 *  - Free tier (no tier or "premium"): capped at 1000 rows.
 *  - Pro tiers (pro_bundle / beta / lifetime / heatmap): unlimited.
 *  - Field set is conservative — only columns that already render in
 *    the visible grid. Greeks (delta/gamma/theta/vega/iv) + mm_suspected
 *    + conviction_strength + adv_multiple intentionally NOT exported
 *    regardless of tier; matches /api/public/live-flow's field-strip
 *    posture for sensitive internal signal data.
 *  - Real backend enforcement (rate-limit, server-side cap) is a
 *    separate concern. This client-side cap is the polite-default
 *    that pairs with the existing trial banner / upgrade modal flow.
 */

import type { Trade } from "@/components/SignalRow"

const FREE_TIERS = new Set(["premium", "trial", ""])
const FREE_ROW_CAP = 1000

export function isProTier(tier: string | null | undefined): boolean {
  if (!tier) return false
  return !FREE_TIERS.has(tier)
}

/**
 * Build an ET-zoned filename stamp: pb-flow-YYYY-MM-DD-HHmmET.csv
 * Uses en-CA for ISO date format + en-US for 24h time, both with
 * timeZone: America/New_York so the stamp reflects market time
 * regardless of user locale.
 */
export function csvFilename(prefix: string, now: Date = new Date()): string {
  const datePart = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).format(now)
  const timePart = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour12: false, hour: "2-digit", minute: "2-digit",
  }).format(now).replace(":", "")
  return `${prefix}-${datePart}-${timePart}ET.csv`
}

function escape(v: unknown): string {
  if (v == null) return ""
  const s = String(v)
  // RFC 4180: quote fields containing comma, double-quote, or newline.
  // Double internal quotes per spec.
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

interface ExportColumn {
  header: string
  get: (t: Trade) => unknown
}

// The export column set. Kept in sync with the visible grid columns
// at ScannerAgGrid.tsx (BASE_COLUMN_DEFS). Conds renders the badge
// labels joined by " · " (matches the grid's fmtCondsLabels).
const EXPORT_COLUMNS: ExportColumn[] = [
  { header: "Time",       get: (t) => t.time ?? "" },
  { header: "DateTime",   get: (t) => t.timestampMs ? new Date(t.timestampMs).toISOString() : "" },
  { header: "Symbol",     get: (t) => t.symbol ?? "" },
  { header: "Sector",     get: (t) => t.sector ?? "" },
  { header: "Expiration", get: (t) => t.expiration ?? "" },
  { header: "Strike",     get: (t) => t.strike ?? "" },
  { header: "C/P",        get: (t) => t.opt_type ?? "" },
  { header: "Side",       get: (t) => t.aggression ?? "" },
  { header: "B/S",        get: (t) => t.trade_direction ?? "" },
  { header: "Spot",       get: (t) => t.spot_fmt ?? "" },
  { header: "Size",       get: (t) => t.contracts ?? "" },
  { header: "Price",      get: (t) => t.entry_price ?? "" },
  { header: "Premium",    get: (t) => t.premium ?? "" },
  { header: "Type",       get: (t) => t.flow_type ?? "" },
  { header: "Volume",     get: (t) => t.day_volume ?? "" },
  { header: "OpenInterest", get: (t) => t.open_interest ?? "" },
  { header: "DTE",        get: (t) => t.dte ?? "" },
  { header: "VolOI",      get: (t) => t.vol_oi ?? "" },
  { header: "Grade",      get: (t) => t.grade ?? "" },
  { header: "Conds",      get: (t) => (t.badges ?? []).map(b => b.label).join(" · ") },
]

interface ExportOptions {
  /** Filename prefix, e.g. "pb-flow" or "pb-historical". */
  filenamePrefix: string
  /** User tier from /api/me — controls row cap. */
  tier: string | null | undefined
}

export interface ExportResult {
  exported: number
  total: number
  capped: boolean
  filename: string
}

/**
 * Serialize trades to CSV + trigger browser download.
 * Returns a summary the caller can surface (e.g. toast "Exported N of M").
 * Throws on the browser side only if URL.createObjectURL is unavailable
 * (extremely old browsers); callers should wrap in try/catch if they want
 * to surface to the user.
 */
export function exportTradesToCsv(trades: Trade[], opts: ExportOptions): ExportResult {
  const isPro = isProTier(opts.tier)
  const total = trades.length
  const capped = !isPro && total > FREE_ROW_CAP
  const slice = capped ? trades.slice(0, FREE_ROW_CAP) : trades

  const lines: string[] = [
    EXPORT_COLUMNS.map(c => escape(c.header)).join(","),
    ...slice.map(t => EXPORT_COLUMNS.map(c => escape(c.get(t))).join(",")),
  ]
  // RFC 4180: CRLF line endings.
  const csv = lines.join("\r\n")
  // BOM so Excel renders UTF-8 correctly.
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" })

  const url = URL.createObjectURL(blob)
  const filename = csvFilename(opts.filenamePrefix)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  // Defer revoke a tick so Firefox completes the download dispatch.
  setTimeout(() => URL.revokeObjectURL(url), 100)

  return { exported: slice.length, total, capped, filename }
}
