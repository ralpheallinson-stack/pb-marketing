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

function isMarketOpen() {
  const now = new Date()
  const et = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }))
  const day = et.getDay()
  if (day === 0 || day === 6) return false
  const mins = et.getHours() * 60 + et.getMinutes()
  return mins >= 570 && mins < 960 // 9:30 - 16:00
}

/* ── conds badges ── */
function condBadges(t: Trade): { label: string; color: string }[] {
  const badges: { label: string; color: string }[] = []
  if ((t.vol_oi ?? 0) >= 5) badges.push({ label: (t.vol_oi ?? 0) >= 20 ? "UNUSUAL" : "HIGH V/OI", color: "#a855f7" })
  if (t.accum_hits >= 3) badges.push({ label: `ACCUM ${t.accum_hits}x`, color: "#3b82f6" })
  if (t.whale) badges.push({ label: "WHALE", color: "#f97316" })
  if (t.position_action === "OPENING") badges.push({ label: "OPENING", color: "#22c55e" })
  else if (t.position_action === "ADJUSTING") badges.push({ label: "ADJUSTING", color: "#eab308" })
  if (t.mm_suspected) badges.push({ label: "MM", color: "#ef4444" })
  if (t.structure && t.structure !== "SINGLE_LEG" && (t.structure_confidence ?? 0) >= 0.5)
    badges.push({ label: t.structure.replace("_", " "), color: "#64748b" })
  if (t.is_event_driven) badges.push({ label: "EARNINGS", color: "#f97316" })
  if (t.adv_multiple && t.adv_multiple >= 5) badges.push({ label: t.adv_multiple >= 10 ? "EXTREME" : "OUTSIZED", color: "#22c55e" })
  return badges.slice(0, 4)
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

/* ── tabs ── */
const TABS = [
  { key: "live", label: "Live Flow" },
  { key: "today", label: "Today" },
  { key: "week", label: "Week" },
  { key: "last_week", label: "Last Wk" },
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
  const [activeTab, setActiveTab] = useState("live")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [live, setLive] = useState(isMarketOpen())
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [activePage, setActivePage] = useState<"scanner" | "heatmap" | "watchlist">("scanner")
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
  const [activeFilterCount, setActiveFilterCount] = useState(0)
  const [focusTicker, setFocusTicker] = useState<string | null>(null)
  const [focusStrike, setFocusStrike] = useState<string | null>(null)
  const [focusExpiry, setFocusExpiry] = useState<string | null>(null)
  const lastTradeIdRef = useRef<number>(0)
  const isFirstLoadRef = useRef<boolean>(true)
  const [newTradeIds, setNewTradeIds] = useState<Set<number>>(new Set())
  const tableContainerRef = useRef<HTMLDivElement>(null)

  const playBlip = useCallback(() => {
    if (!soundEnabled) return
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContext()
      const ctx = audioCtxRef.current
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.connect(g)
      g.connect(ctx.destination)
      o.frequency.setValueAtTime(1200, ctx.currentTime)
      g.gain.setValueAtTime(0.3, ctx.currentTime)
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12)
      o.start()
      o.stop(ctx.currentTime + 0.12)
    } catch { /* audio not available */ }
  }, [soundEnabled])

  const buildUrl = useCallback((tab: string, opts?: { sinceId?: number }) => {
    const apiTab = tab === "live" ? "today" : tab
    const p = new URLSearchParams()
    if (apiTab !== "today") p.set("range", apiTab)
    if (filterMinPremium > 0) p.set("min_premium", filterMinPremium.toString())
    if (filterDte === "0dte") p.set("max_dte", "0")
    else if (filterDte === "1-7") p.set("max_dte", "7")
    else if (filterDte === "8-30") p.set("max_dte", "30")
    p.set("slim", "true")
    if (opts?.sinceId && opts.sinceId > 0) p.set("since_id", opts.sinceId.toString())
    const qs = p.toString()
    return `/api/scanner/live-flow?${qs}`
  }, [filterMinPremium, filterDte])

  const fetchData = useCallback(async (tab?: string, initial = false) => {
    const t = tab ?? activeTab
    if (initial) setLoading(true)
    try {
      // Incremental polling — only fetch new trades after first load on live tab
      if (t === "live" && !isFirstLoadRef.current && lastTradeIdRef.current > 0) {
        const res = await fetch(buildUrl(t, { sinceId: lastTradeIdRef.current }))
        if (res.status === 401 || res.status === 403) { router.push("/login"); return }
        const data: ApiResponse = await res.json()
        if (data.trades?.length > 0) {
          const newMaxId = Math.max(...data.trades.map((tr: Trade) => tr.id))
          lastTradeIdRef.current = newMaxId
          setTrades(prev => [...data.trades, ...prev].slice(0, 2000))
          playBlip()
          const brandNew = new Set(data.trades.map((tr: Trade) => tr.id))
          setNewTradeIds(brandNew)
          setTimeout(() => setNewTradeIds(new Set()), 2000)
        }
        // Don't update stats on incremental — only on full reload
        return
      }

      // Full load (first time, tab switch, or non-live tabs)
      const res = await fetch(buildUrl(t))
      if (res.status === 401 || res.status === 403) { router.push("/login"); return }
      const data: ApiResponse = await res.json()
      if (data.error) return
      const incoming = data.trades || []
      // blip on new trades (for non-live tabs or first load)
      if (prevTradeIdsRef.current.size > 0 && incoming.some(tr => !prevTradeIdsRef.current.has(tr.id))) {
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
  }, [activeTab, buildUrl, router, playBlip])

  // initial load + tab change — reset incremental state
  useEffect(() => {
    isFirstLoadRef.current = true
    lastTradeIdRef.current = 0
    setTrades([])
    fetchData(activeTab, true)
  }, [activeTab, fetchData])

  // auto-refresh every 5s only on "live" tab
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (activeTab === "live") {
      intervalRef.current = setInterval(() => {
        setLive(isMarketOpen())
        fetchData("live")
      }, 5000)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [activeTab, fetchData])

  // active filter count
  useEffect(() => {
    let c = 0
    if (filterGrade) c++
    if (filterType) c++
    if (filterOptType) c++
    if (filterMinPremium > 0) c++
    if (filterDte) c++
    if (filterSide) c++
    if (filterUnusualOnly) c++
    if (filterExcludeMM) c++
    setActiveFilterCount(c)
  }, [filterGrade, filterType, filterOptType, filterMinPremium, filterDte, filterSide, filterUnusualOnly, filterExcludeMM])

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
    if (filterDte === "0dte" && (t.dte ?? -1) !== 0) return false
    if (filterDte === "1-7" && ((t.dte ?? -1) < 1 || (t.dte ?? -1) > 7)) return false
    if (filterDte === "8-30" && ((t.dte ?? -1) < 8 || (t.dte ?? -1) > 30)) return false
    if (filterDte === "30+" && (t.dte ?? -1) < 30) return false
    return true
  }), [trades, search, focusTicker, focusStrike, focusExpiry, filterGrade, filterType, filterOptType, filterSide, filterUnusualOnly, filterExcludeMM, filterDte])

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

  const hasLocalFilter = !!(search || focusTicker || filterGrade || filterType || filterOptType || filterSide || filterUnusualOnly || filterExcludeMM || filterDte)
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

  /* ── sidebar nav item ── */
  const SideItem = ({ icon, label, active, onClick, href }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void; href?: string }) => {
    const cls = `w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer transition-colors relative group ${active ? "bg-[#F5820A]/10 text-[#F0F2F5] border-l-2 border-l-[#F5820A]" : "text-[#3D4D63] hover:bg-[#1E2530] hover:text-[#7A8BA8]"}`
    const tooltip = <div className="absolute left-[46px] bg-[#1E2530] border border-[#252E3D] text-[#E8EDF5] text-xs px-2 py-1 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">{label}</div>
    if (href) return <a href={href} className={cls}>{icon}{tooltip}</a>
    return <button onClick={onClick} className={cls}>{icon}{tooltip}</button>
  }

  const iconCls = "w-[18px] h-[18px]"

  return (
    <div className="h-screen flex bg-[#0E1117] text-[#E8EDF5] overflow-hidden">

      {/* ── SIDEBAR ── */}
      <nav className="fixed left-0 top-0 h-full w-[52px] bg-[#161B24] border-r border-[#252E3D] flex flex-col items-center py-3 z-40">
        <a href="/" className="mb-3 flex-shrink-0" aria-label="Home">
  <svg width="28" height="28" viewBox="0 0 24 28" fill="#F0F2F5" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 0h4v28H0z"/>
    <path d="M4 0h8a8 8 0 010 16H4z"/>
    <path d="M4 14h9a7 7 0 010 14H4z"/>
  </svg>
</a>
        <div className="flex flex-col items-center gap-1">
          <SideItem label="Flow Scanner" active={activePage === "scanner"} onClick={() => setActivePage("scanner")}
            icon={<svg className={iconCls} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5V19a1 1 0 001 1h4V13.5M3 13.5V10a1 1 0 011-1h4a1 1 0 011 1v3.5M3 13.5h6M9 13.5V19h4V9.5M9 13.5h4M13 13.5V6a1 1 0 011-1h4a1 1 0 011 1v13h-4V13.5M13 13.5h6" /></svg>} />
          <SideItem label="GEX Heatmap" active={activePage === "heatmap"} onClick={() => setActivePage("heatmap")}
            icon={<svg className={iconCls} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><rect x="3" y="3" width="7" height="7" rx="1" strokeLinecap="round" strokeLinejoin="round" /><rect x="14" y="3" width="7" height="7" rx="1" strokeLinecap="round" strokeLinejoin="round" /><rect x="3" y="14" width="7" height="7" rx="1" strokeLinecap="round" strokeLinejoin="round" /><rect x="14" y="14" width="7" height="7" rx="1" strokeLinecap="round" strokeLinejoin="round" /></svg>} />
          <SideItem label="Watchlist" active={activePage === "watchlist"} onClick={() => setActivePage("watchlist")}
            icon={<svg className={iconCls} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>} />
          <div className="w-6 h-px bg-white/[0.08] my-1" />
          <SideItem label="Export" onClick={() => {}}
            icon={<svg className={iconCls} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>} />
        </div>
        <div className="mt-auto flex flex-col items-center gap-1">
          <SideItem label={soundEnabled ? "Sound on" : "Sound off"} active={soundEnabled} onClick={() => setSoundEnabled(!soundEnabled)}
            icon={soundEnabled ? (
              <svg className={iconCls} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" /></svg>
            ) : (
              <svg className={iconCls} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" /></svg>
            )} />
          <SideItem label="Account" href="/account"
            icon={<svg className={iconCls} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>} />
        </div>
      </nav>

      {/* ── MAIN CONTENT ── */}
      <div className="ml-[52px] flex flex-col h-screen overflow-hidden flex-1">

      {activePage === "heatmap" ? (
        <div className="flex-1 flex items-center justify-center text-[#3D4D63] text-sm">GEX Heatmap — coming soon</div>
      ) : activePage === "watchlist" ? (
        <div className="flex-1 flex items-center justify-center text-[#3D4D63] text-sm">Watchlist — coming soon</div>
      ) : (<>

      {/* ── HEADER ── */}
      <header className="h-12 bg-[#161B24] border-b border-[#252E3D] flex items-center px-4 flex-shrink-0">
        <div className="flex-1 flex justify-center">
          <input
            type="text"
            placeholder="Search symbol..."
            value={search}
            onChange={e => setSearch(e.target.value.toUpperCase())}
            className="w-72 bg-[#1E2530] border border-[#252E3D] rounded-lg px-3 py-1.5 text-sm text-[#E8EDF5] placeholder-[#3D4D63] focus:outline-none focus:border-[#60a5fa]/50"
          />
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className={`flex items-center gap-1.5 border rounded-full px-3 py-1 text-xs ${live ? "bg-[#22c55e]/10 border-[#22c55e]/30 text-[#22c55e]" : "bg-[#1E2530] border-[#2E3A4D] text-[#7A8BA8]"}`}>
            {live && <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />}
            {live ? "LIVE" : "CLOSED"}
          </div>
          <a href="/logout" className="text-[#3D4D63] text-xs hover:text-[#E8EDF5]">Logout</a>
        </div>
      </header>

      {/* ── TIME TABS ── */}
      <div className="bg-[#161B24] border-b border-[#252E3D] px-4 h-10 flex items-center gap-1 flex-shrink-0 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-2 text-sm whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? "text-[#E8EDF5] border-b-2 border-[#60a5fa] font-medium"
                : "text-[#3D4D63] hover:text-[#7A8BA8]"
            }`}
          >
            {tab.label}
          </button>
        ))}
        <button onClick={() => setShowFilters(true)} className="ml-auto flex items-center gap-2 bg-[#1E2530] hover:bg-[#252E3D] border border-[#252E3D] text-[#7A8BA8] hover:text-[#E8EDF5] rounded-lg px-3 py-1.5 text-xs transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M7 8h10M10 12h4" /></svg>
          Filters
          {activeFilterCount > 0 && <span className="bg-[#60a5fa] text-black text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">{activeFilterCount}</span>}
        </button>
      </div>

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
        const callDash = (callPct / 100) * circ
        const putDash = (putPct / 100) * circ
        return (
          <div className="grid grid-cols-4 divide-x divide-[#252E3D] border-b border-[#252E3D] bg-[#0E1117] flex-shrink-0">
            {/* Sentiment */}
            <div className="p-4">
              <div className="text-xs text-white/35 mb-2">Flow sentiment</div>
              <div className="flex items-center gap-4">
                <span className={`text-2xl font-bold ${isBull ? "text-[#22c55e]" : displayStats.lean === "BEAR" ? "text-[#ef4444]" : "text-white/60"}`}>
                  {isBull ? "Bullish" : displayStats.lean === "BEAR" ? "Bearish" : "Mixed"}
                </span>
                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${isBull ? bullPct : 100 - bullPct}%`, background: isBull ? "#22c55e" : "#ef4444" }} />
                </div>
              </div>
              <div className="text-xs text-white/30 mt-1">{displayStats.count.toLocaleString()} signals</div>
            </div>
            {/* P/C Ratio */}
            <div className="p-4">
              <div className="text-xs text-white/35 mb-2">Put to call</div>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-white">{displayStats.pc_ratio.toFixed(3)}</span>
                <svg width="48" height="48" viewBox="0 0 48 48">
                  <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
                  <circle cx="24" cy="24" r="20" fill="none" stroke="#60a5fa" strokeWidth="4" strokeLinecap="round"
                    strokeDasharray={`${pcDash} ${circ}`} strokeDashoffset={circ / 4}
                    style={{ transition: "stroke-dasharray 0.5s" }} />
                </svg>
              </div>
            </div>
            {/* Call flow */}
            <div className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/35">Call flow</span>
                <span className="text-[#22c55e] text-sm font-bold">{fmtPrem(callPrem)}</span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-2xl font-bold text-white">{calls.length.toLocaleString()}</span>
                <svg width="48" height="48" viewBox="0 0 48 48" className="flex-shrink-0">
                  <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
                  <circle cx="24" cy="24" r="20" fill="none" stroke="#22c55e" strokeWidth="4" strokeLinecap="round"
                    strokeDasharray={`${callDash} ${circ}`} strokeDashoffset={circ / 4}
                    style={{ transition: "stroke-dasharray 0.5s" }} />
                  <text x="24" y="24" textAnchor="middle" dominantBaseline="central" fill="white" fontSize="10" fontWeight="600">{callPct}%</text>
                </svg>
              </div>
            </div>
            {/* Put flow */}
            <div className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/35">Put flow</span>
                <span className="text-[#ef4444] text-sm font-bold">{fmtPrem(putPrem)}</span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-2xl font-bold text-white">{puts.length.toLocaleString()}</span>
                <svg width="48" height="48" viewBox="0 0 48 48" className="flex-shrink-0">
                  <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
                  <circle cx="24" cy="24" r="20" fill="none" stroke="#ef4444" strokeWidth="4" strokeLinecap="round"
                    strokeDasharray={`${putDash} ${circ}`} strokeDashoffset={circ / 4}
                    style={{ transition: "stroke-dasharray 0.5s" }} />
                  <text x="24" y="24" textAnchor="middle" dominantBaseline="central" fill="white" fontSize="10" fontWeight="600">{putPct}%</text>
                </svg>
              </div>
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
                const isWhaleRow = t.whale
                const isUnusual = (t.vol_oi ?? 0) >= 20 || t.premium >= 5000000
                const isMM = t.mm_suspected
                const isNew = newTradeIds.has(t.id)
                return (
                  <tr
                    key={vRow.key}
                    data-index={vRow.index}
                    ref={rowVirtualizer.measureElement}
                    className={`border-b border-[#252E3D] hover:bg-white/[0.03] transition-colors ${
                      isNew ? "bg-[#60a5fa]/10" :
                      isWhaleRow ? "bg-[#F5820A1A] border-l-2 border-l-[#F5820A]" :
                      isUnusual ? "bg-[#9333EA1A] border-l-2 border-l-[#9333EA]" :
                      vRow.index % 2 !== 0 ? "bg-white/[0.015]" : ""
                    } ${isMM ? "opacity-50" : ""} ${t.high_conviction ? "border-l-2 border-l-[#F5820A]" : ""}`}
                  >
                    <td className="px-3 py-2 text-white/50 text-xs whitespace-nowrap">{t.time ?? t.date_time?.slice(11, 16) ?? "—"}</td>
                    <td className="px-2 py-2">
                      <button onClick={() => { setFocusTicker(t.symbol); setFocusStrike(null); setFocusExpiry(null) }}
                        className="text-left group">
                        <div className="font-bold text-sm text-white group-hover:text-[#60a5fa] transition-colors">{t.symbol}</div>
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
                    <td className="px-2 py-2 text-center">
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                        t.flow_type === "SWEEP" ? "bg-purple-500/20 text-purple-300" :
                        t.flow_type === "BLOCK" ? "bg-blue-500/20 text-blue-300" :
                        "bg-white/10 text-white/50"
                      }`}>
                        {t.flow_type || "—"}
                      </span>
                    </td>
                    <td className={`px-2 py-2 text-right text-xs ${
                      t.premium >= 1000000 ? "text-orange-400 font-bold" : t.premium >= 500000 ? "text-yellow-400 font-bold" : t.premium >= 100000 ? "text-white font-semibold" : "text-white/60"
                    }`}>
                      {t.premium_fmt}
                    </td>
                    <td className="px-2 py-2 text-right text-white/50 text-xs font-mono">
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
                          <span
                            key={i}
                            className="text-[9px] font-medium px-1.5 py-0.5 rounded whitespace-nowrap"
                            style={{ background: `${b.color}20`, color: b.color }}
                          >
                            {b.label}
                          </span>
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

      {/* ── FILTER PANEL ── */}
      {showFilters && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setShowFilters(false)} />
          <div className="fixed right-0 top-0 h-full w-72 bg-[#161B24] border-l border-[#252E3D] z-50 flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-[#252E3D]">
              <span className="text-white font-semibold text-sm">Filters</span>
              <div className="flex items-center gap-3">
                <button onClick={() => { setFilterGrade(""); setFilterType(""); setFilterOptType(""); setFilterMinPremium(0); setFilterDte(""); setFilterSide(""); setFilterUnusualOnly(false); setFilterExcludeMM(false) }} className="text-white/40 hover:text-white text-xs">Reset all</button>
                <button onClick={() => setShowFilters(false)} className="text-white/40 hover:text-white text-lg leading-none">&times;</button>
              </div>
            </div>
            <div className="flex-1 p-4 space-y-6">
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
            </div>
            <div className="p-4 border-t border-[#252E3D]">
              <button onClick={() => { fetchData(); setShowFilters(false) }}
                className="w-full bg-[#60a5fa] hover:bg-[#3b82f6] text-black font-bold py-3 rounded-xl text-sm transition-colors">
                Apply Filters
              </button>
            </div>
          </div>
        </>
      )}

      </>)}
      </div>
    </div>
  )
}
