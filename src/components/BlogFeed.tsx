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
  category: { label: string; color: string; bg: string; border: string }
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
// Light editorial palette to match the blog body.
function FallbackThumb({ ticker }: { ticker: string }) {
  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-gray-50">
      <div className="absolute inset-0 opacity-40"
           style={{
             backgroundImage: "radial-gradient(circle, #94A3B8 1px, transparent 1px)",
             backgroundSize: "16px 16px",
           }} />
      <div className="relative text-center">
        <div className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-1.5">
          Market News
        </div>
        <div className="px-3 py-1 rounded bg-[#F5820A] inline-block shadow-sm">
          <span className="text-[16px] font-extrabold tracking-[0.05em] text-white">
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
    const id = setInterval(load, 300_000)
    return () => { cancelled = true; clearInterval(id) }
  }, [])

  const merged: FeedItem[] = [...blogItems, ...news].sort((a, b) => b.ts - a.ts)

  return (
    <>
      {/* Section header — Latest with live indicator */}
      <div className="flex items-baseline justify-between mb-8 pb-4 border-b border-gray-200">
        <div className="flex items-baseline gap-3">
          <h2 className="text-[20px] font-bold text-gray-900 tracking-tight">Latest</h2>
          <span className="text-[12px] text-gray-400 font-mono tabular-nums">{merged.length} items</span>
        </div>
        {newsLoaded && (
          <span className="inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold tracking-[0.14em] text-emerald-600 uppercase">Live news</span>
          </span>
        )}
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {merged.map((item, i) => {
          if (item.kind === "blog") {
            return (
              <BlurFade key={`b-${item.slug}`} delay={Math.min(i * 0.03, 0.4)} className="flex">
                <Link
                  href={`/blog/${item.slug}`}
                  className="group flex flex-col flex-1 rounded-xl border border-gray-200 overflow-hidden bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:border-gray-300 hover:-translate-y-0.5 transition-all duration-300"
                >
                  {/* Thumbnail (uses pre-rendered OG card — its dark frame
                      sits well as a "screenshot" inside a light-card body) */}
                  <div className="relative aspect-[1.91/1] overflow-hidden bg-gray-50">
                    <img
                      src={item.image}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                      <span
                        className="text-[9px] font-extrabold tracking-[0.14em] uppercase px-2 py-0.5 rounded border"
                        style={{
                          color: item.category.color,
                          background: item.category.bg,
                          borderColor: item.category.border,
                        }}
                      >
                        {item.category.label}
                      </span>
                      <span className="text-[10px] text-gray-400">{item.date}</span>
                      <span className="text-[10px] text-gray-300">·</span>
                      <span className="text-[10px] text-gray-400">{item.readTime}m</span>
                    </div>
                    <h3 className="text-[16px] font-bold text-gray-900 mb-2 leading-snug group-hover:text-[#F5820A] transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-[13.5px] text-gray-500 leading-relaxed line-clamp-3 mb-3">
                      {item.description}
                    </p>
                    <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#F5820A] mt-auto group-hover:gap-2 transition-all">
                      Read article{" "}
                      <span className="transition-transform group-hover:translate-x-0.5">→</span>
                    </span>
                  </div>
                </Link>
              </BlurFade>
            )
          }

          // News card — same shape, blue accents, live-news ribbon overlay
          return (
            <BlurFade key={`n-${item.url}`} delay={Math.min(i * 0.03, 0.4)} className="flex">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col flex-1 rounded-xl border border-gray-200 overflow-hidden bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:border-blue-200 hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="relative aspect-[1.91/1] overflow-hidden bg-gray-50">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <FallbackThumb ticker={item.ticker} />
                  )}
                  {/* Live news ribbon — light pill on top of image */}
                  <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/95 backdrop-blur border border-gray-200 shadow-sm">
                    <span className="w-1 h-1 rounded-full bg-blue-600 animate-pulse" />
                    <span className="text-[8px] font-extrabold tracking-[0.14em] uppercase text-blue-700">Live News</span>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                    <span className="text-[9px] font-extrabold tracking-[0.14em] uppercase px-2 py-0.5 rounded border text-blue-700 bg-blue-50 border-blue-200">
                      News
                    </span>
                    <span className="text-[10px] font-mono font-bold tracking-wider text-gray-700">{item.ticker || "MKT"}</span>
                    <span className="text-[10px] text-gray-300">·</span>
                    <span className="text-[10px] text-gray-400 font-mono tabular-nums">{relativeDate(item.ts)}</span>
                  </div>
                  <h3 className="text-[16px] font-bold text-gray-900 mb-2 leading-snug group-hover:text-blue-700 transition-colors line-clamp-3">
                    {item.headline}
                  </h3>
                  {item.summary && (
                    <p className="text-[13.5px] text-gray-500 leading-relaxed line-clamp-2 mb-3">
                      {item.summary}
                    </p>
                  )}
                  <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-blue-700 mt-auto group-hover:gap-2 transition-all">
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
