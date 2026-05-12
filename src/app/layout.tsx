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
    default: "Options Flow Scanner | Profit Builders",
    template: "%s | Profit Builders",
  },
  description: "Real-time institutional options flow scanner. CBOE-compliant sweep detection, OPRA condition codes, Black-Scholes Greeks, NBBO aggression classification.",
  metadataBase: new URL("https://profitbuilders.io"),
  alternates: { canonical: "https://profitbuilders.io" },
  openGraph: {
    title: "Options Flow Scanner | Profit Builders",
    description: "Real-time institutional options flow. OPRA tape · CBOE Rule 6.11 sweeps · BSM Greeks.",
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
