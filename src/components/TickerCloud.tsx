"use client";
import { IconCloud } from "@/components/magicui/icon-cloud";

const TOKEN = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN;

const tickers = [
  "NVDA","TSLA","AAPL","META","MSFT","AMZN","GOOGL","AMD",
  "SPY","QQQ","PLTR","COIN","JPM","BAC","NFLX","CRM",
];

const images = tickers.map(
  (t) => `https://img.logo.dev/ticker/${t}?token=${TOKEN}&size=64&retina=true`,
);

export default function TickerCloud() {
  return (
    <div className="w-full border-t border-white/[0.05] flex flex-col items-center">
      <p className="text-[9px] font-mono text-white/20 tracking-[0.2em] uppercase mt-10">
        Tracked Symbols
      </p>
      <div className="w-full flex justify-center items-center py-10">
        <div className="relative w-[500px] h-[300px] overflow-hidden">
          <IconCloud images={images} />
        </div>
      </div>
    </div>
  );
}
