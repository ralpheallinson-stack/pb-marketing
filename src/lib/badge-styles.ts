// Unified condition badge style — neutral slate, matches CheddarFlow aesthetic.
const UNIFIED = 'bg-slate-500/60 text-white/80 border-transparent'

export const TIER_STYLES: Record<string, string> = {
  conviction:    UNIFIED,
  event:         UNIFIED,
  institutional: UNIFIED,
  timing:        UNIFIED,
  activity:      UNIFIED,
  accumulation:  UNIFIED,
  size:          UNIFIED,
  position:      UNIFIED,
  warning:       'bg-amber-500/20 text-amber-300 border-amber-500/30',  // MIXED — fade signal (was ROLL/HEDGE pre-2026-05-09 c4519ab)
  structure:     UNIFIED,
  strategy:      UNIFIED,
  iv_high:       'bg-red-500/20 text-red-300 border-red-500/30',        // IV rank >= 70 — vol expensive
  iv_low:        'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',     // IV rank <= 30 — vol cheap
  directional:   'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', // True directional exposure (premium × delta)
  ruoa:          'bg-violet-500/20 text-violet-300 border-violet-500/30',   // Repeat unusual activity (multi-day streak)
  ruoa_heavy:    'bg-violet-500/40 text-violet-100 border-violet-400/50',   // Heavy RUOA — 5+ consecutive days
  iso:           'bg-cyan-500/25 text-cyan-200 border-cyan-400/40',         // Intermarket Sweep Order — directional aggression
  cross:         'bg-fuchsia-500/25 text-fuchsia-200 border-fuchsia-400/45', // Broker cross — options "dark pool" analog
  rapid:         'bg-teal-500/25 text-teal-200 border-teal-400/45',           // Stealth-split — 3+ same-contract aggressive prints in 5min
}

export const BADGE_BASE = 'whitespace-nowrap inline-flex items-center px-[5px] py-[2px] rounded-sm text-[11px] font-bold tracking-[0.04em] uppercase leading-[1.4] border'

export function badgeClass(tier: string): string {
  return `${BADGE_BASE} ${TIER_STYLES[tier] ?? UNIFIED}`
}
