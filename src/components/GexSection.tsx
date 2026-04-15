"use client";
import Image from "next/image";
import { motion } from "framer-motion";

export default function GexSection() {
  return (
    <section className="relative bg-[#0a0d12] py-24 px-6 overflow-hidden">
      {/* Section-wide atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_15%_20%,rgba(16,185,129,0.08),transparent_55%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_85%_80%,rgba(251,191,36,0.04),transparent_50%)] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto">
        {/* Copy block — breaks grid, not symmetric */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-14 items-end">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="lg:col-span-7"
          >
            <div className="flex items-center gap-2 mb-5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.7)]" />
              <span className="text-[10px] font-mono text-emerald-400/80 tracking-[0.24em] uppercase">
                Dealer Positioning
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.05] tracking-tight mb-5">
              See the walls<br />
              <span className="text-emerald-400">before price hits them.</span>
            </h2>
            <p className="text-white/55 text-lg leading-[1.6] max-w-[52ch]">
              Dealer gamma exposure maps every strike that matters — where market
              makers must buy, where they must sell, and where price gets pinned.
              Institutions use it. Retail doesn&apos;t. Until now.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="lg:col-span-5 lg:pb-2"
          >
            <div className="flex flex-col items-start lg:items-end gap-3">
              <a
                href="#pricing"
                className="inline-flex items-center gap-2 bg-white text-[#0a0d12] text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-white/90 transition-colors"
              >
                Unlock GEX Heatmap
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" /></svg>
              </a>
              <span className="text-[11px] font-mono text-amber-400/70 tracking-[0.12em] uppercase">
                Pro plan · 20 symbols live
              </span>
            </div>
          </motion.div>
        </div>

        {/* Image banner */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="rounded-3xl relative overflow-hidden"
          style={{ background: "linear-gradient(145deg, #0a1a12 0%, #0a1220 40%, #0d1420 100%)" }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_30%,rgba(16,185,129,0.12),transparent_50%)] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_75%,rgba(16,185,129,0.06),transparent_45%)] pointer-events-none" />

          <div className="relative m-12 min-h-[420px]">
            <div className="absolute inset-0 rounded-2xl border border-white/[0.06] bg-[rgba(22,27,36,0.5)]" />

            <div className="absolute top-8 bottom-8 left-[10%] right-[10%] rounded-2xl border border-white/10 overflow-hidden bg-[#161B24] shadow-[0_20px_60px_rgba(0,0,0,0.5)] z-10">
              <Image
                src="/images/gex-heatmap.png"
                alt="GEX Heatmap — live dealer gamma exposure"
                fill
                className="object-cover"
                style={{ objectPosition: "center top" }}
                sizes="70vw"
              />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.35)_100%)] pointer-events-none" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.08),transparent_60%)] pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 h-[80px] bg-gradient-to-t from-[#161B24] to-transparent pointer-events-none" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
