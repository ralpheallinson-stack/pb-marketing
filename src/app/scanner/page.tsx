"use client"

import { useState, useEffect, useCallback, useRef, useMemo, useId } from "react"
import { useRouter } from "next/navigation"
import { useVirtualizer } from "@tanstack/react-virtual"
import { badgeClass } from "@/lib/badge-styles"
import { SignalRow, type Trade } from "@/components/SignalRow"
import { motion, AnimatePresence } from "framer-motion"
import { useWatchlistSnapshot } from "@/hooks/useWatchlistSnapshot"

import dynamic from "next/dynamic"
import { AccountMenu } from "@/components/AccountMenu"

// AG Grid migration Phase 1 harness — dynamic import keeps the AG Grid
// bundle (~250-300KB gzipped) out of the marketing-site critical bundle
// and the scanner route's initial JS until ?ag=1 / pb_scanner_ag_grid
// localStorage flag activates the harness. ssr:false because AG Grid is
// client-only (uses ResizeObserver, MutationObserver, etc).
const ScannerAgGrid = dynamic(
  () => import("@/components/ScannerAgGrid").then(m => m.ScannerAgGrid),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center text-white/40 text-sm">
        Loading AG Grid harness…
      </div>
    ),
  },
)

// Phase 5 (2026-05-11): type-only GridApi import for the gridApi ref.
// Type-only — no runtime cost, no entry into the critical bundle.
import type { GridApi } from "ag-grid-community"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis, getPageNumbers } from "@/components/ui/pagination"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { FiltersDialog } from "@/components/scanner/FiltersDialog"
import { exportTradesToCsv } from "@/lib/csv-export"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { StatsPanel } from "@/components/scanner/StatsPanel"
import { DashboardSkeleton, ScannerSkeleton } from "@/components/scanner/SkeletonViews"
import { ScannerSidebar } from "@/components/scanner-sidebar"
import { cn } from "@/lib/utils"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Card } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import { RadialBarChart, RadialBar, PolarAngleAxis } from "recharts"
import TrialBanner from "@/components/TrialBanner"
import CommandPalette from "@/components/CommandPalette"
import InfoTooltip from "@/components/InfoTooltip"
import GexHeroCard from "@/components/scanner/gex/GexHeroCard"
import GexGammaProfile from "@/components/scanner/gex/GexGammaProfile"
import type { GexSnapshot } from "@/components/scanner/gex/gex.types"

import Link from "next/link"
import { rowsToTrades, type RawRow, type FeedMeta, type FeedResponse } from "@/lib/feed-decoder"
/* ── types ── */
interface Stats {
  count: number
  bull: number
  bear: number
  lean: string
  pc_ratio: number
}

interface ApiResponse {
  trades: Trade[]
  stats: Stats
  is_historical: boolean
  error?: string
}

/* ── /api/scanner/feed (Phase 1 wire format) ───────────────────────────
 * Column-array shape, ~70% smaller payload than the legacy live-flow
 * dict-per-row response. See trading-system/web/queries.py:
 *   SCANNER_FEED_COLUMNS — column order (load-bearing).
 *   _format_trade_columnar — projection.
 *   _compute_feed_agg — agg block.
 * The decoder lives client-side: rowsToTrades() rehydrates each row
 * back into the existing Trade interface so render code is unchanged.
 * The bandwidth win is captured at JSON.parse time; client-side dict
 * allocation cost is identical to receiving dicts off the wire.
 */
interface FilterPreset {
  name: string
  filters: {
    grade: string
    type: string
    optType: string
    side: string
    dte: string
    unusualOnly: boolean
    noIndex: boolean
    minPremium: string
    minContracts: number
    minVolOi: number
  }
}

/* ── helpers ── */
function fmtPrem(v: number) {
  if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`
  if (v >= 1e3) return `$${(v / 1e3).toFixed(0)}K`
  return `$${v}`
}

// Stat-strip KPI gauge — Recharts RadialBar wrapped in shadcn ChartContainer.
// Replaces the magicui AnimatedCircularProgressBar that powered the four
// stat-strip cards (Flow sentiment / Put-to-call / Call flow / Put flow)
// pre-2026-05-10. Single-bar 0-100 gauge with a faint background ring.
// Stays on the warm theme palette (Direction A scoping respected — palette
// applies to filter panel only, not the stat strip).
function fmtGex(v: number) {
  const abs = Math.abs(v)
  const sign = v < 0 ? "-" : ""
  if (abs >= 1e12) return `${sign}$${(abs / 1e12).toFixed(2)}T`
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(2)}B`
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(1)}M`
  if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(0)}K`
  return `${sign}$${abs.toFixed(0)}`
}

function isMarketOpen() {
  const now = new Date()
  const et = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }))
  const day = et.getDay()
  if (day === 0 || day === 6) return false
  const mins = et.getHours() * 60 + et.getMinutes()
  return mins >= 570 && mins < 960 // 9:30 - 16:00
}

/* ── row highlight (inline styles — Tailwind JIT can't handle dynamic rgba) ── */
/* ── time ranges (moved to filter panel) ── */

function isMarketClosedET(): boolean {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(new Date())
  const wd = parts.find(p => p.type === "weekday")?.value
  if (wd === "Sat" || wd === "Sun") return true
  const hh = parseInt(parts.find(p => p.type === "hour")?.value ?? "0", 10)
  const mm = parseInt(parts.find(p => p.type === "minute")?.value ?? "0", 10)
  const minOfDay = hh * 60 + mm
  return minOfDay < 570 || minOfDay >= 960
}



const COLS = [
  { key: "time",   label: "Time",   cls: "text-left px-3 w-[7%]" },
  { key: "tick",   label: "Tick",   cls: "text-left px-2 w-[6%]" },
  { key: "expiry", label: "Expiry", cls: "text-left px-2 w-[7%]" },
  { key: "strike", label: "Strike", cls: "text-right px-2 w-[5%]" },
  { key: "cp",     label: "C/P",    cls: "text-center px-2 w-[4%]" },
  { key: "side",   label: "Side",   cls: "text-center px-2 w-[5%]" },
  { key: "bs",     label: "B/S",    cls: "text-center px-2 w-[4%]" },
  { key: "spot",   label: "Spot",   cls: "text-right px-2 w-[6%]" },
  { key: "size",   label: "Size",   cls: "text-right px-2 w-[5%]" },
  { key: "price",  label: "Price",  cls: "text-right px-2 w-[5%]" },
  { key: "prem",   label: "Prem",   cls: "text-right px-2 w-[6%]" },
  { key: "type",   label: "Type",   cls: "text-center px-2 w-[5%]" },
  { key: "vol",    label: "Vol",    cls: "text-right px-2 w-[6%]" },
  { key: "oi",     label: "OI",     cls: "text-right px-2 w-[5%]" },
  { key: "iv",     label: "IV",     cls: "text-right px-2 w-[4%]" },
  { key: "conds",  label: "Conds",  cls: "text-left px-2" },
] as const

/* ── page ── */
const GEX_SYMBOLS = ["SPY","QQQ","AAPL","TSLA","NVDA","META","MSFT","AMZN","GOOGL","AMD","MU","COIN","PLTR","NFLX","CRM","BA","JPM","GS","XOM","GLD"]

/* ── Watchlist v3 spark-card primitives (shared by Overview + Flow modes) ── */

// 40×40 rounded-square chip. Renders the native-color Polygon icon (22×22)
// when present. Chip text sits behind the image while it loads (no flicker)
// and is hidden once the icon loads cleanly (onLoad); on error or a missing
// icon (ETFs) the chip text stays as the fallback.
function TickerAvatar({ sym, logoUrl }: { sym: string; logoUrl?: string | null }) {
  const [logoOk, setLogoOk] = useState(false)
  const [logoFailed, setLogoFailed] = useState(false)
  useEffect(() => { setLogoOk(false); setLogoFailed(false) }, [logoUrl])
  return (
    <div className="relative flex items-center justify-center flex-shrink-0"
      style={{ width: 40, height: 40, borderRadius: 9, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
      {!logoOk && <span style={{ fontSize: 10, fontWeight: 700, color: "#7A8BA8", letterSpacing: "0.02em" }}>{sym.slice(0, 3)}</span>}
      {logoUrl && !logoFailed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt="" width={22} height={22}
          onLoad={() => setLogoOk(true)} onError={() => { setLogoFailed(true); setLogoOk(false) }}
          className="absolute inset-0 m-auto" style={{ width: 22, height: 22, objectFit: "contain" }} />
      )}
    </div>
  )
}

// Filled-area gradient sparkline, 180×48. `color` drives the stroke (full
// opacity) and the area fill gradient (color@0.35 → color@0). Unique gradient
// id per instance via useId so multiple sparklines don't collide.
function SparkAreaChart({ pts, color, w = 180, h = 48 }: { pts: number[]; color: string; w?: number; h?: number }) {
  const gid = useId().replace(/:/g, "")
  if (!pts || pts.length < 2) return <span className="text-[#3D4D63] text-[10px]">—</span>
  const pad = 3
  const lo = Math.min(...pts), hi = Math.max(...pts)
  const span = (hi - lo) || 1
  const xs = pts.map((_, i) => pad + (i / (pts.length - 1)) * (w - 2 * pad))
  const ys = pts.map(p => (h - pad) - ((p - lo) / span) * (h - 2 * pad))
  const line = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(" ")
  const area = `${line} L${xs[xs.length - 1].toFixed(1)},${(h - pad).toFixed(1)} L${xs[0].toFixed(1)},${(h - pad).toFixed(1)} Z`
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`sp-${gid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.35} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sp-${gid})`} stroke="none" />
      <motion.path key={line} d={line} fill="none" stroke={color} strokeWidth={1.75} strokeLinejoin="round" strokeLinecap="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, ease: "easeOut" }} />
    </svg>
  )
}

