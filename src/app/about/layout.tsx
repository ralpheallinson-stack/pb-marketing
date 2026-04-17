import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About",
  description: "Profit Builders tracks institutional options flow in real time. 9 conviction filters, regime-aware grading, and full P&L transparency on every signal.",
  alternates: { canonical: "https://profitbuilders.io/about" },
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children
}
