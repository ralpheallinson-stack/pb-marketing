"use client"

import * as React from "react"
import { Switch as SwitchPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * Light-theme switch (FiltersDialog is a right-floating light card).
 *
 * 2026-05-18 rewrite: replaced the prior shadcn-generated className that
 * was a tangle of `bg-oklch(0.205 0 0)` arbitrary values. Tailwind's
 * parser doesn't accept whitespace inside arbitrary `oklch(...)` color
 * tokens, so the state-color classes fell through silently and ON/OFF
 * rendered identically (~light gray for both) — making toggle state
 * visually indistinguishable in the Quality / Flow Type / Direction
 * sections. Replaced with named-color classes (cyan-500 ON, zinc-300
 * OFF) that match the rest of the design system (cyan-500 = sort-icon
 * accent). Dark variants dropped — dialog is light-card only.
 */
function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch inline-flex shrink-0 items-center rounded-full border border-transparent transition-colors duration-150 outline-none",
        "focus-visible:ring-2 focus-visible:ring-cyan-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[size=default]:h-6 data-[size=default]:w-11",
        "data-[size=sm]:h-4 data-[size=sm]:w-7",
        "data-[state=checked]:bg-cyan-500 data-[state=checked]:shadow-inner",
        "data-[state=unchecked]:bg-zinc-300",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block rounded-full bg-white shadow-sm ring-0 transition-transform duration-150",
          "group-data-[size=default]/switch:size-5",
          "group-data-[size=sm]/switch:size-3",
          // ON: knob slides to right edge. Math = width - knob - 2px breathing.
          // default: w-11 (44px) - size-5 (20px) - 2px = translate-x-[22px]
          // sm:      w-7  (28px) - size-3 (12px) - 2px = translate-x-[14px]
          "group-data-[size=default]/switch:data-[state=checked]:translate-x-[22px]",
          "group-data-[size=sm]/switch:data-[state=checked]:translate-x-[14px]",
          "data-[state=unchecked]:translate-x-0.5",
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
