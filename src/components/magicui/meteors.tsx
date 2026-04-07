"use client"

import { useEffect, useState } from "react"

interface MeteorsProps {
  number?: number
}

export const Meteors = ({ number = 20 }: MeteorsProps) => {
  const [meteorStyles, setMeteorStyles] = useState<Array<React.CSSProperties>>([])

  useEffect(() => {
    const styles = Array.from({ length: number }, () => ({
      top: Math.random() * 100 + "%",
      left: Math.random() * 100 + "%",
      animationDelay: Math.random() * 1 + 0.2 + "s",
      animationDuration: Math.floor(Math.random() * 8 + 2) + "s",
    }))
    setMeteorStyles(styles)
  }, [number])

  return (
    <>
      {meteorStyles.map((style, idx) => (
        <span
          key={idx}
          className="pointer-events-none absolute size-0.5 rotate-[215deg] animate-[meteor_5s_linear_infinite] rounded-full bg-blue-400 shadow-[0_0_0_1px_rgba(59,130,246,0.13)] before:absolute before:top-1/2 before:h-px before:w-[50px] before:-translate-y-1/2 before:bg-gradient-to-r before:from-blue-400 before:to-transparent before:content-['']"
          style={style}
        />
      ))}
    </>
  )
}
