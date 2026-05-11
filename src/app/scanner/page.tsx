"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useVirtualizer } from "@tanstack/react-virtual"
import { badgeClass } from "@/lib/badge-styles"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis, getPageNumbers } from "@/components/ui/pagination"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Separator } from "@/components/ui/separator"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Card } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import { RadialBarChart, RadialBar, PolarAngleAxis } from "recharts"
import TrialBanner from "@/components/TrialBanner"
import CommandPalette from "@/components/CommandPalette"
import InfoTooltip from "@/components/InfoTooltip"
import ReplayProgress from "@/components/ReplayProgress"

import Link from "next/link"
import { decodeConds } from "./condCodes"
/* ── types ── */
interface Trade {
  id: number
  date_time: string
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

interface Stats {
  count: number
  bull: number
  bear: number
  lean: string
  pc_ratio: number
}

interface ApiResponse {
  trades: Trade[]
  stats: Stats
  is_historical: boolean
  error?: string
}

/* ── /api/scanner/feed (Phase 1 wire format) ───────────────────────────
 * Column-array shape, ~70% smaller payload than the legacy live-flow
 * dict-per-row response. See trading-system/web/queries.py:
 *   SCANNER_FEED_COLUMNS — column order (load-bearing).
 *   _format_trade_columnar — projection.
 *   _compute_feed_agg — agg block.
 * The decoder lives client-side: rowsToTrades() rehydrates each row
 * back into the existing Trade interface so render code is unchanged.
 * The bandwidth win is captured at JSON.parse time; client-side dict
 * allocation cost is identical to receiving dicts off the wire.
 */
type RawRow = unknown[];

interface FeedMeta {
  topic_id: string
  trading_day: string
  updated_at: string
  filter_count: number
  scorer_version: string
  is_historical: boolean
  columns: string[]
}

interface FeedAgg {
  sentiment: { label: string; score: number; _sort_score: number }
  pcr: number | null
  call_flow: { premium: string; count: number; _sort_premium: number }
  put_flow:  { premium: string; count: number; _sort_premium: number }
}

interface FeedResponse {
  meta: FeedMeta
  rows: RawRow[]
  agg: FeedAgg
  error?: string
}

/**
 * Hydrate column-array rows back into the existing Trade interface.
 * Single conversion site → all downstream render/filter/sort code keeps
 * working unchanged.
 *
 * Two derived fields:
 *   strike, premium, spot — backend ships precomputed _sort_* keys
 *     (×100 cents/×100 spot). We divide back out so existing code that
 *     reads t.premium etc. as dollars/raw values keeps working.
 *   badges — decoded from the conds[] short-code array via condCodes.ts
 *     into the {label, tier} shape badge-styles.ts expects.
 */
function rowsToTrades(rows: RawRow[], columns: string[]): Trade[] {
  const idx: Record<string, number> = {}
  for (let i = 0; i < columns.length; i++) idx[columns[i]] = i
  const out: Trade[] = []
  for (const r of rows) {
    const condCodes = (r[idx["conds"]] as string[] | null) ?? []
    out.push({
      id: r[idx["id"]] as number,
      time: r[idx["time"]] as string,
      date_time: r[idx["date_time"]] as string,
      symbol: r[idx["symbol"]] as string,
      sector: r[idx["sector"]] as string,
      expiration: r[idx["expiration"]] as string,
      strike: ((r[idx["_sort_strike"]] as number) || 0) / 100,
      strike_fmt: r[idx["strike_fmt"]] as string,
      opt_type: r[idx["opt_type"]] as string,
      aggression: r[idx["side"]] as string | null,
      trade_direction: r[idx["bs"]] as string | null,
      direction: (r[idx["direction"]] as string) || undefined,
      spot_fmt: r[idx["spot_fmt"]] as string,
      contracts: r[idx["contracts"]] as number,
      flow_type: r[idx["flow_type"]] as string,
      premium: ((r[idx["_sort_premium"]] as number) || 0) / 100,
      premium_fmt: r[idx["premium_fmt"]] as string,
      day_volume: r[idx["day_volume"]] as number,
      open_interest: r[idx["open_interest"]] as number,
      iv: (r[idx["iv"]] as number | null) ?? null,
      iv_rank: (r[idx["iv_rank"]] as number | null) ?? null,
      ruoa_streak: (r[idx["ruoa_streak"]] as number | null) ?? null,
      grade: r[idx["grade"]] as string,
      bullish: !!(r[idx["bullish"]] as boolean),
      whale: !!(r[idx["whale"]] as boolean),
      mm_suspected: !!(r[idx["mm_suspected"]] as boolean),
      high_conviction: !!(r[idx["high_conviction"]] as boolean),
      structure: (r[idx["structure"]] as string | null) ?? null,
      position_action: (r[idx["position_action"]] as string) || "",
      row_color: (r[idx["row_color"]] as "bullish" | "bearish" | undefined) ?? undefined,
      flow_highlight: (r[idx["flow_highlight"]] as "oi_multi" | "oi_single" | "late" | null) ?? null,
      delta: (r[idx["delta"]] as number | null) ?? null,
      vol_oi: (r[idx["vol_oi"]] as number | undefined) ?? undefined,
      dte: (r[idx["dte"]] as number | undefined) ?? undefined,
      money: (r[idx["money"]] as string) || "",
      accum_hits: (r[idx["accum_hits"]] as number | null) ?? 0,
      accum_premium: (r[idx["accum_premium"]] as number | undefined) ?? undefined,
      adv_multiple: (r[idx["adv_multiple"]] as number | null) ?? null,
      conviction_strength: (r[idx["conviction_strength"]] as string | null) ?? null,
      is_event_driven: !!(r[idx["is_event_driven"]] as boolean),
      contract_volume_multiple: (r[idx["contract_volume_multiple"]] as number | null) ?? null,
      baseline_volume: (r[idx["baseline_volume"]] as number | null) ?? null,
      today_volume: (r[idx["today_volume"]] as number | null) ?? null,
      entry_price: (r[idx["entry_price"]] as number | null) ?? null,
      outcome: (r[idx["outcome"]] as string | undefined) ?? undefined,
      pnl_percent: (r[idx["pnl_percent"]] as number | undefined) ?? undefined,
      badges: decodeConds(condCodes),
    })
  }
  return out
}

interface FilterPreset {
  name: string
  filters: {
    grade: string
    type: string
    optType: string
    side: string
    dte: string
    unusualOnly: boolean
    noIndex: boolean
    minPremium: string
    minContracts: number
    minVolOi: number
  }
}

/* ── helpers ── */
function fmtPrem(v: number) {
  if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`
  if (v >= 1e3) return `$${(v / 1e3).toFixed(0)}K`
  return `$${v}`
}

// Stat-strip KPI gauge — Recharts RadialBar wrapped in shadcn ChartContainer.
// Replaces the magicui AnimatedCircularProgressBar that powered the four
// stat-strip cards (Flow sentiment / Put-to-call / Call flow / Put flow)
// pre-2026-05-10. Single-bar 0-100 gauge with a faint background ring.
// Stays on the warm theme palette (Direction A scoping respected — palette
// applies to filter panel only, not the stat strip).
function KPIGaugeRing({ value, color }: { value: number; color: string }) {
  const data = [{ name: "value", value: Math.max(0, Math.min(100, value)), fill: color }]
  return (
    <ChartContainer
      config={{ value: { label: "value" } }}
      className="!aspect-square !h-[52px] !w-[52px]"
    >
      <RadialBarChart
        data={data}
        startAngle={90}
        endAngle={-270}
        innerRadius="70%"
        outerRadius="100%"
      >
        <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
        <RadialBar
          dataKey="value"
          cornerRadius={4}
          background={{ fill: "rgba(255,255,255,0.06)" }}
        />
      </RadialBarChart>
    </ChartContainer>
  )
}

function fmtGex(v: number) {
  const abs = Math.abs(v)
  const sign = v < 0 ? "-" : ""
  if (abs >= 1e12) return `${sign}$${(abs / 1e12).toFixed(2)}T`
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(2)}B`
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(1)}M`
  if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(0)}K`
  return `${sign}$${abs.toFixed(0)}`
}

function isMarketOpen() {
  const now = new Date()
  const et = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }))
  const day = et.getDay()
  if (day === 0 || day === 6) return false
  const mins = et.getHours() * 60 + et.getMinutes()
  return mins >= 570 && mins < 960 // 9:30 - 16:00
}

/* ── row highlight (inline styles — Tailwind JIT can't handle dynamic rgba) ── */
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
  if (a === "BELOW_BID" || a === "AT_BID") return "text-[#FF605D]"
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
  if (d === "SELL") return "text-[#FF605D]"
  return "text-white/90"
}

function bsLabel(d: string | null | undefined) {
  if (!d || d === "NEUTRAL") return "—"
  return d
}

/* ── time ranges (moved to filter panel) ── */
const TIME_RANGES = [
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "last_week", label: "Last Week" },
  { key: "month", label: "Month" },
] as const

const COLS = [
  { key: "time",   label: "Time",   cls: "text-left px-3 w-[7%]" },
  { key: "tick",   label: "Tick",   cls: "text-left px-2 w-[6%]" },
  { key: "expiry", label: "Expiry", cls: "text-left px-2 w-[7%]" },
  { key: "strike", label: "Strike", cls: "text-right px-2 w-[5%]" },
  { key: "cp",     label: "C/P",    cls: "text-center px-2 w-[4%]" },
  { key: "side",   label: "Side",   cls: "text-center px-2 w-[5%]" },
  { key: "bs",     label: "B/S",    cls: "text-center px-2 w-[4%]" },
  { key: "spot",   label: "Spot",   cls: "text-right px-2 w-[6%]" },
  { key: "size",   label: "Size",   cls: "text-right px-2 w-[5%]" },
  { key: "price",  label: "Price",  cls: "text-right px-2 w-[5%]" },
  { key: "prem",   label: "Prem",   cls: "text-right px-2 w-[6%]" },
  { key: "type",   label: "Type",   cls: "text-center px-2 w-[5%]" },
  { key: "vol",    label: "Vol",    cls: "text-right px-2 w-[6%]" },
  { key: "oi",     label: "OI",     cls: "text-right px-2 w-[5%]" },
  { key: "iv",     label: "IV",     cls: "text-right px-2 w-[4%]" },
  { key: "conds",  label: "Conds",  cls: "text-left px-2" },
] as const

/* ── page ── */
const GEX_SYMBOLS = ["SPY","QQQ","AAPL","TSLA","NVDA","META","MSFT","AMZN","GOOGL","AMD","MU","COIN","PLTR","NFLX","CRM","BA","JPM","GS","XOM","GLD"]

