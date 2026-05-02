"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useVirtualizer } from "@tanstack/react-virtual"
import { badgeClass } from "@/lib/badge-styles"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis, getPageNumbers } from "@/components/ui/pagination"
import { AnimatedCircularProgressBar } from "@/components/magicui/animated-circular-progress-bar"
import TrialBanner from "@/components/TrialBanner"
import CommandPalette from "@/components/CommandPalette"
import InfoTooltip from "@/components/InfoTooltip"
import ReplayProgress from "@/components/ReplayProgress"

import Link from "next/link"
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
  if (a === "ABOVE_ASK" || a === "AT_ASK") return "text-[#00E85A]"
  if (a === "BELOW_BID" || a === "AT_BID") return "text-[#FF605D]"
  if (!a || a === "NEUTRAL") return "text-[#F59E0B]"   // MIDPOINT (industry standard)
  return "text-white/90"
}

function aggrLabel(a: string | null | undefined) {
  // NULL/NEUTRAL = MIDPOINT — trade printed within ±35% of spread from mid,
  // typically negotiated block, hedge leg, or non-directional flow.
  if (!a || a === "NEUTRAL") return "Mid"
  const map: Record<string, string> = { ABOVE_ASK: "Above", AT_ASK: "Ask", AT_BID: "Bid", BELOW_BID: "Below" }
  return map[a] || a
}

