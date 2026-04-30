import type { Metadata } from "next"
import Link from "next/link"
import Nav from "@/components/Nav"
import Footer from "@/components/Footer"

const CANON = "https://profitbuilders.io/vs/market-chameleon"

export const metadata: Metadata = {
  title: 'Market Chameleon vs Profit Builders · Research or Flow',
  description:
    "Market Chameleon is a $99 research library. Profit Builders is a $99 live flow tape. Both around the same price, completely different jobs. Here's which fits your workflow.",
  alternates: { canonical: CANON },
  openGraph: {
    title: 'Market Chameleon vs Profit Builders · Research or Flow',
    description: "Market Chameleon is a $99 research library. Profit Builders is a $99 live flow tape. Both around the same price, completely different jobs. Here's which fits your workflow.",
    url: CANON,
    type: "article",
    images: [{ url: "/images/og-card.png", width: 1200, height: 630, alt: "Market Chameleon vs Profit Builders" }],
  },
  twitter: {
    card: "summary_large_image",
    title: 'Market Chameleon vs Profit Builders · Research or Flow',
    description: "Market Chameleon is a $99 research library. Profit Builders is a $99 live flow tape. Both around the same price, completely different jobs. Here's which fits your workflow.",
    images: ["/images/og-card.png"],
  },
}

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": 'Market Chameleon vs Profit Builders: 2026 Options Flow Scanner Comparison',
  "description": "Market Chameleon is a $99 research library. Profit Builders is a $99 live flow tape. Both around the same price, completely different jobs. Here's which fits your workflow.",
  "author": { "@type": "Organization", "name": "Profit Builders", "url": "https://profitbuilders.io" },
  "publisher": {
    "@type": "Organization",
    "name": "Profit Builders",
    "logo": { "@type": "ImageObject", "url": "https://profitbuilders.io/images/pb-logo.png" },
  },
  "datePublished": "2026-04-25T09:00:00-04:00",
  "dateModified": "2026-04-26T10:00:00-04:00",
  "mainEntityOfPage": { "@type": "WebPage", "@id": CANON },
}

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://profitbuilders.io" },
    { "@type": "ListItem", "position": 2, "name": "Compare", "item": "https://profitbuilders.io/vs" },
    { "@type": "ListItem", "position": 3, "name": 'Market Chameleon vs Profit Builders', "item": CANON },
  ],
}

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {"@type": "Question", "name": "Is Market Chameleon real-time?", "acceptedAnswer": {"@type": "Answer", "text": "No. Even at the $99 Total Access tier, market data is 15-minute delayed. For real-time, you'd need a separate data subscription. Profit Builders' alerts hit Discord/Telegram in 1.4 seconds median."}},
    {"@type": "Question", "name": "Does Market Chameleon publish signal outcomes?", "acceptedAnswer": {"@type": "Answer", "text": "No. Market Chameleon is a research platform — historical analytics, volatility studies, screeners. It doesn't issue or grade individual signals. Profit Builders does."}},
    {"@type": "Question", "name": "Are they the same price?", "acceptedAnswer": {"@type": "Answer", "text": "Yes — Market Chameleon Total Access and Profit Builders Flow Scanner are both $99/mo. They're not comparable products at that price."}},
    {"@type": "Question", "name": "Should I use both?", "acceptedAnswer": {"@type": "Answer", "text": "Many serious traders do — Market Chameleon for pre-trade research and Profit Builders for live signal during the session. Combined ~$200/mo."}},
    {"@type": "Question", "name": "Which has the bigger learning curve?", "acceptedAnswer": {"@type": "Answer", "text": "Market Chameleon — it's a deep research toolset. Profit Builders surfaces signals already graded; you can be productive within the trial period."}}
  ],
}

const productSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Profit Builders Flow Scanner",
  "description": "Real-time institutional options flow scanner with conviction grading and a public documented OPRA methodology.",
  "image": [
    "https://profitbuilders.io/images/scanner-preview.png",
    "https://profitbuilders.io/images/og-card.png"
  ],
  "brand": { "@type": "Brand", "name": "Profit Builders" },
  "offers": {
    "@type": "Offer",
    "price": "99.00",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
    "url": "https://profitbuilders.io/pricing",
    "priceValidUntil": "2027-01-01",
  },
}

