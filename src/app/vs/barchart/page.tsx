import type { Metadata } from "next"
import Link from "next/link"
import Nav from "@/components/Nav"
import Footer from "@/components/Footer"

const CANON = "https://profitbuilders.io/vs/barchart"

export const metadata: Metadata = {
  title: { absolute: "Barchart Premier 2026: $29.95/mo Pricing, Tiers & Flow Alternative" },
  description:
    "Barchart Premier is $29.95/mo ($239.95/yr) — a broad markets-data platform where options flow is one module. Full 2026 tier pricing vs a focused, real-time graded-flow alternative.",
  alternates: { canonical: CANON },
  openGraph: {
    title: "Barchart Premier 2026: $29.95/mo Pricing, Tiers & Flow Alternative",
    description: "Barchart Premier is $29.95/mo ($239.95/yr) — a broad markets-data platform where options flow is one module. Full 2026 tier pricing vs a focused, real-time graded-flow alternative.",
    url: CANON,
    type: "article",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Barchart vs Profit Builders" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Barchart Premier 2026: $29.95/mo Pricing, Tiers & Flow Alternative",
    description: "Barchart Premier is $29.95/mo ($239.95/yr) — a broad markets-data platform where options flow is one module. Full 2026 tier pricing vs a focused, real-time graded-flow alternative.",
  },
}

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Barchart Premier 2026: Pricing, Tiers, and a Focused Options Flow Alternative",
  "description": "Barchart Premier is $29.95/mo ($239.95/yr) — a broad markets-data platform where options flow is one module. Full 2026 tier pricing vs a focused, real-time graded-flow alternative.",
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
  "dateModified": "2026-06-07T10:00:00-04:00",
  "mainEntityOfPage": { "@type": "WebPage", "@id": CANON },
}

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://profitbuilders.io" },
    { "@type": "ListItem", "position": 2, "name": "Compare", "item": "https://profitbuilders.io/vs" },
    { "@type": "ListItem", "position": 3, "name": 'Barchart vs Profit Builders', "item": CANON },
  ],
}

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {"@type": "Question", "name": "Is Barchart Premier worth it for options flow?", "acceptedAnswer": {"@type": "Answer", "text": "Barchart Premier is $29.95/mo (or $239.95/yr) and bundles options flow with futures, equities, charting, and news. It's inexpensive and broad, but the flow tooling is basic. If options flow is your main use case, a focused tool goes deeper; if you want one cheap platform for everything, Barchart is hard to beat."}},
    {"@type": "Question", "name": "Does Barchart publish signal outcomes?", "acceptedAnswer": {"@type": "Answer", "text": "No. Barchart provides flow data but doesn't grade signals or publish a documented methodology. Profit Builders publishes every Grade A/B signal at /methodology — currently documented OPRA processing methodology."}},
    {"@type": "Question", "name": "Which is better for serious options flow?", "acceptedAnswer": {"@type": "Answer", "text": "Profit Builders. Barchart Premier ($29.95/mo) includes options flow, but it's a basic feature inside a general market-data platform — no conviction grading, no documented methodology. Profit Builders ($99/mo) is built specifically for graded institutional options flow with verifiable outcomes."}},
    {"@type": "Question", "name": "Does Profit Builders cover futures or stocks like Barchart does?", "acceptedAnswer": {"@type": "Answer", "text": "No. Profit Builders does options flow specifically. If you need futures + equity coverage, Barchart is the broader platform."}},
    {"@type": "Question", "name": "Can I trial both?", "acceptedAnswer": {"@type": "Answer", "text": "Profit Builders offers a 7-day free trial with full access. Barchart offers a 30-day free trial of its paid tiers that converts to monthly billing if you don't cancel."}},
    {"@type": "Question", "name": "How much does Barchart Premier cost in 2026?", "acceptedAnswer": {"@type": "Answer", "text": "Barchart Premier is $29.95/mo, or $239.95/yr ($19.95/mo annualized), with a two-year option at $419.95. Below Premier sit a $9.99/mo Plus tier and a free plan, and there is a 30-day free trial. Premier is the tier that unlocks the unusual-activity options scanner and dark-pool data."}},
    {"@type": "Question", "name": "Is Barchart's options flow real-time?", "acceptedAnswer": {"@type": "Answer", "text": "Barchart offers real-time data on its paid tiers for many markets, but its options-flow tooling is a sort-and-filter table rather than a pushed, graded alert stream. Profit Builders pushes Grade A/B signals to Discord and Telegram in about 1.4 seconds, which is the difference between researching flow and reacting to it."}},
    {"@type": "Question", "name": "Does Barchart have a free version?", "acceptedAnswer": {"@type": "Answer", "text": "Yes. Barchart has a free plan with delayed data and limited screeners, plus a 30-day free trial of the paid tiers; the unusual-activity scanner and dark-pool data require Premier ($29.95/mo). Profit Builders also has a free, no-account scanner with 15-minute-delayed data at /free-scanner and a 7-day full-access trial of the real-time product."}}
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
              <span className="pb-mono text-[11px] text-[#3D4D63]">Updated June 2026</span>
            </div>
            <Link href="/vs" className="pb-mono text-[11px] text-[#60a5fa] tracking-[0.18em] uppercase hover:text-white transition-colors mb-6 inline-block">← All comparisons</Link>
            <h1 className="pb-editorial text-[40px] sm:text-[56px] md:text-[68px] leading-[1.04] tracking-[-0.025em] text-white mb-6 mt-2">
              <em className="italic text-white/70">Barchart</em> vs Profit Builders.
            </h1>
            <p className="pb-editorial italic text-[20px] md:text-[22px] leading-[1.45] text-white/65 max-w-[720px]">
              Two very different products. Barchart bundles basic options flow into a broad quotes-and-charts platform. Profit Builders focuses on graded signals with a documented methodology.
            </p>
          </div>
        </section>

        {/* TL;DR strip */}
        <section className="px-6 border-b pb-hairline">
          <div className="max-w-5xl mx-auto py-8 grid grid-cols-3 gap-6 max-md:grid-cols-1 max-md:gap-3">
            <div className="text-center max-md:text-left max-md:flex max-md:items-baseline max-md:justify-between max-md:gap-4 max-md:border-b max-md:pb-hairline max-md:pb-3">
              <div className="pb-mono text-[10px] tracking-[0.22em] text-white/40 uppercase mb-2 max-md:mb-0">Barchart Premier</div>
              <div className="pb-editorial text-[28px] text-white font-normal tracking-[-0.01em] max-md:text-[20px]">$29.95/mo</div>
            </div>
            <div className="text-center max-md:text-left max-md:flex max-md:items-baseline max-md:justify-between max-md:gap-4 max-md:border-b max-md:pb-hairline max-md:pb-3">
              <div className="pb-mono text-[10px] tracking-[0.22em] text-white/40 uppercase mb-2 max-md:mb-0">Profit Builders</div>
              <div className="pb-editorial text-[28px] text-white font-normal tracking-[-0.01em] max-md:text-[20px]">$99/mo</div>
            </div>
            <div className="text-center max-md:text-left max-md:flex max-md:items-baseline max-md:justify-between max-md:gap-4 max-md:border-b max-md:pb-hairline max-md:pb-3">
              <div className="pb-mono text-[10px] tracking-[0.22em] text-white/40 uppercase mb-2 max-md:mb-0">Trade-off</div>
              <div className="pb-editorial text-[28px] text-white font-normal tracking-[-0.01em] max-md:text-[20px]">Breadth vs focus</div>
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
                <span className="text-right">Barchart</span>
                <span className="text-right text-[#60a5fa]">Profit Builders</span>
              </div>
              <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-4 py-4 border-b pb-hairline items-baseline max-md:grid-cols-[1fr_1fr] max-md:[&>*:first-child]:col-span-2 max-md:[&>*:first-child]:mb-2">
                <span className="pb-editorial text-[15px] text-white/70">Price (Premier tier)</span>
                <span className="pb-editorial text-[14px] text-white/55 text-right">$29.95/mo</span>
                <span className="pb-editorial text-[14px] text-white text-right">$99/mo</span>
              </div>
              <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-4 py-4 border-b pb-hairline items-baseline max-md:grid-cols-[1fr_1fr] max-md:[&>*:first-child]:col-span-2 max-md:[&>*:first-child]:mb-2">
                <span className="pb-editorial text-[15px] text-white/70">Free trial</span>
                <span className="pb-editorial text-[14px] text-white/55 text-right">30-day free trial</span>
                <span className="pb-editorial text-[14px] text-white text-right">7-day full-access</span>
              </div>
              <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-4 py-4 border-b pb-hairline items-baseline max-md:grid-cols-[1fr_1fr] max-md:[&>*:first-child]:col-span-2 max-md:[&>*:first-child]:mb-2">
                <span className="pb-editorial text-[15px] text-white/70">Conviction grading</span>
                <span className="pb-editorial text-[14px] text-white/55 text-right">—</span>
                <span className="pb-editorial text-[14px] text-white text-right">Full institutional flow tape, Grade A/B labeled, curation toggle</span>
              </div>
              <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-4 py-4 border-b pb-hairline items-baseline max-md:grid-cols-[1fr_1fr] max-md:[&>*:first-child]:col-span-2 max-md:[&>*:first-child]:mb-2">
                <span className="pb-editorial text-[15px] text-white/70">Public methodology</span>
                <span className="pb-editorial text-[14px] text-white/55 text-right">—</span>
                <span className="pb-editorial text-[14px] text-white text-right">OPRA + CBOE</span>
              </div>
              <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-4 py-4 border-b pb-hairline items-baseline max-md:grid-cols-[1fr_1fr] max-md:[&>*:first-child]:col-span-2 max-md:[&>*:first-child]:mb-2">
                <span className="pb-editorial text-[15px] text-white/70">GEX heatmap</span>
                <span className="pb-editorial text-[14px] text-white/55 text-right">—</span>
                <span className="pb-editorial text-[14px] text-white text-right">Yes (220 symbols)</span>
              </div>
              <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-4 py-4 border-b pb-hairline items-baseline max-md:grid-cols-[1fr_1fr] max-md:[&>*:first-child]:col-span-2 max-md:[&>*:first-child]:mb-2">
                <span className="pb-editorial text-[15px] text-white/70">Discord + Telegram alerts</span>
                <span className="pb-editorial text-[14px] text-white/55 text-right">—</span>
                <span className="pb-editorial text-[14px] text-white text-right">Yes (1.4s median)</span>
              </div>
              <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-4 py-4 border-b pb-hairline items-baseline max-md:grid-cols-[1fr_1fr] max-md:[&>*:first-child]:col-span-2 max-md:[&>*:first-child]:mb-2">
                <span className="pb-editorial text-[15px] text-white/70">Breadth: equities, futures, news</span>
                <span className="pb-editorial text-[14px] text-white/55 text-right">Yes (broad)</span>
                <span className="pb-editorial text-[14px] text-white text-right">Options flow only</span>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing tiers */}
        <section className="py-20 px-6 border-b pb-hairline">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-baseline gap-3 mb-8">
              <span className="pb-editorial italic text-[#60a5fa] text-[36px] leading-none">II.</span>
              <h2 className="pb-editorial text-[28px] md:text-[34px] font-normal tracking-[-0.015em] text-white">Barchart pricing in 2026.</h2>
            </div>
            <p className="pb-editorial text-[17px] leading-[1.7] text-white/70 max-w-[760px] mb-8">
              Barchart sells one subscription that spans the whole platform &mdash; quotes, charts, futures, equities, news, and an options module. Options flow isn&apos;t a standalone product; it rides along inside the broader tiers. Here is the 2026 ladder.
            </p>
            <div className="border-t pb-hairline">
              <div className="grid grid-cols-[0.8fr_0.8fr_2fr] gap-4 py-4 border-b pb-hairline items-baseline max-md:grid-cols-1 max-md:gap-1">
                <span className="pb-editorial text-[16px] text-white">Free</span>
                <span className="pb-mono text-[14px] text-white/70">$0</span>
                <span className="pb-editorial text-[14px] text-white/55">Delayed quotes, basic charts, limited screeners.</span>
              </div>
              <div className="grid grid-cols-[0.8fr_0.8fr_2fr] gap-4 py-4 border-b pb-hairline items-baseline max-md:grid-cols-1 max-md:gap-1">
                <span className="pb-editorial text-[16px] text-white">Plus</span>
                <span className="pb-mono text-[14px] text-white/70">$9.99/mo</span>
                <span className="pb-editorial text-[14px] text-white/55">$8.25/mo billed annually. More screeners, saved views, and watchlists.</span>
              </div>
              <div className="grid grid-cols-[0.8fr_0.8fr_2fr] gap-4 py-4 border-b pb-hairline items-baseline max-md:grid-cols-1 max-md:gap-1">
                <span className="pb-editorial text-[16px] text-white">Premier</span>
                <span className="pb-mono text-[14px] text-white/70">$29.95/mo</span>
                <span className="pb-editorial text-[14px] text-white/55">$239.95/yr ($19.95/mo annualized) or $419.95 for two years. Unlocks the unusual-activity scanner, dark-pool data, and the full options tools.</span>
              </div>
            </div>
            <p className="pb-editorial text-[16px] leading-[1.7] text-white/60 max-w-[760px] mt-6">
              Barchart includes a genuine 30-day free trial, and at $29.95/mo Premier is cheaper than Profit Builders. That&apos;s the honest headline: if budget and breadth are the priority, Barchart is hard to beat on price. What you don&apos;t get at any tier is conviction grading on the flow, a documented signal methodology, or real-time pushed alerts &mdash; which is the entire job Profit Builders is built for.
            </p>
          </div>
        </section>

        {/* When to use which */}
        <section className="py-20 px-6 border-b pb-hairline">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-baseline gap-3 mb-10">
              <span className="pb-editorial italic text-[#60a5fa] text-[36px] leading-none">III.</span>
              <h2 className="pb-editorial text-[28px] md:text-[34px] font-normal tracking-[-0.015em] text-white">When each tool wins.</h2>
            </div>
            <div className="grid grid-cols-2 gap-12 max-md:grid-cols-1 max-md:gap-8">
              <div>
                <div className="pb-mono text-[11px] tracking-[0.22em] text-white/40 uppercase mb-4">Pick Barchart if</div>
                <p className="pb-editorial text-[17px] leading-[1.6] text-white/70">You want a single subscription that covers quotes, charts, futures, news, and basic options flow. You're a generalist who would otherwise pay for 3 separate tools.</p>
              </div>
              <div>
                <div className="pb-mono text-[11px] tracking-[0.22em] text-[#60a5fa] uppercase mb-4">Pick Profit Builders if</div>
                <p className="pb-editorial text-[17px] leading-[1.6] text-white/70">You want institutional options flow specifically — graded by a transparent rubric — and you want to verify outcomes before you trust the signals.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Switching */}
        <section className="py-20 px-6 border-b pb-hairline">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-baseline gap-3 mb-8">
              <span className="pb-editorial italic text-[#60a5fa] text-[36px] leading-none">IV.</span>
              <h2 className="pb-editorial text-[28px] md:text-[34px] font-normal tracking-[-0.015em] text-white">Switching from Barchart to Profit Builders.</h2>
            </div>
            <p className="pb-editorial text-[17px] leading-[1.7] text-white/70 max-w-[760px] mb-6">
              Most people don&apos;t replace Barchart &mdash; they add a focused flow tool next to it. Barchart stays the place you pull a chart, a futures quote, or an earnings date. Profit Builders becomes the live options tape you watch during the session. The move takes about ten minutes: start the 7-day free trial, point Discord or Telegram at the alert feed, and filter to Grade A on the first session so you see the curated tape instead of every print.
            </p>
            <p className="pb-editorial text-[17px] leading-[1.7] text-white/70 max-w-[760px] mb-8">
              The practical difference shows up fastest on speed and curation. Barchart&apos;s unusual-activity scanner is a table you sort; Profit Builders pushes graded signals to your phone in about 1.4 seconds with premium, Vol/OI, DTE, and direction already attached. You stop scanning and start reacting.
            </p>
            <p className="pb-editorial text-[17px] leading-[1.7] text-white/70 max-w-[760px] mb-8">
              There&apos;s also a clean way to run them side by side rather than choosing. Keep Barchart Premier at $29.95/mo as your data backbone &mdash; the charts you pull up, the futures quotes you check, the earnings calendar, the screeners &mdash; and let Profit Builders handle the one job Barchart treats as a side feature: the live options-flow read during market hours. Combined, that&apos;s about $129/mo for a generalist platform plus a specialist flow engine, still less than a single seat at some standalone flow tools. The decision tree is simple. If you only have budget for one subscription and you trade across futures, equities, and options, Barchart&apos;s breadth wins, and you accept that the flow tooling is a sortable table. If options flow is the edge you&apos;re actually trading, you want it graded, pushed in real time, and backed by a methodology you can audit before you trust it &mdash; and that&apos;s the line Barchart doesn&apos;t cross at any tier. Most traders who take flow seriously keep Barchart for breadth and add Profit Builders for the signal.
            </p>
            <div className="pl-5 py-4 pr-4 max-w-[760px]" style={{ background: "linear-gradient(135deg, rgba(52,211,153,0.06), rgba(52,211,153,0.01))", borderLeft: "2px solid #34D399" }}>
              <div className="pb-mono text-[10px] tracking-[0.2em] text-[#34D399] uppercase mb-2">Grade A example</div>
              <p className="pb-editorial text-[16px] leading-[1.65] text-white/80">
                What clears the top gate looks like this: a $1.2M sweep on short-dated NVDA calls, Vol/OI 3.4&times;, lifted at the ask with no offsetting flow &mdash; tagged <span className="text-white">Grade A</span> and delivered to Telegram in about a second and a half. Each such signal&apos;s resolved outcome is logged publicly at <Link href="/methodology" className="text-[#60a5fa] hover:text-white">/methodology</Link>, win or lose.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 px-6 border-b pb-hairline">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-baseline gap-3 mb-10">
              <span className="pb-editorial italic text-[#60a5fa] text-[36px] leading-none">V.</span>
              <h2 className="pb-editorial text-[28px] md:text-[34px] font-normal tracking-[-0.015em] text-white">Questions.</h2>
            </div>
            <div className="py-7 border-b pb-hairline">
              <h3 className="pb-editorial text-[20px] md:text-[22px] text-white mb-3 leading-[1.3]">Is Barchart Premier worth it for options flow?</h3>
              <p className="pb-editorial text-[16px] leading-[1.6] text-white/65 max-w-[760px]">Barchart Premier is $29.95/mo (or $239.95/yr) and bundles options flow with futures, equities, charting, and news. It's inexpensive and broad, but the flow tooling is basic. If options flow is your main use case, a focused tool goes deeper; if you want one cheap platform for everything, Barchart is hard to beat.</p>
            </div>
            <div className="py-7 border-b pb-hairline">
              <h3 className="pb-editorial text-[20px] md:text-[22px] text-white mb-3 leading-[1.3]">Does Barchart publish signal outcomes?</h3>
              <p className="pb-editorial text-[16px] leading-[1.6] text-white/65 max-w-[760px]">No. Barchart provides flow data but doesn't grade signals or publish a documented methodology. Profit Builders publishes every Grade A/B signal at /methodology — currently documented OPRA processing methodology.</p>
            </div>
            <div className="py-7 border-b pb-hairline">
              <h3 className="pb-editorial text-[20px] md:text-[22px] text-white mb-3 leading-[1.3]">Which is better for serious options flow?</h3>
              <p className="pb-editorial text-[16px] leading-[1.6] text-white/65 max-w-[760px]">Profit Builders. Barchart Premier ($29.95/mo) includes options flow, but it's a basic feature inside a general market-data platform — no conviction grading, no documented methodology. Profit Builders ($99/mo) is built specifically for graded institutional options flow with verifiable outcomes.</p>
            </div>
            <div className="py-7 border-b pb-hairline">
              <h3 className="pb-editorial text-[20px] md:text-[22px] text-white mb-3 leading-[1.3]">Does Profit Builders cover futures or stocks like Barchart does?</h3>
              <p className="pb-editorial text-[16px] leading-[1.6] text-white/65 max-w-[760px]">No. Profit Builders does options flow specifically. If you need futures + equity coverage, Barchart is the broader platform.</p>
            </div>
            <div className="py-7 border-b pb-hairline">
              <h3 className="pb-editorial text-[20px] md:text-[22px] text-white mb-3 leading-[1.3]">Can I trial both?</h3>
              <p className="pb-editorial text-[16px] leading-[1.6] text-white/65 max-w-[760px]">Profit Builders offers a 7-day free trial with full access. Barchart offers a 30-day free trial of its paid tiers that converts to monthly billing if you don't cancel.</p>
            </div>
            <div className="py-7 border-b pb-hairline">
              <h3 className="pb-editorial text-[20px] md:text-[22px] text-white mb-3 leading-[1.3]">How much does Barchart Premier cost in 2026?</h3>
              <p className="pb-editorial text-[16px] leading-[1.6] text-white/65 max-w-[760px]">Barchart Premier is $29.95/mo, or $239.95/yr ($19.95/mo annualized), with a two-year option at $419.95. Below Premier sit a $9.99/mo Plus tier and a free plan, and there is a 30-day free trial. Premier is the tier that unlocks the unusual-activity options scanner and dark-pool data.</p>
            </div>
            <div className="py-7 border-b pb-hairline">
              <h3 className="pb-editorial text-[20px] md:text-[22px] text-white mb-3 leading-[1.3]">Is Barchart&apos;s options flow real-time?</h3>
              <p className="pb-editorial text-[16px] leading-[1.6] text-white/65 max-w-[760px]">Barchart offers real-time data on its paid tiers for many markets, but its options-flow tooling is a sort-and-filter table rather than a pushed, graded alert stream. Profit Builders pushes Grade A/B signals to Discord and Telegram in about 1.4 seconds &mdash; the difference between researching flow and reacting to it.</p>
            </div>
            <div className="py-7 border-b pb-hairline">
              <h3 className="pb-editorial text-[20px] md:text-[22px] text-white mb-3 leading-[1.3]">Does Barchart have a free version?</h3>
              <p className="pb-editorial text-[16px] leading-[1.6] text-white/65 max-w-[760px]">Yes. Barchart has a free plan with delayed data and limited screeners, plus a 30-day free trial of the paid tiers; the unusual-activity scanner and dark-pool data require Premier ($29.95/mo). Profit Builders also has a free, no-account scanner with 15-minute-delayed data at <Link href="/free-scanner" className="text-[#60a5fa] hover:text-white">/free-scanner</Link> and a 7-day full-access trial of the real-time product.</p>
            </div>
          </div>
        </section>

        {/* What the module includes */}
        <section className="py-20 px-6 border-b pb-hairline">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-baseline gap-3 mb-8">
              <span className="pb-editorial italic text-[#60a5fa] text-[36px] leading-none">VI.</span>
              <h2 className="pb-editorial text-[28px] md:text-[34px] font-normal tracking-[-0.015em] text-white">What Barchart&apos;s options module actually includes.</h2>
            </div>
            <p className="pb-editorial text-[17px] leading-[1.7] text-white/70 max-w-[760px] mb-6">
              At the Premier tier, Barchart&apos;s options coverage is genuinely broad: an unusual-activity scanner, dark-pool prints, full options chains with Greeks, an options-flow table, and screeners you can sort by volume, open interest, and implied volatility. For $29.95/mo that is a lot of surface area &mdash; and if you also want futures quotes, equity charts, and a news feed under one login, very little else bundles this much for the price. As a generalist&apos;s cockpit, it earns its keep.
            </p>
            <p className="pb-editorial text-[17px] leading-[1.7] text-white/70 max-w-[760px] mb-6">
              What the module doesn&apos;t do is decide for you. The unusual-activity scanner is a table you sort and read; there is no conviction grade attached to a print, no documented rubric explaining why one sweep matters more than another, and no published record of how flagged setups actually resolved. Alerts are pull-based &mdash; you go and look &mdash; rather than pushed to your phone the instant a print clears a threshold. On a fast tape, the difference between reading a sorted table and catching a pushed Grade A alert is often the difference between the entry and the exit.
            </p>
            <p className="pb-editorial text-[17px] leading-[1.7] text-white/70 max-w-[760px]">
              None of that makes Barchart a bad product &mdash; it makes it a broad data utility rather than a focused signal service. Profit Builders inverts the trade-offs: narrower (options flow only), pricier ($99/mo), but every print is graded A or B against nine filters, the methodology is public at <Link href="/methodology" className="text-[#60a5fa] hover:text-white">/methodology</Link>, and Grade A signals are pushed to Discord and Telegram in about 1.4 seconds. The honest way to frame the choice: breadth you interpret yourself, or focus that arrives already interpreted.
            </p>
          </div>
        </section>

        {/* Verdict + CTA */}
        <section className="py-24 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="pb-mono text-[11px] tracking-[0.28em] text-white/40 uppercase mb-5">Verdict</div>
            <p className="pb-editorial text-[20px] md:text-[22px] leading-[1.55] text-white/85 mb-12 italic">
              Different products for different jobs. If you want one affordable subscription covering futures, equities, charts, and basic flow, Barchart Premier is hard to beat at $29.95/mo. If options flow is the job — graded, documented, with verifiable outcomes — Profit Builders is the focused tool built for exactly that.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link href="/pricing" className="bg-[#F97316] hover:bg-[#F97316]/90 text-white font-bold px-8 py-3.5 rounded-full text-sm transition-colors">
                Start Free 7-Day Trial
              </Link>
              <Link href="/methodology" className="text-[#60a5fa] hover:text-white text-sm font-semibold transition-colors">
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
