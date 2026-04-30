import Nav from "@/components/Nav"
import Footer from "@/components/Footer"
import Link from "next/link"
import { EmailSignup } from "@/components/EmailSignup"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Daily Options Flow Newsletter — The Flow Brief",
  description: "Free daily newsletter. Yesterday's top Grade A prints, accumulation patterns, and closed P&L delivered weekday mornings at 8:45 AM ET.",
  alternates: {
    canonical: "https://profitbuilders.io/newsletter",
  },
  openGraph: {
    title: "The Flow Brief — Daily Options Flow Newsletter",
    description: "Yesterday's institutional options flow delivered weekday mornings at 8:45 AM ET. Free.",
    url: "https://profitbuilders.io/newsletter",
    type: "website",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "The Flow Brief — Daily Options Flow Newsletter" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Flow Brief — Daily Options Flow Newsletter",
    description: "Yesterday's institutional options flow delivered weekday mornings at 8:45 AM ET. Free.",
  },
}

const FAQ_ITEMS = [
  {
    q: "What is the Flow Brief?",
    a: "The Flow Brief is a free daily email sent every weekday at 8:45 AM ET. Each issue summarizes yesterday's institutional options flow — top Grade A prints by premium, accumulation patterns building across the tape, and closed-position P&L from signals that resolved the day before.",
  },
  {
    q: "Is the Flow Brief free?",
    a: "Yes. The Flow Brief is free with no credit card required. You can unsubscribe with one click from any email.",
  },
  {
    q: "How often will I receive emails?",
    a: "You'll receive one Flow Brief email every weekday morning at 8:45 AM ET (Monday through Friday). No weekend emails unless you also opt into the Sunday Week Ahead preview.",
  },
  {
    q: "What's the difference between the Flow Brief and the 5-day email course?",
    a: "The 5-day email course teaches you how to read options flow — one lesson per day covering sweeps, Vol/OI, accumulation, and conviction grading. The Flow Brief is the ongoing daily newsletter that delivers real flow data every trading day. If you complete the course, you're automatically graduated into the Flow Brief.",
  },
  {
    q: "How is this different from a paid options flow scanner?",
    a: "The Flow Brief summarizes what already happened yesterday — useful for pattern recognition and context. The Profit Builders scanner shows you institutional flow in real time as it hits the tape, with sweep detection and OPRA condition-code parsing. The brief is a free daily summary; the scanner is the live feed.",
  },
]

const articleSchema = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "The Flow Brief — Free Daily Options Flow Newsletter",
  "url": "https://profitbuilders.io/newsletter",
  "description": "Free daily options flow newsletter. Yesterday's top Grade A prints, accumulation patterns, and closed P&L delivered at 8:45 AM ET.",
  "publisher": {
    "@type": "Organization",
    "name": "Profit Builders",
    "url": "https://profitbuilders.io",
    "logo": "https://profitbuilders.io/images/pb-logo.png",
  },
})

const faqSchema = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": FAQ_ITEMS.map(item => ({
    "@type": "Question",
    "name": item.q,
    "acceptedAnswer": { "@type": "Answer", "text": item.a },
  })),
})

const breadcrumbSchema = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://profitbuilders.io" },
    { "@type": "ListItem", "position": 2, "name": "Newsletter", "item": "https://profitbuilders.io/newsletter" },
  ],
})

