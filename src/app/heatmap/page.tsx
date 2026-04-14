"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Nav from "@/components/Nav"

import Link from "next/link"
interface GexCell { net_gex: number; call_oi: number; put_oi: number; has_greeks?: boolean }
interface GexData {
  symbol: string; spot: number; spot_fmt: string; expirations: string[]; strikes: number[]
  matrix: Record<string, Record<string, GexCell>>; max_abs_gex: number
  zero_gamma_strike: number | null; top_cells: { strike: number; expiry: string; net_gex: number }[]
}

function fmtGex(v: number) {
  const abs = Math.abs(v), sign = v < 0 ? "-" : ""
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(1)}B`
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(1)}M`
  if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(0)}K`
  return `${sign}$${abs.toFixed(0)}`
}

const GEX_SYMBOLS = ["SPY","QQQ","AAPL","TSLA","NVDA","META","MSFT","AMZN","GOOGL","AMD","MU","COIN","PLTR","NFLX","CRM","BA","JPM","GS","XOM","GLD"]

export default function HeatmapPage() {
  const router = useRouter()
  const [canAccess, setCanAccess] = useState<boolean | null>(null)
  const [symbol, setSymbol] = useState("SPY")
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

  const netGex = data ? data.strikes.reduce((sum, strike) => {
    const sk = strike === Math.floor(strike) ? String(Math.floor(strike)) : String(strike)
    const row = data.matrix[sk] || {}
    return sum + Object.values(row).reduce((rs, c) => rs + c.net_gex, 0)
  }, 0) : 0
  const todayStr = new Date().toISOString().slice(0, 10)
  const fmtExp = (exp: string) => { const p = exp.split("-"); return p.length === 3 ? `${p[1]}/${p[2]}` : exp }
  const hasOiFallback = data && Object.values(data.matrix).some(row => Object.values(row).some(c => c.has_greeks === false))

  if (canAccess === null) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0B0F1A" }}>
      <div className="text-[#3D4D63] text-sm">Loading...</div>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0B0F1A" }}>
      <Nav />

      {!canAccess ? (
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
      ) : (
        <div className="flex-1 flex flex-col pt-20">
          {/* Metrics header */}
          <div className="flex items-center px-6 py-3 gap-8 border-b border-[#131B27] flex-shrink-0">
            <div className="flex items-center gap-4">
              <div>
                <div className="text-[9px] font-bold text-[#3D4D63] tracking-[0.15em] uppercase">GEX Heatmap</div>
                <div className="text-[10px] text-[#4A5A72]">Gamma Exposure by Strike</div>
              </div>
              <select value={symbol} onChange={e => setSymbol(e.target.value)}
                className="bg-[#161B24] border border-[#1E2A3A] text-white text-sm rounded-md px-3 py-1.5 font-semibold cursor-pointer focus:outline-none focus:border-[#F5820A]/50">
                {GEX_SYMBOLS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            {data && (
              <div className="flex items-center gap-6 ml-4">
                <div>
                  <div className="text-[9px] text-[#3D4D63] uppercase tracking-widest mb-0.5">Spot</div>
                  <div className="text-sm font-bold text-white">${data.spot.toFixed(2)}</div>
                </div>
                {data.zero_gamma_strike != null && (
                  <div>
                    <div className="text-[9px] text-[#3D4D63] uppercase tracking-widest mb-0.5">Zero Gamma</div>
                    <div className="text-sm font-bold text-[#F5820A]">${data.zero_gamma_strike.toFixed(2)}</div>
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
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#60A5FA]" /> Spot</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 border-t border-dashed border-[#F5820A]" /> ZG</div>
            </div>
          </div>

          {/* OI fallback banner */}
          {hasOiFallback && (
            <div className="flex items-center gap-2 px-6 py-1.5 flex-shrink-0" style={{ background: "rgba(245,158,11,0.06)", borderBottom: "1px solid rgba(245,158,11,0.15)" }}>
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24"><path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/></svg>
              <span className="text-[10px] text-amber-400/80 font-medium">Greeks unavailable after market hours — GEX estimated from open interest. Live gamma data available 9:30-4:00 PM ET.</span>
            </div>
          )}

          {/* Table */}
          <div className="flex-1 overflow-auto">
            {loading ? (
              <div className="flex items-center justify-center h-64 text-[#3D4D63] text-sm">Loading heatmap...</div>
            ) : error ? (
              <div className="flex items-center justify-center h-64 text-[#EF4444] text-sm">{error}</div>
            ) : data ? (
              <div style={{ display: "grid", gridTemplateColumns: `64px repeat(${data.expirations.length}, 1fr) 80px` }}>
                {/* Headers */}
                <div className="sticky top-0 z-10 px-3 py-2 text-[9px] font-bold text-[#3D4D63] tracking-[0.12em] uppercase border-r border-b border-[#131B27]" style={{ background: "#0B0F1A" }}>Strike</div>
                {data.expirations.map(exp => {
                  const isToday = exp === todayStr
                  return (
                    <div key={exp} className={`sticky top-0 z-10 px-2 py-2 text-center border-r border-b border-[#131B27] ${isToday ? "bg-[#F5820A]/[0.08]" : ""}`} style={{ background: isToday ? undefined : "#0B0F1A" }}>
                      <div className={`text-[9px] font-bold tracking-[0.08em] uppercase ${isToday ? "text-[#F5820A]" : "text-[#4A5A72]"}`}>
                        {isToday ? "TODAY" : fmtExp(exp)}
                      </div>
                    </div>
                  )
                })}
                <div className="sticky top-0 z-10 px-3 py-2 text-right text-[9px] font-bold text-[#3D4D63] tracking-[0.12em] uppercase border-b border-[#131B27]" style={{ background: "#0B0F1A", borderLeft: "1px solid #1E2A3A" }}>Net Total</div>
                {/* Rows */}
                {data.strikes.map(strike => {
                  const sk = strike === Math.floor(strike) ? String(Math.floor(strike)) : String(strike)
                  const row = data.matrix[sk] || {}
                  const rowTotal = Object.values(row).reduce((s, c) => s + c.net_gex, 0)
                  const isAtm = Math.abs(strike - data.spot) <= (data.spot * 0.002)
                  const isZg = data.zero_gamma_strike != null && Math.abs(strike - data.zero_gamma_strike) <= (data.spot * 0.002)
                  return [
                    <div key={`s-${strike}`} className="px-3 flex items-center gap-1.5 border-r border-b border-[#0D1219]" style={{ minHeight: 24, background: isAtm ? "rgba(255,255,255,0.04)" : "#0B0F1A", position: "sticky", left: 0, zIndex: 5, ...(isZg ? { borderTopColor: "rgba(245,130,10,0.5)", borderTopStyle: "dashed" as const } : {}) }}>
                      {isAtm && <div className="w-1.5 h-1.5 rounded-full bg-[#60A5FA] flex-shrink-0" />}
                      {isZg && <span className="text-[8px] font-bold text-[#F5820A]">ZG</span>}
                      <span className={`text-[11px] font-mono font-semibold ${isAtm ? "text-white" : "text-[#C4CDD9]"}`}>{strike}</span>
                    </div>,
                    ...data.expirations.map(exp => {
                      const cell = row[exp]
                      const gex = cell?.net_gex ?? 0
                      const intensity = data.max_abs_gex > 0 ? Math.min(0.85, 0.08 + 0.77 * Math.abs(gex) / data.max_abs_gex) : 0
                      const bg = gex === 0 ? "transparent" : gex > 0 ? `rgba(34,197,94,${intensity})` : `rgba(239,68,68,${intensity})`
                      return (
                        <div key={`${strike}-${exp}`} className="border-r border-b border-[#0D1219] flex items-center justify-center" style={{ background: bg, minHeight: 24, ...(isAtm && gex === 0 ? { background: "rgba(255,255,255,0.04)" } : {}), ...(isZg ? { borderTopColor: "rgba(245,130,10,0.5)", borderTopStyle: "dashed" as const } : {}) }} title={`${strike} / ${exp}: ${fmtGex(gex)}`}>
                          {gex !== 0 && (
                            <span className={`text-[10px] font-mono font-semibold ${intensity > 0.4 ? "text-white" : gex > 0 ? "text-[#22C55E]" : "text-[#EF4444]"}`}>
                              {fmtGex(gex)}
                            </span>
                          )}
                        </div>
                      )
                    }),
                    <div key={`t-${strike}`} className="px-3 flex items-center justify-end border-b border-[#0D1219]" style={{ minHeight: 24, borderLeft: "1px solid #1E2A3A", ...(isAtm ? { background: "rgba(255,255,255,0.04)" } : {}), ...(isZg ? { borderTopColor: "rgba(245,130,10,0.5)", borderTopStyle: "dashed" as const } : {}) }}>
                      <span className={`text-[11px] font-mono font-bold ${rowTotal >= 0 ? "text-[#22C55E]" : "text-[#EF4444]"}`}>
                        {rowTotal !== 0 ? fmtGex(rowTotal) : "\u2014"}
                      </span>
                    </div>,
                  ]
                })}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}
