"use client"

import Image from "next/image"

export default function TrackRecord() {
  return (
    <section className="bg-[#0a1628] w-full py-24">
      <div className="h-px bg-gradient-to-r from-transparent via-[#60a5fa]/20 to-transparent mb-24" />

      <div className="mx-6 md:mx-8 bg-[#111d35] rounded-3xl overflow-visible">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-center">
          {/* Left Column — screenshot overflows bottom */}
          <div className="relative" style={{height: '620px'}}>

            {/* Big background box */}
            <div className="absolute bg-[#111d35] border border-[#60a5fa]/20 rounded-2xl"
              style={{top: '50px', left: '40px', right: '-30px', bottom: '-20px',
              boxShadow: 'inset 0 0 60px rgba(96,165,250,0.05)'}} />

            {/* Blue glow */}
            <div className="absolute z-0 pointer-events-none"
              style={{top: '35%', left: '35%', width: '220px', height: '220px',
              background: 'radial-gradient(circle, rgba(96,165,250,0.1), transparent 70%)',
              transform: 'translate(-50%, -50%)'}} />

            {/* Image 1 — top left */}
            <div className="absolute z-10" style={{top: '0', left: '0', width: '300px', transform: 'rotate(-2deg)'}}>
              <Image src="/images/discord-callout.png" alt="Alert 1" width={300} height={260}
                className="rounded-xl border border-white/20 shadow-[0_24px_60px_rgba(0,0,0,1)] w-full h-auto" />
            </div>

            {/* Image 2 — top right, overlapping image 1 */}
            <div className="absolute z-20" style={{top: '30px', right: '0', width: '290px', transform: 'rotate(1.5deg)'}}>
              <Image src="/images/callout2.png" alt="Alert 2" width={290} height={250}
                className="rounded-xl border border-white/20 shadow-[0_24px_60px_rgba(0,0,0,1)] w-full h-auto" />
            </div>

            {/* Image 3 — bottom left */}
            <div className="absolute z-20" style={{bottom: '40px', left: '20px', width: '290px', transform: 'rotate(1deg)'}}>
              <Image src="/images/callout3.png" alt="Alert 3" width={290} height={250}
                className="rounded-xl border border-white/20 shadow-[0_24px_60px_rgba(0,0,0,1)] w-full h-auto" />
            </div>

            {/* Image 4 — bottom right, front */}
            <div className="absolute z-30" style={{bottom: '0', right: '10px', width: '300px', transform: 'rotate(-1deg)'}}>
              <Image src="/images/callout4.png" alt="Alert 4" width={300} height={260}
                className="rounded-xl border border-white/20 shadow-[0_24px_60px_rgba(0,0,0,1)] w-full h-auto" />
            </div>

          </div>

          {/* Right Column — copy */}
          <div className="py-16 px-12">
            <div className="flex items-center gap-2 mb-8">
              <div className="h-px w-8 bg-[#60a5fa]" />
              <span className="text-[#60a5fa] text-xs font-semibold tracking-[0.2em] uppercase">
                Track Record
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
              Real alerts.<br />
              Real outcomes.<br />
              All public.
            </h2>

            <p className="text-white/55 text-lg leading-relaxed mb-10">
              Every signal we send is logged the moment it fires — ticker, premium,
              grade, result. We publish everything. Visit /methodology and see every
              trade, every grade, unedited.
            </p>

            <div className="flex items-center gap-4 mb-10">
              <div className="bg-white/[0.05] border border-white/10 rounded-xl px-5 py-4">
                <span className="text-2xl font-bold text-[#22c55e]">220+</span>
                <span className="text-xs text-white/45 mt-1 block">STRONG win rate</span>
              </div>
              <div className="bg-white/[0.05] border border-white/10 rounded-xl px-5 py-4">
                <span className="text-2xl font-bold text-[#22c55e]">OPRA</span>
                <span className="text-xs text-white/45 mt-1 block">Avg EV per trade</span>
              </div>
            </div>

            <a
              href="/methodology"
              className="text-[#60a5fa] hover:text-white text-sm font-semibold transition-colors duration-200"
            >
              See every published result →
            </a>
          </div>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mt-24" />
    </section>
  )
}
