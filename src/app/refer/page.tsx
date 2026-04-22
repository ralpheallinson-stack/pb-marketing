import Nav from "@/components/Nav"
import Footer from "@/components/Footer"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Refer a Trader, Earn $99 Per Signup",
  description: "Refer a trader who subscribes and earn a $99 Stripe credit on every paid conversion. No cap, no expiration, applied automatically to your next invoice.",
  alternates: { canonical: "https://profitbuilders.io/refer" },
  openGraph: {
    title: "Refer a Trader, Earn $99 Per Signup",
    description: "Earn $99 per paid referral. No cap. Applied automatically to your Stripe balance.",
    url: "https://profitbuilders.io/refer",
    type: "website",
    images: [{ url: "/images/og-card.png", width: 1200, height: 630, alt: "Profit Builders Referral Program" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Refer a Trader, Earn $99 Per Signup",
    description: "Earn $99 per paid referral. No cap. Applied automatically.",
    images: ["/images/og-card.png"],
  },
}

const FAQ_ITEMS = [
  {
    q: "How much do I earn per referral?",
    a: "$99 as a Stripe account credit, applied automatically when your referral completes their first paid invoice (usually after the 7-day trial). That's the equivalent of one free month for every converted referral.",
  },
  {
    q: "Is there a cap on how many I can refer?",
    a: "No cap. Refer ten people, earn $990 in credits. Refer a hundred, earn $9,900. The credits offset your subscription for as long as you've earned them.",
  },
  {
    q: "When does the reward fire?",
    a: "Your reward fires when your referral completes their first paid invoice — typically right after the 7-day free trial ends. If they cancel before paying, the reward doesn't trigger.",
  },
  {
    q: "Where do I find my referral link?",
    a: "Your unique link is on your /account page (if you're logged in) and in the welcome email we sent when you subscribed. You can also look it up by email at /referral/dashboard.",
  },
  {
    q: "How is the credit applied?",
    a: "Automatically via the Stripe customer balance. When your next invoice generates, the credit is applied before charge. You'll see it on the Stripe invoice as a line item.",
  },
]

const webpageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Profit Builders Referral Program",
  "url": "https://profitbuilders.io/refer",
  "description": "Earn $99 Stripe credit for every paid referral. No cap, applied automatically.",
  "publisher": {
    "@type": "Organization",
    "name": "Profit Builders",
    "url": "https://profitbuilders.io",
  },
}

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": FAQ_ITEMS.map(f => ({
    "@type": "Question",
    "name": f.q,
    "acceptedAnswer": { "@type": "Answer", "text": f.a },
  })),
}

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://profitbuilders.io" },
    { "@type": "ListItem", "position": 2, "name": "Refer & Earn", "item": "https://profitbuilders.io/refer" },
  ],
}

