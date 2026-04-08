"use client"
export function ShimmerButton({ children, href, className = "" }: {
  children: React.ReactNode; href?: string; className?: string
}) {
  const cls = `relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl px-8 py-4 bg-[#F5820A] text-black font-bold text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/25 after:to-transparent after:-translate-x-full after:animate-[shimmer_2.5s_ease-in-out_infinite] ${className}`
  if (href) return <a href={href} className={cls}>{children}</a>
  return <button className={cls}>{children}</button>
}
