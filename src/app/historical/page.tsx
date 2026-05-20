"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { format, parseISO, isValid, isSameDay } from "date-fns"
import type { DateRange } from "react-day-picker"
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react"

import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"

import { ScannerSidebar } from "@/components/scanner-sidebar"
import { AccountMenu } from "@/components/AccountMenu"
import { ScannerAgGrid } from "@/components/ScannerAgGrid"
import { StatsPanel, type Stats } from "@/components/scanner/StatsPanel"
import { FiltersDialog } from "@/components/scanner/FiltersDialog"
import type { Trade } from "@/components/SignalRow"
import { rowsToTrades, injectDaySeparators, type FeedAgg } from "@/lib/feed-decoder"
import { DashboardSkeleton, ScannerSkeleton } from "@/components/scanner/SkeletonViews"
import { exportTradesToCsv } from "@/lib/csv-export"

// Most recent trading day at-or-before the given anchor (default: today).
// Starts from anchor - 1, then rolls back through Sat (6) / Sun (0).
// Holiday-list NOT applied — relies on the backend last-session fallback
// + the fallback banner for the picked-a-holiday edge case.
function mostRecentTradingDay(from: Date = new Date()): Date {
  const d = new Date(from)
  d.setDate(d.getDate() - 1)
  while (d.getDay() === 0 || d.getDay() === 6) {
    d.setDate(d.getDate() - 1)
  }
  return d
}

const MIN_DATE = new Date("2024-01-01")

// Renderable label for the picker button + footer. Single-day shows the
// full weekday; multi-day collapses to "MMM d – MMM d, yyyy" (or w/ year
// suffix when the range spans different years).
function formatRangeLabel(r: { from: Date; to: Date }): string {
  if (isSameDay(r.from, r.to)) {
    return format(r.from, "EEEE, MMM d, yyyy")
  }
  const sameYear = r.from.getFullYear() === r.to.getFullYear()
  const left = sameYear ? format(r.from, "MMM d") : format(r.from, "MMM d, yyyy")
  const right = format(r.to, "MMM d, yyyy")
  return `${left} – ${right}`
}

export default function HistoricalPage() {
  return (
    <React.Suspense fallback={<div className="h-screen w-screen flex items-center justify-center text-zinc-500 text-sm" style={{ background: "#0E1117" }}>Loading…</div>}>
      <HistoricalPageInner />
    </React.Suspense>
  )
}

