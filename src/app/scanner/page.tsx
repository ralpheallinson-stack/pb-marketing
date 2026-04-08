"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useVirtualizer } from "@tanstack/react-virtual"

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
  delta?: number | null
  whale?: boolean
  aggression?: string | null
  structure?: string | null
  structure_confidence?: number | null
  trade_direction?: string | null
  is_event_driven?: boolean
  adv_multiple?: number | null
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
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(1)}B`
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

/* ── pill base: text-[10px] font-semibold tracking-wide uppercase border rounded-sm px-1.5 py-0.5 ── */
const PILL = "inline-flex items-center px-1.5 py-0.5 rounded-sm text-[10px] font-semibold tracking-wide uppercase border"

function condBadges(t: Trade): { label: string; cls: string }[] {
  const pills: { label: string; cls: string }[] = []

  // PILL 1 — Flow type (always)
  if (t.flow_type === "SWEEP") pills.push({ label: "SWEEP", cls: `${PILL} bg-[#eab308]/15 text-[#eab308] border-[#eab308]/40` })
  else if (t.premium >= 1000000 && t.flow_type === "BLOCK") pills.push({ label: "BLOCK 1M+", cls: `${PILL} bg-[#60a5fa]/25 text-[#60a5fa] border-[#60a5fa]/60 font-bold` })
  else if (t.flow_type === "BLOCK") pills.push({ label: "BLOCK", cls: `${PILL} bg-[#60a5fa]/15 text-[#60a5fa] border-[#60a5fa]/40` })

  // PILL 2 — Signal flag (highest priority one)
  if (t.whale) pills.push({ label: "WHALE", cls: `${PILL} bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/40` })
  else if (t.mm_suspected) pills.push({ label: "MM FILTER", cls: `${PILL} bg-white/[0.08] text-white/40 border-white/15` })
  else if (t.high_conviction) pills.push({ label: "HIGH CONV", cls: `${PILL} bg-[#f97316]/15 text-[#f97316] border-[#f97316]/40` })
  else if (t.accum_hits > 0) pills.push({ label: `ACCUM ${t.accum_hits}x`, cls: `${PILL} bg-[#a855f7]/15 text-[#a855f7] border-[#a855f7]/40` })
  else if ((t.vol_oi ?? 0) >= 2.0) pills.push({ label: "HIGH V/OI", cls: `${PILL} bg-[#22d3ee]/15 text-[#22d3ee] border-[#22d3ee]/40` })
  else if ((t.adv_multiple ?? 0) >= 1.0) pills.push({ label: `VOL ${(t.adv_multiple ?? 0).toFixed(1)}x`, cls: `${PILL} bg-[#22d3ee]/15 text-[#22d3ee] border-[#22d3ee]/40` })

  // PILL 3 — Position / structure
  if (t.structure && t.structure !== "SINGLE_LEG" && (t.structure_confidence ?? 0) >= 0.5) {
    const label = t.structure.replace(/_/g, " ").replace("VERTICAL SPREAD", "SPREAD").replace("CALENDAR SPREAD", "CALENDAR").replace("DIAGONAL SPREAD", "DIAGONAL")
    pills.push({ label, cls: `${PILL} bg-white/[0.08] text-white/50 border-white/15` })
  } else if (t.position_action === "OPENING") pills.push({ label: "OPENING", cls: `${PILL} bg-white/[0.05] text-white/35 border-transparent` })
  else if (t.position_action === "ADJUSTING") pills.push({ label: "ADJUSTING", cls: `${PILL} bg-white/[0.05] text-white/35 border-transparent` })

  return pills.slice(0, 3)
}

function fmtExpiry(exp: string) {
  const parts = exp.split("-")
  if (parts.length === 3) return `${parts[1]}/${parts[2]}/${parts[0].slice(2)}`
  return exp
}

function aggrColor(a: string | null | undefined) {
  if (!a) return "text-white/50"
  if (a === "ABOVE_ASK" || a === "AT_ASK") return "text-[#22c55e]"
  if (a === "BELOW_BID" || a === "AT_BID") return "text-[#ef4444]"
  return "text-white/50"
}

function aggrLabel(a: string | null | undefined) {
  if (!a) return "—"
  const map: Record<string, string> = { ABOVE_ASK: "Above", AT_ASK: "Ask", AT_BID: "Bid", BELOW_BID: "Below", NEUTRAL: "Mid" }
  return map[a] || a
}

/* ── time ranges (moved to filter panel) ── */
const TIME_RANGES = [
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "last_week", label: "Last Week" },
  { key: "month", label: "Month" },
] as const

const COLS = [
  { key: "time",   label: "Time",   width: 92,  cls: "text-left px-3" },
  { key: "tick",   label: "Tick",   width: 80,  cls: "text-left px-2" },
  { key: "expiry", label: "Expiry", width: 75,  cls: "text-left px-2" },
  { key: "strike", label: "Strike", width: 62,  cls: "text-right px-2" },
  { key: "cp",     label: "C/P",    width: 44,  cls: "text-center px-2" },
  { key: "side",   label: "Side",   width: 52,  cls: "text-center px-2" },
  { key: "bs",     label: "B/S",    width: 44,  cls: "text-center px-2" },
  { key: "spot",   label: "Spot",   width: 90,  cls: "text-right px-2" },
  { key: "size",   label: "Size",   width: 56,  cls: "text-right px-2" },
  { key: "type",   label: "Type",   width: 80,  cls: "text-center px-2" },
  { key: "value",  label: "Value",  width: 68,  cls: "text-right px-2" },
  { key: "vol",    label: "Volume", width: 72,  cls: "text-right px-2" },
  { key: "oi",     label: "OI",     width: 62,  cls: "text-right px-2" },
  { key: "iv",     label: "IV",     width: 44,  cls: "text-right px-2" },
  { key: "conds",  label: "Conds",  width: 200, cls: "text-left px-2" },
] as const

