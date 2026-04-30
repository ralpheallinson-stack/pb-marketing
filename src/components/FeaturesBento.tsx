import Link from "next/link";

const watchlistRows = [
  { sym: "TSLA", lean: "BULL",  call: "$27.0M", put: "$18.4M", sig: 349 },
  { sym: "NVDA", lean: "BULL",  call: "$12.3M", put: "$4.8M",  sig: 214 },
  { sym: "SPY",  lean: "MIXED", call: "$14.1M", put: "$13.9M", sig: 408 },
];

const accumulationPrints = [
  { time: "10:12", prem: "$1.6M", type: "SWEEP",     badge: "OPENING", variant: "open" as const },
  { time: "10:31", prem: "$2.1M", type: "SWEEP",     badge: "RAPID",   variant: "rapid" as const },
  { time: "10:47", prem: "$890K", type: "BLOCK",     badge: "RAPID",   variant: "rapid" as const },
  { time: "10:58", prem: "$1.2M", type: "SWEEP",     badge: "LARGE",   variant: "large" as const },
  { time: "11:05", prem: "$1.5M", type: "BLOCK 1M+", badge: "RAPID",   variant: "rapid" as const, highlight: true },
];

const convictionFilters = [
  "Sweep detection",
  "Vol/OI > 5×",
  "MM filter",
  "Above-ask · NBBO",
];

const badgeStyle = {
  open:  "bg-white/[0.06] text-white/70 border-white/10",
  rapid: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  large: "bg-amber-500/12 text-amber-300 border-amber-500/30",
} as const;

