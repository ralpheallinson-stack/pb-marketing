import type { Metadata } from "next"
import Link from "next/link"
import Nav from "@/components/Nav"
import Footer from "@/components/Footer"

const CANON = "https://profitbuilders.io/vs/spotgamma"

export const metadata: Metadata = {
  title: 'SpotGamma vs Profit Builders · Gamma or Flow',
  description:
    'SpotGamma grades dealer positioning. Profit Builders grades whale prints. Different lenses on the same tape. SpotGamma Alpha $299 vs Profit Builders Pro Bundle $129.',
  alternates: { canonical: CANON },
  openGraph: {
    title: 'SpotGamma vs Profit Builders · Gamma or Flow',
    description: 'SpotGamma grades dealer positioning. Profit Builders grades whale prints. Different lenses on the same tape. SpotGamma Alpha $299 vs Profit Builders Pro Bundle $129.',
    url: CANON,
    type: "article",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "SpotGamma vs Profit Builders" }],
  },
  twitter: {
    card: "summary_large_image",
    title: 'SpotGamma vs Profit Builders · Gamma or Flow',
    description: 'SpotGamma grades dealer positioning. Profit Builders grades whale prints. Different lenses on the same tape. SpotGamma Alpha $299 vs Profit Builders Pro Bundle $129.',
  },
}

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": 'SpotGamma vs Profit Builders: 2026 Options Flow Scanner Comparison',
  "description": 'SpotGamma grades dealer positioning. Profit Builders grades whale prints. Different lenses on the same tape. SpotGamma Alpha $299 vs Profit Builders Pro Bundle $129.',
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
    { "@type": "ListItem", "position": 3, "name": 'SpotGamma vs Profit Builders', "item": CANON },
  ],
}

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {"@type": "Question", "name": "How does SpotGamma differ from Profit Builders?", "acceptedAnswer": {"@type": "Answer", "text": "SpotGamma grades dealer positioning — where market makers will hedge, where gamma walls form. Profit Builders grades whale prints — the actual large bets institutions place. Different reads on the same tape."}},
    {"@type": "Question", "name": "Is SpotGamma worth $299?", "acceptedAnswer": {"@type": "Answer", "text": "If your edge is macro-gamma positioning, yes. SpotGamma Alpha includes HIRO, Equity Hub, and the deepest dealer-flow models in the category. If you also want live whale prints, you'd add another tool."}},
    {"@type": "Question", "name": "Does SpotGamma offer a free trial?", "acceptedAnswer": {"@type": "Answer", "text": "No free trial on either Essential or Alpha. Profit Builders offers 7 days free on every tier."}},
    {"@type": "Question", "name": "Can I get just GEX from Profit Builders?", "acceptedAnswer": {"@type": "Answer", "text": "Yes — Profit Builders' GEX Heatmap is a $39/mo standalone. That's 60% cheaper than SpotGamma Essential ($99) and covers 220 symbols."}},
    {"@type": "Question", "name": "Do they overlap?", "acceptedAnswer": {"@type": "Answer", "text": "On the GEX/dealer-gamma side, yes. On whale-print scanning, only Profit Builders. The Pro Bundle ($129) covers both at less than half of SpotGamma Alpha."}}
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
              <em className="italic text-white/70">SpotGamma</em> vs Profit Builders.
            </h1>
            <p className="pb-editorial italic text-[20px] md:text-[22px] leading-[1.45] text-white/65 max-w-[720px]">
              Two different lenses on the same tape. SpotGamma reads dealer positioning — where market makers must hedge. Profit Builders reads whale prints — what institutions are actually buying.
            </p>
          </div>
        </section>

        {/* TL;DR strip */}
        <section className="px-6 border-b pb-hairline">
          <div className="max-w-5xl mx-auto py-8 grid grid-cols-3 gap-6 max-md:grid-cols-1 max-md:gap-3">
            <div className="text-center max-md:text-left max-md:flex max-md:items-baseline max-md:justify-between max-md:gap-4 max-md:border-b max-md:pb-hairline max-md:pb-3">
              <div className="pb-mono text-[10px] tracking-[0.22em] text-white/40 uppercase mb-2 max-md:mb-0">SpotGamma Alpha</div>
              <div className="pb-editorial text-[28px] text-white font-normal tracking-[-0.01em] max-md:text-[20px]">$299/mo</div>
            </div>
            <div className="text-center max-md:text-left max-md:flex max-md:items-baseline max-md:justify-between max-md:gap-4 max-md:border-b max-md:pb-hairline max-md:pb-3">
              <div className="pb-mono text-[10px] tracking-[0.22em] text-white/40 uppercase mb-2 max-md:mb-0">Profit Builders Pro</div>
              <div className="pb-editorial text-[28px] text-white font-normal tracking-[-0.01em] max-md:text-[20px]">$129/mo</div>
            </div>
            <div className="text-center max-md:text-left max-md:flex max-md:items-baseline max-md:justify-between max-md:gap-4 max-md:border-b max-md:pb-hairline max-md:pb-3">
              <div className="pb-mono text-[10px] tracking-[0.22em] text-white/40 uppercase mb-2 max-md:mb-0">Saving</div>
              <div className="pb-editorial text-[28px] text-white font-normal tracking-[-0.01em] max-md:text-[20px]">$2,040/year</div>
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
                <span className="text-right">SpotGamma</span>
                <span className="text-right text-[#60a5fa]">Profit Builders</span>
              </div>
              <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-4 py-4 border-b pb-hairline items-baseline max-md:grid-cols-[1fr_1fr] max-md:[&>*:first-child]:col-span-2 max-md:[&>*:first-child]:mb-2">
                <span className="pb-editorial text-[15px] text-white/70">Top tier price</span>
                <span className="pb-editorial text-[14px] text-white/55 text-right">$299/mo (Alpha)</span>
                <span className="pb-editorial text-[14px] text-white text-right">$129/mo (Pro Bundle)</span>
              </div>
              <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-4 py-4 border-b pb-hairline items-baseline max-md:grid-cols-[1fr_1fr] max-md:[&>*:first-child]:col-span-2 max-md:[&>*:first-child]:mb-2">
                <span className="pb-editorial text-[15px] text-white/70">Entry tier price</span>
                <span className="pb-editorial text-[14px] text-white/55 text-right">$99/mo (Essential)</span>
                <span className="pb-editorial text-[14px] text-white text-right">$39/mo (GEX standalone)</span>
              </div>
              <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-4 py-4 border-b pb-hairline items-baseline max-md:grid-cols-[1fr_1fr] max-md:[&>*:first-child]:col-span-2 max-md:[&>*:first-child]:mb-2">
                <span className="pb-editorial text-[15px] text-white/70">Free trial</span>
                <span className="pb-editorial text-[14px] text-white/55 text-right">—</span>
                <span className="pb-editorial text-[14px] text-white text-right">7-day full-access</span>
              </div>
              <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-4 py-4 border-b pb-hairline items-baseline max-md:grid-cols-[1fr_1fr] max-md:[&>*:first-child]:col-span-2 max-md:[&>*:first-child]:mb-2">
                <span className="pb-editorial text-[15px] text-white/70">Dealer gamma / GEX modeling</span>
                <span className="pb-editorial text-[14px] text-white/55 text-right">Yes (HIRO, Equity Hub)</span>
                <span className="pb-editorial text-[14px] text-white text-right">Yes (220 symbols)</span>
              </div>
              <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-4 py-4 border-b pb-hairline items-baseline max-md:grid-cols-[1fr_1fr] max-md:[&>*:first-child]:col-span-2 max-md:[&>*:first-child]:mb-2">
                <span className="pb-editorial text-[15px] text-white/70">Whale prints / live flow</span>
                <span className="pb-editorial text-[14px] text-white/55 text-right">—</span>
                <span className="pb-editorial text-[14px] text-white text-right">Real-time flow + grading</span>
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
                <div className="pb-mono text-[11px] tracking-[0.22em] text-white/40 uppercase mb-4">Pick SpotGamma if</div>
                <p className="pb-editorial text-[17px] leading-[1.6] text-white/70">You're macro-positioning around dealer flow. You care about gamma walls, vol regime, charm/vanna effects, and you want HIRO's intraday models. SpotGamma is the deepest dedicated GEX product.</p>
              </div>
              <div>
                <div className="pb-mono text-[11px] tracking-[0.22em] text-[#60a5fa] uppercase mb-4">Pick Profit Builders if</div>
                <p className="pb-editorial text-[17px] leading-[1.6] text-white/70">You want both gamma context AND the actual whale prints — graded — for half the price of SpotGamma Alpha. Or you only need GEX, in which case Profit Builders' $39 standalone undercuts SpotGamma Essential by 60%.</p>
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
              <h3 className="pb-editorial text-[20px] md:text-[22px] text-white mb-3 leading-[1.3]">How does SpotGamma differ from Profit Builders?</h3>
              <p className="pb-editorial text-[16px] leading-[1.6] text-white/65 max-w-[760px]">SpotGamma grades dealer positioning — where market makers will hedge, where gamma walls form. Profit Builders grades whale prints — the actual large bets institutions place. Different reads on the same tape.</p>
            </div>
            <div className="py-7 border-b pb-hairline">
              <h3 className="pb-editorial text-[20px] md:text-[22px] text-white mb-3 leading-[1.3]">Is SpotGamma worth $299?</h3>
              <p className="pb-editorial text-[16px] leading-[1.6] text-white/65 max-w-[760px]">If your edge is macro-gamma positioning, yes. SpotGamma Alpha includes HIRO, Equity Hub, and the deepest dealer-flow models in the category. If you also want live whale prints, you'd add another tool.</p>
            </div>
            <div className="py-7 border-b pb-hairline">
              <h3 className="pb-editorial text-[20px] md:text-[22px] text-white mb-3 leading-[1.3]">Does SpotGamma offer a free trial?</h3>
              <p className="pb-editorial text-[16px] leading-[1.6] text-white/65 max-w-[760px]">No free trial on either Essential or Alpha. Profit Builders offers 7 days free on every tier.</p>
            </div>
            <div className="py-7 border-b pb-hairline">
              <h3 className="pb-editorial text-[20px] md:text-[22px] text-white mb-3 leading-[1.3]">Can I get just GEX from Profit Builders?</h3>
              <p className="pb-editorial text-[16px] leading-[1.6] text-white/65 max-w-[760px]">Yes — Profit Builders' GEX Heatmap is a $39/mo standalone. That's 60% cheaper than SpotGamma Essential ($99) and covers 220 symbols.</p>
            </div>
            <div className="py-7 border-b pb-hairline">
              <h3 className="pb-editorial text-[20px] md:text-[22px] text-white mb-3 leading-[1.3]">Do they overlap?</h3>
              <p className="pb-editorial text-[16px] leading-[1.6] text-white/65 max-w-[760px]">On the GEX/dealer-gamma side, yes. On whale-print scanning, only Profit Builders. The Pro Bundle ($129) covers both at less than half of SpotGamma Alpha.</p>
            </div>
          </div>
        </section>

        {/* Verdict + CTA */}
        <section className="py-24 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="pb-mono text-[11px] tracking-[0.28em] text-white/40 uppercase mb-5">Verdict</div>
            <p className="pb-editorial text-[20px] md:text-[22px] leading-[1.55] text-white/85 mb-12 italic">
              Different jobs at different prices. SpotGamma Alpha is the macro-gamma tool of record at $299. Profit Builders' Pro Bundle covers gamma + live whale prints + grading + a public log for $129. If you want both lenses, the math leans hard toward Profit Builders.
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
