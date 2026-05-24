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
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Profit Builders Options Flow Scanner" }],
  },
  twitter: { card: "summary_large_image", images: ["/opengraph-image"] },
}

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return children
}
