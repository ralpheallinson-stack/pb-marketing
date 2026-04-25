"use client";

import { Carousel } from "@/components/ui/apple-cards-carousel";
import { SignalCard, type Signal } from "./SignalCard";

const FEATURED_SIGNALS: Signal[] = [
  {
    theme: "nvda", grade: "A", direction: "BULLISH",
    ticker: "NVDA", side: "CALLS", strike: "$177.50",
    title: "$170K sweep into AI capex",
    subtitle: "NVDA CALLS $177.50 · 1,036 cts",
    spot: "$177.28", paid: "$1.75", size: "1,036 cts",
    delta: "0.49", iv: "34%", volOi: "7.2×",
    time: "15:03 ET · Apr 24",
    thesis: "Five fills across 3 exchanges, all bought at the ask. 7× vol/oi on near-the-money calls — a clear accumulation signature, not a hedge. Smart money positioning ahead of next quarter's hyperscaler capex commentary, with no offsetting flow elsewhere on the chain. We graded it A on conviction and shipped within 1.4 seconds of the print.",
    pnl: "+38.2%", strokeColor: "#22c55e",
  },
  {
    theme: "riot", grade: "A", direction: "BULLISH",
    ticker: "RIOT", side: "CALLS", strike: "$16",
    title: "61× vol/oi miner sweep",
    subtitle: "RIOT CALLS $16 · 2,996 cts",
    spot: "$13.62", paid: "$0.175", size: "2,996 cts",
    delta: "0.33", iv: "86%", volOi: "61×",
    time: "14:41 ET · Apr 24",
    thesis: "Aggressive 61× vol/oi sweep on short-dated OTM calls — third hit on this strike intraday. Persistent buying pressure across multiple exchanges, all on the offer side. BTC correlation in play and the chain showed no put-side hedging.",
    pnl: "+124%", strokeColor: "#fbbf24",
  },
  {
    theme: "iwm", grade: "B", direction: "BEARISH",
    ticker: "IWM", side: "PUTS", strike: "$239",
    title: "Small-cap breakdown hedge",
    subtitle: "IWM PUTS $239 · 977 cts",
    spot: "$252.44", paid: "$4.36", size: "977 cts",
    delta: "0.07", iv: "31%", volOi: "14.6×",
    time: "13:18 ET · Apr 24",
    thesis: "Deep OTM puts swept above the bid. Could be hedge or directional bear conviction — 14× vol/oi elevated. Watching for follow-through on the small-cap technical breakdown but graded B on lower volume.",
    pnl: "-12%", strokeColor: "#f87171",
  },
  {
    theme: "tsla", grade: "A", direction: "BULLISH",
    ticker: "TSLA", side: "CALLS", strike: "$355",
    title: "$130K ITM block on Q2 catalyst",
    subtitle: "TSLA CALLS $355 · 62 cts",
    spot: "$351.44", paid: "$20.95", size: "62 cts",
    delta: "0.52", iv: "46%", volOi: "3.5×",
    time: "12:52 ET · Apr 24",
    thesis: "ITM call sweep totaling $130K premium. Delta 0.52 — pure directional, not hedging. Smart money positioning into Q2 delivery numbers with the strike priced for momentum follow-through.",
    pnl: "+47%", strokeColor: "#38bdf8",
  },
  {
    theme: "meta", grade: "A", direction: "BULLISH",
    ticker: "META", side: "CALLS", strike: "$580",
    title: "9× vol/oi block at the offer",
    subtitle: "META CALLS $580 · 1,200 cts",
    spot: "$571.20", paid: "$8.40", size: "1,200 cts",
    delta: "0.41", iv: "29%", volOi: "9.1×",
    time: "11:22 ET · Apr 24",
    thesis: "Block print at the offer on a name that rarely sees this kind of single-print volume. 9× vol/oi suggests informed positioning — likely tied to Reality Labs roadmap and ad targeting tailwinds.",
    pnl: "+22%", strokeColor: "#a78bfa",
  },
  {
    theme: "amd", grade: "A", direction: "BULLISH",
    ticker: "AMD", side: "CALLS", strike: "$160",
    title: "$670K multi-leg accumulation",
    subtitle: "AMD CALLS $160 · 2,100 cts",
    spot: "$152.18", paid: "$3.20", size: "2,100 cts",
    delta: "0.37", iv: "52%", volOi: "12.4×",
    time: "10:51 ET · Apr 24",
    thesis: "Multi-leg sweep across 3 strikes totaling $670K premium. Aggressive call-side accumulation 30 days out. AI capex tailwind back in play and dealer gamma supportive at this strike.",
    pnl: "+55%", strokeColor: "#34d399",
  },
  {
    theme: "aapl", grade: "A", direction: "BEARISH",
    ticker: "AAPL", side: "PUTS", strike: "$220",
    title: "Unusual ATM put activity",
    subtitle: "AAPL PUTS $220 · 1,800 cts",
    spot: "$224.90", paid: "$2.85", size: "1,800 cts",
    delta: "0.31", iv: "24%", volOi: "8.7×",
    time: "09:48 ET · Apr 24",
    thesis: "8.7× vol/oi on near-the-money puts. Possibly hedging into iPhone cycle uncertainty — IV ranking in the bottom decile, so positioning is cheap. Watching for confirmation on the chain.",
    pnl: "+18%", strokeColor: "#e7e5e4",
  },
  {
    theme: "coin", grade: "A", direction: "BULLISH",
    ticker: "COIN", side: "CALLS", strike: "$280",
    title: "BTC-correlated $500K sweep",
    subtitle: "COIN CALLS $280 · 880 cts",
    spot: "$258.30", paid: "$5.70", size: "880 cts",
    delta: "0.39", iv: "78%", volOi: "5.8×",
    time: "09:35 ET · Apr 24",
    thesis: "Sweep at the ask, BTC correlation in play. $500K premium — crypto-leveraged equity playing the next leg up with asymmetric payoff. Strike sits just above near-term resistance.",
    pnl: "+89%", strokeColor: "#60a5fa",
  },
];

export default function TrackRecord() {
  const items = FEATURED_SIGNALS.map((signal, index) => (
    <SignalCard key={`${signal.ticker}-${index}`} signal={signal} index={index} />
  ));

  return (
    <section
      className="relative bg-[#0E1117] w-full py-24"
      style={{
        backgroundImage:
          "radial-gradient(ellipse 60% 50% at 30% 50%, rgba(34,197,94,0.06), transparent)",
      }}
    >
      <div className="h-px bg-gradient-to-r from-transparent via-[#60a5fa]/20 to-transparent mb-16" />

      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="flex items-center gap-2 mb-8">
          <div className="h-px w-8 bg-[#60a5fa]" />
          <span className="text-[#60a5fa] text-xs font-semibold tracking-[0.2em] uppercase">
            Track Record
          </span>
        </div>

        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 tracking-tight">
          Real alerts.<br />
          Real outcomes.<br />
          All public.
        </h2>

        <p className="text-white/55 text-lg leading-relaxed max-w-2xl mb-2">
          Every signal we send is logged the moment it fires — ticker, premium,
          grade, result. We publish everything. Tap any card to see the full
          thesis and outcome.
        </p>
      </div>

      <Carousel items={items} />

      <div className="max-w-7xl mx-auto px-6 md:px-10 mt-4">
        <a
          href="/results"
          className="text-[#60a5fa] hover:text-white text-sm font-semibold transition-colors duration-200"
        >
          See every published result →
        </a>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mt-24" />
    </section>
  );
}
