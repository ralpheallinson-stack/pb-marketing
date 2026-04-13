"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const WORDS = ["SWEEPS", "BLOCKS", "UNUSUAL PRINTS", "GEX SIGNALS", "ALERTS"];

export default function DynamicBadgeText() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % WORDS.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="text-[12px] tracking-[0.2em] text-white/60"
        style={{ fontFamily: "var(--font-bebas)" }}
      >
        LIVE
      </span>
      <AnimatePresence mode="wait">
        <motion.span
          key={WORDS[index]}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="text-[12px] tracking-[0.2em] text-white/60"
          style={{ fontFamily: "var(--font-bebas)" }}
        >
          {WORDS[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
