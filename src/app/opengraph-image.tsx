import { renderOgCard, OG_SIZE } from "@/lib/og-card"

export const alt = "Profit Builders — Real-time institutional options flow"
export const size = OG_SIZE
export const contentType = "image/png"
export const dynamic = "force-static"

export default function Image() {
  return renderOgCard({
    kicker: "Options Flow Scanner",
    headline: "Real-time institutional flow.",
    subhead: "OPRA tape · CBOE Rule 6.11 sweep detection · Black-Scholes-Merton Greeks · NBBO aggression",
    chips: ["219 ISO", "229 CROSS", "231 FLOOR", "MULTI-LEG", "AUCTION"],
    liveLabel: "Live OPRA Tape",
    ctaRight: { value: "1-3s", label: "alert latency" },
  })
}
