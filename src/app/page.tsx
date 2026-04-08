import Nav from "@/components/Nav"
import Hero from "@/components/Hero"
import AlertCards from "@/components/AlertCards"
import WhyDifferent from "@/components/WhyDifferent"
import TrackRecord from "@/components/TrackRecord"
import Pricing from "@/components/Pricing"
import GexSection from "@/components/GexSection"
import EmailCapture from "@/components/EmailCapture"
import SocialProof from "@/components/SocialProof"
import FAQ from "@/components/FAQ"
import Footer from "@/components/Footer"

const appSchema = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Profit Builders",
  "url": "https://profitbuilders.org",
  "applicationCategory": "FinanceApplication",
  "operatingSystem": "Web",
  "description": "Real-time institutional options flow scanner with conviction grading, Greeks, IV, and spread detection. 174K+ signals tracked publicly.",
  "offers": {
    "@type": "Offer",
    "price": "99.00",
    "priceCurrency": "USD",
    "priceValidUntil": "2027-01-01",
    "url": "https://profitbuilders.org/#pricing"
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
      <Hero />
      <AlertCards />
      <WhyDifferent />
      <TrackRecord />
      <Pricing />
      <GexSection />
      <EmailCapture />
      <SocialProof />
      <FAQ />
      <Footer />
    </>
  )
}
