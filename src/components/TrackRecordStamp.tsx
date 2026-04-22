"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"

/**
 * TrackRecordStamp — the "verified outcome" hero stat card.
 *
 * Used on comparison pages, homepage, results page, and anywhere we need a
 * compact "this is the evidence" component. Shows Grade A win rate as the
 * hero number, Grade B below for context (the filter actually working is
 * visible when Grade A > Grade B), corpus size, and a link to /results.
 *
 * Animates bars + numbers on first reveal. Uses IntersectionObserver so it
 * doesn't fire until it's in view.
 */

type Props = {
  gradeAPct?: number          // default 39.3
  gradeBPct?: number          // default 31.6
  signalCount?: number        // default 174000
  since?: string              // "2024-10" or display string
  href?: string               // default /results
  compact?: boolean           // smaller variant
  live?: boolean              // show pulsing dot; default true
}

export default function TrackRecordStamp({
  gradeAPct = 39.3,
  gradeBPct = 31.6,
  signalCount = 174000,
  since = "Oct 2024",
  href = "/results",
  compact = false,
  live = true,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    if (!rootRef.current) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setAnimate(true)
            io.disconnect()
            break
          }
        }
      },
      { threshold: 0.25 },
    )
    io.observe(rootRef.current)
    return () => io.disconnect()
  }, [])

  const advantage = ((gradeAPct / gradeBPct - 1) * 100).toFixed(0)
  const compactClasses = compact ? "p-5" : "p-7 md:p-8"

  return (
    <div
      ref={rootRef}
      className={`track-stamp relative ${compactClasses} rounded-sm overflow-hidden`}
    >
      {/* Base + seal atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0E1117] via-[#0B0E13] to-[#0E1117]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_0%_0%,rgba(52,211,153,0.10),transparent_60%)]" />
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full border border-[#34D399]/8" />
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full border border-[#34D399]/6" />
        {/* Grain */}
        <div
          className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")",
          }}
        />
      </div>

      {/* Left accent rule */}
      <div className="absolute left-0 top-7 bottom-7 w-[2px] bg-gradient-to-b from-[#34D399] via-[#34D399]/60 to-transparent" />

      {/* Content */}
      <div className="relative">
        {/* Top meta row */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            {live && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34D399] opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#34D399]" />
              </span>
            )}
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#34D399]/80">
              Verified Outcome
            </span>
          </div>
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#3D4D63]">
            Since {since}
          </span>
        </div>

        {/* Grade A — headline */}
        <div className="mb-2">
          <div className="flex items-baseline gap-3">
            <div
              className="text-white"
              style={{
                fontFamily: "'Bricolage Grotesque', 'Plus Jakarta Sans', system-ui, sans-serif",
                fontFeatureSettings: "'tnum'",
                fontSize: compact ? "56px" : "88px",
                lineHeight: 0.95,
                letterSpacing: "-0.05em",
                fontWeight: 800,
              }}
            >
              <AnimatedNumber value={gradeAPct} animate={animate} decimals={1} />
              <span className="text-[#34D399]">%</span>
            </div>
          </div>
          <div className="mt-2">
            <Bar pct={gradeAPct} animate={animate} strong />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span
              className="text-[#E8EDF5]"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "15px" }}
            >
              Grade A signal win rate
            </span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#3D4D63]">
              n = {signalCount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#252E3D] my-5" />

        {/* Grade B — context */}
        <div className="flex items-center gap-5">
          <div className="flex-1">
            <div className="flex items-baseline gap-2 mb-1">
              <span
                className="text-[#A9B4C6]"
                style={{
                  fontFamily: "'Bricolage Grotesque', 'Plus Jakarta Sans', sans-serif",
                  fontFeatureSettings: "'tnum'",
                  fontSize: compact ? "20px" : "24px",
                  fontWeight: 700,
                  letterSpacing: "-0.03em",
                }}
              >
                <AnimatedNumber value={gradeBPct} animate={animate} decimals={1} />%
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#7A8BA8]">
                Grade B baseline
              </span>
            </div>
            <Bar pct={gradeBPct} animate={animate} />
          </div>
        </div>

        {/* Advantage callout */}
        <div className="mt-5 flex items-center gap-3 px-3 py-2 rounded-sm bg-[rgba(52,211,153,0.05)] border-l-2 border-[#34D399]">
          <span
            className="text-[#34D399]"
            style={{
              fontFamily: "'Bricolage Grotesque', 'Plus Jakarta Sans', sans-serif",
              fontSize: "18px",
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            +{advantage}%
          </span>
          <span
            className="text-[#A9B4C6]"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "13px" }}
          >
            Grade A advantage · <span className="text-[#7A8BA8]">the filter is doing work</span>
          </span>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-5 border-t border-[#252E3D] flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span
              className="font-mono text-white"
              style={{ fontSize: "15px", letterSpacing: "-0.01em", fontWeight: 600 }}
            >
              {signalCount.toLocaleString()}+
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#7A8BA8]">
              Resolved
            </span>
          </div>
          <Link
            href={href}
            className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#34D399] hover:text-white transition-colors group inline-flex items-center gap-1.5"
          >
            Audit it
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

function Bar({ pct, animate, strong = false }: { pct: number; animate: boolean; strong?: boolean }) {
  return (
    <div className="relative h-[3px] w-full bg-[#1A1F2A] overflow-hidden rounded-full">
      <div
        className={`absolute left-0 top-0 h-full rounded-full transition-[width] ease-out ${
          strong
            ? "bg-gradient-to-r from-[#34D399] via-[#34D399] to-[#22c55e]"
            : "bg-gradient-to-r from-[#7A8BA8]/60 to-[#7A8BA8]/30"
        }`}
        style={{
          width: animate ? `${pct}%` : "0%",
          transitionDuration: "1100ms",
        }}
      />
    </div>
  )
}

function AnimatedNumber({
  value, animate, decimals = 0,
}: { value: number; animate: boolean; decimals?: number }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!animate) return
    const start = performance.now()
    const dur = 900
    let raf = 0
    const tick = (t: number) => {
      const elapsed = t - start
      const progress = Math.min(1, elapsed / dur)
      // Cubic ease-out
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(value * eased)
      if (progress < 1) raf = requestAnimationFrame(tick)
      else setDisplay(value)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [animate, value])

  return <>{display.toFixed(decimals)}</>
}
