import type { Metadata } from "next"
import Link from "next/link"
import Nav from "@/components/Nav"
import Footer from "@/components/Footer"

const CANON = "https://profitbuilders.io/vs/barchart"

export const metadata: Metadata = {
  title: 'Barchart vs Profit Builders · 2026 Options Flow Comparison',
  description:
    'Honest 2026 comparison. Barchart Pro at $199.95/mo bundles flow into a giant platform. Profit Builders at $99/mo focuses on graded signals with a documented OPRA methodology.',
  alternates: { canonical: CANON },
  openGraph: {
    title: 'Barchart vs Profit Builders · 2026 Options Flow Comparison',
    description: 'Honest 2026 comparison. Barchart Pro at $199.95/mo bundles flow into a giant platform. Profit Builders at $99/mo focuses on graded signals with a documented OPRA methodology.',
    url: CANON,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: 'Barchart vs Profit Builders · 2026 Options Flow Comparison',
    description: 'Honest 2026 comparison. Barchart Pro at $199.95/mo bundles flow into a giant platform. Profit Builders at $99/mo focuses on graded signals with a documented OPRA methodology.',
  },
}

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": 'Barchart vs Profit Builders: 2026 Options Flow Scanner Comparison',
  "description": 'Honest 2026 comparison. Barchart Pro at $199.95/mo bundles flow into a giant platform. Profit Builders at $99/mo focuses on graded signals with a documented OPRA methodology.',
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
    { "@type": "ListItem", "position": 3, "name": 'Barchart vs Profit Builders', "item": CANON },
  ],
}

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {"@type": "Question", "name": "Is Barchart Pro worth $199.95/mo?", "acceptedAnswer": {"@type": "Answer", "text": "It depends on whether you need broad market coverage. Barchart Pro bundles options flow with futures, equities, charting, and news. If you'd otherwise pay for those separately, the math works. If you only want options flow, you're paying ~$100/mo for features outside your workflow."}},
    {"@type": "Question", "name": "Does Barchart publish signal outcomes?", "acceptedAnswer": {"@type": "Answer", "text": "No. Barchart provides flow data but doesn't grade signals or publish a documented methodology. Profit Builders publishes every Grade A/B signal at /results — currently documented OPRA processing methodology."}},
    {"@type": "Question", "name": "Which is cheaper for pure options flow?", "acceptedAnswer": {"@type": "Answer", "text": "Profit Builders at $99/mo. Barchart's flow features at the Premier tier ($39.95) are basic; you need Pro ($199.95) for serious options analysis."}},
    {"@type": "Question", "name": "Does Profit Builders cover futures or stocks like Barchart does?", "acceptedAnswer": {"@type": "Answer", "text": "No. Profit Builders does options flow specifically. If you need futures + equity coverage, Barchart is the broader platform."}},
    {"@type": "Question", "name": "Can I trial both?", "acceptedAnswer": {"@type": "Answer", "text": "Profit Builders offers a 7-day free trial with full access. Barchart's trial is paid (30 days for $7.99) and converts to monthly billing."}}
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
              <span className="pb-mono text-[11px] text-[#3D4D63]">Updated Apr 2026</span>
            </div>
            <Link href="/vs" className="pb-mono text-[11px] text-[#60a5fa] tracking-[0.18em] uppercase hover:text-white transition-colors mb-6 inline-block">← All comparisons</Link>
            <h1 className="pb-editorial text-[40px] sm:text-[56px] md:text-[68px] leading-[1.04] tracking-[-0.025em] text-white mb-6 mt-2">
              <em className="italic text-white/70">Barchart</em> vs Profit Builders.
            </h1>
            <p className="pb-editorial italic text-[20px] md:text-[22px] leading-[1.45] text-white/65 max-w-[720px]">
              Two products at very different prices. Barchart bundles options flow into a quotes-and-charts platform. Profit Builders focuses on graded signals with a documented methodology.
            </p>
          </div>
        </section>

        {/* TL;DR strip */}
        <section className="px-6 border-b pb-hairline">
          <div className="max-w-5xl mx-auto py-8 grid grid-cols-3 gap-6 max-md:grid-cols-1 max-md:gap-3">
            <div className="text-center max-md:text-left max-md:flex max-md:items-baseline max-md:justify-between max-md:gap-4 max-md:border-b max-md:pb-hairline max-md:pb-3">
              <div className="pb-mono text-[10px] tracking-[0.22em] text-white/40 uppercase mb-2 max-md:mb-0">Barchart Pro</div>
              <div className="pb-editorial text-[28px] text-white font-normal tracking-[-0.01em] max-md:text-[20px]">$199.95/mo</div>
            </div>
            <div className="text-center max-md:text-left max-md:flex max-md:items-baseline max-md:justify-between max-md:gap-4 max-md:border-b max-md:pb-hairline max-md:pb-3">
              <div className="pb-mono text-[10px] tracking-[0.22em] text-white/40 uppercase mb-2 max-md:mb-0">Profit Builders</div>
              <div className="pb-editorial text-[28px] text-white font-normal tracking-[-0.01em] max-md:text-[20px]">$99/mo</div>
            </div>
            <div className="text-center max-md:text-left max-md:flex max-md:items-baseline max-md:justify-between max-md:gap-4 max-md:border-b max-md:pb-hairline max-md:pb-3">
              <div className="pb-mono text-[10px] tracking-[0.22em] text-white/40 uppercase mb-2 max-md:mb-0">Saving</div>
              <div className="pb-editorial text-[28px] text-white font-normal tracking-[-0.01em] max-md:text-[20px]">$1,212/year</div>
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
                <span className="pb-editorial text-[15px] text-white/70">Price (real flow tier)</span>
                <span className="pb-editorial text-[14px] text-white/55 text-right">$199.95/mo</span>
                <span className="pb-editorial text-[14px] text-white text-right">$99/mo</span>
              </div>
              <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-4 py-4 border-b pb-hairline items-baseline max-md:grid-cols-[1fr_1fr] max-md:[&>*:first-child]:col-span-2 max-md:[&>*:first-child]:mb-2">
                <span className="pb-editorial text-[15px] text-white/70">Free trial</span>
                <span className="pb-editorial text-[14px] text-white/55 text-right">30-day for $7.99</span>
                <span className="pb-editorial text-[14px] text-white text-right">7-day full-access</span>
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

        {/* When to use which */}
        <section className="py-20 px-6 border-b pb-hairline">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-baseline gap-3 mb-10">
              <span className="pb-editorial italic text-[#60a5fa] text-[36px] leading-none">II.</span>
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

        {/* FAQ */}
        <section className="py-20 px-6 border-b pb-hairline">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-baseline gap-3 mb-10">
              <span className="pb-editorial italic text-[#60a5fa] text-[36px] leading-none">III.</span>
              <h2 className="pb-editorial text-[28px] md:text-[34px] font-normal tracking-[-0.015em] text-white">Questions.</h2>
            </div>
            <div className="py-7 border-b pb-hairline">
              <h3 className="pb-editorial text-[20px] md:text-[22px] text-white mb-3 leading-[1.3]">Is Barchart Pro worth $199.95/mo?</h3>
              <p className="pb-editorial text-[16px] leading-[1.6] text-white/65 max-w-[760px]">It depends on whether you need broad market coverage. Barchart Pro bundles options flow with futures, equities, charting, and news. If you'd otherwise pay for those separately, the math works. If you only want options flow, you're paying ~$100/mo for features outside your workflow.</p>
            </div>
            <div className="py-7 border-b pb-hairline">
              <h3 className="pb-editorial text-[20px] md:text-[22px] text-white mb-3 leading-[1.3]">Does Barchart publish signal outcomes?</h3>
              <p className="pb-editorial text-[16px] leading-[1.6] text-white/65 max-w-[760px]">No. Barchart provides flow data but doesn't grade signals or publish a documented methodology. Profit Builders publishes every Grade A/B signal at /results — currently documented OPRA processing methodology.</p>
            </div>
            <div className="py-7 border-b pb-hairline">
              <h3 className="pb-editorial text-[20px] md:text-[22px] text-white mb-3 leading-[1.3]">Which is cheaper for pure options flow?</h3>
              <p className="pb-editorial text-[16px] leading-[1.6] text-white/65 max-w-[760px]">Profit Builders at $99/mo. Barchart's flow features at the Premier tier ($39.95) are basic; you need Pro ($199.95) for serious options analysis.</p>
            </div>
            <div className="py-7 border-b pb-hairline">
              <h3 className="pb-editorial text-[20px] md:text-[22px] text-white mb-3 leading-[1.3]">Does Profit Builders cover futures or stocks like Barchart does?</h3>
              <p className="pb-editorial text-[16px] leading-[1.6] text-white/65 max-w-[760px]">No. Profit Builders does options flow specifically. If you need futures + equity coverage, Barchart is the broader platform.</p>
            </div>
            <div className="py-7 border-b pb-hairline">
              <h3 className="pb-editorial text-[20px] md:text-[22px] text-white mb-3 leading-[1.3]">Can I trial both?</h3>
              <p className="pb-editorial text-[16px] leading-[1.6] text-white/65 max-w-[760px]">Profit Builders offers a 7-day free trial with full access. Barchart's trial is paid (30 days for $7.99) and converts to monthly billing.</p>
            </div>
          </div>
        </section>

        {/* Verdict + CTA */}
        <section className="py-24 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="pb-mono text-[11px] tracking-[0.28em] text-white/40 uppercase mb-5">Verdict</div>
            <p className="pb-editorial text-[20px] md:text-[22px] leading-[1.55] text-white/85 mb-12 italic">
              Different products at different prices. If you need a one-platform-does-everything subscription, Barchart Pro is defensible at $199.95. If you want focused options flow with grading and verifiable outcomes, Profit Builders is half the price and built for that exact job.
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
