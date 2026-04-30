import type { Metadata } from "next"
import Link from "next/link"
import Nav from "@/components/Nav"
import Footer from "@/components/Footer"

const CANON = "https://profitbuilders.io/learn"

export const metadata: Metadata = {
  title: "The Library · Learn Options Flow | Profit Builders",
  description:
    "A field guide to the way institutional money actually moves. 14 essays, 50,000+ words on options flow — what the prints mean, how the filter pipeline surfaces institutional flow, and how to build a workflow around the documented methodology.",
  alternates: { canonical: CANON },
  openGraph: {
    title: "The Profit Builders Library · Learn Options Flow",
    description: "14 essays on options flow, GEX, accumulation, and how to read institutional moves before price.",
    url: CANON,
    type: "website",
    images: [{ url: "/images/og-card.png", width: 1200, height: 630, alt: "The Profit Builders Library" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Profit Builders Library — Learn Options Flow",
    description: "Free 50,000-word library on reading institutional flow.",
    images: ["/images/og-card.png"],
  },
}

type Entry = {
  num: string
  href: string
  title: string
  titleEm?: { before?: string; em: string; after?: string }
  dek: string
  badge?: string
  badgeStyle?: "editor" | "default"
  readTime: string
  featured?: boolean
}

const SECTION_I: Entry[] = [
  {
    num: "01 / 14",
    href: "/blog/options-flow-guide",
    title: "The Options Flow Guide",
    dek: "The canonical reference. How to read institutional flow in 2026 — what the prints mean, what the framework is, and how to build a workflow around it. The same body of thinking that drives our nine-filter engine. Read this end-to-end the first time. Bookmark it after.",
    badge: "Editor's choice",
    badgeStyle: "editor",
    readTime: "22 min read",
    featured: true,
  },
  {
    num: "02 / 14",
    href: "/blog/what-is-options-flow-trading",
    titleEm: { before: "", em: "What", after: " options flow trading actually is." },
    title: "What options flow trading actually is.",
    dek: "A beginner's primer. Why retail traders follow flow, why the institutions leave a footprint to begin with, and why most copy-the-tape strategies fail.",
    badge: "Beginner",
    readTime: "5 min read",
  },
  {
    num: "03 / 14",
    href: "/blog/how-to-read-options-flow",
    title: "How to read flow, in practice.",
    dek: "The exact framework. Ticker, strike, premium, aggression. What to look for, what to ignore, and how to tell the difference within five seconds of seeing a print.",
    badge: "Practical",
    readTime: "9 min read",
  },
]

const SECTION_II: Entry[] = [
  {
    num: "04 / 14",
    href: "/blog/sweep-vs-block-vs-dark-pool",
    title: "Sweep, block, dark pool — and the difference that matters.",
    dek: "The three flow types signal three different things, and most retail traders systematically misread which is which. A sweep is aggression. A block is patience. A dark-pool print is something else entirely.",
    badge: "Most read",
    readTime: "10 min read",
    featured: true,
  },
  {
    num: "05 / 14",
    href: "/blog/what-is-gamma-exposure-gex",
    title: "Gamma exposure, explained.",
    dek: "How dealer hedging creates magnetism in the underlying — and why zero gamma is the most important number on the chain.",
    badge: "Reference",
    readTime: "8 min read",
  },
  {
    num: "06 / 14",
    href: "/blog/what-is-options-accumulation",
    titleEm: { before: "How smart money ", em: "builds", after: " a position." },
    title: "How smart money builds a position.",
    dek: "The accumulation pattern. Escalating prints. Rapid badges. The META 620C example, a position built in fifty-three minutes across seven prints.",
    badge: "Pattern",
    readTime: "6 min read",
  },
  {
    num: "07 / 14",
    href: "/blog/options-greeks-for-flow-trading",
    title: "The Greeks, but only the ones that matter.",
    dek: "Delta, gamma, theta, vega, IV. What each one tells you about a flow print, in plain English, with no academic detours.",
    badge: "Reference",
    readTime: "7 min read",
  },
  {
    num: "08 / 14",
    href: "/blog/vol-oi-ratio-explained",
    title: "Vol over open interest — the cleanest filter we own.",
    dek: "The single most useful gate for separating new positioning from closing trades. Why we weight it so heavily in the institutional-flow filter pipeline.",
    badge: "Filter",
    readTime: "5 min read",
  },
]

const SECTION_III: Entry[] = [
  {
    num: "09 / 14",
    href: "/blog/options-flow-signals-grade-a-b-c",
    title: "Grade A, B, and C — what they mean.",
    dek: "The nine-filter engine in detail. What gets through, what doesn't, and the data behind each gate.",
    badge: "Methodology",
    readTime: "10 min read",
  },
  {
    num: "10 / 14",
    href: "/blog/morning-routine-first-15-minutes",
    title: "The first fifteen minutes.",
    dek: "The pre-bell checklist used internally — overnight prints, the GEX setup, what to skip, and why most traders are already losing by 9:32.",
    badge: "Workflow",
    readTime: "4 min read",
  },
  {
    num: "11 / 14",
    href: "/blog/how-to-read-sweep-and-block-trades",
    title: "Reading sweeps and blocks at the tape.",
    dek: "Tactical. What each badge means in the live tape, with real Grade A examples from the public log.",
    badge: "Tactical",
    readTime: "8 min read",
  },
  {
    num: "12 / 14",
    href: "/blog/scanner-color-guide",
    title: "The scanner, color by color.",
    dek: "What every shade in the live tape means. Bullish, bearish, accumulation, MM-suspected, deep ITM. Three minutes you'll re-read once a week for a month.",
    badge: "Quick",
    readTime: "3 min read",
  },
]

const SECTION_IV: Entry[] = [
  {
    num: "13 / 14",
    href: "/blog/best-options-flow-scanner-2026",
    title: "The best options flow scanner of 2026.",
    dek: "A side-by-side: scoring methodology, price, transparency, what each platform misses. Honest where it's hard to be — including where we're a worse choice.",
    badge: "Roundup",
    badgeStyle: "editor",
    readTime: "12 min read",
    featured: true,
  },
  {
    num: "14 / 14",
    href: "/vs",
    title: "Profit Builders versus the field.",
    dek: "Individual breakdowns: Unusual Whales · FlowAlgo · Cheddar Flow · BlackBox Stocks · Market Chameleon · Barchart · OptionStrat · SpotGamma. Every comparison page, in one place.",
    badge: "8 reviews",
    readTime: "~7 min each",
  },
]

const ALL_ENTRIES: Entry[] = [...SECTION_I, ...SECTION_II, ...SECTION_III, ...SECTION_IV]

const itemListSchema = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "The Profit Builders Library — Learn Options Flow",
  description: "Curated 14-essay library on reading institutional options flow, GEX, accumulation, and the institutional-flow filter pipeline.",
  url: CANON,
  numberOfItems: ALL_ENTRIES.length,
  itemListElement: ALL_ENTRIES.map((e, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "Article",
      name: e.title,
      description: e.dek,
      url: `https://profitbuilders.io${e.href}`,
    },
  })),
})

