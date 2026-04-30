import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Learn Options Flow Trading",
  description: "Educational guides on reading institutional order flow, understanding options Greeks, and using conviction grading to find high-probability setups.",
  alternates: { canonical: "https://profitbuilders.io/blog" },
  openGraph: {
    title: "Learn Options Flow Trading | Profit Builders",
    description: "Guides on institutional order flow analysis and options trading strategies.",
    url: "https://profitbuilders.io/blog",
  },
  twitter: { card: "summary_large_image" },
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children
}