export default function ReferPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webpageSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <Nav />

      <main className="bg-white">
        {/* ── HERO ── */}
        <section className="max-w-3xl mx-auto px-6 pt-20 pb-12 text-center">
          <div className="inline-block text-[10px] text-[#F97316] uppercase tracking-[4px] font-bold mb-5 border border-[#F97316]/30 rounded-full px-4 py-1.5">
            Referral Program · No Cap
          </div>
          <h1 className="text-[40px] sm:text-[56px] font-bold text-gray-950 leading-[1.05] tracking-[-0.03em] mb-6">
            Refer a trader. Earn $99.
          </h1>
          <p className="text-[18px] text-gray-500 leading-relaxed max-w-2xl mx-auto mb-10">
            Every paid referral earns you a $99 Stripe credit — the equivalent of one free month. Applied automatically to your next invoice. No cap. No expiration.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/account"
              className="inline-flex items-center gap-2 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold px-7 py-3 rounded-full text-[14px] transition-colors"
            >
              Get your referral link →
            </Link>
            <Link
              href="/referral/dashboard"
              className="inline-flex items-center gap-2 text-gray-700 hover:text-[#F97316] font-semibold text-[14px]"
            >
              Look up by email →
            </Link>
          </div>
        </section>

        {/* ── MATH ── */}
        <section className="max-w-3xl mx-auto px-6 py-16 border-t border-gray-100">
          <div className="text-[11px] text-gray-400 uppercase tracking-[3px] font-semibold mb-3">THE MATH</div>
          <h2 className="text-[28px] sm:text-[32px] font-bold text-gray-950 leading-tight tracking-[-0.02em] mb-10">
            $99 for each paid referral. No cap.
          </h2>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-5 border border-gray-200 rounded-lg text-center">
              <div className="text-[11px] text-gray-400 uppercase tracking-[3px] font-semibold mb-2">1 REFERRAL</div>
              <div className="text-[32px] font-bold text-gray-950" style={{ letterSpacing: "-0.03em" }}>$99</div>
              <div className="text-[12px] text-gray-500 mt-2">One free month</div>
            </div>
            <div className="p-5 border border-gray-200 rounded-lg text-center bg-[#FFF7ED]">
              <div className="text-[11px] text-[#F97316] uppercase tracking-[3px] font-semibold mb-2">5 REFERRALS</div>
              <div className="text-[32px] font-bold text-[#F97316]" style={{ letterSpacing: "-0.03em" }}>$495</div>
              <div className="text-[12px] text-gray-600 mt-2">5+ months free</div>
            </div>
            <div className="p-5 border border-gray-200 rounded-lg text-center">
              <div className="text-[11px] text-gray-400 uppercase tracking-[3px] font-semibold mb-2">10 REFERRALS</div>
              <div className="text-[32px] font-bold text-gray-950" style={{ letterSpacing: "-0.03em" }}>$990</div>
              <div className="text-[12px] text-gray-500 mt-2">Nearly a year free</div>
            </div>
          </div>
        </section>

        {/* ── HOW ── */}
        <section className="max-w-3xl mx-auto px-6 py-16 border-t border-gray-100">
          <div className="text-[11px] text-gray-400 uppercase tracking-[3px] font-semibold mb-3">HOW IT WORKS</div>
          <h2 className="text-[28px] sm:text-[32px] font-bold text-gray-950 leading-tight tracking-[-0.02em] mb-10">
            Four steps from share to credit.
          </h2>

          <div className="space-y-5">
            {[
              { num: 1, title: "Grab your link.", body: "Every paid subscriber gets a unique referral link at /account. It looks like profitbuilders.io/ref/REF-XXXXXXXX." },
              { num: 2, title: "Share it.", body: "Paste it anywhere — X, group chat, Discord, email. Every visitor clicking through is tracked to your code via session cookie." },
              { num: 3, title: "They convert.", body: "When someone signs up through your link and completes their first paid invoice (usually after the 7-day trial), the referral is marked converted." },
              { num: 4, title: "Credit fires.", body: "$99 Stripe credit is automatically applied to your balance. It offsets your next invoice. No action required on your side." },
            ].map(s => (
              <div key={s.num} className="flex gap-4">
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[#F97316] text-white font-bold text-sm flex items-center justify-center">
                  {s.num}
                </div>
                <div>
                  <div className="font-bold text-gray-950 text-[17px] mb-1">{s.title}</div>
                  <div className="text-gray-600 text-[14px] leading-relaxed">{s.body}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="max-w-3xl mx-auto px-6 py-16 border-t border-gray-100">
          <div className="text-[11px] text-gray-400 uppercase tracking-[3px] font-semibold mb-3">QUESTIONS</div>
          <h2 className="text-[28px] sm:text-[32px] font-bold text-gray-950 leading-tight tracking-[-0.02em] mb-10">
            FAQ
          </h2>
          <div className="space-y-6">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} className="border-b border-gray-100 pb-6 last:border-0">
                <div className="text-gray-900 font-semibold text-[16px] mb-2">{item.q}</div>
                <p className="text-gray-600 text-[14px] leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="max-w-3xl mx-auto px-6 py-16 border-t border-gray-100 text-center">
          <h2 className="text-[28px] font-bold text-gray-950 leading-tight tracking-[-0.02em] mb-4">
            Ready to earn credits?
          </h2>
          <p className="text-[15px] text-gray-500 mb-8 max-w-md mx-auto">
            If you&apos;re already a subscriber, your referral link is on your account page. If not, start with a 7-day free trial.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/account"
              className="inline-flex items-center gap-2 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold px-7 py-3 rounded-full text-[14px] transition-colors"
            >
              Go to my account →
            </Link>
            <Link
              href="/free-scanner"
              className="inline-flex items-center gap-2 text-gray-700 hover:text-[#F97316] font-semibold text-[14px]"
            >
              Or start a free trial →
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
