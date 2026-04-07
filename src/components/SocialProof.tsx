"use client"

import { MagicTweet, TweetSkeleton } from "@/components/magicui/tweet-card"
import { Suspense } from "react"

const tweetIds = [
  "2039503219131666447",
  "2039491977431884062",
  "2037612294167736764",
]

export default function SocialProof() {
  return (
    <section className="bg-[#0E1117] w-full py-16 px-6">
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-10" />

      <div className="max-w-6xl mx-auto">
        {/* Header row */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <div className="h-px w-8 bg-[#60a5fa]" />
            <span className="text-[#60a5fa] text-xs font-semibold tracking-[0.2em] uppercase">From the desk of Profit Builders</span>
          </div>
          <a
            href="https://twitter.com/ProfitBldrs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-white/60 hover:text-white text-sm font-semibold transition-colors border border-white/10 hover:border-white/30 rounded-full px-4 py-2"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            Follow Us
          </a>
        </div>

        {/* Big background box with tweets floating inside */}
        <div className="relative">
          {/* Background square */}
          <div className="absolute bg-[#161B24] border border-white/10 rounded-2xl"
            style={{top: '24px', left: '-16px', right: '-16px', bottom: '-16px'}} />

          {/* Blue glow */}
          <div className="absolute pointer-events-none z-0"
            style={{top: '30%', left: '50%', width: '300px', height: '200px',
            background: 'radial-gradient(circle, rgba(96,165,250,0.06), transparent 70%)',
            transform: 'translate(-50%, -50%)'}} />

          {/* Tweet cards grid */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {tweetIds.map((id) => (
              <div key={id} className="w-full">
                <Suspense fallback={<TweetSkeleton />}>
                  <MagicTweet id={id} />
                </Suspense>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mt-24" />
    </section>
  )
}
