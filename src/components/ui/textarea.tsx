import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-md border border-neutral-200 bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-neutral-500 focus-visible:border-neutral-400 focus-visible:ring-[3px] focus-visible:ring-neutral-400/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-red-500 aria-invalid:ring-red-500/20 md:text-sm dark:bg-neutral-200/30 dark:aria-invalid:ring-red-500/40 dark:border-white/10 dark:border-white/15 dark:placeholder:text-neutral-400 dark:focus-visible:border-neutral-500 dark:focus-visible:ring-neutral-500/50 dark:aria-invalid:border-red-700 dark:aria-invalid:ring-red-700/20 dark:dark:bg-white/15 dark:dark:aria-invalid:ring-red-700/40",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
