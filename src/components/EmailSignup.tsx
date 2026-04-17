"use client"

import { useState } from "react"

export function EmailSignup({
  source = "blog",
  variant = "inline",
}: {
  source?: string
  variant?: "inline" | "banner" | "hero"
}) {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [msg, setMsg] = useState("")

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus("loading")
    try {
      const res = await fetch("/api/subscribe-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source }),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus("success")
        setMsg("You're in. First brief arrives tomorrow at 8:45 AM ET.")
        setEmail("")
      } else {
        setStatus("error")
        setMsg(data.error || "Something went wrong.")
      }
    } catch {
      setStatus("error")
      setMsg("Network error. Try again.")
    }
  }

  if (status === "success") {
    return (
      <div className={variant === "hero" ? "text-center" : ""}>
        <div className="flex items-center gap-2 text-[#22C55E] text-sm font-semibold">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {msg}
        </div>
      </div>
    )
  }

  // ── Hero variant: larger, centered, white bg context ──
  if (variant === "hero") {
    return (
      <form onSubmit={submit} className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@email.com"
          required
          className="w-full sm:flex-1 px-4 py-3 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/10 placeholder:text-gray-400"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-white bg-[#F97316] hover:bg-[#EA580C] rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          {status === "loading" ? "..." : "Subscribe Free"}
        </button>
        {status === "error" && <div className="text-red-500 text-xs mt-1">{msg}</div>}
      </form>
    )
  }

  // ── Banner variant: horizontal, for blog index ──
  if (variant === "banner") {
    return (
      <div className="bg-gray-950 rounded-xl p-6 sm:p-8 text-center">
        <div className="text-[10px] text-gray-500 uppercase tracking-[3px] font-semibold mb-2">The Flow Brief</div>
        <h3 className="text-white font-bold text-lg mb-1" style={{ fontFamily: "Georgia, serif" }}>
          Yesterday's top institutional flow, before the bell.
        </h3>
        <p className="text-gray-400 text-sm mb-5">Free. Daily. No spam. Delivered 8:45 AM ET.</p>
        <form onSubmit={submit} className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@email.com"
            required
            className="w-full sm:flex-1 px-4 py-2.5 text-sm bg-white/10 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#F97316] placeholder:text-gray-500"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-white bg-[#F97316] hover:bg-[#EA580C] rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {status === "loading" ? "..." : "Subscribe"}
          </button>
        </form>
        {status === "error" && <div className="text-red-500 text-xs mt-2">{msg}</div>}
      </div>
    )
  }

  // ── Inline variant: for mid-article blog posts ──
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
      <div className="flex items-start gap-4">
        <div className="w-9 h-9 rounded-lg bg-[#F97316] flex items-center justify-center flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
        </div>
        <div className="flex-1">
          <div className="text-gray-900 font-semibold text-[15px] mb-1">The Flow Brief</div>
          <div className="text-gray-500 text-[13px] mb-3">Yesterday's top institutional flow, in your inbox before the bell. Free, daily, no spam.</div>
          <form onSubmit={submit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@email.com"
              required
              className="flex-1 px-3 py-2 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:border-[#F97316] placeholder:text-gray-400"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="px-4 py-2 text-sm font-semibold text-white bg-[#F97316] hover:bg-[#EA580C] rounded-md transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {status === "loading" ? "..." : "Subscribe"}
            </button>
          </form>
          {status === "error" && <div className="text-red-500 text-xs mt-1">{msg}</div>}
        </div>
      </div>
    </div>
  )
}