export default function VsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />

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
      `}</style>

      <Nav />

      <main className="pb-grain text-[#E8EDF5] min-h-screen">
        {/* Hero */}
        <section className="pt-32 pb-16 px-6 border-b pb-hairline">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-baseline gap-3 mb-6">
              <span className="pb-section-num">Comparison</span>
              <span className="pb-rule h-px flex-1" />
              <span className="pb-mono text-[11px] text-[#3D4D63]">Updated Apr 2026</span>
            </div>
            <Link href="/vs" className="pb-mono text-[11px] text-[#60a5fa] tracking-[0.18em] uppercase hover:text-white transition-colors mb-6 inline-block">← All comparisons</Link>
            <h1 className="pb-editorial text-[40px] sm:text-[56px] md:text-[68px] leading-[1.04] tracking-[-0.025em] text-white mb-6 mt-2">
              <em className="italic text-white/70">Market Chameleon</em> vs Profit Builders.
            </h1>
            <p className="pb-editorial italic text-[20px] md:text-[22px] leading-[1.45] text-white/65 max-w-[720px]">
              Both around $99 a month. One is a research library — earnings history, volatility studies, backtests. The other is a live tape with graded institutional flow.
            </p>
          </div>
        </section>

        {/* TL;DR strip */}
        <section className="px-6 border-b pb-hairline">
          <div className="max-w-5xl mx-auto py-8 grid grid-cols-3 gap-6 max-md:grid-cols-1 max-md:gap-3">
            <div className="text-center max-md:text-left max-md:flex max-md:items-baseline max-md:justify-between max-md:gap-4 max-md:border-b max-md:pb-hairline max-md:pb-3">
              <div className="pb-mono text-[10px] tracking-[0.22em] text-white/40 uppercase mb-2 max-md:mb-0">Market Chameleon</div>
              <div className="pb-editorial text-[28px] text-white font-normal tracking-[-0.01em] max-md:text-[20px]">$99/mo (delayed)</div>
            </div>
            <div className="text-center max-md:text-left max-md:flex max-md:items-baseline max-md:justify-between max-md:gap-4 max-md:border-b max-md:pb-hairline max-md:pb-3">
              <div className="pb-mono text-[10px] tracking-[0.22em] text-white/40 uppercase mb-2 max-md:mb-0">Profit Builders</div>
              <div className="pb-editorial text-[28px] text-white font-normal tracking-[-0.01em] max-md:text-[20px]">$99/mo (live)</div>
            </div>
            <div className="text-center max-md:text-left max-md:flex max-md:items-baseline max-md:justify-between max-md:gap-4 max-md:border-b max-md:pb-hairline max-md:pb-3">
              <div className="pb-mono text-[10px] tracking-[0.22em] text-white/40 uppercase mb-2 max-md:mb-0">Difference</div>
              <div className="pb-editorial text-[28px] text-white font-normal tracking-[-0.01em] max-md:text-[20px]">Library vs feed</div>
            </div>
          </div>
        </section>

        {/* Side-by-side comparison */}
        <section className="py-20 px-6 border-b pb-hairline">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-baseline gap-3 mb-8">
              <span className="pb-editorial italic text-[#60a5fa] text-[36px] leading-none">I.</span>
              <h2 className="pb-editorial text-[28px] md:text-[34px] font-normal tracking-[-0.015em] text-white">Side by side.</h2>
            </div>
            <div className="border-t pb-hairline">
              <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-4 py-3 border-b pb-hairline pb-mono text-[10px] tracking-[0.18em] text-white/35 uppercase">
                <span>Feature</span>
                <span className="text-right">Market Chameleon</span>
                <span className="text-right text-[#60a5fa]">Profit Builders</span>
              </div>
              <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-4 py-4 border-b pb-hairline items-baseline max-md:grid-cols-[1fr_1fr] max-md:[&>*:first-child]:col-span-2 max-md:[&>*:first-child]:mb-2">
                <span className="pb-editorial text-[15px] text-white/70">Price</span>
                <span className="pb-editorial text-[14px] text-white/55 text-right">$99/mo</span>
                <span className="pb-editorial text-[14px] text-white text-right">$99/mo</span>
              </div>
              <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-4 py-4 border-b pb-hairline items-baseline max-md:grid-cols-[1fr_1fr] max-md:[&>*:first-child]:col-span-2 max-md:[&>*:first-child]:mb-2">
                <span className="pb-editorial text-[15px] text-white/70">Data freshness</span>
                <span className="pb-editorial text-[14px] text-white/55 text-right">15-min delayed</span>
                <span className="pb-editorial text-[14px] text-white text-right">Real-time (1.4s alerts)</span>
              </div>
              <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-4 py-4 border-b pb-hairline items-baseline max-md:grid-cols-[1fr_1fr] max-md:[&>*:first-child]:col-span-2 max-md:[&>*:first-child]:mb-2">
                <span className="pb-editorial text-[15px] text-white/70">Earnings + volatility studies</span>
                <span className="pb-editorial text-[14px] text-white/55 text-right">Deep</span>
                <span className="pb-editorial text-[14px] text-white text-right">—</span>
              </div>
              <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-4 py-4 border-b pb-hairline items-baseline max-md:grid-cols-[1fr_1fr] max-md:[&>*:first-child]:col-span-2 max-md:[&>*:first-child]:mb-2">
                <span className="pb-editorial text-[15px] text-white/70">Backtesting tools</span>
                <span className="pb-editorial text-[14px] text-white/55 text-right">Yes</span>
                <span className="pb-editorial text-[14px] text-white text-right">—</span>
              </div>
              <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-4 py-4 border-b pb-hairline items-baseline max-md:grid-cols-[1fr_1fr] max-md:[&>*:first-child]:col-span-2 max-md:[&>*:first-child]:mb-2">
                <span className="pb-editorial text-[15px] text-white/70">Conviction grading</span>
                <span className="pb-editorial text-[14px] text-white/55 text-right">—</span>
                <span className="pb-editorial text-[14px] text-white text-right">institutional-flow filter Grade A/B</span>
              </div>
              <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-4 py-4 border-b pb-hairline items-baseline max-md:grid-cols-[1fr_1fr] max-md:[&>*:first-child]:col-span-2 max-md:[&>*:first-child]:mb-2">
                <span className="pb-editorial text-[15px] text-white/70">Public methodology</span>
                <span className="pb-editorial text-[14px] text-white/55 text-right">—</span>
                <span className="pb-editorial text-[14px] text-white text-right">OPRA + CBOE</span>
              </div>
              <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-4 py-4 border-b pb-hairline items-baseline max-md:grid-cols-[1fr_1fr] max-md:[&>*:first-child]:col-span-2 max-md:[&>*:first-child]:mb-2">
                <span className="pb-editorial text-[15px] text-white/70">Use case</span>
                <span className="pb-editorial text-[14px] text-white/55 text-right">Research before trading</span>
                <span className="pb-editorial text-[14px] text-white text-right">Live signal during trading</span>
              </div>
            </div>
          </div>
        </section>

        {/* When to use which */}
        <section className="py-20 px-6 border-b pb-hairline">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-baseline gap-3 mb-10">
              <span className="pb-editorial italic text-[#60a5fa] text-[36px] leading-none">II.</span>
              <h2 className="pb-editorial text-[28px] md:text-[34px] font-normal tracking-[-0.015em] text-white">When each tool wins.</h2>
            </div>
            <div className="grid grid-cols-2 gap-12 max-md:grid-cols-1 max-md:gap-8">
              <div>
                <div className="pb-mono text-[11px] tracking-[0.22em] text-white/40 uppercase mb-4">Pick Market Chameleon if</div>
                <p className="pb-editorial text-[17px] leading-[1.6] text-white/70">You want a research desk: dig through years of earnings reactions, volatility regimes, screen for setups based on historical patterns. You're not making real-time decisions on the tape.</p>
              </div>
              <div>
                <div className="pb-mono text-[11px] tracking-[0.22em] text-[#60a5fa] uppercase mb-4">Pick Profit Builders if</div>
                <p className="pb-editorial text-[17px] leading-[1.6] text-white/70">You want to act on what's happening right now. The tape is live, the signals are graded as they fire, and the outcomes are logged so you can verify the methodology over time.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 px-6 border-b pb-hairline">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-baseline gap-3 mb-10">
              <span className="pb-editorial italic text-[#60a5fa] text-[36px] leading-none">III.</span>
              <h2 className="pb-editorial text-[28px] md:text-[34px] font-normal tracking-[-0.015em] text-white">Questions.</h2>
            </div>
            <div className="py-7 border-b pb-hairline">
              <h3 className="pb-editorial text-[20px] md:text-[22px] text-white mb-3 leading-[1.3]">Is Market Chameleon real-time?</h3>
              <p className="pb-editorial text-[16px] leading-[1.6] text-white/65 max-w-[760px]">No. Even at the $99 Total Access tier, market data is 15-minute delayed. For real-time, you'd need a separate data subscription. Profit Builders' alerts hit Discord/Telegram in 1.4 seconds median.</p>
            </div>
            <div className="py-7 border-b pb-hairline">
              <h3 className="pb-editorial text-[20px] md:text-[22px] text-white mb-3 leading-[1.3]">Does Market Chameleon publish signal outcomes?</h3>
              <p className="pb-editorial text-[16px] leading-[1.6] text-white/65 max-w-[760px]">No. Market Chameleon is a research platform — historical analytics, volatility studies, screeners. It doesn't issue or grade individual signals. Profit Builders does.</p>
            </div>
            <div className="py-7 border-b pb-hairline">
              <h3 className="pb-editorial text-[20px] md:text-[22px] text-white mb-3 leading-[1.3]">Are they the same price?</h3>
              <p className="pb-editorial text-[16px] leading-[1.6] text-white/65 max-w-[760px]">Yes — Market Chameleon Total Access and Profit Builders Flow Scanner are both $99/mo. They're not comparable products at that price.</p>
            </div>
            <div className="py-7 border-b pb-hairline">
              <h3 className="pb-editorial text-[20px] md:text-[22px] text-white mb-3 leading-[1.3]">Should I use both?</h3>
              <p className="pb-editorial text-[16px] leading-[1.6] text-white/65 max-w-[760px]">Many serious traders do — Market Chameleon for pre-trade research and Profit Builders for live signal during the session. Combined ~$200/mo.</p>
            </div>
            <div className="py-7 border-b pb-hairline">
              <h3 className="pb-editorial text-[20px] md:text-[22px] text-white mb-3 leading-[1.3]">Which has the bigger learning curve?</h3>
              <p className="pb-editorial text-[16px] leading-[1.6] text-white/65 max-w-[760px]">Market Chameleon — it's a deep research toolset. Profit Builders surfaces signals already graded; you can be productive within the trial period.</p>
            </div>
          </div>
        </section>

        {/* Verdict + CTA */}
        <section className="py-24 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="pb-mono text-[11px] tracking-[0.28em] text-white/40 uppercase mb-5">Verdict</div>
            <p className="pb-editorial text-[20px] md:text-[22px] leading-[1.55] text-white/85 mb-12 italic">
              Not really competitors. Market Chameleon is the research library you read between sessions. Profit Builders is the live tape during them. If you can only pick one based on whether you're building a thesis or executing on flow, that determines the choice.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link href="/pricing" className="bg-[#F97316] hover:bg-[#F97316]/90 text-white font-bold px-8 py-3.5 rounded-full text-sm transition-colors">
                Start Free 7-Day Trial
              </Link>
              <Link href="/results" className="text-[#60a5fa] hover:text-white text-sm font-semibold transition-colors">
                See the documented methodology →
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
