import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Free Options Flow Scanner",
  description: "Free real-time options flow scanner showing institutional sweeps and blocks. See unusual options activity with 15-minute delayed data. No signup required.",
  alternates: { canonical: "https://profitbuilders.org/free-scanner" },
  openGraph: {
    title: "Free Options Flow Scanner | Profit Builders",
    description: "See institutional sweeps and blocks for free. 15-minute delayed data.",
    url: "https://profitbuilders.org/free-scanner",
    images: [{ url: "/images/og-free-scanner.png", width: 1200, height: 630, alt: "Free Options Flow Scanner" }],
  },
  twitter: { card: "summary_large_image", images: ["/images/og-free-scanner.png"] },
}

export default function FreeScannerLayout({ children }: { children: React.ReactNode }) {
  return children
}
