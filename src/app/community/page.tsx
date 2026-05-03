"use client"

import { useState, useEffect } from "react"
import Nav from "@/components/Nav"
import Footer from "@/components/Footer"
import { NumberTicker } from "@/components/magicui/number-ticker"
import { ShimmerButton } from "@/components/magicui/ShimmerButton"
import { BlurFade } from "@/components/magicui/BlurFade"

import Link from "next/link"
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

      {/* Hero — keyword-aligned H1 */}
      <section className="relative text-center pt-28 md:pt-32 pb-16 px-4 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-[#34D399]/6 blur-[100px] rounded-full pointer-events-none" />
        <div className="text-[10px] font-bold text-[#4A5A72] tracking-[0.2em] uppercase mb-8">Options Flow Trading Community</div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight mb-4 max-w-4xl mx-auto">
          The Options Flow Trading Community.
        </h1>
        <h2 className="text-2xl md:text-3xl font-bold text-[#34D399] leading-tight mb-6">Stop guessing. Trade the tape with other traders.</h2>
        <p className="text-lg text-[#7A8BA8] max-w-2xl mx-auto mb-10">
          A private Discord and Telegram community of active options traders reading the same institutional flow in real time — with Grade A signal alerts, live setup discussion, and documented data methodology at /results holding the scanner to institutional standards.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <ShimmerButton href="/pricing" className="rounded-full text-base">
            Start 7-Day Free Trial
          </ShimmerButton>
          <a href="https://x.com/ProfitBldrs" target="_blank" rel="noopener noreferrer"
            className="bg-transparent border border-[#1E2A3A] text-[#E8EDF5] font-medium px-8 py-3.5 rounded-full hover:bg-[#1E2530] transition-colors">
            Follow @ProfitBldrs Free
          </a>
        </div>
        <div className="text-xs text-[#4A5A72] mt-3">7-day free trial · Card required · Cancel anytime</div>
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
                  <span className="text-[#34D399] font-semibold">{s.premium_fmt}</span>
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
          <div className="text-3xl font-extrabold mb-1 text-[#34D399]">CBOE</div>
          <div className="text-[10px] text-[#4A5A72] uppercase tracking-widest">OPRA Tape Coverage</div>
        </div>
      </div>

      {/* What's inside */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-[10px] font-bold text-[#4A5A72] tracking-[0.15em] uppercase mb-6 text-center">What&apos;s inside</div>
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4 leading-tight tracking-tight">
          Everything you need to trade institutional flow.
        </h2>
        <p className="text-center text-[#7A8BA8] max-w-2xl mx-auto mb-14 leading-relaxed">
          The community isn&apos;t just a chat room — it&apos;s the full scanner, the alert infrastructure, and the shared context that makes flow trading actually actionable.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "Real-Time Flow Scanner", desc: "Every institutional sweep, block, and unusual print across the US options tape — filtered through our data-derived filter pipeline and delivered in seconds." },
            { title: "Discord + Telegram Alerts", desc: "Grade A signals pushed to your phone the moment they hit. Ticker, strike, expiry, premium, Greeks, grade, sector — full context, no scrolling required." },
            { title: "GEX Heatmaps", desc: "See where dealers are positioned across 220 symbols. Gamma walls, zero-gamma strikes, and squeeze zones — updated live as the tape moves." },
          ].map((card, i) => (
            <BlurFade key={card.title} delay={0} duration={0.3}><div className="relative rounded-xl border border-[#1E2A3A] px-6 py-5 overflow-hidden hover:border-[#2E3A4D] transition-colors" style={{ background: "#0F1520" }}>
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#34D399]/40 to-transparent" />
              <div className="text-sm font-bold text-white mb-2">{card.title}</div>
              <div className="text-[12px] text-[#7A8BA8] leading-relaxed">{card.desc}</div>
            </div></BlurFade>
          ))}
        </div>
      </section>

      {/* Who's in the community */}
      <section className="max-w-4xl mx-auto px-6 py-16 border-t border-[#1E2A3A]">
        <div className="text-[10px] font-bold text-[#4A5A72] tracking-[0.15em] uppercase mb-4">The room</div>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight tracking-tight">
          Who&apos;s actually in the community.
        </h2>
        <div className="text-[16px] leading-[1.7] text-[#A9B4C6] space-y-4">
          <p>
            Profit Builders isn&apos;t a 50,000-person Discord where alerts disappear into noise. It&apos;s a smaller, active room of options traders reading the same institutional tape in real time. Most members are day and swing traders working with $25K–$250K accounts — serious enough to care about conviction grading, practical enough to actually act on alerts when they hit.
          </p>
          <p>
            The conversation is tape-driven. When a Grade A print flashes at $847K on TSLA, the room reacts in the same minute — someone flags the strike dynamics, someone pulls up the historical pattern, someone points to the sector context. You learn flow interpretation faster by watching it happen in real time than by reading about it in isolation. That ambient education is the part you don&apos;t get from just reading the scanner on your own.
          </p>
          <p>
            New members are expected to lurk for a day or two, watch the cadence, then start contributing. No hazing, no paid promotions, no one pumping their Discord pick of the day. Alerts come from the scanner; discussion comes from humans reading them. That&apos;s the entire social contract.
          </p>
        </div>
      </section>

      {/* Alert workflow */}
      <section className="max-w-4xl mx-auto px-6 py-16 border-t border-[#1E2A3A]">
        <div className="text-[10px] font-bold text-[#4A5A72] tracking-[0.15em] uppercase mb-4">The alert workflow</div>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight tracking-tight">
          How alerts reach you, and what&apos;s in them.
        </h2>
        <div className="text-[16px] leading-[1.7] text-[#A9B4C6] space-y-4 mb-10">
          <p>
            Every Grade A or Grade B signal flagged by the scanner is dispatched to the community in two channels: Discord (for desk-based traders who want rich cards with full context) and Telegram (for mobile-first traders who want the same data in a notification-friendly format). Delivery latency is 1–3 seconds from the print hitting the tape.
          </p>
          <p>
            A typical alert includes: the ticker and cashtag, option type and strike, expiry date and days-to-expiration, total premium and size, flow type (BLOCK or SWEEP), aggression (at-bid, at-ask, mid), delta and implied volatility context, vol-to-OI ratio, the sector tag, the conviction grade (A or B), and the exit rule that will apply for tracking purposes.
          </p>
          <p>
            The point isn&apos;t to drown you in data — it&apos;s that the data is already filtered. Most platforms send you a flood of raw prints and expect you to do the interpretation in real time. The community sees only signals that passed the data-derived filter pipeline, with the information you need to evaluate them inline.
          </p>
        </div>
      </section>

      {/* Community FAQ */}
      <section className="max-w-4xl mx-auto px-6 py-16 border-t border-[#1E2A3A]">
        <div className="text-[10px] font-bold text-[#4A5A72] tracking-[0.15em] uppercase mb-4">Community FAQ</div>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-10 leading-tight tracking-tight">
          Questions people ask before joining.
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { q: "Do I need options experience to join?", a: "You need to know the basics — what a call is, what a put is, how DTE affects pricing. The community isn't teaching Greeks 101. It's teaching you to read institutional flow in real time, which assumes you've traded before." },
            { q: "Is this a signals service where I just copy trades?", a: "No. Alerts identify institutional positioning; they aren't trade recommendations. You decide if and how to act on them based on your own risk parameters, account size, and strategy. The scanner flags setups; traders decide." },
            { q: "What if I'm quiet and just want to watch?", a: "Totally fine. Most active members lurked for weeks before their first post. The alert stream and the discussion channel are both readable even if you never type a message." },
            { q: "Discord or Telegram — which is better?", a: "Both are supported. Discord has richer formatting and the community discussion. Telegram is mobile-first with lighter notifications. Most active members use both: Telegram for alert push, Discord for the conversation." },
            { q: "What's the pace like during market hours?", a: "Moderate. A typical trading day sees 30–80 Grade A alerts across all tickers, with clustering around market open, sector rotations, and news catalysts. It's enough to keep up with; not enough to become a full-time second job." },
            { q: "Can I cancel if it's not working for me?", a: "Yes. One-click cancel from your dashboard at any point during or after the 7-day trial. No email gauntlet, no retention call, no surprise charges." },
          ].map(({ q, a }) => (
            <div key={q}>
              <div className="font-bold text-white mb-2 text-[15px] leading-snug">{q}</div>
              <p className="text-[13px] text-[#A9B4C6] leading-[1.65]">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="text-center py-16 px-4 border-t border-[#1E2A3A]">
        <div className="text-2xl font-bold text-white mb-2">Ready to see the flow?</div>
        <div className="text-sm text-[#7A8BA8] mb-8">Join a community of traders who stopped guessing and started reading the tape.</div>
        <Link href="/pricing" className="inline-block bg-[#34D399] text-black font-bold px-8 py-3.5 rounded-full hover:bg-[#4ADE80] transition-colors">
          Start Free Trial &rarr;
        </Link>
        <div className="text-[10px] text-[#3D4D63] mt-2">$99/month after trial · Card required · Cancel anytime</div>
      </section>

      <Footer />
    </div>
  )
}
