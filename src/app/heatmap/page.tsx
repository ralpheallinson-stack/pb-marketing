"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Nav from "@/components/Nav"
import CommandPalette from "@/components/CommandPalette"
import InfoTooltip from "@/components/InfoTooltip"
import ReplayProgress from "@/components/ReplayProgress"

import Link from "next/link"
interface GexCell { net_gex: number; call_oi: number; put_oi: number; has_greeks?: boolean }
interface GexData {
  symbol: string; spot: number; spot_fmt: string; expirations: string[]; strikes: number[]
  matrix: Record<string, Record<string, GexCell>>; max_abs_gex: number
  zero_gamma_strike: number | null
  gamma_flip: number | null
  total_net_gex: number
  gamma_slope: number | null
  slope_strike: number | null
  max_plus_gex: { strike: number; gex: number } | null
  max_minus_gex: { strike: number; gex: number } | null
  prev_close: number | null
  spot_change: number | null
  spot_change_pct: number | null
  top_cells: { strike: number; expiry: string; net_gex: number }[]
}

function fmtGex(v: number) {
  const abs = Math.abs(v), sign = v < 0 ? "-" : ""
  if (abs >= 1e12) return `${sign}$${(abs / 1e12).toFixed(2)}T`
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(2)}B`
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(1)}M`
  if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(0)}K`
  return `${sign}$${abs.toFixed(0)}`
}

// Compact cell formatter (matrix interior). Drops the dollar sign and shows
// fewer decimals — the row is dense with numbers, every character matters.
function fmtCell(v: number) {
  const abs = Math.abs(v), sign = v < 0 ? "-" : ""
  if (abs >= 1e12) return `${sign}${(abs / 1e12).toFixed(2)}T`
  if (abs >= 1e9) return `${sign}${(abs / 1e9).toFixed(1)}B`
  if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(1)}M`
  if (abs >= 1e3) return `${sign}${(abs / 1e3).toFixed(1)}K`
  return `${sign}${abs.toFixed(0)}`
}

const GEX_SYMBOLS = ["SPY","QQQ","AAPL","TSLA","NVDA","META","MSFT","AMZN","GOOGL","AMD","MU","COIN","PLTR","NFLX","CRM","BA","JPM","GS","XOM","GLD"]
const SYMBOL_NAMES: Record<string, string> = {
  SPY: "State Street SPDR S&P 500 ETF Trust",
  QQQ: "Invesco QQQ Trust",
  AAPL: "Apple Inc.",
  TSLA: "Tesla, Inc.",
  NVDA: "NVIDIA Corporation",
  META: "Meta Platforms, Inc.",
  MSFT: "Microsoft Corporation",
  AMZN: "Amazon.com, Inc.",
  GOOGL: "Alphabet Inc.",
  AMD: "Advanced Micro Devices, Inc.",
  MU: "Micron Technology, Inc.",
  COIN: "Coinbase Global, Inc.",
  PLTR: "Palantir Technologies Inc.",
  NFLX: "Netflix, Inc.",
  CRM: "Salesforce, Inc.",
  BA: "The Boeing Company",
  JPM: "JPMorgan Chase & Co.",
  GS: "Goldman Sachs Group, Inc.",
  XOM: "Exxon Mobil Corporation",
  GLD: "SPDR Gold Trust",
}

