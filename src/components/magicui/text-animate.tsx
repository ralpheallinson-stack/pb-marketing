"use client"

import { useEffect, useState, CSSProperties } from "react"
import { cn } from "@/lib/utils"

type Animation = "blurInUp" | "fadeIn"

interface TextAnimateProps {
  children: string
  animation?: Animation
  by?: "character" | "word"
  once?: boolean
  className?: string
  style?: CSSProperties
}

const animationStyles: Record<Animation, { from: CSSProperties; to: CSSProperties }> = {
  blurInUp: {
    from: { opacity: 0, filter: "blur(8px)", transform: "translateY(8px)" },
    to: { opacity: 1, filter: "blur(0px)", transform: "translateY(0)" },
  },
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
}

export function TextAnimate({
  children,
  animation = "fadeIn",
  by = "word",
  once = false,
  className,
  style,
}: TextAnimateProps) {
  const [visible, setVisible] = useState(false)
  const anim = animationStyles[animation]

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  const segments =
    by === "character"
      ? children.split("").map((ch) => (ch === " " ? "\u00A0" : ch))
      : children.split(" ")

  return (
    <span className={cn("inline-flex flex-wrap", className)} style={style}>
      {segments.map((seg, i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            transition: `all 0.4s ease ${i * 0.03}s`,
            ...(visible ? anim.to : anim.from),
          }}
        >
          {seg}
          {by === "word" && i < segments.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </span>
  )
}
