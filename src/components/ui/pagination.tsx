"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

// shadcn-style Pagination primitives — same component family as Cal.com /
// shadcn /vercel use, adapted for the scanner's dark institutional palette.
// Five exported pieces: Pagination root <nav>, PaginationContent <ul>,
// PaginationItem <li>, PaginationLink (with isActive), PaginationPrevious /
// PaginationNext (with chevron), PaginationEllipsis.

function cn(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ")
}

const Pagination = ({ className, ...props }: React.ComponentProps<"nav">) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  />
)
Pagination.displayName = "Pagination"

const PaginationContent = React.forwardRef<HTMLUListElement, React.ComponentProps<"ul">>(
  ({ className, ...props }, ref) => (
    <ul
      ref={ref}
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  ),
)
PaginationContent.displayName = "PaginationContent"

const PaginationItem = React.forwardRef<HTMLLIElement, React.ComponentProps<"li">>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn("", className)} {...props} />
  ),
)
PaginationItem.displayName = "PaginationItem"

interface PaginationLinkProps extends React.ComponentProps<"button"> {
  isActive?: boolean
  size?: "default" | "icon"
}

const PaginationLink = ({ className, isActive, size = "default", children, ...props }: PaginationLinkProps) => {
  // Scanner palette — slate-on-dark, white on active, subtle hover.
  const base = "inline-flex items-center justify-center gap-1 rounded-md text-[12px] font-medium transition-colors disabled:opacity-30 disabled:pointer-events-none whitespace-nowrap"
  const sizeCls = size === "icon" ? "h-8 w-8" : "h-8 px-3"
  const palette = isActive
    ? "bg-white/10 text-white border border-white/15"
    : "text-[#7A8BA8] border border-[#252E3D] hover:bg-[#1E2530] hover:text-white hover:border-[#2E3A4D]"
  return (
    <button aria-current={isActive ? "page" : undefined} className={cn(base, sizeCls, palette, className)} {...props}>
      {children}
    </button>
  )
}
PaginationLink.displayName = "PaginationLink"

const PaginationPrevious = ({ className, children, ...props }: PaginationLinkProps) => (
  <PaginationLink aria-label="Go to previous page" size="default" className={cn("gap-1 pl-2.5", className)} {...props}>
    <ChevronLeft className="h-3.5 w-3.5" />
    <span className="hidden sm:inline">{children ?? "Previous"}</span>
  </PaginationLink>
)
PaginationPrevious.displayName = "PaginationPrevious"

const PaginationNext = ({ className, children, ...props }: PaginationLinkProps) => (
  <PaginationLink aria-label="Go to next page" size="default" className={cn("gap-1 pr-2.5", className)} {...props}>
    <span className="hidden sm:inline">{children ?? "Next"}</span>
    <ChevronRight className="h-3.5 w-3.5" />
  </PaginationLink>
)
PaginationNext.displayName = "PaginationNext"

const PaginationEllipsis = ({ className, ...props }: React.ComponentProps<"span">) => (
  <span aria-hidden className={cn("flex h-8 w-8 items-center justify-center text-[#4A5A72]", className)} {...props}>
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
)
PaginationEllipsis.displayName = "PaginationEllipsis"

// Helper: produce a smart page-number list for the current/total state.
// Always shows: first, last, current, current-1, current+1, with ellipses
// where appropriate. Tuned for the scanner's typical totalPages range
// (1-20 for today, fewer for week/month/last_week views).
export function getPageNumbers(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i)
  const out: (number | "ellipsis")[] = [0]
  const left = Math.max(1, current - 1)
  const right = Math.min(total - 2, current + 1)
  if (left > 1) out.push("ellipsis")
  for (let i = left; i <= right; i++) out.push(i)
  if (right < total - 2) out.push("ellipsis")
  out.push(total - 1)
  return out
}

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
}
