import type { Metadata, Viewport } from "next"
import { Teko, Bricolage_Grotesque, Barlow_Condensed, Bebas_Neue } from "next/font/google"
import "./globals.css"

const teko = Teko({
  weight: "700",
  subsets: ["latin"],
  variable: "--font-teko",
  display: "swap",
})

const bricolage = Bricolage_Grotesque({
  weight: "800",
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
})

const barlowCondensed = Barlow_Condensed({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-barlow",
  display: "swap",
})

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
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
    default: "Options Flow Scanner | Profit Builders",
    template: "%s | Profit Builders",
  },
  description: "Real-time institutional options flow scanner. Track sweeps, blocks, and unusual prints with conviction grading. 208,000+ signals tracked.",
  metadataBase: new URL("https://profitbuilders.org"),
  alternates: { canonical: "https://profitbuilders.org" },
  openGraph: {
    title: "Options Flow Scanner | Profit Builders",
    description: "Real-time institutional options flow. Every signal tracked publicly.",
    type: "website",
    siteName: "Profit Builders",
    url: "https://profitbuilders.org",
    images: [{ url: "/images/og-v4.png", width: 1200, height: 630, alt: "Profit Builders Options Flow Scanner" }],
  },
  twitter: { card: "summary_large_image", site: "@ProfitBldrs", images: ["/images/og-v4.png"] },
  robots: { index: true, follow: true },
}

const orgSchema = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Profit Builders",
  "url": "https://profitbuilders.org",
  "logo": "https://profitbuilders.org/images/pb-logo.png",
  "sameAs": ["https://x.com/ProfitBldrs"]
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${teko.variable} ${bricolage.variable} ${barlowCondensed.variable} ${bebasNeue.variable}`}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: orgSchema }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
