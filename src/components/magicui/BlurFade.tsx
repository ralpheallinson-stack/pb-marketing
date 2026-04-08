"use client"
import { motion, useInView } from "framer-motion"
import { useRef } from "react"

export function BlurFade({ children, delay = 0, duration = 0.4, className = "" }: {
  children: React.ReactNode; delay?: number; duration?: number; className?: string
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "0px" })
  return (
    <motion.div ref={ref} initial={{ opacity: 0, filter: "blur(6px)", y: 10 }}
      animate={isInView ? { opacity: 1, filter: "blur(0px)", y: 0 } : {}}
      transition={{ duration, delay, ease: [0.21, 0.47, 0.32, 0.98] }} className={className}>
      {children}
    </motion.div>
  )
}
