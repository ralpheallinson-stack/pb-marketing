"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { format, parseISO, isValid } from "date-fns"
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react"

import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { ScannerSidebar } from "@/components/scanner-sidebar"
import { AccountMenu } from "@/components/AccountMenu"
import { ScannerAgGrid } from "@/components/ScannerAgGrid"
import { StatsPanel, type Stats } from "@/components/scanner/StatsPanel"
import { FiltersDialog } from "@/components/scanner/FiltersDialog"
import type { Trade } from "@/components/SignalRow"
import { rowsToTrades } from "@/lib/feed-decoder"
function daysAgo(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

const MIN_DATE = new Date("2024-01-01")

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

  // Date state — URL-driven, default = yesterday
  const initialDate = React.useMemo(() => {
    const fromUrl = searchParams.get("date")
    if (fromUrl) {
      const parsed = parseISO(fromUrl)
      if (isValid(parsed)) return parsed
    }
    return daysAgo(1)
  }, [searchParams])
  const [selectedDate, setSelectedDate] = React.useState<Date>(initialDate)

  // URL sync on date change
  React.useEffect(() => {
    const dateStr = format(selectedDate, "yyyy-MM-dd")
    if (searchParams.get("date") !== dateStr) {
      router.replace(`/historical?date=${dateStr}`, { scroll: false })
    }
  }, [selectedDate, router, searchParams])

  // Fetch state
  const [trades, setTrades] = React.useState<Trade[]>([])
  const [loading, setLoading] = React.useState(false)
  const [fetchError, setFetchError] = React.useState<string | null>(null)

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
  // Search + focus chips not surfaced on /historical v1 — kept as empty state
  // so matchesFilter can still apply categorical filters uniformly.
  const [focusTicker] = React.useState<string | null>(null)
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

  // Fetch trades for selected date
  React.useEffect(() => {
    const dateStr = format(selectedDate, "yyyy-MM-dd")
    setLoading(true)
    setFetchError(null)
    const params = new URLSearchParams()
    params.set("unified", "1")
    params.set("date", dateStr)
    params.set("grades", "A,B,PASS")
    params.set("page_size", "25000")
    fetch(`/api/scanner/feed?${params.toString()}`, { credentials: "include" })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(d => {
        if (d?.meta?.columns) {
          setTrades(rowsToTrades(d.rows ?? [], d.meta.columns))
        } else {
          setTrades([])
        }
        setLoading(false)
      })
      .catch(err => {
        setFetchError(err.message)
        setTrades([])
        setLoading(false)
      })
  }, [selectedDate])

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

  // Stats — computed locally from filtered (single-day = no server agg needed)
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

  // AG Grid imperative wiring — minimal for /historical (no SSE, no SSE batches)
  const gridApiRef = React.useRef<unknown>(null)
  const handleAgGridApiReady = React.useCallback((api: unknown) => {
    gridApiRef.current = api
    if (api && typeof (api as { setGridOption?: (k: string, v: unknown) => void }).setGridOption === "function") {
      (api as { setGridOption: (k: string, v: unknown) => void }).setGridOption("rowData", filtered.filter(t => !t.mm_suspected))
    }
  }, [filtered])
  // Update grid when filtered changes
  React.useEffect(() => {
    const api = gridApiRef.current as { setGridOption?: (k: string, v: unknown) => void } | null
    if (api?.setGridOption) {
      api.setGridOption("rowData", filtered.filter(t => !t.mm_suspected))
    }
  }, [filtered])

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
        {/* HEADER card with date picker + quick-pick chips + Filters trigger */}
        <header className="h-14 border border-white/[0.06] rounded-lg flex items-center justify-between px-4 flex-shrink-0" style={{ background: "#16191F" }}>
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-semibold text-zinc-200">Historical Flow</h1>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent border-white/[0.08] hover:bg-white/[0.04] text-zinc-200">
                  <CalendarIcon className="w-4 h-4 opacity-70" />
                  <span>{format(selectedDate, "EEEE, MMM d, yyyy")}</span>
                  <ChevronDown className="w-4 h-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 border-white/[0.08]" style={{ background: "#16191F" }} align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(d) => d && setSelectedDate(d)}
                  disabled={(d) => d > today || d < MIN_DATE}
                  autoFocus
                />
              </PopoverContent>
            </Popover>

            <div className="flex items-center gap-1 ml-2">
              <QuickPickChip label="Yesterday" onClick={() => setSelectedDate(daysAgo(1))} />
              <QuickPickChip label="-1 week" onClick={() => setSelectedDate(daysAgo(7))} />
              <QuickPickChip label="-1 month" onClick={() => setSelectedDate(daysAgo(30))} />
            </div>
          </div>

          <div className="flex items-center gap-3">
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

        <StatsPanel
          displayStats={stats}
          callPrem={callPrem}
          putPrem={putPrem}
          calls={calls}
          puts={puts}
        />

        <div className="flex flex-1 flex-col overflow-hidden border border-white/[0.06] rounded-lg" style={{ background: "#16191F" }}>
          {loading && trades.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-sm text-zinc-500">Loading {format(selectedDate, "MMM d, yyyy")}…</div>
          ) : fetchError ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-sm">
              <span className="text-red-400">Fetch error: {fetchError}</span>
              <Link href="/historical" className="text-zinc-400 hover:text-zinc-200 underline underline-offset-4">Reset</Link>
            </div>
          ) : trades.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-sm text-zinc-500">
              No trades recorded for {format(selectedDate, "MMM d, yyyy")}.
            </div>
          ) : (
            <ScannerAgGrid
              trades={filtered.filter(t => !t.mm_suspected)}
              setFocusTicker={() => {}}
              setFocusStrike={() => {}}
              setFocusExpiry={() => {}}
              setFilterOptType={setFilterOptType}
              setFilterSide={() => {}}
              setFilterBuySell={() => {}}
              setFilterType={setFilterType}
              matchesFilterRef={matchesFilterRef}
              onApiReady={handleAgGridApiReady as never}
              enableSort={true}
            />
          )}

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2 text-[11px] text-zinc-500 tabular-nums border-t border-white/[0.06]">
            <span>Historical · <span className="text-zinc-300 font-medium">{format(selectedDate, "MMM d, yyyy")}</span></span>
            <span>Showing all <span className="text-zinc-300 font-medium">{filtered.length.toLocaleString()}</span> trades</span>
            <span className="text-zinc-600">{loading ? "Refreshing…" : ""}</span>
          </div>
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

function QuickPickChip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-[11px] px-2.5 py-1 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] transition-colors"
    >
      {label}
    </button>
  )
}
