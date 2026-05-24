"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { IconX } from "@tabler/icons-react";
import { CarouselContext } from "@/components/ui/apple-cards-carousel";
import { useOutsideClick } from "@/hooks/use-outside-click";

export type SignalTheme =
  | "nvda" | "riot" | "iwm" | "tsla"
  | "meta" | "amd" | "aapl" | "coin";

export interface Signal {
  theme: SignalTheme;
  grade: "A" | "B";
  direction: "BULLISH" | "BEARISH";
  ticker: string;
  side: "CALLS" | "PUTS";
  strike: string;
  title: string;
  subtitle: string;
  spot: string;
  paid: string;
  size: string;
  delta: string;
  iv: string;
  volOi: string;
  time: string;
  thesis: string;
  pnl: string;
  strokeColor: string;
}

const themeGradient: Record<SignalTheme, string> = {
  nvda: "linear-gradient(180deg, #052e16 0%, #14532d 50%, #0a0d12 100%)",
  riot: "linear-gradient(180deg, #422006 0%, #78350f 50%, #0a0d12 100%)",
  iwm:  "linear-gradient(180deg, #450a0a 0%, #7f1d1d 50%, #0a0d12 100%)",
  tsla: "linear-gradient(180deg, #0c4a6e 0%, #075985 50%, #0a0d12 100%)",
  meta: "linear-gradient(180deg, #1e1b4b 0%, #312e81 50%, #0a0d12 100%)",
  amd:  "linear-gradient(180deg, #064e3b 0%, #065f46 50%, #0a0d12 100%)",
  aapl: "linear-gradient(180deg, #44403c 0%, #57534e 50%, #0a0d12 100%)",
  coin: "linear-gradient(180deg, #1e3a8a 0%, #1e40af 50%, #0a0d12 100%)",
};

function makeSparklinePath(seed: number, isUp: boolean): string {
  const pts: string[] = [];
  let y = 50;
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  for (let i = 0; i <= 30; i++) {
    y += (rand() - (isUp ? 0.3 : 0.7)) * 8;
    y = Math.max(10, Math.min(90, y));
    pts.push(`${(i / 30) * 100},${y}`);
  }
  return `M${pts.join(" L")}`;
}

export function SignalCard({ signal, index }: { signal: Signal; index: number }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { onCardClose } = useContext(CarouselContext);
  const isBull = signal.direction === "BULLISH";
  const isLoss = signal.pnl.startsWith("-");
  const sparklinePath = makeSparklinePath(
    signal.ticker.charCodeAt(0) + signal.ticker.charCodeAt(1),
    isBull
  );

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") handleClose();
    }
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useOutsideClick(containerRef, () => handleClose());

  const handleClose = () => {
    setOpen(false);
    onCardClose(index);
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 h-screen overflow-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 h-full w-full bg-black/85 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              ref={containerRef}
              layoutId={`card-${signal.ticker}-${index}`}
              className="relative z-[60] mx-auto my-10 h-fit w-[min(900px,92vw)] overflow-hidden rounded-3xl bg-[#0E1117]"
            >
              {/* Hero — same gradient as card */}
              <div
                className="relative px-8 pt-16 pb-10 md:px-16 md:pt-20 md:pb-12"
                style={{ background: themeGradient[signal.theme] }}
              >
                <button
                  onClick={handleClose}
                  className="absolute top-5 right-5 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/80"
                  aria-label="Close"
                >
                  <IconX className="h-5 w-5" />
                </button>
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center select-none">
                  <span className="font-sans text-[160px] md:text-[240px] font-extrabold tracking-tight text-white/[0.07] leading-none">
                    {signal.ticker}
                  </span>
                </div>
                <div className="relative">
                  <p className="font-mono text-[11px] md:text-[13px] tracking-[0.22em] text-white/70 uppercase mb-3">
                    Grade {signal.grade} · {signal.direction} · {signal.time}
                  </p>
                  <h3 className="text-3xl md:text-5xl font-bold tracking-tight text-white leading-[1.05]">
                    {signal.title}
                  </h3>
                </div>
              </div>

              {/* Body */}
              <div className="px-8 py-10 md:px-16 md:py-12">
                <p className="text-white/85 text-base md:text-lg leading-relaxed mb-9 max-w-3xl">
                  <span className="float-left mr-3 font-bold text-[#22c55e] text-5xl md:text-6xl leading-none mt-1">
                    {signal.thesis.charAt(0)}
                  </span>
                  {signal.thesis.slice(1)}
                </p>

                <div className="grid grid-cols-3 gap-3 mb-8">
                  {[
                    ["Spot", signal.spot],
                    ["Paid", signal.paid],
                    ["Size", signal.size],
                    ["Delta", signal.delta],
                    ["IV", signal.iv],
                    ["Vol/OI", signal.volOi],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-xl border border-[#252E3D] bg-white/[0.03] p-4"
                    >
                      <div className="font-mono text-[10px] tracking-[0.22em] text-white/40 uppercase mb-1.5">
                        {label}
                      </div>
                      <div className="font-mono text-lg md:text-xl font-semibold text-white">
                        {value}
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  className={
                    "rounded-2xl p-5 flex items-center justify-between mb-6 border " +
                    (isLoss
                      ? "bg-red-500/10 border-red-500/30"
                      : "bg-green-500/10 border-green-500/30")
                  }
                >
                  <span className="font-mono text-[11px] tracking-[0.18em] text-white/60 uppercase">
                    Outcome · 30d
                  </span>
                  <span
                    className={
                      "font-mono text-2xl md:text-3xl font-bold " +
                      (isLoss ? "text-red-400" : "text-[#22c55e]")
                    }
                  >
                    {signal.pnl}
                  </span>
                </div>

                <a
                  href="/methodology"
                  className="inline-flex items-center gap-2 text-[#60a5fa] hover:text-white text-sm font-semibold"
                >
                  View on /methodology →
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <motion.button
        layoutId={`card-${signal.ticker}-${index}`}
        onClick={() => setOpen(true)}
        className="relative z-10 flex h-80 md:h-[28rem] w-56 md:w-80 flex-col items-start justify-between overflow-hidden rounded-3xl text-left shadow-[0_20px_60px_rgba(0,0,0,0.4)] hover:scale-[1.02] transition-transform duration-300"
        style={{ background: themeGradient[signal.theme] }}
      >
        {/* Big ghosted ticker */}
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center font-sans text-[100px] md:text-[140px] font-extrabold tracking-tight text-white/[0.08] leading-none -translate-y-4 select-none">
          {signal.ticker}
        </span>

        {/* Sparkline */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-x-0 bottom-[35%] h-20 opacity-50"
        >
          <path d={sparklinePath} stroke={signal.strokeColor} strokeWidth={2} fill="none" />
        </svg>

        {/* Top label + pnl chip */}
        <div className="relative z-20 p-6 md:p-7 w-full flex items-start justify-between gap-2">
          <span className="font-mono text-[10px] md:text-[11px] tracking-[0.22em] text-white/70 uppercase">
            Grade {signal.grade} · {signal.direction}
          </span>
          <span className="font-mono text-sm md:text-base font-bold text-white tracking-tight">
            {signal.pnl}
          </span>
        </div>

        {/* Bottom title */}
        <div className="relative z-20 p-6 md:p-7 w-full">
          <h3 className="text-xl md:text-[26px] font-bold text-white leading-[1.1] tracking-tight mb-1.5 [text-wrap:balance]">
            {signal.title}
          </h3>
          <p className="text-sm text-white/70 leading-snug">
            {signal.subtitle}
          </p>
        </div>
      </motion.button>
    </>
  );
}
