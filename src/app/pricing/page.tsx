import Nav from "@/components/Nav"
import Pricing from "@/components/Pricing"
import Footer from "@/components/Footer"

export const metadata = {
  title: "Pricing — Options Flow Scanner",
  description: "Start with a 7-day free trial. Real-time flow scanner at $99/mo. GEX heatmap at $39/mo. Pro bundle at $129/mo. Card required — cancel anytime before day 7.",
  alternates: { canonical: "https://profitbuilders.io/pricing" },
}

const productSchema = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Profit Builders Options Flow Scanner",
  "description": "Real-time institutional options flow scanner with conviction grading, Greeks, IV, spread detection, and GEX heatmap. Live OPRA tape · CBOE Rule 6.11 sweeps at /results.",
  "image": [
    "https://profitbuilders.io/images/scanner-preview.png",
    "https://profitbuilders.io/opengraph-image"
  ],
  "brand": { "@type": "Brand", "name": "Profit Builders" },
  "url": "https://profitbuilders.io/pricing",
  "offers": [
    {
      "@type": "Offer",
      "name": "Flow Scanner",
      "price": "99.00",
      "priceCurrency": "USD",
      "priceValidUntil": "2027-01-01",
      "availability": "https://schema.org/InStock",
      "url": "https://profitbuilders.io/pricing",
    },
    {
      "@type": "Offer",
      "name": "GEX Heatmap",
      "price": "39.00",
      "priceCurrency": "USD",
      "priceValidUntil": "2027-01-01",
      "availability": "https://schema.org/InStock",
      "url": "https://profitbuilders.io/pricing",
    },
    {
      "@type": "Offer",
      "name": "Pro Bundle (Flow + GEX)",
      "price": "129.00",
      "priceCurrency": "USD",
      "priceValidUntil": "2027-01-01",
      "availability": "https://schema.org/InStock",
      "url": "https://profitbuilders.io/pricing",
    },
  ],
})

const breadcrumbSchema = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://profitbuilders.io" },
    { "@type": "ListItem", "position": 2, "name": "Pricing", "item": "https://profitbuilders.io/pricing" },
  ],
})

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#0E1117]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: productSchema }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbSchema }} />
      <Nav />
      <div className="pt-20">
        {/* Visually-hidden H1 for SEO — page design uses the Pricing component's internal headings */}
        <h1 className="sr-only">Profit Builders Pricing — Options Flow Scanner and GEX Heatmap</h1>
        <Pricing />
      </div>
      <Footer />
    </main>
  )
}
