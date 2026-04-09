export const TIER_STYLES: Record<string, string> = {
  conviction:    'bg-[#FFD700]/15 text-[#FFD700] border-[#FFD700]/40 font-semibold',
  event:         'bg-[#f97316]/15 text-[#f97316] border-[#f97316]/40',
  institutional: 'bg-[#22c55e]/15 text-[#22c55e] border-[#22c55e]/40',
  timing:        'bg-[#a855f7]/15 text-[#a855f7] border-[#a855f7]/40',
  activity:      'bg-[#22d3ee]/15 text-[#22d3ee] border-[#22d3ee]/40',
  accumulation:  'bg-[#a855f7]/15 text-[#a855f7] border-[#a855f7]/40',
  size:          'bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/40',
  position:      'bg-white/[0.05] text-white/35 border-transparent',
  warning:       'bg-white/[0.06] text-white/30 border-transparent italic',
  structure:     'bg-[#22d3ee]/10 text-[#22d3ee]/70 border-[#22d3ee]/20',
  strategy:      'bg-[#f97316]/10 text-[#f97316] border-[#f97316]/30',
}

export const BADGE_BASE = 'whitespace-nowrap inline-flex items-center px-1.5 py-0.5 rounded-sm text-[10px] font-semibold tracking-wide uppercase border'

export function badgeClass(tier: string): string {
  return `${BADGE_BASE} ${TIER_STYLES[tier] ?? TIER_STYLES.position}`
}
