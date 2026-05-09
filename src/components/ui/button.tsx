import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-neutral-400 focus-visible:ring-[3px] focus-visible:ring-neutral-400/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-red-500 aria-invalid:ring-red-500/20 dark:aria-invalid:ring-red-500/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 dark:focus-visible:border-neutral-500 dark:focus-visible:ring-neutral-500/50 dark:aria-invalid:border-red-700 dark:aria-invalid:ring-red-700/20 dark:dark:aria-invalid:ring-red-700/40",
  {
    variants: {
      variant: {
        default: "bg-neutral-800 text-neutral-50 hover:bg-neutral-800/90 dark:bg-neutral-200 dark:text-neutral-800 dark:hover:bg-neutral-200/90",
        destructive:
          "bg-red-500 text-white hover:bg-red-500/90 focus-visible:ring-red-500/20 dark:bg-red-500/60 dark:focus-visible:ring-red-500/40 dark:bg-red-700 dark:hover:bg-red-700/90 dark:focus-visible:ring-red-700/20 dark:dark:bg-red-700/60 dark:dark:focus-visible:ring-red-700/40",
        outline:
          "border bg-white shadow-xs hover:bg-neutral-100 hover:text-neutral-800 dark:border-neutral-200 dark:bg-neutral-200/30 dark:hover:bg-neutral-200/50 dark:bg-neutral-900 dark:hover:bg-neutral-700 dark:hover:text-neutral-50 dark:dark:border-white/15 dark:dark:bg-white/15 dark:dark:hover:bg-white/15/50",
        secondary:
          "bg-neutral-100 text-neutral-800 hover:bg-neutral-100/80 dark:bg-neutral-700 dark:text-neutral-50 dark:hover:bg-neutral-700/80",
        ghost:
          "hover:bg-neutral-100 hover:text-neutral-800 dark:hover:bg-neutral-100/50 dark:hover:bg-neutral-700 dark:hover:text-neutral-50 dark:dark:hover:bg-neutral-700/50",
        link: "text-neutral-800 underline-offset-4 hover:underline dark:text-neutral-200",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
