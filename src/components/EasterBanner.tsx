"use client"
import { useState, useEffect } from "react"

export default function EasterBanner() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const gone = sessionStorage.getItem("eb") || new Date() > new Date("2026-04-09")
    if (!gone) setShow(true)
  }, [])
  if (!show) return null
  return (
    <div className="px-4 py-2.5 flex items-center justify-center relative text-sm" style={{ background: '#161B24', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <span className="text-white text-center">
        <strong className="text-yellow-400">Easter Sale — Full Access for $7</strong>
        {" · "}7 days. Flow Scanner + GEX Heatmap + AI Chart Analyzer. Then $99/mo.{" "}
        <a href="https://buy.stripe.com/7sYdRbcs8bqTfC21j50RG07" className="text-xs font-bold px-3 py-1 rounded-full ml-2 transition-colors" style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)', color: '#000' }}>Get Easter Access</a>
      </span>
      <button onClick={() => { setShow(false); sessionStorage.setItem("eb","1") }} className="absolute right-4 text-gray-500 hover:text-white text-lg leading-none cursor-pointer" aria-label="Dismiss">×</button>
    </div>
  )
}
