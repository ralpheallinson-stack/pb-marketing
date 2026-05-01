"use client"

import { useState } from "react"
import tickerPhotos from "@/lib/ticker-photos.json"

interface BlogPostHeroProps {
  primaryTicker: string | null
  totalTickers: number
  fallbackImage: string
  showCard: boolean
}

// Hero image hierarchy:
//   1. Curated Unsplash stock photo (top ~47 tickers, instant, no API)
//   2. Polygon company-branding logo via /api/blog/ticker-image
//   3. Post's pre-rendered OG card
//
// (1) is the highest-fidelity option — Cheddar Flow uses Getty stock
// photos for the same effect; ours are CC0-licensed Unsplash photos
// curated per ticker. (2) is the auto-coverage fallback for tickers
// we haven't curated. (3) catches the no-ticker case (vs pages, generic
// guides, etc.).
//
// Client component: the onError fallback handler can only run in the
// browser. Server-component implementations failed prerender across
// every blog post.
export default function BlogPostHero({ primaryTicker, totalTickers, fallbackImage, showCard }: BlogPostHeroProps) {
  // tier: 0 = curated photo, 1 = polygon logo, 2 = OG card fallback
  const photoMap = tickerPhotos as Record<string, string>
  const curated = primaryTicker && photoMap[primaryTicker] ? photoMap[primaryTicker] : null
  const initialTier = curated ? 0 : (primaryTicker ? 1 : 2)
  const [tier, setTier] = useState(initialTier)

  if (!showCard) return null

  // Tier 2: OG card only (no ticker)
  if (tier === 2 || !primaryTicker) {
    return (
      <div className="mb-10 -mx-6 md:mx-0 md:rounded-xl overflow-hidden border-y md:border md:border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={fallbackImage}
          alt=""
          className="w-full aspect-[1.91/1] object-cover bg-gray-50"
          loading="eager"
        />
      </div>
    )
  }

  // Tier 0: curated stock photo (real editorial image, full-bleed cover)
  if (tier === 0 && curated) {
    return (
      <div className="mb-10 -mx-6 md:mx-0 md:rounded-xl overflow-hidden border-y md:border md:border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="relative aspect-[1.91/1] bg-gray-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={curated}
            alt={`${primaryTicker} editorial photo`}
            className="absolute inset-0 w-full h-full object-cover"
            loading="eager"
            onError={() => setTier(1)}
          />
          {/* Ticker badge — small frosted pill in the corner so the photo
              still reads as branded without competing with the imagery. */}
          <div className="absolute top-4 left-4 px-2.5 py-1 rounded-md bg-white/90 backdrop-blur border border-gray-200 shadow-sm">
            <span className="text-[10px] font-mono font-extrabold tracking-[0.1em] text-gray-700">
              {primaryTicker}
            </span>
          </div>
          {totalTickers > 1 && (
            <div className="absolute top-4 right-4 px-2.5 py-1 rounded-md bg-white/90 backdrop-blur border border-gray-200 shadow-sm">
              <span className="text-[10px] font-mono tracking-[0.05em] text-gray-500">
                + {totalTickers - 1} {totalTickers - 1 === 1 ? "ticker" : "tickers"}
              </span>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Tier 1: Polygon logo on gradient backdrop (auto-coverage)
  return (
    <div className="mb-10 -mx-6 md:mx-0 md:rounded-xl overflow-hidden border-y md:border md:border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="relative aspect-[1.91/1] flex items-center justify-center"
           style={{
             background: "linear-gradient(135deg, #FAFAFA 0%, #FFFFFF 50%, #F8F9FB 100%)",
           }}>
        <div className="absolute inset-0 opacity-[0.04]"
             style={{
               backgroundImage: "radial-gradient(circle, #94A3B8 1px, transparent 1px)",
               backgroundSize: "20px 20px",
             }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/blog/ticker-image?symbol=${primaryTicker}`}
          alt={`${primaryTicker} company logo`}
          className="relative max-w-[60%] max-h-[60%] object-contain"
          loading="eager"
          onError={() => setTier(2)}
        />
        <div className="absolute top-4 left-4 px-2.5 py-1 rounded-md bg-white/90 backdrop-blur border border-gray-200 shadow-sm">
          <span className="text-[10px] font-mono font-extrabold tracking-[0.1em] text-gray-700">
            {primaryTicker}
          </span>
        </div>
        {totalTickers > 1 && (
          <div className="absolute top-4 right-4 px-2.5 py-1 rounded-md bg-white/90 backdrop-blur border border-gray-200 shadow-sm">
            <span className="text-[10px] font-mono tracking-[0.05em] text-gray-500">
              + {totalTickers - 1} {totalTickers - 1 === 1 ? "ticker" : "tickers"}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
