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
  "operatingSystem": "Web",
  "description": "Real-time institutional options flow scanner with conviction grading, Greeks, IV, and spread detection. 174K+ signals tracked publicly.",
  "offers": {
    "@type": "Offer",
    "price": "99.00",
    "priceCurrency": "USD",
    "priceValidUntil": "2027-01-01",
    "url": "https://profitbuilders.io/#pricing"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": 5,
    "bestRating": 5,
    "worstRating": 1,
    "reviewCount": 3000
  }
})

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: appSchema }} />
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
          <a href="https://buy.stripe.com/7sYdRbcs8bqTfC21j50RG07"
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-[#0a0d12] font-bold px-8 py-4 rounded-full text-base transition-all">
            Start Free 7-Day Trial
          </a>
          <p className="text-white/30 text-xs mt-3">
            Cancel anytime · No credit card games
          </p>
        </div>
      </section>
      <div className="border-t border-white/[0.05]"><EmailCapture /></div>
      <div className="border-t border-white/[0.05]"><Pricing /></div>
      <div className="border-t border-white/[0.05]"><FAQ /></div>
      <Footer />
    </>
  )
}
