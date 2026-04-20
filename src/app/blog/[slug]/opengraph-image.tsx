import { ImageResponse } from "next/og"
import { getAllSlugs, getPost } from "@/lib/blog"
import fs from "fs"
import path from "path"

export const alt = "Profit Builders"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

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

export function generateStaticParams() {
  return getAllSlugs().map(slug => ({ slug }))
}

export default async function Image({
  params,
}: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPost(slug)
  const title = post?.title ?? "Profit Builders"
  const description = post?.description ?? "Institutional options flow scanner with conviction grading."

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
          background: "linear-gradient(135deg, #0A0A0A 0%, #1A0F07 60%, #2B1505 100%)",
          color: "#FFFFFF",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {LOGO_DATA_URL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={LOGO_DATA_URL}
              alt="PB"
              width={56}
              height={56}
              style={{ objectFit: "contain", filter: "invert(1)" }}
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
          <div
            style={{
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: "-0.01em",
              fontFamily: "system-ui",
            }}
          >
            Profit Builders
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: title.length > 70 ? 56 : title.length > 50 ? 64 : 72,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              color: "#FFFFFF",
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 26,
              lineHeight: 1.4,
              color: "#A1A1AA",
              maxWidth: 960,
              fontFamily: "system-ui",
            }}
          >
            {description.length > 180 ? description.slice(0, 177) + "..." : description}
          </div>
        </div>

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
          <div
            style={{
              fontSize: 18,
              color: "#F97316",
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            profitbuilders.io
          </div>
          <div
            style={{
              fontSize: 16,
              color: "#71717A",
              letterSpacing: "0.06em",
            }}
          >
            174,000+ signals tracked · 39.3% Grade A WR
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
