"use client"

import Image from "next/image"
import { BorderBeam } from "@/components/magicui/border-beam"

export default function GexDashboardFrame() {
  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Glow behind frame */}
      <div
        className="absolute inset-0 -z-10 rounded-2xl"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(34,197,94,0.12) 0%, rgba(37,99,235,0.06) 40%, transparent 70%)",
          filter: "blur(20px)",
          transform: "scale(1.1)",
        }}
      />

      {/* Dashboard frame */}
      <div className="relative rounded-xl overflow-hidden border border-white/10 bg-[#0a0d12]">
        <BorderBeam size={300} duration={12} colorFrom="#22c55e" colorTo="#2563eb" />

        {/* Browser chrome */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-[#0e1117]">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-green-500/60" />
          </div>
          <div className="flex-1 mx-4">
            <div className="bg-white/[0.05] border border-white/[0.06] rounded-md px-3 py-1 text-center">
              <span className="text-[11px] font-mono text-white/30">profitbuilders.io/scanner · GEX</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[10px] font-mono text-green-400/70">LIVE</span>
          </div>
        </div>

        {/* GEX screenshot */}
        <Image
          src="/images/gex-heatmap.png"
          alt="GEX Heatmap — Gamma Exposure by Strike"
          width={1200}
          height={700}
          className="w-full h-auto"
          priority
        />

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0a0d12] to-transparent pointer-events-none" />
      </div>
    </div>
  )
}
