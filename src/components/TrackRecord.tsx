"use client"

import CountUp from './CountUp'

interface AlertData {
  grade: 'A' | 'B'
  ticker: string
  side: 'CALLS' | 'PUTS'
  strike: string
  direction: 'BULLISH' | 'BEARISH'
  spot: string
  paid: string
  size: string
  delta: string
  iv: string
  volOi: string
  note: string
  time: string
}

const BULL_BAR = 'bg-gradient-to-r from-[#22c55e] to-transparent'
const BEAR_BAR = 'bg-gradient-to-r from-[#ef4444] to-transparent'

function AlertCard({ data }: { data: AlertData }) {
  const bullish = data.direction === 'BULLISH'
  const fields = [
    { label: 'SPOT', value: data.spot },
    { label: 'PAID', value: data.paid },
    { label: 'SIZE', value: data.size },
    { label: 'DELTA', value: data.delta },
    { label: 'IV', value: data.iv },
    { label: 'VOL/OI', value: data.volOi },
  ]

  return (
    <div className="rounded-xl border border-white/10 bg-[#0E1117] overflow-hidden shadow-2xl w-[280px]">
      <div className={`h-[3px] ${bullish ? BULL_BAR : BEAR_BAR}`} />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[10px] font-mono text-white/40 tracking-widest uppercase">
              GRADE {data.grade} · SWEEP
            </span>
            <div className="text-white font-bold text-base mt-0.5">
              {data.ticker} — {data.side} {data.strike}
            </div>
          </div>
          <span
            className={
              'text-[10px] font-mono px-2 py-1 rounded border ' +
              (bullish
                ? 'bg-green-500/15 text-green-400 border-green-500/20'
                : 'bg-red-500/15 text-red-400 border-red-500/20')
            }
          >
            {data.direction}
          </span>
        </div>

        {/* Data grid */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {fields.map(({ label, value }) => (
            <div key={label}>
              <div className="text-[9px] text-white/30 font-mono tracking-wider">{label}</div>
              <div className="text-[11px] text-white/80 font-mono font-medium mt-0.5">{value}</div>
            </div>
          ))}
        </div>

        {/* AI note */}
        <div className="text-[10px] text-white/35 font-mono leading-relaxed border-t border-white/5 pt-3">
          {data.note}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5">
          <span className="text-[9px] text-white/20 font-mono">PROFIT BUILDERS · {data.time}</span>
          <span className="text-[9px] text-green-400/60 font-mono">● LIVE</span>
        </div>
      </div>
    </div>
  )
}

const ALERTS: AlertData[] = [
  {
    grade: 'A', ticker: 'NVDA', side: 'CALLS', strike: '$177.50', direction: 'BULLISH',
    spot: '$177.28', paid: '$1.75', size: '1,036 cts',
    delta: '0.49', iv: '34%', volOi: '7.2×',
    note: '$170K sweep hit 5 fills across 3 exchanges, bought at the ask. 7× vol/oi, near atm.',
    time: '15:03 ET',
  },
  {
    grade: 'A', ticker: 'RIOT', side: 'CALLS', strike: '$16', direction: 'BULLISH',
    spot: '$13.62', paid: '$0.175', size: '2,996 cts',
    delta: '0.33', iv: '86%', volOi: '61×',
    note: 'Aggressive 61× vol/oi sweep on short-dated OTM calls. Third hit on strike today.',
    time: '14:41 ET',
  },
  {
    grade: 'B', ticker: 'IWM', side: 'PUTS', strike: '$239', direction: 'BEARISH',
    spot: '$252.44', paid: '$4.36', size: '977 cts',
    delta: '0.07', iv: '31%', volOi: '14.6×',
    note: 'Deep OTM puts swept above bid. Hedge or bearish conviction — 14× vol/oi elevated.',
    time: '13:18 ET',
  },
  {
    grade: 'A', ticker: 'TSLA', side: 'CALLS', strike: '$355', direction: 'BULLISH',
    spot: '$351.44', paid: '$20.95', size: '62 cts',
    delta: '0.52', iv: '46%', volOi: '3.5×',
    note: 'ITM call sweep, $130K premium. Delta 0.52 — directional conviction, not hedge.',
    time: '12:52 ET',
  },
]

export default function TrackRecord() {
  return (
    <section
      className="relative bg-[#0E1117] w-full py-24"
      style={{
        backgroundImage:
          'radial-gradient(ellipse 60% 50% at 30% 50%, rgba(34,197,94,0.06), transparent)',
      }}
    >
      <div className="h-px bg-gradient-to-r from-transparent via-[#60a5fa]/20 to-transparent mb-24" />

      <div className="mx-6 md:mx-8 bg-[#161B24] rounded-3xl overflow-visible">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-center">

          {/* LEFT — desktop: scattered alert cards */}
          <div className="hidden lg:block relative" style={{ height: '620px' }}>
            <div
              className="absolute bg-[#161B24] border border-[#60a5fa]/20 rounded-2xl"
              style={{
                top: '50px', left: '40px', right: '-30px', bottom: '-20px',
                boxShadow: 'inset 0 0 60px rgba(96,165,250,0.05)',
              }}
            />

            <div className="absolute z-10" style={{ top: '10px', left: '20px', transform: 'rotate(-2deg)' }}>
              <AlertCard data={ALERTS[0]} />
            </div>
            <div className="absolute z-20" style={{ top: '40px', right: '10px', transform: 'rotate(1.5deg)' }}>
              <AlertCard data={ALERTS[1]} />
            </div>
            <div className="absolute z-20" style={{ bottom: '30px', left: '30px', transform: 'rotate(1deg)' }}>
              <AlertCard data={ALERTS[2]} />
            </div>
            <div className="absolute z-30" style={{ bottom: '0', right: '20px', transform: 'rotate(-1deg)' }}>
              <AlertCard data={ALERTS[3]} />
            </div>
          </div>

          {/* LEFT — mobile: stacked */}
          <div className="lg:hidden flex flex-col gap-4 p-6 items-center">
            {ALERTS.slice(0, 2).map((a) => (
              <AlertCard key={a.ticker} data={a} />
            ))}
          </div>

          {/* RIGHT — copy */}
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
              grade, result. We publish everything. Visit /results and see every
              trade, every grade, unedited.
            </p>

            <div className="flex items-center gap-4 mb-10">
              <div className="bg-white/[0.05] border border-white/10 rounded-xl px-5 py-4">
                <span className="text-2xl font-bold text-[#22c55e]">
                  <CountUp from={0} to={52.1} duration={2} />%
                </span>
                <span className="text-xs text-white/45 mt-1 block">STRONG win rate</span>
              </div>
              <div className="bg-white/[0.05] border border-white/10 rounded-xl px-5 py-4">
                <span className="text-2xl font-bold text-[#22c55e]">
                  +<CountUp from={0} to={2.18} duration={2} />%
                </span>
                <span className="text-xs text-white/45 mt-1 block">Avg EV per trade</span>
              </div>
            </div>

            <a
              href="/results"
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
