"use client"

import { WobbleCard } from "@/components/ui/WobbleCard"

export default function AccumulationSection() {
  return (
    <section className="bg-[#0E1117] w-full py-24 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Section label */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="h-px w-8 bg-[#a855f7]" />
          <span className="text-[#a855f7] text-xs font-semibold tracking-[0.2em] uppercase">
            Accumulation Detection
          </span>
          <div className="h-px w-8 bg-[#a855f7]" />
        </div>

        <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-4">
          Watch Smart Money Build a Position.
        </h2>
        <p className="text-white/50 text-center max-w-2xl mx-auto mb-16 text-lg">
          The same institution hit META 620 Calls 7 times in 53 minutes.
          Our scanner flagged every print — in real time.
        </p>

        {/* WobbleCard — full width, screenshot + story */}
        <WobbleCard
          containerClassName="w-full bg-[#080C12] border border-white/[0.08] min-h-[400px]"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 h-full">

            {/* LEFT — Story text */}
            <div className="flex flex-col justify-center p-10 lg:p-12">

              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-2 rounded-full bg-[#a855f7] animate-pulse" />
                <span className="text-[#a855f7] text-xs font-semibold uppercase tracking-widest">
                  Live Accumulation
                </span>
              </div>

              <h3 className="text-2xl font-bold text-white mb-4 leading-snug">
                7 prints. 53 minutes.<br />
                <span className="text-[#22c55e]">$8.3M</span> in call flow.
              </h3>

              <p className="text-white/60 text-sm leading-relaxed mb-6">
                From a $1.6M opening sweep to a $1.5M BLOCK 1M+ closer —
                the scanner tracked every escalation. When RAPID badges
                start stacking on the same contract, that&apos;s not noise.
                That&apos;s a position being built.
              </p>

              <div className="flex flex-col gap-3 mb-8">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm border uppercase tracking-wider text-[#eab308] border-[#eab308]/40 bg-[#eab308]/10">
                    LARGE
                  </span>
                  <span className="text-white/50 text-xs">
                    OI exceeded — institutional size confirmed
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm border uppercase tracking-wider text-[#a855f7] border-[#a855f7]/40 bg-[#a855f7]/10">
                    RAPID
                  </span>
                  <span className="text-white/50 text-xs">
                    Multiple prints same contract — urgency escalating
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm border uppercase tracking-wider text-[#60a5fa] border-[#60a5fa]/40 bg-[#60a5fa]/10">
                    BLOCK 1M+
                  </span>
                  <span className="text-white/50 text-xs">
                    Final $1.5M block — position fully established
                  </span>
                </div>
              </div>

              <a href="/free-scanner"
                className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors group w-fit">
                See live accumulation
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </a>
            </div>

            {/* RIGHT — actual META screenshot */}
            <div className="relative overflow-hidden lg:rounded-r-2xl">
              {/* Top fade */}
              <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-[#080C12] to-transparent z-10" />
              {/* Bottom fade */}
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#080C12] to-transparent z-10" />
              {/* Left fade to blend with text */}
              <div className="absolute top-0 left-0 bottom-0 w-8 bg-gradient-to-r from-[#080C12] to-transparent z-10" />

              <img
                src="/images/meta-accumulation.png"
                alt="META accumulation detection — 7 prints in 53 minutes"
                className="w-full h-full object-cover object-left-top opacity-90"
              />
            </div>

          </div>
        </WobbleCard>

      </div>
    </section>
  )
}
