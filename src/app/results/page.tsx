"use client"

import { useState, useEffect } from "react"
import Nav from "@/components/Nav"
import { BlurFade } from "@/components/magicui/BlurFade"
import { ShimmerButton } from "@/components/magicui/ShimmerButton"
import { NumberTicker } from "@/components/magicui/number-ticker"
import { AnimatedGradientText } from "@/components/magicui/AnimatedGradientText"

interface Summary { total_closed: number; grade_a_avg_return: number; best_winner_pnl: number; avg_grade_a_winner: number; best_winner_symbol: string }
interface GradeRow { grade: string; total: number; wins: number; losses: number; avg_pnl: number; avg_win_pct: number; avg_loss_pct: number; win_rate: number }
interface DteRow { dte_range: string; total: number; wins: number; avg_win_pct: number; avg_loss_pct: number; win_rate: number }
interface MonthRow { month: string; month_display: string; total: number; wins: number; losses: number; avg_win_pct: number; avg_loss_pct: number; win_rate: number }
interface Winner { symbol: string; trade_display: string; strike_display: string; premium_display: string; pnl_display: string; exit_date_display: string; exp_display: string; pnl: number }
interface Signal { symbol: string; trade_display: string; strike_display: string; premium_display: string; pnl_display: string; outcome: string; exit_date_display: string; exit_reason: string; pnl: number }
interface Data { summary: Summary; by_grade: GradeRow[]; by_dte: DteRow[]; monthly: MonthRow[]; top_winners: Winner[]; recent_signals: Signal[] }

const thCls = "px-5 py-3 text-left text-[9px] font-bold text-[#4A5A72] tracking-[0.12em] uppercase"
const tdCls = "px-5 py-3.5 text-sm"
const wrColor = (wr: number) => wr >= 40 ? "text-[#22C55E]" : wr >= 30 ? "text-[#F5820A]" : "text-[#EF4444]"

