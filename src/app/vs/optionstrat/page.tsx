import type { Metadata } from "next"
import Link from "next/link"
import Nav from "@/components/Nav"
import Footer from "@/components/Footer"

const CANON = "https://profitbuilders.io/vs/optionstrat"

export const metadata: Metadata = {
  title: 'OptionStrat vs Profit Builders · Builder or Signal',
  description:
    "OptionStrat helps you draw the trade. Profit Builders helps you find it. $49.99 vs $99 for two different jobs. Here's which one your workflow needs.",
  alternates: { canonical: CANON },
  openGraph: {
    title: 'OptionStrat vs Profit Builders · Builder or Signal',
    description: "OptionStrat helps you draw the trade. Profit Builders helps you find it. $49.99 vs $99 for two different jobs. Here's which one your workflow needs.",
    url: CANON,
    type: "article",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "OptionStrat vs Profit Builders" }],
  },
  twitter: {
    card: "summary_large_image",
    title: 'OptionStrat vs Profit Builders · Builder or Signal',
    description: "OptionStrat helps you draw the trade. Profit Builders helps you find it. $49.99 vs $99 for two different jobs. Here's which one your workflow needs.",
  },
}

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": 'OptionStrat vs Profit Builders: 2026 Options Flow Scanner Comparison',
  "description": "OptionStrat helps you draw the trade. Profit Builders helps you find it. $49.99 vs $99 for two different jobs. Here's which one your workflow needs.",
  "image": [
    "https://profitbuilders.io/images/scanner-preview.png",
    "https://profitbuilders.io/opengraph-image"
  ],
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
    { "@type": "ListItem", "position": 3, "name": 'OptionStrat vs Profit Builders', "item": CANON },
  ],
}

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {"@type": "Question", "name": "Is OptionStrat cheaper than Profit Builders?", "acceptedAnswer": {"@type": "Answer", "text": "Yes — Live Flow tier is $49.99/mo vs Profit Builders' $99. They solve different problems. OptionStrat helps you build a trade; Profit Builders helps you find one."}},
    {"@type": "Question", "name": "Does OptionStrat grade flow signals?", "acceptedAnswer": {"@type": "Answer", "text": "No. OptionStrat surfaces flow but doesn't apply a conviction filter or publish outcomes. Profit Builders runs every print through a institutional-flow filter engine and publishes the resolved P&L of every Grade A/B signal."}},
    {"@type": "Question", "name": "Can I use OptionStrat for the strategy and Profit Builders for the signal?", "acceptedAnswer": {"@type": "Answer", "text": "Yes — that's the most common stack. Profit Builders surfaces the institutional print, you take the underlying conviction to OptionStrat to model the spread or structure that fits your view."}},
    {"@type": "Question", "name": "Does OptionStrat have a free tier?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, but it's 15-minute delayed and shows roughly 10% of the full flow feed. For real-time flow, you need Live Flow at $49.99/mo."}},
    {"@type": "Question", "name": "Why is Profit Builders more expensive?", "acceptedAnswer": {"@type": "Answer", "text": "Different value prop. Profit Builders is paying for the methodology engine, the public outcomes log, and the GEX heatmap on top of the live tape — not just the flow display."}}
  ],
}

const productSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Profit Builders Flow Scanner",
  "description": "Real-time institutional options flow scanner with conviction grading and a public documented OPRA methodology.",
  "image": [
    "https://profitbuilders.io/images/scanner-preview.png",
    "https://profitbuilders.io/opengraph-image"
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
        .pb-grain { background: #ffffff; }
        .pb-rule { background: linear-gradient(90deg, transparent, #E2E8F0 8%, #E2E8F0 92%, transparent); }
        .pb-hairline { border-color: #E5E7EB; }
        .pb-mono { font-family: "IBM Plex Mono", "Menlo", monospace; letter-spacing: -0.01em; }
        .pb-editorial { font-family: Georgia, "Times New Roman", serif; }
        .pb-section-num { font-family: "IBM Plex Mono", monospace; font-size: 10px; letter-spacing: 0.2em; color: #9CA3AF; text-transform: uppercase; }
      `}</style>

      <Nav />

      <main className="bg-white text-gray-950 min-h-screen">
        {/* Hero */}
        <section className="pt-32 pb-16 px-6 border-b pb-hairline">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-baseline gap-3 mb-6">
              <span className="pb-section-num">Comparison</span>
              <span className="pb-rule h-px flex-1" />
              <span className="pb-mono text-[11px] text-gray-400">Updated Apr 2026</span>
            </div>
            <Link href="/vs" className="pb-mono text-[11px] text-[#F97316] tracking-[0.18em] uppercase hover:text-gray-900 transition-colors mb-6 inline-block">← All comparisons</Link>
            <h1 className="pb-editorial text-[40px] sm:text-[56px] md:text-[68px] leading-[1.04] tracking-[-0.025em] text-gray-950 mb-6 mt-2">
              <em className="italic text-gray-700">OptionStrat</em> vs Profit Builders.
            </h1>
            <p className="pb-editorial italic text-[20px] md:text-[22px] leading-[1.45] text-gray-700 max-w-[720px]">
              OptionStrat is the strategy builder — payoff diagrams, Greeks, probability models. Profit Builders is the signal scanner — graded institutional flow you can act on.
            </p>
          </div>
        </section>

        {/* TL;DR strip */}
        <section className="px-6 border-b pb-hairline">
          <div className="max-w-5xl mx-auto py-8 grid grid-cols-3 gap-6 max-md:grid-cols-1 max-md:gap-3">
            <div className="text-center max-md:text-left max-md:flex max-md:items-baseline max-md:justify-between max-md:gap-4 max-md:border-b max-md:pb-hairline max-md:pb-3">
              <div className="pb-mono text-[10px] tracking-[0.22em] text-gray-400 uppercase mb-2 max-md:mb-0">OptionStrat Live Flow</div>
              <div className="pb-editorial text-[28px] text-gray-950 font-normal tracking-[-0.01em] max-md:text-[20px]">$49.99/mo</div>
            </div>
            <div className="text-center max-md:text-left max-md:flex max-md:items-baseline max-md:justify-between max-md:gap-4 max-md:border-b max-md:pb-hairline max-md:pb-3">
              <div className="pb-mono text-[10px] tracking-[0.22em] text-gray-400 uppercase mb-2 max-md:mb-0">Profit Builders</div>
              <div className="pb-editorial text-[28px] text-gray-950 font-normal tracking-[-0.01em] max-md:text-[20px]">$99/mo</div>
            </div>
            <div className="text-center max-md:text-left max-md:flex max-md:items-baseline max-md:justify-between max-md:gap-4 max-md:border-b max-md:pb-hairline max-md:pb-3">
              <div className="pb-mono text-[10px] tracking-[0.22em] text-gray-400 uppercase mb-2 max-md:mb-0">Difference</div>
              <div className="pb-editorial text-[28px] text-gray-950 font-normal tracking-[-0.01em] max-md:text-[20px]">Build trade vs find trade</div>
            </div>
          </div>
        </section>

        {/* Side-by-side comparison */}
        <section className="py-20 px-6 border-b pb-hairline">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-baseline gap-3 mb-8">
              <span className="pb-editorial italic text-[#F97316] text-[36px] leading-none">I.</span>
              <h2 className="pb-editorial text-[28px] md:text-[34px] font-normal tracking-[-0.015em] text-gray-950">Side by side.</h2>
            </div>
            <div className="border-t pb-hairline">
              <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-4 py-3 border-b pb-hairline pb-mono text-[10px] tracking-[0.18em] text-gray-400 uppercase">
                <span>Feature</span>
                <span className="text-right">OptionStrat</span>
                <span className="text-right text-[#F97316]">Profit Builders</span>
              </div>
              <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-4 py-4 border-b pb-hairline items-baseline max-md:grid-cols-[1fr_1fr] max-md:[&>*:first-child]:col-span-2 max-md:[&>*:first-child]:mb-2">
                <span className="pb-editorial text-[15px] text-gray-700">Price (live flow tier)</span>
                <span className="pb-editorial text-[14px] text-gray-500 text-right">$49.99/mo</span>
                <span className="pb-editorial text-[14px] text-gray-950 text-right">$99/mo</span>
              </div>
              <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-4 py-4 border-b pb-hairline items-baseline max-md:grid-cols-[1fr_1fr] max-md:[&>*:first-child]:col-span-2 max-md:[&>*:first-child]:mb-2">
                <span className="pb-editorial text-[15px] text-gray-700">Free trial</span>
                <span className="pb-editorial text-[14px] text-gray-500 text-right">7-day on paid plans</span>
                <span className="pb-editorial text-[14px] text-gray-950 text-right">7-day full-access</span>
              </div>
              <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-4 py-4 border-b pb-hairline items-baseline max-md:grid-cols-[1fr_1fr] max-md:[&>*:first-child]:col-span-2 max-md:[&>*:first-child]:mb-2">
                <span className="pb-editorial text-[15px] text-gray-700">Strategy builder + payoff visualizer</span>
                <span className="pb-editorial text-[14px] text-gray-500 text-right">Yes (best in class)</span>
                <span className="pb-editorial text-[14px] text-gray-950 text-right">—</span>
              </div>
              <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-4 py-4 border-b pb-hairline items-baseline max-md:grid-cols-[1fr_1fr] max-md:[&>*:first-child]:col-span-2 max-md:[&>*:first-child]:mb-2">
                <span className="pb-editorial text-[15px] text-gray-700">Live options flow</span>
                <span className="pb-editorial text-[14px] text-gray-500 text-right">Yes (Live Flow tier)</span>
                <span className="pb-editorial text-[14px] text-gray-950 text-right">Yes (real-time)</span>
              </div>
              <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-4 py-4 border-b pb-hairline items-baseline max-md:grid-cols-[1fr_1fr] max-md:[&>*:first-child]:col-span-2 max-md:[&>*:first-child]:mb-2">
                <span className="pb-editorial text-[15px] text-gray-700">Conviction grading</span>
                <span className="pb-editorial text-[14px] text-gray-500 text-right">—</span>
                <span className="pb-editorial text-[14px] text-gray-950 text-right">institutional-flow filter Grade A/B</span>
              </div>
              <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-4 py-4 border-b pb-hairline items-baseline max-md:grid-cols-[1fr_1fr] max-md:[&>*:first-child]:col-span-2 max-md:[&>*:first-child]:mb-2">
                <span className="pb-editorial text-[15px] text-gray-700">Public methodology</span>
                <span className="pb-editorial text-[14px] text-gray-500 text-right">—</span>
                <span className="pb-editorial text-[14px] text-gray-950 text-right">OPRA + CBOE</span>
              </div>
              <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-4 py-4 border-b pb-hairline items-baseline max-md:grid-cols-[1fr_1fr] max-md:[&>*:first-child]:col-span-2 max-md:[&>*:first-child]:mb-2">
                <span className="pb-editorial text-[15px] text-gray-700">GEX heatmap</span>
                <span className="pb-editorial text-[14px] text-gray-500 text-right">—</span>
                <span className="pb-editorial text-[14px] text-gray-950 text-right">Yes (220 symbols)</span>
              </div>
            </div>
          </div>
        </section>

        {/* When to use which */}
        <section className="py-20 px-6 border-b pb-hairline">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-baseline gap-3 mb-10">
              <span className="pb-editorial italic text-[#F97316] text-[36px] leading-none">II.</span>
              <h2 className="pb-editorial text-[28px] md:text-[34px] font-normal tracking-[-0.015em] text-gray-950">When each tool wins.</h2>
            </div>
            <div className="grid grid-cols-2 gap-12 max-md:grid-cols-1 max-md:gap-8">
              <div>
                <div className="pb-mono text-[11px] tracking-[0.22em] text-gray-400 uppercase mb-4">Pick OptionStrat if</div>
                <p className="pb-editorial text-[17px] leading-[1.6] text-gray-700">You already have a thesis and want to model it. Spreads, butterflies, calendars — you draw payoff curves and pick the structure. The flow tab is supplemental.</p>
              </div>
              <div>
                <div className="pb-mono text-[11px] tracking-[0.22em] text-[#F97316] uppercase mb-4">Pick Profit Builders if</div>
                <p className="pb-editorial text-[17px] leading-[1.6] text-gray-700">You want the signal first, then the trade. The scanner surfaces the prints worth following, then you pick the strike and structure on your own platform.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 px-6 border-b pb-hairline">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-baseline gap-3 mb-10">
              <span className="pb-editorial italic text-[#F97316] text-[36px] leading-none">III.</span>
              <h2 className="pb-editorial text-[28px] md:text-[34px] font-normal tracking-[-0.015em] text-gray-950">Questions.</h2>
            </div>
            <div className="py-7 border-b pb-hairline">
              <h3 className="pb-editorial text-[20px] md:text-[22px] text-gray-950 mb-3 leading-[1.3]">Is OptionStrat cheaper than Profit Builders?</h3>
              <p className="pb-editorial text-[16px] leading-[1.6] text-gray-700 max-w-[760px]">Yes — Live Flow tier is $49.99/mo vs Profit Builders' $99. They solve different problems. OptionStrat helps you build a trade; Profit Builders helps you find one.</p>
            </div>
            <div className="py-7 border-b pb-hairline">
              <h3 className="pb-editorial text-[20px] md:text-[22px] text-gray-950 mb-3 leading-[1.3]">Does OptionStrat grade flow signals?</h3>
              <p className="pb-editorial text-[16px] leading-[1.6] text-gray-700 max-w-[760px]">No. OptionStrat surfaces flow but doesn't apply a conviction filter or publish outcomes. Profit Builders runs every print through a institutional-flow filter engine and publishes the resolved P&L of every Grade A/B signal.</p>
            </div>
            <div className="py-7 border-b pb-hairline">
              <h3 className="pb-editorial text-[20px] md:text-[22px] text-gray-950 mb-3 leading-[1.3]">Can I use OptionStrat for the strategy and Profit Builders for the signal?</h3>
              <p className="pb-editorial text-[16px] leading-[1.6] text-gray-700 max-w-[760px]">Yes — that's the most common stack. Profit Builders surfaces the institutional print, you take the underlying conviction to OptionStrat to model the spread or structure that fits your view.</p>
            </div>
            <div className="py-7 border-b pb-hairline">
              <h3 className="pb-editorial text-[20px] md:text-[22px] text-gray-950 mb-3 leading-[1.3]">Does OptionStrat have a free tier?</h3>
              <p className="pb-editorial text-[16px] leading-[1.6] text-gray-700 max-w-[760px]">Yes, but it's 15-minute delayed and shows roughly 10% of the full flow feed. For real-time flow, you need Live Flow at $49.99/mo.</p>
            </div>
            <div className="py-7 border-b pb-hairline">
              <h3 className="pb-editorial text-[20px] md:text-[22px] text-gray-950 mb-3 leading-[1.3]">Why is Profit Builders more expensive?</h3>
              <p className="pb-editorial text-[16px] leading-[1.6] text-gray-700 max-w-[760px]">Different value prop. Profit Builders is paying for the methodology engine, the public outcomes log, and the GEX heatmap on top of the live tape — not just the flow display.</p>
            </div>
          </div>
        </section>

        {/* Verdict + CTA */}
        <section className="py-24 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="pb-mono text-[11px] tracking-[0.28em] text-gray-400 uppercase mb-5">Verdict</div>
            <p className="pb-editorial text-[20px] md:text-[22px] leading-[1.55] text-gray-700 mb-12 italic">
              Both useful, often together. OptionStrat is the best-in-class strategy builder. Profit Builders is the focused signal scanner with documented OPRA methodology (CBOE Rule 6.11 sweep detection, B-S-M Greeks, NBBO aggression). If you have a thesis and want to model it, OptionStrat. If you want institutional conviction to act on, Profit Builders.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link href="/pricing" className="bg-[#F97316] hover:bg-[#F97316]/90 text-white font-bold px-8 py-3.5 rounded-full text-sm transition-colors">
                Start Free 7-Day Trial
              </Link>
              <Link href="/methodology" className="text-[#F97316] hover:text-gray-900 text-sm font-semibold transition-colors">
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
