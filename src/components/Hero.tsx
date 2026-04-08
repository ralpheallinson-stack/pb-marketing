"use client"

import Image from "next/image"
import { DotPattern } from "@/components/magicui/dot-pattern"
import { ShimmerButton } from "@/components/magicui/ShimmerButton"
import { BorderBeam } from "@/components/magicui/BorderBeam"
import { BlurFade } from "@/components/magicui/BlurFade"

export default function Hero() {
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

      <div className="max-w-5xl mx-auto px-6 pt-24 pb-0 relative z-10">

        {/* Animated brand text */}
        <div className="flex justify-center mb-6">
          <span
            className="pb-brand-title"
            style={{
              fontFamily: "var(--font-teko), 'Impact', sans-serif",
              fontWeight: 700,
              fontSize: 'clamp(3rem, 6vw, 5.5rem)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              background: 'linear-gradient(135deg, #f97316 0%, #fbbf24 50%, #f97316 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'fadeUp 0.8s ease forwards',
            }}
          >
            Profit Builders
          </span>
        </div>

        {/* Gradient headline — CheddarFlow style */}
        <h1
          className="text-center font-bold leading-tight mb-6"
          style={{
            fontSize: 'clamp(40px, 5.5vw, 72px)',
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
          className="text-center mx-auto mb-8 leading-relaxed"
          style={{
            fontSize: '20px',
            maxWidth: '560px',
            color: 'rgba(255,255,255,0.6)',
          }}
        >
          Real-time institutional sweeps, blocks, and unusual prints —
          filtered by data, graded by conviction, delivered in seconds.
        </p>

        {/* Single CTA */}
        <div className="flex flex-col items-center gap-3 mb-6">
          <ShimmerButton href="https://buy.stripe.com/7sYdRbcs8bqTfC21j50RG07" className="rounded-full text-base text-white">
            Start Free 7 Day Trial
          </ShimmerButton>
          <p className="text-white/40 text-xs">Free 7-day trial · Then $99/mo · Cancel anytime</p>
        </div>

        {/* Social proof — stacked avatars + stars */}
        <BlurFade delay={0.3}>
        <div className="flex items-center justify-center gap-3 mb-16">
          {/* Stacked avatars */}
          <div className="flex -space-x-2">
            {['#3b82f6','#8b5cf6','#f97316','#10b981','#ef4444'].map((color, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full border-2 border-[#0E1117] flex items-center justify-center text-xs font-bold text-white"
                style={{ background: color, zIndex: 5 - i }}
              >
                {['J','R','M','S','K'][i]}
              </div>
            ))}
          </div>
          {/* Stars */}
          <div className="flex items-center gap-1.5">
            <div className="flex">
              {[1,2,3,4,5].map(s => (
                <span key={s} style={{ color: '#f59e0b', fontSize: '14px' }}>★</span>
              ))}
            </div>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
              Used by 3,000+ traders
            </span>
          </div>
        </div>
        </BlurFade>

        {/* Scanner mockup — responsive */}
        <BorderBeam className="w-full mt-12 mx-4 md:mx-0">
          {/* Mobile — show cropped left portion of scanner */}
          <div className="block md:hidden overflow-hidden rounded-xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
            <div style={{position: 'relative', paddingBottom: '75%', overflow: 'hidden'}}>
              <Image
                src="/images/scanner-hero.png"
                alt="Profit Builders Scanner"
                fill
                className="object-cover object-left-top"
                style={{objectPosition: 'left top'}}
              />
            </div>
          </div>

          {/* Desktop — show full scanner */}
          <div className="hidden md:block overflow-hidden rounded-xl border border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.6)]">
            <Image
              src="/images/scanner-hero.png"
              alt="Profit Builders Scanner"
              width={1200}
              height={720}
              className="w-full h-auto"
            />
          </div>
        </BorderBeam>

      </div>
    </section>
  )
}
