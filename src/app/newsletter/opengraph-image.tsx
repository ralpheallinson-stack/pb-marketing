import { renderOgCard, OG_SIZE } from "@/lib/og-card"

// OG share card for /newsletter. Same Bloomberg-grade dark editorial
// aesthetic as the rest of the OG library, headline tuned to the
// newsletter's specific value prop.
export const alt = "The Flow Brief — Daily Options Flow Newsletter"
export const size = OG_SIZE
export const contentType = "image/png"
export const dynamic = "force-static"

export default function Image() {
  return renderOgCard({
    kicker: "The Flow Brief",
    headline: "Daily institutional options flow.",
    subhead: "Yesterday's top Grade A prints · accumulation patterns · closed P&L · weekday mornings at 8:45 AM ET",
    chips: ["GRADE A", "ACCUM", "CLOSED P&L", "OPRA"],
    liveLabel: "Free Daily",
    liveColor: "live",
    ctaRight: { value: "8:45 AM", label: "ET, Mon-Fri" },
  })
}
