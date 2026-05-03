import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Methodology — Profit Builders",
  description: "This page has moved to /methodology.",
  alternates: { canonical: "https://profitbuilders.io/methodology" },
  robots: { index: false, follow: true },
}

export default function ResultsLayout({ children }: { children: React.ReactNode }) {
  return children
}
