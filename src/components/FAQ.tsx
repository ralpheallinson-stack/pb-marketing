"use client"

import { useState } from "react"

const faqs = [
  {
    q: "How is this different from Unusual Whales or FlowAlgo?",
    a: "Unusual Whales aggregates a lot of data — congressional trades, market maker flow, news. Profit Builders does one thing: real-time institutional options flow with conviction grading. Every signal is graded STRONG / MEDIUM / WEAK based on Vol/OI ratio and premium size. You also get a public track record — every Grade A signal logged and verified at /results. No other flow tool publishes that.",
  },
  {
    q: "Do you guarantee results?",
    a: "No. This is a data tool, not a crystal ball. We provide real-time institutional flow data with context to help you make more informed decisions. We track every signal and publish every outcome on our results page.",
  },
  {
    q: "Is this real-time?",
    a: "Yes. The web scanner auto-refreshes every 3 seconds. Discord and Telegram alerts fire the moment a signal passes our conviction filters. Every signal includes Greeks, IV, sector context, accumulation tracking, and 7-day flow history.",
  },
  {
    q: "What tickers do you cover?",
    a: "We track all US-listed options flow across every optionable ticker. Our watchlist focuses on 180+ of the most active names — SPX, QQQ, NVDA, TSLA, AAPL, META, and more — but the scanner captures everything.",
  },
  {
    q: "How do alerts get delivered?",
    a: "Discord alerts, Telegram push notifications, and the real-time web scanner. Every signal includes Greeks, IV, sector context, accumulation tracking, spread detection, and 7-day flow history. You also get daily digests and weekly recaps.",
  },
  {
    q: "Can I cancel anytime?",
    a: "One click from your account page. No hoops, no emails, no retention calls. Cancel anytime.",
  },
]

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className="bg-[#0E1117] w-full py-24 px-6" id="faq">
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="max-w-3xl mx-auto pt-24">
        <div className="flex items-center gap-2 mb-8">
          <div className="h-px w-8 bg-[#60a5fa]" />
          <span className="text-[#60a5fa] text-xs font-semibold tracking-[0.2em] uppercase">
            FAQ
          </span>
        </div>

        <h2 className="text-4xl font-bold text-white mb-16">Questions.</h2>

        <div>
          {faqs.map((f, i) => (
            <div key={i} className="border-b border-white/10">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between py-5 text-left group cursor-pointer"
              >
                <span className="text-white font-medium text-base group-hover:text-[#60a5fa] transition-colors">
                  {f.q}
                </span>
                <div className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center flex-shrink-0 ml-3">
                  <span className="text-white/50 text-sm leading-none">
                    {open === i ? "−" : "+"}
                  </span>
                </div>
              </button>
              {open === i && (
                <div className="pb-5 text-white/50 text-sm leading-relaxed">
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Final CTA */}
        <div className="mt-24 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to trade with institutional flow?
          </h3>
          <p className="text-white/50 mb-8">
            7-day free trial. No credit card required.
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="#pricing"
              className="bg-[#60a5fa] hover:bg-[#3b82f6] text-white font-semibold px-8 py-3 rounded-xl text-sm transition-colors"
            >
              Start Free Trial
            </a>
            <a
              href="/results"
              className="border border-white/20 hover:border-white/40 text-white/70 hover:text-white font-semibold px-8 py-3 rounded-xl text-sm transition-colors"
            >
              View Results
            </a>
          </div>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mt-24" />
    </section>
  )
}
