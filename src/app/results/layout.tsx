import type { Metadata } from "next"

// /results is a deprecated URL — Flask 301-redirects to /methodology. This
// layout exists so the static export builds; it sets noindex so search
// engines don't index the redirect shell.
export const metadata: Metadata = {
  title: "Methodology — Profit Builders",
  description: "Redirecting to /methodology…",
  alternates: { canonical: "https://profitbuilders.io/methodology" },
  robots: { index: false, follow: false },
}

export default function ResultsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
