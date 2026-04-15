"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import FeaturesBento from "./FeaturesBento";

const tickers = [
  { sym: "NVDA",  name: "NVIDIA" },
  { sym: "TSLA",  name: "Tesla" },
  { sym: "GOOGL", name: "Alphabet" },
  { sym: "META",  name: "Meta" },
];

export default function FeaturesSection() {
  return (
    <section className="bg-[#0a0d12] py-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Tracked symbols strip */}
        <div className="mb-14">
          <p className="text-center text-[9px] font-mono text-white/20 tracking-[0.2em] uppercase mb-8">
            Tracked Symbols
          </p>
          <div className="flex items-center justify-center gap-24">
            {tickers.map((t, i) => (
              <motion.div
                key={t.sym}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08, ease: "easeOut" }}
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
                  <span className="text-[12px] font-bold text-white tracking-[0.1em] font-mono">{t.sym}</span>
                  <span className="text-[10px] text-white/35 tracking-wide">{t.name}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Section header — editorial treatment, leaves room for GEX hero-headline below */}
        <div className="mb-10">
          <div className="text-[10px] font-mono text-white/30 tracking-[0.24em] uppercase mb-3">Platform Features</div>
          <h2 className="text-[26px] md:text-3xl font-semibold text-white/90 leading-tight max-w-xl tracking-tight">
            Everything you need to trade institutional flow.
          </h2>
        </div>

        <FeaturesBento />
      </div>
    </section>
  );
}
