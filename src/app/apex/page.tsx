"use client"

interface ApexPick {
  id: string
  picked_at_label: string
  filed_at_label: string
  is_live: boolean
  ticker: string
  strike: number
  cp: string
  expiry_label: string
  days_to_expiry: number
  premium_label: string
  grade: string
  flow_type: string
  takeaway: string
  standouts: string[]
}

const APEX_PICKS: ApexPick[] = [
  {
    id: 'apex-001',
    picked_at_label: '14:23 ET',
    filed_at_label: '14:18 ET',
    is_live: true,
    ticker: 'NVDA',
    strike: 145,
    cp: 'Call',
    expiry_label: '6/13/26',
    days_to_expiry: 11,
    premium_label: '$2.34M premium',
    grade: 'A',
    flow_type: 'sweep',
    takeaway: 'A sweep buyer took $2.3M in calls — open interest already 4× typical.',
    standouts: [
      'Premium 4× larger than typical for this strike',
      'Sweep across multiple exchanges — urgency signal',
      'Bought at the ask — directional intent',
    ],
  },
  {
    id: 'apex-002',
    picked_at_label: '13:42 ET',
    filed_at_label: '13:38 ET',
    is_live: false,
    ticker: 'AAPL',
    strike: 220,
    cp: 'Call',
    expiry_label: '7/18/26',
    days_to_expiry: 46,
    premium_label: '$1.85M premium',
    grade: 'A',
    flow_type: 'sweep',
    takeaway: 'An aggressive buyer swept $1.85M in calls across multiple exchanges — paying above the ask.',
    standouts: [
      'Premium 3× larger than typical for this strike',
      'Sweep cleared 5 exchanges in 90 seconds',
      'Filled at and above the ask — paying up for the position',
    ],
  },
  {
    id: 'apex-003',
    picked_at_label: '10:24 ET',
    filed_at_label: '10:21 ET',
    is_live: false,
    ticker: 'AVGO',
    strike: 290,
    cp: 'Call',
    expiry_label: '7/18/26',
    days_to_expiry: 46,
    premium_label: '$1.18M premium',
    grade: 'A',
    flow_type: 'sweep',
    takeaway: 'Heavy call buying — $1.18M in calls swept in the first hour of the session.',
    standouts: [
      'Premium 2.5× larger than typical for this strike',
      'Multi-leg structure — coordinated positioning',
      'Filed in the first 30 minutes — early-session conviction',
    ],
  },
]

export default function ApexPage() {
  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex justify-between items-start pb-4 border-b border-stone-800/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium">Apex</span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                Premium
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-1">
              Active picks · {APEX_PICKS.length} in play
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-stone-400">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Live updating</span>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {APEX_PICKS.map((pick) => (
            <ApexPickCard key={pick.id} pick={pick} />
          ))}
        </div>

        <div className="mt-6 pt-3 border-t border-stone-800/50 flex justify-between text-[11px] text-stone-500">
          <span>Selected from the 308K-signal dataset</span>
          <span>Picks remain visible until contract expiry</span>
        </div>
      </div>
    </div>
  )
}

function ApexPickCard({ pick }: { pick: ApexPick }) {
  const urgent = pick.days_to_expiry < 14

  return (
    <div className="bg-stone-900/50 border border-stone-800/50 rounded-lg p-5">
      <div className="mb-3">
        {pick.is_live ? (
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Live · pick since {pick.picked_at_label}</span>
          </div>
        ) : (
          <div className="text-[11px] text-stone-500 tabular-nums">
            Apex pick · {pick.picked_at_label}
          </div>
        )}
      </div>

      <div className="flex justify-between items-baseline gap-3">
        <div className="text-base font-medium leading-tight">
          {pick.ticker} ${pick.strike} {pick.cp} · Exp {pick.expiry_label}
        </div>
        <div
          className={`text-[11px] font-medium tabular-nums whitespace-nowrap ${
            urgent ? 'text-amber-400' : 'text-stone-500'
          }`}
        >
          {pick.days_to_expiry} days out
        </div>
      </div>

      <div className="text-xs text-stone-500 mt-1.5 tabular-nums">
        Filed {pick.filed_at_label} · {pick.premium_label} · Grade {pick.grade} {pick.flow_type}
      </div>

      <p className="text-sm leading-relaxed mt-3.5 text-stone-200">
        {pick.takeaway}
      </p>

      <div className="mt-4">
        <div className="text-[11px] text-stone-500 mb-2">Why this stands out</div>
        <ul className="text-sm text-stone-400 space-y-1.5 list-disc list-inside marker:text-stone-600">
          {pick.standouts.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
