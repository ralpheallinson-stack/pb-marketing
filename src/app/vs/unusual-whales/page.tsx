import type { Metadata } from "next"
import Link from "next/link"
import Nav from "@/components/Nav"
import Footer from "@/components/Footer"

const CANON = "https://profitbuilders.io/vs/unusual-whales"

export const metadata: Metadata = {
  title: { absolute: "Unusual Whales vs Profit Builders · Breadth or Grades" },
  description:
    "Unusual Whales vs Profit Builders for 2026 options flow. UW $50/mo, PB $99/mo. Pricing, data methodology, alerts, and a clear pick-which-when guide inside.",
  alternates: { canonical: CANON },
  openGraph: {
    title: "Unusual Whales vs Profit Builders · Options Flow Comparison",
    description:
      "Unusual Whales ($50/mo) vs Profit Builders ($99/mo). Feature matrix, pricing, and a verified documented OPRA methodology to compare against.",
    url: CANON,
    type: "article",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Unusual Whales vs Profit Builders" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Unusual Whales vs Profit Builders · Options Flow Comparison",
    description:
      "$50/mo vs $99/mo. Congress trades vs conviction grading. Documented methodology comparison inside.",
  },
}

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Unusual Whales vs Profit Builders: 2026 Options Flow Scanner Comparison",
  "image": [
    "https://profitbuilders.io/images/scanner-preview.png",
    "https://profitbuilders.io/opengraph-image"
  ],
  "description": "Side-by-side comparison of Unusual Whales and Profit Builders across pricing, conviction grading, data methodology, alerts, and community.",
  "author": { "@type": "Organization", "name": "Profit Builders", "url": "https://profitbuilders.io" },
  "publisher": {
    "@type": "Organization",
    "name": "Profit Builders",
    "logo": { "@type": "ImageObject", "url": "https://profitbuilders.io/images/pb-logo.png" },
  },
  "datePublished": "2026-04-22T09:00:00-04:00",
  "dateModified": "2026-05-23T10:00:00-04:00",
  "mainEntityOfPage": { "@type": "WebPage", "@id": CANON },
}

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://profitbuilders.io" },
    { "@type": "ListItem", "position": 2, "name": "Compare", "item": "https://profitbuilders.io/vs" },
    { "@type": "ListItem", "position": 3, "name": "Unusual Whales vs Profit Builders", "item": CANON },
  ],
}

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is Profit Builders a direct replacement for Unusual Whales?",
      "acceptedAnswer": { "@type": "Answer", "text": "For institutional options flow, yes. You lose Congressional trade data (Unusual Whales is the definitive source for that) but you gain conviction grading, a documented data methodology, Telegram alerts, and a GEX heatmap." },
    },
    {
      "@type": "Question",
      "name": "Does Unusual Whales publish a documented methodology?",
      "acceptedAnswer": { "@type": "Answer", "text": "No. Unusual Whales exposes raw flow data but does not publish signal outcomes or win rates. Profit Builders publishes its full data methodology at profitbuilders.io/methodology — sweep detection, OPRA condition codes, Black-Scholes-Merton Greeks, NBBO aggression classification." },
    },
    {
      "@type": "Question",
      "name": "Can I use both Unusual Whales and Profit Builders?",
      "acceptedAnswer": { "@type": "Answer", "text": "Yes. They complement each other. Unusual Whales for breadth (Congress trades, dark pool heatmaps, political data). Profit Builders for quality-filtered actionable signals with a conviction grade and verified outcomes." },
    },
    {
      "@type": "Question",
      "name": "What's the catch on the Profit Builders 7-day free trial?",
      "acceptedAnswer": { "@type": "Answer", "text": "A credit card is required to start the trial (via Stripe). You are not charged during the 7 days. At day 7 the subscription auto-charges $99/month unless you cancel from your dashboard before then. Cancellation takes one click." },
    },
    {
      "@type": "Question",
      "name": "Who should pick Unusual Whales over Profit Builders?",
      "acceptedAnswer": { "@type": "Answer", "text": "Traders who prioritize Congressional trade tracking, comprehensive dark pool heatmaps, or the cheapest entry tier at $29-50/mo. Advanced traders who prefer interpreting raw flow themselves rather than working from a pre-graded feed." },
    },
    {
      "@type": "Question",
      "name": "Is Unusual Whales worth it in 2026?",
      "acceptedAnswer": { "@type": "Answer", "text": "For the price — $29-50/mo — Unusual Whales is one of the best-value data platforms available: flow, Congressional trades, dark pool, and analytics in one place. What you don't get is conviction grading or a documented signal methodology. If you want the broadest data surface and are happy interpreting raw flow, UW is worth it; if you want graded, pre-vetted options signals, Profit Builders ($99/mo) is built for that specific job." },
    },
    {
      "@type": "Question",
      "name": "What's the best Unusual Whales alternative for options flow?",
      "acceptedAnswer": { "@type": "Answer", "text": "For options flow specifically, Profit Builders is the focused alternative: real-time institutional flow graded A/B, a public OPRA methodology you can audit, native Telegram alerts, and a GEX heatmap. Unusual Whales remains the better pick if you want Congressional trade tracking and the widest data coverage for the lowest price." },
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

export default function VsUnusualWhales() {
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
        .pb-rule {
          background: linear-gradient(90deg, transparent, rgba(122,139,168,0.22) 8%, rgba(122,139,168,0.22) 92%, transparent);
        }
        .pb-hairline { border-color: rgba(122,139,168,0.14); }
        .pb-mono { font-family: "IBM Plex Mono", "Menlo", monospace; letter-spacing: -0.01em; }
        .pb-display { font-family: "Bricolage Grotesque", "Plus Jakarta Sans", system-ui, sans-serif; font-feature-settings: "ss01","ss02"; }
        .pb-num { font-family: "Bricolage Grotesque", "Plus Jakarta Sans", system-ui, sans-serif; font-feature-settings: "tnum"; letter-spacing: -0.04em; }
        .pb-editorial { font-family: Georgia, "Times New Roman", serif; }
        .pb-win { color: #34D399; }
        .pb-lose { color: #7A8BA8; }
        .pb-callout {
          background: linear-gradient(135deg, rgba(52,211,153,0.05), rgba(52,211,153,0.01));
          border-left: 2px solid #34D399;
        }
        .pb-section-num {
          font-family: "IBM Plex Mono", monospace;
          font-size: 10px;
          letter-spacing: 0.2em;
          color: #3D4D63;
          text-transform: uppercase;
        }
        .pb-link { border-bottom: 1px solid rgba(52,211,153,0.4); transition: border-color 160ms ease; }
        .pb-link:hover { border-color: #34D399; }
        @keyframes pbRise { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .pb-rise { animation: pbRise 700ms cubic-bezier(0.16,1,0.3,1) both; }
      `}</style>

      <Nav />

      <main className="pb-grain text-[#E8EDF5] min-h-screen">
        {/* ─────────────────────────────────────────────────
           HERO — editorial anchor, serif H1, big stat
           ───────────────────────────────────────────────── */}
        <section className="pt-32 pb-24 px-6 border-b pb-hairline">
          <div className="max-w-6xl mx-auto grid md:grid-cols-12 gap-x-8 gap-y-10 pb-rise">
            {/* Left — eyebrow + H1 + lede */}
            <div className="md:col-span-8">
              <div className="flex items-baseline gap-3 mb-6">
                <span className="pb-section-num">01 / 07</span>
                <span className="pb-rule h-px flex-1" />
                <span className="pb-mono text-[11px] text-[#3D4D63]">Updated May 2026</span>
              </div>
              <h1
                className="pb-editorial text-[44px] sm:text-[60px] md:text-[68px] leading-[1.02] tracking-[-0.025em] text-white mb-8"
              >
                Unusual Whales <span className="text-[#3D4D63]">vs</span> Profit Builders.
              </h1>
              <p className="text-[18px] md:text-[19px] leading-[1.55] text-[#A9B4C6] max-w-xl">
                Two options flow platforms. One dumps the raw tape and lets you interpret. The other grades every print and publishes its outcomes. We'll show you when each wins — without pretending we're the answer every time.
              </p>
            </div>

          </div>
        </section>

        {/* ─────────────────────────────────────────────────
           VERDICT — two honest calls
           ───────────────────────────────────────────────── */}
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
                  Pick Unusual Whales.
                </h2>
                <p className="text-[16px] leading-[1.6] text-[#A9B4C6] mb-4">
                  If your edge is Congressional trade data, or if you're an advanced trader who wants the largest raw-flow surface at the lowest price and prefers to do the interpretation yourself.
                </p>
                <div className="pb-mono text-[11px] text-[#7A8BA8] uppercase tracking-wider">
                  $50/mo · Raw flow · Discord-centric
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
                  If you want flow already graded for conviction, a public documented OPRA methodology you can audit, and alerts that point to setups the engine actually vetted — not a firehose you filter alone.
                </p>
                <div className="pb-mono text-[11px] text-[#34D399] uppercase tracking-wider">
                  $99/mo · Graded signals · Telegram + Discord
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────
           MATRIX — editorial table, hairlines only
           ───────────────────────────────────────────────── */}
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
                    <th className="text-left py-3 px-4 pb-mono text-[11px] uppercase tracking-wider text-[#A9B4C6] font-medium w-[34%]">Unusual Whales</th>
                    <th className="text-left py-3 px-4 pb-mono text-[11px] uppercase tracking-wider text-[#34D399] font-medium w-[34%]">Profit Builders</th>
                  </tr>
                </thead>
                <tbody>
                  <MRow label="Starting price" a={<span className="pb-mono">$29–50/mo</span>} b={<span className="pb-mono text-white">$99/mo</span>} />
                  <MRow label="Free trial" a="Money-back refund only" b="7 days, card required" win />
                  <MRow label="Conviction grading" a={<span className="pb-lose">None — raw flow</span>} b={<span className="pb-win">Grade A / B, institutional-flow filter engine</span>} win />
                  <MRow label="Public methodology" a={<span className="pb-lose">Not published</span>} b={<span className="pb-win">Documented methodology</span>} win />
                  <MRow label="Data methodology" a={<span className="pb-lose">Not published</span>} b={<span className="pb-win">Documented</span>} win />
                  <MRow label="Discord alerts" a="Yes" b="Yes, 1–3s delivery" />
                  <MRow label="Telegram alerts" a={<span className="pb-lose">No</span>} b={<span className="pb-win">Native, mobile-first</span>} win />
                  <MRow label="Dark pool data" a={<span className="text-white">Standalone feed</span>} b="Surfaced via flow" />
                  <MRow label="Congress trades" a={<span className="text-white">Yes — unique</span>} b={<span className="pb-lose">Not offered</span>} />
                  <MRow label="GEX heatmap" a={<span className="pb-lose">No</span>} b={<span className="pb-win">220 symbols</span>} win />
                  <MRow label="Accumulation detection" a={<span className="pb-lose">Raw prints only</span>} b={<span className="pb-win">RAPID badges on repeat hits</span>} win />
                  <MRow label="Sector / IV / Greeks" a="Yes" b="Yes, inline on every signal" />
                </tbody>
              </table>
            </div>

            <p className="pb-mono text-[10px] text-[#3D4D63] mt-6 uppercase tracking-wider">
              Pricing and features verified May 2026 from each vendor's public documentation.
            </p>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────
           WHERE UW WINS — honest
           ───────────────────────────────────────────────── */}
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
                  Where Unusual Whales is stronger.
                </h2>
                <p className="text-[15px] leading-[1.6] text-[#7A8BA8]">
                  Fair is fair. There are real reasons Unusual Whales has the brand position it does.
                </p>
              </div>

              <div className="md:col-span-8 space-y-10">
                <Pro n="01" title="Congressional trade tracking" body="Mandatory political disclosure filings aggregated into a clean feed, with historical performance per politician. Nobody else has this depth. If tracking Congress is part of your edge, it's the only real option." />
                <Pro n="02" title="Cheapest established tier" body="At $29–50/mo, it's the cheapest well-known brand in options flow. Profit Builders' Flow Scanner is $99/mo — twice the entry point. If raw price decides, Unusual Whales wins that column." />
                <Pro n="03" title="Broader data surface in one app" body="Dark pool feeds, interactive heatmaps, and a stock screener bundled with flow. Profit Builders is narrower by design. If you want a one-stop visualization, UW covers more surface." />
                <Pro n="04" title="Larger community" body="More active Discord, more third-party tutorials, broader coverage in trading publications. If community volume matters to your learning style, that advantage is real." />
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────
           WHERE PB WINS — the sales layer, but grounded
           ───────────────────────────────────────────────── */}
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
                  The categories we were designed to own — quality over quantity, transparency over opacity.
                </p>
              </div>

              <div className="md:col-span-8 space-y-10">
                <Pro win n="01" title="Conviction grading, not raw dumps"
                  body="Every signal runs through the institutional-flow filter pipeline — closing-position detection, direction classification, delta screening, spread detection, market-maker identification — and emerges tagged Grade A or Grade B. UW shows the raw prints. You decide what they mean. We show you the ones the engine vetted." />
                <Pro win n="02" title="A publicly documented methodology"
                  body="Profit Builders publishes its full data methodology at profitbuilders.io/methodology — sweep detection per CBOE Rule 6.11, OPRA condition codes, Black-Scholes-Merton Greeks, NBBO aggression classification. Unusual Whales does not publish a methodology page describing how its scanner processes flow." />
                <Pro win n="03" title="Accumulation pattern detection"
                  body="When a single contract gets hit 10+ times in quick succession with aggressive, similar-sized prints — the signature of a large player slicing a position — we surface it as a RAPID badge with full accumulation context. UW shows the individual prints. You spot the pattern." />
                <Pro win n="04" title="Telegram + Discord, not Discord-only"
                  body="Alerts include ticker, strike, expiry, premium, Greeks, Grade, and sector — delivered to Telegram with mobile-first formatting. UW is Discord-centric. If your alert workflow isn't in Discord, we're more flexible." />
                <Pro win n="05" title="Honest 7-day free trial"
                  body="Card required, no charge for 7 days, one-click cancel from your dashboard before day 7. UW doesn't offer a free trial — they offer a money-back refund after you've already paid." />
                <Pro win n="06" title="GEX heatmap across 220 symbols"
                  body="Gamma exposure visualization, $39/mo standalone or bundled at $129. Useful for understanding where market-maker positioning pins or accelerates a move. UW doesn't have a dedicated GEX tool." />
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────
           DEEP DIVES — editorial paragraphs, no cards
           ───────────────────────────────────────────────── */}
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
                  <a href="#flow" className="block text-[14px] text-[#A9B4C6] hover:text-white transition-colors">Flow detection</a>
                  <a href="#alerts" className="block text-[14px] text-[#A9B4C6] hover:text-white transition-colors">Alerts & latency</a>
                  <a href="#pricing" className="block text-[14px] text-[#A9B4C6] hover:text-white transition-colors">Pricing per outcome</a>
                  <a href="#who" className="block text-[14px] text-[#A9B4C6] hover:text-white transition-colors">Who each is for</a>
                  <a href="#switching" className="block text-[14px] text-[#A9B4C6] hover:text-white transition-colors">Switching over</a>
                </nav>
              </aside>

              <div className="md:col-span-9 space-y-16">
                <Dive id="flow" heading="Flow detection depth">
                  Both platforms ingest the full US options tape in real time. The difference is what comes out the other side. Unusual Whales exposes more raw prints per day — higher volume, less filtering, you pick the ones that matter. Profit Builders runs every print through the conviction filter before it's surfaced. <em className="pb-editorial text-white">Grade A means the nine filters all agree; Grade B means most do.</em> Anything that fails multiple checks never reaches your feed. The tradeoff is clear: Unusual Whales gives you more. Profit Builders gives you fewer with a reason for each one.
                </Dive>

                <Dive id="alerts" heading="Alerts and latency">
                  Both deliver to Discord within a few seconds of the print. Profit Builders adds Telegram as a native channel — important if you're away from a desk. End-to-end latency is comparable; the bottleneck is the options tape feed itself, not the platform. Where they differ is what's in the alert. Profit Builders alerts include the conviction grade, sector context, IV, Greeks, and any active accumulation pattern the signal belongs to. Unusual Whales alerts are lighter by default and configurable — you add context via filters you build yourself.
                </Dive>

                <Dive id="pricing" heading="Pricing, per outcome">
                  On paper, Unusual Whales is cheaper: <span className="pb-mono text-white">$50/mo</span> vs <span className="pb-mono text-white">$99/mo</span>. The trade-off is curation. Unusual Whales is a firehose with extensive filter knobs — you process the flow yourself. Profit Builders runs every print through a documented methodology before it reaches your screen, surfacing pre-filtered institutional flow. Different value propositions; you pay more for less work.
                </Dive>

                <Dive id="who" heading="Who each platform is actually for">
                  Unusual Whales suits active intermediate-to-advanced traders who treat flow as raw input to their own system, value Congressional trade data, and want the broadest market data surface in one place. Profit Builders suits traders who want graded signals with a verifiable win rate, whose workflow includes Telegram, and who want a focused tool rather than a dashboard with twelve tabs. Beginners usually find Profit Builders easier to act on — the interpretation work is upfront in the grade, rather than something they have to do on every alert.
                </Dive>
                <Dive id="switching" heading="Switching from Unusual Whales to Profit Builders">
                  Unusual Whales is cheaper ($29&ndash;50/mo) and broader, so this is rarely all-or-nothing &mdash; most traders keep UW for Congressional trades and dark-pool heatmaps and add Profit Builders for the graded options tape. The trial makes the comparison concrete: run Profit Builders' 7 free days during live sessions, route alerts to Discord or Telegram, and watch how many of UW's raw flow flags would clear conviction grading. Where UW hands you a firehose to interpret, Profit Builders hands you Grade A/B signals with the interpretation already done. If you're an advanced trader who likes working raw flow, keep UW as primary; if you'd rather act on pre-vetted signals with an auditable hit rate, Profit Builders becomes the tool you watch during the session.
                </Dive>
                <div className="pl-5 py-5 pr-4" style={{ background: "linear-gradient(135deg, rgba(52,211,153,0.06), rgba(52,211,153,0.01))", borderLeft: "2px solid #34D399" }}>
                  <div className="pb-mono text-[10px] tracking-[0.2em] text-[#34D399] uppercase mb-3">Grade A example</div>
                  <p className="text-[16px] leading-[1.7] text-[#A9B4C6]">
                    What clears the top gate looks like this: a <span className="text-white">$1.2M sweep on short-dated NVDA calls</span>, Vol/OI 3.4&times;, lifted at the ask with no offsetting flow &mdash; tagged Grade A and pushed to Telegram in about a second and a half. Unusual Whales would flag the print among thousands; you'd still rank the conviction yourself. Every Grade A signal's resolved outcome is logged publicly at <Link href="/methodology" className="pb-link text-white">/methodology</Link>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────
           FAQ — editorial spacing, no accordion
           ───────────────────────────────────────────────── */}
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
                <Faq q="Is Profit Builders a direct replacement for Unusual Whales?">
                  For options flow, mostly yes. You trade Congressional trade data (Unusual Whales' strongest differentiator) for conviction grading, a documented methodology, Telegram alerts, and a GEX heatmap. Most traders who aren't specifically tracking Congress find the swap net-positive.
                </Faq>
                <Faq q="Does Unusual Whales publish a documented methodology?">
                  No. Unusual Whales exposes the raw flow but doesn't publish a methodology describing how it processes flow. Profit Builders publishes its full data methodology at <Link href="/methodology" className="pb-link text-white">profitbuilders.io/methodology</Link> — sweep detection per CBOE Rule 6.11, OPRA condition codes, Black-Scholes-Merton Greeks, NBBO aggression classification.
                </Faq>
                <Faq q="Can I use both?">
                  Yes, they complement each other cleanly. Unusual Whales for breadth (Congress, dark pool heatmaps, screener). Profit Builders for filtered, graded, tracked signals. Many active traders run both.
                </Faq>
                <Faq q="What's the catch on the 7-day free trial?">
                  A credit card is required at signup through Stripe. You are <em className="pb-editorial text-white">not charged</em> during the 7 days. On day 7 the subscription auto-charges <span className="pb-mono text-white">$99/month</span> unless you've canceled from your dashboard before then. Cancellation is one click.
                </Faq>
                <Faq q="Who should pick Unusual Whales over Profit Builders?">
                  Traders who need Congressional trade data, want the cheapest established tier, or prefer interpreting raw flow themselves over working from a pre-graded feed. All three are legitimate reasons.
                </Faq>
                <Faq q="Is Unusual Whales worth it in 2026?">
                  For the price &mdash; <span className="pb-mono text-white">$29&ndash;50/mo</span> &mdash; Unusual Whales is one of the best-value data platforms available: flow, Congressional trades, dark pool, and analytics in one place. What you don't get is conviction grading or a documented signal methodology. If you want the broadest data surface and are happy interpreting raw flow, UW is worth it; if you want graded, pre-vetted options signals, Profit Builders ($99/mo) is built for that specific job.
                </Faq>
                <Faq q="What's the best Unusual Whales alternative for options flow?">
                  For options flow specifically, Profit Builders is the focused alternative: real-time institutional flow graded A/B, a public OPRA methodology you can audit at <Link href="/methodology" className="pb-link text-white">/methodology</Link>, native Telegram alerts, and a GEX heatmap. Unusual Whales remains the better pick if you want Congressional trade tracking and the widest data coverage for the lowest price.
                </Faq>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────
           CTA — editorial closing
           ───────────────────────────────────────────────── */}
        <section className="py-24 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="pb-mono text-[10px] uppercase tracking-[0.3em] text-[#34D399] mb-6">
              Start trial
            </div>
            <h2 className="pb-editorial text-[40px] md:text-[52px] leading-[1.05] tracking-[-0.025em] text-white mb-6">
              See graded signals in real time.
            </h2>
            <p className="text-[17px] leading-[1.6] text-[#A9B4C6] max-w-xl mx-auto mb-10">
              Seven days of full feature access. Real-time institutional flow, Grade A conviction, 220-symbol GEX heatmap, and the methodology you just read about.
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

/* ─────────────────────────────────────────────────────────
   Small components — kept local for one-file clarity
   ───────────────────────────────────────────────────────── */

function MRow({
  label, a, b, win = false,
}: {
  label: string
  a: React.ReactNode
  b: React.ReactNode
  win?: boolean
}) {
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
        <div className={`pb-mono text-[11px] tracking-widest ${win ? "text-[#34D399]" : "text-[#3D4D63]"}`}>
          {n}
        </div>
      </div>
      <div className="col-span-10 md:col-span-11">
        <h3 className="pb-editorial text-[22px] md:text-[24px] text-white leading-[1.2] tracking-[-0.015em] mb-2">
          {title}
        </h3>
        <p className="text-[15px] leading-[1.65] text-[#A9B4C6]">{body}</p>
      </div>
    </div>
  )
}

function Dive({ id, heading, children }: { id: string; heading: string; children: React.ReactNode }) {
  return (
    <div id={id}>
      <h3 className="pb-editorial text-[26px] md:text-[30px] text-white leading-[1.15] tracking-[-0.015em] mb-5">
        {heading}
      </h3>
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