export default function ScannerPage() {
  const router = useRouter()
  const [trades, setTrades] = useState<Trade[]>([])
  const [stats, setStats] = useState<Stats>({ count: 0, bull: 0, bear: 0, lean: "MIXED", pc_ratio: 0 })
  const [timeRange, setTimeRange] = useState("today")
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [loading, setLoading] = useState(true)
  const [live, setLive] = useState(isMarketOpen())
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [activePage, setActivePage] = useState<"scanner" | "heatmap" | "watchlist">("scanner")
  const [canAccessGamma, setCanAccessGamma] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [gexSymbol, setGexSymbol] = useState("SPY")
  const [liveGexSpot, setLiveGexSpot] = useState<number | null>(null)
  const [gexData, setGexData] = useState<{ symbol: string; spot: number; spot_fmt: string; expirations: string[]; strikes: number[]; matrix: Record<string, Record<string, { net_gex: number; call_oi: number; put_oi: number; has_greeks?: boolean }>>; max_abs_gex: number; zero_gamma_strike: number | null; gamma_flip: number | null; total_net_gex: number; total_call_gex: number; total_put_gex: number; near_dte_gex: number; far_dte_gex: number; gamma_slope: number | null; slope_strike: number | null; max_plus_gex: { strike: number; gex: number } | null; max_minus_gex: { strike: number; gex: number } | null; prev_close: number | null; spot_change: number | null; spot_change_pct: number | null; top_cells: { strike: number; expiry: string; net_gex: number }[] } | null>(null)
  const [gexLoading, setGexLoading] = useState(false)
  const [gexError, setGexError] = useState("")
  const [paletteOpen, setPaletteOpen] = useState(false)

  // Read ?view=heatmap on mount so /heatmap redirects (and any deep links)
  // can land directly on the heatmap tab. Effect runs once after activePage
  // is initialized so we don't fight the default "scanner".
  useEffect(() => {
    if (typeof window === "undefined") return
    const params = new URLSearchParams(window.location.search)
    const v = params.get("view")
    if (v === "heatmap") setActivePage("heatmap")
    else if (v === "watchlist") setActivePage("watchlist")
  }, [])

  // S = open command palette. Bare-letter shortcut, focus-aware. Only active
  // on the heatmap tab to avoid surprising users on the flow scanner.
  useEffect(() => {
    if (activePage !== "heatmap") return
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const t = e.target as HTMLElement | null
      if (t) {
        const tag = t.tagName
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return
        if (t.isContentEditable) return
      }
      if (e.key === "s" || e.key === "S") { e.preventDefault(); setPaletteOpen(true) }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [activePage])
  const [watchlist, setWatchlist] = useState<string[]>([])
  const [wlQuotes, setWlQuotes] = useState<Record<string, { spot: number | null; change: number | null; change_pct: number | null; prev_close: number | null }>>({})
  const [wlSparks, setWlSparks] = useState<Record<string, number[]>>({})
  const [wlSort, setWlSort] = useState<{ key: "symbol" | "price" | "change" | "callFlow" | "putFlow" | "signals" | "lastSignal"; dir: "asc" | "desc" }>({ key: "change", dir: "desc" })
  const [wlInput, setWlInput] = useState("")
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [marketOpen, setMarketOpen] = useState(false)
  useEffect(() => {
    const check = () => {
      const et = new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" }))
      const day = et.getDay()
      const mins = et.getHours() * 60 + et.getMinutes()
      setMarketOpen(day >= 1 && day <= 5 && mins >= 570 && mins < 960)
    }
    check()
    const id = setInterval(check, 30000)
    return () => clearInterval(id)
  }, [])
  const audioCtxRef = useRef<HTMLAudioElement | null>(null)
  const prevTradeIdsRef = useRef<Set<number>>(new Set())
  const [showFilters, setShowFilters] = useState(false)
  const [filterGrade, setFilterGrade] = useState("")
  const [filterType, setFilterType] = useState("")
  const [filterOptType, setFilterOptType] = useState("")
  const [filterMinPremium, setFilterMinPremium] = useState<string>("")
  const [filterMinContracts, setFilterMinContracts] = useState(0)
  const [filterMinVolOi, setFilterMinVolOi] = useState(0)
  const [presets, setPresets] = useState<FilterPreset[]>([])

  // Hydrate from localStorage (instant) then reconcile with server (source of truth).
  // Anonymous users get 302 from the API and stay on local-only — no regression.
  // First-time logged-in users with empty server state get a one-time upload of
  // whatever they had in localStorage, so existing presets aren't lost.
  useEffect(() => {
    try {
      const cP = JSON.parse(localStorage.getItem("pb_filter_presets") || "[]")
      const cW = JSON.parse(localStorage.getItem("pb_watchlist") || "[]")
      if (Array.isArray(cP)) setPresets(cP)
      if (Array.isArray(cW)) setWatchlist(cW)
    } catch {}

    // Server preferences hydrate (read-only at mount). The upload-when-
    // server-empty path was removed because legacy localStorage data was
    // tripping server validation — and the upload isn't load-bearing
    // anyway: any user-driven preset save / watchlist add fires syncPrefs
    // which writes the canonical shape to the server.
    fetch("/api/scanner/preferences", { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d) return
        const sP = Array.isArray(d.filter_presets) ? d.filter_presets : []
        const sW = Array.isArray(d.watchlist) ? d.watchlist : []
        if (sP.length > 0) {
          setPresets(sP)
          localStorage.setItem("pb_filter_presets", JSON.stringify(sP))
        }
        if (sW.length > 0) {
          setWatchlist(sW)
          localStorage.setItem("pb_watchlist", JSON.stringify(sW))
        }
      })
      .catch(() => {})
  }, [])

  // Debounced sync — 300ms after the last change, push to server.
  const prefSyncRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const syncPrefs = useCallback((patch: { filter_presets?: FilterPreset[]; watchlist?: string[] }) => {
    if (prefSyncRef.current) clearTimeout(prefSyncRef.current)
    prefSyncRef.current = setTimeout(() => {
      fetch("/api/scanner/preferences", {
        method: "PUT", credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(patch),
      }).catch(() => {})
    }, 300)
  }, [])
  const [presetName, setPresetName] = useState("")
  const [showSavePreset, setShowSavePreset] = useState(false)
  const [filterDte, setFilterDte] = useState("")
  const [filterSide, setFilterSide] = useState("")
  const [filterUnusualOnly, setFilterUnusualOnly] = useState(false)
  const [filterNoIndex, setFilterNoIndex] = useState(false)
  // 2026-05-09: "Curated grades only" toggle. Default OFF = full coverage
  // (Grade A/B/PASS) — subscribers see PB's institutional flow tape on par with
  // Cheddar's coverage. Toggle ON = restore PB's traditional curated view
  // (Grade A/B only), hiding graded-PASS flow that conviction_grader Rules 6-9
  // route to PASS based on historical low-WR audits. Persists to localStorage
  // under pb_curated_grades. See project_pb_stage3_dte_filter_investigation.md
  // for the rationale (78.7% of 0-2 DTE flow gets PASS-graded; default-on
  // exposes that flow without changing the grader).
  const [filterCuratedOnly, setFilterCuratedOnly] = useState<boolean>(() => {
    if (typeof window === "undefined") return false
    try { return window.localStorage.getItem("pb_curated_grades") === "1" }
    catch { return false }
  })
  // 2026-05-10: companion to backend f182f0a which added exclude_side +
  // exclude_multi_leg query params on /api/scanner/feed and /live-flow.
  // Default OFF — opt-in via filter drawer toggles. exclude_side="MIDPOINT"
  // hides rows where the SIDE column would render "Mid" (NULL/NEUTRAL/MIDPOINT
  // aggression). exclude_multi_leg hides rows where structure is non-SINGLE_LEG
  // OR the OPRA badges include MULTI-LEG. Both filters apply both server-side
  // (snapshot) and client-side (over the live SSE-fed `trades` buffer) so the
  // toggle state is visually consistent regardless of which delivery path a
  // row arrived on. Live SSE pushes from sse_scanner.py do not yet apply
  // these predicates server-side — client-side filtering covers that gap.
  const [filterExcludeMidpoint, setFilterExcludeMidpoint] = useState<boolean>(() => {
    if (typeof window === "undefined") return false
    try { return window.localStorage.getItem("pb_exclude_midpoint") === "1" }
    catch { return false }
  })
  const [filterExcludeMultiLeg, setFilterExcludeMultiLeg] = useState<boolean>(() => {
    if (typeof window === "undefined") return false
    try { return window.localStorage.getItem("pb_exclude_multi_leg") === "1" }
    catch { return false }
  })
  const [activeFilterCount, setActiveFilterCount] = useState(0)
  const [focusTicker, setFocusTicker] = useState<string | null>(null)
  const [focusStrike, setFocusStrike] = useState<string | null>(null)
  const [focusExpiry, setFocusExpiry] = useState<string | null>(null)
  const lastTradeIdRef = useRef<number>(0)
  const isFirstLoadRef = useRef<boolean>(true)
  const tableContainerRef = useRef<HTMLDivElement>(null)
  // Phase 2: topic_id from latest /api/scanner/feed snapshot drives the SSE
  // subscription. State (not just ref) so the SSE effect re-runs when it
  // changes — that's how filter-change reconnects (#6 path).
  const [topicId, setTopicId] = useState<string | null>(null)
  const feedColumnsRef = useRef<string[] | null>(null)

  useEffect(() => {
    fetch("/api/me").then(r => r.ok ? r.json() : null).then(d => {
      if (d) setCanAccessGamma(d.gamma_wall)
    }).catch(() => {})
  }, [])

  const gexReqIdRef = useRef(0)
  useEffect(() => {
    if (activePage !== "heatmap" || !canAccessGamma) return
    const reqId = ++gexReqIdRef.current
    setGexLoading(true); setGexError("")
    fetch(`/api/scanner/gex-heatmap?symbol=${gexSymbol}`)
      .then(r => r.json())
      .then(d => {
        if (reqId !== gexReqIdRef.current) return  // stale response — newer symbol selected
        if (d.error) { setGexError(d.error); setGexData(null) } else setGexData(d)
      })
      .catch(() => { if (reqId === gexReqIdRef.current) setGexError("Failed to load") })
      .finally(() => { if (reqId === gexReqIdRef.current) setGexLoading(false) })
  }, [activePage, canAccessGamma, gexSymbol])

  // Batch live-quote polling for the watchlist tab. One HTTP call per
  // refresh covers every symbol in the list. 15s cadence is plenty for a
  // watchlist (vs 2s on the heatmap header) — these are reference quotes,
  // not active trading data. Pauses when tab is hidden.
  useEffect(() => {
    if (activePage !== "watchlist" || watchlist.length === 0) return
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | null = null
    const tick = async () => {
      if (cancelled) return
      if (!document.hidden) {
        try {
          const r = await fetch(`/api/scanner/watchlist-quotes?symbols=${watchlist.join(",")}`)
          if (r.ok) {
            const j = await r.json()
            if (!cancelled) setWlQuotes(j)
          }
        } catch { /* network blip */ }
      }
      timer = setTimeout(tick, 15000)
    }
    tick()
    return () => { cancelled = true; if (timer) clearTimeout(timer) }
  }, [activePage, watchlist])

  // 5-day sparkline data — fetched once per watchlist change, cached server-
  // side 1h. No tick polling needed; daily closes don't change intraday at
  // bar resolution.
  useEffect(() => {
    if (activePage !== "watchlist" || watchlist.length === 0) return
    let cancelled = false
    fetch(`/api/scanner/watchlist-sparks?symbols=${watchlist.join(",")}`)
      .then(r => r.ok ? r.json() : null)
      .then(j => { if (j && !cancelled) setWlSparks(j) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [activePage, watchlist])

  // Live spot polling for the embedded heatmap (matches /heatmap page).
  // OI is fixed intraday — only spot moves tick-to-tick. Cheap dedicated
  // endpoint, 2s during market hours, 30s after close.
  useEffect(() => {
    if (activePage !== "heatmap" || !canAccessGamma) return
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | null = null
    const isMarketHours = () => {
      const now = new Date()
      const et = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }))
      const day = et.getDay()
      if (day === 0 || day === 6) return false
      const mins = et.getHours() * 60 + et.getMinutes()
      return mins >= 9 * 60 + 30 && mins < 16 * 60
    }
    const tick = async () => {
      if (cancelled) return
      if (!document.hidden) {
        try {
          const r = await fetch(`/api/scanner/spot?symbol=${gexSymbol}`)
          if (r.ok) {
            const j = await r.json()
            if (!cancelled && typeof j.spot === "number") setLiveGexSpot(j.spot)
          }
        } catch { /* network blip */ }
      }
      timer = setTimeout(tick, isMarketHours() ? 2000 : 30000)
    }
    tick()
    return () => { cancelled = true; if (timer) clearTimeout(timer) }
  }, [activePage, canAccessGamma, gexSymbol])

  const addToWatchlist = useCallback((input: string) => {
    // Accept single symbol OR comma/space-separated multi (e.g.
    // "AAPL, MSFT, NVDA" pasted from a spreadsheet column).
    const parts = input.toUpperCase().split(/[\s,;]+/).map(s => s.trim()).filter(Boolean)
    if (!parts.length) return
    const next = [...watchlist]
    for (const s of parts) {
      // Light validation — 1-6 alpha chars + optional .B-style suffix.
      if (s.length > 6 || !/^[A-Z]+(\.[A-Z])?$/.test(s)) continue
      if (!next.includes(s)) next.push(s)
    }
    if (next.length === watchlist.length) return
    setWatchlist(next)
    localStorage.setItem("pb_watchlist", JSON.stringify(next))
    syncPrefs({ watchlist: next })
  }, [watchlist, syncPrefs])

  const removeFromWatchlist = useCallback((sym: string) => {
    const updated = watchlist.filter(s => s !== sym)
    setWatchlist(updated)
    localStorage.setItem("pb_watchlist", JSON.stringify(updated))
    syncPrefs({ watchlist: updated })
  }, [watchlist, syncPrefs])

  const playBlip = useCallback(() => {
    if (!soundEnabled) return
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new Audio("/static/audio/alert.mp3")
        audioCtxRef.current.volume = 0.6
        audioCtxRef.current.preload = "auto"
      }
      const a = audioCtxRef.current
      a.currentTime = 0
      a.play().catch(() => { /* autoplay blocked or asset missing */ })
    } catch { /* audio unavailable */ }
  }, [soundEnabled])

  // Pre-warm the HTMLAudioElement decoder via a silent play+pause under a
  // user gesture. Without this, the first .play() after page load takes
  // hundreds of ms while the decoder spins up — perceived as audio lag
  // on the first signal even though the SSE event:row handler fired
  // synchronously (Pattern A diagnostic, 2026-05-08: 8 rows / 8 plays,
  // audio fires 15-20ms BEFORE DOM commit). Subsequent plays hit a warm
  // decoder. Volume zeroed during warm-up so the user doesn't hear the
  // warm play; restored after pause. Promise-awaited so pause runs AFTER
  // play resolves — pausing before play settles cancels the warm-up.
  const prewarmAudio = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new Audio("/static/audio/alert.mp3")
        audioCtxRef.current.volume = 0.6
        audioCtxRef.current.preload = "auto"
      }
      const a = audioCtxRef.current
      const originalVolume = a.volume
      a.volume = 0
      a.play()
        .then(() => {
          a.pause()
          a.currentTime = 0
          a.volume = originalVolume
        })
        .catch(() => {
          a.volume = originalVolume
        })
    } catch { /* audio unavailable */ }
  }, [])

  // Extracted from the inline JSX onClick so the off→on transition can
  // fire prewarmAudio() under the same user gesture browsers require for
  // autoplay-policy compliance.
  const toggleSound = useCallback(() => {
    const next = !soundEnabled
    if (next) prewarmAudio()
    setSoundEnabled(next)
  }, [soundEnabled, prewarmAudio])

  // Refs to break dep churn — see plan: scanner live-update fix.
  // playBlip via ref so sound toggles don't rebuild fetchData.
  // fetchDataRef so polling/reset effects don't re-run on fetchData identity changes.
  // lastSuccessRef + pollError power the connection-status banner + stale watchdog.
  const playBlipRef = useRef<() => void>(() => {})
  const fetchDataRef = useRef<((opts?: { initial?: boolean; pageNum?: number }) => Promise<void>) | null>(null)
  const lastSuccessRef = useRef<number>(Date.now())
  const [pollError, setPollError] = useState<string | null>(null)
  useEffect(() => { playBlipRef.current = playBlip }, [playBlip])

  // soundEnabled defaults to true with no localStorage persistence, so
  // most users land with sound on and never click the toggle. Without
  // this, the toggleSound pre-warm fires for almost no one in practice.
  // Register a one-shot listener on the first user gesture (click or
  // keypress anywhere in the document) to fire prewarmAudio() under
  // that gesture. { once: true } auto-removes per-event after firing;
  // the manual removes inside `warm` cover the case where one event
  // fires first and we want to drop the listener for the other event
  // type too. Cleanup return covers component unmount before either
  // event arrives.
  useEffect(() => {
    if (!soundEnabled) return
    const warm = () => {
      prewarmAudio()
      document.removeEventListener("click", warm)
      document.removeEventListener("keydown", warm)
    }
    document.addEventListener("click", warm, { once: true })
    document.addEventListener("keydown", warm, { once: true })
    return () => {
      document.removeEventListener("click", warm)
      document.removeEventListener("keydown", warm)
    }
  }, [soundEnabled, prewarmAudio])

  // ── SSE — Phase 2 row-push splicing when feed flag is on; legacy doorbell otherwise ──
  //
  // Feed mode (useFeedEndpoint() && topicId): subscribe to /api/scanner/stream?topic=<id>
  // and splice each event:row directly into state. event:agg replaces the sidebar
  // widget stats. The polling tick effect below short-circuits in this mode, so
  // updates are push-only.
  //
  // Legacy mode: doorbell that debounces fetchData on event:signal — pre-Phase-2
  // behavior, kept intact for the flag-off branch and as fallback when topicId
  // hasn't resolved yet.
  //
  // Effect re-runs on topicId change → close + reopen with new topic. That
  // covers Phase 2 #6 (filter change → new snapshot → new topic_id) for free.
  const sseConnRef = useRef<EventSource | null>(null)
  const sseDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Phase 2 #5: 60s stale-connection guard. Watchdog interval inside the
  // SSE effect refreshes only when feedMode is active.
  const sseStaleCheckRef = useRef<ReturnType<typeof setInterval> | null>(null)
  useEffect(() => {
    if (page !== 0) return
    const feedMode = useFeedEndpoint() && !!topicId

    // Stale-guard reconnect — closes the current ES, refetches the snapshot
    // (forcing the feed-snapshot branch by resetting isFirstLoadRef), then
    // reopens. If fetchData updates topicId, the effect re-runs and reopens
    // with the new topic; the open() guard at the bottom is a no-op in that
    // case. If topicId is unchanged, the explicit open() is what reconnects.
    const reconnect = async () => {
      setPollError("Connection stalled — reconnecting…")
      if (sseStaleCheckRef.current) { clearInterval(sseStaleCheckRef.current); sseStaleCheckRef.current = null }
      if (sseConnRef.current) { sseConnRef.current.close(); sseConnRef.current = null }
      // Force fetchData onto the snapshot path. Without this, the since_id
      // incremental branch fires and hits legacy live-flow — wrong target
      // for feed-mode catch-up.
      isFirstLoadRef.current = true
      lastTradeIdRef.current = 0
      const p = fetchDataRef.current?.({ pageNum: 0 })
      if (p && typeof (p as Promise<void>).then === "function") {
        try { await p } catch {}
      }
      if (!document.hidden) open()
      setPollError(null)
    }

    const open = () => {
      if (sseConnRef.current) return
      try {
        const url = feedMode
          ? `/api/scanner/stream?topic=${encodeURIComponent(topicId!)}`
          : "/api/scanner/stream"
        const es = new EventSource(url)
        sseConnRef.current = es
        // Initialize heartbeat so the watchdog doesn't trip on the silence
        // before the first event arrives. The server sends event:agg
        // immediately on connect (Phase 2 #3), so this typically refreshes
        // within ~100ms anyway.
        lastSuccessRef.current = Date.now()

        if (feedMode) {
          es.addEventListener("row", (ev) => {
            const cols = feedColumnsRef.current
            if (!cols) return
            let row: RawRow
            try { row = JSON.parse((ev as MessageEvent).data) as RawRow }
            catch { return }
            const incoming = rowsToTrades([row], cols)
            if (incoming.length === 0) return
            const t = incoming[0]
            // Splice — dedupe by id (server may republish on reconnect),
            // prepend, cap at the snapshot limit so the in-memory list
            // doesn't grow unbounded over a long session.
            setTrades(prev => {
              if (prev.some(p => p.id === t.id)) return prev
              return [t, ...prev].slice(0, 2000)
            })
            if (matchesFilterRef.current(t)) playBlipRef.current()
            lastTradeIdRef.current = Math.max(lastTradeIdRef.current, t.id)
            lastSuccessRef.current = Date.now()
            setPollError(null)
          })
          es.addEventListener("agg", () => {
            // Sidebar widgets read `displayStats` (useMemo over `filtered`),
            // which is purely client-derived from the visible row set —
            // including all client-only filters (search/grade/side/etc) the
            // server topic doesn't know about. Server agg over the universe
            // would clobber a TSLA-only display, so we don't write it.
            // Handler stays alive as a heartbeat for the stale guard below.
            lastSuccessRef.current = Date.now()
          })
          // 60s stale-connection guard. Server-side keepalive is a 15s
          // event:ping (already refreshes lastSuccessRef via the row/agg
          // handlers in steady state, plus event:agg every 5–10s in #3).
          // If 60s pass with nothing, the connection is dead — Cloudflare
          // dropped the stream, server restarted, or the network blip
          // outlasted keepalives. Reconnect.
          sseStaleCheckRef.current = setInterval(() => {
            if (document.hidden) return
            if (Date.now() - lastSuccessRef.current < 60000) return
            reconnect()
          }, 15000)
        } else {
          es.addEventListener("signal", () => {
            if (sseDebounceRef.current) return
            sseDebounceRef.current = setTimeout(() => {
              sseDebounceRef.current = null
              if (!document.hidden) fetchDataRef.current?.({ pageNum: 0 })
            }, 250)
          })
        }
      } catch {}
    }
    const close = () => {
      if (sseDebounceRef.current) { clearTimeout(sseDebounceRef.current); sseDebounceRef.current = null }
      if (sseStaleCheckRef.current) { clearInterval(sseStaleCheckRef.current); sseStaleCheckRef.current = null }
      if (sseConnRef.current) { sseConnRef.current.close(); sseConnRef.current = null }
    }
    const onVis = () => { document.hidden ? close() : open() }
    open()
    document.addEventListener("visibilitychange", onVis)
    return () => {
      close()
      document.removeEventListener("visibilitychange", onVis)
    }
  }, [page, topicId])

  const savePreset = (name: string) => {
    if (!name.trim()) return
    const preset: FilterPreset = {
      name: name.trim(),
      filters: {
        grade: filterGrade, type: filterType, optType: filterOptType, side: filterSide,
        dte: filterDte, unusualOnly: filterUnusualOnly, noIndex: filterNoIndex,
        minPremium: filterMinPremium, minContracts: filterMinContracts, minVolOi: filterMinVolOi,
      },
    }
    const updated = [...presets.filter(p => p.name !== preset.name), preset]
    setPresets(updated)
    localStorage.setItem("pb_filter_presets", JSON.stringify(updated))
    syncPrefs({ filter_presets: updated })
    setPresetName("")
    setShowSavePreset(false)
  }

  const loadPreset = (preset: FilterPreset) => {
    const f = preset.filters
    setFilterGrade(f.grade); setFilterType(f.type); setFilterOptType(f.optType)
    setFilterSide(f.side); setFilterDte(f.dte); setFilterUnusualOnly(f.unusualOnly)
    setFilterNoIndex(f.noIndex); setFilterMinPremium(f.minPremium)
    setFilterMinContracts(f.minContracts || 0); setFilterMinVolOi(f.minVolOi || 0)
  }

  const deletePreset = (name: string) => {
    const updated = presets.filter(p => p.name !== name)
    setPresets(updated)
    localStorage.setItem("pb_filter_presets", JSON.stringify(updated))
    syncPrefs({ filter_presets: updated })
  }

  const resetFilters = () => {
    setFilterGrade(""); setFilterType(""); setFilterOptType(""); setFilterSide("")
    setFilterDte(""); setFilterUnusualOnly(false); setFilterNoIndex(false); setFilterCuratedOnly(false); setFilterExcludeMidpoint(false); setFilterExcludeMultiLeg(false)
    setFilterMinPremium(""); setFilterMinContracts(0); setFilterMinVolOi(0)
  }

  const buildUrl = useCallback((opts?: { sinceId?: number; pageNum?: number }) => {
    const p = new URLSearchParams()
    if (timeRange !== "today") p.set("range", timeRange)
    if (filterMinPremium !== "") p.set("min_premium", filterMinPremium)
    if (filterDte === "0dte") p.set("max_dte", "0")
    else if (filterDte === "1-7") p.set("max_dte", "7")
    else if (filterDte === "8-30") p.set("max_dte", "30")
    p.set("slim", "true")
    // Bug 2 slice (grade-set unification, 2026-05-11): mirror buildFeedUrl's
    // grades behavior so paginated live-flow pages match the feed snapshot.
    // Without this, page 0 (feed, A,B,PASS) and pages 1+ (live-flow, A,B
    // backend-default) returned different result sets and pagination was
    // a discontinuity, not a continuation. Same toggle the user sees in
    // the filter panel ("Curated grades only") now drives both endpoints.
    p.set("grades", filterCuratedOnly ? "A,B" : "A,B,PASS")
    if (filterExcludeMidpoint) p.set("exclude_side", "MIDPOINT")
    if (filterExcludeMultiLeg) p.set("exclude_multi_leg", "1")
    if (opts?.sinceId && opts.sinceId > 0) p.set("since_id", opts.sinceId.toString())
    const pg = opts?.pageNum ?? 0
    if (pg > 0) { p.set("page", pg.toString()); p.set("page_size", "2000") }
    return `/api/scanner/live-flow?${p.toString()}`
  }, [timeRange, filterMinPremium, filterDte, filterCuratedOnly, filterExcludeMidpoint, filterExcludeMultiLeg])

  // Phase 1 feed-endpoint URL builder. Same filter shape as buildUrl, but
  // hits /api/scanner/feed (column-array, ~70% smaller payload). No
  // since_id or pagination yet — TODO when we either add since_id to the
  // feed endpoint or move incremental updates onto SSE in Phase 2.
  const buildFeedUrl = useCallback(() => {
    const p = new URLSearchParams()
    if (timeRange !== "today") p.set("range", timeRange)
    if (filterMinPremium !== "") p.set("min_premium", filterMinPremium)
    if (filterDte === "0dte") p.set("max_dte", "0")
    else if (filterDte === "1-7") p.set("max_dte", "7")
    else if (filterDte === "8-30") p.set("max_dte", "30")
    // grades default flipped 2026-05-09: full coverage (A,B,PASS) by default;
    // toggle ON restores the curated A,B-only view. Backend at
    // web/blueprints/scanner_sub.py accepts grades param and sanitizes to
    // any subset of {A, B, PASS}; default-on-server is still A,B so the
    // explicit param here is what produces the new default behavior.
    p.set("grades", filterCuratedOnly ? "A,B" : "A,B,PASS")
    if (filterExcludeMidpoint) p.set("exclude_side", "MIDPOINT")
    if (filterExcludeMultiLeg) p.set("exclude_multi_leg", "1")
    p.set("limit", "2000")
    return `/api/scanner/feed?${p.toString()}`
  }, [timeRange, filterMinPremium, filterDte, filterCuratedOnly, filterExcludeMidpoint, filterExcludeMultiLeg])

  // Phase 2 unified URL builder (2026-05-11). Single URL for page 0 +
  // page 1+ + incremental — points at /api/scanner/feed?unified=1 which
  // (per backend commit 0113d3f) now accepts page/page_size/since_id/
  // include_dashboard/include_sectors. Mirrors buildFeedUrl's filter
  // params + buildUrl's pagination params. include_dashboard=1 is sent
  // only on page 0 (page>0 dashboard is null per Q1).
  const buildScannerUrl = useCallback((opts?: { pageNum?: number; sinceId?: number }) => {
    const pg = opts?.pageNum ?? 0
    const p = new URLSearchParams()
    p.set("unified", "1")
    if (timeRange !== "today") p.set("range", timeRange)
    if (filterMinPremium !== "") p.set("min_premium", filterMinPremium)
    if (filterDte === "0dte") p.set("max_dte", "0")
    else if (filterDte === "1-7") p.set("max_dte", "7")
    else if (filterDte === "8-30") p.set("max_dte", "30")
    p.set("grades", filterCuratedOnly ? "A,B" : "A,B,PASS")
    if (filterExcludeMidpoint) p.set("exclude_side", "MIDPOINT")
    if (filterExcludeMultiLeg) p.set("exclude_multi_leg", "1")
    if (opts?.sinceId && opts.sinceId > 0) p.set("since_id", opts.sinceId.toString())
    if (pg > 0) { p.set("page", pg.toString()); p.set("page_size", "2000") }
    // Dashboard bundle is page-0 only (Q1 default). Skip on incremental
    // polls — server already strips dashboard when since_id is set, this
    // just saves a few URL bytes.
    if (pg === 0 && !opts?.sinceId) p.set("include_dashboard", "1")
    return `/api/scanner/feed?${p.toString()}`
  }, [timeRange, filterMinPremium, filterDte, filterCuratedOnly, filterExcludeMidpoint, filterExcludeMultiLeg])

  // Feature flag: opt-in via `localStorage.setItem('pb_scanner_feed','1')` on
  // the browser DevTools console. Default OFF — existing live-flow path
  // continues to serve every user. After visual-diff bake-in this becomes
  // the default and the flag is removed. Read on each call so toggling
  // doesn't require a page reload.
  // TODO(Phase 1 frontend): remove flag + delete legacy live-flow branch
  // after a soak. TODO(Phase 2): once SSE streams rows directly, the
  // 'full load' branch becomes the only call path and polling disappears.
  const useFeedEndpoint = (): boolean => {
    if (typeof window === "undefined") return false
    try { return window.localStorage.getItem("pb_scanner_feed") === "1" }
    catch { return false }
  }

  // Phase 2 unification reader (2026-05-11):
  //   - ?unified=0 in URL → false (Q7 kill-switch, always wins)
  //   - ?unified=1 in URL → true (opt-in for this session, e.g. support
  //     debugging)
  //   - else: localStorage pb_scanner_unified === "1" → true
  //   - else: false (default through Phases 1-3)
  // See project_pb_scanner_endpoint_unification_design.md §Q7 for the
  // triage-kill-switch runbook.
  const useUnifiedEndpoint = (): boolean => {
    if (typeof window === "undefined") return false
    try {
      const url = new URL(window.location.href)
      const q = url.searchParams.get("unified")
      if (q === "0") return false
      if (q === "1") return true
      return window.localStorage.getItem("pb_scanner_unified") === "1"
    } catch { return false }
  }

  // In-memory kill-switch: any shape-mismatch / 5xx on the unified path
  // flips this ref true for the rest of the session, so subsequent fetches
  // bypass unified and go straight to the legacy split. Reset on page
  // reload. Logged via console.warn so support can find it.
  const unifiedDisabledRef = useRef(false)

  // Latest snapshot meta — populated when fetchData uses the feed endpoint.
  // Holds topic_id (for Phase 2 SSE subscription) and updated_at.
  const feedMetaRef = useRef<FeedMeta | null>(null)

  // Detect a session-expired response. Flask's @subscriber_required returns a
  // 302 to /login (not 401/403). The browser fetch follows the redirect by
  // default, so res.status is 200 with res.redirected=true and res.url ending
  // in /login. Without this check, the polling loop silently swallows the
  // login HTML, fails JSON parse, and the user sees "Connection lost" forever
  // until they manually refresh. Spotted in the 16/199 302 ratio in access logs.
  const isAuthRedirect = (res: Response): boolean => {
    if (res.status === 401 || res.status === 403) return true
    if (res.redirected && res.url.includes("/login")) return true
    return false
  }

  const fetchData = useCallback(async (opts?: { initial?: boolean; pageNum?: number }) => {
    const pg = opts?.pageNum ?? page
    if (opts?.initial) setLoading(true)
    // Hard 12s timeout via AbortController. Without this, a hung fetch (slow
    // worker, network blip, edge cold cache) leaves the polling chain's
    // `.finally(after)` never firing, which silently kills the chain. Wake
    // handler revives it on tab-change, but a tab kept in foreground with no
    // user interaction stays frozen until refresh. AbortController guarantees
    // the Promise resolves/rejects within 12s.
    const ac = new AbortController()
    const timeoutId = setTimeout(() => ac.abort(), 12000)
    try {
      // ── PHASE 2 UNIFIED PATH (2026-05-11) ──
      // When the unified flag is on AND the in-memory kill-switch hasn't
      // tripped, route ALL fetches (page 0, page 1+, incremental) through
      // /api/scanner/feed?unified=1. On any shape mismatch or 5xx, flip
      // unifiedDisabledRef true for the session and fall through to the
      // legacy split branches below. Bug 2 endpoint unification —
      // project_pb_scanner_endpoint_unification_design.md §Phase 2.
      if (useUnifiedEndpoint() && !unifiedDisabledRef.current) {
        const isIncrementalCall = pg === 0 && !isFirstLoadRef.current && lastTradeIdRef.current > 0
        const sinceId = isIncrementalCall ? lastTradeIdRef.current : undefined
        try {
          const url = buildScannerUrl({ pageNum: pg, sinceId })
          const res = await fetch(url, { signal: ac.signal })
          if (isAuthRedirect(res)) {
            setPollError("Session expired — redirecting to login…")
            router.push("/login")
            return
          }
          if (!res.ok) throw new Error(`unified HTTP ${res.status}`)
          const fd: FeedResponse = await res.json()
          if (fd.error) throw new Error(`unified error: ${fd.error}`)
          if (!fd.meta?.columns) throw new Error("unified shape mismatch: missing meta.columns")

          feedMetaRef.current = fd.meta
          feedColumnsRef.current = fd.meta.columns
          setTopicId(fd.meta.topic_id)
          const incoming = rowsToTrades(fd.rows || [], fd.meta.columns)

          if (isIncrementalCall) {
            if (incoming.length > 0) {
              if (incoming.some(tr => !prevTradeIdsRef.current.has(tr.id) && matchesFilterRef.current(tr))) {
                playBlipRef.current()
              }
              lastTradeIdRef.current = Math.max(lastTradeIdRef.current, ...incoming.map(tr => tr.id))
              setTrades(prev => [...incoming, ...prev].slice(0, 20000))
            }
          } else {
            if (prevTradeIdsRef.current.size > 0 && incoming.some(tr => !prevTradeIdsRef.current.has(tr.id) && matchesFilterRef.current(tr))) {
              playBlipRef.current()
            }
            prevTradeIdsRef.current = new Set(incoming.map(tr => tr.id))
            if (incoming.length > 0) {
              lastTradeIdRef.current = Math.max(...incoming.map(tr => tr.id))
            }
            isFirstLoadRef.current = false
            setTrades(incoming)
            if (fd.agg) {
              const agg = fd.agg
              const lean = (agg.sentiment?.label || "MIXED").toUpperCase()
              setStats({
                count: incoming.length,
                bull: (agg.call_flow?._sort_premium ?? 0) / 100,
                bear: (agg.put_flow?._sort_premium ?? 0) / 100,
                lean,
                pc_ratio: agg.pcr ?? 0,
              })
            }
          }
          lastSuccessRef.current = Date.now()
          setPollError(null)
          return
        } catch (unifiedErr) {
          // AbortError bubbles to the outer catch — let it through.
          if (unifiedErr instanceof DOMException && unifiedErr.name === "AbortError") {
            throw unifiedErr
          }
          // Any other failure (5xx, JSON parse error, shape mismatch) →
          // flip the kill-switch and fall through to the legacy branches.
          console.warn("[scanner] unified endpoint failed, falling back to legacy split:", unifiedErr)
          unifiedDisabledRef.current = true
          // continue to legacy branches below
        }
      }

      // Incremental polling — only on page 0 (live) after first load
      if (pg === 0 && !isFirstLoadRef.current && lastTradeIdRef.current > 0) {
        const res = await fetch(buildUrl({ sinceId: lastTradeIdRef.current }), { signal: ac.signal })
        if (isAuthRedirect(res)) {
          setPollError("Session expired — redirecting to login…")
          router.push("/login")
          return
        }
        const data: ApiResponse = await res.json()
        if (data.trades?.length > 0) {
          const newMaxId = Math.max(...data.trades.map((tr: Trade) => tr.id))
          lastTradeIdRef.current = newMaxId
          setTrades(prev => [...data.trades, ...prev].slice(0, 20000))
          if (data.trades.some(matchesFilterRef.current)) playBlipRef.current()
        }
        lastSuccessRef.current = Date.now()
        setPollError(null)
        return
      }

      // Full load (first time, page change, filter change).
      // When the feed feature flag is on AND we're on page 0 (live), use
      // /api/scanner/feed for the snapshot and hydrate. Page 1+ stays on
      // live-flow because the feed endpoint doesn't yet support pagination
      // — TODO when needed. Incremental polling (since_id branch above)
      // also stays on live-flow.
      if (pg === 0 && useFeedEndpoint()) {
        const res = await fetch(buildFeedUrl(), { signal: ac.signal })
        if (isAuthRedirect(res)) {
          setPollError("Session expired — redirecting to login…")
          router.push("/login")
          return
        }
        const fd: FeedResponse = await res.json()
        if (fd.error) return
        feedMetaRef.current = fd.meta
        feedColumnsRef.current = fd.meta.columns
        setTopicId(fd.meta.topic_id)
        const incoming = rowsToTrades(fd.rows || [], fd.meta.columns)
        if (prevTradeIdsRef.current.size > 0 && incoming.some(tr => !prevTradeIdsRef.current.has(tr.id) && matchesFilterRef.current(tr))) {
          playBlipRef.current()
        }
        prevTradeIdsRef.current = new Set(incoming.map(tr => tr.id))
        if (incoming.length > 0) {
          lastTradeIdRef.current = Math.max(...incoming.map((tr: Trade) => tr.id))
        }
        isFirstLoadRef.current = false
        setTrades(incoming)
        // Map feed agg → existing Stats shape. bull/bear are sentiment
        // proxies derived from buy-call+sell-put vs buy-put+sell-call
        // premium splits — close enough for the sidebar widget. Exact
        // parity with live-flow's dashboard query lives in the legacy
        // path below; flip the flag to compare.
        const agg = fd.agg
        const lean = (agg?.sentiment?.label || "MIXED").toUpperCase()
        setStats({
          count: incoming.length,
          bull: (agg?.call_flow?._sort_premium ?? 0) / 100,
          bear: (agg?.put_flow?._sort_premium ?? 0) / 100,
          lean,
          pc_ratio: agg?.pcr ?? 0,
        })
        lastSuccessRef.current = Date.now()
        setPollError(null)
        return
      }

      // Legacy path (default): /api/scanner/live-flow with full dict shape.
      const res = await fetch(buildUrl({ pageNum: pg }), { signal: ac.signal })
      if (isAuthRedirect(res)) {
        setPollError("Session expired — redirecting to login…")
        router.push("/login")
        return
      }
      const data: ApiResponse = await res.json()
      if (data.error) return
      const incoming = data.trades || []
      if (pg === 0 && prevTradeIdsRef.current.size > 0 && incoming.some(tr => !prevTradeIdsRef.current.has(tr.id) && matchesFilterRef.current(tr))) {
        playBlipRef.current()
      }
      prevTradeIdsRef.current = new Set(incoming.map(tr => tr.id))
      if (incoming.length > 0) {
        lastTradeIdRef.current = Math.max(...incoming.map((tr: Trade) => tr.id))
      }
      isFirstLoadRef.current = false
      setTrades(incoming)
      setStats(data.stats || { count: 0, bull: 0, bear: 0, lean: "MIXED", pc_ratio: 0 })
      lastSuccessRef.current = Date.now()
      setPollError(null)
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setPollError("Slow connection — retrying")
      } else if (err instanceof SyntaxError) {
        // JSON parse error after a missed-auth redirect lands here.
        setPollError("Session may have expired — refresh to log in.")
      } else {
        setPollError("Connection lost — retrying")
      }
    } finally {
      clearTimeout(timeoutId)
      setLoading(false)
    }
  }, [page, buildUrl, buildScannerUrl, router])

  // Keep fetchDataRef in sync — decouples reset/polling effects from fetchData identity
  useEffect(() => { fetchDataRef.current = fetchData }, [fetchData])

  // initial load + page/range/filter change — reset incremental state.
  // Uses fetchDataRef so the dep churn from fetchData identity changes does NOT
  // wipe state. But we must still depend on the URL-affecting filters
  // (timeRange, filterMinPremium, filterDte from buildUrl) so changing those
  // clears the stale trade list and refetches with the new server filter.
  useEffect(() => {
    isFirstLoadRef.current = true
    lastTradeIdRef.current = 0
    setTrades([])
    fetchDataRef.current?.({ initial: true, pageNum: page })
  }, [page, timeRange, filterMinPremium, filterDte, filterCuratedOnly, filterExcludeMidpoint, filterExcludeMultiLeg])

  // auto-refresh every 3s on page 0 (live).
  //
  // Self-rescheduling setTimeout instead of setInterval: doesn't pile up if a fetch
  // is slow, and pairs cleanly with visibilitychange to recover from background-tab
  // throttling (Chrome throttles setInterval to 1Hz in inactive tabs, sometimes pauses entirely).
  //
  // Visibility/focus handler: on tab return, immediately catch up via since_id and
  // restart the timer fresh — don't trust whatever stale state Chrome left it in.
  useEffect(() => {
    if (page !== 0) return
    // Phase 2: row-push SSE handles updates when feed flag is on AND we have
    // a topic_id. Skip the 3s polling tick entirely. The wake handlers below
    // are also skipped — #5 will add a 60s SSE-stale guard to handle the
    // "EventSource silently dies" case that polling implicitly covered.
    // Phase 2 unification (2026-05-11): unified path also gets topicId from
    // the feed response, so SSE serves the same role — skip polling under
    // either flag when topicId is established.
    if ((useFeedEndpoint() || useUnifiedEndpoint()) && topicId) return

    const tick = () => {
      if (page !== 0) return
      const hidden = document.hidden
      // Skip the fetch when the tab is hidden — but ALWAYS reschedule. Earlier
      // version returned early here, which killed the polling chain whenever
      // the tab was backgrounded. visibilitychange was supposed to revive it,
      // but that event is unreliable across Chrome tab-freezing, partial
      // obscure, and Safari/Firefox quirks. Now the loop survives indefinitely
      // and just dilates to 30s while hidden (Chrome throttles to ~1min anyway).
      if (!hidden) {
        setLive(isMarketOpen())
        const p = fetchDataRef.current?.({ pageNum: 0 })
        const after = () => {
          if (page === 0 && !document.hidden) {
            intervalRef.current = setTimeout(tick, 3000)
          } else if (page === 0) {
            intervalRef.current = setTimeout(tick, 30000)
          }
          if (isMarketOpen() && Date.now() - lastSuccessRef.current > 15000) {
            setPollError("No updates for 15s — checking connection")
          }
        }
        if (p && typeof (p as Promise<void>).finally === "function") {
          (p as Promise<void>).finally(after)
        } else {
          after()
        }
      } else {
        // Hidden — reschedule on a slow cadence so loop survives until visible.
        intervalRef.current = setTimeout(tick, 30000)
      }
    }

    // Wake handler — runs on visibilitychange, focus, pageshow (bfcache return),
    // online, and first user interaction (pointerdown/keydown). Belt + suspenders
    // because no single event reliably fires across all browser/freeze states.
    const wake = () => {
      if (document.visibilityState !== "visible") return
      // Only force-fetch if we're actually stale — avoids a thundering herd of
      // duplicate requests when multiple wake events fire in quick succession.
      const stale = Date.now() - lastSuccessRef.current > 5000
      if (intervalRef.current) clearTimeout(intervalRef.current as ReturnType<typeof setTimeout>)
      if (stale) fetchDataRef.current?.({ pageNum: 0 })
      intervalRef.current = setTimeout(tick, stale ? 3000 : 1000)
    }

    intervalRef.current = setTimeout(tick, 3000)
    document.addEventListener("visibilitychange", wake)
    window.addEventListener("focus", wake)
    window.addEventListener("pageshow", wake)
    window.addEventListener("online", wake)
    window.addEventListener("pointerdown", wake, { passive: true })
    window.addEventListener("keydown", wake)
    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current as ReturnType<typeof setTimeout>)
      document.removeEventListener("visibilitychange", wake)
      window.removeEventListener("focus", wake)
      window.removeEventListener("pageshow", wake)
      window.removeEventListener("online", wake)
      window.removeEventListener("pointerdown", wake)
      window.removeEventListener("keydown", wake)
    }
  }, [page, topicId])

  // active filter count
  useEffect(() => {
    let c = 0
    if (timeRange !== "today") c++
    if (filterGrade) c++
    if (filterType) c++
    if (filterOptType) c++
    if (filterMinPremium !== "") c++
    if (filterMinContracts > 0) c++
    if (filterMinVolOi > 0) c++
    if (filterDte) c++
    if (filterSide) c++
    if (filterUnusualOnly) c++
    if (filterNoIndex) c++
    if (filterCuratedOnly) c++
    if (filterExcludeMidpoint) c++
    if (filterExcludeMultiLeg) c++
    setActiveFilterCount(c)
  }, [timeRange, filterGrade, filterType, filterOptType, filterMinPremium, filterMinContracts, filterMinVolOi, filterDte, filterSide, filterUnusualOnly, filterNoIndex, filterCuratedOnly, filterExcludeMidpoint, filterExcludeMultiLeg])

  // Persist curated-only toggle to localStorage on change.
  useEffect(() => {
    if (typeof window === "undefined") return
    try { window.localStorage.setItem("pb_curated_grades", filterCuratedOnly ? "1" : "0") }
    catch { /* localStorage unavailable */ }
  }, [filterCuratedOnly])

  // Persist exclude_midpoint + exclude_multi_leg toggles to localStorage.
  useEffect(() => {
    if (typeof window === "undefined") return
    try { window.localStorage.setItem("pb_exclude_midpoint", filterExcludeMidpoint ? "1" : "0") }
    catch { /* localStorage unavailable */ }
  }, [filterExcludeMidpoint])
  useEffect(() => {
    if (typeof window === "undefined") return
    try { window.localStorage.setItem("pb_exclude_multi_leg", filterExcludeMultiLeg ? "1" : "0") }
    catch { /* localStorage unavailable */ }
  }, [filterExcludeMultiLeg])

  const matchesFilter = useCallback((t: Trade) => {
    if (search && !t.symbol.toLowerCase().includes(search.toLowerCase())) return false
    if (focusTicker && t.symbol !== focusTicker) return false
    if (focusStrike && String(t.strike) !== focusStrike) return false
    if (focusExpiry && t.expiration !== focusExpiry) return false
    if (filterGrade && t.grade !== filterGrade) return false
    if (filterType && t.flow_type !== filterType) return false
    if (filterOptType && t.opt_type !== filterOptType) return false
    if (filterSide && t.aggression !== filterSide) return false
    // Industry-standard "Unusual Volume" filter — uses 20d baseline, not raw vol_oi
    if (filterUnusualOnly && (t.contract_volume_multiple ?? 0) < 1.5) return false
    if (filterNoIndex && ["SPX","SPXW","NDXP","NDX","RUT","RUTW"].includes(t.symbol)) return false
    if (filterDte === "0dte" && (t.dte ?? -1) !== 0) return false
    if (filterDte === "1-7" && ((t.dte ?? -1) < 1 || (t.dte ?? -1) > 7)) return false
    if (filterDte === "8-30" && ((t.dte ?? -1) < 8 || (t.dte ?? -1) > 30)) return false
    if (filterDte === "30+" && (t.dte ?? -1) < 30) return false
    if (filterMinContracts > 0 && (t.contracts ?? 0) < filterMinContracts) return false
    if (filterMinVolOi > 0 && ((t.vol_oi ?? 0) * 10) < filterMinVolOi) return false
    // exclude_side / exclude_multi_leg — client-side mirror of the backend
    // f182f0a predicates. Backend's snapshot already filters these out, but
    // sse_scanner.py live row pushes don't apply the predicates yet — this
    // catches the gap so the toggle state is visually consistent regardless
    // of which delivery path a row arrived on. Aligned with aggrLabel logic
    // (page.tsx:304): null/NEUTRAL/MIDPOINT all map to the "Mid" display.
    if (filterExcludeMidpoint) {
      const a = t.aggression
      if (!a || a === "NEUTRAL" || a === "MIDPOINT") return false
    }
    if (filterExcludeMultiLeg) {
      if (t.structure && t.structure !== "SINGLE_LEG") return false
      if (t.badges?.some(b => b.label === "MULTI-LEG")) return false
    }
    return true
  }, [search, focusTicker, focusStrike, focusExpiry, filterGrade, filterType, filterOptType, filterSide, filterUnusualOnly, filterNoIndex, filterDte, filterMinContracts, filterMinVolOi, filterExcludeMidpoint, filterExcludeMultiLeg])

  // Ref so fetchData doesn't rebind on filter changes
  const matchesFilterRef = useRef(matchesFilter)
  useEffect(() => { matchesFilterRef.current = matchesFilter }, [matchesFilter])

  const filtered = useMemo(() => trades.filter(matchesFilter), [trades, matchesFilter])

  // Single-pass aggregation — replaces the 4 separate filter+reduce calls that
  // ran on every render (every 3s). With ~10K filtered rows and unmemoized
  // derived values upstream, the reductions alone showed up as a recurring
  // long task in DevTools Performance every poll cycle.
  // Bug 3 fix (2026-05-11) — range-agg snapshot for non-today stat strip.
  // Backend /api/scanner/range-agg returns aggregates computed over the
  // FULL range (not the paginated row slice), so stat-strip P/C / call $
  // / put $ stop wobbling when subscribers paginate Month/Week. Today
  // range keeps the client-side reduction since the 20000-row buffer
  // IS the full set. See project_pb_scanner_time_range_investigation.md
  // §Bug 3 for the full investigation.
  const [rangeAgg, setRangeAgg] = useState<{
    sentiment: { label: string; score: number; _sort_score: number }
    pcr: number | null
    call_flow: { premium: string; count: number; _sort_premium: number }
    put_flow: { premium: string; count: number; _sort_premium: number }
    raw: {
      bull_vol: number; bear_vol: number
      call_prem: number; put_prem: number
      call_vol: number; put_vol: number
      call_n: number; put_n: number
    }
  } | null>(null)

  // Refetch range-agg whenever range or filter state changes. Today range
  // clears the cached agg so a stale Month snapshot doesn't leak through
  // when the user toggles back. Debounced 200ms so rapid filter clicks
  // coalesce into one request; cache TTL on the server is 15s so
  // pagination spam during the same range/filter combo lands on hot
  // cache. Silent on failure — stat strip falls back to client-side
  // reduction via the bifurcation below.
  useEffect(() => {
    if (timeRange === "today") {
      setRangeAgg(null)
      return
    }
    const handle = setTimeout(() => {
      const p = new URLSearchParams()
      p.set("range", timeRange)
      if (filterMinPremium !== "") p.set("min_premium", filterMinPremium)
      p.set("grades", filterCuratedOnly ? "A,B" : "A,B,PASS")
      fetch(`/api/scanner/range-agg?${p.toString()}`, { credentials: "include" })
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data && !data.error && data.raw) setRangeAgg(data)
        })
        .catch(() => {/* silent — fall back to client-side reduction */})
    }, 200)
    return () => clearTimeout(handle)
  }, [timeRange, filterMinPremium, filterCuratedOnly])

  const aggregates = useMemo(() => {
    // Bifurcation (2026-05-11, Bug 3): non-today ranges read range-wide
    // aggregates from the server so paginating doesn't shift the strip.
    // Today + (no-rangeAgg-yet || fetch failed) → client-side reduction.
    if (timeRange !== "today" && rangeAgg?.raw) {
      return {
        callCount: rangeAgg.raw.call_n,
        putCount:  rangeAgg.raw.put_n,
        callPrem:  rangeAgg.raw.call_prem,
        putPrem:   rangeAgg.raw.put_prem,
      }
    }
    let callCount = 0, putCount = 0, callPrem = 0, putPrem = 0
    for (const t of filtered) {
      if (t.opt_type === "C") { callCount++; callPrem += t.premium }
      else if (t.opt_type === "P") { putCount++; putPrem += t.premium }
    }
    return { callCount, putCount, callPrem, putPrem }
  }, [filtered, timeRange, rangeAgg])
  const callPrem = aggregates.callPrem
  const putPrem = aggregates.putPrem
  const calls = aggregates.callCount  // count, not array — only .length was ever used
  const puts = aggregates.putCount

  // Client-side pagination for "today" — all data already loaded, just slice for display
  const CLIENT_PAGE_SIZE = 200
  const [clientPage, setClientPage] = useState(0)
  const totalClientPages = Math.max(1, Math.ceil(filtered.length / CLIENT_PAGE_SIZE))
  const pageRows = timeRange === "today"
    ? filtered.slice(clientPage * CLIENT_PAGE_SIZE, (clientPage + 1) * CLIENT_PAGE_SIZE)
    : filtered
  // Reset client page when filters change
  useEffect(() => { setClientPage(0) }, [search, focusTicker, focusStrike, focusExpiry, filterGrade, filterType, filterOptType, filterSide, filterUnusualOnly, filterNoIndex, filterDte, filterMinContracts, filterMinVolOi])

  const rowVirtualizer = useVirtualizer({
    count: pageRows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 44,
    overscan: 50,
    getItemKey: (index) => pageRows[index]?.id ?? index,
  })

  // (Previously called rowVirtualizer.measure() on every pageRows change. That
  // forced a full remeasurement every 3s poll — the dominant client-side jank.
  // The virtualizer already invalidates when count or getItemKey changes, so
  // rows mounted via measureElement get re-measured naturally on identity change
  // without a global re-measure cycle.)

  const hasLocalFilter = !!(search || focusTicker || filterGrade || filterType || filterOptType || filterSide || filterUnusualOnly || filterNoIndex || filterDte)
  // Memoized + single-pass — was 4 chained filter+reduce passes running on
  // every render. Recomputes only when filtered identity changes.
  const displayStats = useMemo(() => {
    // Stage 2 (2026-05-08): volume-weighted sentiment + PCR. The label,
    // gauge, and PC ratio all derive from contract counts, not premium
    // dollars — matches _compute_global_agg / _compute_feed_agg on the
    // server. Industry convention; what subscribers from Cheddar /
    // Unusual Whales expect "Bullish" and "PCR" to mean. 0.65/0.35
    // cutoffs preserved from the premium-weighted era.
    //
    // Bug 3 bifurcation (2026-05-11): non-today ranges source bull/bear
    // contract volume + PCR from the server-side range-agg so the strip
    // is stable across pagination. Today range keeps the client-side
    // reduction since the 20000-row buffer IS the full set. count stays
    // = filtered.length intentionally — that label reflects what's on
    // screen ("1,234 signals" maps to the rendered row count, not the
    // range total).
    if (timeRange !== "today" && rangeAgg?.raw) {
      const score = rangeAgg.sentiment.score
      return {
        count: filtered.length,
        bull: rangeAgg.raw.bull_vol,
        bear: rangeAgg.raw.bear_vol,
        lean: score >= 0.65 ? "BULL" : score <= 0.35 ? "BEAR" : "MIXED",
        pc_ratio: rangeAgg.pcr ?? 0,
      }
    }
    let cv = 0, pv = 0, bullVol = 0, bearVol = 0
    for (const t of filtered) {
      const qty = t.contracts || 0
      if (t.opt_type === "C") cv += qty
      else if (t.opt_type === "P") pv += qty
      if (t.bullish) bullVol += qty
      else bearVol += qty
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
  }, [filtered, timeRange, rangeAgg])

  const iconCls = "w-[22px] h-[22px]"
  const sideBtn = (active: boolean) => `w-14 h-14 flex flex-col items-center justify-center gap-0.5 rounded-xl transition-all cursor-pointer ${active ? "bg-white/[0.1] text-white" : "text-white/40 hover:text-white/80 hover:bg-white/[0.06]"}`
  const sideCircle = (active: boolean) => `w-10 h-10 flex items-center justify-center rounded-full transition-all cursor-pointer ${active ? "bg-white/[0.14] text-white" : "bg-white/[0.05] text-white/45 hover:text-white/90 hover:bg-white/[0.1]"}`

  return (
    <div className="h-screen flex text-[#E8EDF5] overflow-hidden" style={{ background: '#1C1C1E', fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}>
      {pollError && (
        <div role="status" aria-live="polite" className="fixed top-2 right-2 z-50 px-3 py-1.5 rounded text-xs font-medium text-white shadow-lg" style={{ background: "rgba(217,119,6,0.92)" }}>
          {pollError}
        </div>
      )}

      {/* ── SIDEBAR ── */}
      <nav className="fixed left-0 top-0 h-full w-[68px] flex flex-col items-center py-4 gap-2 z-40" style={{ background: '#23222D', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
        {/* Logo */}
        <Link href="/" className="mb-3 flex items-center justify-center" aria-label="Home">
          <img src="/images/pb-logo.png" alt="Profit Builders" width={32} height={32} className="w-8 h-8 object-contain" />
        </Link>

        {/* Main nav */}
        <button onClick={() => setActivePage("scanner")} className={sideBtn(activePage === "scanner")} title="Flow Scanner">
          <svg className={iconCls} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5V19a1 1 0 001 1h4V13.5M3 13.5V10a1 1 0 011-1h4a1 1 0 011 1v3.5M3 13.5h6M9 13.5V19h4V9.5M9 13.5h4M13 13.5V6a1 1 0 011-1h4a1 1 0 011 1v13h-4V13.5M13 13.5h6" /></svg>
          <span className="text-[10px] font-medium tracking-wider text-white/50">Flow</span>
        </button>
        <button
          onClick={() => canAccessGamma ? setActivePage("heatmap") : setShowUpgradeModal(true)}
          className={`${sideBtn(activePage === "heatmap")} relative`}
          title={canAccessGamma ? "GEX Heatmap" : "Upgrade for GEX"}
        >
          <svg className={iconCls} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.6}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
          <span className="text-[10px] font-medium tracking-wider text-white/50">GEX</span>
          {<span className="absolute -top-0.5 -right-0.5 text-[8px] font-bold text-[#48DEFF] bg-[#48DEFF]/20 px-1.5 py-0.5 rounded-md">NEW</span>}
        </button>
        <button onClick={() => setActivePage("watchlist")} className={sideBtn(activePage === "watchlist")} title="Watchlist">
          <svg className={iconCls} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>
          <span className="text-[10px] font-medium tracking-wider text-white/50">Watch</span>
        </button>

        <div className="w-6 h-px bg-white/[0.06] my-1" />

        {/* Filters */}
        <button onClick={() => setShowFilters(true)} className={sideBtn(showFilters)} title="Filters">
          <svg className={iconCls} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.6}><path strokeLinecap="round" d="M3 4h18M6 8h12M9 12h6" /></svg>
          <span className="text-[10px] font-medium tracking-wider text-white/50">Filters</span>
        </button>

        {/* Market status — pinned to bottom */}
        <div className="mt-auto flex flex-col items-center gap-1 pt-3 pb-2 w-full border-t border-white/[0.06]" title={marketOpen ? "Market open" : "Market closed"}>
          <style>{`@keyframes pb-ping { 75%, 100% { transform: scale(2); opacity: 0; } } .pb-dot-ping { animation: pb-ping 1.5s cubic-bezier(0,0,0.2,1) infinite; }`}</style>
          <div style={{ position: "relative", width: 8, height: 8 }}>
            <div className={marketOpen ? "pb-dot-ping" : ""} style={{ position: "absolute", inset: 0, borderRadius: "50%", background: marketOpen ? "#22c55e" : "#ef4444", opacity: 0.4 }} />
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: marketOpen ? "#22c55e" : "#ef4444" }} />
          </div>
          <span style={{ fontSize: 8, fontFamily: "monospace", letterSpacing: "0.12em", textTransform: "uppercase", color: marketOpen ? "rgba(34,197,94,0.6)" : "rgba(255,255,255,0.25)" }}>
            {marketOpen ? "OPEN" : "CLOSED"}
          </span>
        </div>

        {/* Bottom circle buttons */}
        <div className="flex flex-col items-center gap-2">
          <button onClick={toggleSound} className={sideCircle(soundEnabled)} title={soundEnabled ? "Sound on" : "Sound off"}>
            {soundEnabled ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" /></svg>
            )}
          </button>
          <a href="/account" className={sideCircle(false)} title="Account">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
          </a>
        </div>
      </nav>

      {/* ── MAIN CONTENT ── */}
      <div className="ml-[68px] flex flex-col h-screen overflow-hidden flex-1">
      <TrialBanner />

      {activePage === "heatmap" ? ((() => {
  // GEX_SYMBOLS hoisted to module scope so CommandPalette mount can use it.
  const netGex = gexData ? gexData.strikes.reduce((sum: number, strike: number) => {
    const sk = strike === Math.floor(strike) ? String(Math.floor(strike)) : String(strike)
    const row = gexData.matrix[sk] || {}
    return sum + Object.values(row).reduce((rs: number, c: { net_gex: number }) => rs + c.net_gex, 0)
  }, 0) : 0
  const todayStr = new Date().toISOString().slice(0, 10)
  const fmtExp = (exp: string) => { const p = exp.split("-"); return p.length === 3 ? `${p[1]}/${p[2]}` : exp }

  const strikeTotals = gexData ? [...gexData.strikes].reverse().map(strike => {
    const sk = strike === Math.floor(strike) ? String(Math.floor(strike)) : String(strike)
    const row = gexData.matrix[sk] || {}
    return { strike, total: Object.values(row).reduce((s: number, c: { net_gex: number }) => s + c.net_gex, 0) }
  }) : []
  const maxStrikeTotal = Math.max(...strikeTotals.map(s => Math.abs(s.total)), 1)

  const callWall = gexData ? strikeTotals.filter(s => s.total > 0 && s.strike > gexData.spot).sort((a, b) => b.total - a.total)[0] : null
  const putWall = gexData ? strikeTotals.filter(s => s.total > 0 && s.strike < gexData.spot).sort((a, b) => b.total - a.total)[0] : null

  return (
  <div className="flex-1 flex flex-col overflow-hidden" style={{ background: "#0B0F14" }}>

    {/* SpotGamma-style header: instrument bar + metrics + chip strip */}
    {(() => {
      const SYMBOL_NAMES_INLINE: Record<string, string> = {
        SPY: "State Street SPDR S&P 500 ETF Trust", QQQ: "Invesco QQQ Trust",
        AAPL: "Apple Inc.", TSLA: "Tesla, Inc.", NVDA: "NVIDIA Corporation",
        META: "Meta Platforms, Inc.", MSFT: "Microsoft Corporation",
        AMZN: "Amazon.com, Inc.", GOOGL: "Alphabet Inc.",
        AMD: "Advanced Micro Devices, Inc.", MU: "Micron Technology, Inc.",
        COIN: "Coinbase Global, Inc.", PLTR: "Palantir Technologies Inc.",
        NFLX: "Netflix, Inc.", CRM: "Salesforce, Inc.", BA: "The Boeing Company",
        JPM: "JPMorgan Chase & Co.", GS: "Goldman Sachs Group, Inc.",
        XOM: "Exxon Mobil Corporation", GLD: "SPDR Gold Trust",
      }
      const fmtGexLocal = (v: number) => {
        const abs = Math.abs(v), sign = v < 0 ? "-" : ""
        if (abs >= 1e12) return `${sign}$${(abs / 1e12).toFixed(2)}T`
        if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(2)}B`
        if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(1)}M`
        if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(0)}K`
        return `${sign}$${abs.toFixed(0)}`
      }
      const fmtCellLocal = (v: number) => {
        const abs = Math.abs(v), sign = v < 0 ? "-" : ""
        if (abs >= 1e12) return `${sign}${(abs / 1e12).toFixed(2)}T`
        if (abs >= 1e9) return `${sign}${(abs / 1e9).toFixed(1)}B`
        if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(1)}M`
        if (abs >= 1e3) return `${sign}${(abs / 1e3).toFixed(1)}K`
        return `${sign}${abs.toFixed(0)}`
      }
      const fmtExpShort = (exp: string) => {
        const p = exp.split("-")
        if (p.length !== 3) return exp
        const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"]
        return `${months[parseInt(p[1]) - 1]} ${p[2]}`
      }
      const effSpot = liveGexSpot ?? gexData?.spot ?? 0
      return (
        <>
          {/* Instrument bar */}
          <div className="flex items-center px-5 py-2.5 gap-3 border-b border-white/[0.06] flex-shrink-0" style={{ background: "#10141B" }}>
            <div className="flex items-baseline gap-2 min-w-0">
              <span className="text-[14px] font-semibold text-white tracking-tight truncate">{SYMBOL_NAMES_INLINE[gexSymbol] || gexSymbol}</span>
              <span className="text-[9px] uppercase tracking-[0.18em] text-white/30 whitespace-nowrap">Gamma Exposure</span>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/60 px-2.5 py-1 rounded bg-white/[0.03] border border-white/[0.08]">Gamma</span>
              <button
                onClick={() => setPaletteOpen(true)}
                className="flex items-center gap-2 text-[11px] text-white/40 hover:text-white px-2.5 py-1 rounded border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] transition-colors"
                aria-label="Open search"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>
                </svg>
                <span className="hidden sm:inline">to search</span>
                <kbd className="font-mono text-[9px] px-1 py-0.5 rounded bg-black/40 border border-white/[0.08]">S</kbd>
              </button>
              <select value={gexSymbol} onChange={e => setGexSymbol(e.target.value)}
                className="sm:hidden bg-transparent border border-white/[0.1] text-white text-[11px] rounded px-2 py-1 font-semibold cursor-pointer focus:outline-none">
                {GEX_SYMBOLS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Metrics row */}
          {gexData && (
            <div className="flex items-center px-5 py-2.5 gap-x-9 gap-y-1 border-b border-white/[0.06] flex-shrink-0 overflow-x-auto flex-wrap" style={{ background: "#0B0F14" }}>
              <div className="flex flex-col gap-0.5 min-w-[110px]">
                <div className="flex items-baseline gap-2">
                  <span className="text-[19px] font-mono tabular-nums font-bold text-white leading-none">${effSpot.toFixed(2)}</span>
                  {liveGexSpot !== null && (
                    <span className="inline-flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-[#22C55E] animate-pulse" />
                      <span className="text-[8px] font-bold tracking-[0.12em] text-[#22C55E]">LIVE</span>
                    </span>
                  )}
                </div>
                {(() => {
                  const prev = gexData.prev_close ?? gexData.spot
                  if (!prev) return null
                  const delta = effSpot - prev
                  const pct = (delta / prev) * 100
                  if (Math.abs(delta) < 0.005) return <span className="text-[11px] font-mono tabular-nums text-white/30">unchanged</span>
                  const positive = delta > 0
                  return (
                    <span className={`text-[11px] font-mono tabular-nums ${positive ? "text-[#22C55E]" : "text-[#FF605D]"}`}>
                      {positive ? "↗" : "↘"} {positive ? "+" : ""}{delta.toFixed(2)} · {positive ? "+" : ""}{pct.toFixed(2)}%
                    </span>
                  )
                })()}
              </div>
              {[
                { label: "Gamma Flip", value: gexData.gamma_flip != null ? `$${gexData.gamma_flip.toFixed(2)}` : "N/A", cls: gexData.gamma_flip != null ? "text-[#F5820A]" : "text-white/30" },
                { label: "Total Net GEX", value: fmtGexLocal(gexData.total_net_gex), cls: gexData.total_net_gex >= 0 ? "text-[#22C55E]" : "text-[#FF605D]" },
                { label: "Gamma Slope", value: gexData.gamma_slope != null ? fmtGexLocal(gexData.gamma_slope) : "N/A", cls: gexData.gamma_slope != null ? "text-white" : "text-white/30" },
                { label: "Slope Strike", value: gexData.slope_strike != null ? `$${gexData.slope_strike.toFixed(2)}` : "N/A", cls: gexData.slope_strike != null ? "text-white" : "text-white/30" },
                { label: "Max +GEX", value: gexData.max_plus_gex ? fmtGexLocal(gexData.max_plus_gex.gex) : "N/A", cls: gexData.max_plus_gex ? "text-[#22C55E]" : "text-white/30", sub: gexData.max_plus_gex ? `@ $${gexData.max_plus_gex.strike.toFixed(2)}` : undefined },
                { label: "Max -GEX", value: gexData.max_minus_gex ? fmtGexLocal(gexData.max_minus_gex.gex) : "N/A", cls: gexData.max_minus_gex ? "text-[#FF605D]" : "text-white/30", sub: gexData.max_minus_gex ? `@ $${gexData.max_minus_gex.strike.toFixed(2)}` : undefined },
              ].map(s => (
                <div key={s.label} className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-[9px] uppercase tracking-[0.14em] text-white/40 whitespace-nowrap">{s.label}</span>
                  <span className={`text-[13px] font-mono tabular-nums font-semibold leading-tight whitespace-nowrap ${s.cls}`}>{s.value}</span>
                  {s.sub && <span className="text-[10px] font-mono tabular-nums text-white/40 whitespace-nowrap">{s.sub}</span>}
                </div>
              ))}
            </div>
          )}

          {/* Total Net GEX breakout — call vs put, near vs far DTE */}
          {gexData && (
            <div className="flex items-center px-5 py-2 gap-3 border-b border-white/[0.04] flex-shrink-0 overflow-x-auto" style={{ background: "#0B0F14" }}>
              <span className="text-[10px] uppercase tracking-[0.14em] text-white/40 whitespace-nowrap">Composition</span>
              <div className="w-px h-3 bg-white/[0.06]" />
              {[
                { label: "CALL γ", value: gexData.total_call_gex, color: "#22C55E" },
                { label: "PUT γ", value: gexData.total_put_gex, color: "#FF605D" },
                { label: "Near DTE", value: gexData.near_dte_gex, color: gexData.near_dte_gex >= 0 ? "#22C55E" : "#FF605D", note: "≤7d" },
                { label: "Far DTE", value: gexData.far_dte_gex, color: gexData.far_dte_gex >= 0 ? "#22C55E" : "#FF605D", note: ">7d" },
              ].map(b => (
                <div key={b.label} className="flex items-baseline gap-1.5 px-2 py-0.5 rounded text-[10px] whitespace-nowrap border border-white/[0.05] bg-white/[0.02]">
                  <span className="font-bold tracking-[0.08em] uppercase text-white/60">{b.label}</span>
                  {b.note && <span className="font-mono text-white/30 text-[9px]">{b.note}</span>}
                  <span className="font-mono font-bold tabular-nums" style={{ color: b.color }}>
                    {fmtGexLocal(b.value)}
                  </span>
                </div>
              ))}
              {(() => {
                // Bias indicator: which side of the gamma book dominates.
                const bias = gexData.total_call_gex + gexData.total_put_gex
                const dominantSide = Math.abs(gexData.total_call_gex) > Math.abs(gexData.total_put_gex) ? "CALL" : "PUT"
                const positive = bias >= 0
                return (
                  <div className="ml-auto flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] whitespace-nowrap border border-white/[0.05]" style={{ background: positive ? "rgba(0,232,90,0.05)" : "rgba(255,96,93,0.05)" }}>
                    <span className="font-bold tracking-[0.08em] uppercase text-white/40">Bias</span>
                    <span className="font-mono font-bold tabular-nums" style={{ color: positive ? "#22C55E" : "#FF605D" }}>
                      {positive ? "+" : ""}{fmtGexLocal(bias)} · {dominantSide}-led
                    </span>
                  </div>
                )
              })()}
            </div>
          )}

          {/* Chip strip */}
          {gexData && gexData.top_cells && gexData.top_cells.length > 0 && (
            <div className="flex items-center px-5 py-2 gap-3 border-b border-white/[0.06] flex-shrink-0 overflow-x-auto" style={{ background: "#0B0F14" }}>
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60 whitespace-nowrap">Net GEX Heatmap</span>
              <InfoTooltip content={<span>Net dollar gamma exposure per share-price move. Strike rows show wall structure; expiry columns reveal time decay. Spot row tinted in blue. Cells with a dashed amber top-border are OI-based estimates (live greeks unavailable, typically after-hours).</span>}>
                <span className="text-[10px] text-white/40 cursor-help hover:text-white">ⓘ</span>
              </InfoTooltip>
              {(() => {
                // Aggregate fallback indicator — when >50% of cells lack live
                // greeks, surface an "estimate" pill so the user doesn't read
                // synthetic numbers as Polygon greeks. Cheap O(n) scan; matrix
                // is small (~50 strikes × 10 expiries).
                let total = 0, missing = 0
                for (const sk of Object.keys(gexData.matrix)) {
                  for (const exp of Object.keys(gexData.matrix[sk])) {
                    total++
                    if (gexData.matrix[sk][exp].has_greeks === false) missing++
                  }
                }
                if (total === 0 || missing / total < 0.5) return null
                return (
                  <InfoTooltip content={<span>Polygon greeks unavailable for &gt;50% of cells (typical after market hours). Values shown are OI-weighted Gaussian estimates centered on ATM. Wall direction is robust; magnitudes are approximate. Live greeks resume at 9:30 AM ET.</span>}>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-[0.1em] uppercase border border-amber-500/40 text-amber-400 bg-amber-500/[0.08] cursor-help">Estimated</span>
                  </InfoTooltip>
                )
              })()}
              <div className="w-px h-3 bg-white/[0.08]" />
              {gexData.top_cells.map(c => {
                const positive = c.net_gex > 0
                return (
                  <div key={`${c.strike}-${c.expiry}`}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono tabular-nums whitespace-nowrap border ${positive ? "bg-[#22C55E]/[0.06] border-[#22C55E]/25 text-[#22C55E]" : "bg-[#FF605D]/[0.06] border-[#FF605D]/25 text-[#FF605D]"}`}>
                    <span className="font-semibold">{gexSymbol} {c.strike} {fmtExpShort(c.expiry)}</span>
                    <span className="opacity-70">·</span>
                    <span className="font-bold">{positive ? "+" : ""}{fmtCellLocal(c.net_gex)}</span>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )
    })()}

    <div className="flex-1 flex overflow-hidden">

      <div className="flex-1 overflow-auto">
        {gexLoading ? (
          <div className="flex items-center justify-center h-full text-white/20 text-sm">Loading...</div>
        ) : gexError ? (
          <div className="flex items-center justify-center h-full text-[#FF605D] text-sm">{gexError}</div>
        ) : gexData ? (
          <div style={{ display: "grid", gridTemplateColumns: `90px repeat(${gexData.expirations.length}, 1fr) 72px` }}>
            <div className="sticky top-0 z-10 px-2 py-1 text-[9px] font-semibold text-white/30 tracking-[0.1em] uppercase border-r border-b border-white/[0.04]" style={{ background: "#0B0F14" }}>Strike</div>
            {gexData.expirations.map((exp: string) => {
              const isToday = exp === todayStr
              return (
                <div key={exp} className="sticky top-0 z-10 px-1 py-1 text-center border-r border-b border-white/[0.04]" style={{ background: "#0B0F14" }}>
                  <div className={`text-[9px] font-semibold tracking-wider ${isToday ? "text-[#FF8A00]" : "text-white/30"}`}>
                    {isToday ? "TODAY" : fmtExp(exp)}
                  </div>
                </div>
              )
            })}
            <div className="sticky top-0 z-10 px-2 py-1 text-right text-[9px] font-semibold text-white/30 tracking-[0.1em] uppercase border-b border-white/[0.04]" style={{ background: "#0B0F14", borderLeft: "1px solid rgba(255,255,255,0.06)" }}>Total</div>

            {(() => {
              const strikes = [...gexData.strikes].reverse()
              const atmStrike = strikes.reduce((best: number, s: number) => Math.abs(s - gexData.spot) < Math.abs(best - gexData.spot) ? s : best, strikes[0])
              const zgStrike = gexData.zero_gamma_strike != null ? strikes.reduce((best: number, s: number) => Math.abs(s - gexData.zero_gamma_strike!) < Math.abs(best - gexData.zero_gamma_strike!) ? s : best, strikes[0]) : null
              return strikes.map((strike: number) => {
                const sk = strike === Math.floor(strike) ? String(Math.floor(strike)) : String(strike)
                const row = gexData.matrix[sk] || {}
                const rowTotal = Object.values(row).reduce((s: number, c: { net_gex: number }) => s + c.net_gex, 0)
                const isAtm = strike === atmStrike
                const isZg = strike === zgStrike
                return [
                  <div key={`s-${strike}`} className="px-2 flex items-center gap-1 border-r border-b border-white/[0.04]"
                    style={{ minHeight: 24, background: isAtm ? "rgba(255,255,255,0.035)" : "transparent", position: "sticky", left: 0, zIndex: 5,
                    ...(isAtm ? { borderLeft: "2px solid rgba(255,255,255,0.5)" } : isZg ? { borderLeft: "2px solid #a855f7" } : {}) }}>
                    {isAtm && <span className="text-[8px] font-bold text-white/60">SPT</span>}
                    {isZg && !isAtm && <span className="text-[8px] font-bold text-[#a855f7]/70">ZG</span>}
                    <span className={`text-[11px] font-mono font-medium ${isAtm ? "text-white" : isZg ? "text-[#a855f7]" : "text-white/40"}`}>{strike}</span>
                  </div>,

                  ...gexData.expirations.map((exp: string) => {
                    const cell = row[exp]
                    const gex = cell?.net_gex ?? 0
                    const callOi = cell?.call_oi ?? 0
                    const putOi = cell?.put_oi ?? 0
                    const intensity = gexData.max_abs_gex > 0 ? Math.min(0.8, 0.06 + 0.74 * Math.abs(gex) / gexData.max_abs_gex) : 0
                    const bg = gex === 0 ? "transparent" : gex > 0 ? `rgba(0,232,90,${intensity})` : `rgba(255,96,93,${intensity})`
                    // Synthetic-greeks marker: when has_greeks is explicitly false,
                    // the cell value comes from the OI-based Gaussian fallback. Mark
                    // these visually so users know which numbers are real Polygon
                    // greeks vs estimates. Subtle dashed top-border keeps the grid
                    // legible while flagging the cells honestly.
                    const isFallback = cell?.has_greeks === false
                    return (
                      <div key={`${strike}-${exp}`}
                        className={`border-r border-b border-white/[0.04] flex items-center justify-center relative ${isFallback ? "opacity-75" : ""}`}
                        style={{ background: isAtm && gex === 0 ? "rgba(255,255,255,0.025)" : bg, minHeight: 24, ...(isFallback ? { borderTop: "1px dashed rgba(245,130,10,0.35)" } : {}) }}
                        title={`${strike} × ${exp}\nGEX: ${fmtGex(gex)}${isFallback ? " (estimate — no live greeks)" : ""}\nCall OI: ${callOi.toLocaleString()}\nPut OI: ${putOi.toLocaleString()}`}>
                        {gex !== 0 && (
                          <span className={`text-[10px] font-mono font-medium ${intensity > 0.35 ? "text-white" : gex > 0 ? "text-[#22C55E]/80" : "text-[#FF605D]/80"}`}>
                            {fmtGex(gex)}
                          </span>
                        )}
                      </div>
                    )
                  }),

                  <div key={`t-${strike}`} className="px-2 flex items-center justify-end border-b border-white/[0.04]"
                    style={{ minHeight: 24, borderLeft: "1px solid rgba(255,255,255,0.06)", ...(isAtm ? { background: "rgba(255,255,255,0.035)" } : {}) }}>
                    <span className={`text-[11px] font-mono font-semibold ${rowTotal >= 0 ? "text-[#22C55E]" : "text-[#FF605D]"}`}>
                      {rowTotal !== 0 ? fmtGex(rowTotal) : ""}
                    </span>
                  </div>,
                ]
              })
            })()}
          </div>
        ) : null}
      </div>

      {gexData && (
        <div className="w-[120px] border-l border-white/[0.06] overflow-y-auto flex-shrink-0" style={{ background: "#0B0F14" }}>
          <div className="sticky top-0 z-10 px-2 py-1 text-[9px] font-semibold text-white/20 tracking-wider uppercase text-center border-b border-white/[0.04]" style={{ background: "#0B0F14" }}>
            Profile
          </div>
          {strikeTotals.map(({ strike, total }) => {
            const isAtm = gexData && Math.abs(strike - gexData.spot) <= (gexData.strikes.length > 1 ? Math.abs(gexData.strikes[1] - gexData.strikes[0]) / 2 : 1)
            const barPct = Math.min(Math.abs(total) / maxStrikeTotal * 100, 100)
            const isPos = total >= 0
            return (
              <div key={`gp-${strike}`} className="relative border-b border-white/[0.04]" style={{ minHeight: 24, background: isAtm ? "rgba(255,255,255,0.025)" : "transparent" }}>
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/[0.04]" />
                {total !== 0 && (
                  <div className="absolute top-[4px] bottom-[4px]" style={{
                    [isPos ? "left" : "right"]: "50%",
                    width: `${Math.max(barPct * 0.48, 2)}%`,
                    background: isPos ? "rgba(0,232,90,0.3)" : "rgba(255,96,93,0.3)",
                    borderRadius: isPos ? "0 2px 2px 0" : "2px 0 0 2px",
                  }} />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>

    {/* Replay scrubber — locked progress until ≥3 sessions of snapshots */}
    <ReplayProgress symbol={gexSymbol} />
  </div>
  )
})()            ) : activePage === "watchlist" ? (
        <div className="flex-1 flex flex-col overflow-hidden" style={{ background: "#1A1A22" }}>
          {/* Compact TradingView-style watchlist header */}
          <div className="px-4 py-2.5 border-b border-[#2D2C38] flex items-center gap-3 flex-shrink-0" style={{ background: "#212029" }}>
            <div className="text-[9px] font-bold text-[#4A5A72] tracking-[0.18em] uppercase">Watchlist</div>
            <div className="text-[10px] text-[#3D4D63] font-mono tabular-nums">{watchlist.length}</div>
            <div className="ml-auto flex items-center gap-2">
              <input
                placeholder="Add ticker — paste list ok"
                value={wlInput}
                onChange={e => setWlInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && wlInput) { addToWatchlist(wlInput); setWlInput("") } }}
                className="bg-[#080C14] border border-[#1E2A3A] rounded px-2.5 py-1 text-[12px] text-white placeholder-[#3D4D63] focus:outline-none focus:border-[#FF8A00]/50 w-64"
              />
              {watchlist.length > 0 && (
                <button
                  onClick={() => { if (confirm(`Clear all ${watchlist.length} symbols?`)) { setWatchlist([]); localStorage.setItem("pb_watchlist", "[]"); syncPrefs({ watchlist: [] }) } }}
                  className="text-[10px] text-[#E7E5E4] hover:text-[#FF605D] border border-[#1E2A3A] hover:border-[#FF605D]/40 rounded px-2 py-1 transition-colors"
                >Clear</button>
              )}
            </div>
          </div>
          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            {watchlist.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-6 py-16">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#3D4D63] mb-3">Empty watchlist</div>
                <div className="text-[14px] font-semibold text-white/80 mb-4">Track institutional flow on the tickers you trade</div>
                <div className="text-[10px] uppercase tracking-[0.14em] text-[#3D4D63] mb-2">Quick add</div>
                <div className="flex flex-wrap gap-1.5 max-w-md justify-center">
                  {["SPY","QQQ","NVDA","TSLA","AAPL","META","AMD","MSFT","GOOGL","COIN","PLTR","MSTR"].map(t => (
                    <button key={t}
                      onClick={() => addToWatchlist(t)}
                      className="text-[11px] font-mono font-bold text-[#E7E5E4] hover:text-white border border-[#1E2A3A] hover:border-[#FF8A00]/40 rounded px-2 py-1 transition-colors">
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            ) : (() => {
              const fmtTime = (ts: number) => {
                const d = Math.floor((Date.now() / 1000) - ts)
                if (d < 60) return `${d}s`
                if (d < 3600) return `${Math.floor(d / 60)}m`
                if (d < 86400) return `${Math.floor(d / 3600)}h`
                return `${Math.floor(d / 86400)}d`
              }
              // Inline SVG sparkline — 60×20, no chart library.
              const Spark = ({ pts, positive }: { pts: number[]; positive: boolean }) => {
                if (!pts || pts.length < 2) return <span className="text-[#3D4D63] text-[10px]">—</span>
                const W = 60, H = 18
                const lo = Math.min(...pts), hi = Math.max(...pts)
                const span = (hi - lo) || 1
                const xs = pts.map((_, i) => (i / (pts.length - 1)) * W)
                const ys = pts.map(p => H - ((p - lo) / span) * H)
                const d = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(" ")
                const color = positive ? "#22C55E" : "#FF605D"
                return (
                  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
                    <path d={d} fill="none" stroke={color} strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" />
                  </svg>
                )
              }
              const rows = watchlist.map(sym => {
                const symTrades = trades.filter(t => t.symbol === sym)
                const callPrem = symTrades.filter(t => t.opt_type === "C").reduce((s, t) => s + t.premium, 0)
                const putPrem = symTrades.filter(t => t.opt_type === "P").reduce((s, t) => s + t.premium, 0)
                const count = symTrades.length
                const isBull = callPrem > putPrem * 1.3
                const isBear = putPrem > callPrem * 1.3
                const lastSignalTs = symTrades.length
                  ? Math.max(...symTrades.map(t => Math.floor(new Date(t.date_time).getTime() / 1000)))
                  : 0
                const quote = wlQuotes[sym] || { spot: null, change: null, change_pct: null, prev_close: null }
                const spark = wlSparks[sym] || []
                return { sym, callPrem, putPrem, count, isBull, isBear, lastSignalTs, quote, spark }
              })
              const dirMul = wlSort.dir === "asc" ? 1 : -1
              rows.sort((a, b) => {
                let av: number | string = 0, bv: number | string = 0
                switch (wlSort.key) {
                  case "symbol":     av = a.sym; bv = b.sym; break
                  case "price":      av = a.quote.spot ?? -Infinity; bv = b.quote.spot ?? -Infinity; break
                  case "change":     av = a.quote.change_pct ?? -Infinity; bv = b.quote.change_pct ?? -Infinity; break
                  case "callFlow":   av = a.callPrem; bv = b.callPrem; break
                  case "putFlow":    av = a.putPrem; bv = b.putPrem; break
                  case "signals":    av = a.count; bv = b.count; break
                  case "lastSignal": av = a.lastSignalTs; bv = b.lastSignalTs; break
                }
                if (av < bv) return -1 * dirMul
                if (av > bv) return  1 * dirMul
                return 0
              })
              const SortHead = ({ k, label, align = "left" }: { k: typeof wlSort.key; label: string; align?: "left" | "right" | "center" }) => (
                <button
                  onClick={() => setWlSort(s => ({ key: k, dir: s.key === k && s.dir === "desc" ? "asc" : "desc" }))}
                  className={`px-3 py-2 text-[9px] font-bold tracking-[0.12em] uppercase transition-colors flex items-center gap-1 w-full ${wlSort.key === k ? "text-white" : "text-[#3D4D63] hover:text-[#E7E5E4]"} ${align === "right" ? "justify-end" : align === "center" ? "justify-center" : ""}`}>
                  {label}
                  {wlSort.key === k && <span className="text-[8px]">{wlSort.dir === "desc" ? "▼" : "▲"}</span>}
                </button>
              )
              // Industry-standard column layout — TradingView/ToS pattern with
              // our flow-specific columns appended. 32px rows.
              // Symbol(70) Last(80) Chg(80) %Chg(80) Spark(80) Call$(90) Put$(90) Bias(70) Sig(60) Age(60) ×(28)
              const cols = "70px 80px 80px 80px 80px 1fr 90px 90px 70px 60px 60px 28px"
              return (
                <div>
                  <div className="grid sticky top-0 z-10 border-b border-[#2D2C38]" style={{ gridTemplateColumns: cols, background: "#212029" }}>
                    <SortHead k="symbol" label="Symbol" />
                    <SortHead k="price" label="Last" align="right" />
                    <div className="px-3 py-2 text-[9px] font-bold text-[#3D4D63] tracking-[0.12em] uppercase text-right">Chg</div>
                    <SortHead k="change" label="% Chg" align="right" />
                    <div className="px-3 py-2 text-[9px] font-bold text-[#3D4D63] tracking-[0.12em] uppercase text-center">5D</div>
                    <div />
                    <SortHead k="callFlow" label="Call $" align="right" />
                    <SortHead k="putFlow" label="Put $" align="right" />
                    <div className="px-3 py-2 text-[9px] font-bold text-[#3D4D63] tracking-[0.12em] uppercase text-center">Bias</div>
                    <SortHead k="signals" label="Sig" align="center" />
                    <SortHead k="lastSignal" label="Age" align="center" />
                    <div />
                  </div>
                  {rows.map(r => {
                    const { sym, callPrem, putPrem, count, isBull, isBear, lastSignalTs, quote, spark } = r
                    const positive = (quote.change_pct ?? 0) > 0
                    const negative = (quote.change_pct ?? 0) < 0
                    const changeColor = positive ? "#22C55E" : negative ? "#FF605D" : "#E7E5E4"
                    const change = quote.change ?? 0
                    return (
                      <div key={sym}
                           className="grid border-b border-[#2D2C38] hover:bg-white/[0.04] transition-colors cursor-pointer group"
                           style={{ gridTemplateColumns: cols, minHeight: 32, alignItems: "center" }}
                           onClick={() => { setSearch(sym); setSearchInput(sym); setPage(0); setActivePage("scanner") }}
                           title={`Click to filter scanner to ${sym}`}>
                        <div className="px-3"><span className="text-[12px] font-bold text-white font-mono">{sym}</span></div>
                        <div className="px-3 text-right">
                          <span className="text-[12px] font-mono tabular-nums text-white">
                            {quote.spot != null ? quote.spot.toFixed(2) : <span className="text-[#3D4D63]">—</span>}
                          </span>
                        </div>
                        <div className="px-3 text-right">
                          {change !== 0 && quote.change != null ? (
                            <span className="text-[11px] font-mono tabular-nums" style={{ color: changeColor }}>
                              {positive ? "+" : ""}{change.toFixed(2)}
                            </span>
                          ) : <span className="text-[11px] text-[#3D4D63]">—</span>}
                        </div>
                        <div className="px-3 text-right">
                          {quote.change_pct != null ? (
                            <span className="text-[11px] font-mono tabular-nums font-semibold" style={{ color: changeColor }}>
                              {positive ? "+" : ""}{quote.change_pct.toFixed(2)}%
                            </span>
                          ) : <span className="text-[11px] text-[#3D4D63]">—</span>}
                        </div>
                        <div className="px-3 flex items-center justify-center">
                          <Spark pts={spark} positive={positive || (spark.length >= 2 && spark[spark.length-1] >= spark[0])} />
                        </div>
                        <div />
                        <div className="px-3 text-right">
                          <span className={`text-[11px] font-mono tabular-nums font-semibold ${callPrem > 0 ? "text-[#22C55E]" : "text-[#3D4D63]"}`}>
                            {callPrem > 0 ? fmtPrem(callPrem) : "—"}
                          </span>
                        </div>
                        <div className="px-3 text-right">
                          <span className={`text-[11px] font-mono tabular-nums font-semibold ${putPrem > 0 ? "text-[#FF605D]" : "text-[#3D4D63]"}`}>
                            {putPrem > 0 ? fmtPrem(putPrem) : "—"}
                          </span>
                        </div>
                        <div className="px-3 flex items-center justify-center">
                          {count > 0 ? (
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wider ${isBull ? "bg-[#22C55E]/15 text-[#22C55E]" : isBear ? "bg-[#FF605D]/15 text-[#FF605D]" : "bg-white/5 text-[#E7E5E4]"}`}>
                              {isBull ? "BULL" : isBear ? "BEAR" : "MIX"}
                            </span>
                          ) : <span className="text-[10px] text-[#3D4D63]">—</span>}
                        </div>
                        <div className="px-3 text-center">
                          <span className="text-[11px] text-[#E7E5E4] font-mono tabular-nums">{count || "—"}</span>
                        </div>
                        <div className="px-3 text-center">
                          <span className="text-[11px] text-[#E7E5E4] font-mono tabular-nums">{lastSignalTs ? fmtTime(lastSignalTs) : "—"}</span>
                        </div>
                        <div className="flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={e => { e.stopPropagation(); removeFromWatchlist(sym) }}
                            className="text-[#3D4D63] hover:text-[#FF605D] text-base leading-none w-5 h-5 flex items-center justify-center rounded hover:bg-[#FF605D]/15">×</button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })()}
          </div>
        </div>
      ) : (<>

      {/* ── HEADER ── */}
      <header className="h-12 border-b border-white/[0.06] flex items-center px-4 flex-shrink-0" style={{ background: '#252430' }}>
        <div className="flex items-center gap-3 ml-auto">
          <InputGroup
            className="bg-stone-900/40 border-stone-800 focus-within:border-amber-600 rounded-xl h-[43px] transition-colors"
            style={{ maxWidth: 280 }}
          >
            <InputGroupAddon align="inline-start" className="text-stone-500">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </InputGroupAddon>
            <InputGroupInput
              type="text"
              placeholder="Search ticker..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value.toUpperCase())}
              onKeyDown={e => { if (e.key === "Enter") { setSearch(searchInput); setPage(0) } if (e.key === "Escape") { setSearchInput(""); setSearch("") } }}
              className="text-white text-[13px] font-mono tracking-wide placeholder-stone-500"
            />
            <InputGroupAddon align="inline-end">
              <kbd className="text-[9px] text-stone-400 bg-stone-800 border border-stone-700 rounded px-1.5 py-0.5 font-mono">ENTER</kbd>
            </InputGroupAddon>
          </InputGroup>
          <div className="w-px h-7 bg-white/[0.06]" />
          <button onClick={() => setShowFilters(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[13px] font-medium text-white bg-stone-900/40 border border-stone-800 hover:border-amber-600 focus-visible:border-amber-600 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2"><path strokeLinecap="round" d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/></svg>
            Filters
            {activeFilterCount > 0 && <span className="bg-amber-600 text-stone-950 text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{activeFilterCount}</span>}
          </button>
        </div>
        <div className="flex items-center gap-4 ml-6">
          <a href="/account" className="text-white/70 text-sm hover:text-white transition-colors">Account</a>
          <a href="/logout" className="text-white/70 text-sm hover:text-white transition-colors">Logout</a>
        </div>
      </header>

      {/* ── FOCUS BAR ── */}
      {focusTicker && (
        <div className="border-b border-white/[0.04] px-3 py-1.5 flex items-center gap-2 flex-wrap flex-shrink-0" style={{ background: '#23222D' }}>
          <button onClick={() => { setFocusTicker(null); setFocusStrike(null); setFocusExpiry(null) }}
            className="group flex items-center gap-2 bg-white/[0.06] border border-white/[0.08] rounded-md px-2.5 py-1 text-white text-[11px] font-mono font-semibold tracking-wider hover:border-white/[0.2] transition-colors">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white/40"><path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18l-7 8v6l-4 2v-8L3 4z"/></svg>
            <span>{focusTicker}</span>
            <span className="text-white/30 group-hover:text-[#FF605D] transition-colors text-[13px] leading-none">&times;</span>
          </button>
          {focusStrike && (
            <button onClick={() => setFocusStrike(null)}
              className="flex items-center gap-1.5 bg-white/5 border border-white/20 rounded-full px-3 py-1 text-white text-xs font-mono hover:bg-white/10">
              Strike {focusStrike} <span className="text-white/40">&times;</span>
            </button>
          )}
          {focusExpiry && (
            <button onClick={() => setFocusExpiry(null)}
              className="flex items-center gap-1.5 bg-white/5 border border-white/20 rounded-full px-3 py-1 text-white text-xs font-mono hover:bg-white/10">
              Exp {focusExpiry} <span className="text-white/40">&times;</span>
            </button>
          )}
          <span className="text-white/25 text-xs ml-auto">{filtered.length} signals</span>
        </div>
      )}

      {/* ── STATS BAR ── */}
      {(() => {
        const totalPrem = displayStats.bull + displayStats.bear
        const bullPct = totalPrem > 0 ? (displayStats.bull / totalPrem) * 100 : 50
        const isBull = displayStats.lean === "BULL"
        const totalCount = calls + puts
        const callSharePct = Math.round((calls / (totalCount || 1)) * 100)
        const putSharePct = Math.round((puts / (totalCount || 1)) * 100)
        return (
          <div className="grid border-b border-white/[0.06] flex-shrink-0" style={{ gridTemplateColumns: '1fr 1px 1fr 1px 1fr 1px 1fr', background: '#1C1C1E' }}>

            {/* Flow sentiment */}
            <Card className="border-0 rounded-none bg-transparent shadow-none p-0 px-5 py-3 flex flex-row items-center gap-4">
              <KPIGaugeRing
                value={Math.round(bullPct)}
                color={isBull ? "#22C55E" : displayStats.lean === "BEAR" ? "#FF605D" : "#48DEFF"}
              />
              <div>
                <div className="text-[12px] text-white/50 mb-1">Flow sentiment</div>
                <span className={`text-[24px] font-semibold leading-none ${isBull ? "text-[#22C55E]" : displayStats.lean === "BEAR" ? "text-[#FF605D]" : "text-white/90"}`}>
                  {isBull ? "Bullish" : displayStats.lean === "BEAR" ? "Bearish" : "Mixed"}
                </span>
                <div className="text-[10px] text-white/30 mt-0.5 tracking-wide" title="Sentiment + PCR computed from contract volume, not premium dollars">volume-weighted</div>
              </div>
            </Card>

            <div style={{ background: 'rgba(255,255,255,0.06)' }} />

            {/* Put to call */}
            <Card className="border-0 rounded-none bg-transparent shadow-none p-0 px-5 py-3 flex flex-row items-center gap-4">
              <KPIGaugeRing
                value={Math.min(Math.round(displayStats.pc_ratio * 50), 100)}
                color="#48DEFF"
              />
              <div>
                <div className="text-[12px] text-white/50 mb-1">Put to call</div>
                <div className="text-[24px] font-semibold text-white leading-none font-mono">{displayStats.pc_ratio.toFixed(3)}</div>
              </div>
            </Card>

            <div style={{ background: 'rgba(255,255,255,0.06)' }} />

            {/* Call flow */}
            <Card className="border-0 rounded-none bg-transparent shadow-none p-0 px-5 py-3 flex flex-row items-center gap-4">
              <KPIGaugeRing value={callSharePct} color="#22C55E" />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[12px] text-white/50">Call flow</span>
                  <span className="text-[13px] font-semibold text-[#22C55E] font-mono">{fmtPrem(callPrem)}</span>
                </div>
                <div className="text-[24px] font-semibold text-white leading-none font-mono">{calls.toLocaleString()}</div>
              </div>
            </Card>

            <div style={{ background: 'rgba(255,255,255,0.06)' }} />

            {/* Put flow */}
            <Card className="border-0 rounded-none bg-transparent shadow-none p-0 px-5 py-3 flex flex-row items-center gap-4">
              <KPIGaugeRing value={putSharePct} color="#FF605D" />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[12px] text-white/50">Put flow</span>
                  <span className="text-[13px] font-semibold text-[#FF605D] font-mono">{fmtPrem(putPrem)}</span>
                </div>
                <div className="text-[24px] font-semibold text-white leading-none font-mono">{puts.toLocaleString()}</div>
              </div>
            </Card>

          </div>
        )
      })()}

      {/* ── TABLE ── */}
      <div ref={tableContainerRef} className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none", fontVariantNumeric: "tabular-nums", background: '#1C1C1E' }}>
        {loading ? (
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10" style={{ background: '#252430' }}>
              <tr className="text-xs text-white/30 uppercase tracking-[0.08em]">
                <th className="text-left px-3 py-1.5 font-medium">Time</th>
                <th className="text-left px-2 py-1.5 font-medium">Tick</th>
                <th className="text-left px-2 py-1.5 font-medium hidden md:table-cell">Expiry</th>
                <th className="text-right px-2 py-1.5 font-medium">Strike</th>
                <th className="text-center px-2 py-1.5 font-medium">C/P</th>
                <th className="text-center px-2 py-1.5 font-medium hidden lg:table-cell">Side</th>
                <th className="text-center px-2 py-1.5 font-medium hidden lg:table-cell">B/S</th>
                <th className="text-right px-2 py-1.5 font-medium hidden md:table-cell">Spot</th>
                <th className="text-right px-2 py-1.5 font-medium hidden lg:table-cell">Size</th>
                <th className="text-center px-2 py-1.5 font-medium hidden lg:table-cell">Type</th>
                <th className="text-right px-2 py-1.5 font-medium">Value</th>
                <th className="text-right px-2 py-1.5 font-medium hidden xl:table-cell">Vol</th>
                <th className="text-right px-2 py-1.5 font-medium hidden xl:table-cell">OI</th>
                <th className="text-right px-2 py-1.5 font-medium hidden lg:table-cell">IV</th>
                <th className="text-left px-2 py-1.5 font-medium hidden md:table-cell w-[180px] max-w-[180px]">Conds</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 25 }).map((_, i) => (
                <tr key={i} className="border-b border-white/[0.04]">
                  {Array.from({ length: 15 }).map((_, j) => (
                    <td key={j} className="px-2 py-1.5">
                      <div className="h-2.5 bg-white/[0.03] rounded animate-pulse" style={{ width: `${40 + Math.random() * 40}%` }} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-white/15 text-xs">
            {search ? `No trades matching "${search}"` : "No trades found for this period."}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10" style={{ background: '#252430' }}>
              <tr className="text-xs text-white/30 uppercase tracking-[0.08em]">
                {COLS.map(c => (
                  <th key={c.key} className={`${c.cls} py-1.5 font-medium`} style={{ borderRight: '1px solid rgba(255,255,255,0.04)' }}>{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody style={{
              paddingTop: `${rowVirtualizer.getVirtualItems()[0]?.start ?? 0}px`,
              paddingBottom: `${rowVirtualizer.getTotalSize() - (rowVirtualizer.getVirtualItems().at(-1)?.end ?? 0)}px`,
            }}>
              {rowVirtualizer.getVirtualItems().map(vRow => {
                const t = pageRows[vRow.index]
                if (!t || t.mm_suspected) return null
                const rowStyle = getRowStyle(t)
                return (
                  <tr
                    key={vRow.key}
                    data-index={vRow.index}
                    ref={rowVirtualizer.measureElement}
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
                    <td className="px-2 py-2 text-center text-[12px] font-semibold" style={{ color: t.row_color === 'bullish' ? '#22C55E' : '#FF605D' }}>
                      {t.opt_type === "C" ? "Call" : "Put"}
                    </td>
                    <td className={`px-2 py-2 text-center text-[12px] ${aggrColor(t.aggression)}`}>
                      {aggrLabel(t.aggression)}
                    </td>
                    <td className={`px-2 py-2 text-center text-[12px] font-medium ${bsColor(t.trade_direction)}`}>
                      {bsLabel(t.trade_direction)}
                    </td>
                    <td className="px-2 py-2 text-right text-white text-[13px] font-medium font-mono">{t.spot_fmt}</td>
                    <td className={`px-2 py-2 text-right text-[13px] font-medium font-mono ${(t.contracts ?? 0) >= 1000 ? "text-[#22d3ee] font-semibold" : "text-white"}`}>{(t.contracts ?? 0).toLocaleString()}</td>
                    <td className="px-2 py-2 text-right text-white/90 text-[13px] font-medium font-mono">{t.entry_price ? `$${t.entry_price.toFixed(2)}` : "—"}</td>
                    <td className="px-2 py-2 text-right text-[12px] font-bold" style={{ color: t.row_color === 'bullish' ? '#22C55E' : '#FF605D' }}>
                      {t.premium_fmt}
                    </td>
                    <td className={`px-2 py-2 text-center text-[12px] font-medium ${
                      t.flow_type === "SWEEP" ? "text-[#F2C94C]" : t.flow_type === "BLOCK" ? "text-[#48DEFF]" + (t.premium >= 1000000 ? " font-bold" : "") : "text-white/90"
                    }`}>
                      {t.flow_type || "—"}
                    </td>
                    <td className="px-2 py-2 text-right text-[13px] font-medium font-mono text-white/80">
                      {(t.day_volume ?? 0) > 0 ? t.day_volume.toLocaleString() : "—"}
                    </td>
                    <td className="px-2 py-2 text-right text-white/80 text-[13px] font-medium font-mono">
                      {(t.open_interest ?? 0) > 0 ? t.open_interest.toLocaleString() : "—"}
                    </td>
                    <td className="px-2 py-2 text-right text-[13px] font-semibold font-mono"
                        style={{
                          // Per-contract implied volatility (matches every broker).
                          // Color hints elevated vs normal vol, but absolute thresholds
                          // are loose because IV scales with DTE and moneyness.
                          color: t.iv == null ? "rgba(255,255,255,0.3)"
                                 : t.iv >= 100 ? "#FF605D"          // red — extremely elevated
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
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── PAGINATION BAR — shadcn-style numbered Pagination ── */}
      <div className="flex items-center justify-between gap-3 px-4 py-2 border-t border-[#252E3D] bg-[#161B24] flex-shrink-0">
        {/* Left: signal count + range label (replaces inline mid-bar text) */}
        <div className="text-[11px] text-[#4A5A72] tabular-nums">
          {timeRange === "today" ? (
            <>Page <span className="text-[#E7E5E4] font-medium">{clientPage + 1}</span> of <span className="text-[#E7E5E4] font-medium">{totalClientPages}</span> · {filtered.length.toLocaleString()} signals</>
          ) : (
            page === 0
              ? <>{filtered.length.toLocaleString()} signals</>
              : <>Page <span className="text-[#E7E5E4] font-medium">{page + 1}</span> · {timeRange.replace("_", " ")}</>
          )}
        </div>

        {/* Right: numbered Pagination component */}
        {timeRange === "today" ? (
          <Pagination className="w-auto mx-0">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => { setClientPage(Math.max(0, clientPage - 1)); tableContainerRef.current?.scrollTo(0, 0) }}
                  disabled={clientPage === 0}
                />
              </PaginationItem>
              {getPageNumbers(clientPage, totalClientPages).map((n, i) =>
                n === "ellipsis" ? (
                  <PaginationItem key={`e-${i}`}><PaginationEllipsis /></PaginationItem>
                ) : (
                  <PaginationItem key={n}>
                    <PaginationLink
                      isActive={n === clientPage}
                      size="icon"
                      onClick={() => { setClientPage(n as number); tableContainerRef.current?.scrollTo(0, 0) }}
                    >
                      {(n as number) + 1}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}
              <PaginationItem>
                <PaginationNext
                  onClick={() => { setClientPage(Math.min(totalClientPages - 1, clientPage + 1)); tableContainerRef.current?.scrollTo(0, 0) }}
                  disabled={clientPage >= totalClientPages - 1}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        ) : (
          // Server-side pagination — total pages unknown until the server
          // returns < page_size rows. Show prev / current-page / next only.
          <Pagination className="w-auto mx-0">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => { setPage(Math.max(0, page - 1)); tableContainerRef.current?.scrollTo(0, 0) }}
                  disabled={page === 0}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink isActive size="icon">{page + 1}</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  onClick={() => { setPage(page + 1); tableContainerRef.current?.scrollTo(0, 0) }}
                  disabled={trades.length < 2000 && page > 0}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>

      {/* ── FILTER PANEL ── */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setShowFilters(false)}>
          <div className="w-[340px] h-full overflow-y-auto" style={{ background: '#232225', borderLeft: '1px solid rgba(255,255,255,0.06)' }}
            onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span className="text-[15px] font-semibold">Filters</span>
                {activeFilterCount > 0 && (
                  <span className="text-[10px] bg-[#48DEFF]/15 text-[#48DEFF] px-2 py-0.5 rounded-full font-semibold">{activeFilterCount}</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button onClick={resetFilters} className="text-[12px] text-white hover:underline">Reset</button>
                <button onClick={() => setShowFilters(false)} className="text-white/40 hover:text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="px-5 py-4 space-y-6">

              {/* ── TIME RANGE ── */}
              <div>
                <div className="text-[11px] font-bold tracking-[0.08em] uppercase text-stone-600 mb-3">Time range</div>
                <ToggleGroup
                  type="single"
                  value={timeRange}
                  onValueChange={(v) => { if (v) { setTimeRange(v); setPage(0); setClientPage(0) } }}
                  className="grid grid-cols-4 gap-1.5"
                >
                  {TIME_RANGES.map(tr => (
                    <ToggleGroupItem
                      key={tr.key}
                      value={tr.key}
                      className="text-[11px] font-medium py-2 rounded-lg border bg-white/[0.04] border-white/[0.08] text-stone-400 hover:border-white/[0.15] hover:text-stone-200 data-[state=on]:bg-amber-700/15 data-[state=on]:border-amber-700/40 data-[state=on]:text-amber-500"
                    >
                      {tr.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>

              <Separator className="bg-stone-800" />

              {/* ── SAVED PRESETS ── */}
              <div>
                <div className="text-[11px] font-bold tracking-[0.08em] uppercase text-stone-600 mb-3">Saved presets</div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {presets.map(p => (
                    <div key={p.name} className="group flex items-center gap-1 bg-white/[0.04] border border-white/[0.08] rounded-md px-2.5 py-1.5 cursor-pointer hover:border-[#48DEFF]/40 hover:bg-[#48DEFF]/5 transition-colors"
                      onClick={() => loadPreset(p)}>
                      <span className="text-[12px] text-white/60 group-hover:text-[#48DEFF]">{p.name}</span>
                      <button onClick={e => { e.stopPropagation(); deletePreset(p.name) }}
                        className="text-white/20 hover:text-[#FF605D] ml-0.5 text-[10px]">✕</button>
                    </div>
                  ))}
                  {!showSavePreset ? (
                    <button onClick={() => setShowSavePreset(true)}
                      className="flex items-center gap-1 border border-dashed border-white/[0.12] rounded-md px-2.5 py-1.5 text-[12px] text-white/30 hover:text-white/50 hover:border-white/20 transition-colors">
                      <span>+</span> Save current
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 w-full mt-1">
                      <input value={presetName} onChange={e => setPresetName(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && savePreset(presetName)}
                        placeholder="Preset name..."
                        className="flex-1 bg-white/[0.04] border border-white/[0.12] rounded-md px-2.5 py-1.5 text-[12px] text-white placeholder-white/25 focus:outline-none focus:border-[#48DEFF]/40"
                        autoFocus />
                      <button onClick={() => savePreset(presetName)}
                        className="px-2.5 py-1.5 bg-[#48DEFF] text-[#1C1C1E] rounded-md text-[11px] font-semibold hover:bg-[#6ee8ff]">Save</button>
                      <button onClick={() => { setShowSavePreset(false); setPresetName("") }}
                        className="text-white/30 hover:text-white/60 text-[12px]">✕</button>
                    </div>
                  )}
                </div>
              </div>

              <Separator className="bg-stone-800" />

              {/* ── DIRECTION ── */}
              <div>
                <div className="text-[11px] font-bold tracking-[0.08em] uppercase text-stone-600 mb-3">Direction</div>
                <div className="space-y-0">
                  <div className="flex items-center justify-between py-2.5 border-b border-white/[0.04]">
                    <div>
                      <div className="text-[14px] text-stone-200 font-medium">Calls only</div>
                      <div className="text-[12px] text-stone-400">Show call options only</div>
                    </div>
                    <Switch
                      checked={filterOptType === "C"}
                      onCheckedChange={(v) => setFilterOptType(v ? "C" : "")}
                      className="data-[state=checked]:bg-stone-700 data-[state=unchecked]:bg-white/10"
                    />
                  </div>
                  <div className="flex items-center justify-between py-2.5">
                    <div>
                      <div className="text-[14px] text-stone-200 font-medium">Puts only</div>
                      <div className="text-[12px] text-stone-400">Show put options only</div>
                    </div>
                    <Switch
                      checked={filterOptType === "P"}
                      onCheckedChange={(v) => setFilterOptType(v ? "P" : "")}
                      className="data-[state=checked]:bg-stone-700 data-[state=unchecked]:bg-white/10"
                    />
                  </div>
                </div>
              </div>

              <Separator className="bg-stone-800" />

              {/* ── FLOW TYPE ── */}
              <div>
                <div className="text-[11px] font-bold tracking-[0.08em] uppercase text-stone-600 mb-3">Flow type</div>
                <div className="space-y-0">
                  <div className="flex items-center justify-between py-2.5 border-b border-white/[0.04]">
                    <div>
                      <div className="text-[14px] text-stone-200 font-medium">Sweeps only</div>
                      <div className="text-[12px] text-stone-400">Multi-leg aggressive fills</div>
                    </div>
                    <Switch
                      checked={filterType === "SWEEP"}
                      onCheckedChange={(v) => setFilterType(v ? "SWEEP" : "")}
                      className="data-[state=checked]:bg-stone-700 data-[state=unchecked]:bg-white/10"
                    />
                  </div>
                  <div className="flex items-center justify-between py-2.5">
                    <div>
                      <div className="text-[14px] text-stone-200 font-medium">Blocks only</div>
                      <div className="text-[12px] text-stone-400">Single-fill large orders</div>
                    </div>
                    <Switch
                      checked={filterType === "BLOCK"}
                      onCheckedChange={(v) => setFilterType(v ? "BLOCK" : "")}
                      className="data-[state=checked]:bg-stone-700 data-[state=unchecked]:bg-white/10"
                    />
                  </div>
                </div>
              </div>

              <Separator className="bg-stone-800" />

              {/* ── SIGNAL QUALITY ── */}
              <div>
                <div className="text-[11px] font-bold tracking-[0.08em] uppercase text-stone-600 mb-3">Signal quality</div>
                <div className="space-y-0">
<div className="flex items-center justify-between py-2.5 border-b border-white/[0.04]">
                    <div>
                      <div className="text-[14px] text-stone-200 font-medium">Unusual only</div>
                      <div className="text-[12px] text-stone-400">V/OI flagged activity</div>
                    </div>
                    <Switch
                      checked={filterUnusualOnly}
                      onCheckedChange={setFilterUnusualOnly}
                      className="data-[state=checked]:bg-stone-700 data-[state=unchecked]:bg-white/10"
                    />
                  </div>
                  <div className="flex items-center justify-between py-2.5 border-b border-white/[0.04]">
                    <div>
                      <div className="text-[14px] text-stone-200 font-medium">No index</div>
                      <div className="text-[12px] text-stone-400">Hide SPX, SPXW, NDX, RUT, VIX</div>
                    </div>
                    <Switch
                      checked={filterNoIndex}
                      onCheckedChange={setFilterNoIndex}
                      className="data-[state=checked]:bg-stone-700 data-[state=unchecked]:bg-white/10"
                    />
                  </div>
                  <div className="flex items-center justify-between py-2.5">
                    <div>
                      <div className="text-[14px] text-stone-200 font-medium">Curated grades only</div>
                      <div className="text-[12px] text-stone-400">Hide graded-PASS flow (lower-win-rate signals)</div>
                    </div>
                    <Switch
                      checked={filterCuratedOnly}
                      onCheckedChange={setFilterCuratedOnly}
                      className="data-[state=checked]:bg-stone-700 data-[state=unchecked]:bg-white/10"
                    />
                  </div>
                </div>
              </div>

              <Separator className="bg-stone-800" />

              {/* ── EXCLUSIONS ── */}
              <div>
                <div className="text-[11px] font-bold tracking-[0.08em] uppercase text-stone-600 mb-3">Exclusions</div>
                <div className="space-y-0">
                  <div className="flex items-center justify-between py-2.5 border-b border-white/[0.04]">
                    <div>
                      <div className="text-[14px] text-stone-200 font-medium">Exclude midpoint</div>
                      <div className="text-[12px] text-stone-400">Hide rows where SIDE renders &ldquo;Mid&rdquo; (non-directional fills)</div>
                    </div>
                    <Switch
                      checked={filterExcludeMidpoint}
                      onCheckedChange={setFilterExcludeMidpoint}
                      className="data-[state=checked]:bg-stone-700 data-[state=unchecked]:bg-white/10"
                    />
                  </div>
                  <div className="flex items-center justify-between py-2.5">
                    <div>
                      <div className="text-[14px] text-stone-200 font-medium">Exclude multi-leg</div>
                      <div className="text-[12px] text-stone-400">Hide straddles, strangles, verticals, and OPRA multi-leg prints</div>
                    </div>
                    <Switch
                      checked={filterExcludeMultiLeg}
                      onCheckedChange={setFilterExcludeMultiLeg}
                      className="data-[state=checked]:bg-stone-700 data-[state=unchecked]:bg-white/10"
                    />
                  </div>
                </div>
              </div>

              <Separator className="bg-stone-800" />

              {/* ── SIDE ── */}
              <div>
                <div className="text-[11px] font-bold tracking-[0.08em] uppercase text-stone-600 mb-3">Side</div>
                <div className="space-y-0">
                  <div className="flex items-center justify-between py-2.5 border-b border-white/[0.04]">
                    <div>
                      <div className="text-[14px] text-stone-200 font-medium">Above ask only</div>
                      <div className="text-[12px] text-stone-400">Most aggressive — paid above ask</div>
                    </div>
                    <Switch
                      checked={filterSide === "ABOVE_ASK"}
                      onCheckedChange={(v) => setFilterSide(v ? "ABOVE_ASK" : "")}
                      className="data-[state=checked]:bg-stone-700 data-[state=unchecked]:bg-white/10"
                    />
                  </div>
                  <div className="flex items-center justify-between py-2.5 border-b border-white/[0.04]">
                    <div>
                      <div className="text-[14px] text-stone-200 font-medium">At ask only</div>
                      <div className="text-[12px] text-stone-400">Aggressive buys at the ask</div>
                    </div>
                    <Switch
                      checked={filterSide === "AT_ASK"}
                      onCheckedChange={(v) => setFilterSide(v ? "AT_ASK" : "")}
                      className="data-[state=checked]:bg-stone-700 data-[state=unchecked]:bg-white/10"
                    />
                  </div>
                  <div className="flex items-center justify-between py-2.5">
                    <div>
                      <div className="text-[14px] text-stone-200 font-medium">At bid only</div>
                      <div className="text-[12px] text-stone-400">Sells hitting the bid</div>
                    </div>
                    <Switch
                      checked={filterSide === "AT_BID"}
                      onCheckedChange={(v) => setFilterSide(v ? "AT_BID" : "")}
                      className="data-[state=checked]:bg-stone-700 data-[state=unchecked]:bg-white/10"
                    />
                  </div>
                </div>
              </div>

              <Separator className="bg-stone-800" />

              {/* ── RANGE FILTERS ── */}
              <div>
                <div className="text-[11px] font-bold tracking-[0.08em] uppercase text-stone-600 mb-3">Range filters</div>

                {/* Min Premium */}
                <div className="mb-5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[13px] text-stone-200 font-medium">Min premium</span>
                    <span className="text-[13px] text-amber-600 font-semibold font-mono">
                      {({"": "Any", "50000": "$50K", "100000": "$100K", "200000": "$200K", "500000": "$500K", "1000000": "$1M", "5000000": "$5M+"} as Record<string, string>)[filterMinPremium] || "Any"}
                    </span>
                  </div>
                  <Slider min={0} max={6} step={1}
                    value={[({"": 0, "50000": 1, "100000": 2, "200000": 3, "500000": 4, "1000000": 5, "5000000": 6} as Record<string, number>)[filterMinPremium] ?? 0]}
                    onValueChange={([v]) => setFilterMinPremium(["", "50000", "100000", "200000", "500000", "1000000", "5000000"][v])}
                    className="w-full [&_[data-slot=slider-track]]:bg-stone-950 [&_[data-slot=slider-range]]:bg-stone-700 [&_[data-slot=slider-thumb]]:bg-stone-200 [&_[data-slot=slider-thumb]]:border-stone-700"
                  />
                  <div className="flex justify-between mt-1">
                    {["Any", "$50K", "$100K", "$200K", "$500K", "$1M", "$5M+"].map(l => (
                      <span key={l} className="text-[9px] text-stone-600 font-mono">{l}</span>
                    ))}
                  </div>
                </div>

                {/* Min Contracts */}
                <div className="mb-5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[13px] text-stone-200 font-medium">Min contracts</span>
                    <span className="text-[13px] text-amber-600 font-semibold font-mono">
                      {filterMinContracts === 0 ? "Any" : filterMinContracts.toLocaleString()}
                    </span>
                  </div>
                  <Slider min={0} max={2000} step={50}
                    value={[filterMinContracts]}
                    onValueChange={([v]) => setFilterMinContracts(v)}
                    className="w-full [&_[data-slot=slider-track]]:bg-stone-950 [&_[data-slot=slider-range]]:bg-stone-700 [&_[data-slot=slider-thumb]]:bg-stone-200 [&_[data-slot=slider-thumb]]:border-stone-700"
                  />
                  <div className="flex justify-between mt-1">
                    {["0", "500", "1K", "1.5K", "2K"].map(l => (
                      <span key={l} className="text-[9px] text-stone-600 font-mono">{l}</span>
                    ))}
                  </div>
                </div>

                {/* Max DTE */}
                <div className="mb-5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[13px] text-stone-200 font-medium">Max DTE</span>
                    <span className="text-[13px] text-amber-600 font-semibold font-mono">
                      {filterDte === "0dte" ? "0DTE" : filterDte === "1-7" ? "7d" : filterDte === "8-30" ? "30d" : filterDte === "30+" ? "30d+" : "All"}
                    </span>
                  </div>
                  <Slider min={0} max={4} step={1}
                    value={[({"": 0, "0dte": 1, "1-7": 2, "8-30": 3, "30+": 4} as Record<string, number>)[filterDte] ?? 0]}
                    onValueChange={([v]) => setFilterDte(["", "0dte", "1-7", "8-30", "30+"][v])}
                    className="w-full [&_[data-slot=slider-track]]:bg-stone-950 [&_[data-slot=slider-range]]:bg-stone-700 [&_[data-slot=slider-thumb]]:bg-stone-200 [&_[data-slot=slider-thumb]]:border-stone-700"
                  />
                  <div className="flex justify-between mt-1">
                    {["All", "0DTE", "1-7d", "8-30d", "30d+"].map(l => (
                      <span key={l} className="text-[9px] text-stone-600 font-mono">{l}</span>
                    ))}
                  </div>
                </div>

                {/* Min V/OI Ratio */}
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[13px] text-stone-200 font-medium">Min V/OI ratio</span>
                    <span className="text-[13px] text-amber-600 font-semibold font-mono">
                      {filterMinVolOi === 0 ? "Any" : (filterMinVolOi / 10).toFixed(1) + "x"}
                    </span>
                  </div>
                  <Slider min={0} max={50} step={5}
                    value={[filterMinVolOi]}
                    onValueChange={([v]) => setFilterMinVolOi(v)}
                    className="w-full [&_[data-slot=slider-track]]:bg-stone-950 [&_[data-slot=slider-range]]:bg-stone-700 [&_[data-slot=slider-thumb]]:bg-stone-200 [&_[data-slot=slider-thumb]]:border-stone-700"
                  />
                  <div className="flex justify-between mt-1">
                    {["Any", "1x", "2x", "3x", "4x", "5x"].map(l => (
                      <span key={l} className="text-[9px] text-stone-600 font-mono">{l}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── APPLY BUTTON ── */}
              <button onClick={() => setShowFilters(false)}
                className="w-full py-2.5 bg-amber-600 text-stone-950 rounded-lg text-[13px] font-semibold hover:bg-amber-500 active:scale-[0.98] transition-all">
                Apply filters
              </button>

            </div>
          </div>
        </div>
      )}

      </>)}

      {/* ── UPGRADE MODAL ── */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowUpgradeModal(false)}>
          <div className="border border-[#1E2A3A] rounded-xl p-8 max-w-sm w-full mx-4" style={{ background: "#0F1520" }} onClick={e => e.stopPropagation()}>
            <div className="text-[#FF8A00] text-[10px] font-bold tracking-[0.15em] uppercase mb-3">Pro Feature</div>
            <div className="text-xl font-bold text-white mb-2">Gamma Wall Scanner</div>
            <div className="text-sm text-[#E7E5E4] mb-6 leading-relaxed">
              Real-time GEX heatmaps, gamma wall detection, and squeeze identification are available on the Pro plan.
            </div>
            <Link href="/#pricing" className="block w-full text-center py-3 rounded-lg bg-[#FF8A00] text-black font-bold text-[15px] hover:bg-[#e57309] transition-colors">
              Upgrade to Pro
            </Link>
            <button onClick={() => setShowUpgradeModal(false)} className="block w-full text-center py-2 mt-3 text-[#4A5A72] text-[15px] hover:text-[#E7E5E4] transition-colors">
              Not now
            </button>
          </div>
        </div>
      )}

      </div>
      {/* Command palette — reachable via S keypress on the heatmap tab */}
      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        symbol={gexSymbol}
        symbols={GEX_SYMBOLS.map((code: string) => ({ code, name: ({ SPY: "State Street SPDR S&P 500 ETF Trust", QQQ: "Invesco QQQ Trust", AAPL: "Apple Inc.", TSLA: "Tesla, Inc.", NVDA: "NVIDIA Corporation", META: "Meta Platforms, Inc.", MSFT: "Microsoft Corporation", AMZN: "Amazon.com, Inc.", GOOGL: "Alphabet Inc.", AMD: "Advanced Micro Devices, Inc.", MU: "Micron Technology, Inc.", COIN: "Coinbase Global, Inc.", PLTR: "Palantir Technologies Inc.", NFLX: "Netflix, Inc.", CRM: "Salesforce, Inc.", BA: "The Boeing Company", JPM: "JPMorgan Chase & Co.", GS: "Goldman Sachs Group, Inc.", XOM: "Exxon Mobil Corporation", GLD: "SPDR Gold Trust" } as Record<string, string>)[code] || code }))}
        onSymbolChange={setGexSymbol}
      />

    </div>
  )
}