// Shared spark-card row: [logo+symbol+name | spark | mode-specific right zone].
// Identical silhouette across Overview/Flow — only `right`, `sparkPts`, and
// `sparkColor` differ. Click toggles the drill-down; × removes (hover-only).
function WatchlistSparkCard({ sym, logoUrl, name, sparkPts, sparkColor, right, expanded, onToggle, onRemove }: {
  sym: string; logoUrl?: string | null; name?: string | null
  sparkPts: number[]; sparkColor: string; right: React.ReactNode
  expanded: boolean; onToggle: () => void; onRemove: () => void
}) {
  return (
    <div onClick={onToggle} title={`Click for ${sym} flow detail`}
      className="relative grid cursor-pointer group rounded-xl border bg-white/[0.025] border-white/[0.06] hover:bg-white/[0.045] hover:border-white/[0.10] transition-colors duration-150"
      style={{ gridTemplateColumns: "260px 1fr 240px", alignItems: "center", padding: "18px 24px",
        borderLeftWidth: expanded ? 2 : undefined, borderLeftColor: expanded ? "#22d3ee" : undefined }}>
      <div className="flex items-center gap-3 min-w-0">
        <TickerAvatar sym={sym} logoUrl={logoUrl} />
        <div className="min-w-0">
          <div className="truncate" style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em", color: "#fafafa" }}>{sym}</div>
          {name ? <div className="truncate" style={{ fontSize: 12, fontWeight: 400, color: "rgba(255,255,255,0.65)" }}>{name}</div> : null}
        </div>
      </div>
      <div className="flex items-center justify-center px-4">
        <SparkAreaChart pts={sparkPts} color={sparkColor} />
      </div>
      <div className="flex flex-col items-end justify-center gap-1">{right}</div>
      <button onClick={(e) => { e.stopPropagation(); onRemove() }}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-[#3D4D63] hover:text-[#FF605D] text-base leading-none w-5 h-5 flex items-center justify-center rounded hover:bg-[#FF605D]/15">×</button>
    </div>
  )
}

// Shared click-to-expand drill-down — "Today's top 5 trades on {SYM}".
// Data shape unchanged from the pre-v3 panel; cyan accent retained (palette
// keeps cyan). BUY/SELL + C/P use the vivid green/red.
function WatchlistDrilldown({ sym, top5, onOpenScanner }: { sym: string; top5: Trade[]; onOpenScanner: () => void }) {
  return (
    <motion.div key="panel" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25, ease: "easeOut" }} style={{ overflow: "hidden" }}>
      <div className="px-6 py-5 mt-1 rounded-xl" style={{ borderLeft: "2px solid #22d3ee", background: "linear-gradient(180deg, rgba(34,211,238,0.05), transparent)" }}>
        <div className="flex items-center justify-between mb-3">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#4A5A72]">Today&apos;s top 5 trades on <span className="text-white font-mono">{sym}</span></div>
          <button onClick={(e) => { e.stopPropagation(); onOpenScanner() }} className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">Open in scanner →</button>
        </div>
        {top5.length === 0 ? (
          <div className="text-[12px] text-[#3D4D63] py-3">No flow on {sym} today.</div>
        ) : (
          <div>
            <div className="grid text-[9px] font-bold uppercase tracking-[0.12em] text-[#3D4D63] pb-1.5 border-b border-white/[0.06]" style={{ gridTemplateColumns: "62px 52px 46px 1fr 76px 92px 1.5fr", gap: 8 }}>
              <div>Time</div><div>Side</div><div>C/P</div><div>Strike·Expiry</div><div className="text-right">Size</div><div className="text-right">Premium</div><div>Conds</div>
            </div>
            {top5.map(t => {
              const isCall = t.opt_type === "C"
              const a = (t.aggression || "").toUpperCase()
              const side = (a === "BUY" || a === "ASK" || a === "ABOVE_ASK") ? "BUY" : (a === "SELL" || a === "BID" || a === "BELOW_BID") ? "SELL" : (t.bullish ? "BUY" : "SELL")
              const tradeTime = t.time || (t.timestampMs ? new Date(t.timestampMs).toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" }) : "—")
              const conds = (t.badges || []).slice(0, 3)
              return (
                <div key={t.id} className="grid items-center py-1.5 text-[11px] border-b border-white/[0.03]" style={{ gridTemplateColumns: "62px 52px 46px 1fr 76px 92px 1.5fr", gap: 8 }}>
                  <div className="font-mono tabular-nums text-[#9CA3AF]">{tradeTime}</div>
                  <div><span className="font-bold" style={{ color: side === "BUY" ? "#22c55e" : "#FF605D" }}>{side}</span></div>
                  <div><span className="font-bold" style={{ color: isCall ? "#22c55e" : "#FF605D" }}>{isCall ? "Call" : "Put"}</span></div>
                  <div className="font-mono tabular-nums text-white truncate">{t.strike_fmt || t.strike}<span className="text-[#6B7280]"> · {t.expiration}</span></div>
                  <div className="font-mono tabular-nums text-right text-[#E7E5E4]">{typeof t.contracts === "number" ? t.contracts.toLocaleString() : t.contracts}</div>
                  <div className="font-mono tabular-nums text-right font-semibold text-white">{t.premium_fmt || fmtPrem(t.premium)}</div>
                  <div className="flex flex-wrap gap-1 overflow-hidden">
                    {conds.length ? conds.map((b, i) => (<span key={i} className="text-[9px] font-semibold rounded whitespace-nowrap" style={{ padding: "2px 6px", background: "rgba(34,211,238,0.10)", color: "#67e8f9", border: "1px solid rgba(34,211,238,0.20)" }}>{b.label}</span>)) : <span className="text-[#3D4D63]">—</span>}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default function ScannerPage() {
  const router = useRouter()
  const [trades, setTrades] = useState<Trade[]>([])
  const [stats, setStats] = useState<Stats>({ count: 0, bull: 0, bear: 0, lean: "MIXED", pc_ratio: 0 })
  // Phase 1 (Scanner = today-only, 2026-05-17): timeRange hardcoded.
  // Historical browsing moved to /historical. Hardcoded as `string` (not
  // `as const`) so TS doesn't narrow non-today branches to `never`.
  const timeRange: string = "today"
  const [page, setPage] = useState(0)

  // 1s ticker for the footer "Updated Xs ago" indicator. Reads
  // lastSuccessRef.current at render time; the tick triggers re-render.
  // Whole page re-renders every 1s but AG Grid uses imperative gridApi
  // updates so its rowData is unaffected.
  // Server-side total filtered count (Patch — 2026-05-17). Populated
  // from fd.meta.total on page 0; reused across pagination (server
  // returns it cached 60s). null when unknown — footer falls back to
  // trades.length so the "of Y" suffix never disappears.
  const [serverTotal, setServerTotal] = useState<number | null>(null)

  const [nowTs, setNowTs] = useState(Date.now())
  useEffect(() => {
    const id = setInterval(() => setNowTs(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  // Hydration gate (2026-05-18). useAgGridEndpoint() reads localStorage +
  // URL params → returns false on the build server (typeof window check)
  // but true for default subscribers on the client. JSX conditional at
  // ~line 2360 would render different subtrees server vs client → #418.
  // Render a stable loader placeholder until mount, then swap to the
  // real conditional. Reusable by any future SSR/CSR-divergent renderer.
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  // Density (Round 1, 2026-05-18) — extended from 2 levels (compact/
  // comfortable @ 35/44px) to 3 levels (compact/comfortable/spacious
  // @ 28/35/48px). Existing pb_density localStorage values remap
  // cleanly: any prior "compact"/"comfortable" still parses; new
  // "spacious" appears via the popover UI.
  type Density = "compact" | "comfortable" | "spacious"
  const [density, setDensity] = useState<Density>("comfortable")
  const [densityOpen, setDensityOpen] = useState(false)
  useEffect(() => {
    if (typeof window === "undefined") return
    const v = window.localStorage.getItem("pb_density")
    if (v === "compact" || v === "comfortable" || v === "spacious") setDensity(v)
  }, [])
  useEffect(() => {
    if (typeof window === "undefined") return
    try { window.localStorage.setItem("pb_density", density) } catch {}
  }, [density])
  const rowHeightPx = density === "compact" ? 28 : density === "spacious" ? 48 : 35
  const [search, setSearch] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [loading, setLoading] = useState(true)
  // Initial-hydration gate (2026-05-19). loading flips true on every
  // refetch (initial mount, page change, filter-change refetch). The
  // skeleton should only appear on the FIRST window where trades is
  // still empty — never on subsequent refetches where stale data is
  // already on screen. Tracks via state (not ref) so the conditional
  // render reacts to the transition.
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false)
  // hasFullData (2026-05-19) — true only after the FULL fetch lands.
  // The light fetch populates rows fast (table skeleton clears) but its
  // client-computed displayStats over just 200 rows is wrong (off ~100x).
  // So the dashboard stays skeleton until the full ~12K rows arrive,
  // then displayStats recomputes over the real set. Decouples the
  // dashboard skeleton (clears on full) from the table skeleton (clears
  // on light).
  const [hasFullData, setHasFullData] = useState(false)
  // Hydration-safe (2026-05-18). Was useState(isMarketOpen()) — that
  // initializer calls new Date() at evaluation time, so build-time
  // (e.g. Sunday deploy, market closed → false) and client first render
  // (Monday market hours → true) produce different values, firing
  // React #418. Init false, then reconcile in a post-mount effect.
  // setLive(isMarketOpen()) is already called from the polling tick at
  // ~line 1349; this mount effect just establishes the correct first
  // state before the polling loop spins up.
  const [live, setLive] = useState(false)
  useEffect(() => { setLive(isMarketOpen()) }, [])
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [activePage, setActivePage] = useState<"scanner" | "heatmap" | "watchlist">("scanner")
  // false until the ?view= effect resolves the initial tab from the URL. Flow
  // fetch/SSE/poll effects wait for this so a heatmap deep-link (?view=heatmap)
  // doesn't fire a one-shot flow request while activePage is still its default.
  const [viewReady, setViewReady] = useState(false)
  const [canAccessGamma, setCanAccessGamma] = useState(false)
  // Flow entitlement (premium/pro_bundle/beta/lifetime). Default true so entitled
  // users aren't briefly gated before /api/me resolves; server 403 is the real gate.
  const [canAccessFlow, setCanAccessFlow] = useState(true)
  // Set when a flow endpoint returns 403 (authenticated but wrong tier, e.g.
  // heatmap). Distinct from session-expiry — must NOT redirect to /login.
  const [flowLocked, setFlowLocked] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [gexSymbol, setGexSymbol] = useState("SPY")
  const [liveGexSpot, setLiveGexSpot] = useState<number | null>(null)
  const [gexData, setGexData] = useState<GexSnapshot | null>(null)
  const [gexLoading, setGexLoading] = useState(false)
  const [gexError, setGexError] = useState("")
  const [gexUpdatedAt, setGexUpdatedAt] = useState<Date | null>(null)
  const [gexShowAll, setGexShowAll] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)

  // Read ?view=heatmap on mount so /heatmap redirects (and any deep links)
  // can land directly on the heatmap tab. Effect runs once after activePage
  // is initialized so we don't fight the default "scanner".
  useEffect(() => {
    if (typeof window === "undefined") return
    const params = new URLSearchParams(window.location.search)
    const v = params.get("view")
    if (v === "heatmap") setActivePage("heatmap")
    else if (v === "watchlist") setActivePage("watchlist")
    const symParam = params.get("symbol")
    if (symParam && /^[A-Za-z.]{1,6}$/.test(symParam)) { setSearch(symParam.toUpperCase()); setSearchInput(symParam.toUpperCase()) }
    setViewReady(true)
  }, [])

  // S = open command palette. Bare-letter shortcut, focus-aware. Only active
  // on the heatmap tab to avoid surprising users on the flow scanner.
  useEffect(() => {
    if (activePage !== "heatmap") return
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const t = e.target as HTMLElement | null
      if (t) {
        const tag = t.tagName
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return
        if (t.isContentEditable) return
      }
      if (e.key === "s" || e.key === "S") { e.preventDefault(); setPaletteOpen(true) }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [activePage])
  const [watchlist, setWatchlist] = useState<string[]>([])
  const [wlQuotes, setWlQuotes] = useState<Record<string, { spot: number | null; change: number | null; change_pct: number | null; prev_close: number | null }>>({})
  const [wlSparks, setWlSparks] = useState<Record<string, number[]>>({})
  const [wlExpanded, setWlExpanded] = useState<string | null>(null)
  const [wlSort, setWlSort] = useState<{ key: "symbol" | "price" | "change" | "callFlow" | "putFlow" | "signals" | "lastSignal"; dir: "asc" | "desc" }>({ key: "change", dir: "desc" })
  const [wlInput, setWlInput] = useState("")
  // Watchlist view mode: 'flow' (existing) | 'overview' (new enrichment columns).
  // Default 'flow' so existing users see no change on first load; persisted to
  // localStorage. Read post-mount (effect) to avoid an SSR/client hydration mismatch.
  const [wlViewMode, setWlViewMode] = useState<"overview" | "flow">("flow")
  useEffect(() => {
    try {
      const v = localStorage.getItem("pb_watchlist_view_mode")
      if (v === "overview" || v === "flow") setWlViewMode(v)
    } catch {}
  }, [])
  const setWlViewModePersist = useCallback((m: "overview" | "flow") => {
    setWlViewMode(m)
    try { localStorage.setItem("pb_watchlist_view_mode", m) } catch {}
  }, [])
  // Snapshot enrichment only fetches when the user is actually viewing Overview
  // (the hook skips entirely on an empty symbol list).
  // Fetched across the whole Watch tab (both modes) so ticker logos + names
  // resolve in Flow mode too; Overview additionally renders mcap/iv/optvol.
  const wlSnapshotSymbols = (activePage === "watchlist") ? watchlist : []
  const { data: wlSnapshot } = useWatchlistSnapshot(wlSnapshotSymbols)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [marketOpen, setMarketOpen] = useState(false)
  useEffect(() => {
    const check = () => {
      const et = new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" }))
      const day = et.getDay()
      const mins = et.getHours() * 60 + et.getMinutes()
      setMarketOpen(day >= 1 && day <= 5 && mins >= 570 && mins < 960)
    }
    check()
    const id = setInterval(check, 30000)
    return () => clearInterval(id)
  }, [])
  const audioCtxRef = useRef<AudioContext | null>(null)
  const audioBufferRef = useRef<AudioBuffer | null>(null)
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const prevTradeIdsRef = useRef<Set<number>>(new Set())
  const [showFilters, setShowFilters] = useState(false)
  const [filterGrade, setFilterGrade] = useState("")
  const [filterType, setFilterType] = useState("")
  const [filterOptType, setFilterOptType] = useState("")
  const [filterMinPremium, setFilterMinPremium] = useState<string>("")
  const [filterMinContracts, setFilterMinContracts] = useState(0)
  const [filterMinVolOi, setFilterMinVolOi] = useState(0)
  const [presets, setPresets] = useState<FilterPreset[]>([])

  // Hydrate from localStorage (instant) then reconcile with server (source of truth).
  // Anonymous users get 302 from the API and stay on local-only — no regression.
  // First-time logged-in users with empty server state get a one-time upload of
  // whatever they had in localStorage, so existing presets aren't lost.
  useEffect(() => {
    try {
      const cP = JSON.parse(localStorage.getItem("pb_filter_presets") || "[]")
      const cW = JSON.parse(localStorage.getItem("pb_watchlist") || "[]")
      if (Array.isArray(cP)) setPresets(cP)
      if (Array.isArray(cW)) setWatchlist(cW)
    } catch {}

    // Server preferences hydrate (read-only at mount). The upload-when-
    // server-empty path was removed because legacy localStorage data was
    // tripping server validation — and the upload isn't load-bearing
    // anyway: any user-driven preset save / watchlist add fires syncPrefs
    // which writes the canonical shape to the server.
    fetch("/api/scanner/preferences", { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d) return
        const sP = Array.isArray(d.filter_presets) ? d.filter_presets : []
        const sW = Array.isArray(d.watchlist) ? d.watchlist : []
        if (sP.length > 0) {
          setPresets(sP)
          localStorage.setItem("pb_filter_presets", JSON.stringify(sP))
        }
        if (sW.length > 0) {
          setWatchlist(sW)
          localStorage.setItem("pb_watchlist", JSON.stringify(sW))
        }
      })
      .catch(() => {})
  }, [])

  // Debounced sync — 300ms after the last change, push to server.
  const prefSyncRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const syncPrefs = useCallback((patch: { filter_presets?: FilterPreset[]; watchlist?: string[] }) => {
    if (prefSyncRef.current) clearTimeout(prefSyncRef.current)
    prefSyncRef.current = setTimeout(() => {
      fetch("/api/scanner/preferences", {
        method: "PUT", credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(patch),
      }).catch(() => {})
    }, 300)
  }, [])
  const [presetName, setPresetName] = useState("")
  const [showSavePreset, setShowSavePreset] = useState(false)
  const [filterDte, setFilterDte] = useState("")
  const [filterSide, setFilterSide] = useState("")
  const [filterBuySell, setFilterBuySell] = useState("")
  const [filterUnusualOnly, setFilterUnusualOnly] = useState(false)
  const [filterNoIndex, setFilterNoIndex] = useState(false)
  // 2026-05-09: "Curated grades only" toggle. Default OFF = full coverage
  // (Grade A/B/PASS) — subscribers see PB's institutional flow tape on par with
  // Cheddar's coverage. Toggle ON = restore PB's traditional curated view
  // (Grade A/B only), hiding graded-PASS flow that conviction_grader Rules 6-9
  // route to PASS based on historical low-WR audits. Persists to localStorage
  // under pb_curated_grades. See project_pb_stage3_dte_filter_investigation.md
  // for the rationale (78.7% of 0-2 DTE flow gets PASS-graded; default-on
  // exposes that flow without changing the grader).
  // Hydration-safe (2026-05-18). Was useState(() => localStorage.getItem(...))
  // which mismatched #418 on static-export: build-time returned false, client
  // first render read the actual stored value. Now init to false, then
  // reconcile from localStorage in a post-mount effect below. Brief flicker
  // (sub-frame) is the SSR-safe tradeoff. Write-side persistence at lines
  // ~1421+ unchanged.
  const [filterCuratedOnly, setFilterCuratedOnly] = useState<boolean>(false)
  // 2026-05-10: companion to backend f182f0a which added exclude_side +
  // exclude_multi_leg query params on /api/scanner/feed and /live-flow.
  // Default OFF — opt-in via filter drawer toggles. exclude_side="MIDPOINT"
  // hides rows where the SIDE column would render "Mid" (NULL/NEUTRAL/MIDPOINT
  // aggression). exclude_multi_leg hides rows where structure is non-SINGLE_LEG
  // OR the OPRA badges include MULTI-LEG. Both filters apply both server-side
  // (snapshot) and client-side (over the live SSE-fed `trades` buffer) so the
  // toggle state is visually consistent regardless of which delivery path a
  // row arrived on. Live SSE pushes from sse_scanner.py do not yet apply
  // these predicates server-side — client-side filtering covers that gap.
  const [filterExcludeMidpoint, setFilterExcludeMidpoint] = useState<boolean>(false)
  const [filterExcludeMultiLeg, setFilterExcludeMultiLeg] = useState<boolean>(false)
  // Post-mount localStorage hydration for the three filter toggles above.
  // Single combined effect: cheaper than three useEffects, same semantics.
  // Runs after the first paint, then the write-side useEffects at ~1421+
  // take over for any subsequent toggles.
  useEffect(() => {
    try {
      if (window.localStorage.getItem("pb_curated_grades") === "1") setFilterCuratedOnly(true)
      if (window.localStorage.getItem("pb_exclude_midpoint") === "1") setFilterExcludeMidpoint(true)
      if (window.localStorage.getItem("pb_exclude_multi_leg") === "1") setFilterExcludeMultiLeg(true)
    } catch {}
  }, [])
  const [activeFilterCount, setActiveFilterCount] = useState(0)
  const [focusTicker, setFocusTicker] = useState<string | null>(null)
  const [focusStrike, setFocusStrike] = useState<string | null>(null)
  const [focusExpiry, setFocusExpiry] = useState<string | null>(null)
  // Server-side sort (2026-05-15) — AG Grid header click → setSortField/Dir
  // → buildScannerUrl threads ?sort=&order= → backend ORDER BY on full
  // result set (not just the current page).
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<"asc" | "desc" | null>(null)
  // Day separators only valid on multi-day non-today ranges + time-sorted
  // rows. Refs let agGridReplace decide at call-time without re-binding.
  const sortFieldRef = useRef<string | null>(null)
  useEffect(() => { sortFieldRef.current = sortField }, [sortField])
  const lastTradeIdRef = useRef<number>(0)
  const isFirstLoadRef = useRef<boolean>(true)
  const tableContainerRef = useRef<HTMLDivElement>(null)
  // Phase 2: topic_id from latest /api/scanner/feed snapshot drives the SSE
  // subscription. State (not just ref) so the SSE effect re-runs when it
  // changes — that's how filter-change reconnects (#6 path).
  const [topicId, setTopicId] = useState<string | null>(null)
  const feedColumnsRef = useRef<string[] | null>(null)

  // userTier (2026-05-18) — drives CSV export row cap. Free tiers
  // capped at 1000 rows; pro/beta/lifetime/heatmap unlimited. Source
  // of truth is server-side via /api/me — frontend cap is a polite
  // default; real enforcement is a future backend concern.
  const [userTier, setUserTier] = useState<string | null>(null)
  useEffect(() => {
    fetch("/api/me").then(r => r.ok ? r.json() : null).then(d => {
      if (d) {
        setCanAccessGamma(d.gamma_wall)
        // flow_access defaults true if the server omits it (older builds) so we
        // never wrongly lock an entitled user out of the flow tab.
        setCanAccessFlow(d.flow_access ?? true)
        setUserTier(d.tier ?? null)
      }
    }).catch(() => {})
  }, [])

  const gexReqIdRef = useRef(0)
  useEffect(() => {
    if (activePage !== "heatmap" || !canAccessGamma) return
    const reqId = ++gexReqIdRef.current
    setGexLoading(true); setGexError("")
    fetch(`/api/scanner/gex-heatmap?symbol=${gexSymbol}`)
      .then(r => r.json())
      .then(d => {
        if (reqId !== gexReqIdRef.current) return  // stale response — newer symbol selected
        if (d.error) { setGexError(d.error); setGexData(null) } else { setGexData(d); setGexUpdatedAt(new Date()) }
      })
      .catch(() => { if (reqId === gexReqIdRef.current) setGexError("Failed to load") })
      .finally(() => { if (reqId === gexReqIdRef.current) setGexLoading(false) })
  }, [activePage, canAccessGamma, gexSymbol])

  // Batch live-quote polling for the watchlist tab. One HTTP call per
  // refresh covers every symbol in the list. 15s cadence is plenty for a
  // watchlist (vs 2s on the heatmap header) — these are reference quotes,
  // not active trading data. Pauses when tab is hidden.
  useEffect(() => {
    if (activePage !== "watchlist" || watchlist.length === 0) return
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | null = null
    const tick = async () => {
      if (cancelled) return
      if (!document.hidden) {
        try {
          const r = await fetch(`/api/scanner/watchlist-quotes?symbols=${watchlist.join(",")}`)
          if (r.ok) {
            const j = await r.json()
            if (!cancelled) setWlQuotes(j)
          }
        } catch { /* network blip */ }
      }
      timer = setTimeout(tick, 15000)
    }
    tick()
    return () => { cancelled = true; if (timer) clearTimeout(timer) }
  }, [activePage, watchlist])

  // 5-day sparkline data — fetched once per watchlist change, cached server-
  // side 1h. No tick polling needed; daily closes don't change intraday at
  // bar resolution.
  useEffect(() => {
    if (activePage !== "watchlist" || watchlist.length === 0) return
    let cancelled = false
    fetch(`/api/scanner/watchlist-sparks?symbols=${watchlist.join(",")}`)
      .then(r => r.ok ? r.json() : null)
      .then(j => { if (j && !cancelled) setWlSparks(j) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [activePage, watchlist])

  // Live spot polling for the embedded heatmap (matches /heatmap page).
  // OI is fixed intraday — only spot moves tick-to-tick. Cheap dedicated
  // endpoint, 2s during market hours, 30s after close.
  useEffect(() => {
    if (activePage !== "heatmap" || !canAccessGamma) return
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | null = null
    const isMarketHours = () => {
      const now = new Date()
      const et = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }))
      const day = et.getDay()
      if (day === 0 || day === 6) return false
      const mins = et.getHours() * 60 + et.getMinutes()
      return mins >= 9 * 60 + 30 && mins < 16 * 60
    }
    const tick = async () => {
      if (cancelled) return
      if (!document.hidden) {
        try {
          const r = await fetch(`/api/scanner/spot?symbol=${gexSymbol}`)
          if (r.ok) {
            const j = await r.json()
            if (!cancelled && typeof j.spot === "number") setLiveGexSpot(j.spot)
          }
        } catch { /* network blip */ }
      }
      timer = setTimeout(tick, isMarketHours() ? 2000 : 30000)
    }
    tick()
    return () => { cancelled = true; if (timer) clearTimeout(timer) }
  }, [activePage, canAccessGamma, gexSymbol])

  const addToWatchlist = useCallback((input: string) => {
    // Accept single symbol OR comma/space-separated multi (e.g.
    // "AAPL, MSFT, NVDA" pasted from a spreadsheet column).
    const parts = input.toUpperCase().split(/[\s,;]+/).map(s => s.trim()).filter(Boolean)
    if (!parts.length) return
    const next = [...watchlist]
    for (const s of parts) {
      // Light validation — 1-6 alpha chars + optional .B-style suffix.
      if (s.length > 6 || !/^[A-Z]+(\.[A-Z])?$/.test(s)) continue
      if (!next.includes(s)) next.push(s)
    }
    if (next.length === watchlist.length) return
    setWatchlist(next)
    localStorage.setItem("pb_watchlist", JSON.stringify(next))
    syncPrefs({ watchlist: next })
  }, [watchlist, syncPrefs])

  const removeFromWatchlist = useCallback((sym: string) => {
    const updated = watchlist.filter(s => s !== sym)
    setWatchlist(updated)
    localStorage.setItem("pb_watchlist", JSON.stringify(updated))
    syncPrefs({ watchlist: updated })
  }, [watchlist, syncPrefs])

  // Blip latency enhancement (2026-05-11): pre-decoded AudioBuffer played
  // via BufferSource. Sub-ms .start()-to-audible vs the prior
  // HTMLAudioElement ~10-30ms decoder cold-start. Same alert.mp3 sample,
  // same 0.6 volume (set on the persistent gain node), same single-voice
  // truncate-on-replay behavior (stop prior source before starting new).
  const ensureAudioCtx = (): AudioContext | null => {
    if (typeof window === "undefined") return null
    if (audioCtxRef.current) return audioCtxRef.current
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AC) return null
      const ctx = new AC()
      const gain = ctx.createGain()
      gain.gain.value = 0.6
      gain.connect(ctx.destination)
      audioCtxRef.current = ctx
      gainNodeRef.current = gain
      return ctx
    } catch { return null }
  }

  const ensureAudioBuffer = (ctx: AudioContext) => {
    if (audioBufferRef.current) return
    // decodeAudioData doesn't require a user gesture — safe to fire as
    // soon as we have the context. Silent on failure; playBlip will
    // simply no-op until the buffer arrives.
    fetch("/static/audio/alert.mp3")
      .then(r => r.arrayBuffer())
      .then(buf => ctx.decodeAudioData(buf))
      .then(decoded => { audioBufferRef.current = decoded })
      .catch(() => { /* network/decode failure — bail silently */ })
  }

  const playBlip = useCallback(() => {
    if (!soundEnabled) return
    const ctx = audioCtxRef.current
    const buffer = audioBufferRef.current
    const gain = gainNodeRef.current
    if (!ctx || !buffer || !gain) return
    // Suspended context (autoplay policy not yet satisfied) → skip; the
    // first-gesture listener below will resume and subsequent blips fire.
    if (ctx.state === "suspended") return
    try {
      // Truncate-on-replay: stop the prior source if it's still playing,
      // matching the previous HTMLAudio `currentTime = 0` semantics so
      // rapid blips don't acoustically stack.
      if (currentSourceRef.current) {
        try { currentSourceRef.current.stop() } catch { /* already ended */ }
        currentSourceRef.current.disconnect()
      }
      const source = ctx.createBufferSource()
      source.buffer = buffer
      source.connect(gain)
      source.start(0)
      currentSourceRef.current = source
      source.onended = () => {
        if (currentSourceRef.current === source) currentSourceRef.current = null
      }
    } catch { /* audio unavailable */ }
  }, [soundEnabled])

  // Pre-warm under the first user gesture: creates the AudioContext +
  // GainNode, kicks off the MP3 fetch+decode (async, ~50-200ms), and
  // resumes the context. By the time the first SSE batch arrives, the
  // buffer is decoded and BufferSource.start() is sub-ms.
  const prewarmAudio = useCallback(() => {
    const ctx = ensureAudioCtx()
    if (!ctx) return
    ensureAudioBuffer(ctx)
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => { /* user gesture not yet observed */ })
    }
  }, [])

  // Extracted from the inline JSX onClick so the off→on transition can
  // fire prewarmAudio() under the same user gesture browsers require for
  // autoplay-policy compliance.
  const toggleSound = useCallback(() => {
    const next = !soundEnabled
    if (next) prewarmAudio()
    setSoundEnabled(next)
  }, [soundEnabled, prewarmAudio])

  // Refs to break dep churn — see plan: scanner live-update fix.
  // playBlip via ref so sound toggles don't rebuild fetchData.
  // fetchDataRef so polling/reset effects don't re-run on fetchData identity changes.
  // lastSuccessRef + pollError power the connection-status banner + stale watchdog.
  const playBlipRef = useRef<() => void>(() => {})
  const fetchDataRef = useRef<((opts?: { initial?: boolean; pageNum?: number; light?: boolean; forceFull?: boolean }) => Promise<void>) | null>(null)
  const lastSuccessRef = useRef<number>(Date.now())
  const [pollError, setPollError] = useState<string | null>(null)

  // Phase 5 (2026-05-11): AG Grid migration. gridApi captured via
  // ScannerAgGrid's onApiReady callback. Two helpers below paired with
  // every setTrades site so the grid stays in sync without going through
  // React's prop-diff path. agGridReplace fires for full snapshots
  // (page/range/filter change); agGridAdd fires for SSE batched flushes
  // and incremental polling.
  const gridApiRef = useRef<GridApi<Trade> | null>(null)
  const handleAgGridApiReady = useCallback((api: GridApi<Trade>) => {
    gridApiRef.current = api
  }, [])
  const agGridReplace = useCallback((rows: Trade[]) => {
    const api = gridApiRef.current
    if (!api) return
    api.setGridOption("rowData", rows.filter((t) => !t.mm_suspected))
    // CONDS autoHeight stale-height workaround (2026-05-12, revised
    // 2026-05-18). After a full snapshot replace, AG Grid v35
    // occasionally retains prior measured row heights for the new
    // content, causing phantom empty bands where a tall (wrapped-badges)
    // row is replaced by a short one. Was resetRowHeights() — AG Grid
    // v35 emits Warning #3 ("cannot be called when one or more columns
    // has Auto Row Height enabled") for that API path. redrawRows()
    // also forces remeasure on autoHeight columns AND is the supported
    // path; cost negligible at ~25 visible virtualized rows.
    api.redrawRows()
  }, [])
  const agGridAdd = useCallback((rows: Trade[]) => {
    const api = gridApiRef.current
    if (!api) return
    const fresh = rows.filter((t) => !t.mm_suspected)
    if (fresh.length === 0) return
    // getRowId on the grid de-dupes — re-adding an id already present
    // is a no-op (returns an empty `add` transaction).
    const result = api.applyTransaction({ add: fresh, addIndex: 0 })
    // CONDS autoHeight stale-height workaround (2026-05-12, revised
    // 2026-05-18). Freshly inserted rows can render with mis-measured
    // heights when CondsCellRenderer mounts after AG Grid's first
    // height read. Was resetRowHeights() — emits Warning #3 with
    // autoHeight columns. Scoped redrawRows({rowNodes: ...}) only
    // remeasures the just-added nodes (typically 1-50 per SSE batch
    // flush) instead of all ~25 visible rows — cheaper and correct.
    const added = result?.add
    if (added && added.length > 0) api.redrawRows({ rowNodes: added })
  }, [])
  useEffect(() => { playBlipRef.current = playBlip }, [playBlip])

  // soundEnabled defaults to true with no localStorage persistence, so
  // most users land with sound on and never click the toggle. Without
  // this, the toggleSound pre-warm fires for almost no one in practice.
  // Register a one-shot listener on the first user gesture (click or
  // keypress anywhere in the document) to fire prewarmAudio() under
  // that gesture. { once: true } auto-removes per-event after firing;
  // the manual removes inside `warm` cover the case where one event
  // fires first and we want to drop the listener for the other event
  // type too. Cleanup return covers component unmount before either
  // event arrives.
  useEffect(() => {
    if (!soundEnabled) return
    const warm = () => {
      prewarmAudio()
      document.removeEventListener("click", warm)
      document.removeEventListener("keydown", warm)
    }
    document.addEventListener("click", warm, { once: true })
    document.addEventListener("keydown", warm, { once: true })
    return () => {
      document.removeEventListener("click", warm)
      document.removeEventListener("keydown", warm)
    }
  }, [soundEnabled, prewarmAudio])

  // ── SSE — Phase 2 row-push splicing when feed flag is on; legacy doorbell otherwise ──
  //
  // Feed mode (useFeedEndpoint() && topicId): subscribe to /api/scanner/stream?topic=<id>
  // and splice each event:row directly into state. event:agg replaces the sidebar
  // widget stats. The polling tick effect below short-circuits in this mode, so
  // updates are push-only.
  //
  // Legacy mode: doorbell that debounces fetchData on event:signal — pre-Phase-2
  // behavior, kept intact for the flag-off branch and as fallback when topicId
  // hasn't resolved yet.
  //
  // Effect re-runs on topicId change → close + reopen with new topic. That
  // covers Phase 2 #6 (filter change → new snapshot → new topic_id) for free.
  const sseConnRef = useRef<EventSource | null>(null)
  const sseDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Phase 2 #5: 60s stale-connection guard. Watchdog interval inside the
  // SSE effect refreshes only when feedMode is active.
  const sseStaleCheckRef = useRef<ReturnType<typeof setInterval> | null>(null)
  // Tier 2 SSE batching (2026-05-11): coalesce row-push events into ~200ms
  // flushes so heavy flow (5-10 sigs/sec) produces 3-5 renders/sec instead
  // of one render per row. sseBufferRef accumulates incoming rows;
  // sseFlushTimerRef schedules the next flush; sseBufferBlipRef tracks
  // whether any buffered row matched the active filter (so the blip
  // fires once per batch instead of once per row).
  const sseFlushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const sseBufferRef = useRef<Trade[]>([])
  const sseBufferBlipRef = useRef(false)
  useEffect(() => {
    if (page !== 0) return
    if (!viewReady) return  // wait until ?view resolves the initial tab
    if (activePage !== "scanner") return  // flow stream only on the flow tab; heatmap/watchlist don't subscribe (avoids 403 retry storm)
    const feedMode = useFeedEndpoint() && !!topicId

    // Stale-guard reconnect — closes the current ES, refetches the snapshot
    // (forcing the feed-snapshot branch by resetting isFirstLoadRef), then
    // reopens. If fetchData updates topicId, the effect re-runs and reopens
    // with the new topic; the open() guard at the bottom is a no-op in that
    // case. If topicId is unchanged, the explicit open() is what reconnects.
    const reconnect = async () => {
      setPollError("Connection stalled — reconnecting…")
      if (sseStaleCheckRef.current) { clearInterval(sseStaleCheckRef.current); sseStaleCheckRef.current = null }
      if (sseConnRef.current) { sseConnRef.current.close(); sseConnRef.current = null }
      // Force fetchData onto the snapshot path. Without this, the since_id
      // incremental branch fires and hits legacy live-flow — wrong target
      // for feed-mode catch-up.
      isFirstLoadRef.current = true
      lastTradeIdRef.current = 0
      const p = fetchDataRef.current?.({ pageNum: 0 })
      if (p && typeof (p as Promise<void>).then === "function") {
        try { await p } catch {}
      }
      if (!document.hidden) open()
      setPollError(null)
    }

    const open = () => {
      if (sseConnRef.current) return
      try {
        const url = feedMode
          ? `/api/scanner/stream?topic=${encodeURIComponent(topicId!)}`
          : "/api/scanner/stream"
        const es = new EventSource(url)
        sseConnRef.current = es
        // Initialize heartbeat so the watchdog doesn't trip on the silence
        // before the first event arrives. The server sends event:agg
        // immediately on connect (Phase 2 #3), so this typically refreshes
        // within ~100ms anyway.
        lastSuccessRef.current = Date.now()

        if (feedMode) {
          // Tier 2 SSE batching parameters. 200ms is the perception floor —
          // user reads continuous, server keeps pace; 50-row escape valve
          // bounds worst-case wait under extreme flow (e.g. open auction).
          // Tunable; current values land at the "smooth tape" point per
          // perf-tab observation. See commit message for the before/after.
          const FLUSH_INTERVAL_MS = 200
          const FLUSH_MAX_BUFFER = 50

          const flushSseBuffer = () => {
            if (sseFlushTimerRef.current) {
              clearTimeout(sseFlushTimerRef.current)
              sseFlushTimerRef.current = null
            }
            const batch = sseBufferRef.current
            if (batch.length === 0) return
            sseBufferRef.current = []
            const shouldBlip = sseBufferBlipRef.current
            sseBufferBlipRef.current = false
            setTrades(prev => {
              // Dedupe across both directions: the server may republish on
              // reconnect AND the buffer may contain repeats. Build a seen
              // set from existing rows + batch, then prepend only fresh.
              const seen = new Set(prev.map(p => p.id))
              const fresh: Trade[] = []
              for (const t of batch) {
                if (seen.has(t.id)) continue
                seen.add(t.id)
                fresh.push(t)
              }
              if (fresh.length === 0) return prev
              // Phase 5: dispatch fresh batch to AG Grid imperatively. Gate
              // through matchesFilterRef so SSE row-push respects the current
              // filter (sse_scanner.py does not apply server predicates on
              // the topic stream). Trades buffer stays unfiltered so client-
              // only widenings — search / focusTicker — can recover rows on
              // the next matchesFilter recompute without a re-fetch.
              const visibleFresh = fresh.filter(matchesFilterRef.current)
              if (visibleFresh.length > 0) agGridAdd(visibleFresh)
              return [...fresh, ...prev].slice(0, 20000)
            })
            // Blip is one-per-batch (was one-per-row pre-2026-05-11). The
            // UX delta is intentional: per-row dinging on heavy flow was
            // itself part of the choppy feel. Batched matches the smoother
            // tape this commit ships.
            if (shouldBlip) playBlipRef.current()
          }

          es.addEventListener("row", (ev) => {
            const cols = feedColumnsRef.current
            if (!cols) return
            let row: RawRow
            try { row = JSON.parse((ev as MessageEvent).data) as RawRow }
            catch { return }
            const incoming = rowsToTrades([row], cols)
            if (incoming.length === 0) return
            const t = incoming[0]
            sseBufferRef.current.push(t)
            if (matchesFilterRef.current(t)) sseBufferBlipRef.current = true
            lastTradeIdRef.current = Math.max(lastTradeIdRef.current, t.id)
            lastSuccessRef.current = Date.now()
            setPollError(null)
            // Heavy-flow escape valve: flush immediately if the buffer
            // exceeds the threshold so worst-case wait stays bounded.
            // Otherwise, coalesce by scheduling a single flush.
            if (sseBufferRef.current.length >= FLUSH_MAX_BUFFER) {
              flushSseBuffer()
            } else if (!sseFlushTimerRef.current) {
              sseFlushTimerRef.current = setTimeout(flushSseBuffer, FLUSH_INTERVAL_MS)
            }
          })
          es.addEventListener("agg", () => {
            // Sidebar widgets read `displayStats` (useMemo over `filtered`),
            // which is purely client-derived from the visible row set —
            // including all client-only filters (search/grade/side/etc) the
            // server topic doesn't know about. Server agg over the universe
            // would clobber a TSLA-only display, so we don't write it.
            // Handler stays alive as a heartbeat for the stale guard below.
            lastSuccessRef.current = Date.now()
          })
          // 60s stale-connection guard. Server-side keepalive is a 15s
          // event:ping (already refreshes lastSuccessRef via the row/agg
          // handlers in steady state, plus event:agg every 5–10s in #3).
          // If 60s pass with nothing, the connection is dead — Cloudflare
          // dropped the stream, server restarted, or the network blip
          // outlasted keepalives. Reconnect.
          sseStaleCheckRef.current = setInterval(() => {
            if (document.hidden) return
            if (Date.now() - lastSuccessRef.current < 60000) return
            reconnect()
          }, 15000)
        } else {
          es.addEventListener("signal", () => {
            if (sseDebounceRef.current) return
            sseDebounceRef.current = setTimeout(() => {
              sseDebounceRef.current = null
              if (!document.hidden) fetchDataRef.current?.({ pageNum: 0 })
            }, 250)
          })
        }
      } catch {}
    }
    const close = () => {
      if (sseDebounceRef.current) { clearTimeout(sseDebounceRef.current); sseDebounceRef.current = null }
      if (sseStaleCheckRef.current) { clearInterval(sseStaleCheckRef.current); sseStaleCheckRef.current = null }
      if (sseConnRef.current) { sseConnRef.current.close(); sseConnRef.current = null }
    }
    const onVis = () => { document.hidden ? close() : open() }
    open()
    document.addEventListener("visibilitychange", onVis)
    return () => {
      // Tier 2 cleanup: flush any pending buffered SSE rows before tear-down
      // so rows arriving in the last ~200ms before topic/page change or
      // unmount aren't dropped on the floor.
      if (sseFlushTimerRef.current) {
        clearTimeout(sseFlushTimerRef.current)
        sseFlushTimerRef.current = null
      }
      if (sseBufferRef.current.length > 0) {
        const batch = sseBufferRef.current
        sseBufferRef.current = []
        const shouldBlip = sseBufferBlipRef.current
        sseBufferBlipRef.current = false
        setTrades(prev => {
          const seen = new Set(prev.map(p => p.id))
          const fresh: Trade[] = []
          for (const t of batch) {
            if (seen.has(t.id)) continue
            seen.add(t.id)
            fresh.push(t)
          }
          if (fresh.length === 0) return prev
          agGridAdd(fresh)
          return [...fresh, ...prev].slice(0, 20000)
        })
        if (shouldBlip) playBlipRef.current()
      }
      close()
      document.removeEventListener("visibilitychange", onVis)
    }
  }, [page, topicId, activePage, viewReady])

  const savePreset = (name: string) => {
    if (!name.trim()) return
    const preset: FilterPreset = {
      name: name.trim(),
      filters: {
        grade: filterGrade, type: filterType, optType: filterOptType, side: filterSide,
        dte: filterDte, unusualOnly: filterUnusualOnly, noIndex: filterNoIndex,
        minPremium: filterMinPremium, minContracts: filterMinContracts, minVolOi: filterMinVolOi,
      },
    }
    const updated = [...presets.filter(p => p.name !== preset.name), preset]
    setPresets(updated)
    localStorage.setItem("pb_filter_presets", JSON.stringify(updated))
    syncPrefs({ filter_presets: updated })
    setPresetName("")
    setShowSavePreset(false)
  }

  const loadPreset = (preset: FilterPreset) => {
    const f = preset.filters
    setFilterGrade(f.grade); setFilterType(f.type); setFilterOptType(f.optType)
    setFilterSide(f.side); setFilterDte(f.dte); setFilterUnusualOnly(f.unusualOnly)
    setFilterNoIndex(f.noIndex); setFilterMinPremium(f.minPremium)
    setFilterMinContracts(f.minContracts || 0); setFilterMinVolOi(f.minVolOi || 0)
  }

  const deletePreset = (name: string) => {
    const updated = presets.filter(p => p.name !== name)
    setPresets(updated)
    localStorage.setItem("pb_filter_presets", JSON.stringify(updated))
    syncPrefs({ filter_presets: updated })
  }

  const resetFilters = () => {
    setFilterGrade(""); setFilterType(""); setFilterOptType(""); setFilterSide("")
    setFilterDte(""); setFilterUnusualOnly(false); setFilterNoIndex(false); setFilterCuratedOnly(false); setFilterExcludeMidpoint(false); setFilterExcludeMultiLeg(false)
    setFilterMinPremium(""); setFilterMinContracts(0); setFilterMinVolOi(0)
  }

  const buildUrl = useCallback((opts?: { sinceId?: number; pageNum?: number }) => {
    const p = new URLSearchParams()
    if (filterMinPremium !== "") p.set("min_premium", filterMinPremium)
    if (filterDte === "0dte") p.set("max_dte", "0")
    else if (filterDte === "1-7") p.set("max_dte", "7")
    else if (filterDte === "8-30") p.set("max_dte", "30")
    p.set("slim", "true")
    // Bug 2 slice (grade-set unification, 2026-05-11): mirror buildFeedUrl's
    // grades behavior so paginated live-flow pages match the feed snapshot.
    // Without this, page 0 (feed, A,B,PASS) and pages 1+ (live-flow, A,B
    // backend-default) returned different result sets and pagination was
    // a discontinuity, not a continuation. Same toggle the user sees in
    // the filter panel ("Curated grades only") now drives both endpoints.
    p.set("grades", filterCuratedOnly ? "A,B" : "A,B,PASS")
    if (filterExcludeMidpoint) p.set("exclude_side", "MIDPOINT")
    if (filterExcludeMultiLeg) p.set("exclude_multi_leg", "1")
    if (opts?.sinceId && opts.sinceId > 0) p.set("since_id", opts.sinceId.toString())
    const pg = opts?.pageNum ?? 0
    if (pg > 0) { p.set("page", pg.toString()); p.set("page_size", "2000") }
    return `/api/scanner/live-flow?${p.toString()}`
  }, [timeRange, filterMinPremium, filterDte, filterCuratedOnly, filterExcludeMidpoint, filterExcludeMultiLeg])

  // Phase 1 feed-endpoint URL builder. Same filter shape as buildUrl, but
  // hits /api/scanner/feed (column-array, ~70% smaller payload). No
  // since_id or pagination yet — TODO when we either add since_id to the
  // feed endpoint or move incremental updates onto SSE in Phase 2.
  const buildFeedUrl = useCallback(() => {
    const p = new URLSearchParams()
    if (filterMinPremium !== "") p.set("min_premium", filterMinPremium)
    if (filterDte === "0dte") p.set("max_dte", "0")
    else if (filterDte === "1-7") p.set("max_dte", "7")
    else if (filterDte === "8-30") p.set("max_dte", "30")
    // grades default flipped 2026-05-09: full coverage (A,B,PASS) by default;
    // toggle ON restores the curated A,B-only view. Backend at
    // web/blueprints/scanner_sub.py accepts grades param and sanitizes to
    // any subset of {A, B, PASS}; default-on-server is still A,B so the
    // explicit param here is what produces the new default behavior.
    p.set("grades", filterCuratedOnly ? "A,B" : "A,B,PASS")
    if (filterExcludeMidpoint) p.set("exclude_side", "MIDPOINT")
    if (filterExcludeMultiLeg) p.set("exclude_multi_leg", "1")
    p.set("limit", "2000")
    return `/api/scanner/feed?${p.toString()}`
  }, [timeRange, filterMinPremium, filterDte, filterCuratedOnly, filterExcludeMidpoint, filterExcludeMultiLeg])

  // Phase 2 unified URL builder (2026-05-11). Single URL for page 0 +
  // page 1+ + incremental — points at /api/scanner/feed?unified=1 which
  // (per backend commit 0113d3f) now accepts page/page_size/since_id/
  // include_dashboard/include_sectors. Mirrors buildFeedUrl's filter
  // params + buildUrl's pagination params. include_dashboard=1 is sent
  // only on page 0 (page>0 dashboard is null per Q1).
  const buildScannerUrl = useCallback((opts?: { pageNum?: number; sinceId?: number; light?: boolean }) => {
    const pg = opts?.pageNum ?? 0
    const p = new URLSearchParams()
    p.set("unified", "1")
    if (filterMinPremium !== "") p.set("min_premium", filterMinPremium)
    if (filterDte === "0dte") p.set("max_dte", "0")
    else if (filterDte === "1-7") p.set("max_dte", "7")
    else if (filterDte === "8-30") p.set("max_dte", "30")
    p.set("grades", filterCuratedOnly ? "A,B" : "A,B,PASS")
    if (filterExcludeMidpoint) p.set("exclude_side", "MIDPOINT")
    if (filterExcludeMultiLeg) p.set("exclude_multi_leg", "1")
    if (sortField && sortDir) { p.set("sort", sortField); p.set("order", sortDir) }
    if (opts?.sinceId && opts.sinceId > 0) p.set("since_id", opts.sinceId.toString())
    if (pg > 0) { p.set("page", pg.toString()); p.set("page_size", "2000") }
    // Light mode (2026-05-19) — fast first-paint bootstrap (200 rows +
    // full-set agg via _compute_global_agg). Pairs with full follow-up
    // fetch scheduled from inside fetchData. Dashboard bundle skipped:
    // the full follow-up brings it in.
    if (opts?.light) p.set("light", "1")
    // Dashboard bundle is page-0 only (Q1 default). Skip on incremental
    // polls AND on light bootstrap.
    if (pg === 0 && !opts?.sinceId && !opts?.light) p.set("include_dashboard", "1")
    return `/api/scanner/feed?${p.toString()}`
  }, [timeRange, filterMinPremium, filterDte, filterCuratedOnly, filterExcludeMidpoint, filterExcludeMultiLeg, sortField, sortDir])

  // Feature flag: opt-in via `localStorage.setItem('pb_scanner_feed','1')` on
  // the browser DevTools console. Default OFF — existing live-flow path
  // continues to serve every user. After visual-diff bake-in this becomes
  // the default and the flag is removed. Read on each call so toggling
  // doesn't require a page reload.
  // TODO(Phase 1 frontend): remove flag + delete legacy live-flow branch
  // after a soak. TODO(Phase 2): once SSE streams rows directly, the
  // 'full load' branch becomes the only call path and polling disappears.
  const useFeedEndpoint = (): boolean => {
    if (typeof window === "undefined") return false
    try { return window.localStorage.getItem("pb_scanner_feed") === "1" }
    catch { return false }
  }

  // Phase 4 cutover reader (2026-05-11) — unified is the default.
  //   - ?unified=0 in URL                       → false (Q7 kill-switch, always wins)
  //   - ?unified=1 in URL                       → true  (explicit, redundant with default)
  //   - localStorage pb_scanner_unified === "0" → false (per-browser opt-out)
  //   - else                                    → true  (Phase 4 default)
  // Recovery: any subscriber can revert to legacy via
  // localStorage.setItem('pb_scanner_unified', '0') in DevTools, or per-
  // request via ?unified=0. Global rollback by reverting this commit OR
  // flipping SCANNER_UNIFIED=0 on the backend (legacy snapshot path is
  // preserved on the unflagged feed handler). See
  // project_pb_scanner_endpoint_unification_design.md §5 rollback.
  const useUnifiedEndpoint = (): boolean => {
    if (typeof window === "undefined") return false
    try {
      const url = new URL(window.location.href)
      const q = url.searchParams.get("unified")
      if (q === "0") return false
      if (q === "1") return true
      return window.localStorage.getItem("pb_scanner_unified") !== "0"
    } catch { return false }
  }

  // AG Grid migration Phase 8 cutover (2026-05-11) — AG Grid is the default.
  //   - ?ag=0 in URL                              → false (kill-switch, wins)
  //   - ?ag=1 in URL                              → true  (explicit, redundant)
  //   - localStorage pb_scanner_ag_grid === "0"   → false (per-browser opt-out)
  //   - else                                      → true  (Phase 8 default)
  // Recovery: any subscriber can revert to legacy via
  // localStorage.setItem('pb_scanner_ag_grid', '0') in DevTools, or per-
  // request via ?ag=0. Global rollback by reverting this commit — legacy
  // table path stays in the codebase for one trading day post-cutover
  // per memo §F Q4. After soak window clears, a separate cleanup commit
  // removes the legacy <table> rendering, deletes SignalRow.tsx, and
  // drops @tanstack/react-virtual if no other surfaces use it.
  // See project_pb_scanner_ag_grid_migration_design.md §H rollback.
  const useAgGridEndpoint = (): boolean => {
    if (typeof window === "undefined") return false
    try {
      const url = new URL(window.location.href)
      const q = url.searchParams.get("ag")
      if (q === "0") return false
      if (q === "1") return true
      return window.localStorage.getItem("pb_scanner_ag_grid") !== "0"
    } catch { return false }
  }

  // In-memory kill-switch: any shape-mismatch / 5xx on the unified path
  // flips this ref true for the rest of the session, so subsequent fetches
  // bypass unified and go straight to the legacy split. Reset on page
  // reload. Logged via console.warn so support can find it.
  const unifiedDisabledRef = useRef(false)

  // Latest snapshot meta — populated when fetchData uses the feed endpoint.
  // Holds topic_id (for Phase 2 SSE subscription) and updated_at.
  const feedMetaRef = useRef<FeedMeta | null>(null)

  // Detect a session-expired response. Flask's @subscriber_required returns a
  // 302 to /login (not 401/403). The browser fetch follows the redirect by
  // default, so res.status is 200 with res.redirected=true and res.url ending
  // in /login. Without this check, the polling loop silently swallows the
  // login HTML, fails JSON parse, and the user sees "Connection lost" forever
  // until they manually refresh. Spotted in the 16/199 302 ratio in access logs.
  // Session expiry → must bounce to /login. NOTE: 403 is NOT here — a 403 means
  // authenticated-but-not-entitled (e.g. heatmap hitting flow), which must show
  // a tier-locked state, not a login redirect (that caused a heatmap login-loop).
  const isAuthRedirect = (res: Response): boolean => {
    if (res.status === 401) return true
    if (res.redirected && res.url.includes("/login")) return true
    return false
  }
  // 403 from a flow endpoint = wrong tier. Lock the flow UI; never redirect.
  const isTierLocked = (res: Response): boolean => res.status === 403

  const fetchData = useCallback(async (opts?: { initial?: boolean; pageNum?: number; light?: boolean; forceFull?: boolean }) => {
    const pg = opts?.pageNum ?? page
    if (opts?.initial) setLoading(true)
    // Hard 12s timeout via AbortController. Without this, a hung fetch (slow
    // worker, network blip, edge cold cache) leaves the polling chain's
    // `.finally(after)` never firing, which silently kills the chain. Wake
    // handler revives it on tab-change, but a tab kept in foreground with no
    // user interaction stays frozen until refresh. AbortController guarantees
    // the Promise resolves/rejects within 12s.
    const ac = new AbortController()
    const timeoutId = setTimeout(() => ac.abort(), 12000)
    try {
      // ── PHASE 2 UNIFIED PATH (2026-05-11) ──
      // When the unified flag is on AND the in-memory kill-switch hasn't
      // tripped, route ALL fetches (page 0, page 1+, incremental) through
      // /api/scanner/feed?unified=1. On any shape mismatch or 5xx, flip
      // unifiedDisabledRef true for the session and fall through to the
      // legacy split branches below. Bug 2 endpoint unification —
      // project_pb_scanner_endpoint_unification_design.md §Phase 2.
      if (useUnifiedEndpoint() && !unifiedDisabledRef.current) {
        // Continuous-scroll mode (Patch — 2026-05-17): non-today modes
        // also get incremental top-ups so the in-memory buffer stays
        // current as new trades arrive. trades grows up to the 20K cap.
        const isIncrementalCall = pg === 0 && !isFirstLoadRef.current && lastTradeIdRef.current > 0 && !opts?.forceFull
        const sinceId = isIncrementalCall ? lastTradeIdRef.current : undefined
        try {
          const url = buildScannerUrl({ pageNum: pg, sinceId, light: opts?.light })
          const res = await fetch(url, { signal: ac.signal })
          if (isTierLocked(res)) { setFlowLocked(true); return }
          if (isAuthRedirect(res)) {
            setPollError("Session expired — redirecting to login…")
            router.push("/login")
            return
          }
          if (!res.ok) throw new Error(`unified HTTP ${res.status}`)
          const fd: FeedResponse = await res.json()
          if (fd.error) throw new Error(`unified error: ${fd.error}`)
          if (!fd.meta?.columns) throw new Error("unified shape mismatch: missing meta.columns")

          feedMetaRef.current = fd.meta
          feedColumnsRef.current = fd.meta.columns
          setTopicId(fd.meta.topic_id)
          if (typeof fd.meta.total === "number" && fd.meta.total > 0) setServerTotal(fd.meta.total)
          const incoming = rowsToTrades(fd.rows || [], fd.meta.columns)

          if (isIncrementalCall) {
            if (incoming.length > 0) {
              setTrades(prev => {
                // Dedup (2026-05-18). sinceId polling can return overlapping
                // windows on reconnect / clock skew (backend re-sends a few
                // tail trades whose ids overlap what's already in state).
                // Without this, React state briefly contains duplicate ids
                // and AG Grid emits Warning #2 ("Duplicate node id") during
                // the transient render frame — surfaces as row-stacking
                // artifacts. Mirrors the SSE flush path at ~line 751.
                const seen = new Set(prev.map(p => p.id))
                const fresh: Trade[] = []
                for (const t of incoming) {
                  if (seen.has(t.id)) continue
                  seen.add(t.id)
                  fresh.push(t)
                }
                if (fresh.length === 0) return prev
                if (fresh.some(tr => !prevTradeIdsRef.current.has(tr.id) && matchesFilterRef.current(tr))) {
                  playBlipRef.current()
                }
                lastTradeIdRef.current = Math.max(lastTradeIdRef.current, ...fresh.map(tr => tr.id))
                agGridAdd(fresh)
                return [...fresh, ...prev].slice(0, 20000)
              })
            }
          } else {
            if (prevTradeIdsRef.current.size > 0 && incoming.some(tr => !prevTradeIdsRef.current.has(tr.id) && matchesFilterRef.current(tr))) {
              playBlipRef.current()
            }
            prevTradeIdsRef.current = new Set(incoming.map(tr => tr.id))
            if (incoming.length > 0) {
              lastTradeIdRef.current = Math.max(...incoming.map(tr => tr.id))
            }
            isFirstLoadRef.current = false

            if (opts?.forceFull) {
              // Full follow-up landing on top of light data. MERGE rather
              // than replace — preserve any SSE rows arrived during the
              // light→full window that arent in the full payload (servers
              // SQL ran microseconds before the SSE row was committed).
              setTrades(prev => {
                const fullIds = new Set(incoming.map(r => r.id))
                const sseNewer = prev.filter(r => !fullIds.has(r.id))
                const merged = [...sseNewer, ...incoming].slice(0, 20000)
                agGridReplace(merged)
                return merged
              })
              setHasFullData(true)
            } else {
              setTrades(incoming)
              agGridReplace(incoming)
              // Non-light full load (light mode off, or a plain reload):
              // this IS the full data, so clear the dashboard skeleton now.
              if (!opts?.light) setHasFullData(true)
              // Light fetch landed — schedule the full follow-up. setTimeout(0)
              // yields the current event-loop turn so React commits the
              // skeleton→data transition first, then full kicks off ~one
              // tick later. forceFull bypasses since_id auto-detection
              // that would otherwise produce an incremental-only fetch.
              if (opts?.light) {
                setTimeout(() => fetchDataRef.current?.({ pageNum: 0, forceFull: true }), 0)
              }
            }
            if (fd.agg) {
              const agg = fd.agg
              const lean = (agg.sentiment?.label || "MIXED").toUpperCase()
              setStats({
                count: incoming.length,
                bull: (agg.call_flow?._sort_premium ?? 0) / 100,
                bear: (agg.put_flow?._sort_premium ?? 0) / 100,
                lean,
                pc_ratio: agg.pcr ?? 0,
              })
            }
          }
          lastSuccessRef.current = Date.now()
          setPollError(null)
          return
        } catch (unifiedErr) {
          // AbortError bubbles to the outer catch — let it through.
          if (unifiedErr instanceof DOMException && unifiedErr.name === "AbortError") {
            throw unifiedErr
          }
          // Any other failure (5xx, JSON parse error, shape mismatch) →
          // flip the kill-switch and fall through to the legacy branches.
          console.warn("[scanner] unified endpoint failed, falling back to legacy split:", unifiedErr)
          unifiedDisabledRef.current = true
          // continue to legacy branches below
        }
      }

      // Incremental polling — page 0 + after first load. Both Today and
      // non-today use it now (continuous-scroll mode).
      if (pg === 0 && !isFirstLoadRef.current && lastTradeIdRef.current > 0) {
        const res = await fetch(buildUrl({ sinceId: lastTradeIdRef.current }), { signal: ac.signal })
        if (isTierLocked(res)) { setFlowLocked(true); return }
        if (isAuthRedirect(res)) {
          setPollError("Session expired — redirecting to login…")
          router.push("/login")
          return
        }
        const data: ApiResponse = await res.json()
        if (data.trades?.length > 0) {
          setTrades(prev => {
            // Dedup (2026-05-18). Legacy split-path incremental polling.
            // Same race as the unified path above + the SSE flush — sinceId
            // windows can overlap on reconnect. See site 1 for rationale.
            const seen = new Set(prev.map(p => p.id))
            const fresh: Trade[] = []
            for (const t of data.trades) {
              if (seen.has(t.id)) continue
              seen.add(t.id)
              fresh.push(t)
            }
            if (fresh.length === 0) return prev
            lastTradeIdRef.current = Math.max(lastTradeIdRef.current, ...fresh.map(tr => tr.id))
            agGridAdd(fresh)
            if (fresh.some(matchesFilterRef.current)) playBlipRef.current()
            return [...fresh, ...prev].slice(0, 20000)
          })
        }
        lastSuccessRef.current = Date.now()
        setPollError(null)
        return
      }

      // Full load (first time, page change, filter change).
      // When the feed feature flag is on AND we're on page 0 (live), use
      // /api/scanner/feed for the snapshot and hydrate. Page 1+ stays on
      // live-flow because the feed endpoint doesn't yet support pagination
      // — TODO when needed. Incremental polling (since_id branch above)
      // also stays on live-flow.
      if (pg === 0 && useFeedEndpoint()) {
        const res = await fetch(buildFeedUrl(), { signal: ac.signal })
        if (isTierLocked(res)) { setFlowLocked(true); return }
        if (isAuthRedirect(res)) {
          setPollError("Session expired — redirecting to login…")
          router.push("/login")
          return
        }
        const fd: FeedResponse = await res.json()
        if (fd.error) return
        feedMetaRef.current = fd.meta
        feedColumnsRef.current = fd.meta.columns
        setTopicId(fd.meta.topic_id)
        if (typeof fd.meta.total === "number" && fd.meta.total > 0) setServerTotal(fd.meta.total)
        const incoming = rowsToTrades(fd.rows || [], fd.meta.columns)
        if (prevTradeIdsRef.current.size > 0 && incoming.some(tr => !prevTradeIdsRef.current.has(tr.id) && matchesFilterRef.current(tr))) {
          playBlipRef.current()
        }
        prevTradeIdsRef.current = new Set(incoming.map(tr => tr.id))
        if (incoming.length > 0) {
          lastTradeIdRef.current = Math.max(...incoming.map((tr: Trade) => tr.id))
        }
        isFirstLoadRef.current = false
        setTrades(incoming)
        agGridReplace(incoming)
        // Map feed agg → existing Stats shape. bull/bear are sentiment
        // proxies derived from buy-call+sell-put vs buy-put+sell-call
        // premium splits — close enough for the sidebar widget. Exact
        // parity with live-flow's dashboard query lives in the legacy
        // path below; flip the flag to compare.
        const agg = fd.agg
        const lean = (agg?.sentiment?.label || "MIXED").toUpperCase()
        setStats({
          count: incoming.length,
          bull: (agg?.call_flow?._sort_premium ?? 0) / 100,
          bear: (agg?.put_flow?._sort_premium ?? 0) / 100,
          lean,
          pc_ratio: agg?.pcr ?? 0,
        })
        lastSuccessRef.current = Date.now()
        setPollError(null)
        return
      }

      // Legacy path (default): /api/scanner/live-flow with full dict shape.
      const res = await fetch(buildUrl({ pageNum: pg }), { signal: ac.signal })
      if (isTierLocked(res)) { setFlowLocked(true); return }
      if (isAuthRedirect(res)) {
        setPollError("Session expired — redirecting to login…")
        router.push("/login")
        return
      }
      const data: ApiResponse = await res.json()
      if (data.error) return
      const incoming = data.trades || []
      if (pg === 0 && prevTradeIdsRef.current.size > 0 && incoming.some(tr => !prevTradeIdsRef.current.has(tr.id) && matchesFilterRef.current(tr))) {
        playBlipRef.current()
      }
      prevTradeIdsRef.current = new Set(incoming.map(tr => tr.id))
      if (incoming.length > 0) {
        lastTradeIdRef.current = Math.max(...incoming.map((tr: Trade) => tr.id))
      }
      isFirstLoadRef.current = false
      setTrades(incoming)
      agGridReplace(incoming)
      setStats(data.stats || { count: 0, bull: 0, bear: 0, lean: "MIXED", pc_ratio: 0 })
      lastSuccessRef.current = Date.now()
      setPollError(null)
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setPollError("Slow connection — retrying")
      } else if (err instanceof SyntaxError) {
        // JSON parse error after a missed-auth redirect lands here.
        setPollError("Session may have expired — refresh to log in.")
      } else {
        setPollError("Connection lost — retrying")
      }
    } finally {
      clearTimeout(timeoutId)
      setLoading(false)
      setHasInitiallyLoaded(true)
    }
  }, [page, buildUrl, buildScannerUrl, router])

  // Keep fetchDataRef in sync — decouples reset/polling effects from fetchData identity
  useEffect(() => { fetchDataRef.current = fetchData }, [fetchData])

  // initial load + page/range/filter change — reset incremental state.
  // Uses fetchDataRef so the dep churn from fetchData identity changes does NOT
  // wipe state. But we must still depend on the URL-affecting filters
  // (timeRange, filterMinPremium, filterDte from buildUrl) so changing those
  // clears the stale trade list and refetches with the new server filter.
  useEffect(() => {
    if (!viewReady) return  // wait until ?view resolves the initial tab
    if (activePage !== "scanner") return  // don't fetch flow on heatmap/watchlist tabs
    isFirstLoadRef.current = true
    lastTradeIdRef.current = 0
    setHasFullData(false)
    setTrades([])
    agGridReplace([])
    fetchDataRef.current?.({ initial: true, pageNum: page, light: true })
  }, [viewReady, activePage, page, timeRange, filterMinPremium, filterDte, filterCuratedOnly, filterExcludeMidpoint, filterExcludeMultiLeg, sortField, sortDir])

  // auto-refresh every 3s on page 0 (live).
  //
  // Self-rescheduling setTimeout instead of setInterval: doesn't pile up if a fetch
  // is slow, and pairs cleanly with visibilitychange to recover from background-tab
  // throttling (Chrome throttles setInterval to 1Hz in inactive tabs, sometimes pauses entirely).
  //
  // Visibility/focus handler: on tab return, immediately catch up via since_id and
  // restart the timer fresh — don't trust whatever stale state Chrome left it in.
  useEffect(() => {
    if (page !== 0) return
    if (!viewReady) return  // wait until ?view resolves the initial tab
    if (activePage !== "scanner") return  // no flow polling off the flow tab
    // Phase 2: row-push SSE handles updates when feed flag is on AND we have
    // a topic_id. Skip the 3s polling tick entirely. The wake handlers below
    // are also skipped — #5 will add a 60s SSE-stale guard to handle the
    // "EventSource silently dies" case that polling implicitly covered.
    // Phase 2 unification (2026-05-11): unified path also gets topicId from
    // the feed response, so SSE serves the same role — skip polling under
    // either flag when topicId is established.
    if ((useFeedEndpoint() || useUnifiedEndpoint()) && topicId) return

    const tick = () => {
      if (page !== 0) return
      const hidden = document.hidden
      // Skip the fetch when the tab is hidden — but ALWAYS reschedule. Earlier
      // version returned early here, which killed the polling chain whenever
      // the tab was backgrounded. visibilitychange was supposed to revive it,
      // but that event is unreliable across Chrome tab-freezing, partial
      // obscure, and Safari/Firefox quirks. Now the loop survives indefinitely
      // and just dilates to 30s while hidden (Chrome throttles to ~1min anyway).
      if (!hidden) {
        setLive(isMarketOpen())
        const p = fetchDataRef.current?.({ pageNum: 0 })
        const after = () => {
          if (page === 0 && !document.hidden) {
            intervalRef.current = setTimeout(tick, 3000)
          } else if (page === 0) {
            intervalRef.current = setTimeout(tick, 30000)
          }
          if (isMarketOpen() && Date.now() - lastSuccessRef.current > 15000) {
            setPollError("No updates for 15s — checking connection")
          }
        }
        if (p && typeof (p as Promise<void>).finally === "function") {
          (p as Promise<void>).finally(after)
        } else {
          after()
        }
      } else {
        // Hidden — reschedule on a slow cadence so loop survives until visible.
        intervalRef.current = setTimeout(tick, 30000)
      }
    }

    // Wake handler — runs on visibilitychange, focus, pageshow (bfcache return),
    // online, and first user interaction (pointerdown/keydown). Belt + suspenders
    // because no single event reliably fires across all browser/freeze states.
    const wake = () => {
      if (document.visibilityState !== "visible") return
      // Only force-fetch if we're actually stale — avoids a thundering herd of
      // duplicate requests when multiple wake events fire in quick succession.
      const stale = Date.now() - lastSuccessRef.current > 5000
      if (intervalRef.current) clearTimeout(intervalRef.current as ReturnType<typeof setTimeout>)
      if (stale) fetchDataRef.current?.({ pageNum: 0 })
      intervalRef.current = setTimeout(tick, stale ? 3000 : 1000)
    }

    intervalRef.current = setTimeout(tick, 3000)
    document.addEventListener("visibilitychange", wake)
    window.addEventListener("focus", wake)
    window.addEventListener("pageshow", wake)
    window.addEventListener("online", wake)
    window.addEventListener("pointerdown", wake, { passive: true })
    window.addEventListener("keydown", wake)
    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current as ReturnType<typeof setTimeout>)
      document.removeEventListener("visibilitychange", wake)
      window.removeEventListener("focus", wake)
      window.removeEventListener("pageshow", wake)
      window.removeEventListener("online", wake)
      window.removeEventListener("pointerdown", wake)
      window.removeEventListener("keydown", wake)
    }
  }, [page, topicId, activePage, viewReady])

  // active filter count
  useEffect(() => {
    let c = 0
    if (filterGrade) c++
    if (filterType) c++
    if (filterOptType) c++
    if (filterMinPremium !== "") c++
    if (filterMinContracts > 0) c++
    if (filterMinVolOi > 0) c++
    if (filterDte) c++
    if (filterSide) c++
    if (filterBuySell) c++
    if (filterUnusualOnly) c++
    if (filterNoIndex) c++
    if (filterCuratedOnly) c++
    if (filterExcludeMidpoint) c++
    if (filterExcludeMultiLeg) c++
    setActiveFilterCount(c)
  }, [timeRange, filterGrade, filterType, filterOptType, filterMinPremium, filterMinContracts, filterMinVolOi, filterDte, filterSide, filterBuySell, filterUnusualOnly, filterNoIndex, filterCuratedOnly, filterExcludeMidpoint, filterExcludeMultiLeg])

  // Persist curated-only toggle to localStorage on change.
  useEffect(() => {
    if (typeof window === "undefined") return
    try { window.localStorage.setItem("pb_curated_grades", filterCuratedOnly ? "1" : "0") }
    catch { /* localStorage unavailable */ }
  }, [filterCuratedOnly])

  // Persist exclude_midpoint + exclude_multi_leg toggles to localStorage.
  useEffect(() => {
    if (typeof window === "undefined") return
    try { window.localStorage.setItem("pb_exclude_midpoint", filterExcludeMidpoint ? "1" : "0") }
    catch { /* localStorage unavailable */ }
  }, [filterExcludeMidpoint])
  useEffect(() => {
    if (typeof window === "undefined") return
    try { window.localStorage.setItem("pb_exclude_multi_leg", filterExcludeMultiLeg ? "1" : "0") }
    catch { /* localStorage unavailable */ }
  }, [filterExcludeMultiLeg])

  const matchesFilter = useCallback((t: Trade) => {
    if (t.__isDaySeparator) return true
    if (search && !t.symbol.toLowerCase().includes(search.toLowerCase())) return false
    if (focusTicker && t.symbol !== focusTicker) return false
    if (focusStrike && String(t.strike) !== focusStrike) return false
    if (focusExpiry && t.expiration !== focusExpiry) return false
    if (filterGrade && t.grade !== filterGrade) return false
    if (filterType && t.flow_type !== filterType) return false
    if (filterOptType && t.opt_type !== filterOptType) return false
    if (filterSide && t.aggression !== filterSide) return false
    if (filterBuySell && t.trade_direction !== filterBuySell) return false
    // Industry-standard "Unusual Volume" filter — uses 20d baseline, not raw vol_oi
    if (filterUnusualOnly && (t.contract_volume_multiple ?? 0) < 1.5) return false
    if (filterNoIndex && ["SPX","SPXW","NDXP","NDX","RUT","RUTW"].includes(t.symbol)) return false
    if (filterDte === "0dte" && (t.dte ?? -1) !== 0) return false
    if (filterDte === "1-7" && ((t.dte ?? -1) < 1 || (t.dte ?? -1) > 7)) return false
    if (filterDte === "8-30" && ((t.dte ?? -1) < 8 || (t.dte ?? -1) > 30)) return false
    if (filterDte === "30+" && (t.dte ?? -1) < 30) return false
    if (filterMinContracts > 0 && (t.contracts ?? 0) < filterMinContracts) return false
    if (filterMinVolOi > 0 && ((t.vol_oi ?? 0) * 10) < filterMinVolOi) return false
    // ── Server-side filter MIRROR (REGRESSION-PREVENTION CHECKPOINT) ──
    // Every server-side filter sent in buildScannerUrl MUST have a matching
    // predicate here. sse_scanner.py live row pushes do not apply these
    // server predicates, so without a client mirror the SSE delivery path
    // would contaminate the filtered view with rows that fail the user's
    // current toggle state (snapshot fetches stay clean; SSE rows leak).
    //
    // Audit: all entries in buildScannerUrl deps MUST have a matching
    // predicate below. Current set (keep in sync — 2026-05-11):
    //   timeRange           — N/A (SSE topic is per-range; no row check)
    //   filterMinPremium    ✓ premium ≥ N
    //   filterDte           ✓ DTE bucket (above)
    //   filterCuratedOnly   ✓ drop PASS grade when ON
    //   filterExcludeMidpoint ✓ aggression null/NEUTRAL/MIDPOINT
    //   filterExcludeMultiLeg ✓ structure + MULTI-LEG badge
    // aggrLabel logic (page.tsx:304): null/NEUTRAL/MIDPOINT → "Mid" display.
    if (filterCuratedOnly && t.grade === "PASS") return false
    if (filterMinPremium !== "") {
      const minPrem = Number(filterMinPremium)
      if (isFinite(minPrem) && minPrem > 0 && (t.premium ?? 0) < minPrem) return false
    }
    if (filterExcludeMidpoint) {
      const a = t.aggression
      if (!a || a === "NEUTRAL" || a === "MIDPOINT") return false
    }
    if (filterExcludeMultiLeg) {
      if (t.structure && t.structure !== "SINGLE_LEG") return false
      if (t.badges?.some(b => b.label === "MULTI-LEG")) return false
    }
    return true
  }, [search, focusTicker, focusStrike, focusExpiry, filterGrade, filterType, filterOptType, filterSide, filterBuySell, filterUnusualOnly, filterNoIndex, filterDte, filterMinContracts, filterMinVolOi, filterMinPremium, filterCuratedOnly, filterExcludeMidpoint, filterExcludeMultiLeg])

  // Ref so fetchData doesn't rebind on filter changes
  const matchesFilterRef = useRef(matchesFilter)
  useEffect(() => { matchesFilterRef.current = matchesFilter }, [matchesFilter])

  // AG Grid external-filter trigger (2026-05-11). matchesFilterRef is
  // wired into ScannerAgGrid via doesExternalFilterPass; AG Grid
  // re-evaluates row visibility only when gridApi.onFilterChanged()
  // is called. Server-side filters (timeRange, filterMinPremium,
  // filterDte, filterCuratedOnly, filterExclude*) fire the reset
  // useEffect at page.tsx:1383 which agGridReplace([])s the grid and
  // re-fetches — no onFilterChanged needed there. Only client-side
  // state changes need this nudge.
  useEffect(() => {
    gridApiRef.current?.onFilterChanged()
  }, [
    search,
    focusTicker, focusStrike, focusExpiry,
    filterGrade, filterType, filterOptType, filterSide, filterBuySell,
    filterUnusualOnly, filterNoIndex,
    filterMinContracts, filterMinVolOi,
  ])

  const filtered = useMemo(() => trades.filter(matchesFilter), [trades, matchesFilter])

  // Single-pass aggregation — replaces the 4 separate filter+reduce calls that
  // ran on every render (every 3s). With ~10K filtered rows and unmemoized
  // derived values upstream, the reductions alone showed up as a recurring
  // long task in DevTools Performance every poll cycle.
  // Bug 3 fix (2026-05-11) — range-agg snapshot for non-today stat strip.
  // Backend /api/scanner/range-agg returns aggregates computed over the
  // FULL range (not the paginated row slice), so stat-strip P/C / call $
  // / put $ stop wobbling when subscribers paginate Month/Week. Today
  // range keeps the client-side reduction since the 20000-row buffer
  // IS the full set. See project_pb_scanner_time_range_investigation.md
  // §Bug 3 for the full investigation.
  const aggregates = useMemo(() => {
    let callCount = 0, putCount = 0, callPrem = 0, putPrem = 0
    for (const t of filtered) {
      if (t.opt_type === "C") { callCount++; callPrem += t.premium }
      else if (t.opt_type === "P") { putCount++; putPrem += t.premium }
    }
    return { callCount, putCount, callPrem, putPrem }
  }, [filtered])
  const callPrem = aggregates.callPrem
  const putPrem = aggregates.putPrem
  const calls = aggregates.callCount  // count, not array — only .length was ever used
  const puts = aggregates.putCount

  // Client-side pagination for "today" — all data already loaded, just slice for display
  const CLIENT_PAGE_SIZE = 200
  const [clientPage, setClientPage] = useState(0)
  const totalClientPages = Math.max(1, Math.ceil(filtered.length / CLIENT_PAGE_SIZE))
  const pageRows = filtered.slice(clientPage * CLIENT_PAGE_SIZE, (clientPage + 1) * CLIENT_PAGE_SIZE)
  // Reset client page when filters change
  useEffect(() => { setClientPage(0) }, [search, focusTicker, focusStrike, focusExpiry, filterGrade, filterType, filterOptType, filterSide, filterBuySell, filterUnusualOnly, filterNoIndex, filterDte, filterMinContracts, filterMinVolOi])

  // Phase 6 (2026-05-11): scroll AG Grid to row 0 on pagination changes.
  // Today range uses clientPage (200-row chunks over the 20K trades
  // buffer); non-Today uses page (server-side 2000-row fetches).
  // ensureIndexVisible is a no-op when gridApi isn't yet captured
  // (flag off, or pre-onApiReady).
  useEffect(() => {
    gridApiRef.current?.ensureIndexVisible(0, "top")
  }, [page, clientPage])

  // Pagination wire (2026-05-15): sync AG Grid rowData to the
  // clientPage slice in Today mode. Without this, the external
  // Pagination component updates clientPage but the grid still
  // shows the full 20K buffer (fetchData → agGridReplace(incoming)
  // sends the whole buffer; only the legacy <table> path consumed
  // pageRows for slicing). Non-Today is server-paginated — its page
  // state already triggers a refetch + replace upstream.
  useEffect(() => {
    const start = clientPage * CLIENT_PAGE_SIZE
    agGridReplace(filtered.slice(start, start + CLIENT_PAGE_SIZE))
  }, [clientPage, filtered, agGridReplace])

  const rowVirtualizer = useVirtualizer({
    count: pageRows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 44,
    overscan: 50,
    getItemKey: (index) => pageRows[index]?.id ?? index,
  })

  // (Previously called rowVirtualizer.measure() on every pageRows change. That
  // forced a full remeasurement every 3s poll — the dominant client-side jank.
  // The virtualizer already invalidates when count or getItemKey changes, so
  // rows mounted via measureElement get re-measured naturally on identity change
  // without a global re-measure cycle.)

  const hasLocalFilter = !!(search || focusTicker || filterGrade || filterType || filterOptType || filterSide || filterUnusualOnly || filterNoIndex || filterDte)
  // Memoized + single-pass — was 4 chained filter+reduce passes running on
  // every render. Recomputes only when filtered identity changes.
  const displayStats = useMemo(() => {
    // Stage 2 (2026-05-08): volume-weighted sentiment + PCR. The label,
    // gauge, and PC ratio all derive from contract counts, not premium
    // dollars — matches _compute_global_agg / _compute_feed_agg on the
    // server. Industry convention; what subscribers from Cheddar /
    // Unusual Whales expect "Bullish" and "PCR" to mean. 0.65/0.35
    // cutoffs preserved from the premium-weighted era.
    //
    // Bug 3 bifurcation (2026-05-11): non-today ranges source bull/bear
    // contract volume + PCR from the server-side range-agg so the strip
    // is stable across pagination. Today range keeps the client-side
    // reduction since the 20000-row buffer IS the full set. count stays
    // = filtered.length intentionally — that label reflects what's on
    // screen ("1,234 signals" maps to the rendered row count, not the
    // range total).
    let cv = 0, pv = 0, bullVol = 0, bearVol = 0
    for (const t of filtered) {
      const qty = t.contracts || 0
      if (t.opt_type === "C") cv += qty
      else if (t.opt_type === "P") pv += qty
      if (t.bullish) bullVol += qty
      else bearVol += qty
    }
    const total = bullVol + bearVol
    const score = total > 0 ? bullVol / total : 0.5
    return {
      count: filtered.length,
      bull: bullVol,
      bear: bearVol,
      lean: score >= 0.65 ? "BULL" : score <= 0.35 ? "BEAR" : "MIXED",
      pc_ratio: cv > 0 ? +(pv / cv).toFixed(2) : 0,
    }
  }, [filtered])

  return (
    <div className="h-screen flex text-[#E8EDF5] overflow-hidden" style={{ background: '#0E1117', fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}>
      {pollError && (
        <div role="status" aria-live="polite" className="fixed top-2 right-2 z-50 px-3 py-1.5 rounded text-xs font-medium text-white shadow-lg" style={{ background: "rgba(217,119,6,0.92)" }}>
          {pollError}
        </div>
      )}

      <ScannerSidebar
        activePage={activePage}
        setActivePage={setActivePage}
        canAccessGamma={canAccessGamma}
        canAccessFlow={canAccessFlow}
        setShowUpgradeModal={setShowUpgradeModal}
        setShowFilters={setShowFilters}
        activeFilterCount={activeFilterCount}
        marketOpen={marketOpen}
        soundEnabled={soundEnabled}
        toggleSound={toggleSound}
        accountMenu={
          <AccountMenu buttonClassName="group relative flex h-10 w-10 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-zinc-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
          </AccountMenu>
        }
      />

      {/* ── MAIN CONTENT ── */}
      <div className="ml-16 flex flex-col h-screen overflow-hidden flex-1">
      <TrialBanner />

      {activePage === "heatmap" ? ((() => {
  // GEX_SYMBOLS hoisted to module scope so CommandPalette mount can use it.
  const netGex = gexData ? gexData.strikes.reduce((sum: number, strike: number) => {
    const sk = strike === Math.floor(strike) ? String(Math.floor(strike)) : String(strike)
    const row = gexData.matrix[sk] || {}
    return sum + Object.values(row).reduce((rs: number, c: { net_gex: number }) => rs + c.net_gex, 0)
  }, 0) : 0
  // ET-keyed YYYY-MM-DD to match backend expiration strings at line 1891.
  // Was new Date().toISOString().slice(0, 10) — UTC date; off-by-one for
  // ~4 hours each evening (8pm-midnight ET) which silently broke the
  // "TODAY" column highlight in /heatmap. en-CA produces ISO format
  // natively + timeZone option pins to ET.
  const todayStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date())
  const fmtExp = (exp: string) => { const p = exp.split("-"); return p.length === 3 ? `${p[1]}/${p[2]}` : exp }

  const strikeTotals = gexData ? [...gexData.strikes].reverse().map(strike => {
    const sk = strike === Math.floor(strike) ? String(Math.floor(strike)) : String(strike)
    const row = gexData.matrix[sk] || {}
    return { strike, total: Object.values(row).reduce((s: number, c: { net_gex: number }) => s + c.net_gex, 0) }
  }) : []

  // Wall = global gamma extremum (SpotGamma convention): call wall = most positive
  // net GEX (resistance), put wall = most negative net GEX (support). Not spot-relative.
  const callWall = gexData && strikeTotals.length ? [...strikeTotals].sort((a, b) => b.total - a.total)[0] : null
  const putWall = gexData && strikeTotals.length ? [...strikeTotals].sort((a, b) => a.total - b.total)[0] : null

  return (
  <div className="flex-1 flex flex-col overflow-hidden" style={{ background: "#0B0F14" }}>

    {/* SpotGamma-style header: instrument bar + metrics + chip strip */}
    {(() => {
      const SYMBOL_NAMES_INLINE: Record<string, string> = {
        SPY: "State Street SPDR S&P 500 ETF Trust", QQQ: "Invesco QQQ Trust",
        AAPL: "Apple Inc.", TSLA: "Tesla, Inc.", NVDA: "NVIDIA Corporation",
        META: "Meta Platforms, Inc.", MSFT: "Microsoft Corporation",
        AMZN: "Amazon.com, Inc.", GOOGL: "Alphabet Inc.",
        AMD: "Advanced Micro Devices, Inc.", MU: "Micron Technology, Inc.",
        COIN: "Coinbase Global, Inc.", PLTR: "Palantir Technologies Inc.",
        NFLX: "Netflix, Inc.", CRM: "Salesforce, Inc.", BA: "The Boeing Company",
        JPM: "JPMorgan Chase & Co.", GS: "Goldman Sachs Group, Inc.",
        XOM: "Exxon Mobil Corporation", GLD: "SPDR Gold Trust",
      }
      const fmtGexLocal = (v: number) => {
        const abs = Math.abs(v), sign = v < 0 ? "-" : ""
        if (abs >= 1e12) return `${sign}$${(abs / 1e12).toFixed(2)}T`
        if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(2)}B`
        if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(1)}M`
        if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(0)}K`
        return `${sign}$${abs.toFixed(0)}`
      }
      const fmtCellLocal = (v: number) => {
        const abs = Math.abs(v), sign = v < 0 ? "-" : ""
        if (abs >= 1e12) return `${sign}${(abs / 1e12).toFixed(2)}T`
        if (abs >= 1e9) return `${sign}${(abs / 1e9).toFixed(1)}B`
        if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(1)}M`
        if (abs >= 1e3) return `${sign}${(abs / 1e3).toFixed(1)}K`
        return `${sign}${abs.toFixed(0)}`
      }
      const fmtExpShort = (exp: string) => {
        const p = exp.split("-")
        if (p.length !== 3) return exp
        const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"]
        return `${months[parseInt(p[1]) - 1]} ${p[2]}`
      }
      const effSpot = liveGexSpot ?? gexData?.spot ?? 0
      return (
        <>
          {/* Instrument bar */}
          <div className="flex items-center px-5 py-2.5 gap-3 border-b border-white/[0.06] flex-shrink-0" style={{ background: "#10141B" }}>
            <div className="flex items-baseline gap-2 min-w-0">
              <span className="text-[14px] font-semibold text-white tracking-tight truncate">{SYMBOL_NAMES_INLINE[gexSymbol] || gexSymbol}</span>
              <span className="text-[9px] uppercase tracking-[0.18em] text-white/30 whitespace-nowrap">Gamma Exposure</span>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              {gexUpdatedAt && (
                <span className="hidden sm:flex items-center gap-1.5 text-[10px] text-white/40 mr-1 whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                  Live · {gexUpdatedAt.toLocaleTimeString("en-US", { hour12: false, timeZone: "America/New_York" })} ET
                </span>
              )}
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/60 px-2.5 py-1 rounded bg-white/[0.03] border border-white/[0.08]">Gamma</span>
              <button
                onClick={() => setPaletteOpen(true)}
                className="flex items-center gap-2 text-[11px] text-white/40 hover:text-white px-2.5 py-1 rounded border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] transition-colors"
                aria-label="Open search"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>
                </svg>
                <span className="hidden sm:inline">to search</span>
                <kbd className="font-mono text-[9px] px-1 py-0.5 rounded bg-black/40 border border-white/[0.08]">S</kbd>
              </button>
              <select value={gexSymbol} onChange={e => setGexSymbol(e.target.value)}
                className="sm:hidden bg-transparent border border-white/[0.1] text-white text-[11px] rounded px-2 py-1 font-semibold cursor-pointer focus:outline-none">
                {GEX_SYMBOLS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Hero card (v6 Phase 1) — replaces the old metrics strip */}
          {gexData && <GexHeroCard data={gexData} liveSpot={liveGexSpot} symbol={gexSymbol} />}
        </>
      )
    })()}

    {gexData && <GexGammaProfile data={gexData} liveSpot={liveGexSpot} />}

    <div className="flex-1 mx-5 mb-3 min-h-0 flex flex-col rounded-lg border border-white/[0.06]" style={{ background: "#0B0F14" }}>
      <div className="flex items-center gap-2 px-5 pt-4 pb-3 flex-shrink-0">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">Net GEX Heatmap</span>
        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-[0.1em] uppercase border border-amber-500/40 text-amber-400 bg-amber-500/[0.08]">Estimated</span>
        <button onClick={() => setGexShowAll(v => !v)} className="ml-auto text-[10px] text-white/40 hover:text-white border border-white/[0.08] hover:border-white/20 rounded px-2 py-1 transition-colors">
          {gexShowAll ? "Focus ±13" : "Show all strikes"}
        </button>
      </div>
      <div className="flex-1 overflow-auto min-h-0">
        {gexLoading ? (
          <div className="flex items-center justify-center h-full text-white/20 text-sm">Loading...</div>
        ) : gexError ? (
          <div className="flex items-center justify-center h-full text-[#FF605D] text-sm">{gexError}</div>
        ) : gexData ? (
          <div style={{ display: "grid", gridTemplateColumns: `90px repeat(${gexData.expirations.length}, 1fr) 72px` }}>
            <div className="sticky top-0 z-10 px-2 py-1 text-[9px] font-semibold text-white/30 tracking-[0.1em] uppercase border-r border-b border-white/[0.04]" style={{ background: "#0B0F14" }}>Strike</div>
            {gexData.expirations.map((exp: string) => {
              const isToday = exp === todayStr
              return (
                <div key={exp} className="sticky top-0 z-10 px-1 py-1 text-center border-r border-b border-white/[0.04]" style={{ background: "#0B0F14" }}>
                  <div className={`text-[9px] font-semibold tracking-wider ${isToday ? "text-[#FF8A00]" : "text-white/30"}`}>
                    {isToday ? "TODAY" : fmtExp(exp)}
                  </div>
                </div>
              )
            })}
            <div className="sticky top-0 z-10 px-2 py-1 text-right text-[9px] font-semibold text-white/30 tracking-[0.1em] uppercase border-b border-white/[0.04]" style={{ background: "#0B0F14", borderLeft: "1px solid rgba(255,255,255,0.06)" }}>Total</div>

            {(() => {
              const strikes = [...gexData.strikes].reverse()
              const atmStrike = strikes.reduce((best: number, s: number) => Math.abs(s - gexData.spot) < Math.abs(best - gexData.spot) ? s : best, strikes[0])
              const zgStrike = gexData.zero_gamma_strike != null ? strikes.reduce((best: number, s: number) => Math.abs(s - gexData.zero_gamma_strike!) < Math.abs(best - gexData.zero_gamma_strike!) ? s : best, strikes[0]) : null
              // Focus view: spot +/- 13 strikes (~27 rows, v6 density). Toggle shows the full chain.
              const spotIdx = strikes.reduce((bi: number, s: number, i: number) => Math.abs(s - gexData.spot) < Math.abs(strikes[bi] - gexData.spot) ? i : bi, 0)
              const displayStrikes = gexShowAll ? strikes : strikes.slice(Math.max(0, spotIdx - 13), spotIdx + 14)
              return displayStrikes.map((strike: number) => {
                const sk = strike === Math.floor(strike) ? String(Math.floor(strike)) : String(strike)
                const row = gexData.matrix[sk] || {}
                const rowTotal = Object.values(row).reduce((s: number, c: { net_gex: number }) => s + c.net_gex, 0)
                const isAtm = strike === atmStrike
                const isZg = strike === zgStrike
                const isCallWall = !!(callWall && strike === callWall.strike)
                const isPutWall = !!(putWall && strike === putWall.strike)
                // Single mark per row (priority spot > flip > call wall > put wall);
                // colors match the GexGammaProfile dots so the two viz read as one.
                const mark = isAtm ? { tag: "SPT", color: "#48DEFF" } : isZg ? { tag: "ZG", color: "#a855f7" } : isCallWall ? { tag: "WALL", color: "#22C55E" } : isPutWall ? { tag: "WALL", color: "#FF605D" } : null
                return [
                  <div key={`s-${strike}`} className="px-2 flex items-center gap-1 border-r border-b border-white/[0.04]"
                    style={{ minHeight: 24, background: mark ? `${mark.color}1A` : "transparent", position: "sticky", left: 0, zIndex: 5,
                    ...(mark ? { borderLeft: `3px solid ${mark.color}` } : {}) }}>
                    {mark && <span className="text-[8px] font-bold" style={{ color: mark.color }}>{mark.tag}</span>}
                    <span className="text-[11px] font-mono font-medium" style={{ color: mark ? mark.color : "rgba(255,255,255,0.4)" }}>{strike}</span>
                  </div>,

                  ...gexData.expirations.map((exp: string) => {
                    const cell = row[exp]
                    const gex = cell?.net_gex ?? 0
                    const callOi = cell?.call_oi ?? 0
                    const putOi = cell?.put_oi ?? 0
                    const intensity = gexData.max_abs_gex > 0 ? Math.min(0.8, 0.06 + 0.74 * Math.abs(gex) / gexData.max_abs_gex) : 0
                    const bg = gex === 0 ? "transparent" : gex > 0 ? `rgba(0,232,90,${intensity})` : `rgba(255,96,93,${intensity})`
                    // Synthetic-greeks marker: when has_greeks is explicitly false,
                    // the cell value comes from the OI-based Gaussian fallback. Mark
                    // these visually so users know which numbers are real Polygon
                    // greeks vs estimates. Subtle dashed top-border keeps the grid
                    // legible while flagging the cells honestly.
                    const isFallback = cell?.has_greeks === false
                    return (
                      <div key={`${strike}-${exp}`}
                        className={`border-r border-b border-white/[0.04] flex items-center justify-center relative ${isFallback ? "opacity-75" : ""}`}
                        style={{ background: mark && gex === 0 ? `${mark.color}14` : bg, minHeight: 24, ...(isFallback ? { borderTop: "1px dashed rgba(245,130,10,0.35)" } : {}) }}
                        title={`${strike} × ${exp}\nGEX: ${fmtGex(gex)}${isFallback ? " (estimate — no live greeks)" : ""}\nCall OI: ${callOi.toLocaleString("en-US")}\nPut OI: ${putOi.toLocaleString("en-US")}`}>
                        {gex !== 0 && (
                          <span className={`text-[10px] font-mono font-medium ${intensity > 0.35 ? "text-white" : gex > 0 ? "text-[#22C55E]/80" : "text-[#FF605D]/80"}`}>
                            {fmtGex(gex)}
                          </span>
                        )}
                      </div>
                    )
                  }),

                  <div key={`t-${strike}`} className="px-2 flex items-center justify-end border-b border-white/[0.04]"
                    style={{ minHeight: 24, borderLeft: "1px solid rgba(255,255,255,0.06)", ...(mark ? { background: `${mark.color}1A` } : {}) }}>
                    <span className={`text-[11px] font-mono font-semibold ${rowTotal >= 0 ? "text-[#22C55E]" : "text-[#FF605D]"}`}>
                      {rowTotal !== 0 ? fmtGex(rowTotal) : ""}
                    </span>
                  </div>,
                ]
              })
            })()}
          </div>
        ) : null}
      </div>

    </div>

  </div>
  )
})()            ) : activePage === "watchlist" ? (
        <div className="flex-1 flex flex-col overflow-hidden" style={{ background: "#1A1A22" }}>
          {/* Compact TradingView-style watchlist header */}
          <div className="px-4 py-2.5 border-b border-[#2D2C38] flex items-center gap-3 flex-shrink-0" style={{ background: "#212029" }}>
            <div className="text-[9px] font-bold text-[#E8EDF5] tracking-[0.18em] uppercase">Watchlist</div>
            <div className="text-[10px] text-[#8893A8] font-mono tabular-nums">{watchlist.length}</div>
            <div className="ml-auto flex items-center gap-2">
              {/* Overview / Flow view-mode toggle (Phase 2B step 1) */}
              <div className="flex items-center gap-1 p-1 bg-white/[0.04] border border-white/[0.06] rounded">
                {(["overview", "flow"] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setWlViewModePersist(m)}
                    className={`text-xs font-semibold rounded px-4 py-2 border transition-colors ${wlViewMode === m ? "bg-white/[0.08] border-white/[0.16] text-white" : "bg-transparent border-transparent text-zinc-400 hover:text-zinc-200"}`}
                  >
                    {m === "overview" ? "Overview" : "Flow"}
                  </button>
                ))}
              </div>
              <input
                placeholder="Add ticker — paste list ok"
                value={wlInput}
                onChange={e => setWlInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && wlInput) { addToWatchlist(wlInput); setWlInput("") } }}
                className="bg-[#080C14] border border-[#1E2A3A] rounded px-2.5 py-1 text-[12px] text-white placeholder-[#3D4D63] focus:outline-none focus:border-[#FF8A00]/50 w-64"
              />
              {watchlist.length > 0 && (
                <button
                  onClick={() => { if (confirm(`Clear all ${watchlist.length} symbols?`)) { setWatchlist([]); localStorage.setItem("pb_watchlist", "[]"); syncPrefs({ watchlist: [] }) } }}
                  className="text-[10px] text-[#E7E5E4] hover:text-[#FF605D] border border-[#1E2A3A] hover:border-[#FF605D]/40 rounded px-2 py-1 transition-colors"
                >Clear</button>
              )}
            </div>
          </div>
          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            {watchlist.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-6 py-16">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#3D4D63] mb-3">Empty watchlist</div>
                <div className="text-[14px] font-semibold text-white/80 mb-4">Track institutional flow on the tickers you trade</div>
                <div className="text-[10px] uppercase tracking-[0.14em] text-[#3D4D63] mb-2">Quick add</div>
                <div className="flex flex-wrap gap-1.5 max-w-md justify-center">
                  {["SPY","QQQ","NVDA","TSLA","AAPL","META","AMD","MSFT","GOOGL","COIN","PLTR","MSTR"].map(t => (
                    <button key={t}
                      onClick={() => addToWatchlist(t)}
                      className="text-[11px] font-mono font-bold text-[#E7E5E4] hover:text-white border border-[#1E2A3A] hover:border-[#FF8A00]/40 rounded px-2 py-1 transition-colors">
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            ) : wlViewMode === "overview" ? (() => {
              // OVERVIEW MODE (Watchlist v3) — spark-card stack. Right zone:
              // $price + Δ% pill. Sparkline = snapshot 2-day price, green/red
              // by direction. (IV/OptVol/MktCap columns dropped from the card
              // per the approved v3 mockup; data still in the snapshot.)
              const openInScanner = (sym: string) => { setSearch(sym); setSearchInput(sym); setPage(0); setActivePage("scanner"); try { window.history.replaceState(null, "", `/scanner?symbol=${sym}`) } catch {} }
              return (
                <div className="mx-auto w-full px-6 pt-4 pb-8" style={{ maxWidth: 1020 }}>
                  {watchlist.map((sym) => {
                    const quote = wlQuotes[sym] || { spot: null, change: null, change_pct: null, prev_close: null }
                    const snap = (wlSnapshot && wlSnapshot[sym]) || null
                    const positive = (quote.change_pct ?? 0) > 0
                    const negative = (quote.change_pct ?? 0) < 0
                    const changeColor = positive ? "#22c55e" : negative ? "#FF605D" : "rgba(255,255,255,0.55)"
                    const sparkPts = snap ? (snap.sparkline || []) : []
                    const sparkUp = sparkPts.length >= 2 ? sparkPts[sparkPts.length - 1] >= sparkPts[0] : !negative
                    const sparkColor = sparkUp ? "#22c55e" : "#FF605D"
                    const expanded = wlExpanded === sym
                    const top5 = trades.filter(t => t.symbol === sym).slice().sort((a, b) => b.premium - a.premium).slice(0, 5)
                    const right = (
                      <>
                        <span style={{ fontSize: 16, fontWeight: 600, color: "#fafafa" }} className="font-mono tabular-nums">
                          {quote.spot != null ? `$${quote.spot.toFixed(2)}` : <span className="text-[#3D4D63]">—</span>}
                        </span>
                        {quote.change_pct != null ? (
                          <span className="font-mono tabular-nums" style={{ fontSize: 12, fontWeight: 600, padding: "3px 9px", borderRadius: 6,
                            color: changeColor, background: positive ? "rgba(34,197,94,0.12)" : negative ? "rgba(255,96,93,0.12)" : "rgba(255,255,255,0.06)" }}>
                            {positive ? "+" : ""}{quote.change_pct.toFixed(2)}%
                          </span>
                        ) : <span className="text-[11px] text-[#3D4D63]">—</span>}
                      </>
                    )
                    return (
                      <div key={sym} style={{ marginBottom: 10 }}>
                        <WatchlistSparkCard sym={sym} logoUrl={snap?.logo_url} name={snap?.name}
                          sparkPts={sparkPts} sparkColor={sparkColor} right={right} expanded={expanded}
                          onToggle={() => setWlExpanded(prev => prev === sym ? null : sym)}
                          onRemove={() => removeFromWatchlist(sym)} />
                        <AnimatePresence initial={false}>
                          {expanded && <WatchlistDrilldown sym={sym} top5={top5} onOpenScanner={() => openInScanner(sym)} />}
                        </AnimatePresence>
                      </div>
                    )
                  })}
                </div>
              )
            })() : (() => {
              // FLOW MODE (Watchlist v3) — spark-card stack. Right zone: NET $
              // + BIAS pill, then a C·P line. Sparkline = 5-day price tinted by
              // bias (BULL green / BEAR red / MIXED orange). Sort preserved via
              // a control (cards have no column headers). SIG/AGE dropped from
              // the card per the v3 mockup (Age still available as a sort key).
              // Bias computation unchanged from the prior Flow mode.
              const openInScanner = (sym: string) => { setSearch(sym); setSearchInput(sym); setPage(0); setActivePage("scanner"); try { window.history.replaceState(null, "", `/scanner?symbol=${sym}`) } catch {} }
              const rows = watchlist.map(sym => {
                const symTrades = trades.filter(t => t.symbol === sym)
                const callPrem = symTrades.filter(t => t.opt_type === "C").reduce((s, t) => s + t.premium, 0)
                const putPrem = symTrades.filter(t => t.opt_type === "P").reduce((s, t) => s + t.premium, 0)
                const count = symTrades.length
                const isBull = callPrem > putPrem * 1.3
                const isBear = putPrem > callPrem * 1.3
                const lastSignalTs = symTrades.length
                  ? Math.max(...symTrades.map(t => Math.floor((t.timestampMs ?? 0) / 1000)))
                  : 0
                const quote = wlQuotes[sym] || { spot: null, change: null, change_pct: null, prev_close: null }
                const spark = wlSparks[sym] || []
                return { sym, callPrem, putPrem, count, isBull, isBear, lastSignalTs, quote, spark }
              })
              const dirMul = wlSort.dir === "asc" ? 1 : -1
              rows.sort((a, b) => {
                let av: number | string = 0, bv: number | string = 0
                switch (wlSort.key) {
                  case "symbol":     av = a.sym; bv = b.sym; break
                  case "price":      av = a.quote.spot ?? -Infinity; bv = b.quote.spot ?? -Infinity; break
                  case "change":     av = a.quote.change_pct ?? -Infinity; bv = b.quote.change_pct ?? -Infinity; break
                  case "callFlow":   av = a.callPrem; bv = b.callPrem; break
                  case "putFlow":    av = a.putPrem; bv = b.putPrem; break
                  case "signals":    av = a.count; bv = b.count; break
                  case "lastSignal": av = a.lastSignalTs; bv = b.lastSignalTs; break
                }
                if (av < bv) return -1 * dirMul
                if (av > bv) return  1 * dirMul
                return 0
              })
              const SORT_LABELS: Record<typeof wlSort.key, string> = { symbol: "Symbol", price: "Last", change: "% Chg", callFlow: "Call $", putFlow: "Put $", signals: "Signals", lastSignal: "Age" }
              return (
                <div className="mx-auto w-full px-6 pt-4 pb-8" style={{ maxWidth: 1020 }}>
                  {/* Sort control — replaces the column-header sort in the card layout */}
                  <div className="flex items-center justify-end gap-2 mb-3">
                    <span className="text-[10px] uppercase tracking-[0.14em] text-[#5A6070]">Sort</span>
                    <select value={wlSort.key}
                      onChange={e => setWlSort(s => ({ ...s, key: e.target.value as typeof wlSort.key }))}
                      className="bg-white/[0.04] border border-white/[0.06] rounded text-[11px] text-[#E7E5E4] px-2 py-1 focus:outline-none cursor-pointer">
                      {(Object.keys(SORT_LABELS) as (typeof wlSort.key)[]).map(k => (
                        <option key={k} value={k} style={{ background: "#1A1A22" }}>{SORT_LABELS[k]}</option>
                      ))}
                    </select>
                    <button onClick={() => setWlSort(s => ({ ...s, dir: s.dir === "desc" ? "asc" : "desc" }))}
                      className="bg-white/[0.04] border border-white/[0.06] rounded text-[11px] text-[#E7E5E4] px-2.5 py-1 hover:bg-white/[0.08] transition-colors"
                      title={wlSort.dir === "desc" ? "Descending" : "Ascending"}>{wlSort.dir === "desc" ? "▼" : "▲"}</button>
                  </div>
                  {rows.map((r) => {
                    const { sym, callPrem, putPrem, count, isBull, isBear, spark } = r
                    const net = callPrem - putPrem
                    const biasColor = isBull ? "#22c55e" : isBear ? "#FF605D" : "#fb923c"
                    const biasBg = isBull ? "rgba(34,197,94,0.12)" : isBear ? "rgba(255,96,93,0.12)" : "rgba(251,146,60,0.12)"
                    const biasLabel = isBull ? "BULL" : isBear ? "BEAR" : "MIXED"
                    const expanded = wlExpanded === sym
                    const top5 = trades.filter(t => t.symbol === sym).slice().sort((a, b) => b.premium - a.premium).slice(0, 5)
                    const right = count > 0 ? (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="font-mono tabular-nums" style={{ fontSize: 16, fontWeight: 600, color: biasColor }}>NET {fmtPrem(net)}</span>
                          <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 6, color: biasColor, background: biasBg }}>{biasLabel}</span>
                        </div>
                        <div className="font-mono tabular-nums" style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", letterSpacing: "0.01em" }}>
                          C {fmtPrem(callPrem)} · P {fmtPrem(putPrem)}
                        </div>
                      </>
                    ) : (
                      <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.35)" }}>No flow today</span>
                    )
                    return (
                      <div key={sym} style={{ marginBottom: 10 }}>
                        <WatchlistSparkCard sym={sym} logoUrl={wlSnapshot?.[sym]?.logo_url} name={wlSnapshot?.[sym]?.name}
                          sparkPts={spark} sparkColor={biasColor} right={right} expanded={expanded}
                          onToggle={() => setWlExpanded(prev => prev === sym ? null : sym)}
                          onRemove={() => removeFromWatchlist(sym)} />
                        <AnimatePresence initial={false}>
                          {expanded && <WatchlistDrilldown sym={sym} top5={top5} onOpenScanner={() => openInScanner(sym)} />}
                        </AnimatePresence>
                      </div>
                    )
                  })}
                </div>
              )
            })()}
          </div>
        </div>
      ) : flowLocked ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6" style={{ background: "#1A1A22" }}>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#3D4D63] mb-3">Flow Scanner</div>
          <div className="text-[15px] font-semibold text-white/80 mb-2">Real-time options flow isn&apos;t included in your plan</div>
          <div className="text-[13px] text-white/40 mb-5 max-w-sm">Your GEX Heatmap plan covers the gamma view. Upgrade to Flow Scanner or Pro Bundle to unlock live sweeps, blocks, and AI-graded signals.</div>
          <button onClick={() => setShowUpgradeModal(true)} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: "#60a5fa" }}>Upgrade to unlock &rarr;</button>
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-2 p-2 overflow-hidden">

      {/* ── HEADER ── */}
      <header className="h-12 border border-white/[0.06] rounded-lg flex items-center px-4 flex-shrink-0" style={{ background: '#16191F' }}>
        <div className="flex items-center gap-3 ml-auto">
          <InputGroup
            className="bg-stone-900/40 border-stone-800 focus-within:border-amber-600 rounded-xl h-[43px] transition-colors"
            style={{ maxWidth: 280 }}
          >
            <InputGroupAddon align="inline-start" className="text-stone-500">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </InputGroupAddon>
            <InputGroupInput
              type="text"
              placeholder="Search ticker..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value.toUpperCase())}
              onKeyDown={e => {
                if (e.key === "Enter") {
                  const v = searchInput.trim().toUpperCase()
                  if (v) { setFocusTicker(v); setSearchInput(""); setSearch("") }
                  setPage(0)
                }
                if (e.key === "Escape") { setSearchInput(""); setSearch("") }
              }}
              className="text-white text-[13px] font-mono tracking-wide placeholder-stone-500"
            />
            <InputGroupAddon align="inline-end">
              <kbd className="text-[9px] text-stone-400 bg-stone-800 border border-stone-700 rounded px-1.5 py-0.5 font-mono">ENTER</kbd>
            </InputGroupAddon>
          </InputGroup>
          <div className="w-px h-7 bg-white/[0.06]" />
          <Popover open={densityOpen} onOpenChange={setDensityOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-md text-stone-400 hover:bg-white/[0.06] hover:text-stone-200 transition-colors"
                title={`Row density: ${density}`}
                aria-label="Adjust row density"
              >
                {/* Bars icon — same visual identity regardless of state, since
                    the popover IS the affordance. Spacing of bars reflects
                    the current density choice as a subtle hint. */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  {density === "compact" ? (
                    <path strokeLinecap="round" d="M3 6h18M3 10h18M3 14h18M3 18h18" />
                  ) : density === "spacious" ? (
                    <path strokeLinecap="round" d="M3 8h18M3 16h18" />
                  ) : (
                    <path strokeLinecap="round" d="M3 7h18M3 12h18M3 17h18" />
                  )}
                </svg>
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-40 p-1 border border-white/[0.08]"
              style={{ background: "#16191F" }}
            >
              {([
                { value: "compact",     label: "Compact",     hint: "28px rows" },
                { value: "comfortable", label: "Comfortable", hint: "35px rows" },
                { value: "spacious",    label: "Spacious",    hint: "48px rows" },
              ] as { value: Density; label: string; hint: string }[]).map(opt => {
                const active = density === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { setDensity(opt.value); setDensityOpen(false) }}
                    className={cn(
                      "w-full flex items-center justify-between px-2.5 py-1.5 rounded text-left text-[12px] transition-colors",
                      active ? "bg-white/[0.06] text-white" : "text-zinc-300 hover:bg-white/[0.04]",
                    )}
                  >
                    <span className="font-medium">{opt.label}</span>
                    <span className="text-[10px] text-zinc-500 tabular-nums">{opt.hint}</span>
                  </button>
                )
              })}
            </PopoverContent>
          </Popover>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={filtered.length === 0}
            onClick={() => exportTradesToCsv(filtered, { filenamePrefix: "pb-flow", tier: userTier })}
            title={`Export ${filtered.length} trades to CSV`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-60"><path strokeLinecap="round" strokeLinejoin="round" d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
            <span>Export</span>
          </Button>
          <FiltersDialog
            open={showFilters}
            onOpenChange={setShowFilters}
            trigger={
              <Button variant="outline" size="sm" className="gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-60"><path strokeLinecap="round" d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/></svg>
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">{activeFilterCount}</span>
                )}
              </Button>
            }
            filterOptType={filterOptType}
            setFilterOptType={setFilterOptType}
            filterType={filterType}
            setFilterType={setFilterType}
            filterExcludeMultiLeg={filterExcludeMultiLeg}
            setFilterExcludeMultiLeg={setFilterExcludeMultiLeg}
            filterMinPremium={filterMinPremium}
            setFilterMinPremium={setFilterMinPremium}
            filterDte={filterDte}
            setFilterDte={setFilterDte}
            filterMinContracts={filterMinContracts}
            setFilterMinContracts={setFilterMinContracts}
            filterMinVolOi={filterMinVolOi}
            setFilterMinVolOi={setFilterMinVolOi}
            filterCuratedOnly={filterCuratedOnly}
            setFilterCuratedOnly={setFilterCuratedOnly}
            filterUnusualOnly={filterUnusualOnly}
            setFilterUnusualOnly={setFilterUnusualOnly}
            filterNoIndex={filterNoIndex}
            setFilterNoIndex={setFilterNoIndex}
            filterExcludeMidpoint={filterExcludeMidpoint}
            setFilterExcludeMidpoint={setFilterExcludeMidpoint}
            activeFilterCount={activeFilterCount}
            resetFilters={resetFilters}
          />
        </div>
      </header>

      {/* ── FOCUS BAR ── */}
      {(focusTicker || filterOptType || filterSide || filterBuySell || filterType) && (
        <div className="border border-white/[0.06] rounded-lg px-3 py-1.5 flex items-center gap-2 flex-wrap flex-shrink-0" style={{ background: '#16191F' }}>
          {focusTicker && (
            <Button
              variant="secondary"
              size="sm"
              // CASCADE-CLEAR (load-bearing invariant — see
              // project_pb_scanner_focus_pill_cascade_clear.md):
              // clicking the ticker pill clears ticker + strike +
              // expiry. Strike/expiry without a ticker is invalid
              // state.
              onClick={() => { setFocusTicker(null); setFocusStrike(null); setFocusExpiry(null) }}
              className="gap-2 font-mono font-semibold tracking-wider text-[11px]"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="opacity-50"><path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18l-7 8v6l-4 2v-8L3 4z"/></svg>
              <span>{focusTicker}</span>
              <span className="opacity-50 text-[13px] leading-none">&times;</span>
            </Button>
          )}
          {focusStrike && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setFocusStrike(null)}
              className="gap-1.5 font-mono text-xs"
            >
              <span>Strike {focusStrike}</span>
              <span className="opacity-50">&times;</span>
            </Button>
          )}
          {focusExpiry && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setFocusExpiry(null)}
              className="gap-1.5 font-mono text-xs"
            >
              <span>Exp {focusExpiry}</span>
              <span className="opacity-50">&times;</span>
            </Button>
          )}
          {filterOptType && (
            <Button variant="secondary" size="sm" onClick={() => setFilterOptType("")} className="gap-1.5 text-xs">
              <span>{filterOptType === "C" ? "Call" : "Put"}</span>
              <span className="opacity-50">&times;</span>
            </Button>
          )}
          {filterSide && (
            <Button variant="secondary" size="sm" onClick={() => setFilterSide("")} className="gap-1.5 text-xs">
              <span>{({ABOVE_ASK:"Above",AT_ASK:"Ask",AT_BID:"Bid",BELOW_BID:"Below"} as Record<string,string>)[filterSide] ?? filterSide}</span>
              <span className="opacity-50">&times;</span>
            </Button>
          )}
          {filterBuySell && (
            <Button variant="secondary" size="sm" onClick={() => setFilterBuySell("")} className="gap-1.5 text-xs">
              <span>{filterBuySell}</span>
              <span className="opacity-50">&times;</span>
            </Button>
          )}
          {filterType && (
            <Button variant="secondary" size="sm" onClick={() => setFilterType("")} className="gap-1.5 text-xs">
              <span>{filterType}</span>
              <span className="opacity-50">&times;</span>
            </Button>
          )}
          <span className="text-white/25 text-xs ml-auto">{filtered.length} signals</span>
        </div>
      )}

      {/* ── STATS BAR ── */}
      {/* Initial-hydration skeleton (2026-05-19). Replaces both the
          StatsPanel zero-gauges and the AG Grid empty-overlay "No flow
          matches" string during the ~1-3s window between page mount
          and first /api/scanner/feed completion. After the first load
          completes, hasInitiallyLoaded sticks and subsequent loading
          cycles render stale data instead of the skeleton. */}
      {!hasFullData ? (
        <DashboardSkeleton />
      ) : (
      <StatsPanel
        displayStats={displayStats}
        callPrem={callPrem}
        putPrem={putPrem}
        calls={calls}
        puts={puts}
      />
      )}

      <div className="flex flex-1 flex-col overflow-hidden border border-white/[0.06] rounded-lg" style={{ background: '#16191F' }}>
      {trades.length === 0 && !loading && isMarketClosedET() && (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <span className="text-sm text-zinc-400">Market closed — no live flow right now.</span>
          <Link href="/historical" className="text-sm text-cyan-400 hover:text-cyan-300 underline underline-offset-4 decoration-cyan-400/40 hover:decoration-cyan-300 transition-colors">
            Browse historical sessions →
          </Link>
        </div>
      )}
      {/* ── TABLE ── */}
      {/* AG Grid Phase 1 harness gate: when flag is on, render empty AG Grid
          harness instead of the legacy table. tableContainerRef stays attached
          to the legacy <div> only when the legacy path renders — the
          rowVirtualizer's getScrollElement returns null gracefully when the
          flag is on (the virtualizer simply doesn't activate). Pagination bar
          stays outside the conditional so the layout below is unaffected. */}
      {!hasInitiallyLoaded && loading ? (
        <ScannerSkeleton rowCount={15} />
      ) : !mounted ? (
        <div className="flex-1 flex items-center justify-center text-white/40 text-sm">
          Loading scanner…
        </div>
      ) : useAgGridEndpoint() ? (
        <ScannerAgGrid
          trades={trades}
          setFocusTicker={setFocusTicker}
          setFocusStrike={setFocusStrike}
          setFocusExpiry={setFocusExpiry}
          setFilterOptType={setFilterOptType}
          setFilterSide={setFilterSide}
          setFilterBuySell={setFilterBuySell}
          setFilterType={setFilterType}
          matchesFilterRef={matchesFilterRef}
          onApiReady={handleAgGridApiReady}
          enableSort={true}
          onSortChanged={(field, dir) => { setSortField(field); setSortDir(dir); setPage(0); setClientPage(0) }}
          rowHeight={rowHeightPx}
        />
      ) : (
      <div ref={tableContainerRef} className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none", fontVariantNumeric: "tabular-nums", background: '#1C1C1E' }}>
        {/* Inner loading-skeleton removed (2026-05-19) — the outer
            !hasInitiallyLoaded gate now intercepts the initial-load
            window for both AG Grid and legacy paths. Subsequent refetches
            keep stale data on screen rather than flashing the skeleton. */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-white/15 text-xs">
            {search ? `No trades matching "${search}"` : "No flow matches the current filters."}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10" style={{ background: '#252430' }}>
              <tr className="text-xs text-white/30 uppercase tracking-[0.08em]">
                {COLS.map(c => (
                  <th key={c.key} className={`${c.cls} py-1.5 font-medium`} style={{ borderRight: '1px solid rgba(255,255,255,0.04)' }}>{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody style={{
              paddingTop: `${rowVirtualizer.getVirtualItems()[0]?.start ?? 0}px`,
              paddingBottom: `${rowVirtualizer.getTotalSize() - (rowVirtualizer.getVirtualItems().at(-1)?.end ?? 0)}px`,
            }}>
              {rowVirtualizer.getVirtualItems().map(vRow => {
                const t = pageRows[vRow.index]
                if (!t || t.mm_suspected) return null
                return (
                  <SignalRow
                    key={vRow.key}
                    trade={t}
                    dataIndex={vRow.index}
                    measureRef={rowVirtualizer.measureElement}
                    setFocusTicker={setFocusTicker}
                    setFocusStrike={setFocusStrike}
                    setFocusExpiry={setFocusExpiry}
                  />
                )
              })}
            </tbody>
          </table>
        )}
      </div>
      )}

      {/* ── PAGINATION BAR — controls-only (2026-05-18) ──
           Status text (Updated / Showing / Page X of Y) intentionally
           removed per Ralph feedback — pagination buttons themselves
           are sufficient navigation context. Gate retained on
           totalClientPages > 1 so single-page views hide the whole
           bar (no controls needed when nothing to paginate).
           Disclaimer row below stays visible. */}
      {totalClientPages > 1 && (
      <div className="flex items-center justify-end gap-3 px-4 py-2 border-t border-white/[0.06] flex-shrink-0">
        {/* Right: numbered Pagination component */}
        {true ? (
          <Pagination className="w-auto mx-0">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => { setClientPage(Math.max(0, clientPage - 1)); tableContainerRef.current?.scrollTo(0, 0) }}
                  disabled={clientPage === 0}
                />
              </PaginationItem>
              {getPageNumbers(clientPage, totalClientPages).map((n, i) =>
                n === "ellipsis" ? (
                  <PaginationItem key={`e-${i}`}><PaginationEllipsis /></PaginationItem>
                ) : (
                  <PaginationItem key={n}>
                    <PaginationLink
                      isActive={n === clientPage}
                      size="icon"
                      onClick={() => { setClientPage(n as number); tableContainerRef.current?.scrollTo(0, 0) }}
                    >
                      {(n as number) + 1}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}
              <PaginationItem>
                <PaginationNext
                  onClick={() => { setClientPage(Math.min(totalClientPages - 1, clientPage + 1)); tableContainerRef.current?.scrollTo(0, 0) }}
                  disabled={clientPage >= totalClientPages - 1}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        ) : null  /* continuous scroll on non-today; no pagination controls */}
      </div>
      )}

      </div>

      {/* ── DISCLAIMER ── */}
      <div className="border-t border-white/[0.04] px-4 py-2 text-[10px] text-zinc-500 text-center flex-shrink-0">
        For informational purposes only. Not investment advice. Past performance does not guarantee future results. Options trading involves substantial risk.
      </div>
        </div>
      )}

      {/* ── UPGRADE MODAL ── */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowUpgradeModal(false)}>
          <div className="border border-[#1E2A3A] rounded-xl p-8 max-w-sm w-full mx-4" style={{ background: "#0F1520" }} onClick={e => e.stopPropagation()}>
            <div className="text-[#FF8A00] text-[10px] font-bold tracking-[0.15em] uppercase mb-3">Pro Feature</div>
            <div className="text-xl font-bold text-white mb-2">Gamma Wall Scanner</div>
            <div className="text-sm text-[#E7E5E4] mb-6 leading-relaxed">
              Real-time GEX heatmaps, gamma wall detection, and squeeze identification are available on the Pro plan.
            </div>
            <Link href="/#pricing" className="block w-full text-center py-3 rounded-lg bg-[#FF8A00] text-black font-bold text-[15px] hover:bg-[#e57309] transition-colors">
              Upgrade to Pro
            </Link>
            <button onClick={() => setShowUpgradeModal(false)} className="block w-full text-center py-2 mt-3 text-[#4A5A72] text-[15px] hover:text-[#E7E5E4] transition-colors">
              Not now
            </button>
          </div>
        </div>
      )}

      </div>
      {/* Command palette — reachable via S keypress on the heatmap tab */}
      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        symbol={gexSymbol}
        symbols={GEX_SYMBOLS.map((code: string) => ({ code, name: ({ SPY: "State Street SPDR S&P 500 ETF Trust", QQQ: "Invesco QQQ Trust", AAPL: "Apple Inc.", TSLA: "Tesla, Inc.", NVDA: "NVIDIA Corporation", META: "Meta Platforms, Inc.", MSFT: "Microsoft Corporation", AMZN: "Amazon.com, Inc.", GOOGL: "Alphabet Inc.", AMD: "Advanced Micro Devices, Inc.", MU: "Micron Technology, Inc.", COIN: "Coinbase Global, Inc.", PLTR: "Palantir Technologies Inc.", NFLX: "Netflix, Inc.", CRM: "Salesforce, Inc.", BA: "The Boeing Company", JPM: "JPMorgan Chase & Co.", GS: "Goldman Sachs Group, Inc.", XOM: "Exxon Mobil Corporation", GLD: "SPDR Gold Trust" } as Record<string, string>)[code] || code }))}
        onSymbolChange={setGexSymbol}
      />

    </div>
  )
}
