"use client"

import { Card } from "@/components/ui/card"

export interface Stats {
  count: number
  bull: number
  bear: number
  lean: string
  pc_ratio: number
}

function fmtPrem(v: number): string {
  const sign = v < 0 ? "-" : ""
  const abs = Math.abs(v)
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(2)}B`
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(2)}M`
  if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(1)}K`
  return `${sign}$${abs.toFixed(0)}`
}

function KPIGaugeRing({ value, color }: { value: number; color: string }) {
  const r = 18
  const c = 2 * Math.PI * r
  const off = c - (Math.min(100, Math.max(0, value)) / 100) * c
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" className="flex-shrink-0">
      <circle cx="22" cy="22" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
      <circle
        cx="22" cy="22" r={r} fill="none" stroke={color} strokeWidth="3"
        strokeDasharray={c} strokeDashoffset={off}
        transform="rotate(-90 22 22)" strokeLinecap="round"
      />
      <text x="22" y="26" textAnchor="middle" className="fill-white text-[10px] font-mono font-semibold">{value}</text>
    </svg>
  )
}

export interface StatsPanelProps {
  displayStats: Stats
  callPrem: number
  putPrem: number
  calls: number
  puts: number
}

export function StatsPanel({ displayStats, callPrem, putPrem, calls, puts }: StatsPanelProps) {
  const totalPrem = displayStats.bull + displayStats.bear
  const bullPct = totalPrem > 0 ? (displayStats.bull / totalPrem) * 100 : 50
  const isBull = displayStats.lean === "BULL"
  const totalCount = calls + puts
  const callSharePct = Math.round((calls / (totalCount || 1)) * 100)
  const putSharePct = Math.round((puts / (totalCount || 1)) * 100)

  return (
    <div className="grid grid-cols-4 gap-2 p-0 flex-shrink-0" style={{ background: "transparent" }}>
      {/* Flow sentiment */}
      <Card className="border border-white/[0.06] rounded-lg shadow-none p-0 px-5 py-3 flex flex-row items-center gap-4" style={{ background: "#16191F" }}>
        <KPIGaugeRing
          value={Math.round(bullPct)}
          color={isBull ? "var(--pb-positive)" : displayStats.lean === "BEAR" ? "var(--pb-negative)" : "var(--pb-accent)"}
        />
        <div className="flex flex-col gap-0.5">
          <span className="text-[12px] text-white/50">Flow sentiment</span>
          <span className={`text-[22px] font-semibold leading-tight ${isBull ? "text-[var(--pb-positive)]" : displayStats.lean === "BEAR" ? "text-[var(--pb-negative)]" : "text-zinc-300"}`}>
            {isBull ? "Bullish" : displayStats.lean === "BEAR" ? "Bearish" : "Mixed"}
          </span>
          <span className="text-[10px] text-white/30 tracking-wide leading-tight" title="Sentiment + PCR computed from contract volume, not premium dollars">volume-weighted</span>
        </div>
      </Card>

      {/* Put to call */}
      <Card className="border border-white/[0.06] rounded-lg shadow-none p-0 px-5 py-3 flex flex-row items-center gap-4" style={{ background: "#16191F" }}>
        <KPIGaugeRing
          value={Math.min(Math.round(displayStats.pc_ratio * 50), 100)}
          color="var(--pb-accent)"
        />
        <div>
          <div className="text-[12px] text-white/50 mb-1">Put to call</div>
          <div className="text-[24px] font-semibold text-white leading-none font-mono">{displayStats.pc_ratio.toFixed(3)}</div>
        </div>
      </Card>

      {/* Call flow */}
      <Card className="border border-white/[0.06] rounded-lg shadow-none p-0 px-5 py-3 flex flex-row items-center gap-4" style={{ background: "#16191F" }}>
        <KPIGaugeRing value={callSharePct} color="var(--pb-positive)" />
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[12px] text-white/50">Call flow</span>
            <span className="text-[13px] font-semibold text-[var(--pb-positive)] font-mono">{fmtPrem(callPrem)}</span>
          </div>
          <div className="text-[24px] font-semibold text-white leading-none font-mono">{calls.toLocaleString("en-US")}</div>
        </div>
      </Card>

      {/* Put flow */}
      <Card className="border border-white/[0.06] rounded-lg shadow-none p-0 px-5 py-3 flex flex-row items-center gap-4" style={{ background: "#16191F" }}>
        <KPIGaugeRing value={putSharePct} color="var(--pb-negative)" />
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[12px] text-white/50">Put flow</span>
            <span className="text-[13px] font-semibold text-[var(--pb-negative)] font-mono">{fmtPrem(putPrem)}</span>
          </div>
          <div className="text-[24px] font-semibold text-white leading-none font-mono">{puts.toLocaleString("en-US")}</div>
        </div>
      </Card>
    </div>
  )
}
