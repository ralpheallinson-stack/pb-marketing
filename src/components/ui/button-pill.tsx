"use client"

import React from "react"
import clsx from "clsx"

// Geist-style Button component. Adapted from user-supplied source:
//   - Spinner/loading branch dropped (no @/components/ui/spinner-1
//     dependency; CONDS badges and PB's planned reuse sites don't need it)
//   - HTML attribute type hardcoded to "button" (was "submit" — would
//     fire form-submits when nested inside a form, which is wrong for
//     every current PB use case)
//   - Tailwind v4 tokens substituted to PB warm palette (Geist's
//     gray-1000/background-100/gray-alpha-* → stone-* + white/N)
//   - `custom: ""` type added (see comment above the types map)

const sizes = [
  {
    tiny: "px-1.5 h-6 text-sm",
    small: "px-1.5 h-8 text-sm",
    medium: "px-2.5 h-10 text-sm",
    large: "px-3.5 h-12 text-base",
  },
  {
    tiny: "w-6 h-6 text-sm",
    small: "w-8 h-8 text-sm",
    medium: "w-10 h-10 text-sm",
    large: "w-12 h-12 text-base",
  },
]

// Geist-style preset types provide bg+text+border colors.
// `custom` emits no color classes — caller must supply via className.
// Used by CONDS badge rendering which delegates color to
// @/lib/badge-styles (TIER_STYLES) — 11 semantic tier colors that
// would have collapsed if forced through the 5 preset types.
const types = {
  primary:   "bg-stone-50 hover:bg-stone-100 text-stone-950 fill-stone-950",
  secondary: "bg-stone-950 hover:bg-white/10 text-stone-50 fill-stone-50 border border-white/20",
  tertiary:  "bg-none hover:bg-white/10 text-stone-50 fill-stone-50",
  error:     "bg-red-900/40 hover:bg-red-900/60 text-white fill-white",
  warning:   "bg-amber-900/40 hover:bg-amber-900/60 text-black fill-black",
  custom:    "",
}

const shapes = {
  square: {
    tiny: "rounded",
    small: "rounded-md",
    medium: "rounded-md",
    large: "rounded-lg",
  },
  circle: {
    tiny: "rounded-[100%]",
    small: "rounded-[100%]",
    medium: "rounded-[100%]",
    large: "rounded-[100%]",
  },
  rounded: {
    tiny: "rounded-[100px]",
    small: "rounded-[100px]",
    medium: "rounded-[100px]",
    large: "rounded-[100px]",
  },
}

export interface ButtonProps {
  size?: keyof (typeof sizes)[0]
  type?: keyof typeof types
  variant?: "styled" | "unstyled"
  shape?: keyof typeof shapes
  svgOnly?: boolean
  children?: React.ReactNode
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  shadow?: boolean
  disabled?: boolean
  fullWidth?: boolean
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  ref?: React.Ref<HTMLButtonElement>
  className?: string
}

export const Button = ({
  size = "medium",
  type = "primary",
  variant = "styled",
  shape = "square",
  svgOnly = false,
  children,
  prefix,
  suffix,
  shadow = false,
  disabled = false,
  fullWidth = false,
  onClick,
  ref,
  className,
  ...rest
}: ButtonProps) => {
  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled}
      onClick={onClick}
      tabIndex={0}
      className={clsx(
        "flex justify-center items-center gap-0.5 duration-150",
        sizes[+svgOnly][size],
        disabled
          ? "bg-stone-800 text-stone-400 border border-stone-700 cursor-not-allowed"
          : types[type],
        shapes[shape][size],
        shadow && "shadow-sm border-none",
        fullWidth && "w-full",
        variant === "unstyled"
          ? "outline-none px-0 h-fit bg-transparent hover:bg-transparent text-stone-50"
          : "focus:ring-2 focus:ring-cyan-400/40 focus:outline-0",
        className,
      )}
      {...rest}
    >
      {prefix}
      <span
        className={clsx(
          "relative overflow-hidden whitespace-nowrap overflow-ellipsis font-sans",
          size !== "tiny" && variant !== "unstyled" && "px-1.5",
        )}
      >
        {children}
      </span>
      {suffix}
    </button>
  )
}
