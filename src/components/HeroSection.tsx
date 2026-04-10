'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

function useCountUp(target: number, inView: boolean, duration = 1400) {
  const [count, setCount] = useState(0)
  const started = useRef(false)
  useEffect(() => {
    if (!inView || !target || started.current) return
    started.current = true
    const start = Date.now()
    const tick = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(target * eased))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [inView, target, duration])
  return count
}

export default function HeroSection() {
  const [inView, setInView] = useState(false)
  const statsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold: 0.3 })
    if (statsRef.current) obs.observe(statsRef.current)
    return () => obs.disconnect()
  }, [])

  const wr  = useCountUp(52, inView)
  const ev  = useCountUp(218, inView)
  const sig = useCountUp(174, inView)
  const tr  = useCountUp(71, inView)

  return (
    <section className="relative overflow-hidden pb-0">
      {/* Background radial glow */}
      <div className="pointer-events-none absolute inset-0 flex items-start justify-center overflow-hidden">
        <div
          className="mt-24 h-[600px] w-[900px] rounded-full opacity-20 blur-[120px]"
          style={{ background: 'radial-gradient(ellipse, #f97316 0%, transparent 70%)' }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-12 text-center">

        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 mb-8">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
          </span>
          <span className="font-mono text-[11px] uppercase tracking-widest text-white/50">Live Institutional Flow</span>
        </div>

        {/* Main headline — large, centered, gradient */}
        <h1
          className="font-extrabold leading-[1.05] tracking-tight mb-6"
          style={{ fontSize: 'clamp(52px, 8vw, 96px)' }}
        >
          <span className="text-white">Options Flow,</span>
          <br />
          <span
            style={{
              background: 'linear-gradient(135deg, #f97316 0%, #fb923c 30%, #22d3ee 70%, #60a5fa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Before the Move.
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-white/50 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          Real-time institutional sweeps, blocks, and unusual prints — filtered by data, graded by conviction, delivered in seconds.
        </p>

        {/* CTAs */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <Link
            href="https://buy.stripe.com/7sYdRbcs8bqTfC21j50RG07"
            className="inline-flex items-center gap-2 rounded-full bg-[#F97316] px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 hover:bg-[#F97316]/90 transition-all"
          >
            Start Free 7 Day Trial
          </Link>
          <Link
            href="/free-scanner"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-8 py-3.5 text-sm font-semibold text-white/70 hover:bg-white/[0.08] hover:text-white transition-all"
          >
            Free Scanner →
          </Link>
        </div>
        <p className="text-white/25 text-xs font-mono mb-16">Free 7-day trial · Then $99/mo · Cancel anytime</p>

        {/* Stat strip */}
        <div ref={statsRef} className="flex items-center justify-center gap-12 mb-16 border-t border-b border-white/[0.06] py-6">
          {[
            { value: `${wr}.1%`, label: 'STRONG WIN RATE' },
            { value: `+${(ev/100).toFixed(2)}%`, label: 'AVG EV PER TRADE' },
            { value: `${sig}K+`, label: 'SIGNALS TRACKED' },
            { value: `${tr}`, label: 'CLOSED TRADES' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-2xl font-bold text-white mb-1">{value}</div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-white/30">{label}</div>
            </div>
          ))}
        </div>

        {/* Scanner image — full width below headline */}
        <div className="relative w-full">
          {/* Orange glow behind scanner */}
          <div className="absolute -inset-4 rounded-2xl bg-orange-500/8 blur-2xl pointer-events-none" />
          <div
            className="relative rounded-xl overflow-hidden ring-1 ring-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.6)]"
          >
            <Image
              src="/images/scanner-preview.png"
              alt="Profit Builders Live Options Flow Scanner"
              width={1920}
              height={1440}
              className="w-full"
              priority
            />
            {/* Bottom fade */}
            <div
              className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
              style={{ background: 'linear-gradient(to top, #080c10 0%, transparent 100%)' }}
            />
          </div>
        </div>

      </div>
    </section>
  )
}
