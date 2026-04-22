import Nav from "@/components/Nav"
import Footer from "@/components/Footer"
import Link from "next/link"
import { EmailSignup } from "@/components/EmailSignup"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Options Flow Cheat Sheet — Free Printable Reference",
  description: "Free one-page cheat sheet covering the 9-filter conviction engine, Grade A/B thresholds, sweep vs block decoder, Vol/OI reference, and accumulation checklist.",
  alternates: { canonical: "https://profitbuilders.io/cheat-sheet" },
  openGraph: {
    title: "Options Flow Cheat Sheet — Free Printable Reference",
    description: "One page. The 9-filter conviction framework. Grade thresholds. Sweep vs block decoder. Free.",
    url: "https://profitbuilders.io/cheat-sheet",
    type: "website",
    images: [{ url: "/images/og-card.png", width: 1200, height: 630, alt: "Profit Builders Options Flow Cheat Sheet" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Options Flow Cheat Sheet",
    description: "One page. The 9-filter conviction framework. Free printable reference.",
    images: ["/images/og-card.png"],
  },
}

const FAQ_ITEMS = [
  {
    q: "What's on the cheat sheet?",
    a: "One page covering six frameworks: the 9-filter conviction engine, Grade A/B premium and Vol/OI thresholds, the sweep vs block decoder, a Vol/OI reference table, the accumulation checklist, and the morning edge routine.",
  },
  {
    q: "Is it free?",
    a: "Yes. Enter your email, you get the cheat sheet and the free Flow Brief newsletter. Unsubscribe from the Flow Brief with one click any time — the cheat sheet is yours to keep.",
  },
  {
    q: "What format is it in?",
    a: "A printable web page designed to fit on one sheet of paper. Hit Cmd+P (Mac) or Ctrl+P (Windows) to save it as a PDF or print a physical copy for your desk.",
  },
  {
    q: "Do I have to take the 5-day course too?",
    a: "No. The cheat sheet is a standalone reference. If you want the long-form lessons with real scanner examples behind each framework, you can opt into the free 5-day email course separately.",
  },
]

const webpageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "The Options Flow Cheat Sheet",
  "url": "https://profitbuilders.io/cheat-sheet",
  "description": "Free printable one-page options flow reference covering the 9-filter conviction engine, grade thresholds, and key flow patterns.",
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
    { "@type": "ListItem", "position": 2, "name": "Cheat Sheet", "item": "https://profitbuilders.io/cheat-sheet" },
  ],
}

export default function CheatSheetPage() {
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
            Free · One-Page Reference · Printable
          </div>
          <h1 className="text-[40px] sm:text-[54px] font-bold text-gray-950 leading-[1.05] tracking-[-0.03em] mb-6">
            The Options Flow Cheat Sheet
          </h1>
          <p className="text-[18px] text-gray-500 leading-relaxed max-w-2xl mx-auto mb-10">
            Every filter the conviction engine uses to grade institutional options flow. The 9-filter framework, premium and Vol/OI thresholds, sweep vs block decoder, accumulation checklist, and the morning edge routine — on one printable page.
          </p>

          <div className="max-w-lg mx-auto">
            <EmailSignup source="cheat-sheet" variant="flow-brief" />
          </div>

          <p className="text-[12px] text-gray-400 mt-4">
            You&apos;ll get the cheat sheet link immediately and auto-subscribed to the free Flow Brief newsletter.
          </p>
        </section>

        {/* ── WHAT'S INSIDE ── */}
        <section className="max-w-3xl mx-auto px-6 py-16 border-t border-gray-100">
          <div className="text-[11px] text-gray-400 uppercase tracking-[3px] font-semibold mb-3">WHAT&apos;S ON IT</div>
          <h2 className="text-[28px] sm:text-[32px] font-bold text-gray-950 leading-tight tracking-[-0.02em] mb-10">
            Six frameworks. One page. Enough to work a live scanner.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 border border-gray-200 rounded-lg">
              <div className="text-[#F97316] font-bold text-sm mb-2">1. The 9-Filter Conviction Engine</div>
              <p className="text-gray-600 text-[14px] leading-relaxed">
                Every filter a signal has to pass to earn Grade A or B — premium floor, Vol/OI ratio, DTE, fill aggression, market maker detection, and four more.
              </p>
            </div>
            <div className="p-5 border border-gray-200 rounded-lg">
              <div className="text-[#F97316] font-bold text-sm mb-2">2. Grade Thresholds</div>
              <p className="text-gray-600 text-[14px] leading-relaxed">
                The exact premium floors and Vol/OI minimums that separate Grade A from Grade B. What reaches your screen versus what gets filtered.
              </p>
            </div>
            <div className="p-5 border border-gray-200 rounded-lg">
              <div className="text-[#F97316] font-bold text-sm mb-2">3. Sweep vs Block Decoder</div>
              <p className="text-gray-600 text-[14px] leading-relaxed">
                How to read urgency versus planned positioning from the execution type — and what the fill price tells you about conviction direction.
              </p>
            </div>
            <div className="p-5 border border-gray-200 rounded-lg">
              <div className="text-[#F97316] font-bold text-sm mb-2">4. Vol/OI Reference</div>
              <p className="text-gray-600 text-[14px] leading-relaxed">
                Thresholds at a glance — under 2x, 5x+, 20x+. What each range says about whether the flow is new institutional money or recycled positioning.
              </p>
            </div>
            <div className="p-5 border border-gray-200 rounded-lg">
              <div className="text-[#F97316] font-bold text-sm mb-2">5. Accumulation Checklist</div>
              <p className="text-gray-600 text-[14px] leading-relaxed">
                The four criteria for confirming institutional accumulation — same contract, repeat prints, aggressive fills, elevated Vol/OI.
              </p>
            </div>
            <div className="p-5 border border-gray-200 rounded-lg">
              <div className="text-[#F97316] font-bold text-sm mb-2">6. Morning Edge Routine</div>
              <p className="text-gray-600 text-[14px] leading-relaxed">
                The 30-minute window at the open where the most actionable flow hits the tape. What to scan first and what to ignore until later.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECONDARY CTA ── */}
        <section className="max-w-3xl mx-auto px-6 py-16 border-t border-gray-100">
          <div className="max-w-lg mx-auto">
            <EmailSignup source="cheat-sheet" variant="flow-brief" />
          </div>
          <div className="text-center mt-6 text-[13px] text-gray-400">
            Want the long-form lessons with real scanner examples? <Link href="/blog/what-is-options-flow-trading" className="text-[#F97316] hover:underline font-semibold">Take the free 5-day course →</Link>
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
      </main>

      <Footer />
    </>
  )
}
