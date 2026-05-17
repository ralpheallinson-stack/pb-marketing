"use client"

import * as React from "react"

// AccountMenu — sidebar profile dropdown. Replaces the top-bar
// Account/Logout links per Cheddar-parity UX (2026-05-11). Custom
// useState + mousedown click-outside; zero new deps (Radix
// DropdownMenu not installed and not worth adding for two items).
// Extracted from scanner/page.tsx so /historical can reuse the same
// dropdown node without duplicating the function definition.
export function AccountMenu({
  buttonClassName,
  children,
}: {
  buttonClassName: string
  children: React.ReactNode
}) {
  const [open, setOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={buttonClassName}
        aria-label="Profile and settings"
        aria-expanded={open}
        title="Profile"
      >
        {children}
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute left-full ml-2 bottom-0 z-50 min-w-[140px] rounded-md border border-white/[0.08] bg-stone-900 shadow-lg py-1"
        >
          <a
            href="/account"
            role="menuitem"
            className="block px-3 py-2 text-sm text-white/80 hover:bg-white/[0.05] hover:text-white transition-colors"
          >
            Account
          </a>
          <a
            href="/logout"
            role="menuitem"
            className="block px-3 py-2 text-sm text-white/80 hover:bg-white/[0.05] hover:text-white transition-colors"
          >
            Logout
          </a>
        </div>
      ) : null}
    </div>
  )
}
