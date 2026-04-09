"use client"

import { useState, useEffect } from "react"
import Nav from "@/components/Nav"
import { BorderBeam } from "@/components/magicui/BorderBeam"
import { ShimmerButton } from "@/components/magicui/ShimmerButton"
import { badgeClass } from "@/lib/badge-styles"

interface Trade {
  id: number
  symbol: string
  strike: number
  opt_type: string
  expiration: string
  premium: number
  premium_fmt: string
  contracts: number
  bullish: boolean
  spot_fmt: string
  grade: string
  day_volume: number
  open_interest: number
  iv: number | null
  flow_type: string
  sector: string
  accum_hits: number
  position_action: string
  mm_suspected: boolean
  time?: string
  date_time?: string
  strike_fmt?: string
  dte?: number
  vol_oi?: number
  aggression?: string | null
  trade_direction?: string | null
  structure?: string | null
  structure_confidence?: number | null
  whale?: boolean
  is_event_driven?: boolean
  adv_multiple?: number | null
  badges?: { label: string; tier: string }[]
}

interface Stats { count: number; bull: number; bear: number; lean: string; pc_ratio: number }

function fmtPrem(v: number) {
  if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`
  if (v >= 1e3) return `$${(v / 1e3).toFixed(0)}K`
  return `$${v}`
}

function fmtExpiry(exp: string) {
  if (!exp) return '—'
  const [year, month, day] = exp.split('-')
  return year && month && day ? `${parseInt(month)}-${day}-${year}` : exp
}


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

export default function FreeScannerPage() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [stats, setStats] = useState<Stats>({ count: 0, bull: 0, bear: 0, lean: "MIXED", pc_ratio: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = () => fetch("/api/free-scanner/live-flow?slim=true")
      .then(r => r.json())
      .then(d => { setTrades(d.trades || []); setStats(d.stats || stats); setLoading(false) })
      .catch(() => setLoading(false))
    load()
    const iv = setInterval(load, 30000)
    return () => clearInterval(iv)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const display = trades.slice(0, 8)
  const calls = trades.filter(t => t.opt_type === "C")
  const puts = trades.filter(t => t.opt_type === "P")
  const callPrem = calls.reduce((s, t) => s + t.premium, 0)
  const putPrem = puts.reduce((s, t) => s + t.premium, 0)
  const totalCount = calls.length + puts.length
  const callPct = totalCount > 0 ? Math.round((calls.length / totalCount) * 100) : 50
  const putPct = 100 - callPct
  const totalPrem = stats.bull + stats.bear
  const bullPct = totalPrem > 0 ? (stats.bull / totalPrem) * 100 : 50
  const isBull = stats.lean === "BULL"
  const circ = 2 * Math.PI * 20


  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0B0F1A" }}>
      <Nav />

      {/* Conversion banner */}
      <div className="w-full flex items-center justify-center gap-4 py-2.5 mt-20" style={{ background: "rgba(245,130,10,0.08)", borderBottom: "1px solid rgba(245,130,10,0.15)" }}>
        <span className="flex items-center gap-2"><span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" /></span><span className="text-[11px] font-semibold text-[#F5820A] tracking-wide uppercase">Free — 15-Min Delayed</span></span>
        <span className="text-[11px] text-[#3D4D63]">|</span>
        <span className="text-[11px] text-[#7A8BA8]">Want real-time flow + alerts?</span>
        <a href="/#pricing" className="text-[11px] font-bold text-black bg-[#F5820A] px-3 py-1 rounded-md hover:bg-[#e57309] transition-colors">Start Free Trial</a>
      </div>

      {/* Stats bar */}
      <div className="overflow-x-auto border-b border-[#131B27]"><div className="grid min-w-[700px]" style={{ gridTemplateColumns: "1fr 1px 1fr 1px 1fr 1px 1fr", background: "#0B0F1A" }}>
        <div className="px-4 py-4 flex flex-col justify-center">
          <div className="text-[9px] font-medium text-[#4A5A72] tracking-[0.1em] uppercase mb-1.5">Sentiment</div>
          <div className="flex items-center gap-3">
            <span className={`text-2xl font-bold ${isBull ? "text-[#22C55E]" : stats.lean === "BEAR" ? "text-[#EF4444]" : "text-white/50"}`}>
              {isBull ? "Bullish" : stats.lean === "BEAR" ? "Bearish" : "Mixed"}
            </span>
            <div className="flex-1 h-1 bg-[#1A2535] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${isBull ? bullPct : 100 - bullPct}%`, background: isBull ? "#22C55E" : "#EF4444" }} />
            </div>
          </div>
        </div>
        <div className="bg-[#131B27]" />
        <div className="px-4 py-4 flex items-center gap-3">
          <div>
            <div className="text-[9px] font-medium text-[#4A5A72] tracking-[0.1em] uppercase mb-1.5">P/C Ratio</div>
            <div className="text-2xl font-bold text-white leading-none">{stats.pc_ratio.toFixed(2)}</div>
          </div>
          <svg width="48" height="48" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="20" fill="none" stroke="#1A2535" strokeWidth="3" />
            <circle cx="24" cy="24" r="20" fill="none" stroke="#60a5fa" strokeWidth="3" strokeLinecap="round"
              strokeDasharray={`${(Math.min(stats.pc_ratio / 2, 1) * circ)} ${circ}`} strokeDashoffset={circ / 4} />
          </svg>
        </div>
        <div className="bg-[#131B27]" />
        <div className="px-4 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-medium text-[#4A5A72] tracking-[0.1em] uppercase">Calls</span>
              <span className="text-[11px] font-bold text-[#22C55E]">{fmtPrem(callPrem)}</span>
            </div>
            <div className="text-2xl font-bold text-white leading-none mt-1">{calls.length.toLocaleString()}</div>
          </div>
          <svg width="48" height="48" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="20" fill="none" stroke="#1A2535" strokeWidth="3" />
            <circle cx="24" cy="24" r="20" fill="none" stroke="#22C55E" strokeWidth="3" strokeLinecap="round"
              strokeDasharray={`${(callPct / 100) * circ} ${circ}`} strokeDashoffset={circ / 4} />
            <text x="24" y="24" textAnchor="middle" dominantBaseline="central" fill="white" fontSize="10" fontWeight="600">{callPct}%</text>
          </svg>
        </div>
        <div className="bg-[#131B27]" />
        <div className="px-4 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-medium text-[#4A5A72] tracking-[0.1em] uppercase">Puts</span>
              <span className="text-[11px] font-bold text-[#EF4444]">{fmtPrem(putPrem)}</span>
            </div>
            <div className="text-2xl font-bold text-white leading-none mt-1">{puts.length.toLocaleString()}</div>
          </div>
          <svg width="48" height="48" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="20" fill="none" stroke="#1A2535" strokeWidth="3" />
            <circle cx="24" cy="24" r="20" fill="none" stroke="#EF4444" strokeWidth="3" strokeLinecap="round"
              strokeDasharray={`${(putPct / 100) * circ} ${circ}`} strokeDashoffset={circ / 4} />
            <text x="24" y="24" textAnchor="middle" dominantBaseline="central" fill="white" fontSize="10" fontWeight="600">{putPct}%</text>
          </svg>
        </div>
      </div></div>

      {/* Table */}
      <div className="flex-1 relative" style={{ fontVariantNumeric: "tabular-nums" }}>
        {loading ? (
          <div className="flex items-center justify-center py-20 text-[#3D4D63] text-sm">Loading flow data...</div>
        ) : (
          <table className="w-full text-sm" style={{ tableLayout: "fixed" }}>
            <colgroup>
              {COLS.map(c => <col key={c.key} style={{ width: c.width }} />)}
            </colgroup>
            <thead style={{ background: "#0B0F1A" }}>
              <tr className="text-[11px] text-[#3D4D63] uppercase tracking-wider">
                {COLS.map(c => <th key={c.key} className={`${c.cls} py-2 font-medium`}>{c.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {display.length === 0 && (
                <tr>
                  <td colSpan={15} className="px-6 py-16 text-center">
                    <div className="text-white/30 text-sm font-mono mb-2">Market opens at 9:30 AM ET</div>
                    <div className="text-white/15 text-xs font-mono mb-4">No signals yet today — check back at market open</div>
                    <a href="/?trial=true" className="inline-flex items-center gap-2 bg-[#F97316] text-white text-sm font-bold px-6 py-3 rounded-full hover:bg-[#F97316]/90 transition-colors">
                      Get real-time flow + alerts →
                    </a>
                  </td>
                </tr>
              )}
              {display.map((t, i) => {
                const blurred = i >= 5
                return (
                  <tr key={t.id} className={`border-b border-[#0D1219] ${blurred ? "opacity-20 blur-[2px] select-none pointer-events-none" : "hover:bg-white/[0.02]"}`}>
                    <td className="px-3 py-2 text-white/50 text-xs whitespace-nowrap">{t.time ?? t.date_time?.slice(11, 16) ?? "—"}</td>
                    <td className="px-2 py-2">
                      <div className="font-bold text-sm text-white">{t.symbol}</div>
                      {t.sector && <div className="text-white/30 text-[10px]">{t.sector}</div>}
                    </td>
                    <td className="px-2 py-2 text-white/60 text-xs font-mono">{fmtExpiry(t.expiration)}</td>
                    <td className="px-2 py-2 text-right text-white/80 text-xs font-mono">{t.strike_fmt ?? t.strike}</td>
                    <td className={`px-2 py-2 text-center text-xs font-medium ${t.opt_type === "C" ? "text-[#22c55e]" : "text-[#ef4444]"}`}>{t.opt_type === "C" ? "Call" : "Put"}</td>
                    <td className="px-2 py-2 text-center text-xs text-white/50">{t.aggression === "ABOVE_ASK" || t.aggression === "AT_ASK" ? "Ask" : t.aggression === "BELOW_BID" || t.aggression === "AT_BID" ? "Bid" : "—"}</td>
                    <td className={`px-2 py-2 text-center text-xs font-medium ${t.trade_direction === "BUY" ? "text-[#22c55e]" : t.trade_direction === "SELL" ? "text-[#ef4444]" : "text-white/40"}`}>{t.trade_direction || "—"}</td>
                    <td className="px-2 py-2 text-right text-white/60 text-xs font-mono">{t.spot_fmt}</td>
                    <td className="px-2 py-2 text-right text-white/60 text-xs">{(t.contracts ?? 0).toLocaleString()}</td>
                    <td className="px-2 py-2 text-center">
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${t.flow_type === "SWEEP" ? "bg-[#312560] text-[#A78BFA] border-[#A78BFA]/30" : t.flow_type === "BLOCK" ? "bg-[#1A2D4A] text-[#60A5FA] border-[#60A5FA]/30" : "bg-[#1E2530] text-[#7A8BA8] border-[#2E3A4D]"}`}>{t.flow_type || "—"}</span>
                    </td>
                    <td className={`px-2 py-2 text-right text-xs ${t.premium >= 1000000 ? "text-orange-400 font-bold" : t.premium >= 500000 ? "text-yellow-400 font-bold" : t.premium >= 100000 ? "text-white font-semibold" : "text-white/60"}`}>{t.premium_fmt}</td>
                    <td className="px-2 py-2 text-right text-white/50 text-xs font-mono">{(t.day_volume ?? 0) > 0 ? t.day_volume.toLocaleString() : "—"}</td>
                    <td className="px-2 py-2 text-right text-white/50 text-xs font-mono">{(t.open_interest ?? 0) > 0 ? t.open_interest.toLocaleString() : "—"}</td>
                    <td className="px-2 py-2 text-right text-white/50 text-xs">{t.iv ? `${t.iv}%` : "—"}</td>
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-1">
                        {t.badges?.slice(0, 2).map((b, i) => (
                          <span key={i} className={badgeClass(b.tier)}>{b.label}</span>
                        ))}
                        {!blurred && (t.badges?.length ?? 0) > 2 && (
                          <a href="/#pricing" className="text-[9px] text-[#F5820A] hover:underline">+more</a>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}

        {/* Paywall overlay over rows 6-8 */}
        {!loading && display.length > 5 && (
          <div className="absolute inset-x-0 flex items-center justify-center" style={{ top: "calc(40px + 5 * 41px)", bottom: 0 }}>
            <BorderBeam beamColor="#F5820A">
              <div className="px-8 py-6 text-center" style={{ background: "rgba(15,21,32,0.95)" }}>
                <div className="text-[10px] font-bold text-[#F5820A] tracking-[0.15em] uppercase mb-2">See the full picture</div>
                <div className="text-sm text-[#7A8BA8] mb-4 max-w-xs leading-relaxed">
                  {"You're seeing delayed data with limited rows. Subscribers get real-time flow, full history, and advanced filters."}
                </div>
                <ShimmerButton href="/#pricing" className="rounded-lg text-sm px-6 py-2.5">
                  Start 7-Day Free Trial
                </ShimmerButton>
                <div className="text-[10px] text-[#3D4D63] mt-2">$99/month after trial · Cancel anytime</div>
              </div>
            </BorderBeam>
          </div>
        )}
      </div>

      {/* Footer bar */}
      <div className="border-t border-[#131B27] px-5 py-2 flex items-center justify-between flex-shrink-0" style={{ background: "#0B0F1A" }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="text-[10px] text-[#4A5A72]">15-minute delayed data · {stats.count.toLocaleString()} signals today</span>
        </div>
        <a href="/#pricing" className="text-[10px] font-semibold text-[#F5820A] hover:text-[#e57309] transition-colors">Get Real-Time Access →</a>
      </div>
    </div>
  )
}
