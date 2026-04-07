"use client"

import { useState } from "react"

export default function EmailCapture() {
  const [email, setEmail] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    console.log("Email submitted:", email)
  }

  return (
    <section className="bg-[#0E1117] w-full py-20 px-6">
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="max-w-2xl mx-auto text-center pt-20">
        <span className="inline-flex items-center gap-2 bg-[#60a5fa]/10 border border-[#60a5fa]/20 rounded-full px-4 py-1.5 mb-8 text-[#60a5fa] text-xs font-semibold tracking-widest uppercase">
          Free — No Credit Card
        </span>

        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
          The Morning Edge.
        </h2>

        <p className="text-white/50 text-lg mb-10">
          The 3 biggest institutional moves from yesterday. Delivered every
          morning before the bell. Free forever.
        </p>

        <form onSubmit={handleSubmit} className="flex gap-3 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            className="flex-1 bg-white/[0.06] border border-white/15 rounded-xl px-5 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#60a5fa]/50"
          />
          <button
            type="submit"
            className="bg-[#60a5fa] hover:bg-[#3b82f6] text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors whitespace-nowrap"
          >
            Get The Edge
          </button>
        </form>

        <p className="text-white/25 text-xs mt-4">
          Free forever. No spam. Unsubscribe anytime.
        </p>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mt-20" />
    </section>
  )
}
