// Tremor Raw TextInput [v1.0.0] — Tailwind v4 / React 19 compatible.
// PB palette: surface bg, cyan focus ring.
"use client"

import React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, forwardedRef) => (
  <input
    ref={forwardedRef}
    type={type}
    className={cn(
      "w-full rounded-md border px-3 py-2 text-sm shadow-sm outline-none transition",
      "bg-white/[0.025] border-white/[0.08] text-stone-50 placeholder:text-stone-500",
      "focus:bg-white/[0.04] focus:border-[#22d3ee]/40 focus:ring-2 focus:ring-[#22d3ee]/20",
      "disabled:cursor-not-allowed disabled:opacity-60",
      className,
    )}
    {...props}
  />
))
Input.displayName = "Input"

export { Input }
