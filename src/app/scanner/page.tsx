"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useVirtualizer } from "@tanstack/react-virtual"
import { badgeClass } from "@/lib/badge-styles"

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
  if (!a || a === "NEUTRAL") return "text-white/30"
  if (a === "ABOVE_ASK" || a === "AT_ASK") return "text-[#00E85A]"
  if (a === "BELOW_BID" || a === "AT_BID") return "text-[#FF605D]"
  return "text-white/50"
}

function aggrLabel(a: string | null | undefined) {
  if (!a || a === "NEUTRAL") return "—"
  const map: Record<string, string> = { ABOVE_ASK: "Above", AT_ASK: "Ask", AT_BID: "Bid", BELOW_BID: "Below" }
  return map[a] || a
}

function bsColor(d: string | null | undefined) {
  if (!d || d === "NEUTRAL") return "text-white/30"
  if (d === "BUY") return "text-[#00E85A]"
  if (d === "SELL") return "text-[#FF605D]"
  return "text-white/50"
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
  { key: "conds",  label: "Conds",  cls: "text-left px-2" },
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
      const now = ctx.currentTime

      // Soft two-tone blip — Bloomberg-style
      const tone = (freq: number, start: number, dur: number, vol: number) => {
        const o = ctx.createOscillator()
        const g = ctx.createGain()
        const f = ctx.createBiquadFilter()
        o.connect(f); f.connect(g); g.connect(ctx.destination)
        o.type = "triangle"
        f.type = "lowpass"
        f.frequency.value = 2000
        o.frequency.value = freq
        g.gain.setValueAtTime(0, start)
        g.gain.linearRampToValueAtTime(vol, start + 0.008)
        g.gain.exponentialRampToValueAtTime(0.001, start + dur)
        o.start(start); o.stop(start + dur)
      }
      tone(880, now, 0.08, 0.12)        // A5 — short tap
      tone(1174.7, now + 0.07, 0.1, 0.08) // D6 — soft follow
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
    if (filterNoIndex) c++
    setActiveFilterCount(c)
  }, [timeRange, filterGrade, filterType, filterOptType, filterMinPremium, filterDte, filterSide, filterUnusualOnly, filterNoIndex])

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
    if (filterNoIndex && ["SPX","SPXW","NDXP","NDX","RUT","RUTW"].includes(t.symbol)) return false
    if (filterDte === "0dte" && (t.dte ?? -1) !== 0) return false
    if (filterDte === "1-7" && ((t.dte ?? -1) < 1 || (t.dte ?? -1) > 7)) return false
    if (filterDte === "8-30" && ((t.dte ?? -1) < 8 || (t.dte ?? -1) > 30)) return false
    if (filterDte === "30+" && (t.dte ?? -1) < 30) return false
    return true
  }), [trades, search, focusTicker, focusStrike, focusExpiry, filterGrade, filterType, filterOptType, filterSide, filterUnusualOnly, filterNoIndex, filterDte])

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

  const hasLocalFilter = !!(search || focusTicker || filterGrade || filterType || filterOptType || filterSide || filterUnusualOnly || filterNoIndex || filterDte)
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

  const iconCls = "w-5 h-5"
  const sideBtn = (active: boolean) => `w-10 h-10 flex items-center justify-center rounded-lg transition-all cursor-pointer ${active ? "bg-white/[0.08] text-white" : "text-white/30 hover:text-white/60 hover:bg-white/[0.04]"}`
  const sideCircle = (active: boolean) => `w-9 h-9 flex items-center justify-center rounded-full transition-all cursor-pointer ${active ? "bg-white/[0.12] text-white" : "bg-white/[0.04] text-white/40 hover:text-white/70 hover:bg-white/[0.08]"}`

  return (
    <div className="h-screen flex text-[#E8EDF5] overflow-hidden" style={{ background: '#1C1B23', fontFamily: 'var(--font-barlow), "Barlow Condensed", system-ui, sans-serif' }}>

      {/* ── SIDEBAR ── */}
      <nav className="fixed left-0 top-0 h-full w-[56px] flex flex-col items-center py-4 gap-2 z-40" style={{ background: '#23222D', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
        {/* Logo */}
        <a href="/" className="mb-3 flex items-center justify-center" aria-label="Home">
          <img src="/images/pb-logo.png" alt="Profit Builders" width={28} height={28} className="w-7 h-7 object-contain" />
        </a>

        {/* Main nav */}
        <button onClick={() => setActivePage("scanner")} className={sideBtn(activePage === "scanner")} title="Flow Scanner">
          <svg className={iconCls} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5V19a1 1 0 001 1h4V13.5M3 13.5V10a1 1 0 011-1h4a1 1 0 011 1v3.5M3 13.5h6M9 13.5V19h4V9.5M9 13.5h4M13 13.5V6a1 1 0 011-1h4a1 1 0 011 1v13h-4V13.5M13 13.5h6" /></svg>
        </button>
        <button
          onClick={() => canAccessGamma ? setActivePage("heatmap") : setShowUpgradeModal(true)}
          className={`${sideBtn(activePage === "heatmap")} relative`}
          title={canAccessGamma ? "GEX Heatmap" : "Upgrade for GEX"}
        >
          <svg className={iconCls} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.6}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
          {!canAccessGamma && <span className="absolute -top-0.5 -right-0.5 text-[8px] font-bold text-[#48DEFF] bg-[#48DEFF]/15 px-1 rounded">NEW</span>}
        </button>
        <button onClick={() => setActivePage("watchlist")} className={sideBtn(activePage === "watchlist")} title="Watchlist">
          <svg className={iconCls} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>
        </button>

        <div className="w-6 h-px bg-white/[0.06] my-1" />

        {/* Filters */}
        <button onClick={() => setShowFilters(true)} className={sideBtn(showFilters)} title="Filters">
          <svg className={iconCls} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.6}><path strokeLinecap="round" d="M3 4h18M6 8h12M9 12h6" /></svg>
        </button>

        {/* Bottom circle buttons */}
        <div className="mt-auto flex flex-col items-center gap-2">
          <button onClick={() => setSoundEnabled(!soundEnabled)} className={sideCircle(soundEnabled)} title={soundEnabled ? "Sound on" : "Sound off"}>
            {soundEnabled ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" /></svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" /></svg>
            )}
          </button>
          <a href="/account" className={sideCircle(false)} title="Account">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
          </a>
        </div>
      </nav>

      {/* ── MAIN CONTENT ── */}
      <div className="ml-[56px] flex flex-col h-screen overflow-hidden flex-1">

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
        <div className="flex-1 flex flex-col overflow-hidden" style={{ background: "#242428" }}>
          {/* Metrics header */}
          <div className="flex items-center px-5 py-3 gap-8 border-b border-[#35343F] flex-shrink-0">
            <div className="flex items-center gap-4">
              <div>
                <div className="text-[9px] font-bold text-[#3D4D63] tracking-[0.15em] uppercase">GEX Heatmap</div>
                <div className="text-[10px] text-[#4A5A72]">Gamma Exposure by Strike</div>
              </div>
              <select value={gexSymbol} onChange={e => setGexSymbol(e.target.value)}
                className="bg-[#161B24] border border-[#1E2A3A] text-white text-[15px]rounded-md px-3 py-1.5 font-semibold cursor-pointer focus:outline-none focus:border-[#FF8A00]/50">
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
                    <div className="text-sm font-bold text-[#FF8A00]">${gexData.zero_gamma_strike.toFixed(2)}</div>
                  </div>
                )}
                <div>
                  <div className="text-[9px] text-[#3D4D63] uppercase tracking-widest mb-0.5">Net GEX</div>
                  <div className={`text-sm font-bold ${netGex >= 0 ? "text-[#00E85A]" : "text-[#FF605D]"}`}>
                    {netGex >= 0 ? "+" : ""}{fmtGex(netGex)}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] text-[#3D4D63] uppercase tracking-widest mb-0.5">Dominant</div>
                  <div className={`text-sm font-bold ${netGex >= 0 ? "text-[#00E85A]" : "text-[#FF605D]"}`}>
                    {netGex >= 0 ? "CALL GEX" : "PUT GEX"}
                  </div>
                </div>
              </div>
            )}
            <div className="ml-auto flex items-center gap-4 text-[9px] text-[#4A5A72]">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-[#00E85A]/50 border border-[#00E85A]/30" /> Call</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-[#FF605D]/50 border border-[#FF605D]/30" /> Put</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-white" /> Spot</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 border-t-2 border-[#a855f7]" /> Zero &gamma;</div>
            </div>
          </div>
          {/* GEX table */}
          <div className="flex-1 overflow-auto">
            {gexLoading ? (
              <div className="flex items-center justify-center h-full text-[#3D4D63] text-sm">Loading heatmap...</div>
            ) : gexError ? (
              <div className="flex items-center justify-center h-full text-[#FF605D] text-sm">{gexError}</div>
            ) : gexData ? (
              <div style={{ display: "grid", gridTemplateColumns: `100px repeat(${gexData.expirations.length}, 1fr) 80px` }}>
                {/* Column headers */}
                <div className="sticky top-0 z-10 px-3 py-1 text-[8px] font-semibold text-white/50 tracking-[0.1em] uppercase border-r border-b border-[#35343F]" style={{ background: "#242428" }}>Strike</div>
                {gexData.expirations.map(exp => {
                  const isToday = exp === todayStr
                  return (
                    <div key={exp} className="sticky top-0 z-10 px-2 py-1 text-center border-r border-b border-[#35343F]" style={{ background: "#242428" }}>
                      <div className={`text-[8px] font-semibold tracking-[0.06em] uppercase ${isToday ? "text-[#FF8A00]" : "text-white/50"}`}>
                        {isToday ? "TODAY" : fmtExp(exp)}
                      </div>
                    </div>
                  )
                })}
                <div className="sticky top-0 z-10 px-3 py-1 text-right text-[8px] font-semibold text-white/50 tracking-[0.1em] uppercase border-b border-[#35343F]" style={{ background: "#242428", borderLeft: "1px solid #1E2A3A" }}>Total</div>
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
                    <div key={`s-${strike}`} className="px-2 flex items-center gap-1 border-r border-b border-[#2D2C38]" style={{ minHeight: 24, background: isAtm ? "rgba(255,255,255,0.04)" : "#0B0F1A", position: "sticky", left: 0, zIndex: 5, boxShadow: lineShadow, ...(isAtm ? { borderLeft: "3px solid rgba(255,255,255,0.7)" } : {}) }}>
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
                        <div key={`${strike}-${exp}`} className="border-r border-b border-[#2D2C38] flex items-center justify-center" style={{ background: isAtm && gex === 0 ? "rgba(255,255,255,0.04)" : bg, minHeight: 24, boxShadow: lineShadow }} title={`${strike} / ${exp}: ${fmtGex(gex)}`}>
                          {gex !== 0 && (
                            <span className={`text-[10px] font-mono font-semibold ${intensity > 0.4 ? "text-white" : gex > 0 ? "text-[#00E85A]" : "text-[#FF605D]"}`}>
                              {fmtGex(gex)}
                            </span>
                          )}
                        </div>
                      )
                    }),
                    <div key={`t-${strike}`} className="px-3 flex items-center justify-end border-b border-[#2D2C38]" style={{ minHeight: 24, borderLeft: "1px solid #1E2A3A", ...(isAtm ? { background: "rgba(255,255,255,0.04)" } : {}), boxShadow: lineShadow }}>
                      <span className={`text-[11px] font-mono font-bold ${rowTotal >= 0 ? "text-[#00E85A]" : "text-[#FF605D]"}`}>
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
        <div className="flex-1 flex flex-col overflow-hidden" style={{ background: "#242428" }}>
          {/* Watchlist header */}
          <div className="px-5 py-3 border-b border-[#35343F] flex items-center gap-3 flex-shrink-0">
            <div className="text-[9px] font-bold text-[#4A5A72] tracking-[0.15em] uppercase">Watchlist</div>
            <div className="text-[10px] text-[#3D4D63]">{watchlist.length} symbols</div>
            <div className="ml-auto">
              <input
                placeholder="Add symbol..."
                value={wlInput}
                onChange={e => setWlInput(e.target.value.toUpperCase())}
                onKeyDown={e => { if (e.key === "Enter" && wlInput) { addToWatchlist(wlInput); setWlInput("") } }}
                className="bg-[#080C14] border border-[#1E2A3A] rounded-md px-3 py-1.5 text-[15px]text-white placeholder-[#3D4D63] focus:outline-none focus:border-[#FF8A00]/50 w-36"
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
                <div className="grid sticky top-0 z-10 border-b border-[#35343F] text-[9px] font-bold text-[#3D4D63] tracking-[0.1em] uppercase" style={{ gridTemplateColumns: "1fr 100px 100px 80px 32px", background: "#242428" }}>
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
                    <div key={sym} className="grid border-b border-[#2D2C38] hover:bg-white/[0.05] transition-colors cursor-pointer" style={{ gridTemplateColumns: "1fr 100px 100px 80px 32px", minHeight: 40 }}
                      onClick={() => { setSearch(sym); setActivePage("scanner") }}>
                      <div className="px-5 flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{sym}</span>
                        {count > 0 && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${isBull ? "bg-[#00E85A]/15 text-[#00E85A]" : isBear ? "bg-[#FF605D]/15 text-[#FF605D]" : "bg-white/5 text-[#4A5A72]"}`}>
                            {isBull ? "BULL" : isBear ? "BEAR" : "MIXED"}
                          </span>
                        )}
                      </div>
                      <div className="px-3 flex items-center justify-end">
                        <span className={`text-[11px] font-mono font-semibold ${callPrem > 0 ? "text-[#00E85A]" : "text-[#3D4D63]"}`}>
                          {callPrem > 0 ? fmtPrem(callPrem) : "—"}
                        </span>
                      </div>
                      <div className="px-3 flex items-center justify-end">
                        <span className={`text-[11px] font-mono font-semibold ${putPrem > 0 ? "text-[#FF605D]" : "text-[#3D4D63]"}`}>
                          {putPrem > 0 ? fmtPrem(putPrem) : "—"}
                        </span>
                      </div>
                      <div className="px-3 flex items-center justify-center">
                        <span className="text-[11px] text-[#7A8BA8] font-mono">{count || "—"}</span>
                      </div>
                      <div className="flex items-center justify-center">
                        <button onClick={e => { e.stopPropagation(); removeFromWatchlist(sym) }} className="text-[#3D4D63] hover:text-[#FF605D] transition-colors text-xs">×</button>
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
      <header className="h-9 border-b border-white/[0.04] flex items-center px-3 flex-shrink-0" style={{ background: '#252430' }}>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value.toUpperCase())}
            className="w-36 bg-white/[0.03] border border-white/[0.06] rounded-md px-2.5 py-1 text-[11px] text-white placeholder-white/20 focus:outline-none focus:border-white/[0.12] font-mono"
          />
          <button onClick={() => setShowFilters(true)} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] text-white/50 hover:text-white/70 transition-colors">
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M1 2h10M3 6h6M5 10h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            Filters
            {activeFilterCount > 0 && <span className="bg-white/[0.12] text-white/70 text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center">{activeFilterCount}</span>}
          </button>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <a href="/account" className="text-white/20 text-[10px] hover:text-white/40 transition-colors">Account</a>
          <a href="/logout" className="text-white/20 text-[10px] hover:text-white/40 transition-colors">Logout</a>
        </div>
      </header>

      {/* ── FOCUS BAR ── */}
      {focusTicker && (
        <div className="border-b border-white/[0.04] px-3 py-1.5 flex items-center gap-2 flex-wrap flex-shrink-0" style={{ background: '#23222D' }}>
          <button onClick={() => { setFocusTicker(null); setFocusStrike(null); setFocusExpiry(null) }}
            className="flex items-center gap-1.5 bg-[#48DEFF]/10 border border-[#48DEFF]/30 rounded-full px-3 py-1 text-[#48DEFF] text-xs font-bold hover:bg-[#48DEFF]/20">
            {focusTicker} <span className="text-[#48DEFF]/50">&times;</span>
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
        const totalPrem = displayStats.bull + displayStats.bear
        const bullPct = totalPrem > 0 ? (displayStats.bull / totalPrem) * 100 : 50
        const isBull = displayStats.lean === "BULL"
        const putPct = 100 - callPct
        const circ = 2 * Math.PI * 22
        const pcDash = Math.min(displayStats.pc_ratio / 2, 1) * circ
        const Donut = ({ pct, color }: { pct: number; color: string }) => (
          <svg width="48" height="48" viewBox="0 0 52 52" className="flex-shrink-0">
            <circle cx="26" cy="26" r="22" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
            <circle cx="26" cy="26" r="22" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round"
              strokeDasharray={`${(pct / 100) * circ} ${circ}`} strokeDashoffset={circ / 4}
              style={{ transition: 'stroke-dasharray 0.6s ease' }} />
            <text x="26" y="27" textAnchor="middle" dominantBaseline="central" fill="white" fontSize="10" fontWeight="600" fontFamily="monospace">{pct.toFixed(1)}%</text>
          </svg>
        )
        return (
          <div className="grid border-b border-white/[0.06] flex-shrink-0" style={{ gridTemplateColumns: '1fr 1px 1fr 1px 1fr 1px 1fr', background: '#1C1B23' }}>
            {/* Flow sentiment */}
            <div className="px-5 py-4">
              <div className="text-[12px] text-white/35 mb-2">Flow sentiment</div>
              <div className="flex items-center gap-3">
                <span className={`text-[32px] font-bold leading-none ${isBull ? "text-[#00E85A]" : displayStats.lean === "BEAR" ? "text-[#FF605D]" : "text-white/50"}`}>
                  {isBull ? "Bullish" : displayStats.lean === "BEAR" ? "Bearish" : "Mixed"}
                </span>
                <div className="flex-1 h-[4px] bg-white/[0.06] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${bullPct}%`, background: isBull ? '#00E85A' : '#FF605D' }} />
                </div>
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.06)' }} />
            {/* Put to call */}
            <div className="px-5 py-4 flex items-center justify-between">
              <div>
                <div className="text-[12px] text-white/35 mb-2">Put to call</div>
                <div className="text-[32px] font-bold text-white leading-none font-mono">{displayStats.pc_ratio.toFixed(3)}</div>
              </div>
              <svg width="48" height="48" viewBox="0 0 52 52" className="flex-shrink-0">
                <circle cx="26" cy="26" r="22" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                <circle cx="26" cy="26" r="22" fill="none" stroke="#48DEFF" strokeWidth="3" strokeLinecap="round"
                  strokeDasharray={`${pcDash} ${circ}`} strokeDashoffset={circ / 4}
                  style={{ transition: 'stroke-dasharray 0.6s ease' }} />
                <text x="26" y="27" textAnchor="middle" dominantBaseline="central" fill="white" fontSize="10" fontWeight="600" fontFamily="monospace">{displayStats.pc_ratio.toFixed(2)}</text>
              </svg>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.06)' }} />
            {/* Call flow */}
            <div className="px-5 py-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[11px] text-white/30">Call flow</span>
                  <span className="text-[14px] font-bold text-[#00E85A] font-mono ml-auto">{fmtPrem(callPrem)}</span>
                </div>
                <div className="text-[32px] font-bold text-white leading-none font-mono">{calls.length.toLocaleString()}</div>
              </div>
              <Donut pct={callPct} color="#00E85A" />
            </div>
            <div style={{ background: 'rgba(255,255,255,0.06)' }} />
            {/* Put flow */}
            <div className="px-5 py-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[11px] text-white/30">Put flow</span>
                  <span className="text-[14px] font-bold text-[#FF605D] font-mono ml-auto">{fmtPrem(putPrem)}</span>
                </div>
                <div className="text-[32px] font-bold text-white leading-none font-mono">{puts.length.toLocaleString()}</div>
              </div>
              <Donut pct={putPct} color="#FF605D" />
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
                <tr key={i} className="border-b border-white/[0.02]">
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
                const t = filtered[vRow.index]
                if (!t || t.mm_suspected) return null
                const isNew = newTradeIds.has(t.id)
                const rowStyle = isNew ? { backgroundColor: "rgba(96,165,250,0.10)" } : getRowStyle(t)
                return (
                  <tr
                    key={vRow.key}
                    data-index={vRow.index}
                    ref={rowVirtualizer.measureElement}
                    className={`border-b border-white/[0.03] transition-colors ${rowStyle.backgroundColor ? '' : 'hover:bg-white/[0.05]'}`}
                    style={rowStyle}
                  >
                    <td className="px-3 py-3 text-white/50 text-[15px]font-mono whitespace-nowrap">{t.time ?? t.date_time?.slice(11, 16) ?? "—"}</td>
                    <td className="px-2 py-3">
                      <button onClick={() => { setFocusTicker(t.symbol); setFocusStrike(null); setFocusExpiry(null) }}
                        className="text-left group">
                        <div className="font-bold text-[18px] text-white leading-none group-hover:text-[#48DEFF] transition-colors">{t.symbol}</div>
                        {t.sector && <div className="text-white/25 text-[10px] mt-0.5">{t.sector}</div>}
                      </button>
                    </td>
                    <td className="px-2 py-3">
                      <button onClick={() => { setFocusExpiry(t.expiration); if (!focusTicker) setFocusTicker(t.symbol) }}
                        className="text-white hover:text-[#48DEFF] transition-colors text-[15px]font-mono">
                        {fmtExpiry(t.expiration)}
                      </button>
                    </td>
                    <td className="px-2 py-3 text-right">
                      <button onClick={() => { setFocusStrike(String(t.strike)); if (!focusTicker) setFocusTicker(t.symbol) }}
                        className="text-white hover:text-[#48DEFF] transition-colors text-[15px]font-mono">
                        {t.strike_fmt ?? t.strike}
                      </button>
                    </td>
                    <td className="px-2 py-3 text-center text-[15px]font-semibold" style={{ color: t.row_color === 'bullish' ? '#00E85A' : '#FF605D' }}>
                      {t.opt_type === "C" ? "Call" : "Put"}
                    </td>
                    <td className={`px-2 py-3 text-center text-[15px]${aggrColor(t.aggression)}`}>
                      {aggrLabel(t.aggression)}
                    </td>
                    <td className={`px-2 py-3 text-center text-[15px]font-medium ${bsColor(t.trade_direction)}`}>
                      {bsLabel(t.trade_direction)}
                    </td>
                    <td className="px-2 py-3 text-right text-white text-[15px]font-mono">{t.spot_fmt}</td>
                    <td className={`px-2 py-3 text-right text-[15px]font-mono ${(t.contracts ?? 0) >= 1000 ? "text-[#22d3ee] font-semibold" : "text-white"}`}>{(t.contracts ?? 0).toLocaleString()}</td>
                    <td className="px-2 py-3 text-right text-white/70 text-[15px]font-mono">{t.entry_price ? `$${t.entry_price.toFixed(2)}` : "—"}</td>
                    <td className="px-2 py-3 text-right text-[15px]font-bold" style={{ color: t.row_color === 'bullish' ? '#00E85A' : '#FF605D' }}>
                      {t.premium_fmt}
                    </td>
                    <td className={`px-2 py-3 text-center text-[15px]font-medium ${
                      t.flow_type === "SWEEP" ? "text-[#F2C94C]" : t.flow_type === "BLOCK" ? "text-[#48DEFF]" + (t.premium >= 1000000 ? " font-bold" : "") : "text-white/70"
                    }`}>
                      {t.flow_type || "—"}
                    </td>
                    <td className="px-2 py-3 text-right text-[15px]font-mono text-white/80">
                      {(t.day_volume ?? 0) > 0 ? t.day_volume.toLocaleString() : "—"}
                    </td>
                    <td className="px-2 py-3 text-right text-white/80 text-[15px]font-mono">
                      {(t.open_interest ?? 0) > 0 ? t.open_interest.toLocaleString() : "—"}
                    </td>
                    <td className="px-2 py-3">
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
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px]" onClick={() => setShowFilters(false)} />
          <div className="fixed right-0 top-0 h-full w-80 z-50 flex flex-col overflow-y-auto" style={{ background: 'linear-gradient(180deg, #222226 0%, #2D2C38 100%)' }}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"><path d="M3 4h18M6 8h12M9 12h6M11 16h2"/></svg>
                <span className="text-white font-semibold text-[15px]tracking-wide">Filters</span>
                {activeFilterCount > 0 && <span className="bg-[#48DEFF] text-[10px] font-bold text-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center">{activeFilterCount}</span>}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setTimeRange("today"); setPage(0); setFilterGrade(""); setFilterType(""); setFilterOptType(""); setFilterMinPremium(0); setFilterDte(""); setFilterSide(""); setFilterUnusualOnly(false); setFilterNoIndex(false) }} className="text-white/30 hover:text-white/60 text-[11px] transition-colors">Reset</button>
                <button onClick={() => setShowFilters(false)} className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center text-white/40 hover:text-white transition-colors text-sm">&times;</button>
              </div>
            </div>

            <div className="flex-1 px-5 py-4 space-y-5">
              {/* Segmented control helper */}
              {(() => {
                const Seg = ({ label, options, value, onChange }: { label: string; options: { v: string | number; l: string }[]; value: string | number; onChange: (v: any) => void }) => (
                  <div>
                    <div className="text-[10px] font-medium uppercase tracking-[0.12em] text-white/25 mb-2">{label}</div>
                    <div className="inline-flex rounded-lg bg-white/[0.03] border border-white/[0.06] p-0.5">
                      {options.map(o => (
                        <button key={String(o.v)} onClick={() => onChange(o.v)}
                          className={`px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all ${value === o.v ? "bg-white/[0.1] text-white shadow-sm" : "text-white/30 hover:text-white/50"}`}>
                          {o.l}
                        </button>
                      ))}
                    </div>
                  </div>
                )
                const Pill = ({ label, options, value, onChange }: { label: string; options: { v: string | number; l: string }[]; value: string | number; onChange: (v: any) => void }) => (
                  <div>
                    <div className="text-[10px] font-medium uppercase tracking-[0.12em] text-white/25 mb-2">{label}</div>
                    <div className="flex gap-1.5 flex-wrap">
                      {options.map(o => (
                        <button key={String(o.v)} onClick={() => onChange(o.v)}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all ${value === o.v ? "bg-white/[0.1] border-white/[0.15] text-white" : "bg-transparent border-white/[0.06] text-white/25 hover:text-white/45 hover:border-white/[0.1]"}`}>
                          {o.l}
                        </button>
                      ))}
                    </div>
                  </div>
                )
                const Toggle = ({ label, desc, active, onToggle, color }: { label: string; desc: string; active: boolean; onToggle: () => void; color?: string }) => (
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <div className="text-white/80 text-[12px] font-medium">{label}</div>
                      <div className="text-white/20 text-[10px] mt-0.5">{desc}</div>
                    </div>
                    <button onClick={onToggle}
                      className={`w-9 h-[22px] rounded-full transition-all relative flex-shrink-0 ${active ? "" : "bg-white/[0.06]"}`}
                      style={active ? { backgroundColor: color || '#48DEFF' } : undefined}>
                      <div className={`absolute top-[3px] w-4 h-4 rounded-full transition-all ${active ? "left-[18px] bg-white" : "left-[3px] bg-white/30"}`} />
                    </button>
                  </div>
                )
                return <>
                  <Seg label="Time Range" options={TIME_RANGES.map(r => ({ v: r.key, l: r.label }))} value={timeRange} onChange={(v: string) => { setTimeRange(v); setPage(0) }} />

                  <div className="border-t border-white/[0.04] pt-4 space-y-4">
                    <Seg label="Grade" options={[{ v: "", l: "All" }, { v: "A", l: "A" }, { v: "B", l: "B" }]} value={filterGrade} onChange={setFilterGrade} />
                    <Seg label="Flow Type" options={[{ v: "", l: "All" }, { v: "SWEEP", l: "Sweep" }, { v: "BLOCK", l: "Block" }]} value={filterType} onChange={setFilterType} />
                    <Seg label="Calls / Puts" options={[{ v: "", l: "All" }, { v: "C", l: "Calls" }, { v: "P", l: "Puts" }]} value={filterOptType} onChange={setFilterOptType} />
                  </div>

                  <div className="border-t border-white/[0.04] pt-4 space-y-4">
                    <Pill label="Min Premium" options={[{ v: 0, l: "Any" }, { v: 100000, l: "$100K" }, { v: 250000, l: "$250K" }, { v: 500000, l: "$500K" }, { v: 1000000, l: "$1M" }]} value={filterMinPremium} onChange={setFilterMinPremium} />
                    <Pill label="Expiry" options={[{ v: "", l: "All" }, { v: "0dte", l: "0DTE" }, { v: "1-7", l: "1-7d" }, { v: "8-30", l: "8-30d" }, { v: "30+", l: "30d+" }]} value={filterDte} onChange={setFilterDte} />
                    <Pill label="Side" options={[{ v: "", l: "All" }, { v: "ABOVE_ASK", l: "Above" }, { v: "AT_ASK", l: "Ask" }, { v: "BELOW_BID", l: "Bid" }]} value={filterSide} onChange={setFilterSide} />
                  </div>

                  <div className="border-t border-white/[0.04] pt-3 space-y-0">
                    <Toggle label="Unusual Only" desc="V/OI flagged activity" active={filterUnusualOnly} onToggle={() => setFilterUnusualOnly(!filterUnusualOnly)} />
                    <Toggle label="No Index" desc="Hide SPX, NDX, RUT, VIX" active={filterNoIndex} onToggle={() => setFilterNoIndex(!filterNoIndex)} color="#FF8A00" />
                  </div>
                </>
              })()}
            </div>

            <div className="px-5 py-4 border-t border-white/[0.06]">
              <button onClick={() => { setPage(0); setShowFilters(false) }}
                className="w-full py-3 rounded-lg text-[12px] font-semibold transition-all bg-white/[0.08] hover:bg-white/[0.12] text-white/70 hover:text-white border border-white/[0.06]">
                Apply
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
            <div className="text-[#FF8A00] text-[10px] font-bold tracking-[0.15em] uppercase mb-3">Pro Feature</div>
            <div className="text-xl font-bold text-white mb-2">Gamma Wall Scanner</div>
            <div className="text-sm text-[#7A8BA8] mb-6 leading-relaxed">
              Real-time GEX heatmaps, gamma wall detection, and squeeze identification are available on the Pro plan.
            </div>
            <a href="/#pricing" className="block w-full text-center py-3 rounded-lg bg-[#FF8A00] text-black font-bold text-[15px]hover:bg-[#e57309] transition-colors">
              Upgrade to Pro
            </a>
            <button onClick={() => setShowUpgradeModal(false)} className="block w-full text-center py-2 mt-3 text-[#4A5A72] text-[15px]hover:text-[#7A8BA8] transition-colors">
              Not now
            </button>
          </div>
        </div>
      )}

      </div>
    </div>
  )
}
