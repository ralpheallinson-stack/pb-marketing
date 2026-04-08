"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const WobbleCard = ({
  children,
  containerClassName,
  className,
}: {
  children: React.ReactNode;
  containerClassName?: string;
  className?: string;
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePosition({ x, y });
  };

  return (
    <motion.section
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => { setIsHovering(false); setMousePosition({ x: 0, y: 0 }); }}
      style={{ perspective: "1000px" }}
      className={cn("relative rounded-2xl overflow-hidden", containerClassName)}
    >
      <motion.div
        animate={isHovering
          ? { rotateX: mousePosition.y * -10, rotateY: mousePosition.x * 10, scale: 1.02 }
          : { rotateX: 0, rotateY: 0, scale: 1 }
        }
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn("relative w-full h-full", className)}
      >
        {children}
      </motion.div>
    </motion.section>
  );
};
