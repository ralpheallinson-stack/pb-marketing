"use client"

import { cn } from "@/lib/utils"

interface ShineBorderProps {
  borderWidth?: number
  color?: string | string[]
  className?: string
  children: React.ReactNode
}

export function ShineBorder({
  borderWidth = 1,
  color = "#fff",
  className,
  children,
}: ShineBorderProps) {
  const colors = Array.isArray(color) ? color.join(", ") : color

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{ padding: borderWidth }}
    >
      <div
        className="pointer-events-none absolute inset-0 animate-[shine-spin_3s_linear_infinite]"
        style={{
          background: `conic-gradient(from 0deg, transparent 0%, ${colors}, transparent 80%)`,
        }}
      />
      <div className="relative h-full w-full">{children}</div>
      <style>{`
        @keyframes shine-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