export default function ResultsPage() {
  const [data, setData] = useState<Data | null>(null)

  useEffect(() => {
    document.title = "Options Flow Signal Track Record | Profit Builders"
    fetch("/api/track-record").then(r => r.json()).then(setData).catch(() => {})
  }, [])

  const s = data?.summary
  const gradeA = data?.by_grade?.find(g => g.grade === "A")

  const datasetSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Dataset",
    "name": "Profit Builders Signal Track Record",
    "description": "Public log of every options flow signal issued by Profit Builders. 174K+ signals with win/loss outcomes tracked.",
    "url": "https://profitbuilders.org/results",
    "creator": { "@type": "Organization", "name": "Profit Builders" }
  })

  return (
    <div className="min-h-screen" style={{ background: "#0B0F1A" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: datasetSchema }} />
      <Nav />

      {/* Hero */}
      <section className="relative text-center pt-24 pb-6 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-48 bg-[#F5820A]/8 blur-[80px] rounded-full pointer-events-none" />
        <div className="relative z-10">
        <div className="text-[11px] font-bold text-[#4A5A72] tracking-[0.2em] uppercase mb-8">Track Record</div>
        <div className="text-[96px] font-extrabold leading-none tracking-tight mb-4">
          {gradeA ? <><AnimatedGradientText className="text-[96px] font-extrabold"><NumberTicker value={gradeA.win_rate} decimalPlaces={1} /></AnimatedGradientText><span className="text-[#F5820A]">%</span></> : <span className="text-white">—%</span>}
        </div>
        <div className="text-lg font-semibold text-[#E8EDF5] mb-2">Grade A Win Rate</div>
        <div className="text-sm text-[#4A5A72]">{s ? `${s.total_closed.toLocaleString()}+ signals tracked and verified` : "Loading..."}</div>

        {/* Current month highlight */}
        {data?.monthly?.[0] && (
          <div className="inline-flex items-center gap-3 mt-8 px-5 py-3 rounded-full" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.15)" }}>
            <span className="text-[#22C55E] font-bold text-lg">{data.monthly[0].win_rate}%</span>
            <span className="text-[#7A8BA8] text-sm">{data.monthly[0].month_display} win rate</span>
          </div>
        )}
        </div>
      </section>

      {!data ? (
        <div className="text-center py-10 text-[#3D4D63]">Loading track record...</div>
      ) : (
        <div className="max-w-5xl mx-auto px-6 pb-16 space-y-10">

          {/* 4 Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Signals Tracked", value: s ? `${s.total_closed.toLocaleString()}+` : "—", color: "#F5820A" },
              { label: "Avg Grade A Winner", value: s ? `+${s.avg_grade_a_winner}%` : "—", color: "#22C55E" },
              { label: "Best Trade", value: s ? `${s.best_winner_symbol} +${s.best_winner_pnl}%` : "—", color: "#22C55E" },
              { label: "Grade A Avg Return", value: s ? `${s.grade_a_avg_return}%` : "—", color: "#7A8BA8" },
            ].map((st, i) => (
              <BlurFade key={st.label} delay={i * 0.1}><div className="relative rounded-xl border border-[#1E2A3A] px-5 py-4 overflow-hidden hover:border-[#2E3A4D] transition-colors" style={{ background: "#0F1520" }}>
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#F5820A]/40 to-transparent" />
                <div className="text-[10px] font-bold text-[#4A5A72] tracking-[0.12em] uppercase mb-2">{st.label}</div>
                <div className="text-2xl font-extrabold" style={{ color: st.color }}>{st.value}</div>
              </div></BlurFade>
            ))}
          </div>

          {/* Methodology */}
          <div className="rounded-xl border border-[#1E2A3A] px-6 py-5" style={{ background: "#0F1520" }}>
            <div className="text-[10px] font-bold text-[#4A5A72] tracking-[0.15em] uppercase mb-3">Methodology</div>
            <div className="text-sm text-[#7A8BA8] leading-relaxed space-y-2">
              <p>All signals are Grade A only — our highest conviction tier. Win rate = wins / (wins + losses), excluding scratches and open positions. Deep ITM (delta &gt; 0.85) and pricing-bug signals excluded.</p>
              <p>Exit rules are DTE-based: 0DTE exits at +20%/-20%, 1-5 DTE at +25%/-25%, 6-30 DTE at +40%/-30%, 30+ DTE at +30%/-30%. No cherry-picking — every signal is tracked automatically.</p>
            </div>
          </div>

          {/* Performance by Grade */}
          {data.by_grade.length > 0 && (
            <div>
              <div className="text-[9px] font-bold text-[#4A5A72] tracking-[0.15em] uppercase mb-4">Performance by Grade</div>
              <div className="rounded-xl border border-[#1E2A3A] overflow-hidden overflow-x-auto" style={{ background: "#0F1520" }}>
                <table className="w-full min-w-[600px]">
                  <thead className="border-b border-[#1E2A3A]">
                    <tr>
                      <th className={thCls}>Grade</th>
                      <th className={`${thCls} text-right`}>Trades</th>
                      <th className={`${thCls} text-right`}>Wins</th>
                      <th className={`${thCls} text-right`}>Win Rate</th>
                      <th className={`${thCls} text-right`}>Avg Winner</th>
                      <th className={`${thCls} text-right`}>Avg Loser</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.by_grade.map(g => (
                      <tr key={g.grade} className="border-b border-[#131B27] hover:bg-white/[0.02] transition-colors">
                        <td className={tdCls}><span className="bg-[#F5820A]/15 text-[#F5820A] border border-[#F5820A]/30 rounded px-2 py-0.5 text-xs font-bold">Grade {g.grade}</span></td>
                        <td className={`${tdCls} text-right text-[#E8EDF5] font-mono`}>{g.total.toLocaleString()}</td>
                        <td className={`${tdCls} text-right text-[#22C55E] font-mono`}>{g.wins.toLocaleString()}</td>
                        <td className={`${tdCls} text-right font-bold ${wrColor(g.win_rate)}`}>{g.win_rate}%</td>
                        <td className={`${tdCls} text-right text-[#22C55E] font-semibold`}>+{g.avg_win_pct}%</td>
                        <td className={`${tdCls} text-right text-[#EF4444] font-semibold`}>{g.avg_loss_pct}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Performance by DTE */}
          <div>
            <div className="text-[9px] font-bold text-[#4A5A72] tracking-[0.15em] uppercase mb-4">Performance by DTE</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {data.by_dte.map(d => (
                <div key={d.dte_range} className="rounded-xl border border-[#1E2A3A] px-5 py-4" style={{ background: "#0F1520" }}>
                  <div className="text-[10px] font-bold text-[#4A5A72] tracking-wide uppercase mb-3">{d.dte_range}</div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className={`text-2xl font-extrabold ${wrColor(d.win_rate)}`}>{d.win_rate}%</span>
                    <span className="text-[10px] text-[#4A5A72]">win rate</span>
                  </div>
                  <div className="flex gap-4 text-[10px]">
                    <span className="text-[#22C55E]">+{d.avg_win_pct}% avg win</span>
                    <span className="text-[#EF4444]">{d.avg_loss_pct}% avg loss</span>
                  </div>
                  <div className="text-[10px] text-[#3D4D63] mt-1">{d.total.toLocaleString()} signals</div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Results */}
          <div>
            <div className="text-[9px] font-bold text-[#4A5A72] tracking-[0.15em] uppercase mb-4">Monthly Results</div>
            <div className="rounded-xl border border-[#1E2A3A] overflow-hidden overflow-x-auto" style={{ background: "#0F1520" }}>
              <table className="w-full min-w-[600px]">
                <thead className="border-b border-[#1E2A3A]">
                  <tr>
                    <th className={thCls}>Month</th>
                    <th className={`${thCls} text-right`}>Signals</th>
                    <th className={`${thCls} text-right`}>Wins</th>
                    <th className={`${thCls} text-right`}>Win Rate</th>
                    <th className={`${thCls} text-right`}>Avg Winner</th>
                    <th className={`${thCls} text-right`}>Avg Loser</th>
                  </tr>
                </thead>
                <tbody>
                  {data.monthly.map((m, mi) => (
                    <tr key={m.month} className={`border-b border-[#0D1219] hover:bg-[#161B24] transition-colors ${mi % 2 === 0 ? "bg-[#0F1520]" : "bg-[#0B0F1A]"}`}>
                      <td className={`${tdCls} text-[#E8EDF5] font-semibold`}>{m.month_display}</td>
                      <td className={`${tdCls} text-right text-[#7A8BA8] font-mono`}>{m.total.toLocaleString()}</td>
                      <td className={`${tdCls} text-right text-[#22C55E] font-mono`}>{m.wins.toLocaleString()}</td>
                      <td className={`${tdCls} text-right font-bold ${wrColor(m.win_rate)}`}>{m.win_rate}%</td>
                      <td className={`${tdCls} text-right text-[#22C55E] font-semibold`}>+{m.avg_win_pct}%</td>
                      <td className={`${tdCls} text-right text-[#EF4444] font-semibold`}>{m.avg_loss_pct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Performers + Recent Signals */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Performers */}
            <div>
              <div className="text-[9px] font-bold text-[#4A5A72] tracking-[0.15em] uppercase mb-4">Top Performers</div>
              <div className="rounded-xl border border-[#1E2A3A] overflow-hidden" style={{ background: "#0F1520" }}>
                {data.top_winners.slice(0, 10).map((w, i) => (
                  <div key={i} className={`flex items-center justify-between px-5 py-3 border-b border-[#0D1219] hover:bg-[#161B24] transition-colors ${i === 0 ? "bg-[#F5820A]/5" : ""}`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{w.symbol}</span>
                        <span className="text-[10px] text-[#4A5A72]">{w.trade_display} {w.strike_display}</span>
                      </div>
                      <div className="text-[10px] text-[#3D4D63]">{w.premium_display} · Exp {w.exp_display}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-bold font-mono ${i === 0 ? "text-[#F5820A]" : "text-[#22C55E]"}`}>{w.pnl_display}</div>
                      <div className="text-[10px] text-[#3D4D63]">{w.exit_date_display}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Signals */}
            <div>
              <div className="text-[9px] font-bold text-[#4A5A72] tracking-[0.15em] uppercase mb-4">Recent Signals</div>
              <div className="rounded-xl border border-[#1E2A3A] overflow-hidden" style={{ background: "#0F1520" }}>
                {data.recent_signals.slice(0, 10).map((sig, i) => {
                  const isWin = sig.outcome === "WIN" || sig.outcome === "BIG_WIN" || sig.outcome === "SMALL_WIN"
                  const isScratch = sig.outcome === "SCRATCH"
                  return (
                    <div key={i} className="flex items-center justify-between px-5 py-3 border-b border-[#131B27] hover:bg-white/[0.02] transition-colors">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{sig.symbol}</span>
                          <span className="text-[10px] text-[#4A5A72]">{sig.trade_display} {sig.strike_display}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${isWin ? "bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/20" : isScratch ? "bg-[#1E2530] text-[#7A8BA8] border-[#252E3D]" : "bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/20"}`}>{sig.outcome}</span>
                        </div>
                        <div className="text-[10px] text-[#3D4D63]">{sig.premium_display} · {sig.exit_reason}</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-bold ${isWin ? "text-[#22C55E]" : isScratch ? "text-[#7A8BA8]" : "text-[#EF4444]"}`}>{sig.pnl_display}</div>
                        <div className="text-[10px] text-[#3D4D63]">{sig.exit_date_display}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* CTA */}
          <section className="text-center py-12">
            <div className="text-2xl font-bold text-white mb-2">Start Your Free Trial</div>
            <div className="text-sm text-[#7A8BA8] mb-8">7 days, full access. Cancel anytime.</div>
            <ShimmerButton href="/#pricing">Start Free Trial &rarr;</ShimmerButton>
          </section>

          {/* Disclaimer */}
          <div className="text-[10px] text-[#3D4D63] text-center max-w-2xl mx-auto pb-12 px-4 leading-relaxed">
            Past performance does not guarantee future results. Options trading involves significant risk including potential loss of entire investment. All data reflects actual signals generated by our system since January 2026 with real market outcomes tracked automatically. No signals have been removed, modified, or retroactively adjusted. Win rates and returns will fluctuate. This is not financial advice.
          </div>
        </div>
      )}
    </div>
  )
}
