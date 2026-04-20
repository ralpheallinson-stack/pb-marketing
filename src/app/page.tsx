import Nav from "@/components/Nav"
import HeroSection from "@/components/HeroSection"
import TrackRecord from "@/components/TrackRecord"
import GexSection from "@/components/GexSection"
import FeaturesSection from "@/components/FeaturesSection"
import Pricing from "@/components/Pricing"
import EmailCapture from "@/components/EmailCapture"
import FAQ from "@/components/FAQ"
import Footer from "@/components/Footer"

const appSchema = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Profit Builders",
  "url": "https://profitbuilders.io",
  "applicationCategory": "FinanceApplication",
  "applicationSubCategory": "Options Flow Scanner",
  "operatingSystem": "Web, iOS, Android (Discord + Telegram alerts)",
  "description": "Real-time institutional options flow scanner with conviction grading, Greeks, IV, and spread detection. 174,000+ signals tracked publicly at /results.",
  "featureList": [
    "Conviction grading (Grade A / Grade B) via 9-filter engine",
    "Real-time sweep and block detection",
    "Market maker filtering at the database layer",
    "Accumulation pattern detection with RAPID badges",
    "GEX heatmap across 220 symbols",
    "Public track record at profitbuilders.io/results",
    "Discord and Telegram alerts within 1-3 seconds",
  ],
  "offers": [
    {
      "@type": "Offer",
      "name": "Flow Scanner",
      "price": "99.00",
      "priceCurrency": "USD",
      "priceValidUntil": "2027-01-01",
      "url": "https://profitbuilders.io/pricing",
      "availability": "https://schema.org/InStock",
    },
    {
      "@type": "Offer",
      "name": "GEX Heatmap",
      "price": "39.00",
      "priceCurrency": "USD",
      "priceValidUntil": "2027-01-01",
      "url": "https://profitbuilders.io/pricing",
      "availability": "https://schema.org/InStock",
    },
    {
      "@type": "Offer",
      "name": "Pro Bundle (Flow + GEX)",
      "price": "129.00",
      "priceCurrency": "USD",
      "priceValidUntil": "2027-01-01",
      "url": "https://profitbuilders.io/pricing",
      "availability": "https://schema.org/InStock",
    },
  ],
})

const organizationSchema = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Profit Builders",
  "alternateName": "Profit Builders Flow Scanner",
  "url": "https://profitbuilders.io",
  "logo": "https://profitbuilders.io/images/pb-logo.png",
  "description": "Institutional options flow scanner with conviction grading and a public track record of 174,000+ signal outcomes.",
  "foundingDate": "2024",
  "sameAs": [
    "https://x.com/profitbuildersio"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Customer Support",
    "email": "support@profitbuilders.io",
    "url": "https://profitbuilders.io"
  }
})

const websiteSchema = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Profit Builders",
  "url": "https://profitbuilders.io",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://profitbuilders.io/blog?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
})

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: appSchema }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: organizationSchema }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: websiteSchema }} />
      <Nav />
      <HeroSection />
      <div className="border-t border-white/[0.05]"><FeaturesSection /></div>
      <div className="border-t border-white/[0.05]"><GexSection /></div>
      <div className="border-t border-white/[0.05]"><TrackRecord /></div>
      {/* Mid-page CTA */}
      <section className="border-t border-white/[0.05] bg-[#0E1117] w-full py-12 px-6">
        <div className="max-w-lg mx-auto text-center">
          <p className="text-white/40 text-sm mb-4">
            Grade A signals. Verified track record. Free to start.
          </p>
          <a href="/pricing"
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-[#0a0d12] font-bold px-8 py-4 rounded-full text-base transition-all">
            Start Free 7-Day Trial
          </a>
          <p className="text-white/30 text-xs mt-3">
            Cancel anytime · No credit card games
          </p>
        </div>
      </section>
      <div className="border-t border-white/[0.05]"><EmailCapture /></div>

      {/* Flow Brief secondary CTA — for experienced traders who want daily intel without the course */}
      <section className="border-t border-white/[0.05] bg-[#0E1117] w-full py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-[10px] text-[#F97316] uppercase tracking-[4px] font-bold mb-4">ALREADY READING FLOW?</div>
          <h2 className="text-white font-bold text-2xl sm:text-3xl mb-3 leading-tight" style={{ fontFamily: "Georgia, serif" }}>
            Get the Daily Flow Brief instead.
          </h2>
          <p className="text-white/50 text-[15px] mb-6 max-w-lg mx-auto leading-relaxed">
            Skip the course. Every weekday at 8:45 AM ET, a free summary of yesterday&apos;s top Grade A prints, accumulation, and closed P&amp;L.
          </p>
          <a href="/newsletter"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/20 text-white font-semibold px-7 py-3 rounded-full text-[14px] transition-all">
            Subscribe to the Flow Brief →
          </a>
        </div>
      </section>

      <div className="border-t border-white/[0.05]"><Pricing /></div>
      <div className="border-t border-white/[0.05]"><FAQ /></div>
      <Footer />
    </>
  )
}
