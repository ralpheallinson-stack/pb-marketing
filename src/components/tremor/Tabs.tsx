// Tremor Raw Tabs [v1.0.0] — Tailwind v4 / React 19 compatible.
// Active tab uses PB cyan (#22d3ee) underline instead of Tremor's default brand.
"use client"

import * as TabsPrimitives from "@radix-ui/react-tabs"
import React from "react"

import { cn } from "@/lib/utils"

const Tabs = (
  props: React.ComponentPropsWithoutRef<typeof TabsPrimitives.Root>,
) => {
  return <TabsPrimitives.Root {...props} />
}
Tabs.displayName = "Tabs"

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitives.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitives.List>
>(({ className, ...props }, forwardedRef) => (
  <TabsPrimitives.List
    ref={forwardedRef}
    className={cn("flex items-center gap-x-6 border-b border-white/[0.08]", className)}
    {...props}
  />
))
TabsList.displayName = "TabsList"

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitives.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitives.Trigger>
>(({ className, children, ...props }, forwardedRef) => (
  <TabsPrimitives.Trigger
    ref={forwardedRef}
    className={cn(
      "-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 border-transparent px-1 pb-2.5 text-sm font-medium transition-all",
      "text-stone-400 hover:text-stone-200",
      "data-[state=active]:border-[#22d3ee] data-[state=active]:text-stone-50",
      "focus:outline-none disabled:pointer-events-none disabled:opacity-50",
      className,
    )}
    {...props}
  >
    {children}
  </TabsPrimitives.Trigger>
))
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitives.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitives.Content>
>(({ className, ...props }, forwardedRef) => (
  <TabsPrimitives.Content
    ref={forwardedRef}
    className={cn("outline-none", className)}
    {...props}
  />
))
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }
