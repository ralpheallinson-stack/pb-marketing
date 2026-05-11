import type { Metadata } from "next"
import Link from "next/link"
import Nav from "@/components/Nav"
import Footer from "@/components/Footer"

const CANON = "https://profitbuilders.io/vs/cheddar-flow"

export const metadata: Metadata = {
  title: "Cheddar Flow vs Profit Builders · 2026 Options Flow Comparison",
  description:
    "Cheddar Flow vs Profit Builders for 2026 — both $99/mo Pro. Cheddar Flow gates dark-pool + AI behind Pro. PB includes everything plus documented OPRA methodology.",
  alternates: { canonical: CANON },
  openGraph: {
    title: "Cheddar Flow vs Profit Builders · Options Flow Comparison",
    description:
      "$99 vs $99. Who actually gives you more? Feature gating exposed. Documented methodology inside.",
    url: CANON,
    type: "article",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Cheddar Flow vs Profit Builders" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cheddar Flow vs Profit Builders · Options Flow Comparison",
    description:
      "Same $99/mo. Cheddar Flow gates dark pool + AI behind Pro. Profit Builders includes everything with a documented OPRA methodology.",
  },
}

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Cheddar Flow vs Profit Builders: 2026 Options Flow Scanner Comparison",
  "description": "Side-by-side comparison of Cheddar Flow and Profit Builders across pricing, feature access, data methodology, alerts, and filtering.",
  "author": { "@type": "Organization", "name": "Profit Builders", "url": "https://profitbuilders.io" },
  "publisher": { "@type": "Organization", "name": "Profit Builders", "logo": { "@type": "ImageObject", "url": "https://profitbuilders.io/images/pb-logo.png" } },
  "datePublished": "2026-04-22T09:00:00-04:00",
  "dateModified": "2026-04-26T10:00:00-04:00",
  "mainEntityOfPage": { "@type": "WebPage", "@id": CANON },
}

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://profitbuilders.io" },
    { "@type": "ListItem", "position": 2, "name": "Compare", "item": "https://profitbuilders.io/vs" },
    { "@type": "ListItem", "position": 3, "name": "Cheddar Flow vs Profit Builders", "item": CANON },
  ],
}

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is Cheddar Flow the same price as Profit Builders?",
      "acceptedAnswer": { "@type": "Answer", "text": "At the Pro tier, yes — both are $99/mo. Cheddar Flow's cheaper Standard tier is $85/mo but excludes dark pool data and AI Power Alerts. Profit Builders' $99/mo Flow Scanner includes everything." },
    },
    {
      "@type": "Question",
      "name": "What does Cheddar Flow gate behind its Pro tier?",
      "acceptedAnswer": { "@type": "Answer", "text": "Dark pool data and AI Power Alerts are Pro-tier only on Cheddar Flow. The $85/mo Standard tier gives you flow, charting, and unusual volume but not the two features most comparison-shoppers are evaluating the platform for." },
    },
    {
      "@type": "Question",
      "name": "Does Cheddar Flow publish a documented methodology?",
      "acceptedAnswer": { "@type": "Answer", "text": "No. Cheddar Flow offers 20+ filter options and AI-generated alerts but doesn't publish signal outcomes or win rates publicly. Profit Builders publishes its full data methodology at profitbuilders.io/results — sweep detection per CBOE Rule 6.11, OPRA condition codes, Black-Scholes-Merton Greeks, NBBO aggression classification." },
    },
    {
      "@type": "Question",
      "name": "How does Cheddar Flow's AI Power Alerts compare to Grade A signals?",
      "acceptedAnswer": { "@type": "Answer", "text": "They're different approaches. Cheddar Flow's AI Power Alerts apply machine learning to flag setups in real time, without publishing what makes a signal qualify or the system's hit rate. Profit Builders' Grade A signals run every print through 9 documented filters — closing-position detection, direction classification, delta screening, spread detection, market-maker identification — and publish the outcome of every graded signal. Transparent methodology, transparent results." },
    },
    {
      "@type": "Question",
      "name": "What's Cheddar Flow's annual pricing?",
      "acceptedAnswer": { "@type": "Answer", "text": "Cheddar Flow offers Pro features at $75/mo ($900/year) when billed annually — a 25% discount over monthly. Profit Builders is monthly-only at $99/mo. If you're confident enough to commit annually, Cheddar Flow's yearly plan is cheaper than Profit Builders' monthly subscription." },
    },
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

