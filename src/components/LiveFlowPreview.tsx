'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { badgeClass } from '@/lib/badge-styles'

function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0)
  const started = useRef(false)
  useEffect(() => {
    if (!target || started.current) return
    started.current = true
    const start = Date.now()
    const tick = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(target * eased))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target, duration])
  return count
}

interface Trade {
  id: number
  time: string
  symbol: string
  sector: string
  opt_type: 'C' | 'P'
  strike_fmt: string
  expiration: string
  dte: number
  premium_fmt: string
  premium: number
  flow_type: string
  bullish: boolean
  grade: string
  position_action: string
  high_conviction: boolean
  whale: boolean
  badges: { label: string; tier: string }[]
}

interface ApiData {
  trades?: Trade[]
  stats?: { bull_premium?: number; bear_premium?: number; put_call_ratio?: number; total?: number }
  session?: { bull_pct?: number; sentiment?: string }
}

function fmt(n?: number) {
  if (!n) return '—'
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`
  return `$${n}`
}

const ROWS_VISIBLE = 7
const CYCLE_MS = 2200

export default function LiveFlowPreview() {
  const [pool, setPool]       = useState<Trade[]>([])
  const [visible, setVisible] = useState<Trade[]>([])
  const [flashId, setFlashId] = useState<number | null>(null)
  const [stats, setStats]     = useState<ApiData['stats']>()
  const [session, setSession] = useState<ApiData['session']>()
  const [loaded, setLoaded]   = useState(false)
  const poolIdx               = useRef(0)
  const timerRef              = useRef<ReturnType<typeof setInterval> | null>(null)

  const loadPool = useCallback(async () => {
    try {
      const res = await fetch('/api/free-scanner/live-flow?slim=true')
      if (!res.ok) throw new Error('failed')
      const data: ApiData = await res.json()
      let trades = Array.isArray(data.trades) ? data.trades : []

      // If today is empty (pre-market / after hours), fetch yesterday's data
      if (trades.length === 0) {
        const hist = await fetch('/api/free-scanner/live-flow?slim=true&range=yesterday')
        if (hist.ok) {
          const histData: ApiData = await hist.json()
          trades = Array.isArray(histData.trades) ? histData.trades : []
        }
      }

      if (trades.length > 0) {
        const shuffled = [...trades].sort(() => Math.random() - 0.5)
        setPool(shuffled)
        setVisible(shuffled.slice(0, ROWS_VISIBLE))
        poolIdx.current = ROWS_VISIBLE % shuffled.length
      }
      if (data.stats)   setStats(data.stats)
      if (data.session) setSession(data.session)
    } catch {
      // silent
    } finally {
      setLoaded(true)
    }
  }, [])

  useEffect(() => { loadPool() }, [loadPool])

  useEffect(() => {
    if (pool.length === 0) return
    timerRef.current = setInterval(() => {
      const next = pool[poolIdx.current % pool.length]
      poolIdx.current = (poolIdx.current + 1) % pool.length
      setFlashId(next.id)
      setTimeout(() => setFlashId(null), 600)
      setVisible(prev => [next, ...prev].slice(0, ROWS_VISIBLE))
    }, CYCLE_MS)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [pool])

  const bullPct   = session?.bull_pct ?? 54
  const sentiment = session?.sentiment ?? 'Mixed'
  const bullCount  = useCountUp(stats?.bull_premium ?? 0)
  const bearCount  = useCountUp(stats?.bear_premium ?? 0)
  const totalCount = useCountUp(stats?.total ?? 0)

  return (
    <div className="pb-scanner-wrap overflow-x-auto rounded-xl" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
    <div className="min-w-[640px]">
    <div
      className="relative w-full overflow-hidden rounded-xl border border-[#1E2A3A]"
      style={{ background: '#0E1117', fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
    >
      {/* Header */}
      <div className="flex items-center gap-5 border-b border-[#1E2A3A] px-4 py-2.5">
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-green-400">Live</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1 w-14 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${bullPct}%`, background: 'linear-gradient(90deg,#ef4444,#22c55e)' }}
            />
          </div>
          <span className="text-[11px] font-semibold text-white/60">{sentiment}</span>
        </div>
        <div className="flex items-center gap-4 ml-auto">
          <div>
            <div className="font-mono text-[8px] uppercase tracking-wider text-white/20">Call Flow</div>
            <div className="text-[11px] font-bold text-[#22c55e]">{fmt(bullCount)}</div>
          </div>
          <div>
            <div className="font-mono text-[8px] uppercase tracking-wider text-white/20">Put Flow</div>
            <div className="text-[11px] font-bold text-[#ef4444]">{fmt(bearCount)}</div>
          </div>
          <div>
            <div className="font-mono text-[8px] uppercase tracking-wider text-white/20">Signals</div>
            <div className="text-[11px] font-bold text-white/70">{totalCount ? totalCount.toLocaleString() : '—'}</div>
          </div>
        </div>
      </div>

      {/* Column headers */}
      <div
        className="grid border-b border-[#1E2A3A] bg-white/[0.01]"
        style={{ gridTemplateColumns: '80px 80px 44px 100px 72px 68px 1fr' }}
      >
        {['TIME','TICKER','C/P','STRIKE / EXP','PREMIUM','TYPE','CONDS'].map(h => (
          <div key={h} className="px-3 py-1.5 font-mono text-[8px] font-semibold uppercase tracking-[1.5px] text-[#3D4D63]">
            {h}
          </div>
        ))}
      </div>

      {/* Rows */}
      <div className="relative">
        {!loaded ? (
          <div className="flex items-center justify-center py-10">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/10 border-t-white/40" />
          </div>
        ) : (
          visible.map((t, i) => {
            const isCall  = t.opt_type === 'C'
            const isFlash = flashId === t.id
            const rowBg   = isFlash
              ? 'rgba(34,197,94,0.07)'
              : t.whale
              ? 'rgba(168,85,247,0.06)'
              : t.high_conviction
              ? 'rgba(249,115,22,0.05)'
              : 'transparent'

            return (
              <div
                key={`${t.id}-${i}`}
                className="grid border-b border-[#1E2A3A] transition-colors duration-300"
                style={{
                  gridTemplateColumns: '80px 80px 44px 100px 72px 68px 1fr',
                  background: rowBg,
                  animation: i === 0 ? 'pbSlideIn 0.35s ease' : undefined,
                }}
              >
                <div className="px-3 py-2.5 font-mono text-[10px] text-white/25 flex items-center">
                  {t.time?.replace(' PM','p')?.replace(' AM','a')}
                </div>
                <div className="px-3 py-2.5 flex flex-col justify-center">
                  <div className="text-[13px] font-bold leading-none" style={{ color: isCall ? '#22c55e' : '#ef4444' }}>
                    {t.symbol}
                  </div>
                  <div className="text-[9px] text-white/25 mt-0.5">{t.sector}</div>
                </div>
                <div className="px-3 py-2.5 flex items-center">
                  <span className="text-[11px] font-semibold" style={{ color: isCall ? '#22c55e' : '#ef4444' }}>
                    {isCall ? 'Call' : 'Put'}
                  </span>
                </div>
                <div className="px-3 py-2.5 flex flex-col justify-center">
                  <div className="text-[11px] text-white/70 font-medium">{t.strike_fmt}</div>
                  <div className="text-[9px] text-white/25 font-mono">{t.expiration?.slice(5)} · {t.dte}d</div>
                </div>
                <div className="px-3 py-2.5 flex items-center">
                  {(() => {
                    const isLarge = (t.premium >= 500000) || t.whale
                    return (
                      <span
                        className="font-bold"
                        style={isLarge ? {
                          background: isCall
                            ? 'linear-gradient(135deg, #22c55e, #86efac)'
                            : 'linear-gradient(135deg, #ef4444, #fca5a5)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                          fontWeight: 800,
                          fontSize: '13px',
                        } : {
                          color: isCall ? '#22c55e' : '#ef4444',
                          fontSize: '12px',
                          fontWeight: 700,
                        }}
                      >
                        {t.premium_fmt}
                      </span>
                    )
                  })()}
                </div>
                <div className="px-3 py-2.5 flex items-center">
                  <span className={badgeClass(t.flow_type === 'SWEEP' ? 'flow' : t.flow_type === 'BLOCK' ? 'info' : 'muted')}>{t.flow_type?.replace('_1M','')}</span>
                </div>
                <div className="px-3 py-2.5 flex items-center gap-1 flex-wrap">
                  {t.badges?.slice(0, 2).map((b, i) => (
                    <span key={i} className={badgeClass(b.tier)}>{b.label}</span>
                  ))}
                </div>
              </div>
            )
          })
        )}
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-16"
          style={{ background: 'linear-gradient(to top, #0E1117 0%, transparent 100%)' }}
        />
      </div>

      {/* Footer */}
      <div className="border-t border-[#1E2A3A] px-4 py-2 flex items-center justify-between">
        <span className="font-mono text-[9px] text-white/15">Live institutional options flow</span>
        <a href="/scanner" className="font-mono text-[9px] text-[#f97316] hover:text-[#fb923c] transition-colors">
          Open full scanner →
        </a>
      </div>

      <style>{`
        @keyframes pbSlideIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .pb-scanner-wrap::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
    </div>
    </div>
  )
}
