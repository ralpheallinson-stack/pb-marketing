import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-md border border-neutral-200 bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-neutral-800 selection:text-neutral-50 file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-neutral-900 placeholder:text-neutral-500 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-neutral-200/30 dark:border-white/10 dark:border-white/15 dark:selection:bg-neutral-200 dark:selection:text-neutral-800 dark:file:text-neutral-50 dark:placeholder:text-neutral-400 dark:dark:bg-white/15",
        "focus-visible:border-neutral-400 focus-visible:ring-[3px] focus-visible:ring-neutral-400/50 dark:focus-visible:border-neutral-500 dark:focus-visible:ring-neutral-500/50",
        "aria-invalid:border-red-500 aria-invalid:ring-red-500/20 dark:aria-invalid:ring-red-500/40 dark:aria-invalid:border-red-700 dark:aria-invalid:ring-red-700/20 dark:dark:aria-invalid:ring-red-700/40",
        className
      )}
      {...props}
    />
  )
}

export { Input }
