"use client"
import Link from "next/link"
import { useState } from "react"

const links = [
  { href: "/#features",    label: "Features" },
  { href: "/results",      label: "Results" },
  { href: "/#pricing",     label: "Pricing" },
  { href: "/community",    label: "Community" },
  { href: "/blog",         label: "Blog" },
  { href: "/free-scanner", label: "Free Scanner", bold: true },
]

export default function Nav() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4">
      <nav className="relative flex items-center justify-between gap-4 px-5 h-12 rounded-full bg-white/90 backdrop-blur-xl border border-gray-200 shadow-[0_8px_32px_rgba(0,0,0,0.08)] w-full max-w-3xl">
        <Link href="/" className="flex-shrink-0" aria-label="Home">
          <img src="/images/pb-logo.png" alt="Profit Builders" width={28} height={28} className="w-7 h-7 object-contain brightness-0" />
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-5 text-sm">
          {links.map(l => (
            <Link key={l.href} href={l.href} className={`text-gray-500 hover:text-black transition-colors ${l.bold ? "font-semibold" : ""}`}>
              {l.label}
            </Link>
          ))}
          <a href="https://x.com/ProfitBldrs" target="_blank" rel="noopener noreferrer" aria-label="Follow on X" className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-black transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.261 5.635zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
          <Link href="/login" className="text-gray-500 hover:text-black transition-colors">Login</Link>
        </div>

        {/* Right cluster */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <a
            href="https://buy.stripe.com/7sYdRbcs8bqTfC21j50RG07"
            className="bg-gray-900 hover:bg-black text-white text-xs font-semibold px-4 py-1.5 rounded-full transition-colors"
          >
            Get Started
          </a>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen(o => !o)}
            className="md:hidden flex items-center justify-center w-9 h-9 -mr-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-gray-700">
              {open ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <g>
                  <line x1="3" y1="7"  x2="21" y2="7" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="17" x2="21" y2="17" />
                </g>
              )}
            </svg>
          </button>
        </div>

        {/* Mobile dropdown */}
        {open && (
          <div className="md:hidden absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.12)] py-2 z-50">
            {links.map(l => (
              <Link
                key={l.href}
                href={l.href}
                onClick={close}
                className={`block px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors ${l.bold ? "font-semibold" : ""}`}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={close}
              className="block px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors border-t border-gray-100 mt-1 pt-3"
            >
              Login
            </Link>
            <a
              href="https://x.com/ProfitBldrs"
              target="_blank"
              rel="noopener noreferrer"
              onClick={close}
              className="block px-5 py-2.5 text-sm text-gray-500 hover:bg-gray-100 transition-colors"
            >
              Follow on X
            </a>
          </div>
        )}
      </nav>

      {open && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={close}
          className="md:hidden fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px] cursor-default"
        />
      )}
    </div>
  )
}