function EntryRow({ entry }: { entry: Entry }) {
  return (
    <Link href={entry.href} className="pb-row grid grid-cols-[80px_1fr_200px] gap-10 py-8 border-b pb-hairline items-baseline max-md:grid-cols-[50px_1fr] max-md:gap-6">
      <span className="pb-mono text-[13px] text-white/35 tracking-[0.1em] self-start pt-2">{entry.num}</span>
      <div className="pr-6">
        <h3 className={`pb-editorial font-normal tracking-[-0.01em] leading-[1.15] text-white mb-2.5 ${entry.featured ? "text-[38px]" : "text-[28px]"}`}>
          {entry.titleEm ? (
            <>
              {entry.titleEm.before}<em className="italic text-white/75">{entry.titleEm.em}</em>{entry.titleEm.after}
            </>
          ) : (
            entry.title
          )}
        </h3>
        <p className={`pb-editorial leading-[1.55] text-white/55 max-w-[580px] ${entry.featured ? "text-[17px]" : "text-[16px]"}`}>{entry.dek}</p>
      </div>
      <div className="pb-mono text-[11px] text-white/40 tracking-[0.1em] uppercase self-start pt-2 text-right flex flex-col gap-2 items-end max-md:hidden">
        {entry.badge && (
          <span className={`rounded-full px-2.5 py-1 border ${entry.badgeStyle === "editor" ? "border-amber-400/40 text-amber-300" : "pb-hairline text-white/55"}`}>
            {entry.badge}
          </span>
        )}
        <span className="text-white/50">{entry.readTime}</span>
        <span className="pb-row-arrow text-white/40">Read →</span>
      </div>
    </Link>
  )
}

