"use client"

import { DotPattern } from "@/components/magicui/dot-pattern"
import { ShimmerButton } from "@/components/magicui/ShimmerButton"
import LiveFlowPreview from "@/components/LiveFlowPreview"

export default function HeroSection() {
  return (
    <section className="overflow-hidden relative" style={{ background: '#0E1117' }}>

      {/* Dot grid background — blurred with radial fade */}
      <div className="absolute inset-0 w-full h-full" style={{
        filter: 'blur(1.5px)',
        maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)',
      }}>
        <DotPattern
          className="absolute inset-0 w-full h-full"
          style={{ color: 'rgba(59,130,246,0.35)' }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-8 pt-16 pb-8 relative z-10">

        {/* Two-column layout: text left, scanner right */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

          {/* Left column — text content */}
          <div>
            {/* Gradient headline */}
            <h1
              className="font-extrabold leading-tight mb-6"
              style={{
                fontFamily: 'var(--font-bricolage), sans-serif',
                fontSize: 'clamp(32px, 4vw, 56px)',
                letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, #ffffff 0%, #94a3b8 40%, #60a5fa 80%, #ffffff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Options Flow,<br />Before the Move.
            </h1>

            {/* Subheadline */}
            <p
              className="mb-8 leading-relaxed"
              style={{
                fontSize: '18px',
                maxWidth: '480px',
                color: 'rgba(255,255,255,0.6)',
              }}
            >
              Real-time institutional sweeps, blocks, and unusual prints —
              filtered by data, graded by conviction, delivered in seconds.
            </p>

            {/* Single CTA */}
            <div className="flex flex-col items-start gap-3 mb-6">
              <ShimmerButton href="https://buy.stripe.com/7sYdRbcs8bqTfC21j50RG07" className="rounded-full text-base text-white">
                Start Free 7 Day Trial
              </ShimmerButton>
              <p className="text-white/40 text-xs">Free 7-day trial · Then $99/mo · Cancel anytime</p>
            </div>

            {/* Stat strip */}
            <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/[0.07] pt-6">
              {[
                { value: "52.1%", label: "STRONG win rate" },
                { value: "+2.18%", label: "Avg EV per trade" },
                { value: "174K+", label: "Signals tracked" },
                { value: "71", label: "Closed trades" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="font-sans text-[18px] font-bold text-white tracking-tight">
                    {s.value}
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-white/30 mt-0.5">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column — live flow preview */}
          <div>
            <LiveFlowPreview />
          </div>

        </div>
      </div>
    </section>
  )
}
