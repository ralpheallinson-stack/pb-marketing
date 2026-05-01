"use client"

import { useEffect, useMemo, useRef, useState } from "react"

interface Bar { t: number; o: number; h: number; l: number; c: number; v: number }
interface ChartData {
  symbol: string
  days: number
  bars: Bar[]
  change_pct: number
  low: number
  high: number
  last: number
}

// Inline price chart for blog posts. Drop in via:
//   <PriceChart symbol="SNDK" days={30} />
// or as a markdown raw-HTML placeholder:
//   <div class="pb-price-chart" data-symbol="SNDK" data-days="30"></div>
// The PriceChartHydrator (mounted by the blog post page) walks the DOM
// for the placeholder pattern and mounts <PriceChart> in place.
//
// Renders an SVG line chart with a soft area fill, min/max badges, and
// a meta strip showing % change, last close, and 30d range. Light
// editorial palette to match the blog body. The chart is interactive on
// hover (crosshair + tooltip) — premium-publication touch.
export function PriceChart({ symbol, days = 30 }: { symbol: string; days?: number }) {
  const [data, setData] = useState<ChartData | null>(null)
  const [error, setError] = useState(false)
  const [hover, setHover] = useState<number | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/blog/price-chart?symbol=${symbol}&days=${days}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => { if (!cancelled) { if (d.error) setError(true); else setData(d) } })
      .catch(() => { if (!cancelled) setError(true) })
    return () => { cancelled = true }
  }, [symbol, days])

  // SVG coordinate math, memoized so the path re-renders only on data change.
  const W = 720, H = 220, PAD = { top: 18, right: 22, bottom: 24, left: 50 }
  const plot = useMemo(() => {
    if (!data || !data.bars.length) return null
    const bars = data.bars
    const xs = bars.map((_, i) => PAD.left + (i / (bars.length - 1 || 1)) * (W - PAD.left - PAD.right))
    const minY = Math.min(...bars.map(b => b.l))
    const maxY = Math.max(...bars.map(b => b.h))
    const range = (maxY - minY) || 1
    const y = (v: number) => PAD.top + (1 - (v - minY) / range) * (H - PAD.top - PAD.bottom)
    const points = bars.map((b, i) => ({ x: xs[i], y: y(b.c), bar: b }))
    const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ")
    const areaPath =
      `M${points[0].x.toFixed(2)},${(H - PAD.bottom).toFixed(2)} ` +
      points.map(p => `L${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ") +
      ` L${points[points.length - 1].x.toFixed(2)},${(H - PAD.bottom).toFixed(2)} Z`
    // Y-axis tick marks (3 lines)
    const yTicks = [0, 0.5, 1].map(t => ({ y: PAD.top + t * (H - PAD.top - PAD.bottom), label: maxY - t * range }))
    // X-axis labels (start/mid/end)
    const xLabels = [0, Math.floor(bars.length / 2), bars.length - 1].map(i => ({
      x: xs[i],
      label: new Date(bars[i].t).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    }))
    return { points, linePath, areaPath, yTicks, xLabels, minY, maxY }
  }, [data])

  if (error) {
    return (
      <div className="pb-chart-card my-7 p-5 rounded-lg border border-gray-200 bg-gray-50 text-center text-[13px] text-gray-500">
        Chart unavailable for {symbol} right now.
      </div>
    )
  }

  if (!data || !plot) {
    return (
      <div className="pb-chart-card my-7 p-5 rounded-lg border border-gray-200 bg-gray-50 animate-pulse">
        <div className="h-4 w-32 bg-gray-200 rounded mb-3" />
        <div className="h-[180px] bg-gray-100 rounded" />
      </div>
    )
  }

  const positive = data.change_pct >= 0
  const lineColor = positive ? "#059669" : "#DC2626"
  const fillColor = positive ? "rgba(5, 150, 105, 0.08)" : "rgba(220, 38, 38, 0.08)"

  const handleMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * W
    // Map x → nearest bar index
    let best = 0, bestDist = Infinity
    plot.points.forEach((p, i) => {
      const d = Math.abs(p.x - x)
      if (d < bestDist) { bestDist = d; best = i }
    })
    setHover(best)
  }

  const hoverPoint = hover !== null ? plot.points[hover] : null
  const hoverBar = hoverPoint?.bar

  return (
    <div className="pb-chart-card my-7 p-5 rounded-xl border border-gray-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      {/* Meta strip — symbol, last close, % change, range */}
      <div className="flex items-end justify-between flex-wrap gap-3 mb-3">
        <div className="flex items-baseline gap-3">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-gray-400">
            {data.symbol} · {data.days}d
          </span>
          <span className="text-[20px] font-bold text-gray-900 tabular-nums">${data.last.toFixed(2)}</span>
          <span className={`text-[13px] font-semibold tabular-nums ${positive ? "text-emerald-700" : "text-red-700"}`}>
            {positive ? "▲" : "▼"} {positive ? "+" : ""}{data.change_pct.toFixed(2)}%
          </span>
        </div>
        <div className="text-[11px] text-gray-400 tabular-nums">
          range  <span className="text-gray-600">${data.low.toFixed(2)}</span>
          {" – "}
          <span className="text-gray-600">${data.high.toFixed(2)}</span>
        </div>
      </div>

      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto"
          onMouseMove={handleMove}
          onMouseLeave={() => setHover(null)}
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          {plot.yTicks.map((t, i) => (
            <line key={i}
              x1={PAD.left} x2={W - PAD.right}
              y1={t.y} y2={t.y}
              stroke="#F3F4F6" strokeWidth="1" strokeDasharray={i === 1 ? "0" : "2,3"}
            />
          ))}
          {/* Y-axis labels */}
          {plot.yTicks.map((t, i) => (
            <text key={i}
              x={PAD.left - 6} y={t.y + 3}
              textAnchor="end"
              className="fill-gray-400"
              style={{ fontSize: 10, fontFamily: "ui-monospace, monospace" }}
            >
              ${t.label.toFixed(0)}
            </text>
          ))}
          {/* X-axis labels */}
          {plot.xLabels.map((xl, i) => (
            <text key={i}
              x={xl.x} y={H - 6}
              textAnchor={i === 0 ? "start" : i === plot.xLabels.length - 1 ? "end" : "middle"}
              className="fill-gray-400"
              style={{ fontSize: 10, fontFamily: "ui-monospace, monospace" }}
            >
              {xl.label}
            </text>
          ))}
          {/* Area fill */}
          <path d={plot.areaPath} fill={fillColor} />
          {/* Line */}
          <path d={plot.linePath} fill="none" stroke={lineColor} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          {/* Hover crosshair */}
          {hoverPoint && (
            <>
              <line x1={hoverPoint.x} x2={hoverPoint.x} y1={PAD.top} y2={H - PAD.bottom}
                    stroke="#94A3B8" strokeWidth="1" strokeDasharray="2,2" />
              <circle cx={hoverPoint.x} cy={hoverPoint.y} r="4" fill={lineColor} stroke="white" strokeWidth="2" />
            </>
          )}
        </svg>

        {/* Tooltip */}
        {hoverBar && hoverPoint && (
          <div
            className="absolute pointer-events-none px-2.5 py-1.5 rounded-md bg-gray-900 text-white shadow-lg"
            style={{
              left: `${(hoverPoint.x / W) * 100}%`,
              top: 4,
              transform: "translateX(-50%)",
              fontSize: 11,
            }}
          >
            <div className="font-mono tabular-nums font-semibold whitespace-nowrap">
              ${hoverBar.c.toFixed(2)}
            </div>
            <div className="text-gray-300 text-[10px] tabular-nums whitespace-nowrap">
              {new Date(hoverBar.t).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Hydrator — mount points are <div class="pb-price-chart" data-symbol="X" data-days="30">
// dropped into markdown HTML. After the prose renders we replace each
// placeholder with a mounted <PriceChart>. This lets writers add charts
// inline in markdown without converting the whole pipeline to MDX.
export function PriceChartHydrator() {
  const [mounts, setMounts] = useState<Array<{ id: string; symbol: string; days: number; el: Element }>>([])

  useEffect(() => {
    const placeholders = document.querySelectorAll(".pb-price-chart[data-symbol]")
    const list: Array<{ id: string; symbol: string; days: number; el: Element }> = []
    placeholders.forEach((el, i) => {
      const sym = (el.getAttribute("data-symbol") || "").toUpperCase()
      const days = parseInt(el.getAttribute("data-days") || "30", 10) || 30
      if (!sym) return
      const id = `pb-chart-${i}-${sym}`
      ;(el as HTMLElement).id = id
      ;(el as HTMLElement).innerHTML = ""
      list.push({ id, symbol: sym, days, el })
    })
    setMounts(list)
  }, [])

  if (!mounts.length) return null
  // Render each PriceChart into its placeholder via createPortal-equivalent.
  // We use a Portal-free approach: the placeholder is empty, and we render
  // a sibling root that uses absolute positioning... simpler: use ReactDOM
  // createPortal directly.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactDOM = require("react-dom") as typeof import("react-dom")
  return (
    <>
      {mounts.map(m =>
        ReactDOM.createPortal(<PriceChart symbol={m.symbol} days={m.days} />, m.el)
      )}
    </>
  )
}

export default PriceChart
