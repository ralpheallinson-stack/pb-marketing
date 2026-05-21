// Tremor Raw Button [v1.0.0] — Tailwind v4 / React 19 compatible.
// PB variants: primary cyan, danger, ghost.
"use client"

import React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition",
    "outline-none focus-visible:ring-2 focus-visible:ring-[#22d3ee]/40",
    "disabled:pointer-events-none disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        primary: "bg-[#22d3ee] text-[#06141A] hover:bg-[#22d3ee]/90",
        danger:
          "bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20",
        ghost:
          "bg-transparent text-stone-50 border border-stone-800 hover:bg-white/[0.04]",
      },
      size: {
        default: "px-4 py-2",
        sm: "px-3 py-1.5 text-xs",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  },
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, forwardedRef) => (
    <button
      ref={forwardedRef}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
)
Button.displayName = "Button"

export { Button, buttonVariants }
