"use client"

import { useEffect } from "react"
import Nav from "@/components/Nav"

import Link from "next/link"
export default function AboutPage() {
  useEffect(() => { document.title = "About | Profit Builders" }, [])

  return (
    <div className="min-h-screen" style={{ background: "#0B0F1A" }}>
      <Nav />
      <section className="text-center pt-32 pb-16 px-4 max-w-2xl mx-auto">
        <div className="text-[10px] font-bold text-[#4A5A72] tracking-[0.2em] uppercase mb-8">About</div>
        <h1 className="text-4xl font-extrabold text-white mb-6">Built by traders, for traders.</h1>
        <p className="text-[#7A8BA8] leading-relaxed mb-4">
          Profit Builders is an institutional options flow scanner that tracks real-time sweeps, blocks, and unusual prints — graded by conviction, delivered in seconds.
        </p>
        <p className="text-[#7A8BA8] leading-relaxed mb-4">
          We built this because we were tired of guessing. The options market generates millions of trades per day — most of it noise. Our system filters institutional-grade flow using data-derived PASS rules, regime-aware thresholds, and real-time Greeks enrichment.
        </p>
        <p className="text-[#7A8BA8] leading-relaxed mb-10">
          Every signal is tracked publicly. Every outcome published. No cherry-picking, no hiding losses. Built on the live OPRA tape since launch with full P&amp;L transparency.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/#pricing" className="bg-[#F5820A] text-black font-bold px-8 py-3.5 rounded-xl hover:bg-[#e57309] transition-colors">
            Start Free Trial &rarr;
          </Link>
          <Link href="/methodology" className="bg-transparent border border-[#1E2A3A] text-[#E8EDF5] font-medium px-8 py-3.5 rounded-xl hover:bg-[#1E2530] transition-colors">
            See Methodology
          </Link>
        </div>
      </section>
    </div>
  )
}
