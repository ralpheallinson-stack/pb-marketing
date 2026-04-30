"use client"

import { NumberTicker } from "@/components/magicui/number-ticker"

export default function WhyDifferent() {
  const points = [
    {
      number: '9',
      color: '#60a5fa',
      title: '9 Filters. All Data-Derived.',
      body: 'Other platforms give you 30+ manual sliders. Every one of our 9 PASS rules was built from win rate analysis across institutional-grade pipeline (OPRA tape + CBOE Rule 6.11 + B-S-M Greeks). NEUTRAL signals? 4.9% win rate — filtered. 0DTE ETF under $250K? 18.9% — filtered.',
      tag: 'vs 30+ manual sliders',
    },
    {
      icon: '◎',
      color: '#34d399',
      title: 'We Publish What Others Hide.',
      body: 'Most platforms claim win rates but never show their work. We publish every print, every condition code, every Greek, every grade, every DTE bucket. Check the results page right now. Nothing removed. Nothing adjusted.',
      tag: 'every outcome public',
    },
    {
      icon: '⟳',
      color: '#a78bfa',
      title: 'The System Adjusts Itself.',
      body: 'When Grade A signals underperform, our regime system raises the conviction threshold automatically. GREEN regime: $500K minimum. RED regime: $750K minimum. Fewer alerts when the market is punishing flow traders.',
      tag: 'unique — no competitor has this',
    },
  ]

  const stats = [
    { value: 161065, suffix: '+', label: 'Signals Tracked', decimals: 0, color: '#60a5fa' },
    { value: 220, suffix: '+', label: 'Symbols Covered', decimals: 0, color: '#34d399' },
    { value: 9, suffix: '', label: 'Data-Backed Filters', decimals: 0, color: '#a78bfa' },
    { value: 52.1, suffix: '%', label: 'STRONG Conviction WR', decimals: 1, color: '#f59e0b' },
  ]

  return (
    <section className="bg-[#0E1117] py-24" id="features">
      <div className="max-w-5xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-xs font-mono text-white/50 uppercase tracking-[0.18em] mb-3 block">
            Why We&apos;re Different
          </span>
          <h2
            className="font-bold text-white"
            style={{
              fontSize: 'clamp(28px, 4vw, 48px)',
              letterSpacing: '-0.02em',
            }}
          >
            Built Different. Proven Different.
          </h2>
          <p className="text-white/60 mt-3 text-base max-w-lg mx-auto leading-relaxed">
            Most flow tools alert on everything and ask you to trust the outcomes.
            We built our filters from data — and publish every result publicly.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid md:grid-cols-2 gap-16 items-start">

          {/* LEFT — 3 differentiator points */}
          <div className="space-y-0 divide-y divide-white/10">
            {points.map((point, i) => (
              <div key={i} className="py-8 first:pt-0 last:pb-0">
                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold font-mono flex-shrink-0 mt-0.5"
                    style={{
                      background: `${point.color}15`,
                      color: point.color,
                      border: `1px solid ${point.color}30`,
                    }}
                  >
                    {point.number || point.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-white text-base">
                        {point.title}
                      </h3>
                    </div>
                    <span
                      className="text-xs font-mono px-2 py-0.5 rounded-full mb-2 inline-block"
                      style={{
                        background: `${point.color}10`,
                        color: point.color,
                      }}
                    >
                      {point.tag}
                    </span>
                    <p className="text-white/60 text-sm leading-relaxed mt-1">
                      {point.body}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            <div className="pt-6">
              <a
                href="/results"
                className="text-blue-500 text-sm font-semibold hover:underline"
              >
                See the full methodology →
              </a>
            </div>
          </div>

          {/* RIGHT — Number Ticker stats */}
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-center overflow-hidden"
              >
                <div
                  className="font-mono font-black mb-1 truncate"
                  style={{
                    fontSize: 'clamp(28px, 3.5vw, 44px)',
                    color: stat.color,
                    lineHeight: 1,
                  }}
                >
                  <NumberTicker
                    value={stat.value}
                    decimalPlaces={stat.decimals}
                    delay={i * 0.1}
                  />
                  {stat.suffix}
                </div>
                <div className="text-xs font-mono text-white/50 uppercase tracking-widest mt-2">
                  {stat.label}
                </div>
              </div>
            ))}

            {/* Disclaimer */}
            <div className="col-span-2 mt-2">
              <p className="text-xs text-gray-300 font-mono text-center leading-relaxed">
                Past performance not indicative of future results.
                Win/loss by automated DTE-aware exit rules.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
