import type { Metadata } from "next"
import Link from "next/link"
import Nav from "@/components/Nav"
import Footer from "@/components/Footer"

const CANON = "https://profitbuilders.io/affiliates"
// APPLY_EMAIL — where applications land. Swap to a dedicated affiliates@ inbox
// when one exists; no other change needed.
const APPLY_EMAIL = "profitbuildersllc@rmoneycloud.com"
const APPLY_HREF = `mailto:${APPLY_EMAIL}?subject=Profit%20Builders%20Affiliate%20Application`

export const metadata: Metadata = {
  title: { absolute: "Profit Builders Affiliate Program — Earn 30% Recurring" },
  description:
    "Earn 30% recurring commission promoting Profit Builders, the institutional options-flow scanner. 90-day attribution, monthly payouts, no cap. For creators, newsletters & communities.",
  alternates: { canonical: CANON },
  openGraph: {
    title: "Profit Builders Affiliate Program — Earn 30% Recurring",
    description:
      "30% recurring commission for partners who promote Profit Builders. 90-day attribution, monthly payouts, no cap.",
    url: CANON,
    type: "website",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Profit Builders Affiliate Program" }],
  },
  twitter: { card: "summary_large_image", images: ["/opengraph-image"] },
}

const TERMS = [
  ["30%", "recurring commission, every payment"],
  ["90-day", "referral attribution window"],
  ["Monthly", "payouts, $50 minimum"],
  ["No cap", "unlimited referrals"],
]

const AUDIENCE = [
  ["FinTwit creators & newsletters", "If your audience trades options, a flow scanner is a natural fit alongside your usual content."],
  ["Trading Discords & communities", "Give members an edge they can act on — and earn on every paid conversion."],
  ["Complementary data tools", "Short/borrow data, GEX, charting, scanners. Non-competing data that pairs cleanly with institutional flow."],
  ["Options educators & course creators", "A live, real-data tool to reference in lessons — and a revenue stream that compounds with your catalog."],
]

const STEPS = [
  ["Apply", "Tell us about your audience and where you'd promote. We review and approve good fits fast."],
  ["Get your link", "You receive a tracked referral link with a 90-day attribution window. Anyone who subscribes within 90 days of clicking is credited to you."],
  ["Earn 30% recurring", "Paid monthly, every payment, for as long as your referral stays subscribed. No cap on how many you refer."],
]

// FAQ — plain-text strings; rendered visibly below AND emitted as FAQPage JSON-LD.
// Keep the two in sync (schema must match visible content).
const FAQ: [string, string][] = [
  ["How much do I earn?", "30% of every payment your referrals make — recurring, for as long as they stay subscribed. There is no cap on the number of referrals."],
  ["When and how do I get paid?", "Monthly, once your balance clears a $50 minimum. Payout method (e.g. PayPal or Stripe) is set when you're approved."],
  ["How long is the attribution window?", "90 days. If someone clicks your link and subscribes any time within 90 days, the referral is credited to you."],
  ["Who is eligible?", "Creators, newsletters, communities, educators, and builders of complementary trading tools whose audience trades options. Apply and we'll review your fit."],
  ["Is this the same as Refer & Earn?", "No. Refer & Earn gives existing subscribers a $99 account credit for referring a friend. The affiliate program pays partners 30% recurring cash for promoting to an audience."],
]

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map(([q, a]) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
}

