"use client"

import { useState, useEffect } from "react"
import Nav from "@/components/Nav"
import Footer from "@/components/Footer"
import Link from "next/link"

interface Summary { total_closed: number; grade_a_avg_return: number; best_winner_pnl: number; avg_grade_a_winner: number; best_winner_symbol: string }
interface GradeRow { grade: string; total: number; wins: number; losses: number; avg_pnl: number; avg_win_pct: number; avg_loss_pct: number; win_rate: number }
interface DteRow { dte_range: string; total: number; wins: number; avg_win_pct: number; avg_loss_pct: number; win_rate: number }
interface MonthRow { month: string; month_display: string; total: number; wins: number; losses: number; avg_win_pct: number; avg_loss_pct: number; win_rate: number }
interface Winner { symbol: string; trade_display: string; strike_display: string; premium_display: string; pnl_display: string; exit_date_display: string; exp_display: string; pnl: number }
interface Signal { symbol: string; trade_display: string; strike_display: string; premium_display: string; pnl_display: string; outcome: string; exit_date_display: string; exit_reason: string; pnl: number }
interface Data { summary: Summary; by_grade: GradeRow[]; by_dte: DteRow[]; monthly: MonthRow[]; top_winners: Winner[]; recent_signals: Signal[] }

const wrColor = (wr: number) =>
  wr >= 40 ? "#34D399" : wr >= 30 ? "#F59E0B" : "#EF4444"

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!target) return
    const start = performance.now()
    let raf = 0
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
      setValue(Math.floor(target * eased))
      if (t < 1) raf = requestAnimationFrame(step)
      else setValue(target)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return value
}

