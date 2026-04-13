"use client"

import { useState, useEffect } from "react"
import Nav from "@/components/Nav"
import { NumberTicker } from "@/components/magicui/number-ticker"
import { ShimmerButton } from "@/components/magicui/ShimmerButton"
import { BlurFade } from "@/components/magicui/BlurFade"

interface Signal { symbol: string; action: string; strike: number; premium_fmt: string; flow_type: string; grade: string; expiration: string }
interface Stats { total_signals: number; signals_this_week: number; grade_a_this_month: number }

function fmtExp(exp: string) { if (!exp) return '—'; const [y, m, d] = exp.split('-'); return y && m && d ? `${parseInt(m)}-${d}-${y}` : exp }

export default function CommunityPage() {
  const [signals, setSignals] = useState<Signal[]>([])
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    document.title = "Options Flow Trading Community | Profit Builders"
    fetch("/api/community-signals").then(r => r.json()).then(d => setSignals(d.signals || [])).catch(() => {})
    fetch("/api/community-stats").then(r => r.json()).then(setStats).catch(() => {})
  }, [])

  return (
    <div className="min-h-screen" style={{ background: "#0B0F1A" }}>
      <Nav />

      {/* Hero */}
      <section className="relative text-center pt-28 md:pt-32 pb-16 px-4 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-[#F5820A]/6 blur-[100px] rounded-full pointer-events-none" />
        <div className="text-[10px] font-bold text-[#4A5A72] tracking-[0.2em] uppercase mb-8">Join the Community</div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight mb-2">Stop Guessing.</h1>
        <h2 className="text-5xl md:text-6xl font-bold text-[#F5820A] leading-tight mb-6">Start Trading Together.</h2>
        <p className="text-lg text-[#7A8BA8] max-w-lg mx-auto mb-10">
          A private room of real traders watching the same flow, calling out setups in real time, and holding each other accountable.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <ShimmerButton href="/#pricing" className="rounded-xl text-base">
            Start 7-Day Free Trial
          </ShimmerButton>
          <a href="https://x.com/ProfitBldrs" target="_blank" rel="noopener noreferrer"
            className="bg-transparent border border-[#1E2A3A] text-[#E8EDF5] font-medium px-8 py-3.5 rounded-xl hover:bg-[#1E2530] transition-colors">
            Follow @ProfitBldrs Free
          </a>
        </div>
        <div className="text-xs text-[#4A5A72] mt-3">7 days free. Cancel anytime.</div>
      </section>

      {/* Live signal ticker */}
      {signals.length > 0 && (
        <div className="border-y border-[#131B27] overflow-hidden py-3" style={{ background: "#0A0E17" }}>
          <div className="flex gap-8 animate-[marquee_30s_linear_infinite] hover:[animation-play-state:paused]" style={{ width: "max-content" }}>
            {[...signals, ...signals].map((s, i) => {
              const optType = s.action.includes("CALL") ? "C" : "P"
              return (
                <span key={i} className="flex items-center gap-2 text-[11px] whitespace-nowrap">
                  <span className="font-bold text-white">{s.symbol}</span>
                  <span className="text-[#7A8BA8]">${s.strike}{optType} {fmtExp(s.expiration)}</span>
                  <span className="text-[#4A5A72]">&middot;</span>
                  <span className="text-[#F5820A] font-semibold">{s.premium_fmt}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${s.flow_type === "SWEEP" ? "bg-[#312560] text-[#A78BFA]" : "bg-[#1A2D4A] text-[#60A5FA]"}`}>{s.flow_type}</span>
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 border-b border-[#1E2A3A]">
        <div className="text-center py-10 border-r border-[#1E2A3A]">
          <div className="text-3xl font-extrabold mb-1 text-white">{stats ? <NumberTicker value={stats.total_signals} className="text-3xl font-extrabold text-white" /> : "—"}+</div>
          <div className="text-[10px] text-[#4A5A72] uppercase tracking-widest">Signals Tracked</div>
        </div>
        <div className="text-center py-10 border-r border-[#1E2A3A]">
          <div className="text-3xl font-extrabold mb-1 text-white">{stats ? <NumberTicker value={stats.signals_this_week} className="text-3xl font-extrabold text-white" /> : "—"}+</div>
          <div className="text-[10px] text-[#4A5A72] uppercase tracking-widest">Signals This Week</div>
        </div>
        <div className="text-center py-10 border-r border-[#1E2A3A]">
          <div className="text-3xl font-extrabold mb-1 text-white">Live</div>
          <div className="text-[10px] text-[#4A5A72] uppercase tracking-widest">During Market Hours</div>
        </div>
        <div className="text-center py-10">
          <div className="text-3xl font-extrabold mb-1 text-[#F5820A]">7 Days</div>
          <div className="text-[10px] text-[#4A5A72] uppercase tracking-widest">Free Trial</div>
        </div>
      </div>

      {/* What you get */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-[10px] font-bold text-[#4A5A72] tracking-[0.15em] uppercase mb-6 text-center">What You Get</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "Real-Time Flow Scanner", desc: "Every institutional sweep, block, and unusual print — graded by conviction, delivered in seconds." },
            { title: "Discord + Telegram Alerts", desc: "Grade A signals pushed to your phone the moment they hit. No delay, no noise." },
            { title: "GEX Heatmaps", desc: "See where dealers are positioned. Gamma walls, zero-gamma strikes, and squeeze zones — updated live." },
          ].map((card, i) => (
            <BlurFade key={card.title} delay={0} duration={0.3}><div className="relative rounded-xl border border-[#1E2A3A] px-6 py-5 overflow-hidden hover:border-[#2E3A4D] transition-colors" style={{ background: "#0F1520" }}>
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#F5820A]/40 to-transparent" />
              <div className="text-sm font-bold text-white mb-2">{card.title}</div>
              <div className="text-[12px] text-[#7A8BA8] leading-relaxed">{card.desc}</div>
            </div></BlurFade>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="text-center py-16 px-4 border-t border-[#1E2A3A]">
        <div className="text-2xl font-bold text-white mb-2">Ready to see the flow?</div>
        <div className="text-sm text-[#7A8BA8] mb-8">Join thousands of traders who stopped guessing.</div>
        <a href="/#pricing" className="inline-block bg-[#F5820A] text-black font-bold px-8 py-3.5 rounded-xl hover:bg-[#e57309] transition-colors">
          Start Free Trial &rarr;
        </a>
        <div className="text-[10px] text-[#3D4D63] mt-2">$99/month after trial &middot; Cancel anytime</div>
      </section>
    </div>
  )
}