export default function AffiliatesPage() {
  return (
    <>
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
        .pb-editorial { font-family: Georgia, "Times New Roman", serif; }
        .pb-section-num { font-family: "IBM Plex Mono", monospace; font-size: 10px; letter-spacing: 0.2em; color: #3D4D63; text-transform: uppercase; }
      `}</style>

      <Nav />

      <main className="pb-grain text-[#E8EDF5] min-h-screen">
        {/* Header */}
        <section className="pt-32 pb-14 px-6 border-b pb-hairline">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-baseline gap-3 mb-10">
              <span className="pb-section-num">Affiliate Program</span>
              <span className="pb-rule h-px flex-1" />
              <span className="pb-mono text-[11px] text-[#3D4D63]">Updated May 2026</span>
            </div>

            <h1 className="pb-editorial text-[44px] sm:text-[60px] leading-[1.02] tracking-[-0.025em] text-white max-w-[820px]">
              Earn 30% recurring.
            </h1>
            <p className="pb-editorial text-[19px] md:text-[21px] leading-[1.55] text-white/70 max-w-[760px] mt-7">
              Profit Builders pays partners 30% of every payment their referrals make — recurring, for as long as the customer stays subscribed. Built for creators, newsletters, and trading communities whose audience trades options. You bring the reach; we bring the data and the payout.
            </p>
            <a href={APPLY_HREF} className="inline-block mt-9 pb-mono text-[14px] tracking-[0.04em] text-[#0B0E13] bg-[#60a5fa] hover:bg-white transition-colors px-7 py-3.5 rounded-sm">
              Apply to the program →
            </a>
          </div>
        </section>

        {/* Terms strip */}
        <section className="px-6 border-b pb-hairline">
          <div className="max-w-5xl mx-auto py-10 grid grid-cols-4 gap-6 max-md:grid-cols-2 max-md:gap-8">
            {TERMS.map(([n, label]) => (
              <div key={label} className="text-center max-md:text-left">
                <div className="pb-editorial text-[30px] md:text-[34px] text-white font-normal tracking-[-0.01em]">{n}</div>
                <div className="pb-mono text-[11px] tracking-[0.04em] text-white/45 uppercase mt-2 leading-[1.4]">{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* I. Who it's for */}
        <section className="py-16 px-6 border-b pb-hairline">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-baseline gap-3 mb-8">
              <span className="pb-editorial italic text-[#60a5fa] text-[36px] leading-none">I.</span>
              <h2 className="pb-editorial text-[28px] md:text-[34px] font-normal tracking-[-0.015em] text-white">Who it&apos;s for.</h2>
            </div>
            <div className="border-t pb-hairline">
              {AUDIENCE.map(([t, d]) => (
                <div key={t} className="grid grid-cols-[1fr_1.4fr] gap-6 py-5 border-b pb-hairline items-baseline max-md:grid-cols-1 max-md:gap-1">
                  <h3 className="pb-editorial text-[18px] md:text-[19px] text-white leading-[1.3]">{t}</h3>
                  <p className="pb-editorial text-[15px] leading-[1.55] text-white/55">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* II. How it works */}
        <section className="py-16 px-6 border-b pb-hairline">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-baseline gap-3 mb-8">
              <span className="pb-editorial italic text-[#60a5fa] text-[36px] leading-none">II.</span>
              <h2 className="pb-editorial text-[28px] md:text-[34px] font-normal tracking-[-0.015em] text-white">How it works.</h2>
            </div>
            <div className="border-t pb-hairline">
              {STEPS.map(([t, d], i) => (
                <div key={t} className="grid grid-cols-[auto_1fr] gap-5 py-6 border-b pb-hairline items-baseline">
                  <span className="pb-mono text-[13px] text-[#60a5fa] tracking-[0.1em]">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="pb-editorial text-[20px] md:text-[22px] text-white mb-2 leading-[1.3]">{t}</h3>
                    <p className="pb-editorial text-[16px] leading-[1.6] text-white/65 max-w-[760px]">{d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* III. What you're promoting */}
        <section className="py-16 px-6 border-b pb-hairline">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-baseline gap-3 mb-8">
              <span className="pb-editorial italic text-[#60a5fa] text-[36px] leading-none">III.</span>
              <h2 className="pb-editorial text-[28px] md:text-[34px] font-normal tracking-[-0.015em] text-white">What you&apos;re promoting.</h2>
            </div>
            <p className="pb-editorial text-[17px] md:text-[18px] leading-[1.6] text-white/70 max-w-[760px]">
              Profit Builders is a real-time institutional options-flow scanner built on OPRA-direct data from all 17 US options exchanges. It surfaces roughly 21,000 institutional prints a day — about $8&ndash;10 billion in premium — and grades each for conviction, so only the strongest signal rises to the top. Its grading methodology and every signal&apos;s win/loss outcome are published openly at <Link href="/methodology" className="text-[#60a5fa] hover:text-white transition-colors">/methodology</Link>. It&apos;s a product you can promote without hand-waving — the results are on the table.
            </p>
          </div>
        </section>

        {/* IV. Questions */}
        <section className="py-16 px-6 border-b pb-hairline">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-baseline gap-3 mb-8">
              <span className="pb-editorial italic text-[#60a5fa] text-[36px] leading-none">IV.</span>
              <h2 className="pb-editorial text-[28px] md:text-[34px] font-normal tracking-[-0.015em] text-white">Questions.</h2>
            </div>
            <div className="border-t pb-hairline">
              {FAQ.map(([q, a]) => (
                <div key={q} className="py-6 border-b pb-hairline">
                  <h3 className="pb-editorial text-[19px] md:text-[21px] text-white mb-2 leading-[1.3]">{q}</h3>
                  <p className="pb-editorial text-[16px] leading-[1.6] text-white/65 max-w-[760px]">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Apply CTA */}
        <section className="py-16 px-6 border-b pb-hairline">
          <div className="max-w-5xl mx-auto">
            <h2 className="pb-editorial text-[28px] md:text-[34px] font-normal tracking-[-0.015em] text-white mb-3">Apply.</h2>
            <p className="pb-editorial text-[16px] leading-[1.6] text-white/65 max-w-[760px] mb-5">
              Send a note about your audience, channel, and where you&apos;d promote. Approved partners get a tracked link and terms the same week.
            </p>
            <a href={APPLY_HREF} className="pb-mono text-[15px] md:text-[17px] text-[#60a5fa] hover:text-white transition-colors break-all border-b border-[#60a5fa]/40 pb-0.5">{APPLY_EMAIL}</a>
          </div>
        </section>

        {/* Distinction + verification note */}
        <section className="py-10 px-6">
          <div className="max-w-5xl mx-auto space-y-3">
            <p className="pb-mono text-[11px] leading-[1.7] text-white/45 tracking-[0.02em]">
              Already a subscriber? The <Link href="/refer" className="text-white/65 hover:text-white transition-colors">Refer &amp; Earn</Link> program gives you a $99 account credit per referred friend. This affiliate program is for partners promoting to an audience — paid in recurring cash.
            </p>
            <p className="pb-mono text-[11px] leading-[1.7] text-white/35 tracking-[0.02em]">
              Commission rate, attribution window, and payout terms are confirmed on approval. Product stats verified against Profit Builders&apos; live pipeline.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
