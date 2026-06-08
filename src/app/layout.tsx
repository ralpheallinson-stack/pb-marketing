import type { Metadata, Viewport } from "next"
import { Bricolage_Grotesque, Bebas_Neue, Inter } from "next/font/google"
import "./globals.css"

const bricolage = Bricolage_Grotesque({
  weight: "800",
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
})

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
})

const inter = Inter({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})


export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0a0d12',
}

export const metadata: Metadata = {
  title: {
    default: "Options Flow Scanner — Real-Time Institutional Trades | PB",
    template: "%s | Profit Builders",
  },
  description: "Real-time institutional options flow across all 17 US exchanges. Conviction-graded sweeps and blocks, delivered before the move. $99/mo · 7-day free trial.",
  metadataBase: new URL("https://profitbuilders.io"),
  alternates: { canonical: "https://profitbuilders.io" },
  openGraph: {
    title: "Options Flow Scanner — Real-Time Institutional Trades | PB",
    description: "Real-time institutional options flow across all 17 US exchanges. Conviction-graded sweeps and blocks, delivered before the move. $99/mo · 7-day free trial.",
    type: "website",
    siteName: "Profit Builders",
    url: "https://profitbuilders.io",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Profit Builders Options Flow Scanner" }],
  },
  twitter: { card: "summary_large_image", site: "@ProfitBldrs", images: ["/opengraph-image"] },
  robots: { index: true, follow: true },
}

const orgSchema = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Profit Builders",
  "url": "https://profitbuilders.io",
  "logo": "https://profitbuilders.io/images/pb-logo.png",
  "sameAs": ["https://x.com/ProfitBldrs"]
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${bricolage.variable} ${bebasNeue.variable} ${inter.variable}`}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: orgSchema }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
