import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Verified Options Flow Track Record",
  description: "39.3% Grade A win rate across 174,000+ tracked signals. Full P&L transparency on every institutional options flow signal. No cherry-picking.",
  alternates: { canonical: "https://profitbuilders.io/results" },
  openGraph: {
    title: "Verified Options Flow Track Record",
    description: "39.3% Grade A win rate across 174,000+ tracked signals. Every outcome public.",
    url: "https://profitbuilders.io/results",
    images: [{ url: "/images/og-results.png", width: 1200, height: 630, alt: "Profit Builders Track Record" }],
  },
  twitter: { card: "summary_large_image", images: ["/images/og-results.png"] },
}

const breadcrumbSchema = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://profitbuilders.io" },
    { "@type": "ListItem", "position": 2, "name": "Results", "item": "https://profitbuilders.io/results" },
  ],
})

export default function ResultsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbSchema }} />
      <h1 className="sr-only">Profit Builders Options Flow Signal Track Record — 174,000+ Tracked Outcomes</h1>
      {children}
    </>
  )
}
