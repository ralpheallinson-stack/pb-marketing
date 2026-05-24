import type { Metadata } from "next"
import Link from "next/link"
import Nav from "@/components/Nav"
import Footer from "@/components/Footer"

const CANON = "https://profitbuilders.io/vs/blackbox-stocks"

export const metadata: Metadata = {
  title: { absolute: "BlackBoxStocks vs Profit Builders · The $99 Decision" },
  description:
    "BlackBoxStocks and Profit Builders are both ~$99/mo. One is a community trading room. The other is a graded-signal engine with a public OPRA-grade log. Here's how to choose.",
  alternates: { canonical: CANON },
  openGraph: {
    title: 'BlackBoxStocks vs Profit Builders · The $99 Decision',
    description: "BlackBoxStocks and Profit Builders are both ~$99/mo. One is a community trading room. The other is a graded-signal engine with a public OPRA-grade log. Here's how to choose.",
    url: CANON,
    type: "article",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "BlackBoxStocks vs Profit Builders" }],
  },
  twitter: {
    card: "summary_large_image",
    title: 'BlackBoxStocks vs Profit Builders · The $99 Decision',
    description: "BlackBoxStocks and Profit Builders are both ~$99/mo. One is a community trading room. The other is a graded-signal engine with a public OPRA-grade log. Here's how to choose.",
  },
}

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": 'BlackBoxStocks vs Profit Builders: 2026 Options Flow Scanner Comparison',
  "description": "BlackBoxStocks and Profit Builders are both ~$99/mo. One is a community trading room. The other is a graded-signal engine with a public OPRA-grade log. Here's how to choose.",
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
  "dateModified": "2026-05-24T10:00:00-04:00",
  "mainEntityOfPage": { "@type": "WebPage", "@id": CANON },
}

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://profitbuilders.io" },
    { "@type": "ListItem", "position": 2, "name": "Compare", "item": "https://profitbuilders.io/vs" },
    { "@type": "ListItem", "position": 3, "name": 'BlackBoxStocks vs Profit Builders', "item": CANON },
  ],
}

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {"@type": "Question", "name": "Are BlackBoxStocks and Profit Builders the same price?", "acceptedAnswer": {"@type": "Answer", "text": "Effectively yes — $99.97 vs $99. The first month at BlackBoxStocks is $29.95; Profit Builders offers a 7-day free trial then $99/mo."}},
    {"@type": "Question", "name": "Does BlackBoxStocks have a cheaper plan?", "acceptedAnswer": {"@type": "Answer", "text": "Yes — Options Basic is $59/mo with real-time options flow, algo alerts, institutional charting, and the options heatmap, but no dark pool data or advanced delta/gamma tools. Those sit in the higher Plus and ~$99 Premium tiers, and Premium is the full-feature plan compared here against Profit Builders' $99/mo."}},
    {"@type": "Question", "name": "Does BlackBoxStocks publish a documented methodology?", "acceptedAnswer": {"@type": "Answer", "text": "No. BlackBoxStocks runs live trading rooms and color-coded alerts but doesn't publish signal outcomes or win rates. Profit Builders publishes every signal at /results."}},
    {"@type": "Question", "name": "Does Profit Builders have a mobile app?", "acceptedAnswer": {"@type": "Answer", "text": "Not currently. Profit Builders is web-first and routes alerts to Discord and Telegram. BlackBoxStocks has dedicated iOS and Android apps."}},
    {"@type": "Question", "name": "Which is better for a beginner?", "acceptedAnswer": {"@type": "Answer", "text": "Different paths. BlackBoxStocks' trading rooms walk beginners through real-time decisions. Profit Builders' methodology — Grade A/B engine + public log — gives beginners a clear rule set to follow without depending on a chat room."}},
    {"@type": "Question", "name": "Can I use both?", "acceptedAnswer": {"@type": "Answer", "text": "Many traders do. They use Profit Builders for graded entries and BlackBoxStocks for community context. The price stack is ~$200/mo combined."}}
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
              <span className="pb-mono text-[11px] text-[#3D4D63]">Updated May 2026</span>
            </div>
            <Link href="/vs" className="pb-mono text-[11px] text-[#60a5fa] tracking-[0.18em] uppercase hover:text-white transition-colors mb-6 inline-block">← All comparisons</Link>
            <h1 className="pb-editorial text-[40px] sm:text-[56px] md:text-[68px] leading-[1.04] tracking-[-0.025em] text-white mb-6 mt-2">
              <em className="italic text-white/70">BlackBoxStocks</em> vs Profit Builders.
            </h1>
            <p className="pb-editorial italic text-[20px] md:text-[22px] leading-[1.45] text-white/65 max-w-[720px]">
              Nearly identical price. Completely different product. One bets on trader community. The other bets on transparent grading.
            </p>
          </div>
        </section>

        {/* TL;DR strip */}
        <section className="px-6 border-b pb-hairline">
          <div className="max-w-5xl mx-auto py-8 grid grid-cols-3 gap-6 max-md:grid-cols-1 max-md:gap-3">
            <div className="text-center max-md:text-left max-md:flex max-md:items-baseline max-md:justify-between max-md:gap-4 max-md:border-b max-md:pb-hairline max-md:pb-3">
              <div className="pb-mono text-[10px] tracking-[0.22em] text-white/40 uppercase mb-2 max-md:mb-0">BlackBoxStocks</div>
              <div className="pb-editorial text-[28px] text-white font-normal tracking-[-0.01em] max-md:text-[20px]">$99.97/mo</div>
            </div>
            <div className="text-center max-md:text-left max-md:flex max-md:items-baseline max-md:justify-between max-md:gap-4 max-md:border-b max-md:pb-hairline max-md:pb-3">
              <div className="pb-mono text-[10px] tracking-[0.22em] text-white/40 uppercase mb-2 max-md:mb-0">Profit Builders</div>
              <div className="pb-editorial text-[28px] text-white font-normal tracking-[-0.01em] max-md:text-[20px]">$99/mo</div>
            </div>
            <div className="text-center max-md:text-left max-md:flex max-md:items-baseline max-md:justify-between max-md:gap-4 max-md:border-b max-md:pb-hairline max-md:pb-3">
              <div className="pb-mono text-[10px] tracking-[0.22em] text-white/40 uppercase mb-2 max-md:mb-0">Difference</div>
              <div className="pb-editorial text-[28px] text-white font-normal tracking-[-0.01em] max-md:text-[20px]">Community vs receipts</div>
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
                <span className="text-right">BlackBoxStocks</span>
                <span className="text-right text-[#60a5fa]">Profit Builders</span>
              </div>
              <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-4 py-4 border-b pb-hairline items-baseline max-md:grid-cols-[1fr_1fr] max-md:[&>*:first-child]:col-span-2 max-md:[&>*:first-child]:mb-2">
                <span className="pb-editorial text-[15px] text-white/70">Price</span>
                <span className="pb-editorial text-[14px] text-white/55 text-right">$99.97/mo</span>
                <span className="pb-editorial text-[14px] text-white text-right">$99/mo</span>
              </div>
              <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-4 py-4 border-b pb-hairline items-baseline max-md:grid-cols-[1fr_1fr] max-md:[&>*:first-child]:col-span-2 max-md:[&>*:first-child]:mb-2">
                <span className="pb-editorial text-[15px] text-white/70">Free trial</span>
                <span className="pb-editorial text-[14px] text-white/55 text-right">First month $29.95</span>
                <span className="pb-editorial text-[14px] text-white text-right">7-day free (full access)</span>
              </div>
              <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-4 py-4 border-b pb-hairline items-baseline max-md:grid-cols-[1fr_1fr] max-md:[&>*:first-child]:col-span-2 max-md:[&>*:first-child]:mb-2">
                <span className="pb-editorial text-[15px] text-white/70">Conviction grading</span>
                <span className="pb-editorial text-[14px] text-white/55 text-right">Color-coded alerts</span>
                <span className="pb-editorial text-[14px] text-white text-right">Full institutional flow tape, Grade A/B labeled, curation toggle</span>
              </div>
              <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-4 py-4 border-b pb-hairline items-baseline max-md:grid-cols-[1fr_1fr] max-md:[&>*:first-child]:col-span-2 max-md:[&>*:first-child]:mb-2">
                <span className="pb-editorial text-[15px] text-white/70">Public methodology</span>
                <span className="pb-editorial text-[14px] text-white/55 text-right">—</span>
                <span className="pb-editorial text-[14px] text-white text-right">OPRA + CBOE</span>
              </div>
              <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-4 py-4 border-b pb-hairline items-baseline max-md:grid-cols-[1fr_1fr] max-md:[&>*:first-child]:col-span-2 max-md:[&>*:first-child]:mb-2">
                <span className="pb-editorial text-[15px] text-white/70">Live trading rooms</span>
                <span className="pb-editorial text-[14px] text-white/55 text-right">Yes</span>
                <span className="pb-editorial text-[14px] text-white text-right">Discord community</span>
              </div>
              <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-4 py-4 border-b pb-hairline items-baseline max-md:grid-cols-[1fr_1fr] max-md:[&>*:first-child]:col-span-2 max-md:[&>*:first-child]:mb-2">
                <span className="pb-editorial text-[15px] text-white/70">Mobile app</span>
                <span className="pb-editorial text-[14px] text-white/55 text-right">iOS + Android</span>
                <span className="pb-editorial text-[14px] text-white text-right">Web only</span>
              </div>
              <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-4 py-4 border-b pb-hairline items-baseline max-md:grid-cols-[1fr_1fr] max-md:[&>*:first-child]:col-span-2 max-md:[&>*:first-child]:mb-2">
                <span className="pb-editorial text-[15px] text-white/70">GEX heatmap</span>
                <span className="pb-editorial text-[14px] text-white/55 text-right">—</span>
                <span className="pb-editorial text-[14px] text-white text-right">Yes (220 symbols)</span>
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
                <div className="pb-mono text-[11px] tracking-[0.22em] text-white/40 uppercase mb-4">Pick BlackBoxStocks if</div>
                <p className="pb-editorial text-[17px] leading-[1.6] text-white/70">You learn best in a live community — voice rooms, traders calling out setups, mobile-first workflow. You want trading-room energy more than methodology.</p>
              </div>
              <div>
                <div className="pb-mono text-[11px] tracking-[0.22em] text-[#60a5fa] uppercase mb-4">Pick Profit Builders if</div>
                <p className="pb-editorial text-[17px] leading-[1.6] text-white/70">You want pre-graded signals with documented OPRA methodology. You'd rather audit how the data is processed (OPRA tape, sweep detection, Greeks math) than rely on the loudest voice in a room.</p>
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
              <h3 className="pb-editorial text-[20px] md:text-[22px] text-white mb-3 leading-[1.3]">Are BlackBoxStocks and Profit Builders the same price?</h3>
              <p className="pb-editorial text-[16px] leading-[1.6] text-white/65 max-w-[760px]">Effectively yes — $99.97 vs $99. The first month at BlackBoxStocks is $29.95; Profit Builders offers a 7-day free trial then $99/mo.</p>
            </div>
            <div className="py-7 border-b pb-hairline">
              <h3 className="pb-editorial text-[20px] md:text-[22px] text-white mb-3 leading-[1.3]">Does BlackBoxStocks have a cheaper plan?</h3>
              <p className="pb-editorial text-[16px] leading-[1.6] text-white/65 max-w-[760px]">Yes — Options Basic is $59/mo with real-time options flow, algo alerts, institutional charting, and the options heatmap, but no dark pool data or advanced delta/gamma tools. Those sit in the higher Plus and ~$99 Premium tiers, and Premium is the full-feature plan compared here against Profit Builders' $99/mo.</p>
            </div>
            <div className="py-7 border-b pb-hairline">
              <h3 className="pb-editorial text-[20px] md:text-[22px] text-white mb-3 leading-[1.3]">Does BlackBoxStocks publish a documented methodology?</h3>
              <p className="pb-editorial text-[16px] leading-[1.6] text-white/65 max-w-[760px]">No. BlackBoxStocks runs live trading rooms and color-coded alerts but doesn't publish signal outcomes or win rates. Profit Builders publishes every signal at /results.</p>
            </div>
            <div className="py-7 border-b pb-hairline">
              <h3 className="pb-editorial text-[20px] md:text-[22px] text-white mb-3 leading-[1.3]">Does Profit Builders have a mobile app?</h3>
              <p className="pb-editorial text-[16px] leading-[1.6] text-white/65 max-w-[760px]">Not currently. Profit Builders is web-first and routes alerts to Discord and Telegram. BlackBoxStocks has dedicated iOS and Android apps.</p>
            </div>
            <div className="py-7 border-b pb-hairline">
              <h3 className="pb-editorial text-[20px] md:text-[22px] text-white mb-3 leading-[1.3]">Which is better for a beginner?</h3>
              <p className="pb-editorial text-[16px] leading-[1.6] text-white/65 max-w-[760px]">Different paths. BlackBoxStocks' trading rooms walk beginners through real-time decisions. Profit Builders' methodology — Grade A/B engine + public log — gives beginners a clear rule set to follow without depending on a chat room.</p>
            </div>
            <div className="py-7 border-b pb-hairline">
              <h3 className="pb-editorial text-[20px] md:text-[22px] text-white mb-3 leading-[1.3]">Can I use both?</h3>
              <p className="pb-editorial text-[16px] leading-[1.6] text-white/65 max-w-[760px]">Many traders do. They use Profit Builders for graded entries and BlackBoxStocks for community context. The price stack is ~$200/mo combined.</p>
            </div>
          </div>
        </section>

        {/* Verdict + CTA */}
        <section className="py-24 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="pb-mono text-[11px] tracking-[0.28em] text-white/40 uppercase mb-5">Verdict</div>
            <p className="pb-editorial text-[20px] md:text-[22px] leading-[1.55] text-white/85 mb-12 italic">
              Same price tag, different product. If trading-room community is the value you're paying for, BlackBoxStocks is the right call. If you want a graded engine with publicly auditable outcomes, Profit Builders gives you the receipts at the same monthly cost.
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
