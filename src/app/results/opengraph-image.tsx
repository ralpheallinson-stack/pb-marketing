import { ImageResponse } from "next/og"
import fs from "fs"
import path from "path"

export const alt = "Profit Builders Data Methodology"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export const dynamic = "force-static"

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

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #1E2030 0%, #0F1119 100%)",
          color: "#FFFFFF",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* Header — logo + brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {LOGO_DATA_URL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={LOGO_DATA_URL}
              alt="PB"
              width={36}
              height={36}
              style={{ display: "block" }}
            />
          ) : (
            <div
              style={{
                width: 36,
                height: 36,
                background: "#F97316",
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#000",
                fontWeight: 800,
                fontFamily: "system-ui, -apple-system, sans-serif",
                fontSize: 18,
              }}
            >
              PB
            </div>
          )}
          <span
            style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontSize: 14,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "rgba(249, 115, 22, 0.9)",
              fontWeight: 600,
            }}
          >
            Profit Builders
          </span>
        </div>

        {/* Body — kicker + headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontSize: 14,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(148, 163, 184, 0.7)",
              fontWeight: 600,
            }}
          >
            Data Methodology
          </div>
          <div
            style={{
              fontSize: 76,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.025em",
              color: "#F4F6FB",
              maxWidth: 1000,
            }}
          >
            How we process the OPRA tape.
          </div>
          <div
            style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontSize: 22,
              lineHeight: 1.5,
              color: "rgba(199, 206, 221, 0.85)",
              fontWeight: 400,
              maxWidth: 1000,
              marginTop: 4,
            }}
          >
            CBOE Rule 6.11 sweep detection · OPRA condition codes · Black-Scholes-Merton Greeks · NBBO aggression classification
          </div>
        </div>

        {/* Footer — methodology stats */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 24,
            borderTop: "1px solid rgba(148, 163, 184, 0.18)",
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontSize: 17,
            color: "rgba(148, 163, 184, 0.85)",
            fontWeight: 500,
            letterSpacing: "0.01em",
          }}
        >
          <span>profitbuilders.io/results</span>
          <span style={{ color: "rgba(34, 197, 94, 0.85)" }}>
            Live OPRA tape · 220 symbols
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
