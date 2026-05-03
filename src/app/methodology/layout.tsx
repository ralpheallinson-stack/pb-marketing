import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Methodology — How Profit Builders Grades Options Flow",
  description: "How we classify Grade A/B/C signals: CBOE Rule 6.11 sweep detection, OPRA condition codes, NBBO aggression scoring, and 174,000+ verified outcomes since 2024.",
  alternates: { canonical: "https://profitbuilders.io/methodology" },
  openGraph: {
    title: "Methodology — How Profit Builders Grades Options Flow",
    description: "CBOE-compliant sweep detection, OPRA condition codes, NBBO aggression scoring, 174K+ verified outcomes.",
    url: "https://profitbuilders.io/methodology",
    type: "article",
  },
}

export default function MethodologyLayout({ children }: { children: React.ReactNode }) {
  return children
}
