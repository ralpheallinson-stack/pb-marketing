"use client"

import { useState } from "react"

export default function EmailCapture() {
  const [email, setEmail] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    console.log("Email submitted:", email)
  }

  // Compact inline strip — lives ABOVE Pricing as a low-commitment entry.
  return (
    <section className="bg-[#0E1117] w-full py-10 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="relative rounded-2xl border border-white/[0.06] bg-[#161B24] px-6 md:px-10 py-6 md:py-7 overflow-hidden">
          {/* Amber glow — the "warning / attention" accent we formalized */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(251,191,36,0.05),transparent_60%)] pointer-events-none" />

          <div className="relative flex flex-col md:flex-row md:items-center gap-5 md:gap-8">
            <div className="md:flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.7)]" />
                <span className="text-[10px] font-mono text-amber-400/80 tracking-[0.22em] uppercase">
                  Free — No Credit Card
                </span>
              </div>
              <h3 className="text-xl md:text-2xl font-semibold text-white leading-tight mb-1">
                The Morning Edge.
              </h3>
              <p className="text-[13px] text-white/50">
                3 biggest institutional moves from yesterday. In your inbox before the bell.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2 md:w-[400px] flex-shrink-0">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 bg-white/[0.04] border border-white/[0.1] rounded-lg px-4 py-2.5 text-white placeholder-white/30 text-[13px] focus:outline-none focus:border-white/[0.3] transition-colors"
              />
              <button
                type="submit"
                className="bg-white text-[#0a0d12] font-semibold px-5 py-2.5 rounded-lg text-[13px] hover:bg-white/90 transition-colors whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