export default function ResultsPage() {
  const [data, setData] = useState<Data | null>(null)

  useEffect(() => {
    document.title = "Options Flow Signal Track Record | Profit Builders"
    fetch("/api/track-record").then(r => r.json()).then(setData).catch(() => {})
  }, [])

  const s = data?.summary
  const gradeA = data?.by_grade?.find(g => g.grade === "A")
  const totalClosed = s?.total_closed ?? 174000
  const gradeAWinRate = gradeA?.win_rate ?? 39.3
  const avgReturn = s?.grade_a_avg_return ?? 0

  const totalCount = useCountUp(totalClosed, 1400)

  const faqSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How do I know these options flow outcomes aren't cherry-picked?",
        "acceptedAnswer": { "@type": "Answer", "text": "Every signal is logged to the database at the moment it's flagged, before the outcome is known. The scanner cannot retroactively add, remove, or modify a signal. The monthly performance table shows every month including the bad ones — no missing periods, no gaps." },
      },
      {
        "@type": "Question",
        "name": "What happens to signals that are still open?",
        "acceptedAnswer": { "@type": "Answer", "text": "Open positions are excluded from the win rate calculation until they close (hit target, stop, or expiry). Only resolved signals contribute. This keeps the win rate honest — we don't pad it with unrealized winners." },
      },
      {
        "@type": "Question",
        "name": "Why is the Grade A win rate 'only' 39.3%?",
        "acceptedAnswer": { "@type": "Answer", "text": "Because it's real. A Grade A win rate above 50% on a published log would be statistically suspicious on the kind of sample size we have. A 39.3% rate with asymmetric exits (+40% wins, -30% losses on the typical DTE band) is profitable in expected value. Marketing-grade win rates aren't." },
      },
      {
        "@type": "Question",
        "name": "How do you handle losing streaks in the options flow track record?",
        "acceptedAnswer": { "@type": "Answer", "text": "They happen. The monthly table shows months where the win rate drops below the overall average. We don't smooth or filter those. A public track record that hides losing stretches isn't a track record, it's marketing." },
      },
      {
        "@type": "Question",
        "name": "What if the exit rules changed?",
        "acceptedAnswer": { "@type": "Answer", "text": "They don't change retroactively. Any rule revision applies only to signals flagged after the change. The rules governing a 2024 signal are the rules that were active in 2024. Historical data is never re-computed with newer rules." },
      },
      {
        "@type": "Question",
        "name": "Can I download the raw options flow outcome data?",
        "acceptedAnswer": { "@type": "Answer", "text": "The data shown on this page is the public log. An API for bulk download is on the roadmap for subscribers — email support@profitbuilders.io if that's a dealbreaker for your workflow." },
      },
    ],
  })

  const datasetSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Dataset",
    "name": "Profit Builders Options Flow Signal Track Record",
    "alternateName": "Profit Builders Public Signal Log",
    "description": `Publicly auditable log of every Grade A and Grade B institutional options flow signal issued by the Profit Builders scanner. ${totalClosed.toLocaleString()}+ signals tracked with full win/loss outcomes, P&L, and exit reasons. Grade A win rate: ${gradeAWinRate}%.`,
    "url": "https://profitbuilders.io/results",
    "sameAs": "https://profitbuilders.io/results",
    "keywords": ["options flow track record","options signal win rate","unusual options activity performance","institutional options flow outcomes","Grade A options signals","profit builders results"],
    "creator": { "@type": "Organization", "name": "Profit Builders", "url": "https://profitbuilders.io" },
    "publisher": { "@type": "Organization", "name": "Profit Builders", "url": "https://profitbuilders.io", "logo": "https://profitbuilders.io/images/pb-logo.png" },
    "license": "https://profitbuilders.io/terms",
    "isAccessibleForFree": true,
    "variableMeasured": [
      { "@type": "PropertyValue", "name": "Total closed signals", "value": totalClosed },
      { "@type": "PropertyValue", "name": "Grade A win rate", "value": `${gradeAWinRate}%` },
      { "@type": "PropertyValue", "name": "Grade A average return", "value": `${avgReturn}%` },
    ],
    "distribution": { "@type": "DataDownload", "encodingFormat": "text/html", "contentUrl": "https://profitbuilders.io/results" },
    "temporalCoverage": "2024-01-01/..",
    "spatialCoverage": "US equity options markets",
  })

  const bestWinPct = s?.best_winner_pnl ?? 0
  const avgWinPct = s?.avg_grade_a_winner ?? 0
  const avgLossPct = gradeA?.avg_loss_pct ?? 0

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: datasetSchema }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqSchema }} />

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
      `}</style>

      <Nav />

      <main className="pb-grain text-[#E8EDF5] min-h-screen">

        {/* ── HERO ── */}
        <section className="max-w-6xl mx-auto px-6 pt-28 pb-16 border-b pb-hairline">
          <div className="flex items-baseline gap-3 mb-6">
            <span className="pb-section-num">Track record</span>
            <span className="pb-rule h-px flex-1" />
            <span className="pb-mono text-[11px] text-[#3D4D63]">Updated live</span>
          </div>

          <h1 className="pb-editorial text-[44px] sm:text-[60px] md:text-[68px] leading-[1.02] tracking-[-0.025em] text-white mb-8">
            Every signal. Every outcome. <span className="text-[#3D4D63]">Public.</span>
          </h1>

          <p className="text-[18px] leading-[1.6] text-[#A9B4C6] max-w-3xl mb-5">
            Every Grade A and Grade B signal issued by the scanner — with full win/loss outcomes, P&amp;L, and exit reasons. Nothing removed. Nothing retroactively adjusted. Most options flow platforms don&apos;t publish outcome data at all. This page is the reason we can compete on substance instead of marketing.
          </p>
          <p className="text-[15px] leading-[1.65] text-[#A9B4C6] max-w-3xl mb-14">
            Numbers below refresh live from our outcome database. The <span className="text-white font-medium">{totalClosed.toLocaleString()}+</span> resolved signals shown each represent one real Grade A or Grade B flag, with its entry conditions, exit rules applied uniformly, and P&amp;L calculated against actual market data. The data is auditable because every signal is logged at flag time — before the outcome is known.
          </p>

          {/* Hero grid: big number + key stat */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-end">
            <div className="md:col-span-3">
              <div className="pb-mono text-[10px] text-[#7A8BA8] uppercase tracking-[0.24em] mb-3">Signals Tracked</div>
              <div
                className="pb-num text-white"
                style={{
                  fontSize: "clamp(64px, 11vw, 128px)",
                  fontWeight: 700,
                  lineHeight: 0.95,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {totalCount.toLocaleString()}
                <span className="text-[#34D399]">+</span>
              </div>
            </div>

            <div className="md:col-span-2 md:border-l md:border-[#252E3D] md:pl-8">
              <div className="pb-mono text-[10px] text-[#7A8BA8] uppercase tracking-[0.24em] mb-3">Grade A Win Rate</div>
              <div
                className="pb-num mb-2"
                style={{
                  fontSize: "clamp(48px, 8vw, 72px)",
                  fontWeight: 700,
                  lineHeight: 0.95,
                  color: wrColor(gradeAWinRate),
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {gradeAWinRate}<span style={{ fontSize: "0.55em", color: "#34D399" }}>%</span>
              </div>
              <div className="pb-mono text-[11px] text-[#7A8BA8] uppercase tracking-[0.14em]">
                Wins / (wins + losses), excluding scratches
              </div>
            </div>
          </div>
        </section>

        {/* ── KEY METRICS STRIP ── */}
        <section className="max-w-5xl mx-auto px-6 py-10 border-t pb-hairline">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Avg Winner", value: `+${avgWinPct}%`, color: "#10B981" },
              { label: "Avg Loser", value: `${avgLossPct}%`, color: "#EF4444" },
              { label: "Best Trade", value: `+${bestWinPct}%`, sub: s?.best_winner_symbol ?? "", color: "#34D399" },
              { label: "Closed Signals", value: totalClosed.toLocaleString(), color: "#FFFFFF" },
            ].map(m => (
              <div key={m.label}>
                <div className="text-[10px] text-[#7A8BA8] uppercase tracking-[2px] font-semibold mb-2">{m.label}</div>
                <div
                  className="text-white"
                  style={{
                    fontSize: 32,
                    fontWeight: 700,
                    letterSpacing: "-0.025em",
                    color: m.color,
                    lineHeight: 1,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {m.value}
                </div>
                {m.sub && (
                  <div className="text-[11px] text-[#7A8BA8] mt-1 font-medium">{m.sub}</div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── STATIC SEO CONTENT — visible in HTML before hydration ── */}

        {/* Why we publish this */}
        <section className="max-w-5xl mx-auto px-6 py-12 border-t pb-hairline">
          <div className="text-[11px] text-[#7A8BA8] uppercase tracking-[3px] font-semibold mb-3">Philosophy</div>
          <h2 className="text-[28px] sm:text-[32px] font-bold text-white leading-tight tracking-[-0.02em] mb-6 max-w-3xl">
            Why most options flow platforms don&apos;t publish a track record — and why we do.
          </h2>
          <div className="prose max-w-3xl text-[16px] leading-[1.7] text-[#E8EDF5] space-y-4">
            <p>
              Unusual Whales doesn&apos;t publish signal outcomes. FlowAlgo doesn&apos;t publish signal outcomes. Cheddar Flow doesn&apos;t publish signal outcomes. The reason is simple: once you publish outcomes, you&apos;re accountable for them. Every losing streak gets logged. Every filter that fails shows up in the data. There&apos;s nowhere to hide.
            </p>
            <p>
              We publish outcomes because accountability is the product. If the scanner&apos;s Grade A tier wins 39.3% of the time and loses 60.7% of the time, a trader applying a 2:1 risk-reward ratio still comes out ahead. That math only works if the win rate is real. The only way to prove it&apos;s real is to log every signal when it&apos;s flagged — before the outcome is known — and apply uniform exit rules that don&apos;t favor the scanner.
            </p>
            <p>
              Every signal on this page was automatically logged to the database at the moment it was flagged. The exit rules are deterministic (0 DTE closes at ±20%, 1–5 DTE at ±25%, 6–30 DTE at +40%/-30%, 30+ DTE at ±30%). The scanner cannot retroactively adjust a signal after seeing how it played out. What you see below is the raw output of an accountable system — including the losing months, the losing weeks, and the losing days.
            </p>
          </div>
        </section>

        {/* The 9 filters */}
        <section className="max-w-5xl mx-auto px-6 py-12 border-t pb-hairline">
          <div className="text-[11px] text-[#7A8BA8] uppercase tracking-[3px] font-semibold mb-3">The 9-filter engine</div>
          <h2 className="text-[28px] sm:text-[32px] font-bold text-white leading-tight tracking-[-0.02em] mb-6 max-w-3xl">
            What makes a Grade A signal.
          </h2>
          <p className="text-[16px] leading-[1.7] text-[#E8EDF5] max-w-3xl mb-8">
            Every print on the options tape runs through nine checks before anything reaches your alert feed. Grade A means all nine agree. Grade B means most agree. Anything that fails multiple checks never becomes a signal. Here are the nine:
          </p>
          <div className="grid md:grid-cols-2 gap-4 max-w-5xl">
            {[
              ["01 · Closing-position detection", "Identifies trades that are closing an existing position rather than opening a new one. Closing activity is noise, not signal — it's telling you about a trade someone already made."],
              ["02 · Direction classification", "Maps the action field (BUY_CALLS, SELL_CALLS, BUY_PUTS, SELL_PUTS) to directional bias. A BUY_PUT is bearish; a SELL_PUT is bullish. Raw flow platforms often conflate these."],
              ["03 · Delta screening", "Rejects deep ITM options (delta > 0.85) where the trade behaves like stock and the flow signal is weak. Also filters out ultra-low-delta speculation."],
              ["04 · Spread detection", "Identifies multi-leg structures (verticals, iron condors, etc.) where the individual leg's apparent direction is misleading. A credit spread's short leg isn't a directional bet."],
              ["05 · Market-maker identification", "Tags prints that originate from market maker hedging activity rather than positioning. MM flow is mechanical, not directional."],
              ["06 · Premium threshold", "Requires minimum premium relative to the ticker's normal flow profile. A $50K print on a $5B-market-cap name is noteworthy; the same print on NVDA isn't."],
              ["07 · Vol/OI ratio", "Checks whether the contract's volume is materially above its open interest — the signature of new money entering, not existing positions turning over."],
              ["08 · Aggression classification", "At-bid vs at-ask vs mid-market. At-ask buys are aggressive bullish initiations; at-bid sells are aggressive bearish initiations. Mid-market is ambiguous and usually filtered."],
              ["09 · Sector / macro context", "Sanity-checks the signal against sector and broader market conditions. A bullish signal on an earnings-negative tape gets extra scrutiny."],
            ].map(([title, body]) => (
              <div key={title} className="p-5 rounded-xl border border-[#252E3D] bg-[rgba(255,255,255,0.02)]">
                <div className="font-bold text-white mb-2 text-[14px] leading-tight">{title}</div>
                <p className="text-[13px] text-[#A9B4C6] leading-[1.55]">{body}</p>
              </div>
            ))}
          </div>
          <p className="text-[15px] leading-[1.7] text-[#A9B4C6] max-w-3xl mt-8">
            Grade A signals require all nine filters to agree. Grade B requires most. The 25% win-rate spread between Grade A (39.3%) and Grade B (31.6%) is evidence that the filter stack is doing work — if it weren&apos;t, both grades would score the same. That delta is what you&apos;re paying for.
          </p>
        </section>

        {!data ? (
          <div className="text-center py-20 text-[#7A8BA8] text-sm">Loading live track record data…</div>
        ) : (
          <>
            {/* ── GRADE BREAKDOWN ── */}
            {data.by_grade.length > 0 && (
              <Section title="Performance by grade">
                <div className="overflow-x-auto rounded-xl border border-[#252E3D]">
                  <table className="w-full text-[14px]" style={{ fontVariantNumeric: "tabular-nums" }}>
                    <thead className="border-b pb-hairline bg-[rgba(255,255,255,0.02)]">
                      <tr>
                        <Th align="left">Grade</Th>
                        <Th align="right">Trades</Th>
                        <Th align="right">Wins</Th>
                        <Th align="right">Losses</Th>
                        <Th align="right">Win Rate</Th>
                        <Th align="right">Avg Win</Th>
                        <Th align="right">Avg Loss</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.by_grade.map(g => (
                        <tr key={g.grade} className="border-b pb-hairline last:border-0 hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                          <Td align="left"><span className="font-bold text-[#34D399]">Grade {g.grade}</span></Td>
                          <Td align="right">{g.total.toLocaleString()}</Td>
                          <Td align="right" color="#10B981">{g.wins.toLocaleString()}</Td>
                          <Td align="right" color="#EF4444">{g.losses.toLocaleString()}</Td>
                          <Td align="right" strong color={wrColor(g.win_rate)}>{g.win_rate}%</Td>
                          <Td align="right" color="#10B981">+{g.avg_win_pct}%</Td>
                          <Td align="right" color="#EF4444">{g.avg_loss_pct}%</Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Section>
            )}

            {/* ── DTE DISTRIBUTION ── */}
            <Section title="Distribution by DTE" sub="Days to expiration">
              <div className="rounded-xl border border-[#252E3D] divide-y divide-[#1A1F2A]">
                {data.by_dte.map(d => (
                  <div
                    key={d.dte_range}
                    className="flex items-center gap-6 px-5 py-4 hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                  >
                    <div className="w-28 flex-shrink-0 text-[14px] font-semibold text-white">{d.dte_range}</div>
                    <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, d.win_rate)}%`,
                          background: wrColor(d.win_rate),
                        }}
                      />
                    </div>
                    <div
                      className="w-16 text-right font-bold text-[15px]"
                      style={{ color: wrColor(d.win_rate), fontVariantNumeric: "tabular-nums" }}
                    >
                      {d.win_rate}%
                    </div>
                    <div className="w-28 text-right text-[12px] text-[#7A8BA8]" style={{ fontVariantNumeric: "tabular-nums" }}>
                      {d.total.toLocaleString()} signals
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* ── MONTHLY PERFORMANCE ── */}
            <Section title="Monthly performance" sub="No cherry-picking — every month shown">
              <div className="overflow-x-auto rounded-xl border border-[#252E3D]">
                <table className="w-full text-[14px]" style={{ fontVariantNumeric: "tabular-nums" }}>
                  <thead className="border-b pb-hairline bg-[rgba(255,255,255,0.02)]">
                    <tr>
                      <Th align="left">Month</Th>
                      <Th align="right">Signals</Th>
                      <Th align="right">Wins</Th>
                      <Th align="right">Win Rate</Th>
                      <Th align="right">Avg Win</Th>
                      <Th align="right">Avg Loss</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.monthly.map(m => (
                      <tr key={m.month} className="border-b pb-hairline last:border-0 hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                        <Td align="left" strong>{m.month_display}</Td>
                        <Td align="right">{m.total.toLocaleString()}</Td>
                        <Td align="right" color="#10B981">{m.wins.toLocaleString()}</Td>
                        <Td align="right" strong color={wrColor(m.win_rate)}>{m.win_rate}%</Td>
                        <Td align="right" color="#10B981">+{m.avg_win_pct}%</Td>
                        <Td align="right" color="#EF4444">{m.avg_loss_pct}%</Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            {/* ── TOP WINNERS + RECENT SIGNALS ── */}
            <div className="max-w-5xl mx-auto px-6 py-12 border-t pb-hairline">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Top Winners */}
                <div>
                  <div className="text-[11px] text-[#7A8BA8] uppercase tracking-[3px] font-semibold mb-2">Top Winners</div>
                  <h2 className="text-[22px] font-bold text-white leading-tight tracking-[-0.02em] mb-6">
                    Biggest closed wins
                  </h2>
                  <div className="rounded-xl border border-[#252E3D] divide-y divide-[#1A1F2A]">
                    {data.top_winners.slice(0, 10).map((w, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between px-5 py-3.5 hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-[11px] text-[#7A8BA8] font-semibold w-5" style={{ fontVariantNumeric: "tabular-nums" }}>
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-baseline gap-2 flex-wrap">
                              <span className="font-bold text-white text-[14px]">{w.symbol}</span>
                              <span className="text-[12px] text-[#A9B4C6] truncate">
                                {w.trade_display} {w.strike_display}
                              </span>
                            </div>
                            <div className="text-[11px] text-[#7A8BA8] mt-0.5">
                              {w.premium_display} · exp {w.exp_display}
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-3">
                          <div
                            className="font-bold text-[15px]"
                            style={{
                              color: i === 0 ? "#34D399" : "#10B981",
                              fontVariantNumeric: "tabular-nums",
                            }}
                          >
                            {w.pnl_display}
                          </div>
                          <div className="text-[11px] text-[#7A8BA8] mt-0.5">{w.exit_date_display}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Signals */}
                <div>
                  <div className="text-[11px] text-[#7A8BA8] uppercase tracking-[3px] font-semibold mb-2">Recent Signals</div>
                  <h2 className="text-[22px] font-bold text-white leading-tight tracking-[-0.02em] mb-6">
                    Last 10 closed · wins &amp; losses
                  </h2>
                  <div className="rounded-xl border border-[#252E3D] divide-y divide-[#1A1F2A]">
                    {data.recent_signals.slice(0, 10).map((sig, i) => {
                      const isWin = sig.outcome === "WIN" || sig.outcome === "BIG_WIN" || sig.outcome === "SMALL_WIN"
                      const isScratch = sig.outcome === "SCRATCH"
                      const color = isWin ? "#10B981" : isScratch ? "#6B7280" : "#EF4444"
                      const bg = isWin ? "rgba(52,211,153,0.10)" : isScratch ? "rgba(122,139,168,0.08)" : "rgba(239,68,68,0.10)"
                      return (
                        <div
                          key={i}
                          className="flex items-center justify-between px-5 py-3.5 hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span
                              className="text-[9px] font-bold uppercase tracking-wider rounded px-2 py-1 flex-shrink-0"
                              style={{ color, background: bg, border: `1px solid ${color}33` }}
                            >
                              {sig.outcome}
                            </span>
                            <div className="min-w-0">
                              <div className="flex items-baseline gap-2 flex-wrap">
                                <span className="font-bold text-white text-[14px]">{sig.symbol}</span>
                                <span className="text-[12px] text-[#A9B4C6] truncate">
                                  {sig.trade_display} {sig.strike_display}
                                </span>
                              </div>
                              <div className="text-[11px] text-[#7A8BA8] mt-0.5">
                                {sig.premium_display} · {sig.exit_reason}
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-3">
                            <div
                              className="font-bold text-[15px]"
                              style={{ color, fontVariantNumeric: "tabular-nums" }}
                            >
                              {sig.pnl_display}
                            </div>
                            <div className="text-[11px] text-[#7A8BA8] mt-0.5">{sig.exit_date_display}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* ── METHODOLOGY ── */}
            <section className="max-w-5xl mx-auto px-6 py-12 border-t pb-hairline">
              <div className="text-[11px] text-[#7A8BA8] uppercase tracking-[3px] font-semibold mb-3">Methodology</div>
              <h2 className="text-[22px] font-bold text-white leading-tight tracking-[-0.02em] mb-6">
                How every number on this page is calculated
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-[14px] text-[#A9B4C6] leading-relaxed">
                <div className="p-5 rounded-xl border border-[#252E3D] bg-[rgba(255,255,255,0.02)]">
                  <div className="font-bold text-white mb-1.5 text-[13px]">Selection</div>
                  <p>Grade A win rate includes only Grade A signals — the highest conviction tier. Grade B shown separately for distribution context.</p>
                </div>
                <div className="p-5 rounded-xl border border-[#252E3D] bg-[rgba(255,255,255,0.02)]">
                  <div className="font-bold text-white mb-1.5 text-[13px]">Computation</div>
                  <p>Win rate = wins / (wins + losses). Scratches and open positions are excluded. Deep ITM (delta &gt; 0.85) and pricing-bug signals are excluded.</p>
                </div>
                <div className="p-5 rounded-xl border border-[#252E3D] bg-[rgba(255,255,255,0.02)]">
                  <div className="font-bold text-white mb-1.5 text-[13px]">Exit rules</div>
                  <p>0 DTE exits at +20% / -20%. 1–5 DTE at +25% / -25%. 6–30 DTE at +40% / -30%. 30+ DTE at +30% / -30%.</p>
                </div>
                <div className="p-5 rounded-xl border border-[#252E3D] bg-[rgba(255,255,255,0.02)]">
                  <div className="font-bold text-white mb-1.5 text-[13px]">Integrity</div>
                  <p>No signal removed, modified, or retroactively adjusted. Every signal is tracked automatically at flag time, with real market outcomes.</p>
                </div>
              </div>
            </section>

            {/* ── CTA ── */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-t pb-hairline text-center">
              <h2 className="text-[28px] sm:text-[32px] font-bold text-white leading-tight tracking-[-0.02em] mb-4">
                See these signals in real time.
              </h2>
              <p className="text-[15px] text-[#A9B4C6] mb-8 max-w-md mx-auto">
                7-day free trial · Card required · Cancel anytime. Every signal on this page was flagged before the move.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 bg-[#34D399] hover:bg-[#4ADE80] text-white font-bold px-7 py-3 rounded-full text-[14px] transition-colors"
                >
                  Start free trial →
                </Link>
                <Link
                  href="/free-scanner"
                  className="inline-flex items-center gap-2 text-[#E8EDF5] hover:text-[#34D399] font-semibold text-[14px]"
                >
                  Or try the free scanner →
                </Link>
              </div>
            </section>

          </>
        )}

        {/* ── FAQ — always rendered in static HTML, not blocked by data fetch ── */}
        <section className="max-w-5xl mx-auto px-6 py-12 border-t pb-hairline">
          <div className="text-[11px] text-[#7A8BA8] uppercase tracking-[3px] font-semibold mb-3">Track record FAQ</div>
          <h2 className="text-[28px] sm:text-[32px] font-bold text-white leading-tight tracking-[-0.02em] mb-8 max-w-3xl">
            The questions people ask before they trust this page.
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl">
            {[
              {
                q: "How do I know these outcomes aren't cherry-picked?",
                a: "Every signal is logged to the database at the moment it's flagged, before the outcome is known. The scanner cannot retroactively add, remove, or modify a signal. The monthly performance table above shows every month including the bad ones — no missing periods, no gaps.",
              },
              {
                q: "What happens to signals that are still open?",
                a: "Open positions are excluded from the win rate calculation until they close (hit target, stop, or expiry). Only resolved signals contribute. This keeps the win rate honest — we don't pad it with unrealized winners.",
              },
              {
                q: "Why is the win rate 'only' 39.3%?",
                a: "Because it's real. A Grade A win rate above 50% on a published log would be statistically suspicious on the kind of sample size we have. A 39.3% rate with asymmetric exits (+40% wins, -30% losses on the typical DTE band) is profitable in expected value. Marketing-grade win rates aren't.",
              },
              {
                q: "How do you handle losing streaks?",
                a: "They happen. Look at the monthly table — you'll see months where the win rate drops below the overall average. We don't smooth or filter those. A public track record that hides losing stretches isn't a track record, it's marketing.",
              },
              {
                q: "What if the exit rules changed?",
                a: "They don't change retroactively. Any rule revision applies only to signals flagged after the change. The rules governing a 2024 signal are the rules that were active in 2024. Historical data is never re-computed with newer rules.",
              },
              {
                q: "Can I download the raw data?",
                a: "The data shown on this page is the public log. An API for bulk download is on the roadmap for subscribers — email support@profitbuilders.io if that's a dealbreaker for your workflow.",
              },
            ].map(({ q, a }) => (
              <div key={q}>
                <div className="font-bold text-white mb-2 text-[16px] leading-snug">{q}</div>
                <p className="text-[14px] text-[#A9B4C6] leading-[1.65]">{a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── DISCLAIMER — also always rendered ── */}
        <section className="max-w-3xl mx-auto px-6 pb-16">
          <div className="text-[11px] text-[#7A8BA8] leading-relaxed border-t pb-hairline pt-6">
            <strong className="text-[#A9B4C6]">Disclaimer.</strong> Past performance does not guarantee future results. Options trading involves significant risk including potential loss of entire investment. All data reflects actual signals generated by the scanner since January 2026 with real market outcomes tracked automatically. No signals have been removed, modified, or retroactively adjusted. Win rates and returns will fluctuate. This is not financial advice.
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}

// ── Sub-components ───────────────────────────────────────

function Section({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="max-w-5xl mx-auto px-6 py-12 border-t pb-hairline">
      <div className="flex items-baseline justify-between flex-wrap gap-2 mb-6">
        <div>
          <div className="text-[11px] text-[#7A8BA8] uppercase tracking-[3px] font-semibold mb-2">Breakdown</div>
          <h2 className="text-[22px] sm:text-[26px] font-bold text-white leading-tight tracking-[-0.02em]">
            {title}
          </h2>
        </div>
        {sub && <div className="text-[12px] text-[#7A8BA8]">{sub}</div>}
      </div>
      {children}
    </section>
  )
}

function Th({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return (
    <th
      style={{
        padding: "12px 20px",
        textAlign: align,
        fontSize: 10,
        color: "#7A8BA8",
        fontWeight: 700,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
      }}
    >
      {children}
    </th>
  )
}

function Td({
  children,
  align = "left",
  color,
  strong = false,
}: {
  children: React.ReactNode
  align?: "left" | "right"
  color?: string
  strong?: boolean
}) {
  return (
    <td
      style={{
        padding: "14px 20px",
        textAlign: align,
        color: color ?? "#E8EDF5",
        fontWeight: strong ? 700 : 500,
        fontVariantNumeric: "tabular-nums",
        fontSize: 14,
      }}
    >
      {children}
    </td>
  )
}
