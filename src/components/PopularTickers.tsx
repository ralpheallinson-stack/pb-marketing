import fs from "node:fs"
import path from "node:path"
import Link from "next/link"

/**
 * PopularTickers — SEO internal-linking component.
 *
 * Reads ticker-pages.json at build time and renders the top N tickers as
 * descriptive-anchor Links to /options-flow/[TICKER]. The anchor text is
 * keyword-rich ("NVDA options flow", "TSLA institutional activity") not
 * just the cashtag, to give Google strong semantic signal about the target.
 *
 * Drop this on homepage, /methodology, /vs pages — anywhere you want to
 * distribute PageRank to the programmatic ticker pages.
 */

type TickerData = {
  symbol: string
  sector: string | null
  total_signals: number
  grade_a_count: number
  total_premium_fmt: string
  total_premium_raw: number
  call_pct: number
  put_pct: number
  market_cap?: string
}

type Dataset = {
  generated_date: string
  total_tickers: number
  tickers: Record<string, TickerData>
}

function loadTickers(): TickerData[] {
  try {
    const p = path.join(process.cwd(), "data", "ticker-pages.json")
    const d = JSON.parse(fs.readFileSync(p, "utf-8")) as Dataset
    return Object.values(d.tickers).sort(
      (a, b) => b.total_premium_raw - a.total_premium_raw,
    )
  } catch {
    return []
  }
}

type Variant = "dark" | "light"
type Lean = "call-heavy" | "put-heavy" | "mixed"

function leanFor(call_pct: number): Lean {
  if (call_pct >= 60) return "call-heavy"
  if (call_pct <= 40) return "put-heavy"
  return "mixed"
}

