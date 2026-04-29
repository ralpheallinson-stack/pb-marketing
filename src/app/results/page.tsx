import Nav from "@/components/Nav"
import Footer from "@/components/Footer"
import Link from "next/link"

export const dynamic = "force-static"

export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-[#080B12] text-[#E5E7EB]">
      <Nav />

      <main className="max-w-4xl mx-auto px-6 py-16 md:py-24">
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

        <Section title="1. Tape ingest" subtitle="OPRA via Polygon WebSocket">
          <p>
            Profit Builders consumes the live OPRA options tape over Polygon&apos;s
            WebSocket feed. Trades arrive in real time with sub-millisecond
            timestamps, exchange identifiers, condition codes, and per-fill size.
            Every print is written to a normalized PostgreSQL store with the raw
            condition-code array preserved.
          </p>
        </Section>

        <Section title="2. Sweep detection" subtitle="CBOE Rule 6.11 compliance">
          <p>
            A trade is classified as a sweep when 2+ exchanges fill within a
            ≤500ms window — the threshold defined in CBOE Rulebook Section 6.11
            for Intermarket Sweep Order semantics. Block trades are single-fill
            prints above the premium floor. Aggregation windows widen for larger
            sweeps (12s for 15+ fills) so 20+ leg institutional orders aren&apos;t
            split into fragments.
          </p>
        </Section>

        <Section title="3. OPRA condition codes" subtitle="Per the Multi-listed Options Plan">
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

        <Section title="4. Trade-side classification" subtitle="NBBO spread-relative aggression">
          <p>
            Aggression is computed against the NBBO snapshot at trade time
            (15-second staleness cutoff). The spread-relative methodology
            follows Hasbrouck (2004) on effective spread — prints in the upper
            35% of the bid-ask spread are tagged AT_ASK, lower 35% AT_BID,
            middle 30% NEUTRAL. Above-the-ask and below-the-bid prints are
            flagged separately as aggressive.
          </p>
        </Section>

        <Section title="5. Greeks + implied volatility" subtitle="Black-Scholes-Merton with continuous dividend yield">
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

        <Section title="7. Pipeline transparency" subtitle="What we will and won&apos;t claim">
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
            <Link href="/free-scanner" className="inline-flex items-center px-5 py-3 bg-transparent border border-[rgba(148,163,184,0.2)] text-[#E5E7EB] font-medium rounded-md hover:border-[rgba(148,163,184,0.4)] transition-colors">
              Free scanner (15-min delayed)
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
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
