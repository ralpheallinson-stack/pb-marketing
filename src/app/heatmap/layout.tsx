import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "GEX Heatmap",
  description: "Real-time gamma exposure heatmap by strike and expiry. See dealer positioning, zero-gamma levels, and net GEX across 20 symbols.",
  alternates: { canonical: "https://profitbuilders.org/heatmap" },
  robots: { index: false, follow: true },
}

export default function HeatmapLayout({ children }: { children: React.ReactNode }) {
  return children
}