export default function FeaturesBento() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl mx-auto">

      {/* === Card 1 · Watchlist (top-left) === */}
      <div className="rounded-xl border border-white/[0.08] bg-[#161B24] p-6 flex flex-col relative overflow-hidden hover:border-white/[0.14] transition-colors">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,rgba(96,165,250,0.10),transparent_60%)] pointer-events-none" />
        <div className="relative flex flex-col h-full">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#60a5fa] shadow-[0_0_8px_rgba(96,165,250,0.7)]" />
            <span className="text-[10px] font-mono text-[#60a5fa] tracking-[0.22em] uppercase">Watchlist</span>
          </div>
          <h3 className="text-[22px] font-bold text-white leading-[1.15] mb-2 tracking-tight">
            Your names,<br /><span className="text-[#60a5fa]">one glance.</span>
          </h3>
          <p className="text-[13px] text-white/55 leading-relaxed mb-5">
            Pin the tickers you care about. Live call/put premium and signal count — no digging through the tape.
          </p>

          <div className="mt-auto rounded-lg border border-white/[0.06] bg-[#0E1117] p-3 font-mono">
            <div className="grid grid-cols-[1fr_70px_70px_40px] gap-2 px-1 pb-2 text-[8px] text-white/25 tracking-[0.12em] uppercase border-b border-white/[0.05]">
              <span>Sym</span><span className="text-right">Call</span><span className="text-right">Put</span><span className="text-right">Sig</span>
            </div>
            {watchlistRows.map((r) => (
              <div key={r.sym} className="grid grid-cols-[1fr_70px_70px_40px] gap-2 px-1 py-1.5 items-center border-b border-white/[0.03] last:border-b-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-white">{r.sym}</span>
                  <span className={`text-[8px] font-bold px-1 py-0.5 rounded-sm tracking-wide ${
                    r.lean === "BULL" ? "bg-emerald-500/15 text-emerald-400"
                    : r.lean === "BEAR" ? "bg-red-500/15 text-red-400"
                    : "bg-white/[0.05] text-white/40"
                  }`}>{r.lean}</span>
                </div>
                <span className="text-right text-[11px] text-emerald-400/90">{r.call}</span>
                <span className="text-right text-[11px] text-red-400/90">{r.put}</span>
                <span className="text-right text-[11px] text-white/55">{r.sig}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* === Card 2 · Flow Filtering (top-middle) — combines old text card + filter visual === */}
      <div className="rounded-xl border border-white/[0.08] bg-[#161B24] p-6 flex flex-col relative overflow-hidden hover:border-white/[0.14] transition-colors">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(96,165,250,0.08),transparent_60%)] pointer-events-none" />
        <div className="relative flex flex-col h-full">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#60a5fa] shadow-[0_0_8px_rgba(96,165,250,0.7)]" />
            <span className="text-[10px] font-mono text-[#60a5fa] tracking-[0.22em] uppercase">Flow Filtering</span>
          </div>
          <h3 className="text-[22px] font-bold text-white leading-[1.15] mb-2 tracking-tight">
            Slice the tape.<br /><span className="text-[#60a5fa]">Save the view.</span>
          </h3>
          <p className="text-[13px] text-white/55 leading-relaxed mb-5">
            Direction, flow type, signal quality, side. Isolate Grade A sweeps, block-only flow, or above-ask aggression. Save custom presets and load them in one click.
          </p>

          <div className="mt-auto rounded-lg border border-white/[0.06] bg-[#0E1117] p-3 font-mono">
            <div className="flex items-center gap-1.5 mb-3 flex-wrap">
              <span className="text-[8px] tracking-[0.16em] uppercase text-white/30 mr-1">Saved</span>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded border bg-white/[0.06] text-white/70 border-white/10">Ralph1</span>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded border bg-white/[0.06] text-white/70 border-white/10">Aggressive</span>
            </div>
            <FilterRow label="Grade A only" on />
            <FilterRow label="Above-ask only" on />
            <FilterRow label="Sweep only" />
          </div>
        </div>
      </div>

      {/* === Card 3 · Conviction Grading (top-right) — replaces filter-panel visual === */}
      <div className="rounded-xl border border-white/[0.08] bg-[#161B24] p-6 flex flex-col relative overflow-hidden hover:border-white/[0.14] transition-colors">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,rgba(34,197,94,0.10),transparent_60%)] pointer-events-none" />
        <div className="relative flex flex-col h-full">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(34,197,94,0.7)]" />
            <span className="text-[10px] font-mono text-emerald-400 tracking-[0.22em] uppercase">Conviction Grading</span>
          </div>
          <h3 className="text-[22px] font-bold text-white leading-[1.15] mb-2 tracking-tight">
            institutional-flow filter <span className="text-emerald-400">Grade A</span> engine.
          </h3>
          <p className="text-[13px] text-white/55 leading-relaxed mb-5">
            Every signal scored against 9 data-backed gates. Only A and B reach you — the rest filtered at the source.
          </p>

          <div className="mt-auto rounded-lg border border-white/[0.06] bg-[#0E1117] p-3 font-mono">
            <div className="text-[10px] text-white/50 mb-2">Grade A · institutional-quality</div>
            <div className="flex gap-1 mb-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <span key={i} className="flex-1 h-[5px] rounded-sm bg-emerald-400 shadow-[0_0_6px_rgba(34,197,94,0.5)]" />
              ))}
            </div>
            <ul className="space-y-1.5">
              {convictionFilters.map((f) => (
                <li key={f} className="flex items-center gap-2 text-[11px] text-white/60">
                  <span className="text-emerald-400 font-bold">✓</span>{f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* === Card 4 · Accumulation Detection (full-width bottom) === */}
      <div className="md:col-span-3 rounded-xl border border-white/[0.08] bg-[#161B24] p-6 md:p-8 relative overflow-hidden hover:border-white/[0.14] transition-colors">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,rgba(167,139,250,0.10),transparent_60%)] pointer-events-none" />
        <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-8 lg:gap-12 items-center">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.7)]" />
              <span className="text-[10px] font-mono text-violet-400 tracking-[0.22em] uppercase">Accumulation Detection</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-white leading-[1.1] mb-3 tracking-tight">
              Watch smart money<br /><span className="text-violet-400">build a position.</span>
            </h3>
            <p className="text-[14px] text-white/55 leading-relaxed mb-4 max-w-md">
              7 prints on META 620C in 53 minutes. From a $1.6M sweep to a $1.5M BLOCK 1M+ closer — the scanner flags every escalation. When RAPID badges start stacking on the same contract, a position is being built.
            </p>
            <div className="font-mono text-[12px] text-white/50">
              <span className="text-violet-400 font-bold">$8.3M</span> total · 7 prints · 53 min window
            </div>
          </div>

          <div className="rounded-lg border border-white/[0.06] bg-[#0E1117] overflow-hidden">
            <div className="flex justify-between px-4 py-3 border-b border-white/[0.06] font-mono text-[10px] tracking-[0.16em] uppercase text-white/40">
              <span>META 620C</span><span>05/02</span>
            </div>
            {accumulationPrints.map((p) => (
              <div
                key={p.time}
                className={`grid grid-cols-[64px_1fr_1fr_88px] gap-3 px-4 py-2.5 items-center font-mono text-[12px] border-b border-white/[0.04] last:border-b-0 ${
                  p.highlight ? "bg-violet-500/[0.06] border-l-2 border-l-violet-400 pl-[14px]" : ""
                }`}
              >
                <span className="text-white/55">{p.time}</span>
                <span className="text-white">{p.prem}</span>
                <span className="text-white/55">{p.type}</span>
                <span className={`text-[9px] font-bold tracking-wide px-2 py-0.5 rounded border text-center ${badgeStyle[p.variant]}`}>{p.badge}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterRow({ label, on = false }: { label: string; on?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5 px-1 border-b border-white/[0.04] last:border-b-0">
      <span className="text-[11px] text-white/65">{label}</span>
      <span className={`relative w-8 h-4 rounded-full transition-colors ${on ? "bg-blue-400/40" : "bg-white/10"}`}>
        <span className={`absolute top-[3px] w-2.5 h-2.5 rounded-full transition-all ${on ? "left-[18px] bg-white" : "left-[3px] bg-white/60"}`} />
      </span>
    </div>
  );
}
