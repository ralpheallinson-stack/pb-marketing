"use client"

import { useEffect, useState } from "react"
import Nav from "@/components/Nav"
import Footer from "@/components/Footer"
import Link from "next/link"

export const dynamic = "force-static"


// Live wall-validation stat. Fetches the latest backtest result and
// renders the hit-rate band table with an honest sample-size caveat.
// Self-improving: the backtest cron runs weekly and the daily snapshot
// cron grows the sample, so this stat strengthens over time without
// any code changes.
function WallValidationStat() {
  const [data, setData] = useState<{ n: number; hit_pct_05?: number; hit_pct_1?: number; hit_pct_2?: number; median_distance_pct?: number; pending?: boolean } | null>(null)
  useEffect(() => {
    fetch("/api/scanner/wall-validation?symbol=SPY")
      .then(r => r.ok ? r.json() : null)
      .then(setData)
      .catch(() => setData(null))
  }, [])
  if (!data) return null
  if (data.pending || !data.n) {
    return (
      <div className="mt-6 rounded-md border border-[rgba(148,163,184,0.12)] bg-[rgba(148,163,184,0.03)] p-5">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#64748B] mb-1">Validation pending</div>
        <p className="text-sm text-[#94A3B8] leading-relaxed">
          Wall-prediction backtest is collecting historical samples. First public stat publishes once we have ≥30 sessions.
        </p>
      </div>
    )
  }
  return (
    <div className="mt-6 rounded-md border border-[rgba(148,163,184,0.18)] bg-[rgba(15,21,32,0.6)] p-5">
      <div className="flex items-baseline justify-between mb-3">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#64748B]">Wall validation — SPY</div>
        <div className="text-[10px] text-[#475569] font-mono tabular-nums">n = {data.n}</div>
      </div>
      <p className="text-sm text-[#94A3B8] leading-relaxed mb-4">
        Backtest method: for each historical EOD snapshot, take the Max +GEX
        call wall strike, compare to the <em>following session&apos;s</em> close.
        Distance is &vert;close − wall&vert; / spot.
      </p>
      <div className="grid grid-cols-3 gap-3 mb-3">
        {[
          { band: "≤ 0.5%", pct: data.hit_pct_05 },
          { band: "≤ 1%", pct: data.hit_pct_1 },
          { band: "≤ 2%", pct: data.hit_pct_2 },
        ].map(r => (
          <div key={r.band} className="rounded border border-[rgba(148,163,184,0.12)] p-3 text-center">
            <div className="text-[9px] uppercase tracking-[0.14em] text-[#64748B] mb-1">close within</div>
            <div className="text-[16px] font-mono tabular-nums font-bold text-white">{r.band}</div>
            <div className="text-[20px] font-mono tabular-nums font-bold text-[#22C55E] mt-1">{r.pct ?? "—"}%</div>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-[#475569] leading-relaxed italic">
        Honest caveat: n = {data.n} is a small sample. The daily snapshot cron
        and a weekly Polygon backtest grow the dataset; we re-run automatically
        and these numbers update. Median distance: {data.median_distance_pct?.toFixed(2) ?? "—"}%.
      </p>
    </div>
  )
}

export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-[#080B12] text-[#E5E7EB]">
      <Nav />

      <main className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        <div className="text-[11px] uppercase tracking-[0.18em] text-[#F97316] font-semibold mb-4">
          Data Methodology
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.05] mb-6">
          How we process institutional options flow.
        </h1>
        <p className="text-lg md:text-xl text-[#94A3B8] leading-relaxed mb-16 max-w-3xl">
          The dimensions of the pipeline that put Profit Builders in line with the
          institutional standards used by FINRA, OPRA, CBOE, and academic
          microstructure research. No outcome claims — just the data plumbing.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-12">
          <div>

        <Section id="tape-ingest" title="1. Tape ingest" subtitle="OPRA via Polygon WebSocket">
          <p>
            Profit Builders consumes the live OPRA options tape over Polygon&apos;s
            WebSocket feed. Trades arrive in real time with sub-millisecond
            timestamps, exchange identifiers, condition codes, and per-fill size.
            Every print is written to a normalized PostgreSQL store with the raw
            condition-code array preserved.
          </p>
        </Section>

        <Section id="sweep-detection" title="2. Sweep detection" subtitle="CBOE Rule 6.11 compliance">
          <p>
            A trade is classified as a sweep when 2+ exchanges fill within a
            ≤500ms window — the threshold defined in CBOE Rulebook Section 6.11
            for Intermarket Sweep Order semantics. Block trades are single-fill
            prints above the premium floor. Aggregation windows widen for larger
            sweeps (12s for 15+ fills) so 20+ leg institutional orders aren&apos;t
            split into fragments.
          </p>
        </Section>

        <Section id="opra-codes" title="3. OPRA condition codes" subtitle="Per the Multi-listed Options Plan">
          <p>
            Each tape print carries one or more OPRA condition codes. Profit
            Builders surfaces the institutional-aggression badges for prints
            tagged ISO (code 219 — Reg-NMS Intermarket Sweep Order, equity-only
            by routing structure) and CROSS (code 229 — broker internalization,
            the closest options analog to dark-pool flow). Multi-leg auto/auction
            codes (232–239) are decoded and exposed as structure tags rather
            than gates.
          </p>
        </Section>

        <Section id="trade-classification" title="4. Trade-side classification" subtitle="NBBO spread-relative aggression">
          <p>
            Aggression is computed against the NBBO snapshot at trade time
            (15-second staleness cutoff). The spread-relative methodology
            follows Hasbrouck (2004) on effective spread — prints in the upper
            35% of the bid-ask spread are tagged AT_ASK, lower 35% AT_BID,
            middle 30% NEUTRAL. Above-the-ask and below-the-bid prints are
            flagged separately as aggressive.
          </p>
        </Section>

        <Section id="greeks" title="5. Greeks + implied volatility" subtitle="Black-Scholes-Merton with continuous dividend yield">
          <p>
            For symbols where Polygon does not return live Greeks (typically
            index options like SPX/SPXW/NDX/RUT/VIX), Profit Builders computes
            them via Black-Scholes-Merton with a Newton-Raphson IV solver per
            Corrado &amp; Miller (1996). ETF options apply continuous dividend
            yield <em>q</em> in the d₁ formula — d₁ = [ln(S/K) + (r − q + σ²/2)T]
            / (σ√T) — with delta = e^(−qT)·N(d₁), per Haug (2007).
          </p>
        </Section>

        <Section title="6. Volume / open interest" subtitle="Prior-day OI from EOD snapshot">
          <p>
            Vol/OI ratios use prior-day open interest from the Polygon EOD
            snapshot — the institutional standard. Intraday OI estimates are
            avoided because they introduce sample-path bias and aren&apos;t
            available cleanly through any vendor at the per-contract level.
          </p>
        </Section>

        <Section id="gex" title="7. Gamma exposure (GEX) heatmap" subtitle="SqueezeMetrics-style convention, no proprietary adjustments">
          <p>
            The GEX heatmap surfaces dealer hedging walls strike-by-strike,
            expiry-by-expiry. We compute net gamma exposure per cell as{' '}
            <code className="text-[#22C55E] bg-[rgba(34,197,94,0.08)] px-1.5 py-0.5 rounded text-[0.9em]">γ × OI × spot²</code>{' '}
            — the public SqueezeMetrics dollar-gamma convention — assuming the
            standard worst-case dealer position (short calls, long puts) when
            no flow attribution is available.
          </p>
          <p className="mt-4">
            What this means: <strong className="text-white">wall direction is robust</strong> —
            the strikes our heatmap flags as Max +GEX (call wall) and Max -GEX
            (put wall) are computed from real Polygon greeks during regular
            trading hours, restricted to a ±3% band around spot for actionable
            relevance, and align with the price levels where dealer delta-hedging
            activity concentrates. <strong className="text-white">Wall magnitudes are convention-dependent</strong> —
            tools that layer in retail-vs-institutional flow inference (e.g.,
            SpotGamma&apos;s GEX 2.0) will report different absolute dollar
            values for the same underlying chain. We use the public methodology
            because it&apos;s reproducible from the Polygon greeks any user
            can verify; we do not claim parity with proprietary models.
          </p>
          <p className="mt-4">
            After-hours, when Polygon greeks aren&apos;t streaming, individual
            cells fall back to a Gaussian-shaped gamma estimate centered on ATM.
            Those cells are visually annotated (dashed amber border) and the
            heatmap header surfaces an <code className="text-amber-400 bg-amber-500/[0.08] px-1.5 py-0.5 rounded text-[0.9em]">ESTIMATED</code> pill
            so users can&apos;t mistake synthetic numbers for live greeks.
          </p>
          <WallValidationStat />
        </Section>

        <Section id="pipeline-transparency" title="8. Pipeline transparency" subtitle="What we will and won&apos;t claim">
          <p>
            Every signal that enters the database carries a <code className="text-[#22C55E] bg-[rgba(34,197,94,0.08)] px-1.5 py-0.5 rounded text-[0.9em]">scorer_version</code>{' '}
            stamp identifying which ruleset produced it. Conviction grading is
            an evolving internal layer — we will not publicize aggregate win
            rates that mix grader versions, since the metric is non-stationary
            when rules change. Forward performance will be reported per-version
            once a stable ruleset has accumulated a meaningful sample.
          </p>
        </Section>

        <div className="mt-20 pt-10 border-t border-[rgba(148,163,184,0.12)]">
          <p className="text-sm text-[#64748B] mb-6 leading-relaxed">
            Built on real OPRA tape, Polygon market data, and standards
            published by CBOE, FINRA, and the academic microstructure
            literature. No proprietary aggregations, no smoothed numbers, no
            cherry-picked windows.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/scanner" className="inline-flex items-center px-5 py-3 bg-[#F97316] text-black font-semibold rounded-md hover:bg-[#FB923C] transition-colors">
              Try the live scanner
            </Link>
            <Link href="/pricing" className="inline-flex items-center px-5 py-3 bg-transparent border border-[rgba(148,163,184,0.2)] text-[#E5E7EB] font-medium rounded-md hover:border-[rgba(148,163,184,0.4)] transition-colors">
              See pricing
            </Link>
          </div>
        </div>
          </div>

          {/* Sticky TOC — desktop only */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#475569] mb-3">
                On this page
              </div>
              <nav className="space-y-1.5 text-[12px]">
                {[
                  { id: "tape-ingest", label: "1. Tape ingest" },
                  { id: "sweep-detection", label: "2. Sweep detection" },
                  { id: "opra-codes", label: "3. OPRA condition codes" },
                  { id: "trade-classification", label: "4. Trade classification" },
                  { id: "greeks", label: "5. Greeks + IV" },
                  { id: "open-interest", label: "6. Open interest" },
                  { id: "gex", label: "7. GEX heatmap" },
                  { id: "pipeline-transparency", label: "8. Pipeline transparency" },
                ].map(s => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="block py-1 text-[#7A8BA8] hover:text-white border-l-2 border-transparent hover:border-[#F97316] pl-3 transition-colors"
                  >
                    {s.label}
                  </a>
                ))}
              </nav>

              <div className="mt-8 pt-6 border-t border-[rgba(148,163,184,0.1)]">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#475569] mb-2">
                  Continue
                </div>
                <Link href="/blog" className="block text-[12px] text-[#7A8BA8] hover:text-white py-1 transition-colors">
                  Blog &amp; guides →
                </Link>
                <Link href="/scanner" className="block text-[12px] text-[#7A8BA8] hover:text-white py-1 transition-colors">
                  Live scanner →
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  )
}

function Section({ id, title, subtitle, children }: { id?: string; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-12 scroll-mt-24">
      <div className="flex items-baseline gap-3 mb-3 flex-wrap">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-[#E5E7EB]">{title}</h2>
        <span className="text-sm text-[#94A3B8]">— {subtitle}</span>
      </div>
      <div className="text-[15px] md:text-[16px] text-[#94A3B8] leading-[1.7] max-w-3xl">
        {children}
      </div>
    </section>
  )
}
