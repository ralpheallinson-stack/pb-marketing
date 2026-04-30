/**
 * Shared OG card renderer — Bloomberg-grade dark editorial design
 * used by /opengraph-image, /results/opengraph-image, /blog/opengraph-image,
 * /free-scanner/opengraph-image, and /blog/[slug]/opengraph-image.
 *
 * One source of truth for the v2 OG aesthetic — change once, every card updates.
 */
import { ImageResponse } from "next/og"
import fs from "fs"
import path from "path"

// ── Brand tokens (single source of truth) ──────────────────────────
export const OG_TOKENS = {
  BG_TOP:    "#0B0E16",
  BG_BOT:    "#070910",
  FG_BRIGHT: "#F4F6FB",
  FG_DIM:    "rgba(199, 206, 221, 0.78)",
  FG_MUTE:   "rgba(148, 163, 184, 0.55)",
  ACCENT:    "#F97316",                 // PB orange
  LIVE:      "#22C55E",                 // emerald
  GRID:      "rgba(148, 163, 184, 0.06)",
  RULE:      "rgba(148, 163, 184, 0.12)",
  FONT_DISPLAY: "Georgia, serif",
  FONT_UI:      "system-ui, -apple-system, 'Segoe UI', sans-serif",
  FONT_MONO:    "'SF Mono', 'Courier New', Menlo, monospace",
} as const

export const OG_SIZE = { width: 1200, height: 630 }

export function loadLogoDataUrl(): string {
  try {
    const p = path.join(process.cwd(), "public", "images", "pb-monogram.png")
    return `data:image/png;base64,${fs.readFileSync(p).toString("base64")}`
  } catch { return "" }
}

export type OgCardProps = {
  kicker: string
  headline: string
  subhead: string
  chips?: string[]              // OPRA-style monospace chips for footer center
  liveLabel?: string            // top-right pill text (default "Live OPRA Tape")
  liveColor?: "live" | "accent" // emerald (default) or orange
  ctaLeft?: string              // bottom-left text (default URL)
  ctaRight?: { value: string; label: string } | null
}

export function buildOgCard(props: OgCardProps) {
  const t = OG_TOKENS
  const LOGO = loadLogoDataUrl()
  const liveColor = props.liveColor === "accent" ? t.ACCENT : t.LIVE
  const liveBg = props.liveColor === "accent" ? "rgba(249, 115, 22, 0.10)" : "rgba(34, 197, 94, 0.10)"
  const liveBorder = props.liveColor === "accent" ? "rgba(249, 115, 22, 0.28)" : "rgba(34, 197, 94, 0.28)"

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: `linear-gradient(180deg, ${t.BG_TOP} 0%, ${t.BG_BOT} 100%)`,
        color: t.FG_BRIGHT,
        fontFamily: t.FONT_DISPLAY,
        position: "relative",
      }}
    >
      {/* Subtle grid texture (institutional terminal feel) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(${t.GRID} 1px, transparent 1px), linear-gradient(90deg, ${t.GRID} 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
          display: "flex",
        }}
      />

      {/* Diagonal accent glow (top-right) */}
      <div
        style={{
          position: "absolute",
          top: -200,
          right: -200,
          width: 600,
          height: 600,
          background: "radial-gradient(circle, rgba(249,115,22,0.10) 0%, transparent 60%)",
          display: "flex",
        }}
      />

      {/* Header: monogram + brand + LIVE indicator */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "56px 72px 0",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {LOGO ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={LOGO} alt="PB" width={36} height={36} style={{ display: "block" }} />
          ) : (
            <div style={{ width: 36, height: 36, background: t.ACCENT, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", color: "#000", fontWeight: 800, fontFamily: t.FONT_UI, fontSize: 18 }}>PB</div>
          )}
          <span style={{ fontFamily: t.FONT_UI, fontSize: 13, letterSpacing: "0.22em", textTransform: "uppercase", color: t.FG_BRIGHT, fontWeight: 700 }}>
            Profit Builders
          </span>
        </div>

        {props.liveLabel !== "" && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 12px",
              borderRadius: 999,
              background: liveBg,
              border: `1px solid ${liveBorder}`,
              fontFamily: t.FONT_MONO,
              fontSize: 11,
              letterSpacing: "0.18em",
              color: liveColor,
              fontWeight: 700,
              textTransform: "uppercase",
            }}
          >
            <div style={{ width: 7, height: 7, borderRadius: 999, background: liveColor, display: "flex" }} />
            <span>{props.liveLabel ?? "Live OPRA Tape"}</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "0 72px",
          position: "relative",
          flex: 1,
          justifyContent: "center",
        }}
      >
        <div style={{ width: 56, height: 3, background: t.ACCENT, marginBottom: 22, display: "flex" }} />

        <div
          style={{
            fontFamily: t.FONT_UI,
            fontSize: 13,
            letterSpacing: "0.26em",
            textTransform: "uppercase",
            color: t.ACCENT,
            fontWeight: 700,
            marginBottom: 18,
          }}
        >
          {props.kicker}
        </div>

        <div
          style={{
            fontSize: 88,
            fontWeight: 700,
            lineHeight: 0.98,
            letterSpacing: "-0.035em",
            color: t.FG_BRIGHT,
            maxWidth: 980,
            marginBottom: 24,
          }}
        >
          {props.headline}
        </div>

        <div
          style={{
            fontFamily: t.FONT_UI,
            fontSize: 20,
            lineHeight: 1.5,
            color: t.FG_DIM,
            fontWeight: 400,
            maxWidth: 980,
            letterSpacing: "0.005em",
          }}
        >
          {props.subhead}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 72px 48px",
          paddingTop: 28,
          borderTop: `1px solid ${t.RULE}`,
          margin: "0 72px",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            fontFamily: t.FONT_MONO,
            fontSize: 14,
            color: t.FG_MUTE,
            letterSpacing: "0.04em",
            fontWeight: 500,
          }}
        >
          {props.ctaLeft ?? "profitbuilders.io"}
        </div>

        {props.chips && props.chips.length > 0 && (
          <div style={{ display: "flex", gap: 10 }}>
            {props.chips.map((label) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  fontFamily: t.FONT_MONO,
                  fontSize: 11,
                  letterSpacing: "0.08em",
                  color: t.FG_DIM,
                  background: "rgba(148, 163, 184, 0.06)",
                  border: `1px solid ${t.RULE}`,
                  padding: "5px 10px",
                  borderRadius: 4,
                  fontWeight: 600,
                }}
              >
                {label}
              </div>
            ))}
          </div>
        )}

        {props.ctaRight && (
          <div
            style={{
              display: "flex",
              fontFamily: t.FONT_MONO,
              fontSize: 14,
              color: t.FG_DIM,
              letterSpacing: "0.04em",
              fontWeight: 500,
            }}
          >
            <span style={{ color: t.LIVE, marginRight: 6, fontWeight: 700 }}>{props.ctaRight.value}</span>
            {props.ctaRight.label}
          </div>
        )}
      </div>
    </div>
  )
}

export function renderOgCard(props: OgCardProps) {
  return new ImageResponse(buildOgCard(props), OG_SIZE)
}
