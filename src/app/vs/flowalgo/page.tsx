import type { Metadata } from "next"
import Link from "next/link"
import Nav from "@/components/Nav"
import Footer from "@/components/Footer"

const CANON = "https://profitbuilders.io/vs/flowalgo"

export const metadata: Metadata = {
  title: "FlowAlgo vs Profit Builders · 2026 Options Flow Comparison",
  description:
    "Honest 2026 comparison of FlowAlgo and Profit Builders for options flow. FlowAlgo is $149/mo with a $37 trial that auto-charges. Profit Builders is $99/mo with a 7-day free trial and a verified 174K-signal track record.",
  alternates: { canonical: CANON },
  openGraph: {
    title: "FlowAlgo vs Profit Builders · Options Flow Comparison",
    description:
      "FlowAlgo $149/mo vs Profit Builders $99/mo. Honest trial vs auto-charge $37 trial. Verified track record inside.",
    url: CANON,
    type: "article",
    images: [{ url: "/images/og-card.png", width: 1200, height: 630, alt: "FlowAlgo vs Profit Builders" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "FlowAlgo vs Profit Builders · Options Flow Comparison",
    description:
      "$99 vs $149/mo. No trial traps. Verified 174K-signal track record. Honest comparison inside.",
    images: ["/images/og-card.png"],
  },
}

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "FlowAlgo vs Profit Builders: 2026 Options Flow Scanner Comparison",
  "description": "Side-by-side comparison of FlowAlgo and Profit Builders across pricing, trial transparency, conviction grading, track record, alerts, and dark pool features.",
  "author": { "@type": "Organization", "name": "Profit Builders" },
  "publisher": {
    "@type": "Organization",
    "name": "Profit Builders",
    "logo": { "@type": "ImageObject", "url": "https://profitbuilders.io/images/pb-logo.png" },
  },
  "datePublished": "2026-04-22",
  "dateModified": "2026-04-22",
  "mainEntityOfPage": { "@type": "WebPage", "@id": CANON },
}

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://profitbuilders.io" },
    { "@type": "ListItem", "position": 2, "name": "Compare", "item": "https://profitbuilders.io/vs" },
    { "@type": "ListItem", "position": 3, "name": "FlowAlgo vs Profit Builders", "item": CANON },
  ],
}

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is Profit Builders cheaper than FlowAlgo?",
      "acceptedAnswer": { "@type": "Answer", "text": "Yes. Profit Builders Flow Scanner is $99/mo. FlowAlgo is $149/mo — Profit Builders is 33% cheaper on a like-for-like monthly subscription." },
    },
    {
      "@type": "Question",
      "name": "What's wrong with FlowAlgo's $37 trial?",
      "acceptedAnswer": { "@type": "Answer", "text": "FlowAlgo's trial isn't free — it costs $37 upfront for 14 days. If you don't cancel before day 14, you're auto-charged $149/mo. That's a 4x price step most users don't expect. Profit Builders offers a genuine 7-day free trial (card required, not charged during the trial) with one-click cancellation." },
    },
    {
      "@type": "Question",
      "name": "Does FlowAlgo publish a verified track record?",
      "acceptedAnswer": { "@type": "Answer", "text": "No. FlowAlgo surfaces large block trades and dark pool prints but does not publish signal outcomes or win rates. Profit Builders tracks every Grade A/B signal at profitbuilders.io/results — currently 174,000+ resolved outcomes with 39.3% Grade A win rate." },
    },
    {
      "@type": "Question",
      "name": "What does FlowAlgo offer that Profit Builders doesn't?",
      "acceptedAnswer": { "@type": "Answer", "text": "Voice alerts (spoken aloud during market hours), brand longevity (one of the older options flow tools), and the Levels feature which identifies dark pool support/resistance zones. If audio alerts or the specific Levels visualization are your workflow, FlowAlgo retains that advantage." },
    },
    {
      "@type": "Question",
      "name": "Which is better for beginners?",
      "acceptedAnswer": { "@type": "Answer", "text": "Profit Builders. FlowAlgo is built for active traders who already interpret raw flow; its $149 price point assumes you know what to do with the data. Profit Builders' conviction grading (Grade A / Grade B) removes the interpretation burden, making the platform accessible earlier in a trader's journey." },
    },
  ],
}

