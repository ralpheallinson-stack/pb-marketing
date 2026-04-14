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
  warning:       UNIFIED,
  structure:     UNIFIED,
  strategy:      UNIFIED,
}

export const BADGE_BASE = 'whitespace-nowrap inline-flex items-center px-[5px] py-[2px] rounded-sm text-[11px] font-bold tracking-[0.04em] uppercase leading-[1.4] border'

export function badgeClass(tier: string): string {
  return `${BADGE_BASE} ${TIER_STYLES[tier] ?? UNIFIED}`
}
