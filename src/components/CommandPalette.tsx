"use client"

import { useEffect, useState } from "react"
import { Command } from "cmdk"

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  symbol: string
  symbols: { code: string; name: string }[]
  onSymbolChange: (symbol: string) => void
}

// SpotGamma-style command palette. Triggered by S keypress (handled by parent
// page) when no input has focus. Fuzzy-searches both symbol codes and full
// instrument names, then runs commands like "View on options-flow page" or
// "Switch view" (only commands whose backend exists are listed — anything
// "coming soon" stays out of view, per the falsifiable-claim discipline).
export default function CommandPalette({ open, onOpenChange, symbol, symbols, onSymbolChange }: CommandPaletteProps) {
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (!open) setSearch("")
  }, [open])

  // ESC handler is built into cmdk's Dialog component; no need to wire it here.

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4"
      style={{ background: "rgba(11,15,26,0.78)", backdropFilter: "blur(6px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onOpenChange(false) }}
    >
      <Command
        label="Search"
        className="w-full max-w-[560px] rounded-xl border border-[#1E2A3A] shadow-2xl overflow-hidden"
        style={{ background: "#0F1520" }}
        shouldFilter
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1E2A3A]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5A6A82" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
            <circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <Command.Input
            value={search}
            onValueChange={setSearch}
            autoFocus
            placeholder="Search symbols, jump to ticker, run a command…"
            className="flex-1 bg-transparent outline-none border-0 text-[14px] text-white placeholder:text-[#5A6A82]"
          />
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#161B24] border border-[#1E2A3A] text-[#7A8BA8]">ESC</kbd>
        </div>

        <Command.List className="max-h-[420px] overflow-auto py-2">
          <Command.Empty className="px-4 py-6 text-[12px] text-[#5A6A82] text-center">
            No matches. Symbols available: SPY, QQQ, AAPL, TSLA, NVDA, META, MSFT, AMZN, GOOGL, AMD, MU, COIN, PLTR, NFLX, CRM, BA, JPM, GS, XOM, GLD.
          </Command.Empty>

          <Command.Group heading="Symbols" className="[&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[9px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:tracking-[0.14em] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:text-[#4A5A72]">
            {symbols.map(s => (
              <Command.Item
                key={s.code}
                value={`${s.code} ${s.name}`}
                onSelect={() => { onSymbolChange(s.code); onOpenChange(false) }}
                className="flex items-center gap-3 px-4 py-2 text-[13px] cursor-pointer aria-selected:bg-[#161B24] data-[selected=true]:bg-[#161B24]"
              >
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold tracking-[0.05em] flex-shrink-0 ${s.code === symbol ? "bg-[#F5820A] text-[#0B0F1A]" : "bg-[#1E2A3A] text-[#7A8BA8]"}`}>
                  {s.code}
                </span>
                <span className="text-white truncate">{s.name}</span>
                {s.code === symbol && <span className="ml-auto text-[10px] text-[#5A6A82]">current</span>}
              </Command.Item>
            ))}
          </Command.Group>

          <Command.Group heading="Jump" className="[&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:mt-2 [&_[cmdk-group-heading]]:text-[9px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:tracking-[0.14em] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:text-[#4A5A72]">
            <Command.Item
              value="scanner flow live institutional"
              onSelect={() => { window.location.href = "/scanner"; onOpenChange(false) }}
              className="flex items-center gap-3 px-4 py-2 text-[13px] cursor-pointer aria-selected:bg-[#161B24] data-[selected=true]:bg-[#161B24] text-white"
            >
              <span className="text-[#7A8BA8]">→</span>
              Open scanner (live institutional flow)
            </Command.Item>
            <Command.Item
              value={`options-flow ${symbol} contracts trades`}
              onSelect={() => { window.location.href = `/options-flow/${symbol}`; onOpenChange(false) }}
              className="flex items-center gap-3 px-4 py-2 text-[13px] cursor-pointer aria-selected:bg-[#161B24] data-[selected=true]:bg-[#161B24] text-white"
            >
              <span className="text-[#7A8BA8]">→</span>
              View {symbol} options flow page
            </Command.Item>
          </Command.Group>
        </Command.List>

        <div className="flex items-center gap-3 px-4 py-2 border-t border-[#1E2A3A] text-[10px] text-[#5A6A82]">
          <span className="flex items-center gap-1"><kbd className="font-mono px-1 py-0.5 rounded bg-[#161B24] border border-[#1E2A3A]">↑↓</kbd> navigate</span>
          <span className="flex items-center gap-1"><kbd className="font-mono px-1 py-0.5 rounded bg-[#161B24] border border-[#1E2A3A]">↵</kbd> select</span>
          <span className="flex items-center gap-1 ml-auto"><kbd className="font-mono px-1 py-0.5 rounded bg-[#161B24] border border-[#1E2A3A]">S</kbd> to open</span>
        </div>
      </Command>
    </div>
  )
}
