import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Options Flow Trading Community",
  description: "Join a private community of traders watching institutional options flow in real time. Discord alerts, Telegram signals, and live scanner access.",
  alternates: { canonical: "https://profitbuilders.io/community" },
  openGraph: {
    title: "Options Flow Trading Community | Profit Builders",
    description: "Real-time institutional flow alerts. Discord + Telegram + live scanner.",
  },
}

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return children
}