export default function PopularTickers({
  limit = 12,
  title = "Popular tickers by institutional flow",
  subtitle = "Drill into per-ticker flow leaderboards, call/put lean, and historical flow by symbol. Click any ticker for the full page.",
  variant = "dark",
}: {
  limit?: number
  title?: string
  subtitle?: string
  variant?: Variant
}) {
  const tickers = loadTickers().slice(0, limit)
  if (tickers.length === 0) return null

  const dark = variant === "dark"
  const t = dark
    ? {
        bg: "#0E1117",
        sectionBorder: "rgba(255,255,255,0.06)",
        rowBorder: "rgba(255,255,255,0.08)",
        rowHover: "rgba(52,211,153,0.04)",
        eyebrow: "#7A8BA8",
        heading: "#FFFFFF",
        sub: "#A9B4C6",
        rank: "#3D4D63",
        ticker: "#FFFFFF",
        anchor: "#A9B4C6",
        anchorHover: "#FFFFFF",
        premium: "#FFFFFF",
        dollarAccent: "#34D399",
        caption: "#7A8BA8",
        chipBg: "rgba(255,255,255,0.04)",
        chipBorder: "rgba(255,255,255,0.10)",
        chipText: "#A9B4C6",
        accent: "#34D399",
        callDot: "#34D399",
        callBg: "rgba(52,211,153,0.10)",
        callText: "#34D399",
        putDot: "#F59E0B",
        putBg: "rgba(245,158,11,0.10)",
        putText: "#F59E0B",
        mixedDot: "#7A8BA8",
        mixedBg: "rgba(122,139,168,0.08)",
        mixedText: "#A9B4C6",
      }
    : {
        bg: "#FAFAF9",
        sectionBorder: "#E5E7EB",
        rowBorder: "rgba(17,24,39,0.08)",
        rowHover: "rgba(16,185,129,0.04)",
        eyebrow: "#6B7280",
        heading: "#0A0A0A",
        sub: "#4B5563",
        rank: "#9CA3AF",
        ticker: "#0A0A0A",
        anchor: "#374151",
        anchorHover: "#F97316",
        premium: "#0A0A0A",
        dollarAccent: "#10B981",
        caption: "#6B7280",
        chipBg: "#FFFFFF",
        chipBorder: "rgba(17,24,39,0.10)",
        chipText: "#374151",
        accent: "#10B981",
        callDot: "#10B981",
        callBg: "rgba(16,185,129,0.08)",
        callText: "#047857",
        putDot: "#D97706",
        putBg: "rgba(217,119,6,0.08)",
        putText: "#B45309",
        mixedDot: "#9CA3AF",
        mixedBg: "rgba(156,163,175,0.10)",
        mixedText: "#4B5563",
      }

  // Pre-compute the longest ticker symbol for alignment width — keeps the
  // anchor text column from jittering between rows (e.g. NVDA vs MSTR).
  return (
    <section
      className="w-full py-20 px-6 border-t"
      style={{ background: t.bg, borderColor: t.sectionBorder }}
    >
      <style>{`
        .pt-row { transition: background 180ms ease; }
        .pt-row:hover { background: ${t.rowHover}; }
        .pt-row .pt-arrow { transition: transform 220ms cubic-bezier(0.16,1,0.3,1), opacity 180ms ease; opacity: 0; }
        .pt-row:hover .pt-arrow { opacity: 1; transform: translateX(4px); }
        .pt-row:hover .pt-anchor { color: ${t.anchorHover}; }
      `}</style>

      <div className="max-w-5xl mx-auto">
        {/* Header block */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div
              className="text-[10px] font-mono uppercase tracking-[0.24em] mb-3"
              style={{ color: t.eyebrow }}
            >
              Per-ticker flow
            </div>
            <h2
              className="text-[30px] sm:text-[36px] font-bold leading-[1.1] tracking-[-0.02em] max-w-2xl"
              style={{ color: t.heading }}
            >
              {title}
            </h2>
          </div>
          <Link
            href="/options-flow"
            className="text-[12px] font-mono uppercase tracking-[0.18em] hover:underline whitespace-nowrap inline-flex items-center gap-1.5 self-start sm:self-end"
            style={{ color: t.accent }}
          >
            All 111 tickers
            <span aria-hidden>→</span>
          </Link>
        </div>
        <p
          className="text-[15px] leading-[1.65] max-w-2xl mb-10"
          style={{ color: t.sub }}
        >
          {subtitle}
        </p>

        {/* Ticker rows */}
        <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8">
          {tickers.map((ticker, i) => {
            const lean = leanFor(ticker.call_pct)
            const leanStyle =
              lean === "call-heavy" ? { dot: t.callDot, bg: t.callBg, text: t.callText, label: "Call" }
              : lean === "put-heavy" ? { dot: t.putDot, bg: t.putBg, text: t.putText, label: "Put" }
              : { dot: t.mixedDot, bg: t.mixedBg, text: t.mixedText, label: "Mixed" }
            const rank = String(i + 1).padStart(2, "0")
            const anchorText = `${ticker.symbol} options flow`
            // The premium string is pre-formatted upstream ("$17.74B").
            // Split off the $ so we can accent it in emerald.
            const premStr = ticker.total_premium_fmt
            const dollar = premStr.startsWith("$") ? "$" : ""
            const amount = dollar ? premStr.slice(1) : premStr

            return (
              <li
                key={ticker.symbol}
                className="pt-row border-b"
                style={{ borderColor: t.rowBorder }}
              >
                <Link
                  href={`/options-flow/${ticker.symbol}`}
                  className="group flex items-center gap-4 py-4 px-2 -mx-2"
                >
                  {/* Rank */}
                  <span
                    className="font-mono text-[11px] tracking-[0.08em] tabular-nums w-6 flex-shrink-0"
                    style={{ color: t.rank }}
                  >
                    {rank}
                  </span>

                  {/* Ticker + anchor text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span
                        className="font-mono text-[14px] font-bold tracking-[-0.01em]"
                        style={{ color: t.ticker }}
                      >
                        {ticker.symbol}
                      </span>
                      <span
                        className="pt-anchor text-[13px] truncate transition-colors"
                        style={{ color: t.anchor }}
                      >
                        {anchorText}
                      </span>
                    </div>
                    {/* Chip row */}
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className="inline-flex items-center gap-1.5 px-2 py-[3px] rounded-full font-mono text-[9px] uppercase tracking-[0.14em] font-semibold"
                        style={{ background: leanStyle.bg, color: leanStyle.text }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: leanStyle.dot }}
                        />
                        {leanStyle.label}
                      </span>
                      {ticker.sector && (
                        <span
                          className="inline-flex items-center px-2 py-[3px] rounded-full font-mono text-[9px] uppercase tracking-[0.14em] font-medium border"
                          style={{
                            background: t.chipBg,
                            borderColor: t.chipBorder,
                            color: t.chipText,
                          }}
                        >
                          {ticker.sector}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Premium (hero number, right-aligned) */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="text-right">
                      <div
                        className="font-mono text-[15px] font-semibold tabular-nums leading-none"
                        style={{ color: t.premium }}
                      >
                        <span style={{ color: t.dollarAccent }}>{dollar}</span>
                        {amount}
                      </div>
                      <div
                        className="font-mono text-[9px] uppercase tracking-[0.18em] mt-1"
                        style={{ color: t.caption }}
                      >
                        Tracked
                      </div>
                    </div>
                    <span
                      className="pt-arrow font-mono text-[14px]"
                      style={{ color: t.accent }}
                      aria-hidden
                    >
                      →
                    </span>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
