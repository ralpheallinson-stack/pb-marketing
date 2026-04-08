import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Verified Options Flow Track Record",
  description: "39% Grade A win rate across 24,500+ tracked signals. Full P&L transparency on every institutional options flow signal. No cherry-picking.",
  alternates: { canonical: "https://profitbuilders.org/results" },
  openGraph: {
    title: "Verified Options Flow Track Record | Profit Builders",
    description: "39% Grade A win rate across 24,500+ tracked signals. Every outcome public.",
    url: "https://profitbuilders.org/results",
    images: [{ url: "/images/og-results.png", width: 1200, height: 630, alt: "Profit Builders Track Record" }],
  },
  twitter: { card: "summary_large_image", images: ["/images/og-results.png"] },
}

export default function ResultsLayout({ children }: { children: React.ReactNode }) {
  return children
}
