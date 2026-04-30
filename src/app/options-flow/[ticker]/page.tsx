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

type TickerCommentary = {
  stocktwits_post: string
  x_post: string
  trade_date: string
  call_pct: number | null
  bullish_pct: number | null
  signals: number | null
  total_premium: number | null
}

type CommentaryDataset = {
  generated_at: string
  trade_date: string
  total_tickers: number
  tickers: Record<string, TickerCommentary>
}

let _commentary: CommentaryDataset | null = null
function loadCommentary(): CommentaryDataset | null {
  if (_commentary) return _commentary
  try {
    const p = path.join(process.cwd(), "data", "ticker-commentary.json")
    const raw = fs.readFileSync(p, "utf-8")
    _commentary = JSON.parse(raw) as CommentaryDataset
    return _commentary
  } catch {
    // File may not exist on first build before the export script runs; degrade gracefully.
    return null
  }
}

/** Strip social-native adornments (hashtags, footer links, cashtag
 *  leading-prefix) from the ticker_spotlight stocktwits post so it reads
 *  cleanly as editorial copy on a ticker page. */
function cleanCommentary(text: string): string {
  return text
    // Remove hashtag cluster at end
    .replace(/\s*#\w+(?:\s+#\w+)*\s*$/g, "")
    // Remove "Full breakdown: https://..." footer lines
    .replace(/\n*Full breakdown:[^\n]*/gi, "")
    // Remove sentiment tag on its own line at the end ("Bullish" / "Bearish" / "Neutral")
    .replace(/\n+(Bullish|Bearish|Neutral)\s*$/, "")
    .trim()
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
  // Tighter title (<= 60 chars after  | Profit Builders  template suffix).
  // Surfaces a unique-per-ticker number which lifts CTR vs the generic
  // 'Grade A Signals · Premium Tracked Daily' tail used previously (78 chars,
  // Google-truncated). Format: 1247 -> '1.2K', 12847 -> '12.8K'.
  const sigCount = t.total_signals as number
  const sigShort = sigCount >= 1000
    ? `${(sigCount / 1000).toFixed(1)}K`
    : String(sigCount)
  const title = `${t.symbol} Options Flow · ${sigShort} Signals Tracked`
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

  const commentaryData = loadCommentary()
  const commentary = commentaryData?.tickers[t.symbol] ?? null
  const commentaryClean = commentary ? cleanCommentary(commentary.stocktwits_post) : null

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

      <style>{`
        .pb-grain {
          background-image:
            radial-gradient(ellipse at 20% 10%, rgba(37,99,235,0.10), transparent 50%),
            radial-gradient(ellipse at 85% 40%, rgba(22,163,74,0.06), transparent 45%),
            linear-gradient(180deg, #0E1117 0%, #0B0E13 100%);
        }
        .pb-rule { background: linear-gradient(90deg, transparent, rgba(122,139,168,0.22) 8%, rgba(122,139,168,0.22) 92%, transparent); }
        .pb-hairline { border-color: rgba(122,139,168,0.14); }
        .pb-mono { font-family: "IBM Plex Mono", "Menlo", monospace; letter-spacing: -0.01em; }
        .pb-editorial { font-family: Georgia, "Times New Roman", serif; }
        .pb-num { font-family: "Bricolage Grotesque", "Plus Jakarta Sans", system-ui, sans-serif; font-feature-settings: "tnum"; letter-spacing: -0.03em; }
        .pb-section-num { font-family: "IBM Plex Mono", monospace; font-size: 10px; letter-spacing: 0.2em; color: #3D4D63; text-transform: uppercase; }
        .pb-link { border-bottom: 1px solid rgba(52,211,153,0.4); transition: border-color 160ms ease; }
        .pb-link:hover { border-color: #34D399; }
        @keyframes pbRise { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .pb-rise { animation: pbRise 700ms cubic-bezier(0.16,1,0.3,1) both; }
        .pb-chip:hover { border-color: rgba(52,211,153,0.4); color: #fff; }
      `}</style>

      <Nav />

      <main className="pb-grain text-[#E8EDF5] min-h-screen">
        {/* Breadcrumb */}
        <div className="max-w-6xl mx-auto px-6 pt-28">
          <nav className="pb-mono text-[11px] text-[#7A8BA8]">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span className="mx-2 text-[#3D4D63]">/</span>
            <Link href="/options-flow" className="hover:text-white transition-colors">Options Flow</Link>
            <span className="mx-2 text-[#3D4D63]">/</span>
            <span className="text-white">{t.symbol}</span>
          </nav>
        </div>

        {/* ── HERO ── */}
        <section className="max-w-6xl mx-auto px-6 pt-8 pb-20 border-b pb-hairline">
          <div className="pb-rise">
            <div className="flex items-baseline gap-3 mb-6">
              <span className="pb-section-num">01 / 07</span>
              <span className="pb-rule h-px flex-1" />
              <span className="pb-mono text-[11px] text-[#3D4D63]">Data as of {generatedDisplay}</span>
            </div>

            <div className="flex items-center gap-3 pb-mono text-[10px] uppercase tracking-[0.22em] text-[#7A8BA8] mb-6">
              <span>{t.sector || "Equity"}</span>
              {t.market_cap && <><span className="text-[#3D4D63]">·</span><span>{t.market_cap} cap</span></>}
            </div>

            <h1 className="pb-editorial text-[40px] sm:text-[56px] md:text-[64px] leading-[1.02] tracking-[-0.025em] text-white mb-6">
              {t.symbol} <span className="text-[#3D4D63]">Options Flow.</span>
            </h1>

            <p className="text-[17px] md:text-[18px] leading-[1.6] text-[#A9B4C6] max-w-3xl mb-10">
              Profit Builders has tracked <span className="text-white font-medium">{t.total_signals.toLocaleString()} Grade A/B institutional flow signals</span> on {t.symbol} since {formatDate(t.first_signal)}, representing <span className="text-white font-medium">{t.total_premium_fmt}</span> in total premium. Flow has been <span className="text-white font-medium">{leanText}</span>, with {t.call_pct}% of premium into calls and {t.put_pct}% into puts.
            </p>

            {/* Hero stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border pb-hairline rounded-sm overflow-hidden mb-10">
              <DataCell label="Total signals" value={t.total_signals.toLocaleString()} />
              <DataCell label="Grade A signals" value={t.grade_a_count.toLocaleString()} accent />
              <DataCell label="Total premium" value={t.total_premium_fmt} />
              <DataCell label="Last 30d signals" value={t.last_30d.signals.toLocaleString()} />
            </div>

            {/* Today's Read — fresh commentary from pb-flow */}
            {commentaryClean && (
              <div className="mt-10 mb-10 relative rounded-sm border pb-hairline px-6 md:px-8 py-6 md:py-7 bg-[rgba(52,211,153,0.03)]">
                <div className="absolute left-0 top-6 bottom-6 w-[2px] bg-gradient-to-b from-[#34D399] via-[#34D399]/60 to-transparent" />
                <div className="flex items-baseline justify-between flex-wrap gap-2 mb-5">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34D399] opacity-60" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-[#34D399]" />
                    </span>
                    <span className="pb-mono text-[10px] uppercase tracking-[0.24em] text-[#34D399]">
                      Today&apos;s read · {formatDate(commentary!.trade_date)}
                    </span>
                  </div>
                  <span className="pb-mono text-[10px] uppercase tracking-[0.18em] text-[#3D4D63]">
                    Generated from live flow
                  </span>
                </div>
                <p className="pb-editorial text-[17px] leading-[1.7] text-[#E8EDF5] whitespace-pre-wrap">
                  {commentaryClean}
                </p>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-5">
              <Link
                href="/free-scanner"
                className="inline-flex items-center gap-3 bg-[#34D399] hover:bg-[#4ADE80] text-[#0a0d12] pb-mono text-[12px] font-bold tracking-wider uppercase px-7 py-3.5 rounded-full transition-colors"
              >
                Get {t.symbol} alerts →
              </Link>
              <Link
                href="/newsletter"
                className="pb-mono text-[11px] uppercase tracking-[0.18em] text-[#A9B4C6] hover:text-white transition-colors"
              >
                Free daily flow brief →
              </Link>
            </div>
          </div>
        </section>

        {/* ── RECENT ACTIVITY (tease only) ── */}
        {t.recent_teases.length > 0 && (
          <section className="max-w-6xl mx-auto px-6 py-16 border-b pb-hairline">
            <div className="flex items-baseline gap-3 mb-10">
              <span className="pb-section-num">02 / 07</span>
              <span className="pb-rule h-px flex-1" />
              <span className="pb-mono text-[11px] text-[#3D4D63]">Last 14 days</span>
            </div>
            <h2 className="pb-editorial text-[32px] md:text-[40px] leading-[1.1] tracking-[-0.02em] text-white mb-4 max-w-3xl">
              Recent Grade A {t.symbol} prints.
            </h2>
            <p className="text-[15px] leading-[1.65] text-[#A9B4C6] mb-10 max-w-2xl">
              Size-bucketed for public view. Exact strikes, expirations, and premium amounts are surfaced in the live scanner as they print.
            </p>

            <div className="border-t border-b pb-hairline">
              {t.recent_teases.map((tease, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-4 border-b pb-hairline last:border-b-0 hover:bg-[rgba(52,211,153,0.03)] transition-colors px-4 -mx-4"
                >
                  <div className="flex items-center gap-6">
                    <div className="pb-mono text-[11px] text-[#3D4D63] w-20">{formatDate(tease.date)}</div>
                    <div className="text-[15px] text-white">
                      <span className="pb-mono text-[#34D399] font-semibold">{tease.size_bucket}</span>
                      <span className="text-[#A9B4C6] mx-2">·</span>
                      <span>{tease.direction}</span>
                      <span className="text-[#7A8BA8] text-[13px]"> via {tease.flow_type.toLowerCase().replace("_", " ")}</span>
                    </div>
                  </div>
                  <span className="pb-mono text-[10px] text-[#34D399] uppercase tracking-[0.2em] font-semibold">Grade A</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── ACCUMULATION (if any) ── */}
        {t.accumulation && (
          <section className="max-w-6xl mx-auto px-6 py-16 border-b pb-hairline">
            <div className="flex items-baseline gap-3 mb-10">
              <span className="pb-section-num">03 / 07</span>
              <span className="pb-rule h-px flex-1" />
              <span className="pb-mono text-[11px] text-[#3D4D63]">Pattern detected</span>
            </div>
            <h2 className="pb-editorial text-[32px] md:text-[40px] leading-[1.1] tracking-[-0.02em] text-white mb-6 max-w-3xl">
              {t.symbol} institutions are building a position.
            </h2>
            <p className="text-[16px] leading-[1.7] text-[#A9B4C6] max-w-3xl mb-6">
              One {t.symbol} options contract has seen <span className="text-white font-medium">{t.accumulation.hits} repeat institutional entries</span> in the last 14 days, totaling approximately <span className="text-white font-medium">${t.accumulation.total_premium_m}M in premium</span>. This pattern — multiple aggressive prints on the same strike and expiry — is how institutions typically build a position without moving the market.
            </p>
            <Link
              href="/blog/what-is-options-accumulation"
              className="pb-mono text-[11px] uppercase tracking-[0.18em] text-[#34D399] pb-link"
            >
              What is options accumulation? →
            </Link>
          </section>
        )}

        {/* ── TRACK RECORD ── */}
        {t.win_rate.closed > 0 && (
          <section className="max-w-6xl mx-auto px-6 py-16 border-b pb-hairline">
            <div className="flex items-baseline gap-3 mb-10">
              <span className="pb-section-num">04 / 07</span>
              <span className="pb-rule h-px flex-1" />
              <span className="pb-mono text-[11px] text-[#3D4D63]">Recent flagged signals</span>
            </div>
            <h2 className="pb-editorial text-[32px] md:text-[40px] leading-[1.1] tracking-[-0.02em] text-white mb-8 max-w-3xl">
              {t.symbol} Grade A signal outcomes.
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-0 border pb-hairline rounded-sm overflow-hidden mb-8">
              <DataCell label="Closed Grade A" value={t.win_rate.closed.toLocaleString()} />
              <DataCell label="Win rate" value={t.win_rate.win_rate !== null ? `${t.win_rate.win_rate}%` : "—"} accent />
              {t.win_rate.avg_pnl !== null && (
                <DataCell label="Avg P&L" value={`${t.win_rate.avg_pnl > 0 ? "+" : ""}${t.win_rate.avg_pnl}%`} />
              )}
            </div>

            <p className="text-[15px] leading-[1.7] text-[#A9B4C6] max-w-3xl mb-5">
              All {t.symbol} signal outcomes are publicly auditable at <Link href="/results" className="pb-link text-white">/results</Link> — wins and losses, with no cherry-picking.
            </p>
            <Link
              href={`/options-flow/${t.symbol}/grade-a`}
              className="pb-mono text-[11px] uppercase tracking-[0.18em] text-[#34D399] pb-link"
            >
              Full {t.symbol} Grade A performance breakdown →
            </Link>
          </section>
        )}

        {/* ── FAQ ── */}
        <section className="max-w-6xl mx-auto px-6 py-16 border-b pb-hairline">
          <div className="flex items-baseline gap-3 mb-10">
            <span className="pb-section-num">05 / 07</span>
            <span className="pb-rule h-px flex-1" />
            <span className="pb-mono text-[11px] text-[#3D4D63]">Questions about {t.symbol}</span>
          </div>
          <h2 className="pb-editorial text-[32px] md:text-[40px] leading-[1.1] tracking-[-0.02em] text-white mb-10 max-w-3xl">
            The questions people actually ask.
          </h2>

          <div className="space-y-10 max-w-3xl">
            {faqItems.map((f, i) => (
              <div key={i}>
                <div className="pb-editorial text-[20px] md:text-[22px] text-white leading-[1.25] mb-3">{f.q}</div>
                <p className="text-[15px] text-[#A9B4C6] leading-[1.7]">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── EMAIL CTA ── */}
        <section className="max-w-6xl mx-auto px-6 py-16 border-b pb-hairline">
          <div className="flex items-baseline gap-3 mb-10">
            <span className="pb-section-num">06 / 07</span>
            <span className="pb-rule h-px flex-1" />
            <span className="pb-mono text-[11px] text-[#3D4D63]">Flow brief</span>
          </div>
          <div className="max-w-lg mx-auto">
            <EmailSignup source="flow-brief" variant="flow-brief" />
          </div>
        </section>

        {/* ── RELATED TICKERS ── */}
        {t.related_tickers.length > 0 && (
          <section className="max-w-6xl mx-auto px-6 py-16 border-b pb-hairline">
            <div className="flex items-baseline gap-3 mb-10">
              <span className="pb-section-num">07 / 07</span>
              <span className="pb-rule h-px flex-1" />
              <span className="pb-mono text-[11px] text-[#3D4D63]">Related {t.sector.toLowerCase()} flow</span>
            </div>
            <h2 className="pb-editorial text-[28px] md:text-[32px] leading-[1.1] tracking-[-0.02em] text-white mb-8 max-w-3xl">
              Other {t.sector.toLowerCase()} tickers with tracked flow.
            </h2>
            <div className="flex flex-wrap gap-2">
              {t.related_tickers.map(sym => (
                <Link
                  key={sym}
                  href={`/options-flow/${sym}`}
                  className="pb-chip pb-mono inline-flex items-center gap-2 px-4 py-2 border pb-hairline rounded-full text-[12px] font-semibold text-[#A9B4C6] transition-colors"
                >
                  {sym} <span className="text-[#3D4D63]">→</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── EDUCATIONAL LINKS ── */}
        <section className="max-w-6xl mx-auto px-6 py-12 border-b pb-hairline">
          <div className="pb-mono text-[10px] uppercase tracking-[0.22em] text-[#3D4D63] mb-4">Learn more</div>
          <div className="flex flex-wrap gap-x-6 gap-y-3 pb-mono text-[12px] uppercase tracking-[0.14em]">
            <Link href="/blog/how-to-read-options-flow" className="text-[#A9B4C6] hover:text-white transition-colors">How to read options flow</Link>
            <Link href="/blog/options-flow-signals-grade-a-b-c" className="text-[#A9B4C6] hover:text-white transition-colors">Grade A, B, and C explained</Link>
            <Link href="/blog/what-is-options-accumulation" className="text-[#A9B4C6] hover:text-white transition-colors">Options accumulation</Link>
            <Link href="/results" className="text-[#A9B4C6] hover:text-white transition-colors">Documented methodology</Link>
          </div>
        </section>

        {/* ── DATA FRESHNESS FOOTER ── */}
        <section className="max-w-6xl mx-auto px-6 py-8 pb-mono text-[11px] text-[#3D4D63] uppercase tracking-[0.14em]">
          Data refreshed daily · Generated {generatedDisplay} · Last {t.symbol} signal {lastSignalDisplay}
        </section>
      </main>

      <Footer />
    </>
  )
}

function DataCell({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="p-5 md:p-6 border-r last:border-r-0 border-b md:border-b-0 pb-hairline">
      <div className="pb-mono text-[10px] uppercase tracking-[0.2em] text-[#7A8BA8] mb-3">{label}</div>
      <div
        className={`pb-num text-[28px] md:text-[32px] leading-none ${accent ? "text-[#34D399]" : "text-white"} font-bold tabular-nums`}
      >
        {value}
      </div>
    </div>
  )
}
