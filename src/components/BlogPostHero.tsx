"use client"

import { useState } from "react"

interface BlogPostHeroProps {
  primaryTicker: string | null
  totalTickers: number
  fallbackImage: string
  showCard: boolean
}

// Hero image for blog post pages. Renders the company branding logo via
// /api/blog/ticker-image when a primary ticker is detected, falls back to
// the post's pre-rendered OG card on image-load error (e.g., Polygon has
// no branding asset for this ticker). Client component because the
// `onError` fallback handler can only run in the browser — the previous
// server-component implementation broke prerender on every post.
export default function BlogPostHero({ primaryTicker, totalTickers, fallbackImage, showCard }: BlogPostHeroProps) {
  const [errored, setErrored] = useState(false)

  if (!showCard) return null

  if (!primaryTicker) {
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

  return (
    <div className="mb-10 -mx-6 md:mx-0 md:rounded-xl overflow-hidden border-y md:border md:border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="relative aspect-[1.91/1] flex items-center justify-center"
           style={{
             background: errored
               ? "transparent"
               : "linear-gradient(135deg, #FAFAFA 0%, #FFFFFF 50%, #F8F9FB 100%)",
           }}>
        {!errored && (
          <div className="absolute inset-0 opacity-[0.04]"
               style={{
                 backgroundImage: "radial-gradient(circle, #94A3B8 1px, transparent 1px)",
                 backgroundSize: "20px 20px",
               }} />
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={errored ? fallbackImage : `/api/blog/ticker-image?symbol=${primaryTicker}`}
          alt={errored ? "" : `${primaryTicker} company logo`}
          className={errored
            ? "w-full h-full object-cover absolute inset-0 bg-gray-50"
            : "relative max-w-[60%] max-h-[60%] object-contain"}
          loading="eager"
          onError={() => { if (!errored) setErrored(true) }}
        />
        {!errored && (
          <>
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
          </>
        )}
      </div>
    </div>
  )
}
