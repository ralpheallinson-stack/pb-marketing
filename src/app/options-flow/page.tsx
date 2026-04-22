import Link from "next/link"
import Nav from "@/components/Nav"
import Footer from "@/components/Footer"
import type { Metadata } from "next"
import fs from "fs"
import path from "path"

type TickerData = {
  symbol: string
  sector: string
  total_signals: number
  total_premium_fmt: string
  total_premium_raw: number
  call_pct: number
  last_30d: { signals: number }
}

type Dataset = {
  generated_date: string
  total_tickers: number
  tickers: Record<string, TickerData>
}

function loadData(): Dataset {
  const p = path.join(process.cwd(), "data", "ticker-pages.json")
  return JSON.parse(fs.readFileSync(p, "utf-8")) as Dataset
}

export async function generateMetadata(): Promise<Metadata> {
  const data = loadData()
  const count = Object.keys(data.tickers).length
  const title = `Options Flow by Ticker — ${count} Tickers Tracked`
  const description = `Institutional options flow data for ${count} tickers. Grade A signals, total premium, call/put lean, and historical track record — refreshed daily.`
  const ogDescription = `Institutional options flow data across ${count} tickers. Refreshed daily.`
  return {
    title,
    description,
    alternates: { canonical: "https://profitbuilders.io/options-flow" },
    openGraph: {
      title,
      description: ogDescription,
      url: "https://profitbuilders.io/options-flow",
      images: [{ url: "/images/og-card.png", width: 1200, height: 630, alt: "Options Flow by Ticker — Profit Builders" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: ogDescription,
      images: ["/images/og-card.png"],
    },
  }
}

export default async function OptionsFlowIndex() {
  const data = loadData()
  const tickers = Object.values(data.tickers).sort((a, b) => b.total_premium_raw - a.total_premium_raw)

  // Group by sector for browseability
  const bySector: Record<string, TickerData[]> = {}
  for (const t of tickers) {
    const s = t.sector || "OTHER"
    if (!bySector[s]) bySector[s] = []
    bySector[s].push(t)
  }
  const sectorOrder = Object.entries(bySector).sort(([, a], [, b]) => b.length - a.length)

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://profitbuilders.io" },
      { "@type": "ListItem", "position": 2, "name": "Options Flow", "item": "https://profitbuilders.io/options-flow" },
    ],
  }

  const webpageSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Options Flow by Ticker",
    "url": "https://profitbuilders.io/options-flow",
    "description": `Institutional options flow data across ${data.total_tickers} tickers with tracked Grade A/B signals.`,
    "numberOfItems": data.total_tickers,
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webpageSchema) }} />

      <Nav />

      <main className="bg-white">
        <section className="max-w-5xl mx-auto px-6 pt-16 pb-12">
          <div className="text-[11px] text-gray-400 uppercase tracking-[3px] font-semibold mb-4">
            {data.total_tickers} TICKERS · UPDATED DAILY
          </div>
          <h1 className="text-[40px] sm:text-[56px] font-bold text-gray-950 leading-[1.05] tracking-[-0.03em] mb-5" style={{ fontFamily: "Georgia, serif" }}>
            Options Flow by Ticker
          </h1>
          <p className="text-[18px] text-gray-600 leading-relaxed max-w-3xl">
            Institutional options flow data for every ticker with at least 50 tracked Grade A/B signals. Each ticker page shows total premium, call/put lean, accumulation patterns, recent activity, and historical win rate.
          </p>
        </section>

        <section className="max-w-5xl mx-auto px-6 py-12 border-t border-gray-100">
          <div className="text-[11px] text-gray-400 uppercase tracking-[3px] font-semibold mb-4">TOP BY INSTITUTIONAL PREMIUM</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
            {tickers.slice(0, 12).map(t => (
              <Link
                key={t.symbol}
                href={`/options-flow/${t.symbol}`}
                className="block p-4 border border-gray-200 hover:border-[#F97316] rounded-lg transition-colors"
              >
                <div className="font-bold text-[18px] text-gray-950 mb-1" style={{ fontFamily: "Georgia, serif" }}>{t.symbol}</div>
                <div className="text-[12px] text-gray-500">{t.total_premium_fmt} · {t.total_signals.toLocaleString()} signals</div>
              </Link>
            ))}
          </div>
        </section>

        {sectorOrder.map(([sector, list]) => (
          <section key={sector} className="max-w-5xl mx-auto px-6 py-10 border-t border-gray-100">
            <div className="flex items-baseline justify-between mb-6">
              <h2 className="text-[20px] font-bold text-gray-950" style={{ fontFamily: "Georgia, serif" }}>
                {sector}
              </h2>
              <span className="text-[12px] text-gray-400">{list.length} tickers</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {list.map(t => (
                <Link
                  key={t.symbol}
                  href={`/options-flow/${t.symbol}`}
                  className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-200 hover:border-[#F97316] rounded-md text-[13px] font-semibold text-gray-900 hover:text-[#F97316] transition-colors"
                >
                  {t.symbol}
                </Link>
              ))}
            </div>
          </section>
        ))}
      </main>

      <Footer />
    </>
  )
}
