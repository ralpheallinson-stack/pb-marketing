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
  outcome: string
  pnl_pct: number | null
}

type DteRow = {
  bucket: string
  total: number
  wins: number
  win_rate: number | null
}

type GradeADetail = {
  total: number
  closed: number
  wins: number
  losses: number
  win_rate: number | null
  avg_win_pct: number | null
  avg_loss_pct: number | null
  best_pnl: number | null
  worst_pnl: number | null
  open_positions: number
  outcomes: {
    big_win: number
    win: number
    small_win: number
    loss: number
    big_loss: number
    expired: number
    scratch: number
  }
  dte_breakdown: DteRow[]
  recent_teases: RecentTease[]
}

type TickerData = {
  symbol: string
  sector: string
  total_premium_fmt: string
  related_tickers: string[]
  grade_a_detail: GradeADetail
}

type Dataset = {
  generated_date: string
  tickers: Record<string, TickerData>
}

let _cache: Dataset | null = null
function loadData(): Dataset {
  if (_cache) return _cache
  const p = path.join(process.cwd(), "data", "ticker-pages.json")
  _cache = JSON.parse(fs.readFileSync(p, "utf-8")) as Dataset
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

  const url = `https://profitbuilders.io/options-flow/${t.symbol}/grade-a`
  const ga = t.grade_a_detail
  const ctxText = `data methodology`
  // Tighter: short suffix + brand template = clean SERP display
  const title = `${t.symbol} Grade A Flow · ${ga.total.toLocaleString()} Signals`
  const description = `${t.symbol} Grade A institutional options flow — ${ga.total.toLocaleString()} signals captured via OPRA tape with CBOE Rule 6.11 sweep detection and Black-Scholes-Merton Greeks. Documented methodology at /results.`

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
    twitter: { card: "summary_large_image", title, description },
  }
}

function fmtPnl(p: number | null): string {
  if (p === null) return "—"
  return `${p > 0 ? "+" : ""}${p.toFixed(1)}%`
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
  })
}

function wrColor(wr: number | null): string {
  if (wr === null) return "#6B7280"
  if (wr >= 40) return "#10B981"
  if (wr >= 30) return "#F97316"
  return "#EF4444"
}