function bsColor(d: string | null | undefined) {
  if (!d || d === "NEUTRAL") return "text-white/30"
  if (d === "BUY") return "text-[#00E85A]"
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
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    if (typeof window === "undefined") return []
    try { return JSON.parse(localStorage.getItem("pb_watchlist") || "[]") } catch { return [] }
  })
  const [wlQuotes, setWlQuotes] = useState<Record<string, { spot: number | null; change: number | null; change_pct: number | null }>>({})
  const [wlSort, setWlSort] = useState<{ key: "symbol" | "price" | "change" | "callFlow" | "putFlow" | "signals" | "lastSignal"; dir: "asc" | "desc" }>({ key: "callFlow", dir: "desc" })
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
  const [presets, setPresets] = useState<FilterPreset[]>(() => {
    if (typeof window === "undefined") return []
    try { return JSON.parse(localStorage.getItem("pb_filter_presets") || "[]") } catch { return [] }
  })
  const [presetName, setPresetName] = useState("")
  const [showSavePreset, setShowSavePreset] = useState(false)
  const [filterDte, setFilterDte] = useState("")
  const [filterSide, setFilterSide] = useState("")
  const [filterUnusualOnly, setFilterUnusualOnly] = useState(false)
  const [filterNoIndex, setFilterNoIndex] = useState(false)
  const [activeFilterCount, setActiveFilterCount] = useState(0)
  const [focusTicker, setFocusTicker] = useState<string | null>(null)
  const [focusStrike, setFocusStrike] = useState<string | null>(null)
  const [focusExpiry, setFocusExpiry] = useState<string | null>(null)
  const lastTradeIdRef = useRef<number>(0)
  const isFirstLoadRef = useRef<boolean>(true)
  const tableContainerRef = useRef<HTMLDivElement>(null)

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
  }, [watchlist])

  const removeFromWatchlist = useCallback((sym: string) => {
    const updated = watchlist.filter(s => s !== sym)
    setWatchlist(updated)
    localStorage.setItem("pb_watchlist", JSON.stringify(updated))
  }, [watchlist])

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

  // Refs to break dep churn — see plan: scanner live-update fix.
  // playBlip via ref so sound toggles don't rebuild fetchData.
  // fetchDataRef so polling/reset effects don't re-run on fetchData identity changes.
  // lastSuccessRef + pollError power the connection-status banner + stale watchdog.
  const playBlipRef = useRef<() => void>(() => {})
  const fetchDataRef = useRef<((opts?: { initial?: boolean; pageNum?: number }) => Promise<void>) | null>(null)
  const lastSuccessRef = useRef<number>(Date.now())
  const [pollError, setPollError] = useState<string | null>(null)
  useEffect(() => { playBlipRef.current = playBlip }, [playBlip])

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
  }

  const resetFilters = () => {
    setFilterGrade(""); setFilterType(""); setFilterOptType(""); setFilterSide("")
    setFilterDte(""); setFilterUnusualOnly(false); setFilterNoIndex(false)
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
    if (opts?.sinceId && opts.sinceId > 0) p.set("since_id", opts.sinceId.toString())
    const pg = opts?.pageNum ?? 0
    if (pg > 0) { p.set("page", pg.toString()); p.set("page_size", "2000") }
    return `/api/scanner/live-flow?${p.toString()}`
  }, [timeRange, filterMinPremium, filterDte])

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

      // Full load (first time, page change, filter change)
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
  }, [page, buildUrl, router])

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
  }, [page, timeRange, filterMinPremium, filterDte])

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
  }, [page])

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
    setActiveFilterCount(c)
  }, [timeRange, filterGrade, filterType, filterOptType, filterMinPremium, filterMinContracts, filterMinVolOi, filterDte, filterSide, filterUnusualOnly, filterNoIndex])

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
    return true
  }, [search, focusTicker, focusStrike, focusExpiry, filterGrade, filterType, filterOptType, filterSide, filterUnusualOnly, filterNoIndex, filterDte, filterMinContracts, filterMinVolOi])

  // Ref so fetchData doesn't rebind on filter changes
  const matchesFilterRef = useRef(matchesFilter)
  useEffect(() => { matchesFilterRef.current = matchesFilter }, [matchesFilter])

  const filtered = useMemo(() => trades.filter(matchesFilter), [trades, matchesFilter])

  // Single-pass aggregation — replaces the 4 separate filter+reduce calls that
  // ran on every render (every 3s). With ~10K filtered rows and unmemoized
  // derived values upstream, the reductions alone showed up as a recurring
  // long task in DevTools Performance every poll cycle.
  const aggregates = useMemo(() => {
    let callCount = 0, putCount = 0, callPrem = 0, putPrem = 0
    for (const t of filtered) {
      if (t.opt_type === "C") { callCount++; callPrem += t.premium }
      else if (t.opt_type === "P") { putCount++; putPrem += t.premium }
    }
    return { callCount, putCount, callPrem, putPrem }
  }, [filtered])
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
    let cp = 0, pp = 0, bull = 0, bear = 0
    for (const t of filtered) {
      if (t.opt_type === "C") cp += t.premium
      else if (t.opt_type === "P") pp += t.premium
      if (t.bullish) bull += t.premium
      else bear += t.premium
    }
    return {
      count: filtered.length,
      bull, bear,
      lean: cp > pp * 1.05 ? "BULL" : pp > cp * 1.05 ? "BEAR" : "MIXED",
      pc_ratio: cp > 0 ? +(pp / cp).toFixed(2) : 0,
    }
  }, [filtered])

  const iconCls = "w-[22px] h-[22px]"
  const sideBtn = (active: boolean) => `w-14 h-14 flex flex-col items-center justify-center gap-0.5 rounded-xl transition-all cursor-pointer ${active ? "bg-white/[0.1] text-white" : "text-white/40 hover:text-white/80 hover:bg-white/[0.06]"}`
  const sideCircle = (active: boolean) => `w-10 h-10 flex items-center justify-center rounded-full transition-all cursor-pointer ${active ? "bg-white/[0.14] text-white" : "bg-white/[0.05] text-white/45 hover:text-white/90 hover:bg-white/[0.1]"}`

  return (
    <div className="h-screen flex text-[#E8EDF5] overflow-hidden" style={{ background: '#1C1B23', fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}>
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
          <button onClick={() => setSoundEnabled(!soundEnabled)} className={sideCircle(soundEnabled)} title={soundEnabled ? "Sound on" : "Sound off"}>
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
                      <span className="w-1 h-1 rounded-full bg-[#00E85A] animate-pulse" />
                      <span className="text-[8px] font-bold tracking-[0.12em] text-[#00E85A]">LIVE</span>
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
                    <span className={`text-[11px] font-mono tabular-nums ${positive ? "text-[#00E85A]" : "text-[#FF605D]"}`}>
                      {positive ? "↗" : "↘"} {positive ? "+" : ""}{delta.toFixed(2)} · {positive ? "+" : ""}{pct.toFixed(2)}%
                    </span>
                  )
                })()}
              </div>
              {[
                { label: "Gamma Flip", value: gexData.gamma_flip != null ? `$${gexData.gamma_flip.toFixed(2)}` : "N/A", cls: gexData.gamma_flip != null ? "text-[#F5820A]" : "text-white/30" },
                { label: "Total Net GEX", value: fmtGexLocal(gexData.total_net_gex), cls: gexData.total_net_gex >= 0 ? "text-[#00E85A]" : "text-[#FF605D]" },
                { label: "Gamma Slope", value: gexData.gamma_slope != null ? fmtGexLocal(gexData.gamma_slope) : "N/A", cls: gexData.gamma_slope != null ? "text-white" : "text-white/30" },
                { label: "Slope Strike", value: gexData.slope_strike != null ? `$${gexData.slope_strike.toFixed(2)}` : "N/A", cls: gexData.slope_strike != null ? "text-white" : "text-white/30" },
                { label: "Max +GEX", value: gexData.max_plus_gex ? fmtGexLocal(gexData.max_plus_gex.gex) : "N/A", cls: gexData.max_plus_gex ? "text-[#00E85A]" : "text-white/30", sub: gexData.max_plus_gex ? `@ $${gexData.max_plus_gex.strike.toFixed(2)}` : undefined },
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
                { label: "CALL γ", value: gexData.total_call_gex, color: "#00E85A" },
                { label: "PUT γ", value: gexData.total_put_gex, color: "#FF605D" },
                { label: "Near DTE", value: gexData.near_dte_gex, color: gexData.near_dte_gex >= 0 ? "#00E85A" : "#FF605D", note: "≤7d" },
                { label: "Far DTE", value: gexData.far_dte_gex, color: gexData.far_dte_gex >= 0 ? "#00E85A" : "#FF605D", note: ">7d" },
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
                    <span className="font-mono font-bold tabular-nums" style={{ color: positive ? "#00E85A" : "#FF605D" }}>
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
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono tabular-nums whitespace-nowrap border ${positive ? "bg-[#00E85A]/[0.06] border-[#00E85A]/25 text-[#00E85A]" : "bg-[#FF605D]/[0.06] border-[#FF605D]/25 text-[#FF605D]"}`}>
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
                          <span className={`text-[10px] font-mono font-medium ${intensity > 0.35 ? "text-white" : gex > 0 ? "text-[#00E85A]/80" : "text-[#FF605D]/80"}`}>
                            {fmtGex(gex)}
                          </span>
                        )}
                      </div>
                    )
                  }),

                  <div key={`t-${strike}`} className="px-2 flex items-center justify-end border-b border-white/[0.04]"
                    style={{ minHeight: 24, borderLeft: "1px solid rgba(255,255,255,0.06)", ...(isAtm ? { background: "rgba(255,255,255,0.035)" } : {}) }}>
                    <span className={`text-[11px] font-mono font-semibold ${rowTotal >= 0 ? "text-[#00E85A]" : "text-[#FF605D]"}`}>
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
})()      ) : activePage === "watchlist" ? (
        <div className="flex-1 flex flex-col overflow-hidden" style={{ background: "#242428" }}>
          {/* Watchlist v2 — desk view header */}
          <div className="px-5 py-3 border-b border-[#35343F] flex items-center gap-3 flex-shrink-0">
            <div className="text-[9px] font-bold text-[#4A5A72] tracking-[0.15em] uppercase">Watchlist</div>
            <div className="text-[10px] text-[#3D4D63]">{watchlist.length} symbols</div>
            <div className="ml-auto flex items-center gap-2">
              <input
                placeholder="Add — paste list ok (AAPL, MSFT)"
                value={wlInput}
                onChange={e => setWlInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && wlInput) { addToWatchlist(wlInput); setWlInput("") } }}
                className="bg-[#080C14] border border-[#1E2A3A] rounded-md px-3 py-1.5 text-[12px] text-white placeholder-[#3D4D63] focus:outline-none focus:border-[#FF8A00]/50 w-72"
              />
              {watchlist.length > 0 && (
                <button
                  onClick={() => {
                    if (confirm(`Clear all ${watchlist.length} symbols?`)) {
                      setWatchlist([])
                      localStorage.setItem("pb_watchlist", "[]")
                    }
                  }}
                  className="text-[11px] text-[#7A8BA8] hover:text-[#FF605D] border border-[#1E2A3A] hover:border-[#FF605D]/40 rounded-md px-2 py-1.5 transition-colors"
                  title="Clear watchlist"
                >Clear</button>
              )}
            </div>
          </div>
          {/* Watchlist body */}
          <div className="flex-1 overflow-y-auto">
            {watchlist.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-6 py-16">
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#3D4D63] mb-3">Empty watchlist</div>
                <div className="text-base font-semibold text-white/80 mb-2">Add tickers to track institutional flow</div>
                <div className="text-[12px] text-[#7A8BA8] max-w-sm leading-relaxed mb-5">
                  Live price, today&apos;s call/put flow, top trade, and signal velocity — all in one row per symbol.
                </div>
                <div className="text-[10px] uppercase tracking-[0.14em] text-[#3D4D63] mb-2">Try popular tickers</div>
                <div className="flex flex-wrap gap-1.5 max-w-md justify-center">
                  {["SPY","QQQ","NVDA","TSLA","AAPL","META","AMD","MSFT","GOOGL","COIN","PLTR","MSTR"].map(t => (
                    <button key={t}
                      onClick={() => addToWatchlist(t)}
                      className="text-[11px] font-mono font-bold text-[#7A8BA8] hover:text-white border border-[#1E2A3A] hover:border-[#FF8A00]/40 rounded px-2 py-1 transition-colors">
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            ) : (() => {
              const fmtTime = (ts: number) => {
                const diffSec = Math.floor((Date.now() / 1000) - ts)
                if (diffSec < 60) return `${diffSec}s`
                if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m`
                if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h`
                return `${Math.floor(diffSec / 86400)}d`
              }
              const rows = watchlist.map(sym => {
                const symTrades = trades.filter(t => t.symbol === sym)
                const calls = symTrades.filter(t => t.opt_type === "C")
                const puts = symTrades.filter(t => t.opt_type === "P")
                const callPrem = calls.reduce((s, t) => s + t.premium, 0)
                const putPrem = puts.reduce((s, t) => s + t.premium, 0)
                const count = symTrades.length
                const isBull = callPrem > putPrem * 1.3
                const isBear = putPrem > callPrem * 1.3
                const topTrade = symTrades.length
                  ? symTrades.reduce((max, t) => t.premium > max.premium ? t : max, symTrades[0])
                  : null
                const lastSignalTs = symTrades.length
                  ? Math.max(...symTrades.map(t => Math.floor(new Date(t.date_time).getTime() / 1000)))
                  : 0
                const quote = wlQuotes[sym] || { spot: null, change: null, change_pct: null }
                return { sym, callPrem, putPrem, count, isBull, isBear, topTrade, lastSignalTs, quote }
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
                  className={`px-3 py-2 text-[9px] font-bold tracking-[0.1em] uppercase transition-colors flex items-center gap-1 ${wlSort.key === k ? "text-white" : "text-[#3D4D63] hover:text-[#7A8BA8]"} ${align === "right" ? "justify-end" : align === "center" ? "justify-center" : ""}`}>
                  {label}
                  {wlSort.key === k && <span className="text-[8px]">{wlSort.dir === "desc" ? "▼" : "▲"}</span>}
                </button>
              )
              return (
                <div>
                  <div className="grid sticky top-0 z-10 border-b border-[#35343F]" style={{ gridTemplateColumns: "200px 110px 110px 1fr 100px 100px 90px 90px 110px", background: "#242428" }}>
                    <SortHead k="symbol" label="Symbol" />
                    <SortHead k="price" label="Price" align="right" />
                    <SortHead k="change" label="Δ %" align="right" />
                    <div className="px-3 py-2 text-[9px] font-bold tracking-[0.1em] uppercase text-[#3D4D63]">Top trade today</div>
                    <SortHead k="callFlow" label="Call Flow" align="right" />
                    <SortHead k="putFlow" label="Put Flow" align="right" />
                    <SortHead k="signals" label="Signals" align="center" />
                    <SortHead k="lastSignal" label="Last" align="center" />
                    <div className="px-3 py-2 text-[9px] font-bold tracking-[0.1em] uppercase text-[#3D4D63] text-right">Actions</div>
                  </div>
                  {rows.map(r => {
                    const { sym, callPrem, putPrem, count, isBull, isBear, topTrade, lastSignalTs, quote } = r
                    const changeColor = (quote.change_pct ?? 0) > 0 ? "#00E85A" : (quote.change_pct ?? 0) < 0 ? "#FF605D" : "#7A8BA8"
                    return (
                      <div key={sym} className="grid border-b border-[#2D2C38] hover:bg-white/[0.04] transition-colors group" style={{ gridTemplateColumns: "200px 110px 110px 1fr 100px 100px 90px 90px 110px", minHeight: 48 }}>
                        <div className="px-5 flex items-center gap-2">
                          <span className="text-sm font-bold text-white tracking-tight">{sym}</span>
                          {count > 0 && (
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wider ${isBull ? "bg-[#00E85A]/15 text-[#00E85A]" : isBear ? "bg-[#FF605D]/15 text-[#FF605D]" : "bg-white/5 text-[#7A8BA8]"}`}>
                              {isBull ? "BULL" : isBear ? "BEAR" : "MIX"}
                            </span>
                          )}
                        </div>
                        <div className="px-3 flex items-center justify-end">
                          <span className="text-[12px] font-mono tabular-nums text-white">
                            {quote.spot != null ? `$${quote.spot.toFixed(2)}` : <span className="text-[#3D4D63]">—</span>}
                          </span>
                        </div>
                        <div className="px-3 flex items-center justify-end">
                          {quote.change_pct != null ? (
                            <span className="text-[11px] font-mono tabular-nums font-semibold" style={{ color: changeColor }}>
                              {quote.change_pct > 0 ? "▲ +" : quote.change_pct < 0 ? "▼ " : ""}{quote.change_pct.toFixed(2)}%
                            </span>
                          ) : <span className="text-[11px] text-[#3D4D63]">—</span>}
                        </div>
                        <div className="px-3 flex items-center min-w-0">
                          {topTrade ? (
                            <div className="text-[11px] font-mono truncate text-white/70">
                              <span className="font-bold" style={{ color: topTrade.opt_type === "C" ? "#00E85A" : "#FF605D" }}>{fmtPrem(topTrade.premium)}</span>
                              {" "}{topTrade.opt_type === "C" ? "calls" : "puts"} · {topTrade.flow_type ?? ""}
                              {topTrade.grade ? <span className={`ml-1 px-1 rounded ${topTrade.grade === "A" ? "bg-[#00E85A]/15 text-[#00E85A]" : "bg-[#48DEFF]/15 text-[#48DEFF]"}`}>Grade {topTrade.grade}</span> : null}
                            </div>
                          ) : <span className="text-[11px] text-[#3D4D63]">No flow today</span>}
                        </div>
                        <div className="px-3 flex items-center justify-end">
                          <span className={`text-[11px] font-mono tabular-nums font-semibold ${callPrem > 0 ? "text-[#00E85A]" : "text-[#3D4D63]"}`}>
                            {callPrem > 0 ? fmtPrem(callPrem) : "—"}
                          </span>
                        </div>
                        <div className="px-3 flex items-center justify-end">
                          <span className={`text-[11px] font-mono tabular-nums font-semibold ${putPrem > 0 ? "text-[#FF605D]" : "text-[#3D4D63]"}`}>
                            {putPrem > 0 ? fmtPrem(putPrem) : "—"}
                          </span>
                        </div>
                        <div className="px-3 flex items-center justify-center">
                          <span className="text-[11px] text-[#7A8BA8] font-mono tabular-nums">{count || "—"}</span>
                        </div>
                        <div className="px-3 flex items-center justify-center">
                          <span className="text-[11px] text-[#7A8BA8] font-mono tabular-nums">
                            {lastSignalTs ? fmtTime(lastSignalTs) : "—"}
                          </span>
                        </div>
                        <div className="px-3 flex items-center justify-end gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => { setSearch(sym); setSearchInput(sym); setPage(0); setActivePage("scanner") }}
                            title="Filter scanner to this symbol"
                            className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 text-[#7A8BA8] hover:text-white transition-colors"
                          ><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg></button>
                          <a
                            href={`/options-flow/${sym}`}
                            title="Open per-ticker page"
                            className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 text-[#7A8BA8] hover:text-white transition-colors"
                          ><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>
                          <button
                            onClick={() => { setGexSymbol(sym); setActivePage("heatmap") }}
                            title="View GEX heatmap"
                            className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 text-[#7A8BA8] hover:text-white transition-colors"
                          ><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg></button>
                          <button
                            onClick={() => removeFromWatchlist(sym)}
                            title="Remove"
                            className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#FF605D]/15 text-[#3D4D63] hover:text-[#FF605D] transition-colors text-base leading-none"
                          >×</button>
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
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white/[0.08] border-[1.5px] border-white/[0.15] rounded-xl px-3.5 gap-2 focus-within:border-white/[0.3] focus-within:shadow-none transition-all" style={{ maxWidth: 280 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input
              type="text"
              placeholder="Search ticker..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value.toUpperCase())}
              onKeyDown={e => { if (e.key === "Enter") { setSearch(searchInput); setPage(0) } if (e.key === "Escape") { setSearchInput(""); setSearch("") } }}
              className="bg-transparent border-none outline-none text-white text-[13px] font-mono tracking-wide py-2.5 w-full placeholder-white/40"
            />
            <span className="text-[9px] text-white/40 border border-white/[0.15] rounded px-1.5 py-0.5 font-mono flex-shrink-0">ENTER</span>
          </div>
          <div className="w-px h-7 bg-white/[0.06]" />
          <button onClick={() => setShowFilters(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[13px] font-medium text-white border border-white/[0.15] hover:border-white/[0.3] hover:bg-white/[0.12] transition-all" style={{ background: "rgba(255,255,255,0.08)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2"><path strokeLinecap="round" d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/></svg>
            Filters
            {activeFilterCount > 0 && <span className="bg-[#FF605D] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{activeFilterCount}</span>}
          </button>
        </div>
        <div className="ml-auto flex items-center gap-4">
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
          <div className="grid border-b border-white/[0.06] flex-shrink-0" style={{ gridTemplateColumns: '1fr 1px 1fr 1px 1fr 1px 1fr', background: '#1C1B23' }}>

            {/* Flow sentiment */}
            <div className="px-5 py-3 flex items-center gap-4">
              <AnimatedCircularProgressBar
                value={Math.round(bullPct)}
                max={100}
                min={0}
                gaugePrimaryColor={isBull ? "#00E85A" : displayStats.lean === "BEAR" ? "#FF605D" : "#48DEFF"}
                gaugeSecondaryColor="rgba(255,255,255,0.06)"
                className="!size-[52px] !text-[11px]"
              />
              <div>
                <div className="text-[12px] text-white/50 mb-1">Flow sentiment</div>
                <span className={`text-[24px] font-semibold leading-none ${isBull ? "text-[#00E85A]" : displayStats.lean === "BEAR" ? "text-[#FF605D]" : "text-white/90"}`}>
                  {isBull ? "Bullish" : displayStats.lean === "BEAR" ? "Bearish" : "Mixed"}
                </span>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.06)' }} />

            {/* Put to call */}
            <div className="px-5 py-3 flex items-center gap-4">
              <AnimatedCircularProgressBar
                value={Math.min(Math.round(displayStats.pc_ratio * 50), 100)}
                max={100}
                min={0}
                gaugePrimaryColor="#48DEFF"
                gaugeSecondaryColor="rgba(255,255,255,0.06)"
                className="!size-[52px] !text-[11px]"
              />
              <div>
                <div className="text-[12px] text-white/50 mb-1">Put to call</div>
                <div className="text-[24px] font-semibold text-white leading-none font-mono">{displayStats.pc_ratio.toFixed(3)}</div>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.06)' }} />

            {/* Call flow */}
            <div className="px-5 py-3 flex items-center gap-4">
              <AnimatedCircularProgressBar
                value={callSharePct}
                max={100}
                min={0}
                gaugePrimaryColor="#00E85A"
                gaugeSecondaryColor="rgba(255,255,255,0.06)"
                className="!size-[52px] !text-[11px]"
              />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[12px] text-white/50">Call flow</span>
                  <span className="text-[13px] font-semibold text-[#00E85A] font-mono">{fmtPrem(callPrem)}</span>
                </div>
                <div className="text-[24px] font-semibold text-white leading-none font-mono">{calls.toLocaleString()}</div>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.06)' }} />

            {/* Put flow */}
            <div className="px-5 py-3 flex items-center gap-4">
              <AnimatedCircularProgressBar
                value={putSharePct}
                max={100}
                min={0}
                gaugePrimaryColor="#FF605D"
                gaugeSecondaryColor="rgba(255,255,255,0.06)"
                className="!size-[52px] !text-[11px]"
              />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[12px] text-white/50">Put flow</span>
                  <span className="text-[13px] font-semibold text-[#FF605D] font-mono">{fmtPrem(putPrem)}</span>
                </div>
                <div className="text-[24px] font-semibold text-white leading-none font-mono">{puts.toLocaleString()}</div>
              </div>
            </div>

          </div>
        )
      })()}

      {/* ── TABLE ── */}
      <div ref={tableContainerRef} className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none", fontVariantNumeric: "tabular-nums", background: '#1C1B23' }}>
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
                    <td className="px-2 py-2 text-center text-[12px] font-semibold" style={{ color: t.row_color === 'bullish' ? '#00E85A' : '#FF605D' }}>
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
                    <td className="px-2 py-2 text-right text-[12px] font-bold" style={{ color: t.row_color === 'bullish' ? '#00E85A' : '#FF605D' }}>
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
            <>Page <span className="text-[#7A8BA8] font-medium">{clientPage + 1}</span> of <span className="text-[#7A8BA8] font-medium">{totalClientPages}</span> · {filtered.length.toLocaleString()} signals</>
          ) : (
            page === 0
              ? <>{filtered.length.toLocaleString()} signals</>
              : <>Page <span className="text-[#7A8BA8] font-medium">{page + 1}</span> · {timeRange.replace("_", " ")}</>
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
          <div className="w-[340px] h-full overflow-y-auto" style={{ background: '#23222D', borderLeft: '1px solid rgba(255,255,255,0.06)' }}
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
                <button onClick={resetFilters} className="text-[12px] text-[#48DEFF] hover:underline">Reset</button>
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
                <div className="text-[10px] font-semibold tracking-[0.14em] uppercase text-white/30 mb-3">Time range</div>
                <div className="grid grid-cols-4 gap-1.5">
                  {TIME_RANGES.map(tr => (
                    <button
                      key={tr.key}
                      onClick={() => { setTimeRange(tr.key); setPage(0); setClientPage(0) }}
                      className={`text-[11px] font-medium py-2 rounded-lg border transition-all ${
                        timeRange === tr.key
                          ? "bg-[#F97316]/15 border-[#F97316]/40 text-[#F97316]"
                          : "bg-white/[0.04] border-white/[0.08] text-white/50 hover:border-white/[0.15] hover:text-white/70"
                      }`}
                    >
                      {tr.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── SAVED PRESETS ── */}
              <div>
                <div className="text-[10px] font-semibold tracking-[0.14em] uppercase text-white/30 mb-3">Saved presets</div>
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
                        className="px-2.5 py-1.5 bg-[#48DEFF] text-[#1C1B23] rounded-md text-[11px] font-semibold hover:bg-[#6ee8ff]">Save</button>
                      <button onClick={() => { setShowSavePreset(false); setPresetName("") }}
                        className="text-white/30 hover:text-white/60 text-[12px]">✕</button>
                    </div>
                  )}
                </div>
              </div>

              {/* ── DIRECTION ── */}
              <div>
                <div className="text-[10px] font-semibold tracking-[0.14em] uppercase text-white/30 mb-3">Direction</div>
                <div className="space-y-0">
                  <div className="flex items-center justify-between py-2.5 border-b border-white/[0.04]">
                    <div>
                      <div className="text-[14px] text-white font-medium">Calls only</div>
                      <div className="text-[12px] text-white/35">Show call options only</div>
                    </div>
                    <div className={`w-[44px] h-[24px] rounded-full relative cursor-pointer transition-colors ${filterOptType === "C" ? "bg-[#00E85A]" : "bg-white/[0.08]"}`}
                      onClick={() => setFilterOptType(filterOptType === "C" ? "" : "C")}>
                      <div className={`w-5 h-5 bg-white rounded-full absolute top-[2px] shadow transition-transform ${filterOptType === "C" ? "translate-x-[20px]" : "translate-x-[2px]"}`} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2.5">
                    <div>
                      <div className="text-[14px] text-white font-medium">Puts only</div>
                      <div className="text-[12px] text-white/35">Show put options only</div>
                    </div>
                    <div className={`w-[44px] h-[24px] rounded-full relative cursor-pointer transition-colors ${filterOptType === "P" ? "bg-[#FF605D]" : "bg-white/[0.08]"}`}
                      onClick={() => setFilterOptType(filterOptType === "P" ? "" : "P")}>
                      <div className={`w-5 h-5 bg-white rounded-full absolute top-[2px] shadow transition-transform ${filterOptType === "P" ? "translate-x-[20px]" : "translate-x-[2px]"}`} />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── FLOW TYPE ── */}
              <div>
                <div className="text-[10px] font-semibold tracking-[0.14em] uppercase text-white/30 mb-3">Flow type</div>
                <div className="space-y-0">
                  <div className="flex items-center justify-between py-2.5 border-b border-white/[0.04]">
                    <div>
                      <div className="text-[14px] text-white font-medium">Sweeps only</div>
                      <div className="text-[12px] text-white/35">Multi-leg aggressive fills</div>
                    </div>
                    <div className={`w-[44px] h-[24px] rounded-full relative cursor-pointer transition-colors ${filterType === "SWEEP" ? "bg-[#48DEFF]" : "bg-white/[0.08]"}`}
                      onClick={() => setFilterType(filterType === "SWEEP" ? "" : "SWEEP")}>
                      <div className={`w-5 h-5 bg-white rounded-full absolute top-[2px] shadow transition-transform ${filterType === "SWEEP" ? "translate-x-[20px]" : "translate-x-[2px]"}`} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2.5">
                    <div>
                      <div className="text-[14px] text-white font-medium">Blocks only</div>
                      <div className="text-[12px] text-white/35">Single-fill large orders</div>
                    </div>
                    <div className={`w-[44px] h-[24px] rounded-full relative cursor-pointer transition-colors ${filterType === "BLOCK" ? "bg-[#48DEFF]" : "bg-white/[0.08]"}`}
                      onClick={() => setFilterType(filterType === "BLOCK" ? "" : "BLOCK")}>
                      <div className={`w-5 h-5 bg-white rounded-full absolute top-[2px] shadow transition-transform ${filterType === "BLOCK" ? "translate-x-[20px]" : "translate-x-[2px]"}`} />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── SIGNAL QUALITY ── */}
              <div>
                <div className="text-[10px] font-semibold tracking-[0.14em] uppercase text-white/30 mb-3">Signal quality</div>
                <div className="space-y-0">