export default function NewsletterPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: articleSchema }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqSchema }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbSchema }} />

      <Nav />

      <main className="bg-white">
        {/* ── HERO ── */}
        <section className="max-w-3xl mx-auto px-6 pt-20 pb-12 text-center">
          <div className="inline-block text-[10px] text-[#F97316] uppercase tracking-[4px] font-bold mb-5 border border-[#F97316]/30 rounded-full px-4 py-1.5">
            Free · Weekday Mornings · 8:45 AM ET
          </div>
          <h1 className="text-[40px] sm:text-[56px] font-bold text-gray-950 leading-[1.05] tracking-[-0.03em] mb-6" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
            The Daily Options Flow Brief
          </h1>
          <p className="text-[18px] text-gray-500 leading-relaxed max-w-2xl mx-auto mb-10">
            Yesterday&apos;s institutional options flow, delivered every trading morning before the open. Top Grade A prints, accumulation patterns, and the closed-position P&amp;L that hit overnight. Free.
          </p>

          <div className="max-w-lg mx-auto">
            <EmailSignup source="flow-brief" variant="flow-brief" />
          </div>
        </section>

        {/* ── WHAT'S INSIDE ── */}
        <section className="max-w-3xl mx-auto px-6 py-16 border-t border-gray-100">
          <div className="text-[11px] text-gray-400 uppercase tracking-[3px] font-semibold mb-3">WHAT&apos;S INSIDE EACH ISSUE</div>
          <h2 className="text-[28px] sm:text-[32px] font-bold text-gray-950 leading-tight tracking-[-0.02em] mb-10" style={{ fontFamily: "Georgia, serif" }}>
            The flow that mattered yesterday — in under a minute.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-[#F97316] font-bold text-sm mb-2">Top Grade A Prints</div>
              <p className="text-gray-600 text-[14px] leading-relaxed">
                The largest institutional flow that passed all 9 conviction filters. Ticker, direction, size.
              </p>
            </div>
            <div>
              <div className="text-[#F97316] font-bold text-sm mb-2">Accumulation Patterns</div>
              <p className="text-gray-600 text-[14px] leading-relaxed">
                Where institutions built positions across multiple prints on the same contract.
              </p>
            </div>
            <div>
              <div className="text-[#F97316] font-bold text-sm mb-2">Closed-Position P&amp;L</div>
              <p className="text-gray-600 text-[14px] leading-relaxed">
                Previously flagged Grade A signals that resolved — wins and losses, fully auditable.
              </p>
            </div>
          </div>
        </section>

        {/* ── SAMPLE ── */}
        <section className="max-w-3xl mx-auto px-6 py-16 border-t border-gray-100">
          <div className="text-[11px] text-gray-400 uppercase tracking-[3px] font-semibold mb-3">SAMPLE</div>
          <h2 className="text-[28px] sm:text-[32px] font-bold text-gray-950 leading-tight tracking-[-0.02em] mb-8" style={{ fontFamily: "Georgia, serif" }}>
            What a Flow Brief looks like.
          </h2>

          <div className="bg-gray-950 rounded-xl p-8 text-gray-300 text-[14px] leading-relaxed" style={{ fontFamily: "Georgia, serif" }}>
            <div className="text-[10px] text-gray-500 uppercase tracking-[3px] font-semibold mb-2">FLOW BRIEF · APRIL 17</div>
            <div className="text-white font-bold text-xl mb-5">$4.26B swept across a neutral tape.</div>
            <p className="mb-4">
              Tape leaned neutral Friday with a 52/48 buy split. VIX closed at 14.2. NVDA drew the most premium at $42M across 104 signals — but the real story was TSLA, where one call contract saw 38 repeat entries.
            </p>
            <p className="mb-4 text-gray-400">
              <span className="text-white font-semibold">Grade A standout:</span> A $14.2M block on semiconductor calls. Single print. Three-month horizon. Two other eight-figure blocks fired on names we can&apos;t detail here.
            </p>
            <p className="text-gray-400">
              <span className="text-[#22C55E] font-semibold">Receipts:</span> MU +128%, AMD +87%, GOOGL +52%. Three Grade A calls flagged earlier in the week closed green.
            </p>
          </div>
        </section>

        {/* ── SECONDARY CTA ── */}
        <section className="max-w-3xl mx-auto px-6 py-16 border-t border-gray-100">
          <div className="max-w-lg mx-auto">
            <EmailSignup source="flow-brief" variant="flow-brief" />
          </div>
          <div className="text-center mt-6 text-[13px] text-gray-400">
            New to options flow? <Link href="/blog/what-is-options-flow-trading" className="text-[#F97316] hover:underline font-semibold">Start with the 5-day email course →</Link>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="max-w-3xl mx-auto px-6 py-16 border-t border-gray-100">
          <div className="text-[11px] text-gray-400 uppercase tracking-[3px] font-semibold mb-3">QUESTIONS</div>
          <h2 className="text-[28px] sm:text-[32px] font-bold text-gray-950 leading-tight tracking-[-0.02em] mb-10" style={{ fontFamily: "Georgia, serif" }}>
            FAQ
          </h2>

          <div className="space-y-6">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} className="border-b border-gray-100 pb-6 last:border-0">
                <div className="text-gray-900 font-semibold text-[16px] mb-2" style={{ fontFamily: "Georgia, serif" }}>
                  {item.q}
                </div>
                <p className="text-gray-600 text-[14px] leading-relaxed">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── RELATED LINKS ── */}
        <section className="max-w-3xl mx-auto px-6 py-12 border-t border-gray-100">
          <div className="text-[11px] text-gray-400 uppercase tracking-[3px] font-semibold mb-4">RELATED</div>
          <div className="flex flex-wrap gap-4 text-[14px]">
            <Link href="/cheat-sheet" className="text-[#F97316] hover:underline font-semibold">Free Cheat Sheet</Link>
            <span className="text-gray-300">·</span>
            <Link href="/blog" className="text-[#F97316] hover:underline">Blog</Link>
            <span className="text-gray-300">·</span>
            <Link href="/results" className="text-[#F97316] hover:underline">Data Methodology</Link>
            <span className="text-gray-300">·</span>
            <Link href="/blog/how-to-read-options-flow" className="text-[#F97316] hover:underline">How to Read Options Flow</Link>
            <span className="text-gray-300">·</span>
            <Link href="/free-scanner" className="text-[#F97316] hover:underline">Free Scanner</Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
