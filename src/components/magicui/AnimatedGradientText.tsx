"use client"
export function AnimatedGradientText({ children, className = "" }: {
  children: React.ReactNode; className?: string
}) {
  return (
    <span className={`bg-gradient-to-r from-[#F5820A] via-[#FFD580] to-[#F5820A] bg-[length:200%_auto] bg-clip-text text-transparent animate-[gradient_3s_linear_infinite] ${className}`}>
      {children}
    </span>
  )
}
