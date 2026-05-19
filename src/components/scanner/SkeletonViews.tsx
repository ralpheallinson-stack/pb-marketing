"use client"

/**
 * SkeletonViews — initial-hydration placeholders for /scanner.
 *
 * Renders during the first /api/scanner/feed fetch window (~1-3s on
 * a fresh page load), then yields to <StatsPanel /> + <ScannerAgGrid />
 * once hasInitiallyLoaded flips true. Distinct from the legacy table's
 * inline 25×15 skeleton (which only runs on the opt-out path) — these
 * mount inside the AG Grid branch where the empty rowData would
 * otherwise trigger AG Grid's "No flow matches" overlay during loading.
 *
 * Pixel widths in <ScannerSkeleton /> mirror the AG Grid column defs
 * at ScannerAgGrid.tsx:269-475. Staggered placeholder widths +
 * alternating bg opacities so the skeleton reads as "data shape" not
 * "empty stripes."
 */

import { Card } from "@/components/ui/card"

/* ── DashboardSkeleton — 4 cards matching <StatsPanel /> layout ───────── */

function GaugeRingSkeleton({ color = "rgba(255,255,255,0.08)" }: { color?: string }) {
  // Static (non-animated) ring shape matching KPIGaugeRing dimensions.
  // animate-pulse on the SVG container is too aggressive; we let the
  // sibling text bars carry the pulse.
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" className="flex-shrink-0">
      <circle cx="22" cy="22" r="18" fill="none" stroke={color} strokeWidth="3" />
    </svg>
  )
}

function CardSkeleton({ gaugeColor }: { gaugeColor?: string }) {
  return (
    <Card
      className="border border-white/[0.06] rounded-lg shadow-none p-0 px-5 py-3 flex flex-row items-center gap-4"
      style={{ background: "#16191F" }}
    >
      <GaugeRingSkeleton color={gaugeColor} />
      <div className="flex flex-col gap-1.5">
        <div className="h-3 w-24 rounded bg-white/[0.05] animate-pulse" />
        <div className="h-7 w-32 rounded bg-white/[0.08] animate-pulse" />
        <div className="h-2.5 w-20 rounded bg-white/[0.04] animate-pulse" />
      </div>
    </Card>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-4 gap-2 p-0 flex-shrink-0" style={{ background: "transparent" }}>
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </div>
  )
}

/* ── ScannerSkeleton — rows mirroring the AG Grid column widths ───────── */

// Mirrors BASE_COLUMN_DEFS in ScannerAgGrid.tsx. Sum = ~1226px (matches
// typical AG Grid total width with the Conds flex-1 column taking the
// remainder). Last column gets flex-1 so it absorbs viewport residual.
const COL_WIDTHS: { w: number; flex?: boolean }[] = [
  { w: 124 }, // Time
  { w: 96 },  // Tick
  { w: 92 },  // Expiry
  { w: 76 },  // Strike
  { w: 64 },  // C/P
  { w: 76 },  // Side
  { w: 68 },  // B/S
  { w: 104 }, // Spot
  { w: 80 },  // Size
  { w: 80 },  // Price
  { w: 80 },  // Prem
  { w: 80 },  // Type
  { w: 88 },  // Vol
  { w: 88 },  // OI
  { w: 200, flex: true }, // Conds
]

// Deterministic pseudo-random placeholder widths (40-79% of column),
// alternating bg opacities. Same formula pattern as the prior #418-safe
// skeleton at scanner/page.tsx:2429 — keeps render hydration-stable.
function placeholderWidthPct(rowIdx: number, colIdx: number): number {
  return 40 + ((rowIdx * 7 + colIdx * 13 + rowIdx * colIdx) % 40)
}

function bgClass(rowIdx: number, colIdx: number): string {
  return (rowIdx + colIdx) % 2 === 0 ? "bg-white/[0.05]" : "bg-white/[0.08]"
}

interface ScannerSkeletonProps {
  rowCount?: number
}

export function ScannerSkeleton({ rowCount = 15 }: ScannerSkeletonProps) {
  return (
    <div className="flex-1 overflow-hidden" style={{ background: "#1C1C1E" }}>
      {/* Header bar (matches AG Grid header height ~36px). */}
      <div
        className="flex items-center px-2 py-1.5 sticky top-0 z-10"
        style={{ background: "#252430" }}
      >
        {COL_WIDTHS.map((col, i) => (
          <div
            key={i}
            className="px-2"
            style={{
              width: col.flex ? undefined : col.w,
              flex: col.flex ? 1 : undefined,
              minWidth: col.flex ? col.w : undefined,
            }}
          >
            <div className="h-2.5 w-16 rounded bg-white/[0.06]" />
          </div>
        ))}
      </div>

      {/* Skeleton rows — 35px each matching compact density default.
          border-left:3px transparent reserves the same row-tint gutter
          space as live rows so there's no horizontal jitter when the
          skeleton yields to real data. */}
      {Array.from({ length: rowCount }).map((_, rowIdx) => (
        <div
          key={rowIdx}
          className="flex items-center px-2 border-b border-white/[0.04]"
          style={{ height: 35, borderLeft: "3px solid transparent" }}
        >
          {COL_WIDTHS.map((col, colIdx) => (
            <div
              key={colIdx}
              className="px-2"
              style={{
                width: col.flex ? undefined : col.w,
                flex: col.flex ? 1 : undefined,
                minWidth: col.flex ? col.w : undefined,
              }}
            >
              {colIdx === COL_WIDTHS.length - 1 ? (
                // Conds — render 2-3 pill-shaped placeholders to match
                // the actual badge layout.
                <div className="flex gap-1 items-center">
                  <div className="h-4 w-16 rounded bg-white/[0.05] animate-pulse" />
                  <div className="h-4 w-12 rounded bg-white/[0.08] animate-pulse" />
                  {rowIdx % 3 === 0 && (
                    <div className="h-4 w-10 rounded bg-white/[0.05] animate-pulse" />
                  )}
                </div>
              ) : (
                <div
                  className={`h-3 rounded ${bgClass(rowIdx, colIdx)} animate-pulse`}
                  style={{ width: `${placeholderWidthPct(rowIdx, colIdx)}%` }}
                />
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
