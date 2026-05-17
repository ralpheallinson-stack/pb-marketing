"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"
import "react-day-picker/style.css"
import { cn } from "@/lib/utils"

// react-day-picker v10 wrapper. Dark theme via classNames override to match
// the scanner palette (#16191F surfaces, white/[0.12] selected, cyan today ring).
// v10 classNames keys differ from v8/shadcn templates — using v10 keys here.
export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({ className, classNames, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-2",
        month: "flex flex-col gap-4",
        month_caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium text-zinc-200",
        nav: "space-x-1 flex items-center",
        button_previous:
          "absolute left-1 inline-flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-200",
        button_next:
          "absolute right-1 inline-flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-200",
        weekdays: "flex",
        weekday: "text-zinc-500 rounded-md w-8 font-normal text-[0.7rem] uppercase tracking-wider",
        week: "flex w-full mt-1",
        day: "relative p-0 text-center text-sm h-8 w-8",
        day_button:
          "inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-300 hover:bg-white/[0.06] aria-selected:bg-white/[0.12] aria-selected:text-white transition-colors",
        today: "ring-1 ring-cyan-400/40 rounded-md",
        selected: "bg-white/[0.12] text-white rounded-md",
        outside: "text-zinc-600 opacity-40",
        disabled: "opacity-30 cursor-not-allowed pointer-events-none",
        hidden: "invisible",
        ...classNames,
      }}
      {...props}
    />
  )
}

export { Calendar }
