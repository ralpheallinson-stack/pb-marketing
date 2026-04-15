import Link from "next/link";

const cardBase =
  "group/bento row-span-1 flex flex-col justify-between space-y-4 rounded-xl border border-white/[0.08] bg-[#161B24] p-4 transition duration-200 hover:shadow-xl hover:border-white/[0.14]";

export default function FeaturesBento() {
  return (
    <div className="grid grid-cols-1 gap-4 md:auto-rows-[18rem] md:grid-cols-3 max-w-6xl mx-auto">
      {/* Card 0 — Watchlist */}
      <div className={`${cardBase} md:col-span-1 relative overflow-hidden`}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,rgba(34,211,238,0.10),transparent_60%)] pointer-events-none" />
        <div className="relative flex flex-col h-full px-1">
          <div className="flex items-center gap-2 mb-4">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="#22d3ee" className="drop-shadow-[0_0_6px_rgba(34,211,238,0.7)]">
              <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
            <span className="text-[10px] font-mono text-cyan-400/80 tracking-[0.22em] uppercase">Watchlist</span>
          </div>
          <h3 className="text-[22px] font-bold text-white leading-[1.15] mb-3">
            Your names,<br />
            <span className="text-cyan-400">one glance.</span>
          </h3>
          <p className="text-[12px] text-white/45 leading-relaxed mb-4">
            Pin the tickers you care about. Live call/put premium and signal count — no digging through the tape.
          </p>

          {/* Mini watchlist preview */}
          <div className="mt-auto font-mono">
            <div className="grid grid-cols-[1fr_70px_70px_40px] gap-2 px-2 pb-1.5 text-[8px] text-white/25 tracking-[0.12em] uppercase border-b border-white/[0.05]">
              <span>Sym</span>
              <span className="text-right">Call</span>
              <span className="text-right">Put</span>
              <span className="text-right">Sig</span>
            </div>
            {[
              { sym: "TSLA", lean: "BULL", call: "$27.0M", put: "$18.4M", sig: 349 },
              { sym: "NVDA", lean: "BULL", call: "$12.3M", put: "$4.8M",  sig: 214 },
              { sym: "SPY",  lean: "MIXED", call: "$14.1M", put: "$13.9M", sig: 408 },
            ].map((r) => (
              <div key={r.sym} className="grid grid-cols-[1fr_70px_70px_40px] gap-2 px-2 py-1.5 items-center border-b border-white/[0.03] last:border-b-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-white">{r.sym}</span>
                  <span className={`text-[8px] font-bold px-1 py-0.5 rounded-sm tracking-wide ${
                    r.lean === "BULL"
                      ? "bg-emerald-500/15 text-emerald-400"
                      : r.lean === "BEAR"
                      ? "bg-red-500/15 text-red-400"
                      : "bg-white/[0.05] text-white/40"
                  }`}>{r.lean}</span>
                </div>
                <span className="text-[10px] text-emerald-400 text-right font-semibold">{r.call}</span>
                <span className="text-[10px] text-red-400 text-right font-semibold">{r.put}</span>
                <span className="text-[10px] text-white/50 text-right">{r.sig}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Card 2 — Advanced flow filtering */}
      <div className={`${cardBase} md:col-span-1`}>
        <div className="flex flex-col justify-center h-full px-2">
          <h3 className="text-[26px] font-bold text-white leading-[1.15] mb-4">
            Advanced{" "}
            <span className="text-blue-400">flow filtering</span>
          </h3>
          <p className="text-sm text-white/50 leading-relaxed mb-6">
            Filter by direction, flow type, signal quality, and side. Isolate
            Grade A sweeps, block-only flow, or above-ask aggression. Save
            custom presets and load them in one click.
          </p>
          <div>
            <Link
              href="#pricing"
              className="inline-block bg-white text-[#0B0F15] text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-white/90 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>

      {/* Card 3 — Filter Panel Visual */}
      <div className={`${cardBase} md:col-span-1`}>
        <div className="flex flex-col h-full p-1 overflow-hidden">
          <div className="rounded-[10px] border border-white/[0.06] bg-[#0d1117] p-3.5 h-full overflow-hidden relative">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2">
                  <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
                </svg>
                <span className="text-[13px] font-semibold text-white">Filters</span>
              </div>
              <span className="text-[11px] text-blue-400">Reset</span>
            </div>
            <div className="text-[9px] text-white/25 tracking-[0.1em] uppercase mb-2">Saved Presets</div>
            <div className="flex gap-1.5 mb-3.5">
              <span className="text-[11px] bg-white/[0.06] border border-white/10 rounded-md px-2.5 py-0.5 text-white/60">Ralph1 ×</span>
              <span className="text-[11px] text-white/30 py-0.5 px-2">+ Save current</span>
            </div>
            <div className="text-[9px] text-white/25 tracking-[0.1em] uppercase mb-2">Direction</div>
            <div className="flex flex-col gap-1.5 mb-3">
              <div className="flex justify-between items-center">
                <div><div className="text-xs text-white">Calls only</div><div className="text-[10px] text-white/30">Show call options only</div></div>
                <div className="relative w-8 h-[18px] rounded-full bg-white/[0.12]"><div className="absolute top-[2px] left-[2px] w-[14px] h-[14px] rounded-full bg-white/40" /></div>
              </div>
              <div className="flex justify-between items-center">
                <div><div className="text-xs text-white">Puts only</div><div className="text-[10px] text-white/30">Show put options only</div></div>
                <div className="relative w-8 h-[18px] rounded-full bg-white/[0.12]"><div className="absolute top-[2px] left-[2px] w-[14px] h-[14px] rounded-full bg-white/40" /></div>
              </div>
            </div>
            <div className="text-[9px] text-white/25 tracking-[0.1em] uppercase mb-2">Signal Quality</div>
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <div><div className="text-xs text-white">Grade A only</div><div className="text-[10px] text-white/30">$500K+ premium, 20x V/OI</div></div>
                <div className="relative w-8 h-[18px] rounded-full bg-emerald-400"><div className="absolute top-[2px] right-[2px] w-[14px] h-[14px] rounded-full bg-white" /></div>
              </div>
              <div className="flex justify-between items-center">
                <div><div className="text-xs text-white">Unusual only</div><div className="text-[10px] text-white/30">V/OI flagged activity</div></div>
                <div className="relative w-8 h-[18px] rounded-full bg-white/[0.12]"><div className="absolute top-[2px] left-[2px] w-[14px] h-[14px] rounded-full bg-white/40" /></div>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#161B24] to-transparent pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Card 4 — Accumulation Detection (2/3 wide) */}
      <div className={`${cardBase} md:col-span-3 relative overflow-hidden max-w-[820px] mx-auto w-full`}>
        {/* Violet atmosphere */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_30%,rgba(168,85,247,0.10),transparent_55%)] pointer-events-none" />

        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 items-center h-full px-6 py-2 max-w-[760px] mx-auto">
          {/* LEFT — story */}
          <div className="flex flex-col justify-center items-center text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(168,85,247,0.7)] animate-pulse" />
              <span className="text-[10px] font-mono text-violet-400/80 tracking-[0.22em] uppercase">Accumulation Detection</span>
            </div>
            <h3 className="text-[22px] md:text-[26px] font-bold text-white leading-[1.15] mb-3">
              Watch smart money{" "}
              <span className="text-violet-400">build a position.</span>
            </h3>
            <p className="text-sm text-white/55 leading-relaxed mb-4 max-w-[46ch] mx-auto">
              7 prints on META 620C in 53 minutes. From a $1.6M sweep to a $1.5M BLOCK 1M+ closer —
              the scanner flags every escalation. When RAPID badges start stacking on the same
              contract, a position is being built.
            </p>
            <div className="text-[11px] font-mono text-white/40">
              <span className="text-emerald-400 font-semibold">$8.3M</span> total · 7 prints · 53 min window
            </div>
          </div>

          {/* RIGHT — print sequence mock */}
          <div className="font-mono w-full max-w-[340px] mx-auto">
            <div className="text-[9px] text-white/25 tracking-[0.14em] uppercase mb-2 text-center">META 620C · 05/02</div>
            <div className="space-y-1.5">
              {[
                { time: "10:12", prem: "$1.6M", type: "SWEEP",     tag: "OPENING" },
                { time: "10:31", prem: "$2.1M", type: "SWEEP",     tag: "RAPID" },
                { time: "10:47", prem: "$890K", type: "BLOCK",     tag: "RAPID" },
                { time: "10:58", prem: "$1.2M", type: "SWEEP",     tag: "LARGE" },
                { time: "11:05", prem: "$1.5M", type: "BLOCK 1M+", tag: "RAPID", final: true },
              ].map((p, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between rounded-md px-2.5 py-1.5 text-[10px] border ${p.final ? "bg-violet-500/[0.08] border-violet-500/30" : "bg-white/[0.02] border-white/[0.05]"}`}
                >
                  <span className="text-white/30 w-10">{p.time}</span>
                  <span className={`font-semibold ${p.final ? "text-white" : "text-white/75"}`}>{p.prem}</span>
                  <span className="text-white/35 text-[9px]">{p.type}</span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm border tracking-wide ${
                      p.tag === "RAPID"
                        ? "text-violet-300 border-violet-500/40 bg-violet-500/10"
                        : p.tag === "LARGE"
                        ? "text-amber-300 border-amber-500/40 bg-amber-500/10"
                        : "text-white/40 border-white/10 bg-white/[0.04]"
                    }`}
                  >
                    {p.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
