import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About Profit Builders — Built by an Active Options Trader",
  description: "How Profit Builders started: a one-developer options-flow platform built on the live OPRA tape. Real-time sweeps, BSM Greeks, and 174,000+ verified outcomes.",
  alternates: { canonical: "https://profitbuilders.io/about" },
  openGraph: {
    title: "About Profit Builders",
    description: "How Profit Builders started: a one-developer options-flow platform built on the live OPRA tape.",
    url: "https://profitbuilders.io/about",
    type: "website",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Profit Builders Options Flow Scanner" }],
  },
  twitter: { card: "summary_large_image", images: ["/opengraph-image"] },
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children
}
