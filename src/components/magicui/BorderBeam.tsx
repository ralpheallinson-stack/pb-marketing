"use client"
import { motion } from "framer-motion"

export function BorderBeam({ children, className = "", beamColor = "#F5820A", duration = 4 }: {
  children: React.ReactNode; className?: string; beamColor?: string; duration?: number
}) {
  return (
    <div className={`relative rounded-xl p-[1px] overflow-hidden ${className}`}>
      <motion.div className="absolute inset-0"
        style={{ background: `conic-gradient(from 0deg, transparent 0%, ${beamColor} 8%, transparent 16%)` }}
        animate={{ rotate: 360 }} transition={{ duration, repeat: Infinity, ease: "linear" }} />
      <div className="relative z-10 rounded-xl overflow-hidden">{children}</div>
    </div>
  )
}
