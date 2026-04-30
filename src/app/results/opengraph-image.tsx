import { renderOgCard, OG_SIZE } from "@/lib/og-card"

export const alt = "Profit Builders Data Methodology"
export const size = OG_SIZE
export const contentType = "image/png"
export const dynamic = "force-static"

export default function Image() {
  return renderOgCard({
    kicker: "Data Methodology",
    headline: "How we process the OPRA tape.",
    subhead: "CBOE Rule 6.11 sweep detection · OPRA condition codes · Black-Scholes-Merton Greeks · NBBO aggression classification",
    chips: ["OPRA", "CBOE", "BSM", "NBBO"],
    liveLabel: "Methodology",
    liveColor: "accent",
    ctaRight: { value: "220+", label: "symbols covered" },
  })
}
