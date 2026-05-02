"use client"
import Link from "next/link"
import { useState } from "react"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"

type Item = { href: string; label: string; description: string }

const productItems: Item[] = [
  { href: "/#features",  label: "Features",    description: "Sweep + block detection, Greeks, conviction grading." },
  { href: "/results",    label: "Methodology", description: "How signals are graded and outcomes audited." },
  { href: "/vs",         label: "Compare",     description: "Profit Builders vs Cheddar, Unusual Whales, FlowAlgo." },
]

const resourceItems: Item[] = [
  { href: "/learn",      label: "Learn",     description: "Reading institutional flow, free 5-day course." },
  { href: "/blog",       label: "Blog",      description: "Daily desk notes, recaps, and breakdowns." },
  { href: "/community",  label: "Community", description: "Discord + Telegram for live flow discussion." },
]

function MenuPanel({ items }: { items: Item[] }) {
  return (
    <ul className="grid w-[420px] gap-1 p-3 md:w-[480px] md:grid-cols-1">
      {items.map(it => (
        <li key={it.href}>
          <NavigationMenuLink asChild>
            <Link
              href={it.href}
              className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-white/5 focus:bg-white/5"
            >
              <div className="text-sm font-semibold text-white">{it.label}</div>
              <p className="mt-1 text-[12px] leading-snug text-white/55">{it.description}</p>
            </Link>
          </NavigationMenuLink>
        </li>
      ))}
    </ul>
  )
}

export default function Nav() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <header className="pb-nav-floating sticky top-0 z-50 border-b border-white/5 bg-[#080C12] md:bg-[#080C12]/85 md:backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:px-6">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0" aria-label="Home">
          <img src="/images/pb-logo.png" alt="Profit Builders" width={32} height={32} className="h-8 w-8 object-contain" />
          <span className="text-base font-semibold tracking-tight text-white">Profit Builders</span>
        </Link>

        {/* Desktop menu */}
        <NavigationMenu className="hidden md:flex" viewport={false}>
          <NavigationMenuList className="gap-1">
            <NavigationMenuItem>
              <NavigationMenuTrigger className="h-10 bg-transparent text-white/70 hover:text-white hover:bg-white/5 data-[state=open]:bg-white/5 data-[state=open]:text-white text-[15px]">
                Product
              </NavigationMenuTrigger>
              <NavigationMenuContent className="border border-white/10 bg-[#0F1117] text-white shadow-[0_16px_48px_rgba(0,0,0,0.4)]">
                <MenuPanel items={productItems} />
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger className="h-10 bg-transparent text-white/70 hover:text-white hover:bg-white/5 data-[state=open]:bg-white/5 data-[state=open]:text-white text-[15px]">
                Resources
              </NavigationMenuTrigger>
              <NavigationMenuContent className="border border-white/10 bg-[#0F1117] text-white shadow-[0_16px_48px_rgba(0,0,0,0.4)]">
                <MenuPanel items={resourceItems} />
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  href="/#pricing"
                  className="inline-flex h-10 items-center rounded-md px-4 text-[15px] font-medium text-white/70 transition-colors hover:text-white hover:bg-white/5"
                >
                  Pricing
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Right cluster */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href="/login"
            className="hidden md:inline-flex h-10 items-center rounded-md px-3 text-[15px] font-medium text-white/70 hover:text-white transition-colors"
          >
            Login
          </Link>
          <Link
            href="/pricing"
            className="inline-flex h-10 items-center rounded-md bg-white px-5 text-[15px] font-semibold text-[#0a0d12] hover:bg-white/90 transition-colors"
          >
            Start Trial
          </Link>

          {/* Mobile hamburger */}
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen(o => !o)}
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-md text-white/70 hover:text-white hover:bg-white/5 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <g>
                  <line x1="3" y1="7"  x2="21" y2="7" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="17" x2="21" y2="17" />
                </g>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile dropdown — relative z-50 so it stays above the backdrop overlay */}
      {open && (
        <>
          <div className="md:hidden relative z-50 border-t border-white/10 bg-[#0F1117]">
            <div className="px-5 py-5">
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/45 font-mono mb-3">Product</div>
              <div className="space-y-1">
                {productItems.map(it => (
                  <Link key={it.href} href={it.href} onClick={close}
                    className="block py-2 text-[15px] text-white">
                    {it.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="px-5 py-5 border-t border-white/5">
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/45 font-mono mb-3">Resources</div>
              <div className="space-y-1">
                {resourceItems.map(it => (
                  <Link key={it.href} href={it.href} onClick={close}
                    className="block py-2 text-[15px] text-white">
                    {it.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="px-5 py-5 border-t border-white/5 flex items-center justify-between">
              <Link href="/#pricing" onClick={close} className="text-[15px] text-white">Pricing</Link>
              <Link href="/login" onClick={close} className="text-[15px] text-white/70">Login</Link>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close menu"
            onClick={close}
            className="md:hidden fixed inset-0 top-20 z-30 bg-black/40 cursor-default"
          />
        </>
      )}
    </header>
  )
}
