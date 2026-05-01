"use client"

import { useEffect, useState } from "react"

interface NewsItem {
  ticker: string
  headline: string
  summary: string
  source: string
  url: string
  ts: number
}

// Live market-news widget for the blog index. Pulls from /api/blog/news
// (Alpaca/Benzinga, cached 30 min on the server). Renders a stacked card
// list with ticker badge + relative timestamp. Cheddar Flow's blog has no
// equivalent — they don't have the news pipeline; we wired Alpaca two days
// ago, which makes this widget cheap for us and structurally hard for them.
function relativeTime(unix: number): string {
  if (!unix) return ""
  const diff = Math.floor(Date.now() / 1000) - unix
  if (diff < 3600) return `${Math.max(1, Math.floor(diff / 60))}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function MarketNewsWidget() {
  const [items, setItems] = useState<NewsItem[] | null>(null)
  const [tickers, setTickers] = useState<string[]>([])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const r = await fetch("/api/blog/news")
        if (!r.ok) return
        const j = await r.json()
        if (cancelled) return
        setItems(j.items || [])
        setTickers(j.tickers || [])
      } catch { /* unavailable */ }
    }
    load()
    // Refresh every 5 min while the page is open. The server cache is 30 min
    // so most refreshes are cheap, and users keeping the blog tab open get
    // freshness without hammering the API.
    const id = setInterval(load, 300_000)
    return () => { cancelled = true; clearInterval(id) }
  }, [])

  if (items === null) {
    return (
      <div className="rounded-xl border border-[#1E2A3A] bg-[#0F1520] p-5 animate-pulse">
        <div className="h-4 w-32 bg-[#1E2A3A] rounded mb-3" />
        <div className="space-y-3">
          {[0, 1, 2].map(i => <div key={i} className="h-12 bg-[#161B24] rounded" />)}
        </div>
      </div>
    )
  }

  if (items.length === 0) return null

  return (
    <div className="rounded-xl border border-[#1E2A3A] bg-[#0F1520] overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3 border-b border-[#1E2A3A]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#22C55E]">Live</span>
        <span className="text-[12px] font-semibold text-white ml-2">Market news affecting flow</span>
      </div>
      {tickers.length > 0 && (
        <div className="flex items-center gap-1.5 px-5 py-2 border-b border-[#1E2A3A] overflow-x-auto">
          <span className="text-[9px] uppercase tracking-[0.14em] text-[#4A5A72] whitespace-nowrap mr-1">Top flow:</span>
          {tickers.slice(0, 6).map(t => (
            <span key={t} className="text-[10px] font-mono font-bold tracking-wider text-[#C4CDD9] bg-[#161B24] border border-[#1E2A3A] rounded px-1.5 py-0.5">
              {t}
            </span>
          ))}
        </div>
      )}
      <ul className="divide-y divide-[#1E2A3A]">
        {items.slice(0, 6).map(it => (
          <li key={it.url}>
            <a
              href={it.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-5 py-3 hover:bg-[#161B24] transition-colors group"
            >
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-extrabold tracking-[0.05em] bg-[#F5820A]/10 text-[#F5820A] border border-[#F5820A]/20">
                  {it.ticker || "MKT"}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[12px] font-semibold text-white leading-snug group-hover:text-[#F5820A] transition-colors line-clamp-2">
                    {it.headline}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-[#4A5A72]">
                    <span className="capitalize">{it.source}</span>
                    <span>·</span>
                    <span className="font-mono tabular-nums">{relativeTime(it.ts)}</span>
                  </div>
                </div>
              </div>
            </a>
          </li>
        ))}
      </ul>
      <div className="px-5 py-2.5 border-t border-[#1E2A3A] text-center">
        <span className="text-[10px] text-[#4A5A72]">
          Powered by Benzinga via Alpaca · refreshes every 5 min
        </span>
      </div>
    </div>
  )
}
