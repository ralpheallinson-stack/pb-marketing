"use client";

import { motion } from "framer-motion";
import { useState } from "react";

type HeatRowVariant = "spot" | "spot-strong" | "wall-call" | "wall-put" | "zero-gamma" | null;
type HeatCell = { value: string; variant: "low" | "mid" | "hi" | "neg" | "neutral"; align?: "right" | "left" };
type HeatRow = { strike: string; cells: HeatCell[]; variant?: HeatRowVariant };

const PANEL0_HEADERS = ["Today", "04/15", "04/16", "04/17", "04/20"];
const PANEL0_ROWS: HeatRow[] = [
  { strike: "700", variant: "wall-call", cells: [
    { value: "$3.8B", variant: "hi" },
    { value: "$3.7B", variant: "mid" },
    { value: "$4.4B", variant: "mid" },
    { value: "$41.7B", variant: "hi" },
    { value: "$10.8B", variant: "mid" },
  ]},
  { strike: "698", cells: [
    { value: "$539M", variant: "mid" },
    { value: "$839M", variant: "mid" },
    { value: "$382M", variant: "mid" },
    { value: "$3.8B", variant: "mid" },
    { value: "$625M", variant: "mid" },
  ]},
  { strike: "695", cells: [
    { value: "$5.0B", variant: "low" },
    { value: "$3.3B", variant: "low" },
    { value: "$3.0B", variant: "low" },
    { value: "$41.7B", variant: "hi" },
    { value: "$10.8B", variant: "mid" },
  ]},
  { strike: "694", variant: "spot", cells: [
    { value: "$1.4B", variant: "low" },
    { value: "$855M", variant: "low" },
    { value: "$342M", variant: "low" },
    { value: "$13.6B", variant: "mid" },
    { value: "$1.2B", variant: "low" },
  ]},
  { strike: "692", cells: [
    { value: "$2.1B", variant: "low" },
    { value: "$967M", variant: "mid" },
    { value: "$801M", variant: "mid" },
    { value: "$12.9B", variant: "mid" },
    { value: "$2.0B", variant: "low" },
  ]},
  { strike: "690", variant: "wall-put", cells: [
    { value: "$9.5B", variant: "hi" },
    { value: "$17.5B", variant: "hi" },
    { value: "$5.5B", variant: "mid" },
    { value: "$39.0B", variant: "hi" },
    { value: "$2.6B", variant: "mid" },
  ]},
  { strike: "685", cells: [
    { value: "$4.9B", variant: "low" },
    { value: "$1.4B", variant: "low" },
    { value: "$1.9B", variant: "low" },
    { value: "$23.5B", variant: "mid" },
    { value: "$2.0B", variant: "low" },
  ]},
  { strike: "681", cells: [
    { value: "$825M", variant: "low" },
    { value: "$150M", variant: "low" },
    { value: "$703M", variant: "low" },
    { value: "$2.6B", variant: "low" },
    { value: "$396M", variant: "low" },
  ]},
];

const PANEL1_HEADERS = ["Net γ", "Δ", "04/16", "04/17", "04/20"];
const PANEL1_ROWS: HeatRow[] = [
  { strike: "700", cells: [
    { value: "+$3.8B", variant: "hi" },
    { value: "+0.8%", variant: "mid" },
    { value: "$4.4B", variant: "mid" },
    { value: "$41.7B", variant: "hi" },
    { value: "$10.8B", variant: "mid" },
  ]},
  { strike: "695", cells: [
    { value: "+$1.2B", variant: "mid" },
    { value: "+0.2%", variant: "low" },
    { value: "$3.0B", variant: "low" },
    { value: "$41.7B", variant: "hi" },
    { value: "$10.8B", variant: "mid" },
  ]},
  { strike: "694", variant: "spot", cells: [
    { value: "+$420M", variant: "low" },
    { value: "+0.05%", variant: "low" },
    { value: "$342M", variant: "low" },
    { value: "$13.6B", variant: "mid" },
    { value: "$1.2B", variant: "low" },
  ]},
  { strike: "688", cells: [
    { value: "+$210M", variant: "low" },
    { value: "+0.03%", variant: "low" },
    { value: "$801M", variant: "low" },
    { value: "$12.9B", variant: "mid" },
    { value: "$2.0B", variant: "low" },
  ]},
  { strike: "684", cells: [
    { value: "+$80M", variant: "low" },
    { value: "+0.01%", variant: "low" },
    { value: "$519M", variant: "low" },
    { value: "$13.9B", variant: "mid" },
    { value: "$2.3B", variant: "low" },
  ]},
  { strike: "679", variant: "zero-gamma", cells: [
    { value: "ZERO γ", variant: "neutral" },
    { value: "flip", variant: "neutral" },
    { value: "—", variant: "neutral" },
    { value: "—", variant: "neutral" },
    { value: "—", variant: "neutral" },
  ]},
  { strike: "675", cells: [
    { value: "-$1.1B", variant: "neg" },
    { value: "-0.2%", variant: "neg" },
    { value: "$2.4B", variant: "low" },
    { value: "$18.2B", variant: "mid" },
    { value: "$1.6B", variant: "low" },
  ]},
  { strike: "670", cells: [
    { value: "-$2.3B", variant: "neg" },
    { value: "-0.4%", variant: "neg" },
    { value: "$1.9B", variant: "low" },
    { value: "$23.5B", variant: "mid" },
    { value: "$2.0B", variant: "low" },
  ]},
  { strike: "660", cells: [
    { value: "-$5.7B", variant: "neg" },
    { value: "-1.1%", variant: "neg" },
    { value: "$703M", variant: "low" },
    { value: "$2.6B", variant: "low" },
    { value: "$396M", variant: "low" },
  ]},
];

