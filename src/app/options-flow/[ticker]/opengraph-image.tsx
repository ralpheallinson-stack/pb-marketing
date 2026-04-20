import { ImageResponse } from "next/og"
import fs from "fs"
import path from "path"

export const alt = "Options Flow"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

// Load the PB monogram once per build and embed as base64 so every
// per-ticker OG card carries the real brand logo.
function loadLogoDataUrl(): string {
  try {
    const logoPath = path.join(process.cwd(), "public", "images", "pb-monogram.png")
    const buf = fs.readFileSync(logoPath)
    return `data:image/png;base64,${buf.toString("base64")}`
  } catch {
    return ""
  }
}
const LOGO_DATA_URL = loadLogoDataUrl()

type TickerData = {
  symbol: string
  sector: string
  total_signals: number
  grade_a_count: number
  total_premium_fmt: string
  call_pct: number
  put_pct: number
}

function loadTicker(ticker: string): TickerData | null {
  const p = path.join(process.cwd(), "data", "ticker-pages.json")
  const raw = fs.readFileSync(p, "utf-8")
  const dataset = JSON.parse(raw) as { tickers: Record<string, TickerData> }
  return dataset.tickers[ticker.toUpperCase()] ?? null
}

export function generateStaticParams() {
  const p = path.join(process.cwd(), "data", "ticker-pages.json")
  const raw = fs.readFileSync(p, "utf-8")
  const dataset = JSON.parse(raw) as { tickers: Record<string, unknown> }
  return Object.keys(dataset.tickers).map(ticker => ({ ticker }))
}

export default async function Image({
  params,
}: { params: Promise<{ ticker: string }> }) {
  const { ticker } = await params
  const t = loadTicker(ticker)
  const symbol = t?.symbol ?? ticker.toUpperCase()
  const signals = t?.total_signals ?? 0
  const premium = t?.total_premium_fmt ?? "—"
  const callPct = t?.call_pct ?? 50
  const sector = t?.sector ?? ""

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: 72,
          background: "linear-gradient(135deg, #0A0A0A 0%, #1A0F07 60%, #2B1505 100%)",
          color: "#FFFFFF",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* Top: brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {LOGO_DATA_URL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={LOGO_DATA_URL}
              alt="PB"
              width={56}
              height={56}
              style={{
                objectFit: "contain",
                filter: "invert(1)",
              }}
            />
          ) : (
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 8,
                background: "#F97316",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 26,
                fontWeight: 900,
                color: "#0A0A0A",
                fontFamily: "system-ui",
              }}
            >
              PB
            </div>
          )}
          <div style={{ display: "flex", fontSize: 24, fontWeight: 600, fontFamily: "system-ui", letterSpacing: "-0.01em" }}>
            Profit Builders
          </div>
          <div style={{ display: "flex", marginLeft: "auto", fontSize: 14, color: "#F97316", fontFamily: "system-ui", letterSpacing: 3, textTransform: "uppercase" }}>
            {sector || "Options Flow"}
          </div>
        </div>

        {/* Middle: giant ticker */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", marginTop: 40 }}>
          <div style={{ display: "flex", fontSize: 28, color: "#A1A1AA", marginBottom: 8, fontFamily: "system-ui" }}>
            Options Flow —
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 200,
              fontWeight: 700,
              color: "#FFFFFF",
              letterSpacing: "-0.04em",
              lineHeight: 0.95,
              marginBottom: 20,
            }}
          >
            {symbol}
          </div>
          <div style={{ display: "flex", fontSize: 26, color: "#A1A1AA", maxWidth: 900, lineHeight: 1.4, fontFamily: "system-ui" }}>
            <span>{signals.toLocaleString()} institutional signals tracked · {premium} total premium · {callPct}% call lean</span>
          </div>
        </div>

        {/* Bottom: URL + stats */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            paddingTop: 20,
            fontFamily: "system-ui",
          }}
        >
          <div style={{ display: "flex", fontSize: 18, color: "#F97316", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase" }}>
            <span>profitbuilders.io/options-flow/{symbol}</span>
          </div>
          <div style={{ display: "flex", fontSize: 16, color: "#71717A", letterSpacing: "0.06em" }}>
            <span>174,000+ signals tracked · 39.3% Grade A WR</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