/* ── page ── */
export default function ScannerPage() {
  const router = useRouter()
  const [trades, setTrades] = useState<Trade[]>([])
  const [stats, setStats] = useState<Stats>({ count: 0, bull: 0, bear: 0, lean: "MIXED", pc_ratio: 0 })
  const [timeRange, setTimeRange] = useState("today")
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [live, setLive] = useState(isMarketOpen())
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [activePage, setActivePage] = useState<"scanner" | "heatmap" | "watchlist">("scanner")
  const [canAccessGamma, setCanAccessGamma] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [gexSymbol, setGexSymbol] = useState("SPY")
  const [gexData, setGexData] = useState<{ symbol: string; spot: number; spot_fmt: string; expirations: string[]; strikes: number[]; matrix: Record<string, Record<string, { net_gex: number; call_oi: number; put_oi: number; has_greeks?: boolean }>>; max_abs_gex: number; zero_gamma_strike: number | null; top_cells: { strike: number; expiry: string; net_gex: number }[] } | null>(null)
  const [gexLoading, setGexLoading] = useState(false)
  const [gexError, setGexError] = useState("")
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    if (typeof window === "undefined") return []
    try { return JSON.parse(localStorage.getItem("pb_watchlist") || "[]") } catch { return [] }
  })
  const [wlInput, setWlInput] = useState("")
  const [soundEnabled, setSoundEnabled] = useState(true)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const prevTradeIdsRef = useRef<Set<number>>(new Set())
  const [showFilters, setShowFilters] = useState(false)
  const [filterGrade, setFilterGrade] = useState("")
  const [filterType, setFilterType] = useState("")
  const [filterOptType, setFilterOptType] = useState("")
  const [filterMinPremium, setFilterMinPremium] = useState(0)
  const [filterDte, setFilterDte] = useState("")
  const [filterSide, setFilterSide] = useState("")
  const [filterUnusualOnly, setFilterUnusualOnly] = useState(false)
  const [filterExcludeMM, setFilterExcludeMM] = useState(false)
  const [filterNoIndex, setFilterNoIndex] = useState(false)
  const [activeFilterCount, setActiveFilterCount] = useState(0)
  const [focusTicker, setFocusTicker] = useState<string | null>(null)
  const [focusStrike, setFocusStrike] = useState<string | null>(null)
  const [focusExpiry, setFocusExpiry] = useState<string | null>(null)
  const lastTradeIdRef = useRef<number>(0)
  const isFirstLoadRef = useRef<boolean>(true)
  const [newTradeIds, setNewTradeIds] = useState<Set<number>>(new Set())
  const tableContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch("/api/me").then(r => r.ok ? r.json() : null).then(d => {
      if (d) setCanAccessGamma(d.gamma_wall)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (activePage !== "heatmap" || !canAccessGamma) return
    setGexLoading(true); setGexError("")
    fetch(`/api/scanner/gex-heatmap?symbol=${gexSymbol}`)
      .then(r => r.json())
      .then(d => { if (d.error) { setGexError(d.error); setGexData(null) } else setGexData(d) })
      .catch(() => setGexError("Failed to load"))
      .finally(() => setGexLoading(false))
  }, [activePage, canAccessGamma, gexSymbol])

  const addToWatchlist = useCallback((sym: string) => {
    const s = sym.toUpperCase().trim()
    if (!s || watchlist.includes(s)) return
    const updated = [...watchlist, s]
    setWatchlist(updated)
    localStorage.setItem("pb_watchlist", JSON.stringify(updated))
  }, [watchlist])

  const removeFromWatchlist = useCallback((sym: string) => {
    const updated = watchlist.filter(s => s !== sym)
    setWatchlist(updated)
    localStorage.setItem("pb_watchlist", JSON.stringify(updated))
  }, [watchlist])

  const playBlip = useCallback(() => {
    if (!soundEnabled) return
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContext()
      const ctx = audioCtxRef.current
      if (ctx.state === "suspended") ctx.resume()
      const play = (freq: number, t: number, dur: number, vol: number) => {
        const o = ctx.createOscillator()
        const g = ctx.createGain()
        o.connect(g); g.connect(ctx.destination)
        o.type = "sine"
        o.frequency.value = freq
        g.gain.setValueAtTime(0, t)
        g.gain.linearRampToValueAtTime(vol, t + 0.005)
        g.gain.exponentialRampToValueAtTime(0.001, t + dur)
        o.start(t); o.stop(t + dur)
      }
      const now = ctx.currentTime
      play(523, now, 1.8, 0.18)
      play(1047, now, 1.4, 0.09)
      play(1318, now, 1.0, 0.05)
      play(1568, now, 0.7, 0.03)
    } catch { /* audio unavailable */ }
  }, [soundEnabled])

  const buildUrl = useCallback((opts?: { sinceId?: number; pageNum?: number }) => {
    const p = new URLSearchParams()
    if (timeRange !== "today") p.set("range", timeRange)
    if (filterMinPremium > 0) p.set("min_premium", filterMinPremium.toString())
    if (filterDte === "0dte") p.set("max_dte", "0")
    else if (filterDte === "1-7") p.set("max_dte", "7")
    else if (filterDte === "8-30") p.set("max_dte", "30")
    p.set("slim", "true")
    if (opts?.sinceId && opts.sinceId > 0) p.set("since_id", opts.sinceId.toString())
    const pg = opts?.pageNum ?? 0
    if (pg > 0) { p.set("page", pg.toString()); p.set("page_size", "2000") }
    return `/api/scanner/live-flow?${p.toString()}`
  }, [timeRange, filterMinPremium, filterDte])

  const fetchData = useCallback(async (opts?: { initial?: boolean; pageNum?: number }) => {
    const pg = opts?.pageNum ?? page
    if (opts?.initial) setLoading(true)
    try {
      // Incremental polling — only on page 0 (live) after first load
      if (pg === 0 && !isFirstLoadRef.current && lastTradeIdRef.current > 0) {
        const res = await fetch(buildUrl({ sinceId: lastTradeIdRef.current }))
        if (res.status === 401 || res.status === 403) { router.push("/login"); return }
        const data: ApiResponse = await res.json()
        if (data.trades?.length > 0) {
          const newMaxId = Math.max(...data.trades.map((tr: Trade) => tr.id))
          lastTradeIdRef.current = newMaxId
          setTrades(prev => [...data.trades, ...prev].slice(0, 20000))
          playBlip()
          const brandNew = new Set(data.trades.map((tr: Trade) => tr.id))
          setNewTradeIds(brandNew)
          setTimeout(() => setNewTradeIds(new Set()), 2000)
        }
        return
      }

      // Full load (first time, page change, filter change)
      const res = await fetch(buildUrl({ pageNum: pg }))
      if (res.status === 401 || res.status === 403) { router.push("/login"); return }
      const data: ApiResponse = await res.json()
      if (data.error) return
      const incoming = data.trades || []
      if (pg === 0 && prevTradeIdsRef.current.size > 0 && incoming.some(tr => !prevTradeIdsRef.current.has(tr.id))) {
        playBlip()
      }
      prevTradeIdsRef.current = new Set(incoming.map(tr => tr.id))
      if (incoming.length > 0) {
        lastTradeIdRef.current = Math.max(...incoming.map((tr: Trade) => tr.id))
      }
      isFirstLoadRef.current = false
      setTrades(incoming)
      setStats(data.stats || { count: 0, bull: 0, bear: 0, lean: "MIXED", pc_ratio: 0 })
    } catch { /* network error */ }
    setLoading(false)
  }, [page, buildUrl, router, playBlip])

  // initial load + page/range change — reset incremental state
  useEffect(() => {
    isFirstLoadRef.current = true
    lastTradeIdRef.current = 0
    setTrades([])
    fetchData({ initial: true, pageNum: page })
  }, [page, timeRange, fetchData])

  // auto-refresh every 5s only on page 0 (live)
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (page === 0) {
      intervalRef.current = setInterval(() => {
        setLive(isMarketOpen())
        fetchData({ pageNum: 0 })
      }, 5000)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [page, fetchData])

  // active filter count
  useEffect(() => {
    let c = 0
    if (timeRange !== "today") c++
    if (filterGrade) c++
    if (filterType) c++
    if (filterOptType) c++
    if (filterMinPremium > 0) c++
    if (filterDte) c++
    if (filterSide) c++
    if (filterUnusualOnly) c++
    if (filterExcludeMM) c++
    if (filterNoIndex) c++
    setActiveFilterCount(c)
  }, [timeRange, filterGrade, filterType, filterOptType, filterMinPremium, filterDte, filterSide, filterUnusualOnly, filterExcludeMM, filterNoIndex])

  const filtered = useMemo(() => trades.filter(t => {
    if (search && !t.symbol.toLowerCase().includes(search.toLowerCase())) return false
    if (focusTicker && t.symbol !== focusTicker) return false
    if (focusStrike && String(t.strike) !== focusStrike) return false
    if (focusExpiry && t.expiration !== focusExpiry) return false
    if (filterGrade && t.grade !== filterGrade) return false
    if (filterType && t.flow_type !== filterType) return false
    if (filterOptType && t.opt_type !== filterOptType) return false
    if (filterSide && t.aggression !== filterSide) return false
    if (filterUnusualOnly && (t.vol_oi ?? 0) < 5) return false
    if (filterExcludeMM && t.mm_suspected) return false
    if (filterNoIndex && (t.sector === "INDEX" || t.sector === "ETF")) return false
    if (filterDte === "0dte" && (t.dte ?? -1) !== 0) return false
    if (filterDte === "1-7" && ((t.dte ?? -1) < 1 || (t.dte ?? -1) > 7)) return false
    if (filterDte === "8-30" && ((t.dte ?? -1) < 8 || (t.dte ?? -1) > 30)) return false
    if (filterDte === "30+" && (t.dte ?? -1) < 30) return false
    return true
  }), [trades, search, focusTicker, focusStrike, focusExpiry, filterGrade, filterType, filterOptType, filterSide, filterUnusualOnly, filterExcludeMM, filterNoIndex, filterDte])

  const calls = filtered.filter(t => t.opt_type === "C")
  const puts = filtered.filter(t => t.opt_type === "P")
  const callPrem = calls.reduce((s, t) => s + t.premium, 0)
  const putPrem = puts.reduce((s, t) => s + t.premium, 0)
  const rowVirtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 40,
    overscan: 20,
    getItemKey: (index) => filtered[index]?.id ?? index,
  })

  // Invalidate cached measurements when the filtered dataset changes identity
  useEffect(() => {
    rowVirtualizer.measure()
  }, [filtered, rowVirtualizer])

  const hasLocalFilter = !!(search || focusTicker || filterGrade || filterType || filterOptType || filterSide || filterUnusualOnly || filterExcludeMM || filterNoIndex || filterDte)
  const displayStats = hasLocalFilter ? (() => {
    const bull = filtered.filter(t => t.bullish).reduce((s, t) => s + t.premium, 0)
    const bear = filtered.filter(t => !t.bullish).reduce((s, t) => s + t.premium, 0)
    return {
      count: filtered.length,
      bull, bear,
      lean: bull > bear * 1.5 ? "BULL" : bear > bull * 1.5 ? "BEAR" : "MIXED",
      pc_ratio: calls.length > 0 ? +(puts.length / calls.length).toFixed(2) : 0,
    }
  })() : stats

  const iconCls = "w-[18px] h-[18px]"
  const sideBtn = (active: boolean) => `w-full flex items-center justify-center h-10 transition-opacity cursor-pointer ${active ? "opacity-100" : "opacity-20 hover:opacity-50"}`

  return (
    <div className="h-screen flex bg-[#0E1117] text-[#E8EDF5] overflow-hidden">

      {/* ── SIDEBAR ── */}
      <nav className="fixed left-0 top-0 h-full w-[52px] flex flex-col items-center py-3 gap-1 z-40" style={{ background: "#0B0F1A", borderRight: "1px solid #131B27" }}>
        <a href="/" className="mb-4 flex items-center justify-center w-full" aria-label="Home">
          <img src="/images/pb-logo.png" alt="Profit Builders" width={24} height={24} className="w-6 h-6 object-contain" />
        </a>
        <button onClick={() => setActivePage("scanner")} className={sideBtn(activePage === "scanner")}>
          <svg className={iconCls} fill="none" stroke="white" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5V19a1 1 0 001 1h4V13.5M3 13.5V10a1 1 0 011-1h4a1 1 0 011 1v3.5M3 13.5h6M9 13.5V19h4V9.5M9 13.5h4M13 13.5V6a1 1 0 011-1h4a1 1 0 011 1v13h-4V13.5M13 13.5h6" /></svg>
        </button>
        <button
          onClick={() => canAccessGamma ? setActivePage("heatmap") : setShowUpgradeModal(true)}
          className={`${sideBtn(activePage === "heatmap")} relative`}
          title={canAccessGamma ? "GEX Heatmap" : "Upgrade to Pro for Gamma Wall"}
        >
          <svg className={iconCls} fill="none" stroke="white" viewBox="0 0 24 24" strokeWidth={1.8}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
          {!canAccessGamma && <span className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-[#F5820A]" />}
        </button>
        <button onClick={() => setActivePage("watchlist")} className={sideBtn(activePage === "watchlist")}>
          <svg className={iconCls} fill="none" stroke="white" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>
        </button>
        <div className="w-5 h-px bg-white/[0.06] my-1" />
        <button onClick={() => {}} className={sideBtn(false)}>
          <svg className={iconCls} fill="none" stroke="white" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
        </button>
        <div className="mt-auto flex flex-col items-center gap-1">
          <button onClick={() => setSoundEnabled(!soundEnabled)} className={sideBtn(soundEnabled)}>
            {soundEnabled ? (
              <svg className={iconCls} fill="none" stroke="white" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" /></svg>
            ) : (
              <svg className={iconCls} fill="none" stroke="white" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" /></svg>
            )}
          </button>
          <a href="/account" className={sideBtn(false)}>
            <svg className={iconCls} fill="none" stroke="white" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
          </a>
        </div>
      </nav>

      {/* ── MAIN CONTENT ── */}
      <div className="ml-[52px] flex flex-col h-screen overflow-hidden flex-1">

      {activePage === "heatmap" ? ((() => {
        const GEX_SYMBOLS = ["SPY","QQQ","AAPL","TSLA","NVDA","META","MSFT","AMZN","GOOGL","AMD","MU","COIN","PLTR","NFLX","CRM","BA","JPM","GS","XOM","GLD"]
        const netGex = gexData ? gexData.strikes.reduce((sum, strike) => {
          const sk = strike === Math.floor(strike) ? String(Math.floor(strike)) : String(strike)
          const row = gexData.matrix[sk] || {}
          return sum + Object.values(row).reduce((rs, c) => rs + c.net_gex, 0)
        }, 0) : 0
        const todayStr = new Date().toISOString().slice(0, 10)
        const fmtExp = (exp: string) => { const p = exp.split("-"); return p.length === 3 ? `${p[1]}/${p[2]}` : exp }
        return (
        <div className="flex-1 flex flex-col overflow-hidden" style={{ background: "#0B0F1A" }}>
          {/* Metrics header */}
          <div className="flex items-center px-5 py-3 gap-8 border-b border-[#131B27] flex-shrink-0">
            <div className="flex items-center gap-4">
              <div>
                <div className="text-[9px] font-bold text-[#3D4D63] tracking-[0.15em] uppercase">GEX Heatmap</div>
                <div className="text-[10px] text-[#4A5A72]">Gamma Exposure by Strike</div>
              </div>
              <select value={gexSymbol} onChange={e => setGexSymbol(e.target.value)}
                className="bg-[#161B24] border border-[#1E2A3A] text-white text-sm rounded-md px-3 py-1.5 font-semibold cursor-pointer focus:outline-none focus:border-[#F5820A]/50">
                {GEX_SYMBOLS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            {gexData && (
              <div className="flex items-center gap-6 ml-4">
                <div>
                  <div className="text-[9px] text-[#3D4D63] uppercase tracking-widest mb-0.5">Spot</div>
                  <div className="text-sm font-bold text-white">${gexData.spot.toFixed(2)}</div>
                </div>
                {gexData.zero_gamma_strike != null && (
                  <div>
                    <div className="text-[9px] text-[#3D4D63] uppercase tracking-widest mb-0.5">Zero Gamma</div>
                    <div className="text-sm font-bold text-[#F5820A]">${gexData.zero_gamma_strike.toFixed(2)}</div>
                  </div>
                )}
                <div>
                  <div className="text-[9px] text-[#3D4D63] uppercase tracking-widest mb-0.5">Net GEX</div>
                  <div className={`text-sm font-bold ${netGex >= 0 ? "text-[#22C55E]" : "text-[#EF4444]"}`}>
                    {netGex >= 0 ? "+" : ""}{fmtGex(netGex)}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] text-[#3D4D63] uppercase tracking-widest mb-0.5">Dominant</div>
                  <div className={`text-sm font-bold ${netGex >= 0 ? "text-[#22C55E]" : "text-[#EF4444]"}`}>
                    {netGex >= 0 ? "CALL GEX" : "PUT GEX"}
                  </div>
                </div>
              </div>
            )}
            <div className="ml-auto flex items-center gap-4 text-[9px] text-[#4A5A72]">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-[#22C55E]/50 border border-[#22C55E]/30" /> Call</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-[#EF4444]/50 border border-[#EF4444]/30" /> Put</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-white" /> Spot</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 border-t-2 border-[#a855f7]" /> Zero &gamma;</div>
            </div>
          </div>
          {/* GEX table */}
          <div className="flex-1 overflow-auto">
            {gexLoading ? (
              <div className="flex items-center justify-center h-full text-[#3D4D63] text-sm">Loading heatmap...</div>
            ) : gexError ? (
              <div className="flex items-center justify-center h-full text-[#EF4444] text-sm">{gexError}</div>
            ) : gexData ? (
              <div style={{ display: "grid", gridTemplateColumns: `100px repeat(${gexData.expirations.length}, 1fr) 80px` }}>
                {/* Column headers */}
                <div className="sticky top-0 z-10 px-3 py-1 text-[8px] font-semibold text-white/50 tracking-[0.1em] uppercase border-r border-b border-[#131B27]" style={{ background: "#0B0F1A" }}>Strike</div>
                {gexData.expirations.map(exp => {
                  const isToday = exp === todayStr
                  return (
                    <div key={exp} className="sticky top-0 z-10 px-2 py-1 text-center border-r border-b border-[#131B27]" style={{ background: "#0B0F1A" }}>
                      <div className={`text-[8px] font-semibold tracking-[0.06em] uppercase ${isToday ? "text-[#F5820A]" : "text-white/50"}`}>
                        {isToday ? "TODAY" : fmtExp(exp)}
                      </div>
                    </div>
                  )
                })}
                <div className="sticky top-0 z-10 px-3 py-1 text-right text-[8px] font-semibold text-white/50 tracking-[0.1em] uppercase border-b border-[#131B27]" style={{ background: "#0B0F1A", borderLeft: "1px solid #1E2A3A" }}>Total</div>
                {/* Data rows */}
                {(() => {
                  const strikes = [...gexData.strikes].reverse()
                  const atmStrike = strikes.reduce((best, s) => Math.abs(s - gexData.spot) < Math.abs(best - gexData.spot) ? s : best, strikes[0])
                  const zgStrike = gexData.zero_gamma_strike != null ? strikes.reduce((best, s) => Math.abs(s - gexData.zero_gamma_strike!) < Math.abs(best - gexData.zero_gamma_strike!) ? s : best, strikes[0]) : null
                  return strikes.map(strike => {
                  const sk = strike === Math.floor(strike) ? String(Math.floor(strike)) : String(strike)
                  const row = gexData.matrix[sk] || {}
                  const rowTotal = Object.values(row).reduce((s, c) => s + c.net_gex, 0)
                  const isAtm = strike === atmStrike
                  const isZg = strike === zgStrike
                  const lineShadow = isZg ? "inset 0 2px 0 #a855f7" : isAtm ? "inset 0 1px 0 rgba(255,255,255,0.45)" : "none"
                  return [
                    <div key={`s-${strike}`} className="px-2 flex items-center gap-1 border-r border-b border-[#0D1219]" style={{ minHeight: 24, background: isAtm ? "rgba(255,255,255,0.04)" : "#0B0F1A", position: "sticky", left: 0, zIndex: 5, boxShadow: lineShadow, ...(isAtm ? { borderLeft: "3px solid rgba(255,255,255,0.7)" } : {}) }}>
                      {isAtm && <span className="text-[9px] font-bold text-white/70 mr-0.5">● SPOT</span>}
                      {isZg && <span className="text-[9px] font-bold text-[#a855f7] mr-0.5">ZG</span>}
                      <span className={`text-[11px] font-mono font-semibold ${isAtm ? "text-white" : isZg ? "text-[#a855f7]" : "text-[#C4CDD9]"}`}>{strike}</span>
                    </div>,
                    ...gexData.expirations.map(exp => {
                      const cell = row[exp]
                      const gex = cell?.net_gex ?? 0
                      const intensity = gexData.max_abs_gex > 0 ? Math.min(0.85, 0.08 + 0.77 * Math.abs(gex) / gexData.max_abs_gex) : 0
                      const bg = gex === 0 ? "transparent" : gex > 0 ? `rgba(34,197,94,${intensity})` : `rgba(239,68,68,${intensity})`
                      return (
                        <div key={`${strike}-${exp}`} className="border-r border-b border-[#0D1219] flex items-center justify-center" style={{ background: isAtm && gex === 0 ? "rgba(255,255,255,0.04)" : bg, minHeight: 24, boxShadow: lineShadow }} title={`${strike} / ${exp}: ${fmtGex(gex)}`}>
                          {gex !== 0 && (
                            <span className={`text-[10px] font-mono font-semibold ${intensity > 0.4 ? "text-white" : gex > 0 ? "text-[#22C55E]" : "text-[#EF4444]"}`}>
                              {fmtGex(gex)}
                            </span>
                          )}
                        </div>
                      )
                    }),
                    <div key={`t-${strike}`} className="px-3 flex items-center justify-end border-b border-[#0D1219]" style={{ minHeight: 24, borderLeft: "1px solid #1E2A3A", ...(isAtm ? { background: "rgba(255,255,255,0.04)" } : {}), boxShadow: lineShadow }}>
                      <span className={`text-[11px] font-mono font-bold ${rowTotal >= 0 ? "text-[#22C55E]" : "text-[#EF4444]"}`}>
                        {rowTotal !== 0 ? fmtGex(rowTotal) : "—"}
                      </span>
                    </div>,
                  ]
                })})()}
              </div>
            ) : null}
          </div>
        </div>
        )
      })()) : activePage === "watchlist" ? (
        <div className="flex-1 flex flex-col overflow-hidden" style={{ background: "#0B0F1A" }}>
          {/* Watchlist header */}
          <div className="px-5 py-3 border-b border-[#131B27] flex items-center gap-3 flex-shrink-0">
            <div className="text-[9px] font-bold text-[#4A5A72] tracking-[0.15em] uppercase">Watchlist</div>
            <div className="text-[10px] text-[#3D4D63]">{watchlist.length} symbols</div>
            <div className="ml-auto">
              <input
                placeholder="Add symbol..."
                value={wlInput}
                onChange={e => setWlInput(e.target.value.toUpperCase())}
                onKeyDown={e => { if (e.key === "Enter" && wlInput) { addToWatchlist(wlInput); setWlInput("") } }}
                className="bg-[#080C14] border border-[#1E2A3A] rounded-md px-3 py-1.5 text-sm text-white placeholder-[#3D4D63] focus:outline-none focus:border-[#F5820A]/50 w-36"
              />
            </div>
          </div>
          {/* Watchlist body */}
          <div className="flex-1 overflow-y-auto">
            {watchlist.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-[#3D4D63]">
                <div className="text-sm">No symbols added</div>
                <div className="text-[11px] mt-1">Type a symbol above and press Enter</div>
              </div>
            ) : (
              <div>
                {/* Column headers */}
                <div className="grid sticky top-0 z-10 border-b border-[#131B27] text-[9px] font-bold text-[#3D4D63] tracking-[0.1em] uppercase" style={{ gridTemplateColumns: "1fr 100px 100px 80px 32px", background: "#0B0F1A" }}>
                  <div className="px-5 py-2">Symbol</div>
                  <div className="px-3 py-2 text-right">Call Flow</div>
                  <div className="px-3 py-2 text-right">Put Flow</div>
                  <div className="px-3 py-2 text-center">Signals</div>
                  <div />
                </div>
                {watchlist.map(sym => {
                  const symTrades = trades.filter(t => t.symbol === sym)
                  const callPrem = symTrades.filter(t => t.opt_type === "C").reduce((s, t) => s + t.premium, 0)
                  const putPrem = symTrades.filter(t => t.opt_type === "P").reduce((s, t) => s + t.premium, 0)
                  const count = symTrades.length
                  const isBull = callPrem > putPrem * 1.3
                  const isBear = putPrem > callPrem * 1.3
                  return (
                    <div key={sym} className="grid border-b border-[#0D1219] hover:bg-white/[0.02] transition-colors cursor-pointer" style={{ gridTemplateColumns: "1fr 100px 100px 80px 32px", minHeight: 40 }}
                      onClick={() => { setSearch(sym); setActivePage("scanner") }}>
                      <div className="px-5 flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{sym}</span>
                        {count > 0 && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${isBull ? "bg-[#22C55E]/15 text-[#22C55E]" : isBear ? "bg-[#EF4444]/15 text-[#EF4444]" : "bg-white/5 text-[#4A5A72]"}`}>
                            {isBull ? "BULL" : isBear ? "BEAR" : "MIXED"}
                          </span>
                        )}
                      </div>
                      <div className="px-3 flex items-center justify-end">
                        <span className={`text-[11px] font-mono font-semibold ${callPrem > 0 ? "text-[#22C55E]" : "text-[#3D4D63]"}`}>
                          {callPrem > 0 ? fmtPrem(callPrem) : "—"}
                        </span>
                      </div>
                      <div className="px-3 flex items-center justify-end">
                        <span className={`text-[11px] font-mono font-semibold ${putPrem > 0 ? "text-[#EF4444]" : "text-[#3D4D63]"}`}>
                          {putPrem > 0 ? fmtPrem(putPrem) : "—"}
                        </span>
                      </div>
                      <div className="px-3 flex items-center justify-center">
                        <span className="text-[11px] text-[#7A8BA8] font-mono">{count || "—"}</span>
                      </div>
                      <div className="flex items-center justify-center">
                        <button onClick={e => { e.stopPropagation(); removeFromWatchlist(sym) }} className="text-[#3D4D63] hover:text-[#EF4444] transition-colors text-xs">×</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      ) : (<>

      {/* ── HEADER ── */}
      <header className="h-11 bg-[#161B24] border-b border-[#252E3D] flex items-center px-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search symbol..."
            value={search}
            onChange={e => setSearch(e.target.value.toUpperCase())}
            className="w-48 bg-[#252E3D] border border-[#3D4D63]/40 rounded-lg px-3 py-1 text-sm text-white placeholder-[#7A8BA8] focus:outline-none focus:border-[#F5820A]/50 focus:ring-1 focus:ring-[#F5820A]/20"
          />
          <button onClick={() => setShowFilters(true)} className="flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-medium border border-[#2E3A4D] bg-[#161B24] hover:bg-[#1E2530] text-[#E8EDF5] transition-colors">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 2h10M3 6h6M5 10h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            Filters
            {activeFilterCount > 0 && <span className="bg-[#F5820A] text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">{activeFilterCount}</span>}
          </button>
        </div>
        <div className="ml-auto flex-shrink-0">
          <a href="/logout" className="text-[#3D4D63] text-[11px] hover:text-[#E8EDF5]">Logout</a>
        </div>
      </header>

      {/* ── FOCUS BAR ── */}
      {focusTicker && (
        <div className="bg-[#0E1117] border-b border-[#60a5fa]/20 px-4 py-2 flex items-center gap-2 flex-wrap flex-shrink-0">
          <button onClick={() => { setFocusTicker(null); setFocusStrike(null); setFocusExpiry(null) }}
            className="flex items-center gap-1.5 bg-[#60a5fa]/10 border border-[#60a5fa]/30 rounded-full px-3 py-1 text-[#60a5fa] text-xs font-bold hover:bg-[#60a5fa]/20">
            {focusTicker} <span className="text-[#60a5fa]/50">&times;</span>
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
        const totalCount = calls.length + puts.length
        const callPct = totalCount > 0 ? Math.round((calls.length / totalCount) * 100) : 50
        const putPct = 100 - callPct
        const totalPrem = displayStats.bull + displayStats.bear
        const bullPct = totalPrem > 0 ? (displayStats.bull / totalPrem) * 100 : 50
        const isBull = displayStats.lean === "BULL"
        const circ = 2 * Math.PI * 20
        const pcDash = (Math.min(displayStats.pc_ratio / 2, 1) * circ)
        return (
          <div className="grid border-b border-[#131B27] flex-shrink-0" style={{ gridTemplateColumns: "1fr 1px 1fr 1px 1fr 1px 1fr", background: "#0B0F1A" }}>
            {/* Sentiment */}
            <div className="px-4 py-4 flex flex-col justify-center">
              <div className="text-[9px] font-medium text-[#4A5A72] tracking-[0.1em] uppercase mb-1.5">Flow sentiment</div>
              <div className="flex items-center gap-3">
                <span className={`text-2xl font-bold ${isBull ? "text-[#22C55E]" : displayStats.lean === "BEAR" ? "text-[#EF4444]" : "text-white/50"}`}>
                  {isBull ? "Bullish" : displayStats.lean === "BEAR" ? "Bearish" : "Mixed"}
                </span>
                <div className="flex-1 h-1 bg-[#1A2535] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${isBull ? bullPct : 100 - bullPct}%`, background: isBull ? "#22C55E" : "#EF4444" }} />
                </div>
              </div>
            </div>
            <div className="bg-[#131B27]" />
            {/* P/C Ratio */}
            <div className="px-4 py-4 flex items-center gap-3">
              <div>
                <div className="text-[9px] font-medium text-[#4A5A72] tracking-[0.1em] uppercase mb-1.5">Put to call</div>
                <div className="text-2xl font-bold text-white leading-none">{displayStats.pc_ratio.toFixed(2)}</div>
              </div>
              <svg width="48" height="48" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="20" fill="none" stroke="#1A2535" strokeWidth="3" />
                <circle cx="24" cy="24" r="20" fill="none" stroke="#60a5fa" strokeWidth="3" strokeLinecap="round"
                  strokeDasharray={`${pcDash} ${circ}`} strokeDashoffset={circ / 4}
                  style={{ transition: "stroke-dasharray 0.5s" }} />
              </svg>
            </div>
            <div className="bg-[#131B27]" />
            {/* Call flow */}
            <div className="px-4 py-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-medium text-[#4A5A72] tracking-[0.1em] uppercase">Call flow</span>
                  <span className="text-[11px] font-bold text-[#22C55E]">{fmtPrem(callPrem)}</span>
                </div>
                <div className="text-2xl font-bold text-white leading-none mt-1">{calls.length.toLocaleString()}</div>
              </div>
              <svg width="48" height="48" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="20" fill="none" stroke="#1A2535" strokeWidth="3" />
                <circle cx="24" cy="24" r="20" fill="none" stroke="#22C55E" strokeWidth="3" strokeLinecap="round"
                  strokeDasharray={`${(callPct / 100) * circ} ${circ}`} strokeDashoffset={circ / 4}
                  style={{ transition: "stroke-dasharray 0.5s" }} />
                <text x="24" y="24" textAnchor="middle" dominantBaseline="central" fill="white" fontSize="10" fontWeight="600">{callPct}%</text>
              </svg>
            </div>
            <div className="bg-[#131B27]" />
            {/* Put flow */}
            <div className="px-4 py-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-medium text-[#4A5A72] tracking-[0.1em] uppercase">Put flow</span>
                  <span className="text-[11px] font-bold text-[#EF4444]">{fmtPrem(putPrem)}</span>
                </div>
                <div className="text-2xl font-bold text-white leading-none mt-1">{puts.length.toLocaleString()}</div>
              </div>
              <svg width="48" height="48" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="20" fill="none" stroke="#1A2535" strokeWidth="3" />
                <circle cx="24" cy="24" r="20" fill="none" stroke="#EF4444" strokeWidth="3" strokeLinecap="round"
                  strokeDasharray={`${(putPct / 100) * circ} ${circ}`} strokeDashoffset={circ / 4}
                  style={{ transition: "stroke-dasharray 0.5s" }} />
                <text x="24" y="24" textAnchor="middle" dominantBaseline="central" fill="white" fontSize="10" fontWeight="600">{putPct}%</text>
              </svg>
            </div>
          </div>
        )
      })()}

      {/* ── TABLE ── */}
      <div ref={tableContainerRef} className="flex-1 overflow-y-auto scanner-scroll" style={{ scrollbarWidth: "thin", scrollbarColor: "#2E3A4D #0E1117", fontVariantNumeric: "tabular-nums" }}>
        {loading ? (
          <table className="w-full text-sm">
            <thead className="bg-[#161B24] sticky top-0 z-10">
              <tr className="text-[11px] text-[#3D4D63] uppercase tracking-wider">
                <th className="text-left px-3 py-2 font-medium">Time</th>
                <th className="text-left px-2 py-2 font-medium">Tick</th>
                <th className="text-left px-2 py-2 font-medium hidden md:table-cell">Expiry</th>
                <th className="text-right px-2 py-2 font-medium">Strike</th>
                <th className="text-center px-2 py-2 font-medium">C/P</th>
                <th className="text-center px-2 py-2 font-medium hidden lg:table-cell">Side</th>
                <th className="text-center px-2 py-2 font-medium hidden lg:table-cell">B/S</th>
                <th className="text-right px-2 py-2 font-medium hidden md:table-cell">Spot</th>
                <th className="text-right px-2 py-2 font-medium hidden lg:table-cell">Size</th>
                <th className="text-center px-2 py-2 font-medium hidden lg:table-cell">Type</th>
                <th className="text-right px-2 py-2 font-medium">Value</th>
                <th className="text-right px-2 py-2 font-medium hidden xl:table-cell">Volume</th>
                <th className="text-right px-2 py-2 font-medium hidden xl:table-cell">OI</th>
                <th className="text-right px-2 py-2 font-medium hidden lg:table-cell">IV</th>
                <th className="text-left px-2 py-2 font-medium hidden md:table-cell w-[180px] max-w-[180px]">Conds</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 20 }).map((_, i) => (
                <tr key={i} className="border-b border-[#252E3D]">
                  {Array.from({ length: 15 }).map((_, j) => (
                    <td key={j} className="px-3 py-3">
                      <div className="h-3 bg-[#1E2530] rounded animate-pulse" style={{ width: `${40 + Math.random() * 40}%` }} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-white/30">
            {search ? `No trades matching "${search}"` : "No trades found for this period."}
          </div>
        ) : (
          <table className="w-full text-sm" style={{ tableLayout: "fixed" }}>
            <colgroup>
              {COLS.map(col => (
                <col key={col.key} style={{ width: col.width ? `${col.width}px` : undefined }} />
              ))}
            </colgroup>
            <thead className="bg-[#161B24] sticky top-0 z-10">
              <tr className="text-[11px] text-[#3D4D63] uppercase tracking-wider">
                {COLS.map(c => (
                  <th key={c.key} className={`${c.cls} py-2 font-medium`}>{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody style={{
              paddingTop: `${rowVirtualizer.getVirtualItems()[0]?.start ?? 0}px`,
              paddingBottom: `${rowVirtualizer.getTotalSize() - (rowVirtualizer.getVirtualItems().at(-1)?.end ?? 0)}px`,
            }}>
              {rowVirtualizer.getVirtualItems().map(vRow => {
                const t = filtered[vRow.index]
                if (!t) return null
                const badges = condBadges(t)
                const isNew = newTradeIds.has(t.id)
                const isBlock1M = t.flow_type === "BLOCK" && t.premium >= 1000000
                const isWhale = t.whale
                const isSweep = t.flow_type === "SWEEP"
                // Row bg: ONLY block1M (blue) or whale (amber) get tint. Everything else = plain dark.
                const rowCls = isNew ? "bg-[#60a5fa]/10"
                  : isBlock1M ? "bg-[#60a5fa]/[0.08]" : isWhale ? "bg-[#f59e0b]/[0.08]" : ""
                const borderCls = isBlock1M ? "border-l-[3px] border-l-[#60a5fa]"
                  : isWhale ? "border-l-[3px] border-l-[#f59e0b]"
                  : isSweep ? "border-l-2 border-l-[#eab308]/50" : ""
                return (
                  <tr
                    key={vRow.key}
                    data-index={vRow.index}
                    ref={rowVirtualizer.measureElement}
                    className={`border-b border-[#1E2A3A] hover:bg-white/[0.04] transition-colors ${rowCls} ${borderCls} ${t.mm_suspected ? "opacity-50" : ""}`}
                  >
                    <td className="px-3 py-2 text-white/50 text-xs whitespace-nowrap">{t.time ?? t.date_time?.slice(11, 16) ?? "—"}</td>
                    <td className="px-2 py-2">
                      <button onClick={() => { setFocusTicker(t.symbol); setFocusStrike(null); setFocusExpiry(null) }}
                        className="text-left group">
                        <div className={`font-bold text-sm group-hover:text-[#60a5fa] transition-colors ${t.opt_type === "C" ? "text-[#22c55e]" : "text-[#ef4444]"}`}>{t.symbol}</div>
                        {t.sector && <div className="text-white/30 text-[10px]">{t.sector}</div>}
                      </button>
                    </td>
                    <td className="px-2 py-2">
                      <button onClick={() => { setFocusExpiry(t.expiration); if (!focusTicker) setFocusTicker(t.symbol) }}
                        className="text-white/60 hover:text-[#60a5fa] transition-colors text-xs font-mono">
                        {fmtExpiry(t.expiration)}
                      </button>
                    </td>
                    <td className="px-2 py-2 text-right">
                      <button onClick={() => { setFocusStrike(String(t.strike)); if (!focusTicker) setFocusTicker(t.symbol) }}
                        className="text-white/80 hover:text-[#60a5fa] transition-colors text-xs font-mono">
                        {t.strike_fmt ?? t.strike}
                      </button>
                    </td>
                    <td className={`px-2 py-2 text-center text-xs font-medium ${t.opt_type === "C" ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                      {t.opt_type === "C" ? "Call" : "Put"}
                    </td>
                    <td className={`px-2 py-2 text-center text-xs ${aggrColor(t.aggression)}`}>
                      {aggrLabel(t.aggression)}
                    </td>
                    <td className={`px-2 py-2 text-center text-xs font-medium ${
                      t.trade_direction === "BUY" ? "text-[#22c55e]" : t.trade_direction === "SELL" ? "text-[#ef4444]" : "text-white/40"
                    }`}>
                      {t.trade_direction || "—"}
                    </td>
                    <td className="px-2 py-2 text-right text-white/60 text-xs font-mono">{t.spot_fmt}</td>
                    <td className="px-2 py-2 text-right text-white/60 text-xs">{(t.contracts ?? 0).toLocaleString()}</td>
                    <td className={`px-2 py-2 text-center text-xs font-medium ${
                      t.flow_type === "SWEEP" ? "text-[#eab308]" : t.flow_type === "BLOCK" ? "text-[#60a5fa]" + (t.premium >= 1000000 ? " font-bold" : "") : "text-white/50"
                    }`}>
                      {t.premium >= 1000000 && t.flow_type === "BLOCK" ? "BLOCK 1M+" : t.flow_type || "—"}
                    </td>
                    <td className={`px-2 py-2 text-right text-xs font-bold ${t.opt_type === "C" ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                      {t.premium_fmt}
                    </td>
                    <td className={`px-2 py-2 text-right text-xs font-mono ${(t.adv_multiple ?? 0) >= 1.0 ? "text-[#22d3ee] font-semibold" : "text-white/60"}`}>
                      {(t.day_volume ?? 0) > 0 ? t.day_volume.toLocaleString() : "—"}
                    </td>
                    <td className="px-2 py-2 text-right text-white/50 text-xs font-mono">
                      {(t.open_interest ?? 0) > 0 ? t.open_interest.toLocaleString() : "—"}
                    </td>
                    <td className="px-2 py-2 text-right text-white/50 text-xs">
                      {t.iv ? `${t.iv}%` : "—"}
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex flex-wrap gap-1">
                        {badges.map((b, i) => (
                          <span key={i} className={`whitespace-nowrap ${b.cls}`}>{b.label}</span>
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

      {/* ── PAGINATION BAR ── */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-[#252E3D] bg-[#161B24] flex-shrink-0">
        <button
          onClick={() => { setPage(Math.max(0, page - 1)); tableContainerRef.current?.scrollTo(0, 0) }}
          disabled={page === 0}
          className="px-3 py-1.5 text-xs text-[#7A8BA8] border border-[#252E3D] rounded hover:bg-[#1E2530] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          ← Newer
        </button>
        <span className="text-[11px] text-[#4A5A72]">
          {page === 0 ? `Live · ${filtered.length.toLocaleString()} signals` : `Page ${page + 1} · earlier ${timeRange === "today" ? "today" : timeRange.replace("_", " ")}`}
        </span>
        <button
          onClick={() => { setPage(page + 1); tableContainerRef.current?.scrollTo(0, 0) }}
          disabled={trades.length < 2000 && page > 0}
          className="px-3 py-1.5 text-xs text-[#7A8BA8] border border-[#252E3D] rounded hover:bg-[#1E2530] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Older →
        </button>
      </div>

      {/* ── FILTER PANEL ── */}
      {showFilters && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setShowFilters(false)} />
          <div className="fixed right-0 top-0 h-full w-72 bg-[#161B24] border-l border-[#252E3D] z-50 flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-[#252E3D]">
              <span className="text-white font-semibold text-sm">Filters</span>
              <div className="flex items-center gap-3">
                <button onClick={() => { setTimeRange("today"); setPage(0); setFilterGrade(""); setFilterType(""); setFilterOptType(""); setFilterMinPremium(0); setFilterDte(""); setFilterSide(""); setFilterUnusualOnly(false); setFilterExcludeMM(false); setFilterNoIndex(false) }} className="text-white/40 hover:text-white text-xs">Reset all</button>
                <button onClick={() => setShowFilters(false)} className="text-white/40 hover:text-white text-lg leading-none">&times;</button>
              </div>
            </div>
            <div className="flex-1 p-4 space-y-6">
              {/* 0. Time Range */}
              <div>
                <div className="text-white/40 text-xs uppercase tracking-widest mb-2">Time Range</div>
                <div className="flex gap-2 flex-wrap">
                  {TIME_RANGES.map(r => (
                    <button key={r.key} onClick={() => { setTimeRange(r.key); setPage(0) }}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${timeRange === r.key ? "bg-[#60a5fa] border-[#60a5fa] text-black" : "bg-[#1E2530] border-[#252E3D] text-[#7A8BA8] hover:text-[#E8EDF5]"}`}>
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
              {/* 1. Grade */}
              <div>
                <div className="text-white/40 text-xs uppercase tracking-widest mb-2">Grade</div>
                <div className="flex gap-2 flex-wrap">
                  {["", "A", "B"].map(g => (
                    <button key={g} onClick={() => setFilterGrade(g)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${filterGrade === g ? "bg-[#60a5fa] border-[#60a5fa] text-black" : "bg-[#1E2530] border-[#252E3D] text-[#7A8BA8] hover:text-[#E8EDF5]"}`}>
                      {g === "" ? "All" : `Grade ${g}`}
                    </button>
                  ))}
                </div>
              </div>
              {/* 2. Flow Type */}
              <div>
                <div className="text-white/40 text-xs uppercase tracking-widest mb-2">Flow Type</div>
                <div className="flex gap-2 flex-wrap">
                  {[{ v: "", l: "All" }, { v: "SWEEP", l: "Sweep" }, { v: "BLOCK", l: "Block" }].map(t => (
                    <button key={t.v} onClick={() => setFilterType(t.v)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${filterType === t.v ? "bg-[#60a5fa] border-[#60a5fa] text-black" : "bg-[#1E2530] border-[#252E3D] text-[#7A8BA8] hover:text-[#E8EDF5]"}`}>
                      {t.l}
                    </button>
                  ))}
                </div>
              </div>
              {/* 3. Calls / Puts */}
              <div>
                <div className="text-white/40 text-xs uppercase tracking-widest mb-2">Calls / Puts</div>
                <div className="flex gap-2">
                  {[{ v: "", l: "All" }, { v: "C", l: "Calls" }, { v: "P", l: "Puts" }].map(o => (
                    <button key={o.v} onClick={() => setFilterOptType(o.v)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${filterOptType === o.v ? "bg-[#60a5fa] border-[#60a5fa] text-black" : "bg-[#1E2530] border-[#252E3D] text-[#7A8BA8] hover:text-[#E8EDF5]"}`}>
                      {o.l}
                    </button>
                  ))}
                </div>
              </div>
              {/* 4. Min Premium */}
              <div>
                <div className="text-white/40 text-xs uppercase tracking-widest mb-2">Min Premium</div>
                <div className="flex gap-2 flex-wrap">
                  {[{ v: 0, l: "Any" }, { v: 100000, l: "$100K+" }, { v: 250000, l: "$250K+" }, { v: 500000, l: "$500K+" }, { v: 1000000, l: "$1M+" }].map(p => (
                    <button key={p.v} onClick={() => setFilterMinPremium(p.v)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${filterMinPremium === p.v ? "bg-[#60a5fa] border-[#60a5fa] text-black" : "bg-[#1E2530] border-[#252E3D] text-[#7A8BA8] hover:text-[#E8EDF5]"}`}>
                      {p.l}
                    </button>
                  ))}
                </div>
              </div>
              {/* 5. DTE */}
              <div>
                <div className="text-white/40 text-xs uppercase tracking-widest mb-2">Days to Expiry</div>
                <div className="flex gap-2 flex-wrap">
                  {[{ v: "", l: "All" }, { v: "0dte", l: "0DTE" }, { v: "1-7", l: "1-7d" }, { v: "8-30", l: "8-30d" }, { v: "30+", l: "30d+" }].map(d => (
                    <button key={d.v} onClick={() => setFilterDte(d.v)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${filterDte === d.v ? "bg-[#60a5fa] border-[#60a5fa] text-black" : "bg-[#1E2530] border-[#252E3D] text-[#7A8BA8] hover:text-[#E8EDF5]"}`}>
                      {d.l}
                    </button>
                  ))}
                </div>
              </div>
              {/* 6. Side */}
              <div>
                <div className="text-white/40 text-xs uppercase tracking-widest mb-2">Side</div>
                <div className="flex gap-2 flex-wrap">
                  {[{ v: "", l: "All" }, { v: "ABOVE_ASK", l: "Above Ask" }, { v: "AT_ASK", l: "At Ask" }, { v: "BELOW_BID", l: "Below Bid" }].map(s => (
                    <button key={s.v} onClick={() => setFilterSide(s.v)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${filterSide === s.v ? "bg-[#60a5fa] border-[#60a5fa] text-black" : "bg-[#1E2530] border-[#252E3D] text-[#7A8BA8] hover:text-[#E8EDF5]"}`}>
                      {s.l}
                    </button>
                  ))}
                </div>
              </div>
              {/* 7. Unusual Only */}
              <div className="flex items-center justify-between py-2 border-t border-[#252E3D]">
                <div>
                  <div className="text-white text-sm font-medium">Unusual Only</div>
                  <div className="text-white/35 text-xs">Flagged unusual activity</div>
                </div>
                <button onClick={() => setFilterUnusualOnly(!filterUnusualOnly)}
                  className={`w-10 h-6 rounded-full transition-colors relative ${filterUnusualOnly ? "bg-[#60a5fa]" : "bg-[#252E3D]"}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${filterUnusualOnly ? "left-5" : "left-1"}`} />
                </button>
              </div>
              {/* 8. Exclude MM */}
              <div className="flex items-center justify-between py-2 border-t border-[#252E3D]">
                <div>
                  <div className="text-white text-sm font-medium">Exclude MM</div>
                  <div className="text-white/35 text-xs">Hide market maker activity</div>
                </div>
                <button onClick={() => setFilterExcludeMM(!filterExcludeMM)}
                  className={`w-10 h-6 rounded-full transition-colors relative ${filterExcludeMM ? "bg-[#60a5fa]" : "bg-[#252E3D]"}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${filterExcludeMM ? "left-5" : "left-1"}`} />
                </button>
              </div>
              {/* 9. No Index */}
              <div className="flex items-center justify-between py-2 border-t border-[#252E3D]">
                <div>
                  <div className="text-white text-sm font-medium">No Index</div>
                  <div className="text-white/35 text-xs">Hide SPX, NDX, index &amp; ETF flow</div>
                </div>
                <button onClick={() => setFilterNoIndex(!filterNoIndex)}
                  className={`w-10 h-6 rounded-full transition-colors relative ${filterNoIndex ? "bg-[#F5820A]" : "bg-[#252E3D]"}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${filterNoIndex ? "left-5" : "left-1"}`} />
                </button>
              </div>
            </div>
            <div className="p-4 border-t border-[#252E3D]">
              <button onClick={() => { setPage(0); setShowFilters(false) }}
                className="w-full bg-[#60a5fa] hover:bg-[#3b82f6] text-black font-bold py-3 rounded-xl text-sm transition-colors">
                Apply Filters
              </button>
            </div>
          </div>
        </>
      )}

      </>)}

      {/* ── UPGRADE MODAL ── */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowUpgradeModal(false)}>
          <div className="border border-[#1E2A3A] rounded-xl p-8 max-w-sm w-full mx-4" style={{ background: "#0F1520" }} onClick={e => e.stopPropagation()}>
            <div className="text-[#F5820A] text-[10px] font-bold tracking-[0.15em] uppercase mb-3">Pro Feature</div>
            <div className="text-xl font-bold text-white mb-2">Gamma Wall Scanner</div>
            <div className="text-sm text-[#7A8BA8] mb-6 leading-relaxed">
              Real-time GEX heatmaps, gamma wall detection, and squeeze identification are available on the Pro plan.
            </div>
            <a href="/#pricing" className="block w-full text-center py-3 rounded-lg bg-[#F5820A] text-black font-bold text-sm hover:bg-[#e57309] transition-colors">
              Upgrade to Pro
            </a>
            <button onClick={() => setShowUpgradeModal(false)} className="block w-full text-center py-2 mt-3 text-[#4A5A72] text-sm hover:text-[#7A8BA8] transition-colors">
              Not now
            </button>
          </div>
        </div>
      )}

      </div>
    </div>
  )
}