const PANEL2_HEADERS = ["Today", "04/15", "04/16", "04/17", "04/20"];
const PANEL2_ROWS: HeatRow[] = [
  { strike: "700", cells: [
    { value: "$3.8B", variant: "hi" },
    { value: "$3.7B", variant: "mid" },
    { value: "$4.4B", variant: "mid" },
    { value: "$41.7B", variant: "hi" },
    { value: "$10.8B", variant: "mid" },
  ]},
  { strike: "695", cells: [
    { value: "$5.0B", variant: "low" },
    { value: "$3.3B", variant: "low" },
    { value: "$3.0B", variant: "low" },
    { value: "$41.7B", variant: "hi" },
    { value: "$10.8B", variant: "mid" },
  ]},
  { strike: "694", variant: "spot-strong", cells: [
    { value: "$1.4B", variant: "low" },
    { value: "$855M", variant: "low" },
    { value: "$342M", variant: "low" },
    { value: "$13.6B", variant: "mid" },
    { value: "$1.2B", variant: "low" },
  ]},
  { strike: "692", cells: [
    { value: "$2.1B", variant: "low" },
    { value: "$967M", variant: "mid" },
    { value: "$801M", variant: "mid" },
    { value: "$12.9B", variant: "mid" },
    { value: "$2.0B", variant: "low" },
  ]},
  { strike: "690", cells: [
    { value: "$9.5B", variant: "hi" },
    { value: "$17.5B", variant: "hi" },
    { value: "$5.5B", variant: "mid" },
    { value: "$39.0B", variant: "hi" },
    { value: "$2.6B", variant: "mid" },
  ]},
  { strike: "685", cells: [
    { value: "$4.9B", variant: "low" },
    { value: "$1.4B", variant: "low" },
    { value: "$1.9B", variant: "low" },
    { value: "$23.5B", variant: "mid" },
    { value: "$2.0B", variant: "low" },
  ]},
  { strike: "681", cells: [
    { value: "$825M", variant: "low" },
    { value: "$150M", variant: "low" },
    { value: "$703M", variant: "low" },
    { value: "$2.6B", variant: "low" },
    { value: "$396M", variant: "low" },
  ]},
];

const SYMBOLS: { sym: string; gex: string; active?: boolean }[] = [
  { sym: "SPY",   gex: "+441.1B", active: true },
  { sym: "QQQ",   gex: "+218.4B" },
  { sym: "NVDA",  gex: "+89.2B" },
  { sym: "TSLA",  gex: "+34.8B" },
  { sym: "AAPL",  gex: "+72.1B" },
  { sym: "META",  gex: "+44.6B" },
  { sym: "AMD",   gex: "+28.3B" },
  { sym: "MSFT",  gex: "+91.5B" },
  { sym: "GOOGL", gex: "+38.9B" },
  { sym: "AMZN",  gex: "+52.7B" },
  { sym: "RIOT",  gex: "+0.8B" },
  { sym: "COIN",  gex: "+4.2B" },
  { sym: "IWM",   gex: "+12.6B" },
  { sym: "DIA",   gex: "+18.1B" },
  { sym: "+206",  gex: "more" },
];

