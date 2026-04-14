"use client";
import Image from "next/image";

const tickers = [
  { sym: "NVDA", name: "NVIDIA" },
  { sym: "TSLA", name: "Tesla" },
  { sym: "SPY",  name: "S&P 500 ETF" },
  { sym: "AAPL", name: "Apple" },
];

export default function TickerRow() {
  return (
    <div className="w-full py-10 border-t border-b border-white/[0.05]">
      <div className="flex items-center justify-center gap-24">
        {tickers.map((t) => (
          <div
            key={t.sym}
            className="flex flex-col items-center gap-3 hover:-translate-y-1 transition-transform duration-200 cursor-default"
          >
            <Image
              src={`https://img.logo.dev/ticker/${t.sym}?token=${process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN}&size=48&retina=true`}
              alt={t.sym}
              width={48}
              height={48}
              className="rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.3)]"
              unoptimized
            />
            <div className="flex flex-col items-center gap-1">
              <span className="text-[12px] font-bold text-white tracking-[0.1em] font-mono">
                {t.sym}
              </span>
              <span className="text-[10px] text-white/40 tracking-wide">
                {t.name}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
