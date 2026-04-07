"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface MorphingTextProps {
  texts: string[]
  className?: string
}

export function MorphingText({ texts, className }: MorphingTextProps) {
  const [index, setIndex] = useState(0)
  const [fade, setFade] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % texts.length)
        setFade(true)
      }, 300)
    }, 2500)
    return () => clearInterval(interval)
  }, [texts.length])

  return (
    <span
      className={cn(
        "inline-block transition-opacity duration-300",
        fade ? "opacity-100" : "opacity-0",
        className
      )}
    >
      {texts[index]}
    </span>
  )
}
