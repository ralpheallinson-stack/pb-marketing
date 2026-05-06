"use client"

import { useEffect, useState } from "react"

interface Heading {
  id: string
  text: string
}

/**
 * Sticky scroll-spy TOC for blog posts. Reads H2 IDs that the marked
 * renderer already injects in lib/blog.ts, then highlights the active
 * section as the user scrolls. Anchor click smooth-scrolls with an 80px
 * offset so the heading isn't hidden under the sticky nav.
 *
 * Light theme to match the blog: gray rest state, orange (#F97316) active.
 */
export default function BlogTableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState<string>("")

  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".pb-prose h2[id]")
    const list: Heading[] = []
    els.forEach(el => {
      list.push({ id: el.id, text: el.textContent?.trim() ?? "" })
    })
    setHeadings(list)
  }, [])

  useEffect(() => {
    if (headings.length === 0) return

    const computeActive = () => {
      const positions = headings.map(h => {
        const el = document.getElementById(h.id)
        return { id: h.id, top: el ? el.getBoundingClientRect().top : Infinity }
      })

      let active = positions.find(p => p.top >= -50 && p.top <= 120)
      if (!active) {
        const above = positions.filter(p => p.top < -50).sort((a, b) => b.top - a.top)
        active = above[0]
      }
      if (!active) {
        const below = positions.filter(p => p.top > 120).sort((a, b) => a.top - b.top)
        active = below[0]
      }
      if (active && active.id !== activeId) setActiveId(active.id)
    }

    let timer: ReturnType<typeof setTimeout> | null = null
    const onScroll = () => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(computeActive, 10)
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    computeActive()

    return () => {
      window.removeEventListener("scroll", onScroll)
      if (timer) clearTimeout(timer)
    }
  }, [headings, activeId])

  const handleClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    const el = document.getElementById(id)
    if (!el) return
    const top = el.getBoundingClientRect().top + window.pageYOffset - 80
    window.history.pushState({}, "", `#${id}`)
    window.scrollTo({ top, behavior: "smooth" })
  }

  if (headings.length < 3) return null

  return (
    <nav aria-label="Table of contents" className="text-[13px]">
      <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500 mb-4">
        On this page
      </div>
      <ol className="space-y-2.5 border-l border-gray-200">
        {headings.map((h, i) => {
          const isActive = activeId === h.id
          return (
            <li key={h.id} className="relative">
              <a
                href={`#${h.id}`}
                onClick={e => handleClick(e, h.id)}
                className={
                  "block pl-4 -ml-px border-l-2 leading-snug transition-colors " +
                  (isActive
                    ? "border-[#F97316] text-[#F97316] font-semibold"
                    : "border-transparent text-gray-500 hover:text-gray-900")
                }
              >
                <span className="font-mono text-[10px] text-gray-400 tabular-nums mr-2">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {h.text}
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
