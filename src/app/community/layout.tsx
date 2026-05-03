import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Options Flow Trading Community — Discord & Telegram",
  description: "Join the Profit Builders trading community on Discord and Telegram. Live alerts, Grade-A/B signal feeds, methodology Q&A, and weekly recaps with active members.",
  alternates: { canonical: "https://profitbuilders.io/community" },
  openGraph: {
    title: "Options Flow Trading Community | Profit Builders",
    description: "Live Grade-A/B signal feeds and methodology Q&A on Discord and Telegram.",
    url: "https://profitbuilders.io/community",
    type: "website",
  },
}

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return children
}
