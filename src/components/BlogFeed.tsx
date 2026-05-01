"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { BlurFade } from "@/components/magicui/BlurFade"

interface BlogItem {
  kind: "blog"
  slug: string
  title: string
  description: string
  date: string
  ts: number
  readTime: string
  category: { label: string; color: string }
  image: string
}

interface NewsItem {
  kind: "news"
  ticker: string
  headline: string
  summary: string
  source: string
  url: string
  ts: number
  image_url?: string
}

type FeedItem = BlogItem | NewsItem

function relativeDate(unix: number): string {
  if (!unix) return ""
  const diffMs = Date.now() - unix * 1000
  const diffH = diffMs / 3.6e6
  if (diffH < 1) return `${Math.max(1, Math.floor(diffMs / 60000))}m ago`
  if (diffH < 24) return `${Math.floor(diffH)}h ago`
  const days = Math.floor(diffH / 24)
  if (days < 7) return `${days}d ago`
  return new Date(unix * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

// Programmatic fallback thumbnail when a news item has no Benzinga image.
// Renders inline so it works on the static export without a server roundtrip.
function FallbackThumb({ ticker }: { ticker: string }) {
  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden"
         style={{ background: "linear-gradient(135deg, #161B24 0%, #0F1520 100%)" }}>
      <div className="absolute inset-0 opacity-30"
           style={{
             backgroundImage: "radial-gradient(circle, #F5820A 1px, transparent 1px)",
             backgroundSize: "16px 16px",
           }} />
      <div className="relative text-center">
        <div className="text-[10px] font-bold tracking-[0.2em] text-[#4A5A72] uppercase mb-1">
          Market News
        </div>
        <div className="px-3 py-1 rounded bg-[#F5820A] inline-block">
          <span className="text-[16px] font-extrabold tracking-[0.05em] text-[#0B0F14]">
            {ticker || "MKT"}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function BlogFeed({ blogItems }: { blogItems: BlogItem[] }) {
  const [news, setNews] = useState<NewsItem[]>([])
  const [newsLoaded, setNewsLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const r = await fetch("/api/blog/news")
        if (!r.ok) {
          if (!cancelled) setNewsLoaded(true)
          return
        }
        const j = await r.json()
        if (cancelled) return
        const items: NewsItem[] = (j.items || []).map((it: NewsItem) => ({ ...it, kind: "news" }))
        setNews(items)
        setNewsLoaded(true)
      } catch {
        if (!cancelled) setNewsLoaded(true)
      }
    }
    load()
    // Refresh every 5 min for live freshness on long-open tabs.
    const id = setInterval(load, 300_000)
    return () => { cancelled = true; clearInterval(id) }
  }, [])

  // Interleave blog posts + news, sorted by ts desc. Blog posts have date-only
  // precision so they cluster at midnight; news has minute precision and
  // floats to the top during active news cycles.
  const merged: FeedItem[] = [...blogItems, ...news].sort((a, b) => b.ts - a.ts)

  return (
    <>
      {/* Filter chips — pure visual indicator until we wire interactivity */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#4A5A72] whitespace-nowrap">
          Latest
        </span>
        <span className="text-[10px] text-[#2E3A4D]">·</span>
        <div className="flex items-center gap-1.5">
          {[
            { label: "All", count: merged.length },
            { label: "Recap", color: "#F5820A" },
            { label: "Guide", color: "#22C55E" },
            { label: "News", color: "#60A5FA" },
            { label: "Comparison", color: "#A855F7" },
          ].map((c, i) => (
            <span
              key={c.label}
              className={`text-[10px] font-bold uppercase tracking-[0.1em] px-2 py-1 rounded border whitespace-nowrap ${
                i === 0
                  ? "bg-white/[0.04] text-white border-white/[0.12]"
                  : "bg-transparent text-[#7A8BA8] border-[#1E2A3A]"
              }`}
            >
              {c.label}
              {c.count !== undefined && <span className="ml-1 text-[#4A5A72]">{c.count}</span>}
            </span>
          ))}
        </div>
        {newsLoaded && (
          <span className="ml-auto inline-flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-[#22C55E] animate-pulse" />
            <span className="text-[9px] font-bold tracking-[0.12em] text-[#22C55E] uppercase">Live news</span>
          </span>
        )}
      </div>

      {/* Card grid — 3 columns on desktop, 2 on tablet, 1 on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {merged.map((item, i) => {
          if (item.kind === "blog") {
            return (
              <BlurFade key={`b-${item.slug}`} delay={Math.min(i * 0.03, 0.4)} className="flex">
                <Link
                  href={`/blog/${item.slug}`}
                  className="group flex flex-col flex-1 rounded-xl border border-[#1E2A3A] overflow-hidden hover:border-[#2E3A4D] transition-all bg-[#0F1520]"
                >
                  {/* Thumbnail (uses pre-rendered OG card) */}
                  <div className="relative aspect-[1.91/1] overflow-hidden bg-[#080B12]">
                    <img
                      src={item.image}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  {/* Body */}
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="text-[9px] font-extrabold tracking-[0.14em] uppercase px-1.5 py-0.5 rounded"
                        style={{
                          color: item.category.color,
                          background: `${item.category.color}1A`,
                          border: `1px solid ${item.category.color}33`,
                        }}
                      >
                        {item.category.label}
                      </span>
                      <span className="text-[10px] text-[#4A5A72]">{item.date}</span>
                      <span className="text-[10px] text-[#4A5A72]">·</span>
                      <span className="text-[10px] text-[#4A5A72]">{item.readTime}m</span>
                    </div>
                    <h3 className="text-[15px] font-bold text-white mb-2 leading-snug group-hover:text-[#F5820A] transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-[13px] text-[#7A8BA8] leading-relaxed line-clamp-3 mb-3">
                      {item.description}
                    </p>
                    <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#F5820A] mt-auto group-hover:gap-2 transition-all">
                      Read{" "}
                      <span className="transition-transform group-hover:translate-x-0.5">→</span>
                    </span>
                  </div>
                </Link>
              </BlurFade>
            )
          }

          // News card
          return (
            <BlurFade key={`n-${item.url}`} delay={Math.min(i * 0.03, 0.4)} className="flex">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col flex-1 rounded-xl border border-[#1E2A3A] overflow-hidden hover:border-[#60A5FA]/30 transition-all bg-[#0F1520]"
              >
                {/* Thumbnail — Benzinga image when available, fallback otherwise */}
                <div className="relative aspect-[1.91/1] overflow-hidden bg-[#080B12]">
                  {item.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image_url}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                      loading="lazy"
                      onError={(e) => {
                        // Fall back to programmatic thumb on image-load error
                        (e.target as HTMLImageElement).style.display = "none"
                      }}
                    />
                  ) : (
                    <FallbackThumb ticker={item.ticker} />
                  )}
                  {/* Live news ribbon */}
                  <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#0B0F14]/85 backdrop-blur border border-[#60A5FA]/30">
                    <span className="w-1 h-1 rounded-full bg-[#60A5FA] animate-pulse" />
                    <span className="text-[8px] font-extrabold tracking-[0.14em] uppercase text-[#60A5FA]">Live News</span>
                  </div>
                </div>
                {/* Body */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[9px] font-extrabold tracking-[0.14em] uppercase px-1.5 py-0.5 rounded text-[#60A5FA] bg-[#60A5FA]/10 border border-[#60A5FA]/25">
                      News
                    </span>
                    <span className="text-[10px] font-mono font-bold tracking-wider text-[#C4CDD9]">{item.ticker || "MKT"}</span>
                    <span className="text-[10px] text-[#4A5A72]">·</span>
                    <span className="text-[10px] text-[#4A5A72] font-mono tabular-nums">{relativeDate(item.ts)}</span>
                  </div>
                  <h3 className="text-[15px] font-bold text-white mb-2 leading-snug group-hover:text-[#60A5FA] transition-colors line-clamp-3">
                    {item.headline}
                  </h3>
                  {item.summary && (
                    <p className="text-[13px] text-[#7A8BA8] leading-relaxed line-clamp-2 mb-3">
                      {item.summary}
                    </p>
                  )}
                  <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#60A5FA] mt-auto group-hover:gap-2 transition-all">
                    {item.source.charAt(0).toUpperCase() + item.source.slice(1)} →
                  </span>
                </div>
              </a>
            </BlurFade>
          )
        })}
      </div>
    </>
  )
}
