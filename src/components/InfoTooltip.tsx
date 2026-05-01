"use client"

import * as Tooltip from "@radix-ui/react-tooltip"
import type { ReactNode } from "react"

// Polished info tooltip wrapping Radix. Use anywhere we'd otherwise reach
// for a `title` attribute — the hover delay, fade animation, and arrow
// pointer all come for free.
export default function InfoTooltip({ children, content, side = "bottom" }: { children: ReactNode; content: ReactNode; side?: "top" | "bottom" | "left" | "right" }) {
  return (
    <Tooltip.Provider delayDuration={120}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side={side}
            sideOffset={6}
            className="z-[200] max-w-[280px] rounded-md px-3 py-2 text-[11px] leading-snug text-[#C4CDD9] shadow-lg border border-[#1E2A3A]"
            style={{ background: "#0F1520" }}
          >
            {content}
            <Tooltip.Arrow className="fill-[#1E2A3A]" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}
