"use client"

import { useEffect, useState } from "react"
import * as Slider from "@radix-ui/react-slider"

interface ReplayProgressProps {
  symbol: string
}

interface SnapshotsMeta {
  symbol: string
  total_snapshots: number
  sessions_collected: number
  earliest: string | null
  latest: string | null
  ready: boolean
}

// Bottom replay scrubber — but locked until enough sessions have been
// captured. Shows a real progress indicator (X/3 sessions) instead of a
// "coming soon" placeholder, so users can see the feature filling in.
export default function ReplayProgress({ symbol }: ReplayProgressProps) {
  const [meta, setMeta] = useState<SnapshotsMeta | null>(null)

  useEffect(() => {
    let cancelled = false
    const fetchMeta = async () => {
      try {
        const r = await fetch(`/api/scanner/gex-snapshots/meta?symbol=${symbol}`)
        if (!r.ok) return
        const j = await r.json()
        if (!cancelled) setMeta(j)
      } catch { /* unavailable */ }
    }
    fetchMeta()
    const id = setInterval(fetchMeta, 60_000)
    return () => { cancelled = true; clearInterval(id) }
  }, [symbol])

  // Always render the slot so the layout is stable and users can see the
  // counter advance over the next few sessions. When meta returns ready=true
  // we'll swap to the active scrubber implementation in a follow-up.
  const sessions = meta?.sessions_collected ?? 0
  const target = 3
  const pct = Math.min(100, (sessions / target) * 100)
  const ready = meta?.ready ?? false

  return (
    <div className="flex items-center px-6 py-3 gap-4 border-t border-[#131B27] flex-shrink-0" style={{ background: "#080B12" }}>
      <div className="flex items-baseline gap-2 min-w-[140px]">
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#7A8BA8]">{symbol} Replay</span>
        {!ready && (
          <span className="text-[9px] text-[#5A6A82] font-mono tabular-nums">collecting · {sessions}/{target} sessions</span>
        )}
      </div>

      {ready ? (
        // Active scrubber (placeholder slot — wire to real snapshots in next iteration).
        <Slider.Root className="relative flex items-center select-none touch-none w-full h-5" defaultValue={[100]} max={100} step={1}>
          <Slider.Track className="bg-[#161B24] relative grow rounded-full h-1">
            <Slider.Range className="absolute bg-[#F5820A] rounded-full h-full" />
          </Slider.Track>
          <Slider.Thumb className="block w-3 h-3 bg-white rounded-full shadow-md cursor-grab active:cursor-grabbing" aria-label="Replay position" />
        </Slider.Root>
      ) : (
        <div className="relative flex-1 h-1 rounded-full bg-[#161B24] overflow-hidden">
          <div className="absolute top-0 left-0 h-full bg-[#F5820A]/70 transition-all duration-500"
               style={{ width: `${pct}%` }} />
        </div>
      )}

      <span className="text-[10px] font-mono tabular-nums text-[#5A6A82] whitespace-nowrap min-w-[80px] text-right">
        {ready ? "Live" : meta?.earliest ? `since ${new Date(meta.earliest).toLocaleDateString()}` : "ready Mon"}
      </span>
    </div>
  )
}
