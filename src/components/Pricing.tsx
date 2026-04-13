"use client"

import { ShineBorder } from "@/components/magicui/shine-border"

const CHECK = "✓"

const plans = [
  {
    name: "GEX Heatmap",
    desc: "Gamma exposure data",
    price: "39",
    link: "https://buy.stripe.com/14A4gB8bSdz161s8Lx0RG06?utm_source=website&utm_medium=cta&utm_campaign=homepage",
    features: [
      "GEX heatmap — strike x expiry grid",
      "Gamma walls with conviction scoring",
      "Zero gamma + regime indicator",
      "Squeeze detection",
      "20 most-traded symbols",
      "Live during market hours",
    ],
  },
  {
    name: "Flow Scanner",
    desc: "Real-time options flow",
    price: "99",
    link: "https://buy.stripe.com/7sYeVf0Jq0Mf4XogdZ0RG04?utm_source=website&utm_medium=cta&utm_campaign=homepage",
    features: [
      "Real-time sweeps & blocks with Greeks",
      "AI conviction grading — 9 filters",
      "Spread detection & MM filtering",
      "Discord & Telegram alerts",
      "AI Chart Analyzer (20/day)",
      "Web scanner with full flow table",
    ],
  },
  {
    name: "Pro Bundle",
    desc: "Everything — save $9/mo",
    price: "129",
    link: "https://buy.stripe.com/fZubJ377OfH9exYbXJ0RG05?utm_source=website&utm_medium=cta&utm_campaign=homepage",
    features: [
      "Full options flow scanner",
      "GEX heatmap + gamma walls",
      "AI conviction grading",
      "Discord & Telegram alerts",
      "AI Chart Analyzer (20/day)",
      "Priority support",
    ],
  },
]

function FeatureList({ features }: { features: string[] }) {
  return (
    <ul className="space-y-3">
      {features.map((f) => (
        <li key={f} className="flex items-start gap-2 text-sm text-white/60">
          <span className="text-[#60a5fa] mt-0.5 flex-shrink-0">{CHECK}</span>
          {f}
        </li>
      ))}
    </ul>
  )
}

function GexCard() {
  const p = plans[0]
  return (
    <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 flex flex-col opacity-80">
      <span className="text-[10px] font-mono uppercase tracking-widest text-white/30 mb-2 block">GEX only</span>
      <h3 className="text-lg font-bold text-white mt-1">{p.name}</h3>
      <p className="text-white/35 text-sm">{p.desc}</p>
      <div className="mt-5">
        <span className="text-4xl font-bold text-white/80">${p.price}</span>
        <span className="text-white/30 text-lg">/mo</span>
      </div>
      <a
        href={p.link}
        className="block w-full mt-5 py-2.5 rounded-xl border border-white/15 text-white/50 hover:border-white/30 hover:text-white/70 text-sm font-semibold transition-all text-center"
      >
        Try It Free for 7 Days
      </a>
      <div className="h-px bg-white/[0.07] my-5" />
      <FeatureList features={p.features} />
      <p className="text-[10px] font-mono text-white/25 mt-3 text-center">Just the heatmap, no flow data</p>
    </div>
  )
}

function FlowCard() {
  const p = plans[1]
  return (
    <ShineBorder
      borderWidth={2}
      color={["#F97316", "#fb923c", "#F97316"]}
      className="rounded-2xl"
    >
      <div className="relative bg-[#161B24] rounded-2xl p-8 h-full flex flex-col">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#F97316] to-transparent" />
        <span className="inline-block bg-[#F97316]/15 text-[#F97316] text-xs font-semibold px-3 py-1 rounded-full border border-[#F97316]/30 mb-3 self-start">
          MOST POPULAR
        </span>
        <p className="text-sm font-semibold text-white/50 uppercase tracking-widest">Plan</p>
        <h3 className="text-xl font-bold text-white mt-1">{p.name}</h3>
        <p className="text-white/40 text-sm">{p.desc}</p>
        <div className="mt-6">
          <span className="text-5xl font-bold text-white">${p.price}</span>
          <span className="text-white/40 text-lg">/mo</span>
        </div>
        <a
          href={p.link}
          className="block w-full mt-6 py-3 rounded-xl bg-[#F97316] hover:bg-[#ea580c] text-white text-sm font-semibold transition-all text-center"
        >
          Try It Free for 7 Days
        </a>
        <div className="h-px bg-white/10 my-6" />
        <FeatureList features={p.features} />
      </div>
    </ShineBorder>
  )
}

function BundleCard() {
  const p = plans[2]
  return (
    <div className="relative bg-white/[0.06] border border-white/10 rounded-2xl p-8 flex flex-col">
      <span className="text-[10px] font-mono uppercase tracking-widest text-[#22c55e] mb-2 block">Best value</span>
      <p className="text-sm font-semibold text-white/50 uppercase tracking-widest">Plan</p>
      <h3 className="text-xl font-bold text-white mt-1">{p.name}</h3>
      <p className="text-white/40 text-sm">{p.desc}</p>
      <div className="mt-6">
        <span className="text-5xl font-bold text-white">${p.price}</span>
        <span className="text-white/40 text-lg">/mo</span>
      </div>
      <a
        href={p.link}
        className="block w-full mt-6 py-3 rounded-xl border border-white/20 text-white/70 hover:border-white/40 hover:text-white text-sm font-semibold transition-all text-center"
      >
        Try It Free for 7 Days
      </a>
      <div className="h-px bg-white/10 my-6" />
      <FeatureList features={p.features} />
    </div>
  )
}

export default function Pricing() {
  return (
    <section className="bg-[#0E1117] w-full py-24 px-6" id="pricing">
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="max-w-5xl mx-auto mt-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="h-px w-8 bg-[#60a5fa]" />
            <span className="text-[#60a5fa] text-xs font-semibold tracking-[0.2em] uppercase">
              Pricing
            </span>
            <div className="h-px w-8 bg-[#60a5fa]" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">Simple Pricing.</h2>
          <p className="text-white/50">
            7-day free trial. Cancel anytime. No questions asked.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GexCard />
          <FlowCard />
          <BundleCard />
        </div>

        <p className="text-center text-xs font-mono text-white/20 mt-8">
          All plans include a 7-day free trial. No credit card required to start.
        </p>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mt-24" />
    </section>
  )
}