function HistoricalPageInner() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Range state — URL-driven via ?from=&to= deep-link. Default = most-recent
  // trading day for both (single-day view). Both endpoints always set; the
  // single-day case is just from === to.
  const initialRange = React.useMemo<{ from: Date; to: Date }>(() => {
    const fromUrl = searchParams.get("from")
    const toUrl = searchParams.get("to")
    let f: Date | null = null
    let t: Date | null = null
    if (fromUrl) {
      const p = parseISO(fromUrl)
      if (isValid(p)) f = p
    }
    if (toUrl) {
      const p = parseISO(toUrl)
      if (isValid(p)) t = p
    }
    if (f && t) return { from: f, to: t }
    if (f) return { from: f, to: f }
    if (t) return { from: t, to: t }
    const def = mostRecentTradingDay()
    return { from: def, to: def }
  }, [searchParams])
  const [range, setRange] = React.useState<{ from: Date; to: Date }>(initialRange)

  // URL sync — keep ?from=&to= in sync with state
  React.useEffect(() => {
    const fStr = format(range.from, "yyyy-MM-dd")
    const tStr = format(range.to, "yyyy-MM-dd")
    if (searchParams.get("from") !== fStr || searchParams.get("to") !== tStr) {
      router.replace(`/historical?from=${fStr}&to=${tStr}`, { scroll: false })
    }
  }, [range, router, searchParams])

  // Two-click range sequencer (replaces the prior partial-range library
  // path which committed an unintended single-day range on first click).
  // calendarOpen drives the Popover; pendingFrom is the in-progress
  // "from" between the two clicks (null = not mid-selection).
  //
  // Lifecycle:
  //   - First click on day X → setPendingFrom(X); calendar stays open
  //   - Second click on day Y → commit ordered range; close calendar
  //   - Popover onOpenChange(false) mid-selection → discard pendingFrom,
  //     leave committed range untouched
  const [calendarOpen, setCalendarOpen] = React.useState(false)
  const [pendingFrom, setPendingFrom] = React.useState<Date | null>(null)

  // rdp v10 OnSelectHandler signature: (selected, triggerDate, modifiers, e)
  // — second arg is the user's clicked date. We ignore rdp's auto-built
  // `selected` because the library's range logic doesn't match the
  // two-click-commit semantics we want.
  const handleRangeSelect = React.useCallback(
    (_selected: DateRange | undefined, triggerDate: Date) => {
      if (!triggerDate) return
      if (pendingFrom === null) {
        // First click — start new selection. Calendar stays open; URL/fetch
        // unchanged until the second click commits.
        setPendingFrom(triggerDate)
        return
      }
      // Second click — commit ordered range, close picker. The existing
      // useEffect on `range` handles URL sync + fetch.
      const newRange = triggerDate >= pendingFrom
        ? { from: pendingFrom, to: triggerDate }
        : { from: triggerDate, to: pendingFrom }
      setRange(newRange)
      setPendingFrom(null)
      setCalendarOpen(false)
    },
    [pendingFrom],
  )

  // Fetch state
  const [trades, setTrades] = React.useState<Trade[]>([])
  const [loading, setLoading] = React.useState(false)
  const [fetchError, setFetchError] = React.useState<string | null>(null)
  // Retry nonce — incrementing it re-fires the fetch effect without
  // changing range/sort/page. Powers the error-state Retry button.
  const [retryNonce, setRetryNonce] = React.useState(0)
  // Phase A pagination (2026-05-18). Explicit Prev/Next paged nav at 500
  // rows/page replaces the prior infinite-scroll. Reasoning: subscribers
  // need to find the biggest/most-unusual trades, not flip through 200K
  // rows chronologically. Default sort = premium DESC surfaces the
  // institutional flow on row 1; user can re-sort by clicking any column
  // header (Vol / Strike / Time / etc). 500/page = sub-200ms paint and a
  // navigable Page N of M counter instead of unbounded scroll.
  const PAGE_SIZE = 500
  const [page, setPage] = React.useState(0)
  // Sort defaults: premium DESC (biggest trade first). User-driven sort
  // overrides via ScannerAgGrid onSortChanged → setSortField/setSortDir
  // + setPage(0). null sortField means "use backend default" (created_at
  // DESC) — never reached on first paint thanks to the "premium" default.
  const [sortField, setSortField] = React.useState<string | null>("premium")
  const [sortDir, setSortDir] = React.useState<"asc" | "desc" | null>("desc")
  const [serverTotal, setServerTotal] = React.useState<number | null>(null)
  // feedAgg (Bug 1b, 2026-05-19): the server's full-day agg block. The
  // dashboard MUST source from this, not from client sums over the loaded
  // page — /historical only fetches the current page (page_size=500), so
  // client sums show page totals (e.g. 500) instead of the day total
  // (e.g. 13,252). Backend 4290fa6 made the agg block full-day-correct
  // in historical mode; this wires the UI to actually read it.
  const [feedAgg, setFeedAgg] = React.useState<FeedAgg | null>(null)
  // Fallback transparency: when the user picks a date with no data and the
  // range collapses to a single day, backend falls back to the most-recent-
  // session-with-data and reports it via meta.served_date. Banner surfaces
  // the swap. Multi-day ranges suppress the banner — empty days inside a
  // range are expected and don't trigger fallback at the backend.
  const [servedDate, setServedDate] = React.useState<string | null>(null)

  // Filter state (mirrors scanner/page.tsx for FiltersDialog reuse)
  const [filterOptType, setFilterOptType] = React.useState("")
  const [filterType, setFilterType] = React.useState("")
  const [filterExcludeMultiLeg, setFilterExcludeMultiLeg] = React.useState(false)
  const [filterMinPremium, setFilterMinPremium] = React.useState("")
  const [filterDte, setFilterDte] = React.useState("")
  const [filterMinContracts, setFilterMinContracts] = React.useState(0)
  const [filterMinVolOi, setFilterMinVolOi] = React.useState(0)
  const [filterCuratedOnly, setFilterCuratedOnly] = React.useState(false)
  const [filterUnusualOnly, setFilterUnusualOnly] = React.useState(false)
  const [filterNoIndex, setFilterNoIndex] = React.useState(false)
  const [filterExcludeMidpoint, setFilterExcludeMidpoint] = React.useState(false)
  // Ticker focus — set via TICK cellRenderer click in ScannerAgGrid. Search
  // chip not surfaced on /historical v1 (no search input wired); kept as
  // empty state so matchesFilter can still uniformly apply.
  const [focusTicker, setFocusTicker] = React.useState<string | null>(null)
  const [search] = React.useState("")

  const [showFilters, setShowFilters] = React.useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = React.useState(false)
  // ScannerSidebar requires activePage prop even when not on /scanner;
  // value is ignored on /historical (route detection takes precedence).
  const [activePage, setActivePage] = React.useState<"scanner" | "heatmap" | "watchlist">("scanner")
  const [soundEnabled, setSoundEnabled] = React.useState(true)
  const toggleSound = React.useCallback(() => setSoundEnabled(s => !s), [])
  const [marketOpen] = React.useState(false)  // historical = no live status
  const canAccessGamma = true

  // userTier (2026-05-18) — drives CSV export row cap. Free → 1000.
  const [userTier, setUserTier] = React.useState<string | null>(null)
  React.useEffect(() => {
    fetch("/api/me").then(r => r.ok ? r.json() : null).then(d => {
      if (d) setUserTier(d.tier ?? null)
    }).catch(() => {})
  }, [])

  const isSingleDay = isSameDay(range.from, range.to)

  // Fetch the current page on any [range, page, sortField, sortDir] change.
  // Single-effect approach replaces the prior infinite-scroll initial+more
  // pair; trades is always the current page's content, not an accumulating
  // buffer. setPage(0) on range/sort change keeps the user at the start of
  // the new view (handled by the resetting useEffects below).
  React.useEffect(() => {
    const fStr = format(range.from, "yyyy-MM-dd")
    const tStr = format(range.to, "yyyy-MM-dd")
    setLoading(true)
    setFetchError(null)
    const params = new URLSearchParams()
    params.set("unified", "1")
    params.set("date_from", fStr)
    params.set("date_to", tStr)
    params.set("grades", "A,B,PASS")
    params.set("page_size", String(PAGE_SIZE))
    params.set("page", String(page))
    if (sortField && sortDir) {
      params.set("sort", sortField)
      params.set("order", sortDir)
    }
    fetch(`/api/scanner/feed?${params.toString()}`, { credentials: "include" })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(d => {
        const cols: string[] = d?.meta?.columns ?? []
        const rows = d?.rows ?? []
        const ts = cols.length ? rowsToTrades(rows, cols) : []
        setTrades(ts)
        setServedDate(d?.meta?.served_date ?? null)
        setServerTotal(d?.meta?.total ?? null)
        setFeedAgg(d?.agg ?? null)
        setLoading(false)
      })
      .catch(err => {
        setFetchError(err.message)
        setTrades([])
        setFeedAgg(null)
        setLoading(false)
      })
  }, [range, page, sortField, sortDir, retryNonce])

  // Reset to page 0 when range or sort changes — keeps the user from
  // landing on "page 47 of a freshly-sorted view." Filter-change pagination
  // reset isn't needed because client-side filters don't refetch.
  React.useEffect(() => { setPage(0) }, [range, sortField, sortDir])

  // Sort handler — wired to ScannerAgGrid's onSortChanged. AG Grid passes
  // (backend field name, direction) where field is already translated via
  // FIELD_TO_SORT inside the grid. null/null = un-sort (falls back to
  // backend default created_at DESC).
  const handleSortChanged = React.useCallback((field: string | null, dir: "asc" | "desc" | null) => {
    setSortField(field)
    setSortDir(dir)
  }, [])

  // Toggle the current sort direction from the visible chip (chip-click
  // alternative to a second header-click). No-op when sort is the
  // backend-default null state.
  const toggleSortDir = React.useCallback(() => {
    if (!sortField || !sortDir) return
    setSortDir(sortDir === "desc" ? "asc" : "desc")
  }, [sortField, sortDir])

  // Backend field name → human-readable label for the sort chip.
  // Mirrors the keys of queries.py _SCANNER_SORT_COLUMNS (premium,
  // contracts, strike, vol, oi, spot, price, time).
  const SORT_LABELS: Record<string, string> = {
    premium: "Premium",
    contracts: "Contracts",
    strike: "Strike",
    vol: "Volume",
    oi: "Open Interest",
    spot: "Spot",
    price: "Entry Price",
    time: "Time",
  }

  // Client-side filter predicate
  const matchesFilter = React.useCallback((t: Trade) => {
    if (focusTicker && t.symbol !== focusTicker) return false
    if (search && !t.symbol.toLowerCase().includes(search.toLowerCase())) return false
    if (filterType && t.flow_type !== filterType) return false
    if (filterOptType && t.opt_type !== filterOptType) return false
    if (filterUnusualOnly && (t.contract_volume_multiple ?? 0) < 1.5) return false
    if (filterNoIndex && ["SPX", "SPXW", "NDXP", "NDX", "RUT", "RUTW"].includes(t.symbol)) return false
    if (filterDte === "0dte" && (t.dte ?? -1) !== 0) return false
    if (filterDte === "1-7" && !((t.dte ?? -1) >= 1 && (t.dte ?? -1) <= 7)) return false
    if (filterDte === "8-30" && !((t.dte ?? -1) >= 8 && (t.dte ?? -1) <= 30)) return false
    if (filterDte === "30+" && (t.dte ?? -1) < 30) return false
    if (filterMinContracts > 0 && (t.contracts ?? 0) < filterMinContracts) return false
    if (filterMinVolOi > 0 && ((t.vol_oi ?? 0) * 10) < filterMinVolOi) return false
    if (filterMinPremium !== "" && (t.premium ?? 0) < parseInt(filterMinPremium, 10)) return false
    if (filterCuratedOnly && t.grade !== "A" && t.grade !== "B") return false
    if (filterExcludeMidpoint && (t.aggression == null || t.aggression === "MIDPOINT" || t.aggression === "NEUTRAL")) return false
    if (filterExcludeMultiLeg && t.structure && t.structure !== "SINGLE_LEG") return false
    return true
  }, [focusTicker, search, filterType, filterOptType, filterUnusualOnly, filterNoIndex, filterDte, filterMinContracts, filterMinVolOi, filterMinPremium, filterCuratedOnly, filterExcludeMidpoint, filterExcludeMultiLeg])
  const matchesFilterRef = React.useRef(matchesFilter)
  React.useEffect(() => { matchesFilterRef.current = matchesFilter }, [matchesFilter])

  const filtered = React.useMemo(() => trades.filter(matchesFilter), [trades, matchesFilter])

  // Day-separator injection rules:
  //   - single-day: never (only one day, banner is dead weight)
  //   - multi-day + sorted by time (or unsorted): inject (rows are grouped
  //     by day so banners cleanly mark each session boundary)
  //   - multi-day + sorted by premium/contracts/etc: skip (sort scrambles
  //     date grouping → banners would interleave randomly and read as noise)
  // The Time-cell date prefix from isMultiDay still carries the date on
  // every row, so users never lose date context regardless of sort.
  const groupedByDay = sortField == null || sortField === "time"
  const rowsForGrid = React.useMemo(() => {
    const live = filtered.filter(t => !t.mm_suspected)
    return (isSingleDay || !groupedByDay) ? live : injectDaySeparators(live)
  }, [filtered, isSingleDay, groupedByDay])

  // Stats — computed locally from filtered
  const stats: Stats = React.useMemo(() => {
    let cv = 0, pv = 0, bullVol = 0, bearVol = 0
    for (const t of filtered) {
      const q = t.contracts || 0
      if (t.opt_type === "C") cv += q
      else if (t.opt_type === "P") pv += q
      if (t.bullish) bullVol += q
      else bearVol += q
    }
    const total = bullVol + bearVol
    const score = total > 0 ? bullVol / total : 0.5
    return {
      count: filtered.length,
      bull: bullVol,
      bear: bearVol,
      lean: score >= 0.65 ? "BULL" : score <= 0.35 ? "BEAR" : "MIXED",
      pc_ratio: cv > 0 ? +(pv / cv).toFixed(2) : 0,
    }
  }, [filtered])

  let callPrem = 0, putPrem = 0, calls = 0, puts = 0
  for (const t of filtered) {
    if (t.opt_type === "C") { calls++; callPrem += t.premium }
    else if (t.opt_type === "P") { puts++; putPrem += t.premium }
  }

  // Dashboard sources from the server agg block (full-day) when present,
  // falling back to the client page-sums only if the response lacked an
  // agg (shouldn't happen post-4290fa6 — historical always returns one).
  // Maps FeedAgg → StatsPanel props: sentiment._sort_score (0-100) drives
  // the bull/bear gauge; label maps to the BULL/BEAR/MIXED lean the panel
  // checks; _sort_premium (cents) → dollars for call/put flow.
  const aggScore = feedAgg?.sentiment?._sort_score ?? 50
  const dashStats: Stats = feedAgg ? {
    count: (feedAgg.call_flow?.count ?? 0) + (feedAgg.put_flow?.count ?? 0),
    bull: aggScore,
    bear: 100 - aggScore,
    lean: feedAgg.sentiment?.label === "Bullish" ? "BULL"
        : feedAgg.sentiment?.label === "Bearish" ? "BEAR" : "MIXED",
    pc_ratio: feedAgg.pcr ?? 0,
  } : stats
  const dashCallPrem = feedAgg ? (feedAgg.call_flow?._sort_premium ?? 0) / 100 : callPrem
  const dashPutPrem = feedAgg ? (feedAgg.put_flow?._sort_premium ?? 0) / 100 : putPrem
  const dashCalls = feedAgg ? (feedAgg.call_flow?.count ?? 0) : calls
  const dashPuts = feedAgg ? (feedAgg.put_flow?.count ?? 0) : puts

  // activeFilterCount mirrors page.tsx semantics
  let activeFilterCount = 0
  if (filterType) activeFilterCount++
  if (filterOptType) activeFilterCount++
  if (filterMinPremium !== "") activeFilterCount++
  if (filterMinContracts > 0) activeFilterCount++
  if (filterMinVolOi > 0) activeFilterCount++
  if (filterDte) activeFilterCount++
  if (filterUnusualOnly) activeFilterCount++
  if (filterNoIndex) activeFilterCount++
  if (filterCuratedOnly) activeFilterCount++
  if (filterExcludeMidpoint) activeFilterCount++
  if (filterExcludeMultiLeg) activeFilterCount++

  const resetFilters = React.useCallback(() => {
    setFilterType(""); setFilterOptType(""); setFilterDte("")
    setFilterUnusualOnly(false); setFilterNoIndex(false); setFilterCuratedOnly(false)
    setFilterExcludeMidpoint(false); setFilterExcludeMultiLeg(false)
    setFilterMinPremium(""); setFilterMinContracts(0); setFilterMinVolOi(0)
  }, [])

  const today = React.useMemo(() => {
    const t = new Date()
    t.setHours(23, 59, 59, 999)
    return t
  }, [])

  // AG Grid imperative wiring — minimal for /historical (no SSE)
  const gridApiRef = React.useRef<unknown>(null)
  const handleAgGridApiReady = React.useCallback((api: unknown) => {
    gridApiRef.current = api
    if (api && typeof (api as { setGridOption?: (k: string, v: unknown) => void }).setGridOption === "function") {
      (api as { setGridOption: (k: string, v: unknown) => void }).setGridOption("rowData", rowsForGrid)
    }
  }, [rowsForGrid])
  React.useEffect(() => {
    const api = gridApiRef.current as { setGridOption?: (k: string, v: unknown) => void } | null
    if (api?.setGridOption) {
      api.setGridOption("rowData", rowsForGrid)
    }
  }, [rowsForGrid])

  const rangeLabel = formatRangeLabel(range)

  return (
    <div className="h-screen flex text-[#E8EDF5] overflow-hidden" style={{ background: "#0E1117", fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}>
      <ScannerSidebar
        activePage={activePage}
        setActivePage={setActivePage}
        canAccessGamma={canAccessGamma}
        setShowUpgradeModal={setShowUpgradeModal}
        setShowFilters={setShowFilters}
        activeFilterCount={activeFilterCount}
        marketOpen={marketOpen}
        soundEnabled={soundEnabled}
        toggleSound={toggleSound}
        accountMenu={
          <AccountMenu buttonClassName="group relative flex h-10 w-10 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-zinc-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
          </AccountMenu>
        }
      />

      <div className="ml-16 flex flex-1 flex-col h-screen overflow-hidden gap-2 p-2">
        {/* HEADER card with date-range picker + Filters trigger */}
        <header className="h-14 border border-white/[0.06] rounded-lg flex items-center justify-between px-4 flex-shrink-0" style={{ background: "#16191F" }}>
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-semibold text-zinc-200">Historical Flow</h1>

            <Popover
              open={calendarOpen}
              onOpenChange={(open) => {
                setCalendarOpen(open)
                // Mid-selection close (Esc, click-outside) discards the
                // pending "from" and reverts to the committed range.
                if (!open) setPendingFrom(null)
              }}
            >
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent border-white/[0.08] hover:bg-white/[0.04] text-zinc-200">
                  <CalendarIcon className="w-4 h-4 opacity-70" />
                  <span>{rangeLabel}</span>
                  <ChevronDown className="w-4 h-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 border-white/[0.08]" style={{ background: "#16191F" }} align="start">
                <Calendar
                  mode="range"
                  numberOfMonths={2}
                  // During selection (pendingFrom set): highlight just the
                  // pending day. Otherwise: show the committed range as
                  // background so the user sees what they're about to
                  // replace.
                  selected={pendingFrom ? { from: pendingFrom, to: pendingFrom } : { from: range.from, to: range.to }}
                  onSelect={handleRangeSelect}
                  disabled={(d) => d > today || d < MIN_DATE}
                  captionLayout="dropdown"
                  startMonth={MIN_DATE}
                  endMonth={today}
                  classNames={{
                    dropdowns: "flex gap-2",
                    months_dropdown: "bg-[#16191F] text-zinc-200 border border-white/[0.08] rounded-md px-2 py-1 text-sm hover:bg-white/[0.04] focus:outline-none focus:ring-1 focus:ring-cyan-400/30",
                    years_dropdown: "bg-[#16191F] text-zinc-200 border border-white/[0.08] rounded-md px-2 py-1 text-sm hover:bg-white/[0.04] focus:outline-none focus:ring-1 focus:ring-cyan-400/30",
                    range_start: "bg-white/[0.16] text-white rounded-l-md",
                    range_end: "bg-white/[0.16] text-white rounded-r-md",
                    range_middle: "bg-white/[0.06] text-zinc-200 rounded-none",
                  }}
                  autoFocus
                />
                {pendingFrom && (
                  <div className="px-4 py-2.5 text-xs text-zinc-400 border-t border-white/[0.08]">
                    From <span className="text-zinc-200 font-medium">{format(pendingFrom, "MMM d, yyyy")}</span> — click end date
                  </div>
                )}
              </PopoverContent>
            </Popover>

          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              disabled={filtered.length === 0}
              onClick={() => exportTradesToCsv(filtered, { filenamePrefix: "pb-historical", tier: userTier })}
              title={`Export ${filtered.length} trades to CSV`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-60"><path strokeLinecap="round" strokeLinejoin="round" d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
              <span>Export</span>
            </Button>
            <FiltersDialog
              open={showFilters}
              onOpenChange={setShowFilters}
              trigger={
                <Button variant="outline" size="sm" className="gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-60"><path strokeLinecap="round" d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/></svg>
                  <span>Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">{activeFilterCount}</span>
                  )}
                </Button>
              }
              filterOptType={filterOptType}
              setFilterOptType={setFilterOptType}
              filterType={filterType}
              setFilterType={setFilterType}
              filterExcludeMultiLeg={filterExcludeMultiLeg}
              setFilterExcludeMultiLeg={setFilterExcludeMultiLeg}
              filterMinPremium={filterMinPremium}
              setFilterMinPremium={setFilterMinPremium}
              filterDte={filterDte}
              setFilterDte={setFilterDte}
              filterMinContracts={filterMinContracts}
              setFilterMinContracts={setFilterMinContracts}
              filterMinVolOi={filterMinVolOi}
              setFilterMinVolOi={setFilterMinVolOi}
              filterCuratedOnly={filterCuratedOnly}
              setFilterCuratedOnly={setFilterCuratedOnly}
              filterUnusualOnly={filterUnusualOnly}
              setFilterUnusualOnly={setFilterUnusualOnly}
              filterNoIndex={filterNoIndex}
              setFilterNoIndex={setFilterNoIndex}
              filterExcludeMidpoint={filterExcludeMidpoint}
              setFilterExcludeMidpoint={setFilterExcludeMidpoint}
              activeFilterCount={activeFilterCount}
              resetFilters={resetFilters}
            />
          </div>
        </header>

        {/* Skeleton during any load (including date-picker changes — the
            one case where re-flashing the skeleton is correct UX since
            the user explicitly requested different data). */}
        {loading ? (
          <DashboardSkeleton />
        ) : (
        <StatsPanel
          displayStats={dashStats}
          callPrem={dashCallPrem}
          putPrem={dashPutPrem}
          calls={dashCalls}
          puts={dashPuts}
        />
        )}

        {(sortField && sortDir) || focusTicker ? (
          <div className="flex items-center gap-3 px-4 py-2 border border-white/[0.06] rounded-lg text-xs" style={{ background: "#16191F" }}>
            {sortField && sortDir && (
              <div className="flex items-center gap-2">
                <span className="text-zinc-500">Sorted by:</span>
                <button
                  type="button"
                  onClick={toggleSortDir}
                  className="inline-flex items-center gap-1.5 rounded-md bg-white/[0.06] px-2 py-1 font-semibold text-white hover:bg-white/[0.08] transition-colors"
                  aria-label={`Toggle sort direction (currently ${sortDir})`}
                  title="Click to toggle ASC / DESC"
                >
                  <span>{SORT_LABELS[sortField] ?? sortField}</span>
                  {sortDir === "desc" ? (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M19 12l-7 7-7-7"/></svg>
                  ) : (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5M5 12l7-7 7 7"/></svg>
                  )}
                </button>
              </div>
            )}
            {focusTicker && (
              <div className="flex items-center gap-2">
                <span className="text-zinc-500">Filtering by ticker:</span>
                <button
                  type="button"
                  onClick={() => setFocusTicker(null)}
                  className="inline-flex items-center gap-1.5 rounded-md bg-white/[0.06] px-2 py-1 font-semibold text-white hover:bg-white/[0.08] transition-colors"
                  aria-label={`Clear ${focusTicker} filter`}
                >
                  <span>{focusTicker}</span>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path strokeLinecap="round" d="M6 6l12 12M6 18L18 6"/></svg>
                </button>
              </div>
            )}
            <span className="text-zinc-500 ml-auto hidden md:inline">Click any column header to re-sort.</span>
          </div>
        ) : null}

        {(() => {
          // Banner only on single-day requests — backend fallback only fires
          // for ?date_from===?date_to (single-day request with no data).
          if (!isSingleDay) return null
          const reqStr = format(range.from, "yyyy-MM-dd")
          if (!servedDate || servedDate === reqStr) return null
          // Parse the served date as a UTC midnight + reformat for display.
          // (parseISO of a date-only string lands on local midnight which
          // can cross day boundaries in non-UTC zones; using component-wise
          // construction avoids that.)
          const [y, m, d] = servedDate.split("-").map(Number)
          const servedDateObj = new Date(y, (m ?? 1) - 1, d ?? 1)
          return (
            <div className="flex items-center justify-between px-4 py-2.5 border border-amber-500/30 rounded-lg text-[13px]" style={{ background: "rgba(245, 158, 11, 0.08)" }}>
              <span className="text-amber-200">
                No trades recorded for <span className="font-semibold">{format(range.from, "EEEE, MMM d")}</span>. Showing nearest session: <span className="font-semibold">{format(servedDateObj, "EEEE, MMM d, yyyy")}</span>.
              </span>
              <button
                type="button"
                onClick={() => setRange({ from: servedDateObj, to: servedDateObj })}
                className="text-amber-300 hover:text-amber-100 underline underline-offset-4 decoration-amber-500/40 hover:decoration-amber-300 transition-colors whitespace-nowrap"
              >
                Update picker →
              </button>
            </div>
          )
        })()}

        <div className="flex flex-1 flex-col overflow-hidden border border-white/[0.06] rounded-lg" style={{ background: "#16191F" }}>
          {loading ? (
            <ScannerSkeleton rowCount={15} />
          ) : fetchError ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-sm px-6 text-center">
              <div className="text-zinc-300 text-[15px] font-medium">Couldn&apos;t load flow for {rangeLabel}.</div>
              <div className="text-zinc-500 text-[13px]">Try again or pick a different date.</div>
              <div className="flex items-center gap-3 mt-1">
                <button
                  type="button"
                  onClick={() => setRetryNonce(n => n + 1)}
                  className="px-3 py-1.5 rounded-md bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 hover:bg-cyan-500/25 transition-colors text-[13px] font-medium"
                >
                  Retry
                </button>
                <Link href="/historical" className="text-zinc-400 hover:text-zinc-200 underline underline-offset-4 text-[13px]">Reset</Link>
              </div>
              <div className="text-zinc-600 text-[11px] mt-1 font-mono">{fetchError}</div>
            </div>
          ) : trades.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-sm text-zinc-500">
              No trades recorded for {rangeLabel}.
            </div>
          ) : (
            <ScannerAgGrid
              trades={rowsForGrid}
              setFocusTicker={setFocusTicker}
              setFocusStrike={() => {}}
              setFocusExpiry={() => {}}
              setFilterOptType={setFilterOptType}
              setFilterSide={() => {}}
              setFilterBuySell={() => {}}
              setFilterType={setFilterType}
              matchesFilterRef={matchesFilterRef}
              onApiReady={handleAgGridApiReady as never}
              enableSort={true}
              isMultiDay={!isSingleDay}
              onSortChanged={handleSortChanged}
              controlledSort={{ field: sortField, dir: sortDir }}
            />
          )}

          {/* Footer — hidden when single-page result. See /scanner for
              rationale: degenerate counts + disabled pagination = clutter.
              Disclaimer below the table card stays visible regardless. */}
          {/* Footer — controls-only (2026-05-18). Status text dropped
              per /scanner parity: range label, trade count, and
              "Page N of M" label all removed. Just Prev/Next buttons
              + loading indicator. Disclaimer below stays visible. */}
          {serverTotal != null && serverTotal > PAGE_SIZE && (
          <div className="flex items-center justify-end px-4 py-2 text-[11px] text-zinc-500 tabular-nums border-t border-white/[0.06]">
            <div className="flex items-center gap-3">
              {serverTotal != null && serverTotal > PAGE_SIZE && (() => {
                const totalPages = Math.max(1, Math.ceil(serverTotal / PAGE_SIZE))
                const atFirst = page === 0
                const atLast = page + 1 >= totalPages
                return (
                  <>
                    <button
                      type="button"
                      disabled={atFirst || loading}
                      onClick={() => setPage(p => Math.max(0, p - 1))}
                      className="px-2 py-1 rounded border border-white/[0.08] text-zinc-300 hover:bg-white/[0.04] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      aria-label={`Previous page (currently on page ${page + 1} of ${totalPages})`}
                    >
                      ‹ Prev
                    </button>
                    <button
                      type="button"
                      disabled={atLast || loading}
                      onClick={() => setPage(p => p + 1)}
                      className="px-2 py-1 rounded border border-white/[0.08] text-zinc-300 hover:bg-white/[0.04] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      aria-label={`Next page (currently on page ${page + 1} of ${totalPages})`}
                    >
                      Next ›
                    </button>
                  </>
                )
              })()}
              <span className="text-zinc-600">{loading ? "Loading…" : ""}</span>
            </div>
          </div>
          )}
        </div>

        {/* ── DISCLAIMER ── (2026-05-19 layout fix)
            Moved INSIDE the content column. Was a sibling of the column in
            the outer `h-screen flex` (row) container, so it became a 3rd
            flex item alongside sidebar + content — claiming ~739px of
            horizontal width and squeezing the grid. mt-auto pins it to the
            bottom of the flex-col column; ml-16 dropped (column already
            offsets past the sidebar). Matches /scanner's nesting. */}
        <div className="mt-auto border-t border-white/[0.04] px-4 py-2 text-[10px] text-zinc-500 text-center flex-shrink-0">
          For informational purposes only. Not investment advice. Past performance does not guarantee future results. Options trading involves substantial risk.
        </div>
      </div>

      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowUpgradeModal(false)}>
          <div className="border border-[#1E2A3A] rounded-xl p-8 max-w-sm w-full mx-4" style={{ background: "#0F1520" }} onClick={e => e.stopPropagation()}>
            <div className="text-[#FF8A00] text-[10px] font-bold tracking-[0.15em] uppercase mb-3">Pro Feature</div>
            <div className="text-xl font-bold text-white mb-2">Gamma Wall Scanner</div>
            <div className="text-sm text-[#E7E5E4] mb-6 leading-relaxed">Real-time GEX heatmaps available on the Pro plan.</div>
            <Link href="/#pricing" className="block w-full text-center py-3 rounded-lg bg-[#FF8A00] text-black font-bold text-[15px] hover:bg-[#e57309] transition-colors">Upgrade to Pro</Link>
            <button onClick={() => setShowUpgradeModal(false)} className="block w-full text-center py-2 mt-3 text-[#4A5A72] text-[15px] hover:text-[#E7E5E4] transition-colors">Not now</button>
          </div>
        </div>
      )}
    </div>
  )
}
