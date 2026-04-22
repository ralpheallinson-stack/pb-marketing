import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Free Options Flow Scanner",
  description: "Free real-time options flow scanner showing institutional sweeps and blocks. See unusual options activity with 15-minute delayed data. No signup required.",
  alternates: { canonical: "https://profitbuilders.io/free-scanner" },
  openGraph: {
    title: "Free Options Flow Scanner | Profit Builders",
    description: "See institutional sweeps and blocks for free. 15-minute delayed data.",
    url: "https://profitbuilders.io/free-scanner",
    images: [{ url: "/images/og-free-scanner.png", width: 1200, height: 630, alt: "Free Options Flow Scanner" }],
  },
  twitter: { card: "summary_large_image", images: ["/images/og-free-scanner.png"] },
}

const softwareAppSchema = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Profit Builders Free Flow Scanner",
  "applicationCategory": "FinanceApplication",
  "applicationSubCategory": "Options Flow Scanner",
  "operatingSystem": "Web",
  "url": "https://profitbuilders.io/free-scanner",
  "description": "Free real-time options flow scanner showing institutional sweeps and blocks with 15-minute delayed data. No signup required.",
  "isAccessibleForFree": true,
  "featureList": [
    "15-minute delayed institutional options flow",
    "Grade A / Grade B conviction filtering",
    "Sweep and block detection",
    "Real-time premium and Vol/OI display",
  ],
  "publisher": {
    "@type": "Organization",
    "name": "Profit Builders",
    "url": "https://profitbuilders.io",
  },
})

const breadcrumbSchema = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://profitbuilders.io" },
    { "@type": "ListItem", "position": 2, "name": "Free Scanner", "item": "https://profitbuilders.io/free-scanner" },
  ],
})

export default function FreeScannerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: softwareAppSchema }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbSchema }} />
      <h1 className="sr-only">Free Options Flow Scanner — Real-Time Institutional Sweeps and Blocks</h1>
      {children}
    </>
  )
}