function SectionHeader({ roman, title, summary }: { roman: string; title: string; summary: string }) {
  return (
    <div className="grid grid-cols-[80px_1fr_1fr] gap-10 items-end pt-20 pb-6 border-b pb-hairline max-md:grid-cols-[50px_1fr]">
      <span className="pb-editorial italic text-[#60a5fa] text-[64px] leading-[0.9] max-md:text-[44px]">{roman}</span>
      <h2 className="pb-editorial font-normal text-[36px] leading-[1.05] tracking-[-0.015em] max-md:text-[28px]">{title}</h2>
      <p className="text-[15px] italic leading-[1.5] text-right text-white/50 self-end max-md:hidden">{summary}</p>
    </div>
  )
}

export default function LearnPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: itemListSchema }} />

      <style>{`
        .pb-grain {
          background-image:
            radial-gradient(ellipse at 20% 10%, rgba(37,99,235,0.08), transparent 50%),
            radial-gradient(ellipse at 85% 40%, rgba(22,163,74,0.04), transparent 45%),
            linear-gradient(180deg, #0E1117 0%, #0B0E13 100%);
        }
        .pb-grain::before {
          content: "";
          position: fixed; inset: 0;
          background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,0.025) 1px, transparent 0);
          background-size: 3px 3px;
          pointer-events: none;
          z-index: 1;
        }
        .pb-hairline { border-color: rgba(122,139,168,0.14); }
        .pb-mono { font-family: "IBM Plex Mono", "Menlo", monospace; letter-spacing: -0.01em; }
        .pb-editorial { font-family: Georgia, "Iowan Old Style", "Times New Roman", serif; }
        .pb-row-arrow { transition: transform 220ms cubic-bezier(0.16,1,0.3,1), color 220ms; }
        .pb-row { transition: background 200ms ease; }
        .pb-row:hover { background: rgba(96,165,250,0.025); }
        .pb-row:hover .pb-row-arrow { transform: translateX(4px); color: #60a5fa; }
        .pb-row:hover h3 { color: #60a5fa; transition: color 200ms; }
        .pb-drop-cap::first-letter {
          font-family: Georgia, serif;
          float: left;
          font-size: 78px;
          line-height: 0.85;
          margin: 6px 12px 0 0;
          color: #60a5fa;
          font-weight: 700;
        }
      `}</style>

      <Nav />

      <main className="pb-grain text-[#E8EDF5] min-h-screen relative">
        <div className="relative z-10 max-w-[1200px] mx-auto px-8 max-md:px-6">

          {/* Masthead under nav */}
          <div className="border-b pb-hairline pt-32 pb-6 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-7">
              <span className="pb-editorial italic text-[#c0c8d4] text-[16px]">The Library</span>
            </div>
            <div className="pb-mono text-[11px] text-white/40 tracking-[0.18em] uppercase flex gap-7 max-md:gap-4 max-md:text-[10px]">
              <span className="border-r pb-hairline pr-7 max-md:pr-4">Volume IV · Issue 12</span>
              <span className="border-r pb-hairline pr-7 max-md:pr-4">Updated Apr 25, 2026</span>
              <span>14 essays · 50,318 words</span>
            </div>
          </div>

          {/* Headline */}
          <section className="pt-20 pb-16 border-b pb-hairline">
            <div className="pb-mono text-[11px] tracking-[0.28em] text-[#60a5fa] uppercase mb-8">A reader&apos;s library on options flow</div>
            <h1 className="pb-editorial font-normal text-[clamp(54px,7.5vw,96px)] tracking-[-0.02em] leading-[1.02] mb-9 max-w-[900px]">
              A field guide to the way <em className="italic text-white/70">institutional money</em> actually moves.
            </h1>
            <p className="pb-editorial italic text-[22px] leading-[1.45] text-white/65 max-w-[720px] mb-11">
              Fourteen essays — fifty thousand words — on what flow is, what the prints actually mean, and how the people who read it well separate signal from noise.
            </p>
            <p className="pb-editorial pb-drop-cap text-[17px] leading-[1.65] text-white/65 max-w-[660px]">
              If you&apos;ve spent any time on trading Twitter, Discord, or YouTube, you&apos;ve seen the phrase &ldquo;institutional flow&rdquo; thrown around like gospel. A $5M NVDA call sweep hits the tape and a hundred people announce it as if the trade has already happened. But a lot of retail traders who try to follow flow lose money anyway — because reading flow well isn&apos;t about seeing big prints. It&apos;s about understanding which prints matter, which don&apos;t, and why. This library is the framework we use internally, the same one that drives our <Link href="/blog/options-flow-signals-grade-a-b-c" className="text-[#60a5fa] border-b border-[#60a5fa]/40">institutional-flow filter pipeline</Link> and our <Link href="/results" className="text-[#60a5fa] border-b border-[#60a5fa]/40">documented data methodology</Link>.
            </p>
            <div className="mt-11 pt-6 border-t pb-hairline pb-mono text-[11px] tracking-[0.18em] text-white/40 uppercase flex gap-8 max-md:gap-4 max-md:text-[10px] max-md:flex-wrap">
              <span className="border-r pb-hairline pr-8 max-md:pr-4">By the Profit Builders desk</span>
              <span className="border-r pb-hairline pr-8 max-md:pr-4">Updated weekly</span>
              <span>Free to read</span>
            </div>
          </section>

          {/* Section I */}
          <SectionHeader roman="I." title="Begin here, in order." summary="If you have never followed flow before, these three are the right entry points." />
          <div>{SECTION_I.map((e) => <EntryRow key={e.num} entry={e} />)}</div>

          {/* Pull quote */}
          <section className="my-16 py-12 border-y-2 pb-hairline text-center max-md:py-8">
            <q className="pb-editorial italic text-[clamp(22px,2.4vw,30px)] leading-[1.4] text-white max-w-[820px] inline-block before:content-['\201C'] before:text-[#60a5fa] before:mr-1 after:content-['\201D'] after:text-[#60a5fa] after:ml-1">
              Reading flow well isn&apos;t about seeing big prints. It&apos;s about understanding which prints matter, which don&apos;t, and why.
            </q>
            <div className="pb-mono text-[11px] tracking-[0.2em] text-white/40 uppercase mt-6">From <em className="italic">The Options Flow Guide</em> · Profit Builders</div>
          </section>

          {/* Section II */}
          <SectionHeader roman="II." title="The mechanics, in detail." summary="Once the basics are clear, this is what the signals actually mean." />
          <div>{SECTION_II.map((e) => <EntryRow key={e.num} entry={e} />)}</div>

          {/* Section III */}
          <SectionHeader roman="III." title="At the terminal." summary="How to use Profit Builders specifically — grades, badges, the morning routine." />
          <div>{SECTION_III.map((e) => <EntryRow key={e.num} entry={e} />)}</div>

          {/* Section IV */}
          <SectionHeader roman="IV." title="Choosing a tool." summary="Where Profit Builders sits against every other scanner in the category." />
          <div>{SECTION_IV.map((e) => <EntryRow key={e.num} entry={e} />)}</div>

          {/* Stat strip */}
          <div className="my-16 py-8 border-y-2 pb-hairline grid grid-cols-4 gap-10 max-md:grid-cols-2 max-md:gap-8">
            {[
              { num: "14", label: "Essays" },
              { num: "50,318", label: "Words in print" },
              { num: "2 hr 18 m", label: "End-to-end read" },
              { num: "$0", label: "To read all of it" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="pb-editorial text-[48px] text-white leading-none tracking-[-0.02em] mb-2.5 max-md:text-[36px]">{s.num}</div>
                <div className="pb-mono text-[10px] tracking-[0.22em] text-white/40 uppercase">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Colophon */}
          <section className="my-24 py-12 border-t pb-hairline text-center">
            <div className="pb-mono text-[11px] tracking-[0.28em] text-white/40 uppercase mb-5">Colophon</div>
            <h3 className="pb-editorial font-normal text-[clamp(28px,3.5vw,42px)] leading-[1.15] mb-6">
              Read this library beside the <em className="italic text-white/70">live tape</em>.
            </h3>
            <p className="pb-editorial text-white/55 max-w-[540px] mx-auto mb-8 text-[17px] leading-[1.55]">
              Every concept here points at a real Grade A signal in the public log. Start the trial; read in one window, watch the scanner in the other. The two halves only make sense together.
            </p>
            <Link href="/pricing" className="pb-editorial italic text-white text-[19px] border-b pb-hairline pb-1 hover:text-[#60a5fa] hover:[border-bottom-color:#60a5fa] transition-colors">
              Begin a free seven-day trial →
            </Link>
            <div className="mt-12 pt-8 border-t pb-hairline pb-mono text-[10px] tracking-[0.2em] text-white/30 uppercase">
              Profit Builders · The Library · Updated April 25, 2026 · Free, forever
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  )
}