<div className="flex items-center justify-between py-2.5 border-b border-white/[0.04]">
                    <div>
                      <div className="text-[14px] text-white font-medium">Unusual only</div>
                      <div className="text-[12px] text-white/35">V/OI flagged activity</div>
                    </div>
                    <div className={`w-[44px] h-[24px] rounded-full relative cursor-pointer transition-colors ${filterUnusualOnly ? "bg-[#48DEFF]" : "bg-white/[0.08]"}`}
                      onClick={() => setFilterUnusualOnly(!filterUnusualOnly)}>
                      <div className={`w-5 h-5 bg-white rounded-full absolute top-[2px] shadow transition-transform ${filterUnusualOnly ? "translate-x-[20px]" : "translate-x-[2px]"}`} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2.5">
                    <div>
                      <div className="text-[14px] text-white font-medium">No index</div>
                      <div className="text-[12px] text-white/35">Hide SPX, SPXW, NDX, RUT, VIX</div>
                    </div>
                    <div className={`w-[44px] h-[24px] rounded-full relative cursor-pointer transition-colors ${filterNoIndex ? "bg-[#48DEFF]" : "bg-white/[0.08]"}`}
                      onClick={() => setFilterNoIndex(!filterNoIndex)}>
                      <div className={`w-5 h-5 bg-white rounded-full absolute top-[2px] shadow transition-transform ${filterNoIndex ? "translate-x-[20px]" : "translate-x-[2px]"}`} />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── SIDE ── */}
              <div>
                <div className="text-[10px] font-semibold tracking-[0.14em] uppercase text-white/30 mb-3">Side</div>
                <div className="space-y-0">
                  <div className="flex items-center justify-between py-2.5 border-b border-white/[0.04]">
                    <div>
                      <div className="text-[14px] text-white font-medium">Above ask only</div>
                      <div className="text-[12px] text-white/35">Most aggressive — paid above ask</div>
                    </div>
                    <div className={`w-[44px] h-[24px] rounded-full relative cursor-pointer transition-colors ${filterSide === "ABOVE_ASK" ? "bg-[#00E85A]" : "bg-white/[0.08]"}`}
                      onClick={() => setFilterSide(filterSide === "ABOVE_ASK" ? "" : "ABOVE_ASK")}>
                      <div className={`w-5 h-5 bg-white rounded-full absolute top-[2px] shadow transition-transform ${filterSide === "ABOVE_ASK" ? "translate-x-[20px]" : "translate-x-[2px]"}`} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2.5 border-b border-white/[0.04]">
                    <div>
                      <div className="text-[14px] text-white font-medium">At ask only</div>
                      <div className="text-[12px] text-white/35">Aggressive buys at the ask</div>
                    </div>
                    <div className={`w-[44px] h-[24px] rounded-full relative cursor-pointer transition-colors ${filterSide === "AT_ASK" ? "bg-[#48DEFF]" : "bg-white/[0.08]"}`}
                      onClick={() => setFilterSide(filterSide === "AT_ASK" ? "" : "AT_ASK")}>
                      <div className={`w-5 h-5 bg-white rounded-full absolute top-[2px] shadow transition-transform ${filterSide === "AT_ASK" ? "translate-x-[20px]" : "translate-x-[2px]"}`} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2.5">
                    <div>
                      <div className="text-[14px] text-white font-medium">At bid only</div>
                      <div className="text-[12px] text-white/35">Sells hitting the bid</div>
                    </div>
                    <div className={`w-[44px] h-[24px] rounded-full relative cursor-pointer transition-colors ${filterSide === "AT_BID" ? "bg-[#FF605D]" : "bg-white/[0.08]"}`}
                      onClick={() => setFilterSide(filterSide === "AT_BID" ? "" : "AT_BID")}>
                      <div className={`w-5 h-5 bg-white rounded-full absolute top-[2px] shadow transition-transform ${filterSide === "AT_BID" ? "translate-x-[20px]" : "translate-x-[2px]"}`} />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── RANGE FILTERS ── */}
              <div>
                <div className="text-[10px] font-semibold tracking-[0.14em] uppercase text-white/30 mb-3">Range filters</div>

                {/* Min Premium */}
                <div className="mb-5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[13px] text-white/70 font-medium">Min premium</span>
                    <span className="text-[13px] text-[#48DEFF] font-semibold font-mono">
                      {({"": "Any", "50000": "$50K", "100000": "$100K", "200000": "$200K", "500000": "$500K", "1000000": "$1M", "5000000": "$5M+"} as Record<string, string>)[filterMinPremium] || "Any"}
                    </span>
                  </div>
                  <input type="range" min={0} max={6} step={1}
                    value={({"": 0, "50000": 1, "100000": 2, "200000": 3, "500000": 4, "1000000": 5, "5000000": 6} as Record<string, number>)[filterMinPremium] ?? 0}
                    onChange={e => setFilterMinPremium(["", "50000", "100000", "200000", "500000", "1000000", "5000000"][Number(e.target.value)])}
                    className="w-full h-1 rounded-full appearance-none cursor-pointer"
                    style={{ background: 'rgba(255,255,255,0.06)', accentColor: '#48DEFF' }} />
                  <div className="flex justify-between mt-1">
                    {["Any", "$50K", "$100K", "$200K", "$500K", "$1M", "$5M+"].map(l => (
                      <span key={l} className="text-[9px] text-white/20 font-mono">{l}</span>
                    ))}
                  </div>
                </div>

                {/* Min Contracts */}
                <div className="mb-5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[13px] text-white/70 font-medium">Min contracts</span>
                    <span className="text-[13px] text-[#48DEFF] font-semibold font-mono">
                      {filterMinContracts === 0 ? "Any" : filterMinContracts.toLocaleString()}
                    </span>
                  </div>
                  <input type="range" min={0} max={2000} step={50}
                    value={filterMinContracts}
                    onChange={e => setFilterMinContracts(Number(e.target.value))}
                    className="w-full h-1 rounded-full appearance-none cursor-pointer"
                    style={{ background: 'rgba(255,255,255,0.06)', accentColor: '#48DEFF' }} />
                  <div className="flex justify-between mt-1">
                    {["0", "500", "1K", "1.5K", "2K"].map(l => (
                      <span key={l} className="text-[9px] text-white/20 font-mono">{l}</span>
                    ))}
                  </div>
                </div>

                {/* Max DTE */}
                <div className="mb-5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[13px] text-white/70 font-medium">Max DTE</span>
                    <span className="text-[13px] text-[#48DEFF] font-semibold font-mono">
                      {filterDte === "0dte" ? "0DTE" : filterDte === "1-7" ? "7d" : filterDte === "8-30" ? "30d" : filterDte === "30+" ? "30d+" : "All"}
                    </span>
                  </div>
                  <input type="range" min={0} max={4} step={1}
                    value={({"": 0, "0dte": 1, "1-7": 2, "8-30": 3, "30+": 4} as Record<string, number>)[filterDte] ?? 0}
                    onChange={e => setFilterDte(["", "0dte", "1-7", "8-30", "30+"][Number(e.target.value)])}
                    className="w-full h-1 rounded-full appearance-none cursor-pointer"
                    style={{ background: 'rgba(255,255,255,0.06)', accentColor: '#48DEFF' }} />
                  <div className="flex justify-between mt-1">
                    {["All", "0DTE", "1-7d", "8-30d", "30d+"].map(l => (
                      <span key={l} className="text-[9px] text-white/20 font-mono">{l}</span>
                    ))}
                  </div>
                </div>

                {/* Min V/OI Ratio */}
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[13px] text-white/70 font-medium">Min V/OI ratio</span>
                    <span className="text-[13px] text-[#48DEFF] font-semibold font-mono">
                      {filterMinVolOi === 0 ? "Any" : (filterMinVolOi / 10).toFixed(1) + "x"}
                    </span>
                  </div>
                  <input type="range" min={0} max={50} step={5}
                    value={filterMinVolOi}
                    onChange={e => setFilterMinVolOi(Number(e.target.value))}
                    className="w-full h-1 rounded-full appearance-none cursor-pointer"
                    style={{ background: 'rgba(255,255,255,0.06)', accentColor: '#48DEFF' }} />
                  <div className="flex justify-between mt-1">
                    {["Any", "1x", "2x", "3x", "4x", "5x"].map(l => (
                      <span key={l} className="text-[9px] text-white/20 font-mono">{l}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── APPLY BUTTON ── */}
              <button onClick={() => setShowFilters(false)}
                className="w-full py-2.5 bg-[#48DEFF] text-[#1C1B23] rounded-lg text-[13px] font-semibold hover:bg-[#6ee8ff] active:scale-[0.98] transition-all">
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
            <div className="text-sm text-[#7A8BA8] mb-6 leading-relaxed">
              Real-time GEX heatmaps, gamma wall detection, and squeeze identification are available on the Pro plan.
            </div>
            <Link href="/#pricing" className="block w-full text-center py-3 rounded-lg bg-[#FF8A00] text-black font-bold text-[15px] hover:bg-[#e57309] transition-colors">
              Upgrade to Pro
            </Link>
            <button onClick={() => setShowUpgradeModal(false)} className="block w-full text-center py-2 mt-3 text-[#4A5A72] text-[15px] hover:text-[#7A8BA8] transition-colors">
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
