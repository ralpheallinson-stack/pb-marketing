"use client"
import Link from "next/link"

export default function Nav() {
  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4">
      <nav className="flex items-center justify-between gap-4 px-5 h-12 rounded-full bg-white/90 backdrop-blur-xl border border-gray-200 shadow-[0_8px_32px_rgba(0,0,0,0.08)] w-full max-w-3xl">
        <Link href="/" className="flex-shrink-0" aria-label="Home">
          <img src="/images/pb-logo.png" alt="Profit Builders" width={28} height={28} className="w-7 h-7 object-contain brightness-0" />
        </Link>
        <div className="hidden md:flex items-center gap-5 text-sm">
          <Link href="/#features" className="text-gray-500 hover:text-black transition-colors">Features</Link>
          <Link href="/results" className="text-gray-500 hover:text-black transition-colors">Results</Link>
          <Link href="/#pricing" className="text-gray-500 hover:text-black transition-colors">Pricing</Link>
          <Link href="/community" className="text-gray-500 hover:text-black transition-colors">Community</Link>
          <Link href="/blog" className="text-gray-500 hover:text-black transition-colors">Blog</Link>
          <Link href="/free-scanner" className="text-gray-500 hover:text-black transition-colors font-semibold">Free Scanner</Link>
          <a href="https://x.com/ProfitBldrs" target="_blank" rel="noopener noreferrer" aria-label="Follow on X" className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-black transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.261 5.635zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
          <Link href="/login" className="text-gray-500 hover:text-black transition-colors">Login</Link>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <Link href="/login" className="md:hidden text-gray-500 hover:text-black text-sm transition-colors">Login</Link>
          <a
            href="https://buy.stripe.com/7sYdRbcs8bqTfC21j50RG07"
            className="bg-gray-900 hover:bg-black text-white text-xs font-semibold px-4 py-1.5 rounded-full transition-colors"
          >
            Get Started
          </a>
        </div>
      </nav>
    </div>
  )
}
