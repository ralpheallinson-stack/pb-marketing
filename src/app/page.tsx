import Nav from "@/components/Nav"
import PromoBanner from "@/components/PromoBanner"
import HeroSection from "@/components/HeroSection"
import GexSection from "@/components/GexSection"
import FeaturesSection from "@/components/FeaturesSection"
import Pricing from "@/components/Pricing"
import FAQ from "@/components/FAQ"
import Footer from "@/components/Footer"
import PopularTickers from "@/components/PopularTickers"

const appSchema = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Profit Builders",
  "url": "https://profitbuilders.io",
  "applicationCategory": "FinanceApplication",
  "applicationSubCategory": "Options Flow Scanner",
  "operatingSystem": "Web, iOS, Android (Discord + Telegram alerts)",
  "description": "Real-time institutional options flow scanner with sweep detection, OPRA condition codes, Black-Scholes Greeks, and IV. Built on the live OPRA tape with CBOE-compliant sweep classification.",
  "featureList": [
    "Real-time sweep and block detection (CBOE Rule 6.11 compliant)",
    "OPRA condition-code badges (ISO, CROSS, MULTI_LEG)",
    "Black-Scholes-Merton Greeks with Newton-Raphson IV solver",
    "NBBO spread-relative aggression classification",
    "Accumulation pattern detection with RAPID badges",
    "GEX heatmap across 220 symbols",
    "Discord and Telegram alerts within 1-3 seconds",
  ],
  "offers": [
    {
      "@type": "Offer",
      "name": "Flow Scanner",
      "price": "99.00",
      "priceCurrency": "USD",
      "priceValidUntil": "2027-01-01",
      "url": "https://profitbuilders.io/pricing",
      "availability": "https://schema.org/InStock",
    },
    {
      "@type": "Offer",
      "name": "GEX Heatmap",
      "price": "39.00",
      "priceCurrency": "USD",
      "priceValidUntil": "2027-01-01",
      "url": "https://profitbuilders.io/pricing",
      "availability": "https://schema.org/InStock",
    },
    {
      "@type": "Offer",
      "name": "Pro Bundle (Flow + GEX)",
      "price": "129.00",
      "priceCurrency": "USD",
      "priceValidUntil": "2027-01-01",
      "url": "https://profitbuilders.io/pricing",
      "availability": "https://schema.org/InStock",
    },
  ],
})

const organizationSchema = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Profit Builders",
  "alternateName": "Profit Builders Flow Scanner",
  "url": "https://profitbuilders.io",
  "logo": "https://profitbuilders.io/images/pb-logo.png",
  "description": "Institutional options flow scanner. OPRA tape, CBOE-compliant sweep detection, Black-Scholes Greeks, NBBO aggression classification.",
  "foundingDate": "2024",
  "sameAs": [
    "https://x.com/profitbuildersio"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Customer Support",
    "email": "support@profitbuilders.io",
    "url": "https://profitbuilders.io"
  }
})

const websiteSchema = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Profit Builders",
  "url": "https://profitbuilders.io",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://profitbuilders.io/blog?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
})

