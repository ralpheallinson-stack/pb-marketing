"use client"

// /results is a deprecated URL retained for inbound link equity. The real
// destination is /methodology — Flask serves a 301 server-side, but if a
// user lands here via the static export directly, redirect client-side.
import { useEffect } from "react"
import Link from "next/link"

export default function ResultsRedirect() {
  useEffect(() => {
    window.location.replace("/methodology")
  }, [])
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0B0F1A" }}>
      <div className="text-center">
        <p className="text-sm text-[#94A3B8] mb-3">Methodology has moved.</p>
        <Link href="/methodology" className="text-[#60a5fa] hover:underline text-sm">Continue to /methodology →</Link>
      </div>
    </div>
  )
}