export default function VsCheddarFlow() {
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
        .pb-display { font-family: "Bricolage Grotesque", "Plus Jakarta Sans", system-ui, sans-serif; font-feature-settings: "ss01","ss02"; }
        .pb-num { font-family: "Bricolage Grotesque", "Plus Jakarta Sans", system-ui, sans-serif; font-feature-settings: "tnum"; letter-spacing: -0.04em; }
        .pb-editorial { font-family: Georgia, "Times New Roman", serif; }
        .pb-win { color: #34D399; }
        .pb-lose { color: #7A8BA8; }
        .pb-callout { background: linear-gradient(135deg, rgba(52,211,153,0.05), rgba(52,211,153,0.01)); border-left: 2px solid #34D399; }
        .pb-section-num { font-family: "IBM Plex Mono", monospace; font-size: 10px; letter-spacing: 0.2em; color: #3D4D63; text-transform: uppercase; }
        .pb-link { border-bottom: 1px solid rgba(52,211,153,0.4); transition: border-color 160ms ease; }
        .pb-link:hover { border-color: #34D399; }
        @keyframes pbRise { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .pb-rise { animation: pbRise 700ms cubic-bezier(0.16,1,0.3,1) both; }
      `}</style>

      <Nav />

      <main className="pb-grain text-[#E8EDF5] min-h-screen">
        {/* HERO */}
        <section className="pt-32 pb-24 px-6 border-b pb-hairline">
          <div className="max-w-6xl mx-auto grid md:grid-cols-12 gap-x-8 gap-y-10 pb-rise">
            <div className="md:col-span-8">
              <div className="flex items-baseline gap-3 mb-6">
                <span className="pb-section-num">01 / 07</span>
                <span className="pb-rule h-px flex-1" />
                <span className="pb-mono text-[11px] text-[#3D4D63]">Updated Apr 2026</span>
              </div>
              <h1 className="pb-editorial text-[44px] sm:text-[60px] md:text-[68px] leading-[1.02] tracking-[-0.025em] text-white mb-8">
                Cheddar Flow <span className="text-[#3D4D63]">vs</span> Profit Builders.
              </h1>
              <p className="text-[18px] md:text-[19px] leading-[1.55] text-[#A9B4C6] max-w-xl">
                Same <span className="pb-mono text-white">$99/mo</span> Pro-tier price. Different philosophies. Cheddar Flow gates dark pool + AI alerts behind its Pro plan. Profit Builders includes everything at one price and publishes its full data methodology to back it up.
              </p>
            </div>
          </div>
        </section>

        {/* VERDICT */}
        <section className="py-20 px-6 border-b pb-hairline">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-baseline gap-3 mb-12">
              <span className="pb-section-num">02 / 07</span>
              <span className="pb-rule h-px flex-1" />
              <span className="pb-mono text-[11px] text-[#3D4D63]">Verdict</span>
            </div>
            <div className="grid md:grid-cols-12 gap-x-8 gap-y-12">
              <div className="md:col-span-5">
                <h2 className="pb-editorial text-[32px] md:text-[40px] leading-[1.1] tracking-[-0.02em] text-white mb-4">
                  Pick Cheddar Flow.
                </h2>
                <p className="text-[16px] leading-[1.6] text-[#A9B4C6] mb-4">
                  If you want 20+ customizable filter options to build your own detection rules, AI-assisted alerts for setup scanning, and the option to save 25% with an annual commitment you're confident in.
                </p>
                <div className="pb-mono text-[11px] text-[#7A8BA8] uppercase tracking-wider">
                  $85–99/mo · $75/mo annual · Filter-heavy
                </div>
              </div>
              <div className="md:col-span-2 flex md:justify-center items-start md:items-center">
                <div className="pb-display text-[#3D4D63] text-[48px] font-light leading-none">/</div>
              </div>
              <div className="md:col-span-5">
                <h2 className="pb-editorial text-[32px] md:text-[40px] leading-[1.1] tracking-[-0.02em] text-white mb-4">
                  Pick Profit Builders.
                </h2>
                <p className="text-[16px] leading-[1.6] text-[#A9B4C6] mb-4">
                  If you want every feature included at one flat price, a documented data methodology, and CBOE-compliant sweep detection you can audit before you pay.
                </p>
                <div className="pb-mono text-[11px] text-[#34D399] uppercase tracking-wider">
                  $99/mo · Graded signals · Public methodology
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MATRIX */}
        <section className="py-20 px-6 border-b pb-hairline">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-baseline gap-3 mb-12">
              <span className="pb-section-num">03 / 07</span>
              <span className="pb-rule h-px flex-1" />
              <span className="pb-mono text-[11px] text-[#3D4D63]">Side-by-side</span>
            </div>
            <h2 className="pb-editorial text-[36px] md:text-[44px] leading-[1.1] tracking-[-0.02em] text-white mb-10 max-w-3xl">
              Twelve dimensions that actually matter.
            </h2>
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-[#252E3D]">
                    <th className="text-left py-3 pr-4 pb-mono text-[11px] uppercase tracking-wider text-[#3D4D63] font-medium">Dimension</th>
                    <th className="text-left py-3 px-4 pb-mono text-[11px] uppercase tracking-wider text-[#A9B4C6] font-medium w-[34%]">Cheddar Flow</th>
                    <th className="text-left py-3 px-4 pb-mono text-[11px] uppercase tracking-wider text-[#34D399] font-medium w-[34%]">Profit Builders</th>
                  </tr>
                </thead>
                <tbody>
                  <MRow label="Pro-tier monthly" a={<span className="pb-mono">$99/mo</span>} b={<span className="pb-mono text-white">$99/mo</span>} />
                  <MRow label="Standard tier" a={<span className="pb-mono">$85/mo (limited)</span>} b={<span className="pb-mono pb-win">No tier-gating</span>} win />
                  <MRow label="Dark pool data" a={<span className="pb-lose">Pro tier only</span>} b={<span className="pb-win">Included in flow</span>} win />
                  <MRow label="AI / Power Alerts" a={<span className="pb-lose">Pro tier only</span>} b={<span className="pb-win">Grade A is the signal</span>} />
                  <MRow label="Annual discount" a={<span className="text-white">$75/mo yearly (-25%)</span>} b={<span className="pb-lose">Monthly only</span>} />
                  <MRow label="Free trial" a="7 days, card required" b="7 days, card required" />
                  <MRow label="Conviction grading" a={<span className="pb-lose">Filters, no grade</span>} b={<span className="pb-win">Grade A / B / PASS, documented institutional-flow filter, curation toggle</span>} win />
                  <MRow label="Public methodology" a={<span className="pb-lose">Not published</span>} b={<span className="pb-win">Documented methodology</span>} win />
                  <MRow label="Data methodology" a={<span className="pb-lose">Not published</span>} b={<span className="pb-win">Documented</span>} win />
                  <MRow label="Filter customization" a={<span className="text-white">20+ filters</span>} b="Grade-based, pre-filtered" />
                  <MRow label="Telegram alerts" a={<span className="pb-lose">Limited</span>} b={<span className="pb-win">Native, mobile-first</span>} win />
                  <MRow label="GEX heatmap" a={<span className="pb-lose">No</span>} b={<span className="pb-win">220 symbols</span>} win />
                </tbody>
              </table>
            </div>
            <p className="pb-mono text-[10px] text-[#3D4D63] mt-6 uppercase tracking-wider">
              Pricing and features verified April 2026 from each vendor's public documentation.
            </p>
          </div>
        </section>

        {/* WHERE CF WINS */}
        <section className="py-20 px-6 border-b pb-hairline">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-baseline gap-3 mb-12">
              <span className="pb-section-num">04 / 07</span>
              <span className="pb-rule h-px flex-1" />
              <span className="pb-mono text-[11px] text-[#3D4D63]">Honest</span>
            </div>
            <div className="grid md:grid-cols-12 gap-x-8 gap-y-16">
              <div className="md:col-span-4">
                <h2 className="pb-editorial text-[32px] md:text-[40px] leading-[1.1] tracking-[-0.02em] text-white mb-4">
                  Where Cheddar Flow is stronger.
                </h2>
                <p className="text-[15px] leading-[1.6] text-[#7A8BA8]">
                  Different product philosophy, legitimate wins. Here's where Cheddar Flow earns its price.
                </p>
              </div>
              <div className="md:col-span-8 space-y-10">
                <Pro n="01" title="20+ customizable filters" body="Cheddar Flow lets you build your own signal detection by layering filter criteria. If you already have a trading system with specific flow characteristics you want to isolate — certain vol/OI ratios, specific DTE ranges, particular sector combinations — Cheddar Flow's filter depth gives you that control directly. Profit Builders is the inverse philosophy: the platform decides what's a Grade A signal on your behalf." />
                <Pro n="02" title="Sub-1-second latency" body="Cheddar Flow documents sub-1-second delivery on most flow trades. Profit Builders delivers within 1–3 seconds. In practice these are comparable — the tape feed itself is the bottleneck — but if single-second latency is part of your scoring criteria, Cheddar Flow has the tighter number on paper." />
                <Pro n="03" title="Annual discount option" body="Cheddar Flow's $75/mo yearly plan (billed as $900 upfront) saves 25% vs monthly. Profit Builders is monthly-only. If you're confident enough to commit for a year and want the lowest effective monthly rate, Cheddar Flow's annual plan is actually cheaper than Profit Builders' monthly price." />
                <Pro n="04" title="Standard tier for lighter needs" body="If you don't need dark pool data or AI alerts, Cheddar Flow's $85/mo Standard tier gives you flow, charting, and unusual volume at a lower price point. Profit Builders doesn't have a sub-$99 tier — it's a one-size product by design." />
              </div>
            </div>
          </div>
        </section>

        {/* WHERE PB WINS */}
        <section className="py-20 px-6 border-b pb-hairline bg-[#0B0E13]">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-baseline gap-3 mb-12">
              <span className="pb-section-num" style={{ color: "#34D399" }}>05 / 07</span>
              <span className="pb-rule h-px flex-1" />
              <span className="pb-mono text-[11px] text-[#34D399]">Where we win</span>
            </div>
            <div className="grid md:grid-cols-12 gap-x-8 gap-y-16">
              <div className="md:col-span-4">
                <h2 className="pb-editorial text-[32px] md:text-[40px] leading-[1.1] tracking-[-0.02em] text-white mb-4">
                  Where Profit Builders is stronger.
                </h2>
                <p className="text-[15px] leading-[1.6] text-[#A9B4C6]">
                  At the same monthly price, these are the categories that determine which tool pays off in practice.
                </p>
              </div>
              <div className="md:col-span-8 space-y-10">
                <Pro win n="01" title="No tier-gating at $99"
                  body="Cheddar Flow's $99/mo Pro tier is required to unlock dark pool data and AI Power Alerts. Its $85 Standard tier gives you everything except those two features. Profit Builders is $99 flat — you get flow, dark pool context, conviction grading, Telegram alerts, GEX heatmap, and accumulation detection. Same dollar, everything included." />
                <Pro win n="02" title="Documented grading vs opaque AI"
                  body="Cheddar Flow's AI Power Alerts surface setups via machine learning, without publishing the system's criteria or its historical hit rate. Profit Builders grades every signal against 9 documented filters — closing-position detection, direction classification, delta screening, spread detection, market-maker identification — and publishes the win rate per grade. When the AI label and the grade both mean 'actionable setup,' only one of them tells you why and how often it's right." />
                <Pro win n="03" title="Public methodology of OPRA-grade flow"
                  body="Profit Builders publishes its full data processing methodology at profitbuilders.io/results — sweep detection per CBOE Rule 6.11, OPRA condition codes, Black-Scholes-Merton Greeks, NBBO aggression classification. Cheddar Flow does not publish a methodology page. If you're paying $99 for a flow scanner, you should be able to audit how the data is processed before you pay." />
                <Pro win n="04" title="RAPID badges on accumulation patterns"
                  body="When one contract gets hit 10+ times in quick succession with aggressive, similar-sized prints, that's the signature of a large player slicing a position to hide size. Profit Builders flags it with a RAPID badge and surfaces the full accumulation context. Cheddar Flow's filters can be configured to spot this manually, but there's no dedicated pattern label — you build the detection rule yourself." />
                <Pro win n="05" title="Telegram-first alerting, not Discord-first"
                  body="Every signal ships to Telegram natively with full context — ticker, strike, expiry, premium, Greeks, grade, sector. Cheddar Flow's mobile alerting is thinner; its primary delivery surfaces are web and Discord. If your trading workflow lives on your phone rather than in a Discord channel, Profit Builders is more ergonomic." />
                <Pro win n="06" title="GEX heatmap across 220 symbols"
                  body="Gamma exposure visualization, included at $39/mo standalone or bundled at $129 Pro. Useful for understanding where market-maker positioning pins or accelerates a move. Cheddar Flow doesn't offer a dedicated GEX tool — you'd need to pair it with a separate gamma-focused service." />
              </div>
            </div>
          </div>
        </section>

        {/* DEEP DIVES */}
        <section className="py-20 px-6 border-b pb-hairline">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-baseline gap-3 mb-12">
              <span className="pb-section-num">06 / 07</span>
              <span className="pb-rule h-px flex-1" />
              <span className="pb-mono text-[11px] text-[#3D4D63]">Deep dive</span>
            </div>
            <div className="grid md:grid-cols-12 gap-x-8">
              <aside className="md:col-span-3 md:sticky md:top-24 self-start mb-8 md:mb-0">
                <div className="pb-mono text-[10px] uppercase tracking-[0.18em] text-[#3D4D63] mb-4">In this section</div>
                <nav className="space-y-3">
                  <a href="#philosophy" className="block text-[14px] text-[#A9B4C6] hover:text-white transition-colors">Two philosophies</a>
                  <a href="#gating" className="block text-[14px] text-[#A9B4C6] hover:text-white transition-colors">The Pro-tier trap</a>
                  <a href="#filters-vs-grades" className="block text-[14px] text-[#A9B4C6] hover:text-white transition-colors">Filters vs grades</a>
                  <a href="#who" className="block text-[14px] text-[#A9B4C6] hover:text-white transition-colors">Who each is for</a>
                </nav>
              </aside>
              <div className="md:col-span-9 space-y-16">
                <Dive id="philosophy" heading="Two philosophies of the same job">
                  Both platforms ingest the US options tape in real time, and both default to surfacing the full institutional flow. The split is what happens on top. Cheddar Flow hands you <em className="pb-editorial text-white">tools</em> — 20+ filters, AI alerts, filter presets — and expects you to build your own detection system. Profit Builders layers <em className="pb-editorial text-white">documented conviction grading</em> on top of the same full coverage — Grade A means the engine&apos;s nine filters all agree, Grade B means most do, PASS is everything else, all visible by default with a one-click curation toggle to restrict to A/B if you prefer the high-conviction-only view. Neither approach is objectively better. They target different users.
                </Dive>
                <Dive id="gating" heading="Feature gating at the same top price">
                  Cheddar Flow runs two tiers. Standard at <span className="pb-mono text-white">$85/mo</span> gives you flow, charting, unusual volume, and filters. Pro at <span className="pb-mono text-white">$99/mo</span> adds dark pool data and AI Power Alerts — the two features most shoppers are specifically evaluating the platform for. Profit Builders has one tier at <span className="pb-mono text-white">$99/mo</span> that includes everything, plus a separate optional <span className="pb-mono text-white">$39/mo</span> GEX heatmap. If you're already paying $99, the question is what that $99 actually unlocks. The honest answer: more, on Profit Builders.
                </Dive>
                <Dive id="filters-vs-grades" heading="Twenty filters vs one grade">
                  Cheddar Flow's 20+ filters let you slice the flow by whatever characteristic you care about. That flexibility is real — and it's also work. Every filter you add is a hypothesis you have to test and maintain. Profit Builders runs nine specific filters documented publicly (closing-position detection, direction classification, delta screening, spread detection, market-maker ID, and the rest) and collapses them into a single output: Grade A, Grade B, or filtered out. You get fewer knobs but a documented methodology you can audit before you pay. The tradeoff is flexibility against evidence.
                </Dive>
                <Dive id="who" heading="Who each platform is actually for">
                  Cheddar Flow suits traders who already have an edge they want to replicate via filter configuration, who value the $75/mo annual discount, and who don't specifically need a documented methodology to make a decision. Profit Builders suits traders who prefer pre-vetted signals over self-configured filters, who want to audit a platform's hit rate before paying, whose workflow includes Telegram, and who'd rather pay $99 and get everything than price-shop between a $85 Standard and $99 Pro just to access two flagship features.
                </Dive>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 px-6 border-b pb-hairline">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-baseline gap-3 mb-12">
              <span className="pb-section-num">07 / 07</span>
              <span className="pb-rule h-px flex-1" />
              <span className="pb-mono text-[11px] text-[#3D4D63]">Questions</span>
            </div>
            <h2 className="pb-editorial text-[36px] md:text-[44px] leading-[1.1] tracking-[-0.02em] text-white mb-12 max-w-3xl">
              The questions people actually ask.
            </h2>
            <div className="grid md:grid-cols-12 gap-x-8">
              <div className="md:col-span-12 space-y-10 max-w-3xl">
                <Faq q="Is Cheddar Flow the same price as Profit Builders?">
                  At the Pro tier, yes — both are <span className="pb-mono text-white">$99/mo</span>. Cheddar Flow's cheaper <span className="pb-mono text-white">$85/mo</span> Standard tier excludes dark pool data and AI Power Alerts. Profit Builders' $99/mo Flow Scanner includes every feature with no tier gating.
                </Faq>
                <Faq q="What does Cheddar Flow gate behind Pro?">
                  Dark pool data and AI Power Alerts. Both features are Pro-only. The $85/mo Standard tier gives you flow, charting, and unusual volume but not the two features most comparison-shoppers are specifically evaluating the platform to get. Profit Builders gates nothing at $99.
                </Faq>
                <Faq q="Does Cheddar Flow publish a documented methodology?">
                  No. Cheddar Flow offers 20+ filter options and AI-generated alerts but doesn't publish a methodology describing how its scanner processes flow. Profit Builders publishes its full data methodology at <Link href="/methodology" className="pb-link text-white">profitbuilders.io/results</Link>  — sweep detection, OPRA condition codes, NBBO aggression classification.
                </Faq>
                <Faq q="How does AI Power Alerts compare to Grade A signals?">
                  Different approaches. Cheddar Flow's AI applies machine learning to flag setups in real time, without publishing what qualifies a signal or the system's historical hit rate. Profit Builders runs every print through 9 documented filters and publishes outcomes per grade. Transparent methodology on one side, ML black-box on the other — both are legitimate product choices, only one is auditable.
                </Faq>
                <Faq q="What's Cheddar Flow's annual pricing?">
                  Cheddar Flow Pro is <span className="pb-mono text-white">$75/mo</span> when billed annually — 25% off monthly. Profit Builders is monthly-only at $99. If you're confident enough to commit for a full year and don't need the features Profit Builders adds, Cheddar Flow's annual plan is cheaper than Profit Builders' monthly subscription.
                </Faq>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="pb-mono text-[10px] uppercase tracking-[0.3em] text-[#34D399] mb-6">Start trial</div>
            <h2 className="pb-editorial text-[40px] md:text-[52px] leading-[1.05] tracking-[-0.025em] text-white mb-6">
              Same price. Nothing gated.
            </h2>
            <p className="text-[17px] leading-[1.6] text-[#A9B4C6] max-w-xl mx-auto mb-10">
              Seven days of full feature access — dark pool context, Grade A conviction, 220-symbol GEX heatmap, Telegram alerts, and the OPRA-grade processing pipeline you just read about.
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

function MRow({ label, a, b, win = false }: { label: string; a: React.ReactNode; b: React.ReactNode; win?: boolean }) {
  return (
    <tr className="border-b border-[#1A1F2A]">
      <td className="py-4 pr-4 pb-mono text-[13px] text-[#A9B4C6] align-top">{label}</td>
      <td className="py-4 px-4 text-[14px] text-[#E8EDF5] align-top">{a}</td>
      <td className={`py-4 px-4 text-[14px] align-top ${win ? "bg-[rgba(52,211,153,0.03)]" : ""}`}>
        <div className="text-[#E8EDF5]">{b}</div>
      </td>
    </tr>
  )
}

function Pro({ n, title, body, win = false }: { n: string; title: string; body: string; win?: boolean }) {
  return (
    <div className="grid grid-cols-12 gap-x-4 items-baseline">
      <div className="col-span-2 md:col-span-1">
        <div className={`pb-mono text-[11px] tracking-widest ${win ? "text-[#34D399]" : "text-[#3D4D63]"}`}>{n}</div>
      </div>
      <div className="col-span-10 md:col-span-11">
        <h3 className="pb-editorial text-[22px] md:text-[24px] text-white leading-[1.2] tracking-[-0.015em] mb-2">{title}</h3>
        <p className="text-[15px] leading-[1.65] text-[#A9B4C6]">{body}</p>
      </div>
    </div>
  )
}

function Dive({ id, heading, children }: { id: string; heading: string; children: React.ReactNode }) {
  return (
    <div id={id}>
      <h3 className="pb-editorial text-[26px] md:text-[30px] text-white leading-[1.15] tracking-[-0.015em] mb-5">{heading}</h3>
      <p className="text-[16px] leading-[1.7] text-[#A9B4C6]">{children}</p>
    </div>
  )
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="pb-editorial text-[20px] md:text-[22px] text-white leading-[1.25] mb-3">{q}</div>
      <div className="text-[15px] leading-[1.7] text-[#A9B4C6]">{children}</div>
    </div>
  )
}
