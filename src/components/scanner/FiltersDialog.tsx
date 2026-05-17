"use client"

import * as React from "react"
import { Switch } from "@/components/ui/switch"
import {
  Dialog, DialogTrigger, DialogContent, DialogTitle, DialogClose,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

// ─── Bucket definitions (single source of truth for radio options + summary labels) ───

const FILTER_PREM_BUCKETS: { value: string; label: string }[] = [
  { value: "", label: "Any" },
  { value: "50000", label: "$50K+" },
  { value: "100000", label: "$100K+" },
  { value: "200000", label: "$200K+" },
  { value: "500000", label: "$500K+" },
  { value: "1000000", label: "$1M+" },
  { value: "5000000", label: "$5M+" },
]
const FILTER_DTE_BUCKETS: { value: string; label: string }[] = [
  { value: "", label: "Any" },
  { value: "0dte", label: "0DTE" },
  { value: "1-7", label: "1-7d" },
  { value: "8-30", label: "8-30d" },
  { value: "30+", label: "30d+" },
]
const FILTER_FLOW_BUCKETS: { value: string; label: string }[] = [
  { value: "", label: "All" },
  { value: "SWEEP", label: "Sweeps" },
  { value: "BLOCK", label: "Blocks" },
]
const FILTER_OPT_BUCKETS: { value: string; label: string }[] = [
  { value: "", label: "Both" },
  { value: "C", label: "Calls" },
  { value: "P", label: "Puts" },
]
const FILTER_MC_BUCKETS: { value: number; label: string }[] = [
  { value: 0, label: "Any" },
  { value: 100, label: "100+" },
  { value: 500, label: "500+" },
  { value: 1000, label: "1,000+" },
  { value: 2000, label: "2,000+" },
]
const FILTER_VOI_BUCKETS: { value: number; label: string }[] = [
  { value: 0, label: "Any" },
  { value: 15, label: "1.5x+" },
  { value: 20, label: "2x+" },
  { value: 30, label: "3x+" },
  { value: 50, label: "5x+" },
]

function lookupLabel<T>(buckets: { value: T; label: string }[], v: T): string {
  return buckets.find(b => b.value === v)?.label ?? String(v)
}

// ─── Internal presentational helpers ───

type PillVariant = "active" | "neutral" | "count"

function StatusPill({ variant = "neutral", children }: { variant?: PillVariant; children: React.ReactNode }) {
  const styles: Record<PillVariant, string> = {
    active: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20",
    neutral: "bg-zinc-100 text-zinc-600 ring-1 ring-inset ring-zinc-200",
    count: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20",
  }
  return (
    <span className={"inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium " + styles[variant]}>
      {children}
    </span>
  )
}

function FilterRow({
  label, pill, pillVariant = "neutral", expanded, onToggle, children,
}: {
  label: string
  pill: React.ReactNode
  pillVariant?: PillVariant
  expanded: boolean
  onToggle: () => void
  children?: React.ReactNode
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-3.5 bg-white hover:bg-zinc-50 transition-colors text-left"
      >
        <span className="text-sm font-semibold text-zinc-900">{label}</span>
        <StatusPill variant={pillVariant}>{pill}</StatusPill>
      </button>
      {expanded && <div className="px-3 pb-3 pt-1 space-y-0.5 bg-white">{children}</div>}
    </div>
  )
}

function RadioListItem({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-[13px] text-zinc-700 hover:bg-zinc-50 transition-colors"
    >
      <span>{children}</span>
      {active && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-green-600">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
    </button>
  )
}

// ─── Public component ───

export interface FiltersDialogProps {
  // Dialog control
  open: boolean
  onOpenChange: (open: boolean) => void
  trigger: React.ReactNode  // the Filters Button (with badge count) lives in the parent

  // Filter state + setters
  filterOptType: string
  setFilterOptType: (v: string) => void
  filterType: string
  setFilterType: (v: string) => void
  filterExcludeMultiLeg: boolean
  setFilterExcludeMultiLeg: (v: boolean) => void
  filterMinPremium: string
  setFilterMinPremium: (v: string) => void
  filterDte: string
  setFilterDte: (v: string) => void
  filterMinContracts: number
  setFilterMinContracts: (v: number) => void
  filterMinVolOi: number
  setFilterMinVolOi: (v: number) => void
  filterCuratedOnly: boolean
  setFilterCuratedOnly: (v: boolean) => void
  filterUnusualOnly: boolean
  setFilterUnusualOnly: (v: boolean) => void
  filterNoIndex: boolean
  setFilterNoIndex: (v: boolean) => void
  filterExcludeMidpoint: boolean
  setFilterExcludeMidpoint: (v: boolean) => void

  // Footer actions
  activeFilterCount: number
  resetFilters: () => void
}

export function FiltersDialog(props: FiltersDialogProps) {
  const {
    open, onOpenChange, trigger,
    filterOptType, setFilterOptType,
    filterType, setFilterType,
    filterExcludeMultiLeg, setFilterExcludeMultiLeg,
    filterMinPremium, setFilterMinPremium,
    filterDte, setFilterDte,
    filterMinContracts, setFilterMinContracts,
    filterMinVolOi, setFilterMinVolOi,
    filterCuratedOnly, setFilterCuratedOnly,
    filterUnusualOnly, setFilterUnusualOnly,
    filterNoIndex, setFilterNoIndex,
    filterExcludeMidpoint, setFilterExcludeMidpoint,
    activeFilterCount, resetFilters,
  } = props

  const [expandedRow, setExpandedRow] = React.useState<string | null>(null)
  const toggle = (id: string) => setExpandedRow(prev => prev === id ? null : id)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="p-0">
        {/* Custom header — drops <DialogHeader> bg-muted/30 + close button for full light-theme control */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 bg-white">
          <DialogTitle className="text-base font-semibold text-zinc-900">Filters</DialogTitle>
          <DialogClose className="rounded-md bg-zinc-100 hover:bg-zinc-200 transition-colors p-1.5 text-zinc-600">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" d="M18 6L6 18M6 6l12 12"/></svg>
            <span className="sr-only">Close</span>
          </DialogClose>
        </div>

        {/* Inner bordered card containing the accordion rows */}
        <div className="mx-5 mb-5 rounded-xl border border-zinc-200 overflow-hidden bg-white">
          <ScrollArea className="max-h-[calc(100vh-180px)]">
            <FilterRow
              label="Direction"
              pill={lookupLabel(FILTER_OPT_BUCKETS, filterOptType)}
              pillVariant={filterOptType ? "active" : "neutral"}
              expanded={expandedRow === "direction"}
              onToggle={() => toggle("direction")}
            >
              {FILTER_OPT_BUCKETS.map(b => (
                <RadioListItem key={b.value || "any"} active={filterOptType === b.value} onClick={() => setFilterOptType(b.value)}>
                  {b.label}
                </RadioListItem>
              ))}
            </FilterRow>
            <div className="mx-4 border-t border-dashed border-zinc-200" />

            <FilterRow
              label="Flow Type"
              pill={lookupLabel(FILTER_FLOW_BUCKETS, filterType) + (filterExcludeMultiLeg ? " · single" : "")}
              pillVariant={(filterType || filterExcludeMultiLeg) ? "active" : "neutral"}
              expanded={expandedRow === "flow"}
              onToggle={() => toggle("flow")}
            >
              {FILTER_FLOW_BUCKETS.map(b => (
                <RadioListItem key={b.value || "any"} active={filterType === b.value} onClick={() => setFilterType(b.value)}>
                  {b.label}
                </RadioListItem>
              ))}
              <div className="mx-3 my-2 border-t border-dashed border-zinc-200" />
              <label className="flex items-center justify-between px-3 py-2 cursor-pointer">
                <span className="text-[13px] text-stone-300">Exclude multi-leg</span>
                <Switch checked={filterExcludeMultiLeg} onCheckedChange={setFilterExcludeMultiLeg} />
              </label>
            </FilterRow>
            <div className="mx-4 border-t border-dashed border-zinc-200" />

            <FilterRow
              label="Min Premium"
              pill={lookupLabel(FILTER_PREM_BUCKETS, filterMinPremium)}
              pillVariant={filterMinPremium ? "active" : "neutral"}
              expanded={expandedRow === "premium"}
              onToggle={() => toggle("premium")}
            >
              {FILTER_PREM_BUCKETS.map(b => (
                <RadioListItem key={b.value || "any"} active={filterMinPremium === b.value} onClick={() => setFilterMinPremium(b.value)}>
                  {b.label}
                </RadioListItem>
              ))}
            </FilterRow>
            <div className="mx-4 border-t border-dashed border-zinc-200" />

            <FilterRow
              label="DTE Window"
              pill={lookupLabel(FILTER_DTE_BUCKETS, filterDte)}
              pillVariant={filterDte ? "active" : "neutral"}
              expanded={expandedRow === "dte"}
              onToggle={() => toggle("dte")}
            >
              {FILTER_DTE_BUCKETS.map(b => (
                <RadioListItem key={b.value || "any"} active={filterDte === b.value} onClick={() => setFilterDte(b.value)}>
                  {b.label}
                </RadioListItem>
              ))}
            </FilterRow>
            <div className="mx-4 border-t border-dashed border-zinc-200" />

            <FilterRow
              label="Size & V/OI"
              pill={
                (filterMinContracts === 0 && filterMinVolOi === 0)
                  ? "Any"
                  : [
                      filterMinContracts > 0 ? lookupLabel(FILTER_MC_BUCKETS, filterMinContracts) : null,
                      filterMinVolOi > 0 ? lookupLabel(FILTER_VOI_BUCKETS, filterMinVolOi) : null,
                    ].filter(Boolean).join(" · ")
              }
              pillVariant={(filterMinContracts > 0 || filterMinVolOi > 0) ? "active" : "neutral"}
              expanded={expandedRow === "size"}
              onToggle={() => toggle("size")}
            >
              <div className="text-[10px] font-bold tracking-[0.08em] uppercase text-stone-500 mt-1 mb-1 px-3">Min Contracts</div>
              {FILTER_MC_BUCKETS.map(b => (
                <RadioListItem key={b.value} active={filterMinContracts === b.value} onClick={() => setFilterMinContracts(b.value)}>
                  {b.label}
                </RadioListItem>
              ))}
              <div className="mx-3 my-2 border-t border-dashed border-zinc-200" />
              <div className="text-[10px] font-bold tracking-[0.08em] uppercase text-stone-500 mb-1 px-3">Min V/OI Ratio</div>
              {FILTER_VOI_BUCKETS.map(b => (
                <RadioListItem key={b.value} active={filterMinVolOi === b.value} onClick={() => setFilterMinVolOi(b.value)}>
                  {b.label}
                </RadioListItem>
              ))}
            </FilterRow>
            <div className="mx-4 border-t border-dashed border-zinc-200" />

            <FilterRow
              label="Quality"
              pill={(() => {
                const n = [filterCuratedOnly, filterUnusualOnly, filterNoIndex, filterExcludeMidpoint].filter(Boolean).length
                return n === 0 ? "Default" : n + " active"
              })()}
              pillVariant={
                [filterCuratedOnly, filterUnusualOnly, filterNoIndex, filterExcludeMidpoint].some(Boolean)
                  ? "count" : "neutral"
              }
              expanded={expandedRow === "quality"}
              onToggle={() => toggle("quality")}
            >
              <label className="flex items-center justify-between px-3 py-2 cursor-pointer">
                <span className="text-[13px] text-stone-300">Curated grades only (A, B)</span>
                <Switch checked={filterCuratedOnly} onCheckedChange={setFilterCuratedOnly} />
              </label>
              <label className="flex items-center justify-between px-3 py-2 cursor-pointer">
                <span className="text-[13px] text-stone-300">Unusual V/OI only</span>
                <Switch checked={filterUnusualOnly} onCheckedChange={setFilterUnusualOnly} />
              </label>
              <label className="flex items-center justify-between px-3 py-2 cursor-pointer">
                <span className="text-[13px] text-stone-300">Hide index symbols</span>
                <Switch checked={filterNoIndex} onCheckedChange={setFilterNoIndex} />
              </label>
              <label className="flex items-center justify-between px-3 py-2 cursor-pointer">
                <span className="text-[13px] text-stone-300">Exclude midpoint fills</span>
                <Switch checked={filterExcludeMidpoint} onCheckedChange={setFilterExcludeMidpoint} />
              </label>
            </FilterRow>
          </ScrollArea>
        </div>

        {/* Custom footer — light theme, centered link */}
        <div className="border-t border-zinc-200 px-5 py-4 text-center bg-white">
          {activeFilterCount > 0 ? (
            <button
              type="button"
              onClick={resetFilters}
              className="text-sm font-medium text-zinc-700 underline underline-offset-4 decoration-zinc-300 hover:text-zinc-900 hover:decoration-zinc-500 transition-colors"
            >
              Reset all filters
            </button>
          ) : (
            <span className="text-xs text-zinc-500">No filters applied</span>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
