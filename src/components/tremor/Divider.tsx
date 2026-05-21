// Tremor Raw Divider [v1.0.0] — Tailwind v4 / React 19 compatible.
import React from "react"

import { cn } from "@/lib/utils"

const Divider = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("my-8 h-px w-full bg-white/[0.08]", className)}
    {...props}
  />
)
Divider.displayName = "Divider"

export { Divider }
