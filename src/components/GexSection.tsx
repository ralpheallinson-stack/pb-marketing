"use client"

import Image from "next/image"

export default function GexSection() {
  return (
    <section className="bg-[#0E1117] w-full py-24 px-6" style={{contain: 'layout'}}>
      <div className="h-px bg-gradient-to-r from-transparent via-[#22c55e]/30 to-transparent" />

      <div className="max-w-6xl mx-auto pt-24">
        {/* Top — centered copy */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="h-px w-8 bg-[#22c55e]" />
          <span className="text-[#22c55e] text-xs font-semibold tracking-[0.2em] uppercase">
            GEX Heatmap
          </span>
          <div className="h-px w-8 bg-[#22c55e]" />
        </div>

        <h2 className="text-center text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
          Price Doesn&apos;t Move Randomly.
        </h2>

        <p className="text-center text-white/55 text-xl leading-relaxed mb-10 max-w-2xl mx-auto">
          Dealers are long or short gamma at every strike. We map every wall,
          every speed zone, and every regime flip — live.
        </p>

        <div className="flex items-center justify-center gap-4 mb-16 flex-wrap">
          <div className="shimmer-pill">
            <span className="w-2 h-2 rounded-full bg-[#22c55e] flex-shrink-0" style={{boxShadow: '0 0 6px rgba(34,197,94,0.9)'}} />
            Green — Gamma Wall
          </div>
          <div className="shimmer-pill">
            <span className="w-2 h-2 rounded-full bg-[#ef4444] flex-shrink-0" style={{boxShadow: '0 0 6px rgba(239,68,68,0.9)'}} />
            Red — Speed Zone
          </div>
          <div className="shimmer-pill">
            <span className="w-2 h-2 rounded-full bg-[#f97316] flex-shrink-0" style={{boxShadow: '0 0 6px rgba(249,115,22,0.9)'}} />
            Orange — Regime Flip
          </div>
        </div>

        {/* Bottom — full width heatmap image */}
        <div className="relative rounded-2xl border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)]">
          <div className="rounded-2xl overflow-hidden">
            <Image
              src="/images/heatmap-preview.png"
              alt="GEX Heatmap"
              width={1200}
              height={600}
              className="w-full h-auto"
            />
          </div>
          <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#0E1117] to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0E1117] to-transparent pointer-events-none" />
        </div>

        {/* CTA */}
        <div className="mt-12 flex justify-center">
          <a href="/signup" className="shimmer-btn">Start Free Trial →</a>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mt-24" />
    </section>
  )
}