export default function VsFlowAlgo() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

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
                FlowAlgo <span className="text-[#3D4D63]">vs</span> Profit Builders.
              </h1>
              <p className="text-[18px] md:text-[19px] leading-[1.55] text-[#A9B4C6] max-w-xl">
                FlowAlgo is $149/mo and asks for $37 up front to try it. Profit Builders is $99/mo with a genuine 7-day free trial and a 174,000-signal track record you can audit before paying a dollar. Here's the fair breakdown — including where FlowAlgo still wins.
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
                  Pick FlowAlgo.
                </h2>
                <p className="text-[16px] leading-[1.6] text-[#A9B4C6] mb-4">
                  If voice alerts are a critical part of your workflow, you specifically want FlowAlgo's dark pool "Levels" feature, and you're fine paying a 50% premium for a tool whose publicly verifiable performance is unknown.
                </p>
                <div className="pb-mono text-[11px] text-[#7A8BA8] uppercase tracking-wider">
                  $149/mo · Voice alerts · Legacy brand
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
                  If you want to pay 33% less, try every feature free for a week without being charged, and work from a published track record of 174,000 signals with a 39.3% Grade A win rate.
                </p>
                <div className="pb-mono text-[11px] text-[#34D399] uppercase tracking-wider">
                  $99/mo · Graded signals · 7-day free trial
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
                    <th className="text-left py-3 px-4 pb-mono text-[11px] uppercase tracking-wider text-[#A9B4C6] font-medium w-[34%]">FlowAlgo</th>
                    <th className="text-left py-3 px-4 pb-mono text-[11px] uppercase tracking-wider text-[#34D399] font-medium w-[34%]">Profit Builders</th>
                  </tr>
                </thead>
                <tbody>
                  <MRow label="Monthly price" a={<span className="pb-mono">$149/mo</span>} b={<span className="pb-mono pb-win">$99/mo — 33% less</span>} win />
                  <MRow label="Trial" a={<span className="pb-lose">$37 for 14 days, auto-charges $149</span>} b={<span className="pb-win">7-day free trial, card required</span>} win />
                  <MRow label="Conviction grading" a={<span className="pb-lose">None — raw flow</span>} b={<span className="pb-win">Grade A / B, 9-filter engine</span>} win />
                  <MRow label="Public track record" a={<span className="pb-lose">Not published</span>} b={<span className="pb-win">174,000+ resolved signals</span>} win />
                  <MRow label="Grade A win rate" a={<span className="pb-lose">Not disclosed</span>} b={<span className="pb-win">39.3% verified</span>} win />
                  <MRow label="Voice alerts" a={<span className="text-white">Yes — unique</span>} b={<span className="pb-lose">Not offered</span>} />
                  <MRow label="Dark pool Levels" a={<span className="text-white">Yes — support/resistance</span>} b="Partial (via flow)" />
                  <MRow label="Discord alerts" a="Yes" b="Yes, 1–3s delivery" />
                  <MRow label="Telegram alerts" a={<span className="pb-lose">No</span>} b={<span className="pb-win">Native, mobile-first</span>} win />
                  <MRow label="Historical flow data" a="Yes" b="Yes" />
                  <MRow label="GEX heatmap" a={<span className="pb-lose">No</span>} b={<span className="pb-win">220 symbols</span>} win />
                  <MRow label="Accumulation detection" a={<span className="pb-lose">Raw prints only</span>} b={<span className="pb-win">RAPID badges on repeat hits</span>} win />
                </tbody>
              </table>
            </div>
            <p className="pb-mono text-[10px] text-[#3D4D63] mt-6 uppercase tracking-wider">
              Pricing and features verified April 2026 from each vendor's public documentation.
            </p>
          </div>
        </section>

        {/* WHERE FA WINS */}
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
                  Where FlowAlgo is stronger.
                </h2>
                <p className="text-[15px] leading-[1.6] text-[#7A8BA8]">
                  FlowAlgo has been in the space longer than most. A few things it still does better.
                </p>
              </div>
              <div className="md:col-span-8 space-y-10">
                <Pro n="01" title="Voice alerts" body="FlowAlgo reads unusual options activity aloud during market hours — a genuinely different ergonomic for traders who work with a second screen muted or split their attention. Profit Builders delivers to Discord and Telegram but doesn't speak alerts out loud." />
                <Pro n="02" title="The Levels feature" body="FlowAlgo's Levels identifies price points where heavy dark pool activity has occurred — often becoming support or resistance because institutions defend those positions. Profit Builders surfaces dark pool activity inside the flow feed rather than as a dedicated Levels overlay." />
                <Pro n="03" title="Brand longevity" body="FlowAlgo has been one of the better-known flow tools for years. If you want a platform with years of third-party reviews and community tutorials to consult, FlowAlgo has more of that archive than newer tools." />
                <Pro n="04" title="Block-trade specialization" body="FlowAlgo's editorial focus has always been large block trades and dark pool prints. If your edge is specifically those two categories, FlowAlgo's UI is organized around them more tightly than a general-purpose flow tool." />
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
                  The categories that matter most for a trader picking a tool in 2026 — pricing transparency, evidence, and actionable signals.
                </p>
              </div>
              <div className="md:col-span-8 space-y-10">
                <Pro win n="01" title="33% less per month"
                  body="Profit Builders Flow Scanner is $99/mo. FlowAlgo is $149/mo. Same category of product — Profit Builders saves you $600/year. The $129/mo Pro bundle adds the GEX heatmap and still costs less than FlowAlgo's base tier." />
                <Pro win n="02" title="Honest trial, no auto-charge trap"
                  body="FlowAlgo's trial costs $37 upfront for 14 days and auto-charges $149 on day 15 unless you cancel. Profit Builders' trial costs nothing for 7 days, the subscription auto-charges $99 on day 8, and cancellation is one click from your dashboard. Same mechanic, one-third the commitment, no surprise price step." />
                <Pro win n="03" title="A publicly verified track record"
                  body="Profit Builders publishes every Grade A/B signal outcome at /results — currently 174,000+ resolved signals with a 39.3% Grade A win rate. FlowAlgo does not publish signal outcomes anywhere public. If you're about to pay $149/mo to act on flagged signals, you should be able to audit that tool's hit rate first." />
                <Pro win n="04" title="Conviction grading replaces interpretation burden"
                  body="FlowAlgo flags large prints; you decide which ones are real signals. Profit Builders runs every print through nine filters — closing-position detection, direction classification, delta screening, spread detection, market-maker identification, and more — and delivers the survivors tagged Grade A or Grade B. Fewer alerts, each one with an explicit conviction level." />
                <Pro win n="05" title="Telegram alerts + mobile-first workflow"
                  body="Every signal ships with ticker, strike, expiry, premium, Greeks, grade, and sector — delivered natively to Telegram with mobile-optimized formatting. FlowAlgo's primary alert channels are email, web, and Discord. If your phone is your alerting surface, Profit Builders is built for that." />
                <Pro win n="06" title="Accumulation pattern detection"
                  body="When a single contract is hit 10+ times in a short window with consistent aggressive sizing — the signature of a large player slicing a position to avoid moving the market — Profit Builders surfaces it as a RAPID badge with the full accumulation context. FlowAlgo shows you the individual prints; you have to spot the pattern yourself." />
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
                  <a href="#trial" className="block text-[14px] text-[#A9B4C6] hover:text-white transition-colors">The trial mechanics</a>
                  <a href="#pricing" className="block text-[14px] text-[#A9B4C6] hover:text-white transition-colors">Pricing per outcome</a>
                  <a href="#levels" className="block text-[14px] text-[#A9B4C6] hover:text-white transition-colors">Levels vs grading</a>
                  <a href="#who" className="block text-[14px] text-[#A9B4C6] hover:text-white transition-colors">Who each is for</a>
                </nav>
              </aside>
              <div className="md:col-span-9 space-y-16">
                <Dive id="trial" heading="The trial mechanics, compared">
                  FlowAlgo asks for <span className="pb-mono text-white">$37</span> upfront for a 14-day trial, then auto-charges <span className="pb-mono text-white">$149</span> on day 15 unless you cancel. That's a <em className="pb-editorial text-white">4x price step</em> most trialers don't fully register at signup. Profit Builders asks for a card at signup, charges nothing for 7 days, and auto-charges $99 on day 8 — a smaller commitment, clearer pricing, no hidden step-up. Both require cancellation to avoid the charge; only one pretends the trial itself is free when it isn't.
                </Dive>
                <Dive id="pricing" heading="Pricing per outcome">
                  On a straight monthly basis, Profit Builders is 33% cheaper — <span className="pb-mono text-white">$99</span> vs <span className="pb-mono text-white">$149</span>. On outcome-per-dollar the gap widens. Profit Builders' Grade A signals carry a verified 39.3% win rate across 174,000 logged outcomes. FlowAlgo doesn't publish signal outcomes, so its effective outcome-per-dollar is unknown — you're paying for flagged prints, not graded setups. Both are legitimate business models. Only one lets you audit the numbers before you pay.
                </Dive>
                <Dive id="levels" heading="Dark pool Levels vs conviction grading">
                  FlowAlgo's Levels feature draws support and resistance zones based on dark pool print concentration — a real differentiator if you trade off those levels as primary decision points. Profit Builders takes a different approach: rather than visualize dark pool zones, it grades every print against nine filters and surfaces Grade A signals with the institutional context that explains them. Both strategies are defensible. Levels is visual and discretionary. Grading is rule-based and delegated. Pick the approach that matches how you actually trade.
                </Dive>
                <Dive id="who" heading="Who each platform is actually for">
                  FlowAlgo suits block-trade-focused traders, audio-workflow traders who rely on voice alerts, and long-time FA users with muscle memory for the UI. Profit Builders suits traders who want graded signals with a verifiable win rate, anyone for whom $600/year of savings matters, traders using Telegram-first alerting, and anyone evaluating a flow tool for the first time who'd rather pay 33% less and skip the $37 preview fee.
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
                <Faq q="Is Profit Builders cheaper than FlowAlgo?">
                  Yes. Profit Builders Flow Scanner is <span className="pb-mono text-white">$99/mo</span>. FlowAlgo is <span className="pb-mono text-white">$149/mo</span>. That's 33% cheaper, or roughly $600 saved per year on a like-for-like subscription.
                </Faq>
                <Faq q="What's wrong with FlowAlgo's $37 trial?">
                  Nothing is "wrong" with it — it's just not what most people mean by a trial. FlowAlgo's 14-day trial costs $37 upfront, and if you don't cancel before day 14, the subscription auto-charges <span className="pb-mono text-white">$149</span>. That's a <em className="pb-editorial text-white">4x step</em> from the trial price. Profit Builders' trial costs $0, lasts 7 days, and auto-charges $99 — same mechanic, lower numbers, no surprise price escalation.
                </Faq>
                <Faq q="Does FlowAlgo publish a verified track record?">
                  No. FlowAlgo surfaces large block trades and dark pool prints but doesn't publish signal outcomes. Profit Builders publishes every Grade A/B signal at <Link href="/results" className="pb-link text-white">profitbuilders.io/results</Link> — currently 174,000+ resolved outcomes with 39.3% Grade A win rate.
                </Faq>
                <Faq q="What does FlowAlgo offer that Profit Builders doesn't?">
                  Three things. Voice alerts that speak activity aloud during market hours. The Levels feature for dark pool support/resistance zones. And a longer public archive of third-party reviews and tutorials because FlowAlgo has been in the space longer. If any of those are load-bearing for your workflow, FlowAlgo still wins that column.
                </Faq>
                <Faq q="Which is better for beginners?">
                  Profit Builders. FlowAlgo's $149 pricing implicitly assumes you already know what to do with raw flow data — its UI is optimized for active interpretation. Profit Builders' conviction grading does the interpretation work up front, which is why beginners find Grade A alerts actionable in a way that raw block trades rarely are.
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
              Save $600/year. Keep the evidence.
            </h2>
            <p className="text-[17px] leading-[1.6] text-[#A9B4C6] max-w-xl mx-auto mb-10">
              Seven days of full feature access. Real-time institutional flow, Grade A conviction grading, the 220-symbol GEX heatmap, and the 174,000-signal track record you just read about.
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
