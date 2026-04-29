import type { Metadata } from "next"
import Link from "next/link"
import Nav from "@/components/Nav"
import Footer from "@/components/Footer"

const CANON = "https://profitbuilders.io/vs"

export const metadata: Metadata = {
  title: "Compare Profit Builders · Options Flow Scanner Alternatives",
  description:
    "Honest comparisons of Profit Builders against Unusual Whales, FlowAlgo, and Cheddar Flow. Pricing, conviction grading, track record, and alerts — side by side.",
  alternates: { canonical: CANON },
  openGraph: {
    title: "Compare Profit Builders vs Unusual Whales, FlowAlgo, Cheddar Flow",
    description: "Side-by-side options flow scanner comparisons with verified track record.",
    url: CANON,
    type: "website",
    images: [{ url: "/images/og-card.png", width: 1200, height: 630, alt: "Compare Profit Builders" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Compare Profit Builders vs top options flow scanners",
    description: "Honest 2026 comparisons: Unusual Whales, FlowAlgo, Cheddar Flow.",
    images: ["/images/og-card.png"],
  },
}

const COMPETITORS = [
  {
    slug: "unusual-whales",
    name: "Unusual Whales",
    theirPrice: "$50/mo",
    ourAngle: "Congress trades vs conviction grading",
    tldr: "Bigger brand and Congressional trade data. We add grading, a public 174K-signal track record, and Telegram alerts.",
    wins: "Congress data · Raw flow · Cheapest tier",
    losses: "No grading · No public track record",
  },
  {
    slug: "flowalgo",
    name: "FlowAlgo",
    theirPrice: "$149/mo",
    ourAngle: "33% cheaper, no $37 trial trap",
    tldr: "$149/mo with a $37 trial that auto-charges. We're $99/mo with a genuine 7-day free trial and a published track record.",
    wins: "Voice alerts · Dark pool Levels · Legacy brand",
    losses: "Expensive · Hidden trial step-up · No outcomes",
  },
  {
    slug: "cheddar-flow",
    name: "Cheddar Flow",
    theirPrice: "$85–99/mo",
    ourAngle: "Same $99 — nothing gated",
    tldr: "Same Pro-tier price. They gate dark pool + AI alerts behind Pro. We include everything at one price with documented grading.",
    wins: "20+ filter depth · Annual discount · Sub-1s latency",
    losses: "Feature gating · No public track record",
  },
  {
    slug: "barchart",
    name: "Barchart",
    theirPrice: "$199.95/mo",
    ourAngle: "Half the price, focused on flow",
    tldr: "Barchart Pro bundles flow with futures, equities, charts, and news at $199.95. We do options flow only at $99 with a verified track record.",
    wins: "Broad market coverage · Futures + equities · News",
    losses: "$100/mo more · No grading · No outcomes log",
  },
  {
    slug: "blackbox-stocks",
    name: "BlackBoxStocks",
    theirPrice: "$99.97/mo",
    ourAngle: "Same $99 — community vs receipts",
    tldr: "Effectively the same monthly price. They're a live trading-room community. We're a graded-signal engine with a 174K public log.",
    wins: "Live trading rooms · iOS + Android app · Voice",
    losses: "No public track record · Color codes vs documented filters",
  },
  {
    slug: "market-chameleon",
    name: "Market Chameleon",
    theirPrice: "$99/mo",
    ourAngle: "Research library vs live tape",
    tldr: "Same $99 monthly tier, completely different tools. They're a research library (15-min delayed). We're a real-time flow scanner.",
    wins: "Earnings + volatility studies · Backtests · Deep history",
    losses: "15-min delayed · No live signal · No grading",
  },
  {
    slug: "optionstrat",
    name: "OptionStrat",
    theirPrice: "$49.99/mo",
    ourAngle: "Builder vs signal — different jobs",
    tldr: "OptionStrat is the strategy builder; Profit Builders is the signal scanner. $49.99 vs $99 for two different problems. Often used together.",
    wins: "Best-in-class strategy builder · Cheaper · 7-day trial",
    losses: "No grading · No outcomes log · 10% of free flow shown",
  },
  {
    slug: "spotgamma",
    name: "SpotGamma",
    theirPrice: "$99–299/mo",
    ourAngle: "$170 less for both lenses",
    tldr: "SpotGamma Alpha is $299. Our Pro Bundle ($129) covers both gamma + live whale prints + grading + a public log for less than half.",
    wins: "Deepest dealer-flow models · HIRO · Equity Hub",
    losses: "$299 for top tier · No free trial · No flow signals",
  },
] as const

const itemListSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Options Flow Scanner Comparisons",
  "description": "Comparisons of Profit Builders against other leading options flow scanners.",
  "itemListElement": COMPETITORS.map((c, i) => ({
    "@type": "ListItem",
    "position": i + 1,
    "name": `${c.name} vs Profit Builders`,
    "url": `https://profitbuilders.io/vs/${c.slug}`,
  })),
}

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://profitbuilders.io" },
    { "@type": "ListItem", "position": 2, "name": "Compare", "item": CANON },
  ],
}

