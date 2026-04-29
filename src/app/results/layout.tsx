import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Data Methodology — Profit Builders",
  description: "How Profit Builders processes institutional options flow: OPRA tape ingest, Reg-NMS Intermarket Sweep detection, Black-Scholes-Merton Greeks, prior-day OI from Polygon EOD.",
  alternates: { canonical: "https://profitbuilders.io/results" },
  openGraph: {
    title: "Data Methodology — Profit Builders",
    description: "How Profit Builders processes institutional options flow.",
    url: "https://profitbuilders.io/results",
    images: [{ url: "/images/og-results.png", width: 1200, height: 630, alt: "Profit Builders Data Methodology" }],
  },
  twitter: { card: "summary_large_image", images: ["/images/og-results.png"] },
}

const breadcrumbSchema = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://profitbuilders.io" },
    { "@type": "ListItem", "position": 2, "name": "Methodology", "item": "https://profitbuilders.io/results" },
  ],
})

export default function ResultsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbSchema }} />
      <h1 className="sr-only">Profit Builders Data Methodology — How We Process Institutional Options Flow</h1>
      {children}
    </>
  )
}
