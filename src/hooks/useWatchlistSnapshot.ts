import { useEffect, useState } from "react"

export interface SnapshotEntry {
  iv_rank: number | null
  iv_rank_asof: string | null   // 'YYYY-MM-DD'
  market_cap: number | null
  sparkline: number[]           // 0 or 10 points
  flow_contracts_today: number | null  // null for users without flow_access (e.g. heatmap)
}

/**
 * Fetches GET /api/watchlist/snapshot (shipped in 4fcb0cd) for the given symbols.
 * - Debounces 200ms on symbol change (handles pasted lists).
 * - Refreshes every 60s (server caches: mcap 24h, iv_rank 1h, sparkline 5m).
 * - Skips the call entirely when symbols is empty.
 * - On error, keeps the last successful data and sets `error`.
 */
export function useWatchlistSnapshot(symbols: string[]): {
  data: Record<string, SnapshotEntry> | null
  loading: boolean
  error: string | null
} {
  const [data, setData] = useState<Record<string, SnapshotEntry> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const key = symbols.join(",")  // stable dependency derived from the array

  useEffect(() => {
    if (!key) {
      setData(null)
      setLoading(false)
      setError(null)
      return
    }
    let cancelled = false
    let intervalId: ReturnType<typeof setInterval> | null = null

    const fetchSnapshot = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/watchlist/snapshot?symbols=${encodeURIComponent(key)}`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = (await res.json()) as Record<string, SnapshotEntry>
        if (!cancelled) {
          setData(json)
          setError(null)
        }
      } catch (e) {
        // keep last successful data; surface the error
        if (!cancelled) setError(e instanceof Error ? e.message : "snapshot fetch failed")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    // debounce 200ms in case the symbol set is changing rapidly (paste)
    const debounce = setTimeout(() => {
      fetchSnapshot()
      intervalId = setInterval(fetchSnapshot, 60000)
    }, 200)

    return () => {
      cancelled = true
      clearTimeout(debounce)
      if (intervalId) clearInterval(intervalId)
    }
  }, [key])

  return { data, loading, error }
}
