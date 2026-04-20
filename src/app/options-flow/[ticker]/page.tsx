import Link from "next/link"
import Nav from "@/components/Nav"
import Footer from "@/components/Footer"
import { EmailSignup } from "@/components/EmailSignup"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import fs from "fs"
import path from "path"

type RecentTease = {
  date: string
  direction: string
  size_bucket: string
  flow_type: string
}

type TickerData = {
  symbol: string
  sector: string
  market_cap: string
  total_signals: number
  grade_a_count: number
  total_premium_fmt: string
  total_premium_raw: number
  call_pct: number
  put_pct: number
  first_signal: string
  last_signal: string
  last_30d: { signals: number; grade_a: number; premium_fmt: string }
  win_rate: { closed: number; wins: number; win_rate: number | null; avg_pnl: number | null }
  recent_teases: RecentTease[]
  accumulation: { hits: number; total_premium_m: number } | null
  related_tickers: string[]
}

type Dataset = {
  generated_at: string
  generated_date: string
  total_tickers: number
  tickers: Record<string, TickerData>
}

let _cache: Dataset | null = null
function loadData(): Dataset {
  if (_cache) return _cache
  const p = path.join(process.cwd(), "data", "ticker-pages.json")
  const raw = fs.readFileSync(p, "utf-8")
  _cache = JSON.parse(raw) as Dataset
  return _cache
}

export const dynamicParams = false

export function generateStaticParams() {
  const data = loadData()
  return Object.keys(data.tickers).map(ticker => ({ ticker }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ ticker: string }> }
): Promise<Metadata> {
  const { ticker } = await params
  const data = loadData()
  const t = data.tickers[ticker.toUpperCase()]
  if (!t) return {}

  const url = `https://profitbuilders.io/options-flow/${ticker.toUpperCase()}`
  const title = `${t.symbol} Options Flow: Institutional Activity and Grade A Signals`
  const description = `${t.symbol} options flow tracking — ${t.total_signals.toLocaleString()} signals logged, ${t.total_premium_fmt} in total institutional premium, ${t.call_pct}% call lean. Updated ${data.generated_date}.`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  }
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
  })
}

