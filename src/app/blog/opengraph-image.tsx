import { renderOgCard, OG_SIZE } from "@/lib/og-card"

export const alt = "Profit Builders Blog — Options Flow Education"
export const size = OG_SIZE
export const contentType = "image/png"
export const dynamic = "force-static"

export default function Image() {
  return renderOgCard({
    kicker: "The Profit Builders Blog",
    headline: "How institutional flow works.",
    subhead: "Sweep vs block decoding · OPRA condition codes · Greeks for flow · daily flow recaps · scanner color guide",
    chips: ["SWEEPS", "GREEKS", "RECAPS", "GUIDES"],
    liveLabel: "Written by Traders",
    liveColor: "accent",
    ctaRight: { value: "Daily", label: "flow recaps" },
  })
}