const itemListSchema = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Recent Grade A Examples — Profit Builders",
  "description": "Eight recent institutional-grade options flow signals with full thesis, entry, and verified outcome.",
  "url": "https://profitbuilders.io/methodology",
  "numberOfItems": 8,
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "item": {
        "@type": "CreativeWork",
        "name": "$170K sweep into AI capex — NVDA CALLS $177.50",
        "description": "Five fills across 3 exchanges, all bought at the ask. 7× vol/oi on near-the-money calls — clear accumulation signature ahead of hyperscaler capex commentary.",
        "url": "https://profitbuilders.io/methodology"
      }
    },
    {
      "@type": "ListItem",
      "position": 2,
      "item": {
        "@type": "CreativeWork",
        "name": "61× vol/oi miner sweep — RIOT CALLS $16",
        "description": "Aggressive 61× vol/oi sweep on short-dated OTM calls. Third hit on this strike intraday with persistent buying pressure across multiple exchanges.",
        "url": "https://profitbuilders.io/methodology"
      }
    },
    {
      "@type": "ListItem",
      "position": 3,
      "item": {
        "@type": "CreativeWork",
        "name": "Small-cap breakdown hedge — IWM PUTS $239",
        "description": "Deep OTM puts swept above the bid. Hedge or directional bear conviction with 14× vol/oi elevated on the small-cap technical breakdown.",
        "url": "https://profitbuilders.io/methodology"
      }
    },
    {
      "@type": "ListItem",
      "position": 4,
      "item": {
        "@type": "CreativeWork",
        "name": "$130K ITM block on Q2 catalyst — TSLA CALLS $355",
        "description": "ITM call sweep totaling $130K premium. Delta 0.52 — pure directional positioning into Q2 delivery numbers.",
        "url": "https://profitbuilders.io/methodology"
      }
    },
    {
      "@type": "ListItem",
      "position": 5,
      "item": {
        "@type": "CreativeWork",
        "name": "9× vol/oi block at the offer — META CALLS $580",
        "description": "Block print at the offer on a name that rarely sees this kind of single-print volume — likely tied to Reality Labs roadmap and ad targeting tailwinds.",
        "url": "https://profitbuilders.io/methodology"
      }
    },
    {
      "@type": "ListItem",
      "position": 6,
      "item": {
        "@type": "CreativeWork",
        "name": "$670K multi-leg accumulation — AMD CALLS $160",
        "description": "Multi-leg sweep across 3 strikes totaling $670K premium. Aggressive call-side accumulation 30 days out with dealer gamma supportive at this strike.",
        "url": "https://profitbuilders.io/methodology"
      }
    },
    {
      "@type": "ListItem",
      "position": 7,
      "item": {
        "@type": "CreativeWork",
        "name": "Unusual ATM put activity — AAPL PUTS $220",
        "description": "8.7× vol/oi on near-the-money puts. Possibly hedging into iPhone cycle uncertainty with IV ranking in the bottom decile.",
        "url": "https://profitbuilders.io/methodology"
      }
    },
    {
      "@type": "ListItem",
      "position": 8,
      "item": {
        "@type": "CreativeWork",
        "name": "BTC-correlated $500K sweep — COIN CALLS $280",
        "description": "Sweep at the ask, BTC correlation in play. $500K premium — crypto-leveraged equity playing the next leg up with asymmetric payoff.",
        "url": "https://profitbuilders.io/methodology"
      }
    }
  ]
})

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: appSchema }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: organizationSchema }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: websiteSchema }} />
      <PromoBanner />
      <Nav />
      <HeroSection />
      <div className="border-t border-white/[0.05]"><FeaturesSection /></div>
      <div className="border-t border-white/[0.05]"><GexSection /></div>
      <div className="border-t border-white/[0.05]"><Pricing /></div>
      {/* Mid-page CTA — single-button reinforcement immediately under Pricing */}
      <section className="border-t border-white/[0.05] bg-[#0E1117] w-full py-12 px-6">
        <div className="max-w-lg mx-auto text-center">
          <p className="text-white/40 text-sm mb-4">
            Real-time institutional flow. Built on the OPRA tape. Free to start.
          </p>
          <a href="/pricing"
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-[#0a0d12] font-bold px-8 py-4 rounded-full text-base transition-all">
            Start Free 7-Day Trial
          </a>
          <p className="text-white/30 text-xs mt-3">
            Card required · Cancel anytime before day 7
          </p>
        </div>
      </section>
      <PopularTickers
        limit={12}
        title="Popular tickers by institutional flow"
        subtitle="Drill into per-ticker flow leaderboards, call/put lean, and historical Grade A flow by symbol. Click any ticker for the full page."
      />
      {/* The Daily Flow Brief — canonical free-newsletter capture (consolidated v7.9.17) */}
      <section className="border-t border-white/[0.05] bg-[#0E1117] w-full py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-[10px] text-amber-400 uppercase tracking-[0.24em] font-bold mb-4">Free · Daily · No spam</div>
          <h2 className="text-white font-bold text-3xl sm:text-4xl mb-4 leading-tight tracking-tight">
            The Daily Flow Brief.
          </h2>
          <p className="text-white/55 text-[16px] mb-8 max-w-lg mx-auto leading-relaxed">
            Every weekday at 8:45 AM ET — yesterday&apos;s top institutional sweeps, accumulation patterns, and notable flow. In your inbox before the bell.
          </p>
          <a href="/newsletter"
            className="inline-flex items-center gap-2 bg-white text-[#0a0d12] font-semibold px-7 py-3.5 rounded-full text-[14px] hover:bg-white/90 transition-colors">
            Subscribe →
          </a>
        </div>
      </section>

      <div className="border-t border-white/[0.05]"><FAQ /></div>
      <Footer />
    </>
  )
}
