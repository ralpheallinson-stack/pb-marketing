"use client"

export default function Nav() {
  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4">
      <nav className="flex items-center justify-between gap-4 px-5 h-12 rounded-full bg-[#161B24]/85 backdrop-blur-xl border border-[#252E3D] shadow-[0_8px_32px_rgba(0,0,0,0.4)] w-full max-w-3xl">
        <a href="/" className="flex-shrink-0" aria-label="Home">
          <svg width="22" height="22" viewBox="0 0 24 28" fill="#F0F2F5" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0h4v28H0z"/>
            <path d="M4 0h8a8 8 0 010 16H4z"/>
            <path d="M4 14h9a7 7 0 010 14H4z"/>
          </svg>
        </a>
        <div className="hidden md:flex items-center gap-5 text-sm">
          <a href="/#features" className="text-white/50 hover:text-white transition-colors">Features</a>
          <a href="/results" className="text-white/50 hover:text-white transition-colors">Results</a>
          <a href="/#pricing" className="text-white/50 hover:text-white transition-colors">Pricing</a>
          <a href="/community" className="text-white/50 hover:text-white transition-colors">Community</a>
          <a href="/free-scanner" className="text-white/50 hover:text-white transition-colors font-semibold">Free Scanner</a>
          <a href="/login" className="text-white/50 hover:text-white transition-colors">Login</a>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <a href="/login" className="md:hidden text-white/60 hover:text-white text-sm transition-colors">Login</a>
          <a
            href="https://buy.stripe.com/7sYdRbcs8bqTfC21j50RG07"
            className="bg-[#f97316] hover:bg-[#ea6b0e] text-white text-xs font-semibold px-4 py-1.5 rounded-full transition-colors"
          >
            Get Started
          </a>
        </div>
      </nav>
    </div>
  )
}
