import { BentoGrid, BentoCard } from "@/components/magicui/bento-grid"

export default function AlertCards() {
  return (
    <section style={{ background: '#161B24' }} className="py-20 overflow-hidden w-full max-w-full" id="features">
      <div className="max-w-5xl mx-auto px-6 overflow-hidden">

        {/* Section header */}
        <div className="text-center mb-12">
          <span className="text-xs font-mono uppercase tracking-[0.18em] text-white/40 mb-3 block">
            What You Get
          </span>
          <h2
            className="font-bold text-white"
            style={{
              fontSize: 'clamp(28px, 4vw, 48px)',
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #ffffff 0%, #94a3b8 50%, #60a5fa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Alerts That Actually Matter.
          </h2>
          <p className="text-white/40 mt-3 text-base max-w-lg mx-auto">
            Premium, contracts, Greeks, and AI analysis — via web scanner,
            Discord, or Telegram. Under 8 seconds from exchange to screen.
          </p>
        </div>

        {/* Bento Grid */}
        <BentoGrid className="grid-cols-1 md:grid-cols-3 auto-rows-[minmax(220px,auto)]">

          {/* Card 1 — NVDA large (spans 2 cols) */}
          <BentoCard
            className="md:col-span-2 row-span-1"
            tag="GRADE A · SWEEP"
            tagColor="rgba(34,197,94,0.2)"
            name="$2.1M BLOCK — NVDA"
            description="CALLS $145 · Mar 21 · 14 DTE · Spot $142.50 · Paid $8.45 · 2,485 cts · ABOVE ASK · Delta 0.55 · IV 42%"
            background={
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(135deg, rgba(34,197,94,0.06) 0%, transparent 60%)',
                borderLeft: '3px solid rgba(34,197,94,0.5)',
              }} />
            }
          >
            <div className="mt-3 text-xs text-white/30 font-mono border-t border-white/5 pt-3">
              $2.1M paid above ask on $145 calls — 2% OTM, 14 DTE. Third block
              in 4 days. Institutions defending this level into expiration.
            </div>
          </BentoCard>

          {/* Card 2 — SPX MM filtered (spans 1 col) */}
          <BentoCard
            className="col-span-1 row-span-1"
            tag="NOT DELIVERED"
            tagColor="rgba(239,68,68,0.2)"
            name="MM Detected · Filtered"
            description="SPX PUTS $5,200 · $890K · AT BID · Delta-neutral hedge flagged. Market maker, not directional flow."
            background={
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(135deg, rgba(239,68,68,0.04) 0%, transparent 60%)',
                borderLeft: '3px solid rgba(239,68,68,0.3)',
                opacity: 0.7,
              }} />
            }
          />

          {/* Card 3 — TSLA (spans 1 col) */}
          <BentoCard
            className="col-span-1 row-span-1"
            tag="GRADE A · ACCUM 3x"
            tagColor="rgba(59,130,246,0.2)"
            name="$1.4M SWEEP — TSLA"
            description="CALLS $420 · Mar 7 · 3 DTE · Third hit on this strike in 30 mins. $4.1M total accumulated."
            background={
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(135deg, rgba(59,130,246,0.06) 0%, transparent 60%)',
                borderLeft: '3px solid rgba(59,130,246,0.5)',
              }} />
            }
          />

          {/* Card 4 — Stats card (spans 2 cols) */}
          <BentoCard
            className="md:col-span-2 row-span-1"
            tag="PLATFORM STATS"
            tagColor="rgba(168,85,247,0.2)"
            name="161,065+ Signals Tracked"
            description="Every outcome published. Grade A win rate: 39.7%. STRONG conviction: 52.1%. MM filtered before delivery."
            background={
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(135deg, rgba(168,85,247,0.06) 0%, transparent 60%)',
                borderLeft: '3px solid rgba(168,85,247,0.4)',
              }} />
            }
          >
            <div className="flex gap-4 mt-3 border-t border-white/5 pt-3 pb-4">
              {[
                { val: '9', label: 'Filters' },
                { val: '<8s', label: 'Delivery' },
                { val: '20', label: 'Exchanges' },
              ].map(s => (
                <div key={s.label} className="flex flex-col items-start gap-1">
                  <div className="font-mono font-bold text-white text-lg">{s.val}</div>
                  <div className="text-xs text-white/40 font-mono">{s.label}</div>
                </div>
              ))}
            </div>
          </BentoCard>

        </BentoGrid>

        {/* Caption */}
        <p className="text-center text-white/40 text-xs px-4 leading-relaxed mt-6">
          Card 3 shows what never reaches you — MM hedges filtered before delivery.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          {[
            'Under 8 Second Delivery',
            'Real-Time Greeks & IV',
            'Spread & MM Detection',
            'Discord & Telegram Alerts',
          ].map(f => (
            <span
              key={f}
              className="text-xs font-mono px-4 py-1.5 rounded-full"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.5)',
              }}
            >
              {f}
            </span>
          ))}
        </div>

      </div>
    </section>
  )
}