export default async function OptionsFlowTickerPage(
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params
  const data = loadData()
  const t = data.tickers[ticker.toUpperCase()]
  if (!t) notFound()

  const url = `https://profitbuilders.io/options-flow/${t.symbol}`
  const generatedDisplay = formatDate(data.generated_date)
  const lastSignalDisplay = formatDate(t.last_signal)
  const leanText = t.call_pct > 55 ? "call-heavy" : t.put_pct > 55 ? "put-heavy" : "balanced"

  // ── SCHEMA (AI-SEO optimized) ──────────────────────────────────
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": `${t.symbol} Options Flow: Institutional Activity and Grade A Signals`,
    "description": `${t.symbol} options flow tracking with ${t.total_signals.toLocaleString()} signals logged at ${t.total_premium_fmt} in institutional premium.`,
    "datePublished": data.generated_date,
    "dateModified": data.generated_date,
    "author": { "@type": "Organization", "name": "Profit Builders", "url": "https://profitbuilders.io" },
    "publisher": {
      "@type": "Organization",
      "name": "Profit Builders",
      "logo": { "@type": "ImageObject", "url": "https://profitbuilders.io/images/pb-logo.png" },
    },
    "url": url,
    "mainEntityOfPage": { "@type": "WebPage", "@id": url },
    "about": { "@type": "Corporation", "tickerSymbol": t.symbol },
  }

  // Dataset schema — LLMs love this for data-rich pages
  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "name": `${t.symbol} Options Flow Statistics`,
    "description": `Aggregate institutional options flow statistics for ${t.symbol}, tracked across ${t.total_signals.toLocaleString()} Grade A/B signals since ${t.first_signal}.`,
    "creator": { "@type": "Organization", "name": "Profit Builders" },
    "datePublished": data.generated_date,
    "dateModified": data.generated_date,
    "keywords": [
      `${t.symbol} options flow`,
      `${t.symbol} unusual options`,
      `${t.symbol} institutional trading`,
      `${t.symbol} options activity`,
      "options flow scanner",
    ],
    "variableMeasured": [
      { "@type": "PropertyValue", "name": "Total Grade A/B signals", "value": t.total_signals },
      { "@type": "PropertyValue", "name": "Grade A signals", "value": t.grade_a_count },
      { "@type": "PropertyValue", "name": "Total institutional premium", "value": t.total_premium_fmt },
      { "@type": "PropertyValue", "name": "Call premium share", "value": `${t.call_pct}%` },
      { "@type": "PropertyValue", "name": "Put premium share", "value": `${t.put_pct}%` },
    ],
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://profitbuilders.io" },
      { "@type": "ListItem", "position": 2, "name": "Options Flow", "item": "https://profitbuilders.io/options-flow" },
      { "@type": "ListItem", "position": 3, "name": t.symbol, "item": url },
    ],
  }

  // FAQ schema — AI search loves direct Q&A for citation
  const winRateText = t.win_rate.win_rate !== null
    ? `${t.win_rate.win_rate}% across ${t.win_rate.closed} closed Grade A signals`
    : "insufficient closed positions to report yet"

  const faqItems = [
    {
      q: `How active is ${t.symbol} options flow?`,
      a: `${t.symbol} has ${t.total_signals.toLocaleString()} Grade A/B institutional flow signals tracked in the Profit Builders scanner since ${formatDate(t.first_signal)}, representing ${t.total_premium_fmt} in total institutional premium. Over the last 30 days alone, ${t.symbol} has logged ${t.last_30d.signals.toLocaleString()} signals (${t.last_30d.grade_a} Grade A).`,
    },
    {
      q: `Are institutions bullish or bearish on ${t.symbol}?`,
      a: `Based on tracked Profit Builders signals, ${t.symbol} flow is ${leanText} with ${t.call_pct}% of institutional premium flowing into calls and ${t.put_pct}% into puts. This does not constitute a directional recommendation — it reflects observed positioning in the options tape.`,
    },
    {
      q: `What is the win rate of Grade A ${t.symbol} signals?`,
      a: `Grade A ${t.symbol} signals have closed at ${winRateText}. ${t.win_rate.avg_pnl !== null ? `Average P&L across closed Grade A ${t.symbol} signals is ${t.win_rate.avg_pnl > 0 ? "+" : ""}${t.win_rate.avg_pnl}%.` : ""} All outcomes are publicly auditable at profitbuilders.io/results.`,
    },
    {
      q: `How do I get real-time ${t.symbol} options flow alerts?`,
      a: `The Profit Builders scanner delivers Grade A ${t.symbol} alerts in real time via web, Discord, and Telegram within 1-3 seconds of the trade hitting the tape. A free 7-day trial is available at profitbuilders.io/free-scanner.`,
    },
  ]

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": { "@type": "Answer", "text": f.a },
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <Nav />

      <main className="bg-white">
        {/* Breadcrumb */}
        <div className="max-w-5xl mx-auto px-6 pt-8">
          <nav className="text-[12px] text-gray-500">
            <Link href="/" className="hover:text-[#F97316]">Home</Link>
            <span className="mx-2">›</span>
            <Link href="/options-flow" className="hover:text-[#F97316]">Options Flow</Link>
            <span className="mx-2">›</span>
            <span className="text-gray-900 font-semibold">{t.symbol}</span>
          </nav>
        </div>

        {/* ── HERO ── */}
        <section className="max-w-5xl mx-auto px-6 pt-8 pb-12">
          <div className="flex items-center gap-3 text-[11px] text-gray-400 uppercase tracking-[3px] font-semibold mb-4">
            <span>{t.sector || "Equity"}</span>
            {t.market_cap && <><span>·</span><span>{t.market_cap} cap</span></>}
            <span>·</span>
            <span>Data as of {generatedDisplay}</span>
          </div>

          <h1 className="text-[36px] sm:text-[52px] font-bold text-gray-950 leading-[1.05] tracking-[-0.03em] mb-5" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
            {t.symbol} Options Flow: Institutional Activity and Grade A Signals
          </h1>

          <p className="text-[18px] text-gray-600 leading-relaxed max-w-3xl mb-8">
            Profit Builders has tracked <strong className="text-gray-900">{t.total_signals.toLocaleString()} Grade A/B institutional flow signals</strong> on {t.symbol} since {formatDate(t.first_signal)}, representing <strong className="text-gray-900">{t.total_premium_fmt}</strong> in total premium. Flow has been <strong className="text-gray-900">{leanText}</strong>, with {t.call_pct}% of premium into calls and {t.put_pct}% into puts.
          </p>

          {/* Hero stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total signals" value={t.total_signals.toLocaleString()} />
            <StatCard label="Grade A signals" value={t.grade_a_count.toLocaleString()} accent />
            <StatCard label="Total premium" value={t.total_premium_fmt} />
            <StatCard label="Last 30d signals" value={t.last_30d.signals.toLocaleString()} />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Link href="/free-scanner" className="inline-flex items-center gap-2 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold px-6 py-3 rounded-full text-[14px] transition-colors">
              Get {t.symbol} alerts in real time →
            </Link>
            <Link href="/newsletter" className="inline-flex items-center gap-2 text-gray-700 hover:text-[#F97316] font-semibold text-[14px]">
              Free daily flow brief →
            </Link>
          </div>
        </section>

        {/* ── RECENT ACTIVITY (tease only) ── */}
        {t.recent_teases.length > 0 && (
          <section className="max-w-5xl mx-auto px-6 py-12 border-t border-gray-100">
            <div className="text-[11px] text-gray-400 uppercase tracking-[3px] font-semibold mb-3">RECENT INSTITUTIONAL ACTIVITY</div>
            <h2 className="text-[28px] font-bold text-gray-950 leading-tight tracking-[-0.02em] mb-6" style={{ fontFamily: "Georgia, serif" }}>
              Grade A {t.symbol} prints — last 14 days
            </h2>
            <p className="text-gray-500 text-[14px] mb-8 max-w-2xl">
              Size-bucketed for public view. Exact strikes, expirations, and premium amounts are available in the live scanner.
            </p>

            <div className="space-y-3">
              {t.recent_teases.map((tease, i) => (
                <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="text-[11px] text-gray-400 font-mono">{formatDate(tease.date)}</div>
                    <div className="text-[15px] text-gray-900 font-semibold">
                      {tease.size_bucket} {tease.direction} via {tease.flow_type.toLowerCase().replace("_", " ")}
                    </div>
                  </div>
                  <div className="text-[11px] text-[#F97316] font-semibold uppercase tracking-wider">Grade A</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── ACCUMULATION (if any) ── */}
        {t.accumulation && (
          <section className="max-w-5xl mx-auto px-6 py-12 border-t border-gray-100">
            <div className="text-[11px] text-gray-400 uppercase tracking-[3px] font-semibold mb-3">ACCUMULATION PATTERN</div>
            <h2 className="text-[28px] font-bold text-gray-950 leading-tight tracking-[-0.02em] mb-6" style={{ fontFamily: "Georgia, serif" }}>
              {t.symbol} institutions are building a position
            </h2>
            <p className="text-gray-700 text-[16px] leading-relaxed max-w-3xl mb-4">
              One {t.symbol} options contract has seen <strong>{t.accumulation.hits} repeat institutional entries</strong> in the last 14 days, totaling approximately <strong>${t.accumulation.total_premium_m}M in premium</strong>. This pattern — multiple aggressive prints on the same strike and expiry — is how institutions typically build a position without moving the market.
            </p>
            <Link href="/blog/what-is-options-accumulation" className="text-[#F97316] hover:underline text-[14px] font-semibold">
              Read: What is options accumulation? →
            </Link>
          </section>
        )}

        {/* ── TRACK RECORD ── */}
        {t.win_rate.closed > 0 && (
          <section className="max-w-5xl mx-auto px-6 py-12 border-t border-gray-100">
            <div className="text-[11px] text-gray-400 uppercase tracking-[3px] font-semibold mb-3">HISTORICAL TRACK RECORD</div>
            <h2 className="text-[28px] font-bold text-gray-950 leading-tight tracking-[-0.02em] mb-6" style={{ fontFamily: "Georgia, serif" }}>
              {t.symbol} Grade A signal outcomes
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <StatCard label="Closed Grade A" value={t.win_rate.closed.toLocaleString()} />
              <StatCard label="Win rate" value={t.win_rate.win_rate !== null ? `${t.win_rate.win_rate}%` : "—"} accent />
              {t.win_rate.avg_pnl !== null && (
                <StatCard label="Avg P&L" value={`${t.win_rate.avg_pnl > 0 ? "+" : ""}${t.win_rate.avg_pnl}%`} />
              )}
            </div>

            <p className="text-gray-600 text-[14px] max-w-2xl leading-relaxed">
              All {t.symbol} signal outcomes are publicly auditable at <Link href="/results" className="text-[#F97316] hover:underline">/results</Link> — wins and losses, with no cherry-picking.
            </p>
          </section>
        )}

        {/* ── FAQ ── */}
        <section className="max-w-5xl mx-auto px-6 py-12 border-t border-gray-100">
          <div className="text-[11px] text-gray-400 uppercase tracking-[3px] font-semibold mb-3">QUESTIONS ABOUT {t.symbol} OPTIONS FLOW</div>
          <h2 className="text-[28px] font-bold text-gray-950 leading-tight tracking-[-0.02em] mb-8" style={{ fontFamily: "Georgia, serif" }}>
            FAQ
          </h2>

          <div className="space-y-6 max-w-3xl">
            {faqItems.map((f, i) => (
              <div key={i} className="border-b border-gray-100 pb-6 last:border-0">
                <div className="text-gray-900 font-semibold text-[17px] mb-2" style={{ fontFamily: "Georgia, serif" }}>{f.q}</div>
                <p className="text-gray-600 text-[14px] leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── EMAIL CTA ── */}
        <section className="max-w-5xl mx-auto px-6 py-12 border-t border-gray-100">
          <div className="max-w-lg mx-auto">
            <EmailSignup source="flow-brief" variant="flow-brief" />
          </div>
        </section>

        {/* ── RELATED TICKERS ── */}
        {t.related_tickers.length > 0 && (
          <section className="max-w-5xl mx-auto px-6 py-12 border-t border-gray-100">
            <div className="text-[11px] text-gray-400 uppercase tracking-[3px] font-semibold mb-3">RELATED {t.sector} FLOW</div>
            <h2 className="text-[22px] font-bold text-gray-950 mb-6" style={{ fontFamily: "Georgia, serif" }}>
              Other {t.sector.toLowerCase()} tickers with tracked flow
            </h2>
            <div className="flex flex-wrap gap-3">
              {t.related_tickers.map(sym => (
                <Link
                  key={sym}
                  href={`/options-flow/${sym}`}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 hover:border-[#F97316] rounded-lg text-[14px] font-semibold text-gray-900 hover:text-[#F97316] transition-colors"
                >
                  {sym} →
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── EDUCATIONAL LINKS ── */}
        <section className="max-w-5xl mx-auto px-6 py-12 border-t border-gray-100">
          <div className="text-[11px] text-gray-400 uppercase tracking-[3px] font-semibold mb-4">LEARN MORE</div>
          <div className="flex flex-wrap gap-4 text-[14px]">
            <Link href="/blog/how-to-read-options-flow" className="text-[#F97316] hover:underline">How to read options flow</Link>
            <span className="text-gray-300">·</span>
            <Link href="/blog/options-flow-signals-grade-a-b-c" className="text-[#F97316] hover:underline">What Grade A, B, and C mean</Link>
            <span className="text-gray-300">·</span>
            <Link href="/blog/what-is-options-accumulation" className="text-[#F97316] hover:underline">Options accumulation explained</Link>
            <span className="text-gray-300">·</span>
            <Link href="/results" className="text-[#F97316] hover:underline">Public track record</Link>
          </div>
        </section>

        {/* ── DATA FRESHNESS FOOTER ── */}
        <section className="max-w-5xl mx-auto px-6 py-8 border-t border-gray-100 text-[12px] text-gray-400">
          Data refreshed daily. This page was last generated {generatedDisplay}. Last Grade A/B {t.symbol} signal logged on {lastSignalDisplay}.
        </section>
      </main>

      <Footer />
    </>
  )
}

function StatCard({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-white">
      <div className="text-[10px] text-gray-400 uppercase tracking-[2px] font-semibold mb-2">{label}</div>
      <div className={`text-[24px] font-bold leading-none ${accent ? "text-[#F97316]" : "text-gray-950"}`} style={{ fontFamily: "Georgia, serif" }}>
        {value}
      </div>
    </div>
  )
}