const ACCORDION_ITEMS = [
  {
    title: "Call walls & put walls",
    body: "The largest dealer gamma concentrations on the chain. Call walls are where market makers must sell into rallies — they cap upside. Put walls are where they must buy into selloffs — they catch downside. Price magnetizes between them.",
    meta: ["SPY Call Wall · 700", "SPY Put Wall · 690"],
  },
  {
    title: "Zero gamma flip",
    body: "The strike where dealer hedging flips from suppressing volatility to amplifying it. Below zero gamma, every move accelerates — sellers force more selling. Above it, the market is pinned. Knowing where it sits today is the single most important number on the board.",
    meta: ["Zero γ · 679", "Spot · 694.29"],
  },
  {
    title: "Live spot tracking",
    body: "The heatmap follows the underlying tick by tick. Watch price walk into a wall and see real-time how dealers respond. Spot row highlighted, time-to-wall countdown, alerts when price comes within striking distance.",
    meta: ["Refresh 5s", "Alerts · Discord · Telegram"],
  },
  {
    title: "220 symbols, live",
    body: "Every name with meaningful options volume. SPY, QQQ, NVDA, TSLA, AAPL, RIOT, COIN — and 213 more. Switch in one click, no recomputation, instant.",
    meta: ["220 symbols", "Pro plan"],
  },
];

function cellClass(variant: HeatCell["variant"]) {
  switch (variant) {
    case "low": return "bg-[rgba(96,165,250,0.04)]";
    case "mid": return "bg-[rgba(96,165,250,0.14)]";
    case "hi":  return "bg-[rgba(96,165,250,0.32)] text-white";
    case "neg": return "bg-[rgba(220,38,38,0.18)] text-[#fca5a5]";
    default:    return "";
  }
}

function rowClass(variant?: HeatRowVariant) {
  if (variant === "spot") return "text-white font-semibold bg-[rgba(96,165,250,0.08)] rounded -mx-1.5 pl-1.5";
  if (variant === "spot-strong") return "text-white font-bold bg-[rgba(96,165,250,0.18)] border border-[rgba(96,165,250,0.5)] rounded-md -mx-1.5 px-1.5 py-2 my-0.5 shadow-[0_0_18px_rgba(96,165,250,0.18)]";
  if (variant === "wall-call") return "text-white font-bold bg-[rgba(96,165,250,0.12)] border-l-[3px] border-[#60a5fa] py-2 px-1.5 my-0.5 rounded-r-md shadow-[0_0_14px_rgba(96,165,250,0.15)]";
  if (variant === "wall-put") return "text-white font-bold bg-[rgba(220,38,38,0.12)] border-l-[3px] border-[#DC2626] py-2 px-1.5 my-0.5 rounded-r-md shadow-[0_0_14px_rgba(220,38,38,0.15)]";
  if (variant === "zero-gamma") return "bg-[rgba(251,191,36,0.14)] py-1.5 px-1.5 -mx-1.5 my-1";
  return "";
}

