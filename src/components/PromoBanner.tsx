"use client"
import { useEffect, useState } from "react"

const PROMO_EXPIRES = new Date("2026-05-06T07:00:00Z").getTime()
const STORAGE_KEY = "pb_promo_phhunt30_dismissed"

export default function PromoBanner() {
  const [mounted, setMounted] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (Date.now() > PROMO_EXPIRES) {
      setDismissed(true)
      return
    }
    if (localStorage.getItem(STORAGE_KEY) === "1") {
      setDismissed(true)
      return
    }
    document.documentElement.classList.add("has-promo-banner")
  }, [])

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1")
    setDismissed(true)
    document.documentElement.classList.remove("has-promo-banner")
  }

  if (!mounted || dismissed) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-10 bg-[#f5f5f3] text-[#1f2024] flex items-center justify-center px-10 sm:px-4 text-[12px] sm:text-[13px] tracking-tight border-b border-black/[0.08]">
      <a
        href="/pricing"
        className="flex items-center gap-2 sm:gap-2.5 text-[#1f2024] no-underline hover:text-black transition-colors min-w-0 max-w-full"
      >
        <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#DA552F] flex-shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-[#DA552F]" aria-hidden />
          Limited Offer
        </span>
        <span className="hidden sm:inline h-3 w-px bg-black/15 flex-shrink-0" aria-hidden />
        <span className="text-[#1f2024]/85 truncate">
          <span className="font-semibold text-[#1f2024]">30% off</span>
          <span className="hidden sm:inline"> first month with </span>
          <span className="sm:hidden"> · </span>
          <span className="font-mono text-[11px] sm:text-[12px] tracking-[0.06em] border border-black/15 rounded px-1.5 py-[2px] whitespace-nowrap">PHHUNT30</span>
        </span>
        <span aria-hidden className="ml-1 text-[#1f2024]/50 hidden sm:inline flex-shrink-0">›</span>
      </a>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss promo"
        className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-black/35 hover:text-black/70 text-lg leading-none w-7 h-7 flex items-center justify-center"
      >
        ×
      </button>
    </div>
  )
}