export default function VsIndex() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <style>{`
        .pb-grain {
          background-image:
            radial-gradient(ellipse at 20% 10%, rgba(37,99,235,0.10), transparent 50%),
            radial-gradient(ellipse at 85% 40%, rgba(22,163,74,0.06), transparent 45%),
            linear-gradient(180deg, #0E1117 0%, #0B0E13 100%);
        }
        .pb-rule { background: linear-gradient(90deg, transparent, rgba(122,139,168,0.22) 8%, rgba(122,139,168,0.22) 92%, transparent); }
        .pb-hairline { border-color: rgba(122,139,168,0.14); }
        .pb-mono { font-family: "IBM Plex Mono", "Menlo", monospace; letter-spacing: -0.01em; }
        .pb-editorial { font-family: Georgia, "Times New Roman", serif; }
        .pb-section-num { font-family: "IBM Plex Mono", monospace; font-size: 10px; letter-spacing: 0.2em; color: #3D4D63; text-transform: uppercase; }
        @keyframes pbRise { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .pb-rise { animation: pbRise 700ms cubic-bezier(0.16,1,0.3,1) both; }
        .pb-row-arrow { transition: transform 220ms cubic-bezier(0.16,1,0.3,1); }
        .pb-row:hover .pb-row-arrow { transform: translateX(6px); }
        .pb-row { transition: background 200ms ease; }
        .pb-row:hover { background: rgba(52,211,153,0.02); }
      `}</style>

      <Nav />

      <main className="pb-grain text-[#E8EDF5] min-h-screen">
        {/* HERO */}
        <section className="pt-32 pb-20 px-6 border-b pb-hairline">
          <div className="max-w-6xl mx-auto pb-rise">
            <div className="flex items-baseline gap-3 mb-6">
              <span className="pb-section-num">Index</span>
              <span className="pb-rule h-px flex-1" />
              <span className="pb-mono text-[11px] text-[#3D4D63]">Updated Apr 2026</span>
            </div>
            <h1 className="pb-editorial text-[48px] sm:text-[64px] md:text-[76px] leading-[1.02] tracking-[-0.025em] text-white mb-8 max-w-4xl">
              Profit Builders <span className="text-[#3D4D63]">compared to</span> the rest of the market.
            </h1>
            <p className="text-[18px] md:text-[19px] leading-[1.55] text-[#A9B4C6] max-w-2xl">
              Three honest comparisons against the options flow scanners you're likely evaluating. We call out where each competitor wins, where we win, and the math on what's actually gated behind their tiers. Pick the tool that matches your workflow — not the one with the loudest marketing.
            </p>
          </div>
        </section>

        {/* COMPETITOR LIST — editorial list, not cards */}
        <section className="py-16 px-6 border-b pb-hairline">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-baseline gap-3 mb-10">
              <span className="pb-section-num">Three comparisons</span>
              <span className="pb-rule h-px flex-1" />
            </div>

            <div className="divide-y divide-[#1A1F2A]">
              {COMPETITORS.map((c, i) => (
                <Link
                  key={c.slug}
                  href={`/vs/${c.slug}`}
                  className="pb-row block py-10 md:py-12 px-2 md:px-0 -mx-2 md:mx-0 group"
                >
                  <div className="grid md:grid-cols-12 gap-x-8 gap-y-4 items-start">
                    <div className="md:col-span-1">
                      <div className="pb-mono text-[11px] text-[#3D4D63] tracking-widest">
                        {String(i + 1).padStart(2, "0")}
                      </div>
                    </div>

                    <div className="md:col-span-7">
                      <div className="flex items-center gap-3 mb-3">
                        <h2 className="pb-editorial text-[28px] md:text-[36px] leading-[1.1] tracking-[-0.02em] text-white">
                          vs {c.name}
                        </h2>
                        <span className="pb-mono text-[11px] text-[#7A8BA8] uppercase tracking-widest">
                          {c.theirPrice}
                        </span>
                      </div>
                      <div className="pb-mono text-[11px] text-[#34D399] uppercase tracking-[0.18em] mb-3">
                        {c.ourAngle}
                      </div>
                      <p className="text-[15px] leading-[1.65] text-[#A9B4C6] max-w-xl">
                        {c.tldr}
                      </p>
                    </div>

                    <div className="md:col-span-4 md:text-right">
                      <div className="md:hidden h-px bg-[#1A1F2A] my-4" />
                      <div className="space-y-3">
                        <div>
                          <div className="pb-mono text-[9px] uppercase tracking-[0.22em] text-[#3D4D63] mb-1">
                            They win
                          </div>
                          <div className="text-[13px] text-[#A9B4C6] leading-[1.5]">{c.wins}</div>
                        </div>
                        <div>
                          <div className="pb-mono text-[9px] uppercase tracking-[0.22em] text-[#34D399]/70 mb-1">
                            Where we win
                          </div>
                          <div className="text-[13px] text-white leading-[1.5]">{c.losses}</div>
                        </div>
                      </div>

                      <div className="mt-5 md:mt-6 inline-flex items-center gap-2 pb-mono text-[11px] uppercase tracking-[0.16em] text-[#34D399] group-hover:text-white transition-colors">
                        Read comparison
                        <span className="pb-row-arrow">→</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* WHY THESE THREE — editorial block */}
        <section className="py-20 px-6 border-b pb-hairline">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-baseline gap-3 mb-10">
              <span className="pb-section-num">Methodology</span>
              <span className="pb-rule h-px flex-1" />
            </div>

            <div className="grid md:grid-cols-12 gap-x-8 gap-y-8">
              <div className="md:col-span-5">
                <h2 className="pb-editorial text-[32px] md:text-[40px] leading-[1.1] tracking-[-0.02em] text-white mb-2">
                  Why these three.
                </h2>
              </div>
              <div className="md:col-span-7 space-y-5">
                <p className="text-[16px] leading-[1.7] text-[#A9B4C6]">
                  These are the three platforms most people considering Profit Builders are also evaluating. Unusual Whales owns the most mindshare. FlowAlgo is the legacy incumbent. Cheddar Flow is the closest same-price competitor. If you're weighing any of them, one of these pages answers the real question.
                </p>
                <p className="text-[16px] leading-[1.7] text-[#A9B4C6]">
                  Every claim on every comparison page was verified in April 2026 from each vendor's public pricing and product documentation. Where something is subjective, we say so. Where a competitor is genuinely better, we say that too — then show you the category where we move ahead.
                </p>
                <p className="text-[15px] leading-[1.6] text-[#7A8BA8]">
                  Missing a competitor? Email <a href="mailto:support@profitbuilders.io" className="text-[#34D399] hover:underline">support@profitbuilders.io</a> and we'll add an honest comparison.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="pb-mono text-[10px] uppercase tracking-[0.3em] text-[#34D399] mb-6">Start trial</div>
            <h2 className="pb-editorial text-[40px] md:text-[52px] leading-[1.05] tracking-[-0.025em] text-white mb-6">
              Stop comparing. Start auditing.
            </h2>
            <p className="text-[17px] leading-[1.6] text-[#A9B4C6] max-w-xl mx-auto mb-10">
              Seven days of full feature access. See the institutional-grade flow, the documented data methodology, and the 220-symbol GEX heatmap up close before paying anything.
            </p>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-3 bg-[#34D399] hover:bg-[#4ADE80] text-[#0a0d12] pb-mono text-[13px] font-bold tracking-wider uppercase px-9 py-4 rounded-full transition-colors"
            >
              Start 7-Day Trial →
            </Link>
            <p className="pb-mono text-[11px] text-[#3D4D63] uppercase tracking-wider mt-6">
              7-day free trial · Card required · Cancel anytime
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
