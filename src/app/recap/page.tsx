import type { Metadata } from "next"
import Link from "next/link"
import Nav from "@/components/Nav"
import Footer from "@/components/Footer"
import { getAllPosts } from "@/lib/blog"

const CANON = "https://profitbuilders.io/recap"

export const metadata: Metadata = {
  title: "Daily Flow Recaps · The Tape, Daily | Profit Builders",
  description:
    "Every market day's institutional options flow, recapped. Grade A signals, dealer gamma, accumulation patterns, closed P&L. Updated nightly from the Profit Builders desk.",
  alternates: { canonical: CANON },
  openGraph: {
    title: "The Tape, Daily — Profit Builders Flow Recaps",
    description:
      "Daily recaps of institutional options flow. Every market day. Free to read.",
    url: CANON,
    type: "website",
    images: [{ url: "/images/og-card.png", width: 1200, height: 630, alt: "Profit Builders Daily Flow Recaps" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Tape, Daily — Profit Builders Flow Recaps",
    description: "Every market day's institutional options flow, recapped.",
    images: ["/images/og-card.png"],
  },
}

function fmtDate(yyyymmdd: string): { weekday: string; month: string; day: string; year: string } {
  // yyyymmdd is "YYYY-MM-DD"
  const [y, m, d] = yyyymmdd.split("-")
  const dt = new Date(`${yyyymmdd}T16:00:00Z`)
  const weekday = dt.toLocaleString("en-US", { weekday: "long" })
  const month = dt.toLocaleString("en-US", { month: "long" })
  return { weekday, month, day: String(parseInt(d, 10)), year: y }
}

function isMarketDayRecap(slug: string): boolean {
  return /^flow-recap-\d{4}-\d{2}-\d{2}$/.test(slug)
}

export default function RecapHub() {
  const allPosts = getAllPosts()
  const recaps = allPosts.filter(p => isMarketDayRecap(p.slug))

  // ItemList JSON-LD (AI search citation)
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Profit Builders Daily Flow Recaps",
    description: "Daily institutional options flow recaps. Every market day's Grade A signals, dealer gamma reads, and accumulation patterns from the Profit Builders desk.",
    url: CANON,
    numberOfItems: recaps.length,
    itemListElement: recaps.map((r, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Article",
        name: r.title,
        description: r.description,
        url: `https://profitbuilders.io/blog/${r.slug}`,
        datePublished: r.date,
      },
    })),
  }

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Daily Flow Recaps",
    url: CANON,
    description: "Archive of every Profit Builders daily flow recap.",
    isPartOf: { "@type": "WebSite", name: "Profit Builders", url: "https://profitbuilders.io" },
  }

  // Stats: total recaps, distinct months covered, latest date
  const months = new Set(recaps.map(r => r.date.slice(0, 7)))
  const latestDate = recaps.length > 0 ? recaps[0].date : ""
  const earliestDate = recaps.length > 0 ? recaps[recaps.length - 1].date : ""

  // Group by year-month for editorial section breaks
  const grouped: Record<string, typeof recaps> = {}
  for (const r of recaps) {
    const key = r.date.slice(0, 7) // YYYY-MM
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(r)
  }
  const groupKeys = Object.keys(grouped).sort().reverse()

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />

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
        .recap-row { transition: background 200ms ease; }
        .recap-row:hover { background: rgba(96,165,250,0.025); }
        .recap-row:hover h3 { color: #60a5fa; transition: color 200ms; }
        .recap-row:hover .recap-arrow { transform: translateX(4px); color: #60a5fa; transition: transform 220ms cubic-bezier(0.16,1,0.3,1), color 220ms; }
      `}</style>

      <Nav />

      <main className="pb-grain text-[#E8EDF5] min-h-screen relative">
        <div className="relative z-10 max-w-[1200px] mx-auto px-8 max-md:px-6">

          {/* Masthead */}
          <div className="border-b pb-hairline pt-32 pb-6 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-7">
              <span className="pb-editorial italic text-[#c0c8d4] text-[16px]">The Tape, Daily</span>
            </div>
            <div className="pb-mono text-[11px] text-white/40 tracking-[0.18em] uppercase flex gap-7 max-md:gap-4 max-md:text-[10px] flex-wrap">
              <span className="border-r pb-hairline pr-7 max-md:pr-4">{recaps.length} recaps</span>
              <span className="border-r pb-hairline pr-7 max-md:pr-4">Updated {latestDate || "—"}</span>
              <span>Free to read</span>
            </div>
          </div>

          {/* Hero */}
          <section className="pt-20 pb-16 border-b pb-hairline">
            <div className="pb-mono text-[11px] tracking-[0.28em] text-[#60a5fa] uppercase mb-8">
              Daily research from the Profit Builders desk
            </div>
            <h1 className="pb-editorial font-normal text-[clamp(54px,7.5vw,96px)] tracking-[-0.02em] leading-[1.02] mb-9 max-w-[900px]">
              Every market day, <em className="italic text-white/70">recapped</em>.
            </h1>
            <p className="pb-editorial italic text-[22px] leading-[1.45] text-white/65 max-w-[720px] mb-11">
              Where the institutional money went. Which Grade A signals fired and where they closed. Dealer gamma reads, accumulation patterns, the prints that mattered.
            </p>
            <p className="pb-editorial text-[17px] leading-[1.65] text-white/65 max-w-[660px]">
              Each recap is written the night of the session, against the day&apos;s scanner output. We don&apos;t cherry-pick winners — we publish the same recap whether the tape was clean or whether the conviction engine got two of three calls wrong. The recaps are free; the engine that produces them is at <Link href="/results" className="text-[#60a5fa] border-b border-[#60a5fa]/40">profitbuilders.io/results</Link>.
            </p>

            <div className="mt-11 pt-6 border-t pb-hairline pb-mono text-[11px] tracking-[0.18em] text-white/40 uppercase flex gap-8 max-md:gap-4 max-md:text-[10px] flex-wrap">
              <span className="border-r pb-hairline pr-8 max-md:pr-4">By the Profit Builders desk</span>
              <span className="border-r pb-hairline pr-8 max-md:pr-4">Every market day</span>
              <span>Coverage since {earliestDate || "—"}</span>
            </div>
          </section>

          {/* Recap entries grouped by month */}
          {groupKeys.length === 0 ? (
            <section className="py-20 text-center">
              <p className="pb-editorial italic text-white/55 text-[18px]">No recaps yet — check back after the next market close.</p>
            </section>
          ) : (
            groupKeys.map((monthKey) => {
              const [yr, mo] = monthKey.split("-")
              const dt = new Date(`${monthKey}-15T12:00:00Z`)
              const monthLabel = dt.toLocaleString("en-US", { month: "long", year: "numeric" })
              const items = grouped[monthKey]

              return (
                <section key={monthKey}>
                  <div className="grid grid-cols-[140px_1fr_1fr] gap-10 items-end pt-16 pb-6 border-b pb-hairline max-md:grid-cols-[80px_1fr]">
                    <span className="pb-mono text-[11px] tracking-[0.22em] text-[#60a5fa] uppercase">{yr} · {mo}</span>
                    <h2 className="pb-editorial font-normal text-[32px] leading-[1.05] tracking-[-0.015em] max-md:text-[24px]">{monthLabel}</h2>
                    <p className="pb-mono text-[11px] tracking-[0.18em] text-white/35 uppercase text-right self-end max-md:hidden">
                      {items.length} {items.length === 1 ? "session" : "sessions"}
                    </p>
                  </div>

                  <div>
                    {items.map((r) => {
                      const d = fmtDate(r.date)
                      return (
                        <Link
                          key={r.slug}
                          href={`/blog/${r.slug}`}
                          className="recap-row grid grid-cols-[140px_1fr_180px] gap-10 py-8 border-b pb-hairline items-baseline max-md:grid-cols-[80px_1fr] max-md:gap-6"
                        >
                          <div className="self-start pt-2">
                            <div className="pb-editorial text-[42px] leading-[0.9] text-white max-md:text-[32px]">{d.day}</div>
                            <div className="pb-mono text-[10px] tracking-[0.18em] text-white/40 uppercase mt-2">
                              {d.weekday.slice(0, 3)} · {d.month.slice(0, 3)}
                            </div>
                          </div>
                          <div className="pr-6">
                            <h3 className="pb-editorial font-normal text-[22px] tracking-[-0.01em] leading-[1.2] text-white mb-2.5 max-md:text-[19px]">
                              {r.title.replace(/^[A-Z]+ Options Flow [A-Za-z]+ \d+\s*[—-]\s*/, "")}
                            </h3>
                            <p className="pb-editorial leading-[1.55] text-white/55 max-w-[580px] text-[15px]">{r.description}</p>
                          </div>
                          <div className="pb-mono text-[11px] text-white/40 tracking-[0.1em] uppercase self-start pt-3 text-right flex flex-col gap-2 items-end max-md:hidden">
                            <span className="text-white/50">{r.read_time} min read</span>
                            <span className="recap-arrow text-white/40">Read →</span>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </section>
              )
            })
          )}

          {/* Stat strip */}
          <div className="my-16 py-8 border-y-2 pb-hairline grid grid-cols-3 gap-10 max-md:grid-cols-1 max-md:gap-8">
            <div className="text-center">
              <div className="pb-editorial text-[44px] text-white leading-none tracking-[-0.02em] mb-2 max-md:text-[34px]">{recaps.length}</div>
              <div className="pb-mono text-[10px] tracking-[0.22em] text-white/40 uppercase">Sessions covered</div>
            </div>
            <div className="text-center">
              <div className="pb-editorial text-[44px] text-white leading-none tracking-[-0.02em] mb-2 max-md:text-[34px]">{months.size}</div>
              <div className="pb-mono text-[10px] tracking-[0.22em] text-white/40 uppercase">Months on record</div>
            </div>
            <div className="text-center">
              <div className="pb-editorial text-[44px] text-white leading-none tracking-[-0.02em] mb-2 max-md:text-[34px]">$0</div>
              <div className="pb-mono text-[10px] tracking-[0.22em] text-white/40 uppercase">To read every one</div>
            </div>
          </div>

          {/* CTA */}
          <section className="my-24 py-12 border-t pb-hairline text-center">
            <div className="pb-mono text-[11px] tracking-[0.28em] text-white/40 uppercase mb-5">Want it before the bell?</div>
            <h3 className="pb-editorial font-normal text-[clamp(28px,3.5vw,42px)] leading-[1.15] mb-6">
              Get the recap <em className="italic text-white/70">in your inbox</em>.
            </h3>
            <p className="pb-editorial text-white/55 max-w-[540px] mx-auto mb-8 text-[17px] leading-[1.55]">
              The Daily Flow Brief delivers each recap to your inbox at 8:45 AM ET — yesterday&apos;s top Grade A prints, accumulation, and closed P&amp;L. Free.
            </p>
            <Link href="/newsletter" className="pb-editorial italic text-white text-[19px] border-b pb-hairline pb-1 hover:text-[#60a5fa] hover:[border-bottom-color:#60a5fa] transition-colors">
              Subscribe to the Flow Brief →
            </Link>
            <div className="mt-12 pt-8 border-t pb-hairline pb-mono text-[10px] tracking-[0.2em] text-white/30 uppercase">
              Profit Builders · The Tape, Daily · Free, every market day
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  )
}
