import { renderOgCard, OG_SIZE } from "@/lib/og-card"

export const alt = "Profit Builders Free Options Flow Scanner"
export const size = OG_SIZE
export const contentType = "image/png"
export const dynamic = "force-static"

export default function Image() {
  return renderOgCard({
    kicker: "Free · No Signup",
    headline: "Live institutional flow.",
    subhead: "15-minute delayed OPRA tape · sweep detection · Black-Scholes Greeks · 220 symbols · no card required",
    chips: ["SWEEP", "BLOCK", "GREEKS", "WHALE"],
    liveLabel: "Free Tier",
    ctaRight: { value: "Try", label: "now → no card" },
  })
}
