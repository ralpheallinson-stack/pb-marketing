import type { Metadata } from "next"
import { Teko } from "next/font/google"
import "./globals.css"

const teko = Teko({
  weight: "700",
  subsets: ["latin"],
  variable: "--font-teko",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Options Flow Scanner — Real-Time Institutional Sweeps & Blocks | Profit Builders",
  description: "Real-time institutional options flow scanner with Greeks, IV, spread detection, and regime-aware conviction grading. 161,000+ signals tracked publicly.",
  metadataBase: new URL("https://profitbuilders.org"),
  openGraph: {
    title: "Options Flow Scanner | Profit Builders",
    description: "Real-time institutional options flow. Every signal tracked publicly.",
    type: "website",
  },
  twitter: { card: "summary_large_image", site: "@ProfitBldrs" },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={teko.variable}>
      <body>{children}</body>
    </html>
  )
}
