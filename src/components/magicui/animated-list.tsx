"use client";

import { AnimatePresence, motion } from "framer-motion";
import React, { ReactElement, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export function AnimatedListItem({ children }: { children: React.ReactNode }) {
  const animations = {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1, originY: 0 },
    exit: { scale: 0, opacity: 0 },
    transition: { type: "spring" as const, stiffness: 350, damping: 40 },
  };
  return (
    <motion.div {...animations} layout className="mx-auto w-full">
      {children}
    </motion.div>
  );
}

interface AnimatedListProps {
  className?: string;
  children: React.ReactNode;
  delay?: number;
}

export function AnimatedList({ className, children, delay = 1800 }: AnimatedListProps) {
  const [index, setIndex] = useState(0);
  const childArr = useMemo(
    () => React.Children.toArray(children) as ReactElement[],
    [children]
  );

  useEffect(() => {
    const t = setInterval(() => {
      setIndex((p) => (p + 1) % childArr.length);
    }, delay);
    return () => clearInterval(t);
  }, [childArr.length, delay]);

  const items = useMemo(() => {
    const out: ReactElement[] = [];
    for (let i = 0; i < childArr.length; i++) {
      const k = (index - i + childArr.length) % childArr.length;
      out.push(childArr[k]);
    }
    return out.slice(0, 4).reverse();
  }, [index, childArr]);

  return (
    <div className={cn("flex flex-col items-center gap-2 overflow-hidden", className)}>
      <AnimatePresence>
        {items.map((item) => (
          <AnimatedListItem key={(item as ReactElement & { key?: string }).key}>
            {item}
          </AnimatedListItem>
        ))}
      </AnimatePresence>
    </div>
  );
}