export default async function GradeAPage(
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params
  const data = loadData()
  const t = data.tickers[ticker.toUpperCase()]
  if (!t) notFound()

  const ga = t.grade_a_detail
  const url = `https://profitbuilders.io/options-flow/${t.symbol}/grade-a`

  // ── Schema ──
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": `${t.symbol} Grade A Options Flow — Historical Performance`,
    "description": `${t.symbol} Grade A institutional options flow signals with full win/loss outcomes and P&L.`,
    "datePublished": data.generated_date,
    "dateModified": data.generated_date,
    "author": { "@type": "Organization", "name": "Profit Builders", "url": "https://profitbuilders.io" },
    "publisher": {
      "@type": "Organization", "name": "Profit Builders",
      "logo": { "@type": "ImageObject", "url": "https://profitbuilders.io/images/pb-logo.png" },
    },
    "url": url,
    "mainEntityOfPage": { "@type": "WebPage", "@id": url },
    "about": { "@type": "Corporation", "tickerSymbol": t.symbol },
  }

  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "name": `${t.symbol} Grade A Signal Performance`,
    "description": `Historical outcomes for ${ga.total.toLocaleString()} Grade A institutional options flow signals on ${t.symbol}.`,
    "creator": { "@type": "Organization", "name": "Profit Builders" },
    "datePublished": data.generated_date,
    "dateModified": data.generated_date,
    "keywords": [
      `${t.symbol} grade a options`,
      `${t.symbol} options methodology`,
      `${t.symbol} institutional options performance`,
      `${t.symbol} options flow methodology`,
    ],
    "variableMeasured": [
      { "@type": "PropertyValue", "name": "Total Grade A signals", "value": ga.total },
      { "@type": "PropertyValue", "name": "Closed positions", "value": ga.closed },
      { "@type": "PropertyValue", "name": "Closed positions", "value": ga.closed },
    ],
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://profitbuilders.io" },
      { "@type": "ListItem", "position": 2, "name": "Options Flow", "item": "https://profitbuilders.io/options-flow" },
      { "@type": "ListItem", "position": 3, "name": t.symbol, "item": `https://profitbuilders.io/options-flow/${t.symbol}` },
      { "@type": "ListItem", "position": 4, "name": "Grade A", "item": url },
    ],
  }

  const outcomeRows: { label: string; value: number; color: string }[] = [
    { label: "BIG_WIN", value: ga.outcomes.big_win, color: "#10B981" },
    { label: "WIN", value: ga.outcomes.win, color: "#10B981" },
    { label: "SMALL_WIN", value: ga.outcomes.small_win, color: "#10B981" },
    { label: "LOSS", value: ga.outcomes.loss, color: "#EF4444" },
    { label: "BIG_LOSS", value: ga.outcomes.big_loss, color: "#EF4444" },
    { label: "EXPIRED", value: ga.outcomes.expired, color: "#6B7280" },
    { label: "SCRATCH", value: ga.outcomes.scratch, color: "#6B7280" },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <Nav />

      <main className="bg-white">
        {/* Breadcrumb */}
        <div className="max-w-5xl mx-auto px-6 pt-8">
          <nav className="text-[12px] text-gray-500">
            <Link href="/" className="hover:text-[#F97316]">Home</Link>
            <span className="mx-2">›</span>
            <Link href="/options-flow" className="hover:text-[#F97316]">Options Flow</Link>
            <span className="mx-2">›</span>
            <Link href={`/options-flow/${t.symbol}`} className="hover:text-[#F97316]">{t.symbol}</Link>
            <span className="mx-2">›</span>
            <span className="text-gray-900 font-semibold">Grade A</span>
          </nav>
        </div>

        {/* ── HERO ── */}
        <section className="max-w-5xl mx-auto px-6 pt-8 pb-12">
          <div className="flex items-center gap-3 text-[11px] text-gray-400 uppercase tracking-[3px] font-semibold mb-4">
            <span>Grade A · Historical Performance</span>
            <span>·</span>
            <span>Data as of {formatDate(data.generated_date)}</span>
          </div>

          <h1 className="text-[36px] sm:text-[52px] font-bold text-gray-950 leading-[1.05] tracking-[-0.03em] mb-5">
            {t.symbol} Grade A Options Flow
          </h1>

          <p className="text-[18px] text-gray-600 leading-relaxed max-w-3xl mb-10">
            <strong className="text-gray-900">{ga.total.toLocaleString()}</strong> Grade A institutional flow signals on {t.symbol}, captured via the live OPRA tape with CBOE Rule 6.11 sweep detection and Black-Scholes-Merton Greeks. Methodology at <Link href="/methodology" className="underline hover:text-[#F97316]">/results</Link>.
          </p>

          {/* Key stats 4-col */}
          <div className="grid grid-cols-2 gap-4 mb-8 max-w-md">
            <StatCard label="Total Grade A" value={ga.total.toLocaleString()} />
            <StatCard label="Closed positions" value={ga.closed.toLocaleString()} accent />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href={`/options-flow/${t.symbol}`}
              className="inline-flex items-center gap-2 text-gray-700 hover:text-[#F97316] font-semibold text-[14px]"
            >
              ← Back to {t.symbol} overview
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold px-6 py-3 rounded-full text-[14px] transition-colors"
            >
              Get {t.symbol} Grade A alerts →
            </Link>
          </div>
        </section>

        {/* ── OUTCOME BREAKDOWN ── */}
        <section className="max-w-5xl mx-auto px-6 py-12 border-t border-gray-100">
          <div className="text-[11px] text-gray-400 uppercase tracking-[3px] font-semibold mb-3">Outcome breakdown</div>
          <h2 className="text-[28px] font-bold text-gray-950 leading-tight tracking-[-0.02em] mb-6">
            How {t.symbol} Grade A signals have closed
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {outcomeRows.map(o => (
              <div key={o.label} className="p-4 border border-gray-200 rounded-lg">
                <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-2">{o.label}</div>
                <div className="text-[24px] font-bold" style={{ color: o.color, fontVariantNumeric: "tabular-nums" }}>
                  {o.value.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── DTE PERFORMANCE ── */}
        {ga.dte_breakdown.length > 0 && (
          <section className="max-w-5xl mx-auto px-6 py-12 border-t border-gray-100">
            <div className="text-[11px] text-gray-400 uppercase tracking-[3px] font-semibold mb-3">DTE Performance</div>
            <h2 className="text-[28px] font-bold text-gray-950 leading-tight tracking-[-0.02em] mb-6">
              Where {t.symbol} Grade A signals perform
            </h2>

            <div className="rounded-xl border border-gray-200 divide-y divide-gray-100">
              {ga.dte_breakdown.map(d => (
                <div key={d.bucket} className="flex items-center gap-6 px-5 py-4 hover:bg-[#FAFAFA] transition-colors">
                  <div className="w-28 flex-shrink-0 text-[14px] font-semibold text-gray-900">{d.bucket}</div>
                  <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${Math.min(100, d.win_rate ?? 0)}%`, background: wrColor(d.win_rate) }}
                    />
                  </div>
                  <div className="w-16 text-right font-bold text-[15px]" style={{ color: wrColor(d.win_rate), fontVariantNumeric: "tabular-nums" }}>
                    {d.win_rate !== null ? `${d.win_rate}%` : "—"}
                  </div>
                  <div className="w-40 text-right text-[12px] text-gray-400" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {d.wins.toLocaleString()} / {d.total.toLocaleString()} closed
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── BEST / WORST ── */}
        {(ga.best_pnl !== null || ga.worst_pnl !== null) && (
          <section className="max-w-5xl mx-auto px-6 py-12 border-t border-gray-100">
            <div className="text-[11px] text-gray-400 uppercase tracking-[3px] font-semibold mb-3">Extremes</div>
            <h2 className="text-[28px] font-bold text-gray-950 leading-tight tracking-[-0.02em] mb-6">
              Best and worst Grade A {t.symbol} closures
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 border border-gray-200 rounded-xl">
                <div className="text-[10px] text-[#10B981] uppercase tracking-[3px] font-bold mb-2">Best winner</div>
                <div className="text-[42px] font-bold text-[#10B981]" style={{ fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>
                  {fmtPnl(ga.best_pnl)}
                </div>
                <div className="text-[13px] text-gray-500 mt-2">Single Grade A {t.symbol} trade return</div>
              </div>
              <div className="p-6 border border-gray-200 rounded-xl">
                <div className="text-[10px] text-[#EF4444] uppercase tracking-[3px] font-bold mb-2">Worst loser</div>
                <div className="text-[42px] font-bold text-[#EF4444]" style={{ fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>
                  {fmtPnl(ga.worst_pnl)}
                </div>
                <div className="text-[13px] text-gray-500 mt-2">DTE-based exit rule capped the loss</div>
              </div>
            </div>
          </section>
        )}

        {/* ── RECENT TEASES ── */}
        {ga.recent_teases.length > 0 && (
          <section className="max-w-5xl mx-auto px-6 py-12 border-t border-gray-100">
            <div className="text-[11px] text-gray-400 uppercase tracking-[3px] font-semibold mb-3">Recent Grade A {t.symbol} activity</div>
            <h2 className="text-[28px] font-bold text-gray-950 leading-tight tracking-[-0.02em] mb-6">
              Last 5 Grade A prints
            </h2>
            <p className="text-[14px] text-gray-500 mb-6 max-w-2xl">
              Size-bucketed for public view. Exact strikes, expirations, and entry premiums are visible only in the live scanner.
            </p>
            <div className="rounded-xl border border-gray-200 divide-y divide-gray-100">
              {ga.recent_teases.map((r, i) => {
                const isWin = r.outcome === "WIN" || r.outcome === "BIG_WIN" || r.outcome === "SMALL_WIN"
                const isLoss = r.outcome === "LOSS" || r.outcome === "BIG_LOSS"
                const color = isWin ? "#10B981" : isLoss ? "#EF4444" : r.outcome === "OPEN" ? "#F97316" : "#6B7280"
                const bg = isWin ? "#ECFDF5" : isLoss ? "#FEF2F2" : r.outcome === "OPEN" ? "#FFF7ED" : "#F3F4F6"
                return (
                  <div key={i} className="flex items-center justify-between px-5 py-3.5 hover:bg-[#FAFAFA] transition-colors">
                    <div className="flex items-center gap-3 min-w-0 flex-wrap">
                      <span
                        className="text-[9px] font-bold uppercase tracking-wider rounded px-2 py-1 flex-shrink-0"
                        style={{ color, background: bg, border: `1px solid ${color}33` }}
                      >
                        {r.outcome}
                      </span>
                      <div>
                        <div className="text-[14px] font-semibold text-gray-900">
                          {r.size_bucket} {r.direction} · {r.flow_type.toLowerCase().replace("_", " ")}
                        </div>
                        <div className="text-[11px] text-gray-400 mt-0.5">{formatDate(r.date)}</div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-bold text-[15px]" style={{ color, fontVariantNumeric: "tabular-nums" }}>
                        {fmtPnl(r.pnl_pct)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* ── EMAIL CTA ── */}
        <section className="max-w-5xl mx-auto px-6 py-12 border-t border-gray-100">
          <div className="max-w-lg mx-auto">
            <EmailSignup source="flow-brief" variant="flow-brief" />
          </div>
        </section>

        {/* ── RELATED TICKERS ── */}
        {t.related_tickers.length > 0 && (
          <section className="max-w-5xl mx-auto px-6 py-12 border-t border-gray-100">
            <div className="text-[11px] text-gray-400 uppercase tracking-[3px] font-semibold mb-3">Related {t.sector} Grade A</div>
            <h2 className="text-[22px] font-bold text-gray-950 mb-6">
              Grade A performance on related {t.sector.toLowerCase()} tickers
            </h2>
            <div className="flex flex-wrap gap-3">
              {t.related_tickers.map(sym => (
                <Link
                  key={sym}
                  href={`/options-flow/${sym}/grade-a`}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 hover:border-[#F97316] rounded-lg text-[14px] font-semibold text-gray-900 hover:text-[#F97316] transition-colors"
                >
                  {sym} Grade A →
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── METHODOLOGY STRIP ── */}
        <section className="max-w-5xl mx-auto px-6 py-10 border-t border-gray-100 text-[12px] text-gray-400 leading-relaxed">
          <strong className="text-gray-500">Methodology.</strong> Grade A signals pass the institutional-flow filter pipeline: institutional premium floor, contract-level volume baseline, aggressive fill detection, market-maker filtering, opening-position classification. See /results for the full data methodology. Exit rules are DTE-based: 0DTE +20%/-20%, 1-5 DTE +25%/-25%, 6-30 DTE +40%/-30%, 30+ DTE +30%/-30%. See the full <Link href="/methodology" className="text-[#F97316] hover:underline">data methodology →</Link>.
        </section>
      </main>

      <Footer />
    </>
  )
}

function StatCard({ label, value, color = "#0A0A0A", accent = false }: { label: string; value: string; color?: string; accent?: boolean }) {
  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-white">
      <div className="text-[10px] text-gray-400 uppercase tracking-[2px] font-semibold mb-2">{label}</div>
      <div className="text-[26px] font-bold leading-none" style={{ color, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>
        {value}
      </div>
    </div>
  )
}