export default function HeatmapPage() {
  const router = useRouter()
  const [canAccess, setCanAccess] = useState<boolean | null>(null)
  const [symbol, setSymbol] = useState("SPY")
  const [paletteOpen, setPaletteOpen] = useState(false)

  // Bare-letter keyboard shortcut. S = open command palette. Guard against
  // firing while user is typing in any input element to avoid trapping form
  // keypresses. Uses tagName + isContentEditable rather than activeElement
  // because Radix Slider thumb has tabindex but isn't a typed input.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const target = e.target as HTMLElement | null
      if (target) {
        const tag = target.tagName
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return
        if (target.isContentEditable) return
      }
      if (e.key === "s" || e.key === "S") {
        e.preventDefault()
        setPaletteOpen(true)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])
  const [data, setData] = useState<GexData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    document.title = "GEX Heatmap — Gamma Exposure by Strike | Profit Builders"
    fetch("/api/me")
      .then(r => { if (r.status === 401 || r.status === 403) { router.push("/login"); return null } return r.json() })
      .then(d => { if (d) setCanAccess(d.gamma_wall) })
      .catch(() => router.push("/login"))
  }, [router])

  useEffect(() => {
    if (!canAccess) return
    setLoading(true); setError("")
    fetch(`/api/scanner/gex-heatmap?symbol=${symbol}`)
      .then(r => r.json())
      .then(d => { if (d.error) { setError(d.error); setData(null) } else setData(d) })
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false))
  }, [canAccess, symbol])

  // Live spot polling — see comment in scanner page. OI is fixed intraday;
  // only spot moves tick-to-tick, so we poll a cheap dedicated Redis-backed
  // endpoint every 2s during market hours and feed the result into the
  // header price + ATM band. Matrix stays on its 5-min cache.
  const [liveSpot, setLiveSpot] = useState<number | null>(null)
  useEffect(() => {
    if (!canAccess) return
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
          const r = await fetch(`/api/scanner/spot?symbol=${symbol}`)
          if (r.ok) {
            const j = await r.json()
            if (!cancelled && typeof j.spot === "number") setLiveSpot(j.spot)
          }
        } catch { /* network blip — next tick will retry */ }
      }
      timer = setTimeout(tick, isMarketHours() ? 2000 : 30000)
    }
    tick()
    return () => { cancelled = true; if (timer) clearTimeout(timer) }
  }, [canAccess, symbol])

  const todayStr = new Date().toISOString().slice(0, 10)
  const fmtExp = (exp: string) => {
    const p = exp.split("-")
    if (p.length !== 3) return exp
    const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"]
    return `${months[parseInt(p[1]) - 1]} ${p[2]}`
  }
  const hasOiFallback = data && Object.values(data.matrix).some(row => Object.values(row).some(c => c.has_greeks === false))

  // Effective spot — prefer live tick, fall back to matrix snapshot spot.
  const effSpot = liveSpot ?? data?.spot ?? 0
  // Reverse so highest strikes render first (top of grid) like the reference.
  const strikesDesc = data ? [...data.strikes].sort((a, b) => b - a) : []

  if (canAccess === null) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0B0F1A" }}>
      <div className="text-[#3D4D63] text-sm">Loading...</div>
    </div>
  )

  if (!canAccess) return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0B0F1A" }}>
      <Nav />
      <div className="flex-1 flex items-center justify-center pt-20">
        <div className="border border-[#1E2A3A] rounded-xl px-8 py-8 text-center max-w-sm" style={{ background: "#0F1520" }}>
          <div className="text-[10px] font-bold text-[#F5820A] tracking-[0.15em] uppercase mb-3">Pro Feature</div>
          <div className="text-xl font-bold text-white mb-2">GEX Heatmap</div>
          <div className="text-sm text-[#7A8BA8] mb-6 leading-relaxed">
            Real-time gamma exposure heatmaps with dealer positioning by strike and expiry.
          </div>
          <Link href="/#pricing" className="inline-block bg-[#F5820A] text-black font-bold text-sm px-6 py-2.5 rounded-lg hover:bg-[#e57309] transition-colors">
            Upgrade to Pro
          </Link>
          <div className="text-[10px] text-[#3D4D63] mt-2">Included in Pro Bundle</div>
        </div>
      </div>
    </div>
  )

  // Stat label/value pair used throughout the metrics row. Compact, mono, scannable.
  const Stat = ({ label, value, valueClass = "text-white", sub }: { label: string; value: React.ReactNode; valueClass?: string; sub?: React.ReactNode }) => (
    <div className="flex flex-col gap-0.5 min-w-0">
      <span className="text-[9px] uppercase tracking-[0.14em] text-[#4A5A72] whitespace-nowrap">{label}</span>
      <span className={`text-[13px] font-mono tabular-nums font-semibold leading-tight whitespace-nowrap ${valueClass}`}>{value}</span>
      {sub && <span className="text-[10px] font-mono tabular-nums text-[#5A6A82] whitespace-nowrap">{sub}</span>}
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0B0F1A" }}>
      <Nav />
      <div className="flex-1 flex flex-col pt-16">
        {/* ── Top instrument row ── */}
        <div className="flex items-center px-6 py-3 gap-4 border-b border-[#131B27] flex-shrink-0">
          <div className="px-1.5 py-0.5 rounded bg-[#F5820A]">
            <span className="text-[9px] font-extrabold text-[#0B0F1A] tracking-[0.05em]">{symbol}</span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[14px] font-semibold text-white tracking-tight">{SYMBOL_NAMES[symbol] || symbol}</span>
            <span className="text-[9px] uppercase tracking-[0.18em] text-[#4A5A72]">Gamma Exposure</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#7A8BA8] px-2.5 py-1 rounded bg-[#161B24] border border-[#1E2A3A]">Gamma</span>
            <button
              onClick={() => setPaletteOpen(true)}
              className="flex items-center gap-2 text-[11px] text-[#5A6A82] hover:text-white px-2.5 py-1 rounded border border-[#1E2A3A] bg-[#161B24]/50 hover:bg-[#161B24] transition-colors"
              aria-label="Open search"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>
              </svg>
              <span className="hidden sm:inline">to search</span>
              <kbd className="font-mono text-[9px] px-1 py-0.5 rounded bg-[#0B0F1A] border border-[#1E2A3A]">S</kbd>
            </button>
            {/* Mobile fallback — palette is keyboard-driven so phones get a select. */}
            <select value={symbol} onChange={e => setSymbol(e.target.value)}
              className="sm:hidden bg-[#161B24] border border-[#1E2A3A] text-white text-[11px] rounded px-2 py-1 font-semibold cursor-pointer focus:outline-none focus:border-[#F5820A]/50">
              {GEX_SYMBOLS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* ── Metrics row ── */}
        {data && (
          <div className="flex items-center px-6 py-2.5 gap-x-9 gap-y-1 border-b border-[#131B27] flex-shrink-0 overflow-x-auto flex-wrap">
            {/* Spot column */}
            <div className="flex flex-col gap-0.5 min-w-[120px]">
              <div className="flex items-center gap-2">
                <span className="text-[19px] font-mono tabular-nums font-bold text-white leading-none">${effSpot.toFixed(2)}</span>
                {liveSpot !== null && (
                  <span className="inline-flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-[#22C55E] animate-pulse" />
                    <span className="text-[8px] font-bold tracking-[0.1em] text-[#22C55E]">LIVE</span>
                  </span>
                )}
              </div>
              {(() => {
                // Δ vs prior close when Polygon supplied prev_close. Otherwise
                // fall back to Δ vs the matrix-snapshot spot — still useful as
                // an "intraday drift since last full chain pull" indicator.
                const prev = data.prev_close ?? data.spot
                if (!prev) return null
                const delta = effSpot - prev
                const pct = (delta / prev) * 100
                if (Math.abs(delta) < 0.005) {
                  return <span className="text-[11px] font-mono tabular-nums text-[#5A6A82]">unchanged</span>
                }
                const positive = delta > 0
                const arrow = positive ? "▲" : "▼"
                return (
                  <span className={`text-[11px] font-mono tabular-nums ${positive ? "text-[#22C55E]" : "text-[#EF4444]"}`}>
                    {arrow} {positive ? "+" : ""}{delta.toFixed(2)} · {positive ? "+" : ""}{pct.toFixed(2)}%
                  </span>
                )
              })()}
            </div>

            {/* Middle column — gamma metrics */}
            <div className="flex items-center gap-8 border-l border-[#131B27] pl-8">
              <Stat
                label="Gamma Flip"
                value={data.gamma_flip != null ? `$${data.gamma_flip.toFixed(2)}` : "N/A"}
                valueClass={data.gamma_flip != null ? "text-[#F5820A]" : "text-[#5A6A82]"}
              />
              <Stat
                label="Total Net GEX"
                value={fmtGex(data.total_net_gex)}
                valueClass={data.total_net_gex >= 0 ? "text-[#22C55E]" : "text-[#EF4444]"}
              />
              <Stat
                label="Gamma Slope"
                value={data.gamma_slope != null ? fmtGex(data.gamma_slope) : "N/A"}
                valueClass={data.gamma_slope != null ? "text-white" : "text-[#5A6A82]"}
              />
              <Stat
                label="Slope Strike"
                value={data.slope_strike != null ? `$${data.slope_strike.toFixed(2)}` : "N/A"}
                valueClass={data.slope_strike != null ? "text-white" : "text-[#5A6A82]"}
              />
            </div>

            {/* Right column — wall extremes */}
            <div className="flex items-center gap-8 border-l border-[#131B27] pl-8 ml-auto">
              <Stat
                label="Max +GEX"
                value={data.max_plus_gex ? fmtGex(data.max_plus_gex.gex) : "N/A"}
                valueClass={data.max_plus_gex ? "text-[#22C55E]" : "text-[#5A6A82]"}
                sub={data.max_plus_gex ? `@ $${data.max_plus_gex.strike.toFixed(2)}` : undefined}
              />
              <Stat
                label="Max -GEX"
                value={data.max_minus_gex ? fmtGex(data.max_minus_gex.gex) : "N/A"}
                valueClass={data.max_minus_gex ? "text-[#EF4444]" : "text-[#5A6A82]"}
                sub={data.max_minus_gex ? `@ $${data.max_minus_gex.strike.toFixed(2)}` : undefined}
              />
            </div>
          </div>
        )}

        {/* ── Section header + hot-cell chips ── */}
        {data && data.top_cells.length > 0 && (
          <div className="flex items-center px-6 py-2 gap-3 border-b border-[#131B27] flex-shrink-0 overflow-x-auto">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9AA8C2] whitespace-nowrap">Net GEX Heatmap</span>
            <InfoTooltip content={<span>Net dollar gamma exposure per share-price move. Strike rows show wall structure; expiry columns reveal time decay. Spot row tinted in blue.</span>}><span className="text-[10px] text-[#5A6A82] cursor-help hover:text-white">ⓘ</span></InfoTooltip>
            <div className="w-px h-3 bg-[#1E2A3A]" />
            {data.top_cells.map(c => {
              const positive = c.net_gex > 0
              return (
                <div key={`${c.strike}-${c.expiry}`}
                     className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono tabular-nums whitespace-nowrap border ${positive ? "bg-[#22C55E]/[0.07] border-[#22C55E]/25 text-[#22C55E]" : "bg-[#EF4444]/[0.07] border-[#EF4444]/25 text-[#EF4444]"}`}>
                  <span className="font-semibold">{symbol} {c.strike} {fmtExp(c.expiry)}</span>
                  <span className="opacity-70">·</span>
                  <span className="font-bold">{positive ? "+" : ""}{fmtCell(c.net_gex)}</span>
                </div>
              )
            })}
          </div>
        )}

        {/* OI fallback banner */}
        {hasOiFallback && (
          <div className="flex items-center gap-2 px-6 py-1.5 flex-shrink-0" style={{ background: "rgba(245,158,11,0.06)", borderBottom: "1px solid rgba(245,158,11,0.15)" }}>
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24"><path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/></svg>
            <span className="text-[10px] text-amber-400/80 font-medium">Greeks unavailable after market hours — GEX estimated from open interest. Live gamma data available 9:30-4:00 PM ET.</span>
          </div>
        )}

        {/* ── Grid ── */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64 text-[#3D4D63] text-sm">Loading heatmap...</div>
          ) : error ? (
            <div className="flex items-center justify-center h-64 text-[#EF4444] text-sm">{error}</div>
          ) : data ? (
            <div style={{ display: "grid", gridTemplateColumns: `48px repeat(${data.expirations.length}, minmax(64px, 1fr)) 76px` }}>
              {/* Header row */}
              <div className="sticky top-0 z-10 px-3 py-2 text-[9px] font-bold text-[#3D4D63] tracking-[0.12em] uppercase border-r border-b border-[#131B27]" style={{ background: "#0B0F1A" }}>Strike</div>
              {data.expirations.map(exp => {
                const isToday = exp === todayStr
                return (
                  <div key={exp} className={`sticky top-0 z-10 py-2 text-center border-r border-b border-[#131B27] ${isToday ? "bg-[#F5820A]/[0.08]" : ""}`} style={{ background: isToday ? undefined : "#0B0F1A" }}>
                    <div className={`text-[9px] font-bold tracking-[0.08em] uppercase ${isToday ? "text-[#F5820A]" : "text-[#5A6A82]"}`}>
                      {fmtExp(exp)}
                    </div>
                  </div>
                )
              })}
              <div className="sticky top-0 z-10 px-3 py-2 text-right text-[9px] font-bold text-[#3D4D63] tracking-[0.12em] uppercase border-b border-[#131B27]" style={{ background: "#0B0F1A", borderLeft: "1px solid #1E2A3A" }}>Net Total</div>

              {/* Data rows — strikes high → low to match SpotGamma layout */}
              {strikesDesc.map(strike => {
                const sk = strike === Math.floor(strike) ? String(Math.floor(strike)) : String(strike)
                const row = data.matrix[sk] || {}
                const rowTotal = Object.values(row).reduce((s, c) => s + c.net_gex, 0)
                // Use live spot (when present) for ATM determination so the
                // band drifts as price moves through the grid.
                const isAtm = effSpot > 0 && Math.abs(strike - effSpot) <= (effSpot * 0.0015)
                const isZg = data.gamma_flip != null && Math.abs(strike - data.gamma_flip) <= (effSpot * 0.0015)

                // Spot row treatment — full blue band tint across the entire row
                // (matches SpotGamma reference). Cells inherit a translucent blue
                // backdrop layered under their gamma colour.
                const rowBg = isAtm ? "rgba(96,165,250,0.13)" : isZg ? "rgba(245,130,10,0.07)" : "transparent"
                const strikeCellBg = isAtm ? "rgba(96,165,250,0.24)" : isZg ? "rgba(245,130,10,0.14)" : "#0B0F1A"

                return [
                  <div key={`s-${strike}`}
                       className="px-2 flex items-center justify-end gap-1 border-r border-b border-[#0D1219] sticky left-0 z-[5]"
                       style={{ minHeight: 22, background: strikeCellBg }}>
                    {isZg && <span className="text-[7px] font-bold text-[#F5820A] tracking-tight">ZG</span>}
                    <span className={`text-[11px] font-mono font-semibold tabular-nums ${isAtm ? "text-white" : "text-[#C4CDD9]"}`}>{strike}</span>
                  </div>,
                  ...data.expirations.map(exp => {
                    const cell = row[exp]
                    const gex = cell?.net_gex ?? 0
                    const intensity = data.max_abs_gex > 0 ? Math.min(0.85, 0.06 + 0.79 * Math.abs(gex) / data.max_abs_gex) : 0
                    const gammaBg = gex === 0 ? rowBg : gex > 0 ? `rgba(34,197,94,${intensity})` : `rgba(239,68,68,${intensity})`
                    return (
                      <div key={`${strike}-${exp}`}
                           className="border-r border-b border-[#0D1219] flex items-center justify-center relative"
                           style={{ background: gex === 0 ? rowBg : gammaBg, minHeight: 22 }}
                           title={`${strike} / ${fmtExp(exp)}: ${fmtGex(gex)}`}>
                        {gex !== 0 && (
                          <span className={`text-[10px] font-mono font-semibold tabular-nums ${intensity > 0.4 ? "text-white" : gex > 0 ? "text-[#22C55E]" : "text-[#EF4444]"}`}>
                            {fmtCell(gex)}
                          </span>
                        )}
                      </div>
                    )
                  }),
                  <div key={`t-${strike}`}
                       className="px-3 flex items-center justify-end border-b border-[#0D1219]"
                       style={{ minHeight: 22, borderLeft: "1px solid #1E2A3A", background: rowBg }}>
                    <span className={`text-[11px] font-mono font-bold tabular-nums ${rowTotal >= 0 ? "text-[#22C55E]" : "text-[#EF4444]"}`}>
                      {rowTotal !== 0 ? fmtCell(rowTotal) : "—"}
                    </span>
                  </div>,
                ]
              })}
            </div>
          ) : null}
        </div>

        {/* Replay scrubber — locked progress indicator until ≥3 sessions of
            snapshots are captured. The cron writes one snapshot per symbol
            every 5 min during RTH; ReplayProgress polls /api/scanner/gex-
            snapshots/meta and swaps the indicator for an active Radix slider
            once `ready` flips true. */}
        <ReplayProgress symbol={symbol} />
      </div>

      {/* Command palette — global keyboard-driven symbol switcher. */}
      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        symbol={symbol}
        symbols={GEX_SYMBOLS.map(code => ({ code, name: SYMBOL_NAMES[code] || code }))}
        onSymbolChange={setSymbol}
      />
    </div>
  )
}
