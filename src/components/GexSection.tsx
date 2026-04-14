"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";

const cards = [
  {
    label: "GEX Heatmap",
    title: "Price doesn't move randomly.",
    desc: "Dealers are long or short gamma at every strike. We map every wall, every speed zone, every regime flip — live.",
    accent: "#22c55e",
    col: "lg:col-span-1",
    visual: (
      <div className="relative w-full h-48 overflow-hidden rounded-lg border border-white/[0.06]">
        <Image
          src="/images/gex-heatmap.png"
          alt="GEX Heatmap"
          fill
          className="object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0e1117]" />
        {/* Scanner header overlay */}
        <div className="absolute top-0 left-0 right-0 flex items-center gap-3 px-3 py-1.5 bg-[#0e1117]/80 backdrop-blur-sm border-b border-white/[0.05] text-[9px] font-mono">
          <span className="text-white/60 font-bold">SPY</span>
          <span className="text-white/30">SPOT</span><span className="text-white/70">686.14</span>
          <span className="text-white/30">ZEROγ</span><span className="text-purple-400">676</span>
          <span className="text-white/30">NET</span><span className="text-green-400 font-bold">+$306.5B</span>
          <span className="text-white/30">REGIME</span><span className="text-green-400">POSITIVE-γ</span>
        </div>
      </div>
    ),
  },
  {
    label: "Options Flow",
    title: "Sweeps and blocks, before the move.",
    desc: "Real-time institutional flow filtered for direction. Grade A signals only — no noise, no market maker hedges.",
    accent: "#2563eb",
    col: "lg:col-span-1",
    visual: (
      <div className="w-full h-48 overflow-hidden rounded-lg border border-white/[0.06] bg-[#080c12]">
        <div className="px-3 py-2 border-b border-white/[0.05] flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[9px] font-mono text-white/30 tracking-widest">LIVE FLOW</span>
        </div>
        {[
          { tick: "NVDA", type: "CALLS", strike: "$177.50", prem: "$2.1M", grade: "GRADE A", up: true },
          { tick: "TSLA", type: "CALLS", strike: "$355", prem: "$890K", grade: "GRADE A", up: true },
          { tick: "SPX",  type: "PUTS",  strike: "$5,200", prem: "$1.4M", grade: "FILTERED", up: false },
          { tick: "META", type: "CALLS", strike: "$620", prem: "$3.2M", grade: "GRADE A", up: true },
        ].map((r, i) => (
          <div key={i} className="flex items-center justify-between px-3 py-2 border-b border-white/[0.04] text-[10px] font-mono">
            <span className="text-white/80 font-bold w-12">{r.tick}</span>
            <span className={r.up ? "text-green-400/60" : "text-red-400/60"}>{r.type} {r.strike}</span>
            <span className="text-white/60 font-bold">{r.prem}</span>
            <span className={`text-[9px] tracking-wider ${r.up ? "text-green-400" : "text-red-400/50"}`}>{r.grade}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    label: "Smart Filtering",
    title: "Only directional flow reaches you.",
    desc: "9 filters strip out MM hedges, spreads, and delta-neutral prints before they hit your feed.",
    accent: "#ef4444",
    col: "lg:col-span-1",
    visual: (
      <div className="w-full h-48 flex flex-col justify-center gap-2.5 px-4">
        {[
          { label: "MM HEDGE · SPX PUTS · AT BID", blocked: true },
          { label: "SPREAD · QQQ · DELTA NEUTRAL", blocked: true },
          { label: "NVDA CALLS · ABOVE ASK · $2.1M", blocked: false },
        ].map((r, i) => (
          <div key={i} className={`flex items-center justify-between px-3 py-2.5 rounded-lg border text-[10px] font-mono ${
            r.blocked
              ? "bg-red-500/[0.04] border-red-500/20 opacity-50"
              : "bg-green-500/[0.06] border-green-500/20"
          }`}>
            <span className={r.blocked ? "text-white/30" : "text-white/70"}>{r.label}</span>
            <span className={r.blocked ? "text-red-400 text-[9px]" : "text-green-400 text-[9px]"}>
              {r.blocked ? "BLOCKED" : "DELIVERED"}
            </span>
          </div>
        ))}
      </div>
    ),
  },
  {
    label: "Track Record",
    title: "52.1% win rate. Every signal public.",
    desc: "Every signal logged the moment it fires. Every outcome published. No cherry-picking.",
    accent: "#a855f7",
    col: "lg:col-span-1",
    visual: (
      <div className="w-full h-48 grid grid-cols-2 gap-2 p-4">
        {[
          { n: "52.1%", l: "Strong win rate", c: "text-green-400" },
          { n: "+2.18%", l: "Avg EV per trade", c: "text-blue-400" },
          { n: "174K+", l: "Signals tracked", c: "text-purple-400" },
          { n: "39.7%", l: "Grade A win rate", c: "text-orange-400" },
        ].map((s, i) => (
          <div key={i} className="flex flex-col justify-center px-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg">
            <div className={`text-xl font-bold font-mono ${s.c}`}>{s.n}</div>
            <div className="text-[9px] text-white/30 tracking-wider mt-0.5 uppercase">{s.l}</div>
          </div>
        ))}
      </div>
    ),
  },
];

export default function GexSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="bg-[#0a0d12] py-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="mb-12">
          <div className="text-[11px] font-mono text-white/30 tracking-[0.2em] uppercase mb-4">Platform Features</div>
          <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight max-w-2xl">
            Everything you need to trade institutional flow.
          </h2>
        </div>

        {/* 2x2 grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {cards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
              className="group relative rounded-2xl border border-white/[0.07] bg-[#0e1117] overflow-hidden hover:border-white/[0.14] transition-colors duration-300 cursor-pointer"
            >
              {/* Visual area */}
              <div className="p-4 pb-0">
                {card.visual}
              </div>

              {/* Text area */}
              <div className="p-6 pt-4 flex items-end justify-between">
                <div>
                  <div className="text-[10px] font-mono tracking-[0.15em] uppercase mb-2" style={{ color: card.accent }}>
                    {card.label}
                  </div>
                  <div className="text-[15px] font-semibold text-white leading-snug mb-1.5 max-w-xs">
                    {card.title}
                  </div>
                  <div className="text-[12px] text-white/40 leading-relaxed max-w-xs">
                    {card.desc}
                  </div>
                </div>
                <svg className="w-5 h-5 text-white/20 group-hover:text-white/40 transition-colors flex-shrink-0 ml-4 mb-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
