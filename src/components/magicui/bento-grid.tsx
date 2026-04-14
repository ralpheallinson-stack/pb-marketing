import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface BentoGridProps {
  children: ReactNode
  className?: string
}

interface BentoCardProps {
  name: string
  className?: string
  background?: ReactNode
  Icon?: React.ElementType
  description: string
  tag?: string
  tagColor?: string
  children?: ReactNode
}

export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div className={cn("grid auto-rows-[minmax(200px,auto)] grid-cols-3 gap-3", className)}>
      {children}
    </div>
  )
}

export function BentoCard({
  name,
  className,
  background,
  Icon,
  description,
  tag,
  tagColor,
  children,
}: BentoCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl",
        "border border-white/10 bg-white/5",
        "transition-all duration-300 hover:border-white/20 hover:bg-white/8",
        className
      )}
    >
      {background && (
        <div className="absolute inset-0">{background}</div>
      )}
      <div className="relative z-10 flex h-full flex-col justify-between p-6">
        <div>
          {tag && (
            <span
              className="mb-3 inline-block rounded-full px-3 py-1 text-xs font-bold font-mono uppercase tracking-wider"
              style={{ background: tagColor || 'rgba(59,130,246,0.2)', color: '#60a5fa' }}
            >
              {tag}
            </span>
          )}
          {Icon && <Icon className="mb-3 h-8 w-8 text-white/60" />}
          <h3 className="mb-2 font-bold text-white text-lg leading-tight">{name}</h3>
          <p className="text-sm text-white/50 leading-relaxed">{description}</p>
        </div>
        {children}
      </div>
    </div>
  )
}