function HeatTable({ headers, rows }: { headers: string[]; rows: HeatRow[] }) {
  return (
    <div className="flex-1 flex flex-col px-6 py-5 font-mono text-xs">
      <div className="grid grid-cols-[60px_1fr_1fr_1fr_1fr_1fr] gap-2 pb-2.5 mb-1 border-b border-white/[0.06] text-[10px] tracking-[0.18em] uppercase text-white/35 flex-none">
        <span>Strike</span>
        {headers.map((h) => (
          <span key={h} className="text-right">{h}</span>
        ))}
      </div>
      {rows.map((row) => (
        <div
          key={row.strike}
          className={`grid grid-cols-[60px_1fr_1fr_1fr_1fr_1fr] gap-2 py-2.5 items-center text-white/60 flex-1 ${rowClass(row.variant)}`}
        >
          <span className={`font-semibold ${row.variant === "zero-gamma" ? "text-[#fbbf24]" : ""}`}>
            {row.strike}
          </span>
          {row.cells.map((c, i) => (
            <span
              key={i}
              className={`px-1.5 py-0.5 rounded text-right ${cellClass(c.variant)} ${row.variant === "zero-gamma" && i === 0 ? "text-[#fbbf24] font-bold" : ""} ${row.variant === "zero-gamma" && i > 0 && c.value === "—" ? "text-[rgba(251,191,36,0.5)]" : ""} ${row.variant === "zero-gamma" && (c.value === "ZERO γ" || c.value === "flip") ? "text-[#fbbf24]" : ""}`}
            >
              {c.value}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

function PanelHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06] font-mono text-[11px] tracking-[0.16em] uppercase text-white/50 flex-none">
      <span>{children}</span>
    </div>
  );
}

export default function GexSection() {
  const [active, setActive] = useState(0);

  return (
    <section
      className="relative bg-[#0a0d12] py-24 px-6 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_15%_20%,rgba(96,165,250,0.08),transparent_55%)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        {/* Headline block */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-16 max-w-3xl"
        >
          <div className="flex items-center gap-2 mb-5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#60a5fa] shadow-[0_0_10px_rgba(96,165,250,0.6)]" />
            <span className="text-[11px] font-mono text-[#60a5fa] tracking-[0.24em] uppercase">
              Dealer Positioning
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.05] tracking-tight mb-5">
            See the walls<br />
            <span className="text-[#60a5fa]">before price hits them.</span>
          </h2>
          <p className="text-white/55 text-lg leading-[1.6] max-w-[52ch]">
            Dealer gamma exposure maps every strike that matters — where market
            makers must buy, where they must sell, and where price gets pinned.
            Institutions use it. Retail doesn&apos;t. Until now.
          </p>
        </motion.div>

        {/* Two-column accordion + visual */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-10 lg:gap-16 items-center"
        >
          {/* LEFT: accordion */}
          <div>
            {ACCORDION_ITEMS.map((item, i) => {
              const isOpen = active === i;
              return (
                <div
                  key={item.title}
                  className={`border-t border-white/10 ${i === ACCORDION_ITEMS.length - 1 ? "border-b" : ""}`}
                >
                  <button
                    type="button"
                    onClick={() => setActive(isOpen ? -1 : i)}
                    className="w-full flex items-center justify-between py-7 text-left cursor-pointer group"
                    aria-expanded={isOpen}
                  >
                    <h3 className={`text-2xl md:text-[28px] font-bold tracking-tight transition-colors duration-300 ${isOpen ? "text-white" : "text-white/40 group-hover:text-white/70"}`}>
                      {item.title}
                    </h3>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      className={`w-5 h-5 flex-shrink-0 transition-transform duration-400 ${isOpen ? "rotate-180 text-white" : "text-white/50"}`}
                      style={{ transitionTimingFunction: "cubic-bezier(0.4,0,0.2,1)" }}
                    >
                      <polyline points="18 9 12 15 6 9" />
                    </svg>
                  </button>
                  <div
                    className="overflow-hidden transition-[max-height] duration-[450ms]"
                    style={{
                      maxHeight: isOpen ? 400 : 0,
                      transitionTimingFunction: "cubic-bezier(0.4,0,0.2,1)",
                    }}
                  >
                    <div className="pb-7">
                      <p className="text-white/65 text-base leading-relaxed max-w-[480px]">
                        {item.body}
                      </p>
                      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-5 font-mono text-[11px] tracking-[0.18em] uppercase text-white/40">
                        {item.meta.map((m) => (
                          <span key={m}>{m}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT: visual panels */}
          <div className="relative aspect-[5/6] min-h-[620px] max-lg:min-h-[520px] max-lg:aspect-[4/5]">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`absolute inset-0 rounded-[18px] bg-[#161B24] border border-white/[0.08] overflow-hidden flex flex-col shadow-[0_30px_80px_rgba(0,0,0,0.5)] transition-all duration-500 ${active === i ? "opacity-100 scale-100" : "opacity-0 scale-[0.96] pointer-events-none"}`}
                style={{ transitionTimingFunction: "cubic-bezier(0.2,0.8,0.2,1)" }}
              >
                {i === 0 && (
                  <>
                    <PanelHeader>SPY · GEX</PanelHeader>
                    <HeatTable headers={PANEL0_HEADERS} rows={PANEL0_ROWS} />
                  </>
                )}
                {i === 1 && (
                  <>
                    <PanelHeader>SPY · NET GEX</PanelHeader>
                    <HeatTable headers={PANEL1_HEADERS} rows={PANEL1_ROWS} />
                  </>
                )}
                {i === 2 && (
                  <>
                    <PanelHeader>SPY · SPOT 694.29 · 0.86 to Call Wall</PanelHeader>
                    <HeatTable headers={PANEL2_HEADERS} rows={PANEL2_ROWS} />
                  </>
                )}
                {i === 3 && (
                  <>
                    <PanelHeader>Symbol Universe · 220 live</PanelHeader>
                    <div className="flex-1 grid grid-cols-5 gap-3 p-6 content-start font-mono text-[11px]">
                      {SYMBOLS.map((s) => (
                        <div
                          key={s.sym}
                          className={`rounded-lg border p-4 text-center ${s.active ? "bg-[rgba(96,165,250,0.12)] border-[rgba(96,165,250,0.4)] text-white" : "bg-white/[0.04] border-white/[0.08] text-white/70"}`}
                        >
                          <div className="font-bold">{s.sym}</div>
                          <div className="text-[9px] text-white/40 mt-0.5">{s.gex}</div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
