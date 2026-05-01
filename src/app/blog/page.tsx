import Nav from "@/components/Nav"
import Link from "next/link"
import { BlurFade } from "@/components/magicui/BlurFade"
import { getAllPosts } from "@/lib/blog"
import type { Metadata } from "next"
import { EmailSignup } from "@/components/EmailSignup"
import MarketNewsWidget from "@/components/MarketNewsWidget"

export const metadata: Metadata = {
  title: "Learn Options Flow Trading",
  description:
    "Educational guides on reading institutional order flow, understanding the Greeks, and using conviction-graded analysis to find high-conviction setups.",
  alternates: { canonical: "https://profitbuilders.io/blog" },
}

// Slug → category mapping. Cheap rule-based classifier on the existing
// filename pattern; lets us add visible category badges without a CMS
// migration. Order matters: more specific first.
function categoryFor(slug: string): { label: string; color: string } {
  if (slug.startsWith("flow-recap-")) return { label: "Recap", color: "#F5820A" }
  if (slug.endsWith("-vs-profit-builders")) return { label: "Comparison", color: "#A855F7" }
  if (slug.startsWith("how-to-")) return { label: "Guide", color: "#22C55E" }
  if (slug.startsWith("morning-routine") || slug.includes("first-15-minutes")) return { label: "Routine", color: "#22C55E" }
  if (slug.includes("sweep") || slug.includes("block") || slug.includes("ruoa") || slug.includes("accumul")) return { label: "Setup", color: "#60A5FA" }
  if (slug.includes("greek") || slug.includes("iv") || slug.includes("gamma")) return { label: "Greeks", color: "#60A5FA" }
  if (slug.includes("scanner") || slug.includes("flow-scanner-2026")) return { label: "Tools", color: "#60A5FA" }
  return { label: "Article", color: "#94A3B8" }
}

export default function BlogIndex() {
  const posts = getAllPosts()
  // Featured post = newest non-comparison post (recap or guide). Comparisons
  // shouldn't dominate the hero; they're conversion-oriented, not editorial.
  const featured = posts.find(p => !p.slug.endsWith("-vs-profit-builders")) ?? posts[0]
  const rest = posts.filter(p => p.slug !== (featured?.slug ?? ""))

  const itemListSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Profit Builders Options Flow Blog",
    "description": "Educational guides and daily flow recaps covering institutional options flow, conviction grading, sweeps, blocks, accumulation, and gamma exposure.",
    "numberOfItems": posts.length,
    "itemListElement": posts.slice(0, 20).map((p, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "url": `https://profitbuilders.io/blog/${p.slug}`,
      "name": p.title,
      "description": p.description,
    })),
  })

  const breadcrumbSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://profitbuilders.io" },
      { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://profitbuilders.io/blog" },
    ],
  })

  return (
    <div className="min-h-screen" style={{ background: "#0B0F1A" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: itemListSchema }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbSchema }} />
      <Nav />

      {/* ── Hero ── */}
      <section className="relative text-center pt-24 pb-10 px-4 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative z-10">
          <div className="text-[11px] font-bold text-[#4A5A72] tracking-[0.2em] uppercase mb-4">
            Learn
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight">
            Learn Options Flow Trading
          </h1>
          <p className="text-[#7A8BA8] max-w-xl mx-auto text-sm leading-relaxed mb-6">
            Educational guides, daily flow recaps, and methodology breakdowns on
            institutional order flow, the Greeks, and conviction-graded analysis.
          </p>
          <div className="max-w-xl mx-auto">
            <EmailSignup source="blog-index" variant="banner" />
          </div>
          <div className="text-[12px] text-[#4A5A72] mt-4">
            Prefer a one-page printable reference?{" "}
            <Link href="/cheat-sheet" className="text-[#F5820A] hover:text-white transition-colors font-semibold">
              Get the free Options Flow Cheat Sheet →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Two-column body: posts left, sidebar right ── */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">

          {/* Posts column */}
          <div>
            {posts.length === 0 ? (
              <div className="text-center py-10 text-[#3D4D63]">No articles yet.</div>
            ) : (
              <>
                {/* Featured post — visually distinct hero card */}
                {featured && (
                  <BlurFade>
                    <Link
                      href={`/blog/${featured.slug}`}
                      className="group relative block rounded-2xl border border-[#2E3A4D] p-8 mb-10 overflow-hidden hover:border-[#F5820A]/40 transition-all"
                      style={{ background: "linear-gradient(135deg, #0F1520 0%, #161B24 100%)" }}
                    >
                      <div className="absolute top-0 right-0 w-64 h-64 opacity-[0.05] pointer-events-none"
                           style={{ background: "radial-gradient(circle, #F5820A 0%, transparent 70%)" }} />
                      <div className="relative">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold tracking-[0.14em] uppercase bg-[#F5820A]/15 text-[#F5820A] border border-[#F5820A]/30">
                            Featured
                          </span>
                          {(() => {
                            const c = categoryFor(featured.slug)
                            return (
                              <span className="text-[9px] font-bold uppercase tracking-[0.14em]" style={{ color: c.color }}>
                                {c.label}
                              </span>
                            )
                          })()}
                          <span className="text-[10px] text-[#4A5A72]">·</span>
                          <span className="text-[10px] text-[#4A5A72]">{featured.date}</span>
                          <span className="text-[10px] text-[#4A5A72]">·</span>
                          <span className="text-[10px] text-[#4A5A72]">{featured.read_time} min read</span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3 leading-tight tracking-tight group-hover:text-[#F5820A] transition-colors">
                          {featured.title}
                        </h2>
                        <p className="text-[15px] text-[#94A3B8] leading-relaxed mb-5 max-w-2xl">
                          {featured.description}
                        </p>
                        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#F5820A] group-hover:gap-2 transition-all">
                          Read article{" "}
                          <span className="transition-transform group-hover:translate-x-0.5">→</span>
                        </span>
                      </div>
                    </Link>
                  </BlurFade>
                )}

                {/* Rest of posts — uniform 2-col grid (was 3-col, now 2 to match width with sidebar) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {rest.map((p, i) => {
                    const cat = categoryFor(p.slug)
                    return (
                      <BlurFade key={p.slug} delay={i * 0.04} className="flex">
                        <Link
                          href={`/blog/${p.slug}`}
                          className="group relative rounded-xl border border-[#1E2A3A] p-5 overflow-hidden hover:border-[#2E3A4D] transition-all hover:bg-[#161B24] flex flex-col flex-1"
                          style={{ background: "#0F1520" }}
                        >
                          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent to-transparent group-hover:via-[#F5820A]/50 transition-all duration-500"
                               style={{ ["--via-color" as string]: cat.color }} />
                          <div className="flex items-center gap-2 mb-3">
                            <span
                              className="text-[9px] font-extrabold tracking-[0.14em] uppercase px-1.5 py-0.5 rounded"
                              style={{ color: cat.color, background: `${cat.color}1A`, border: `1px solid ${cat.color}33` }}
                            >
                              {cat.label}
                            </span>
                            <span className="text-[10px] text-[#4A5A72]">{p.date}</span>
                            <span className="text-[10px] text-[#4A5A72]">·</span>
                            <span className="text-[10px] text-[#4A5A72]">{p.read_time}m</span>
                          </div>
                          <h3 className="text-[15px] font-bold text-white mb-2 leading-snug group-hover:text-[#E8EDF5] transition-colors">
                            {p.title}
                          </h3>
                          <p
                            className="text-[13px] text-[#7A8BA8] leading-relaxed mb-3"
                            style={{
                              display: "-webkit-box",
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {p.description}
                          </p>
                          <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#F5820A] group-hover:gap-2 transition-all mt-auto">
                            Read{" "}
                            <span className="transition-transform group-hover:translate-x-0.5">→</span>
                          </span>
                        </Link>
                      </BlurFade>
                    )
                  })}
                </div>
              </>
            )}
          </div>

          {/* Sidebar — sticky on desktop. Renders the live market-news widget
              and a quick-link block to /methodology + /scanner. */}
          <aside className="lg:sticky lg:top-24 lg:self-start space-y-5">
            <MarketNewsWidget />

            <div className="rounded-xl border border-[#1E2A3A] bg-[#0F1520] p-5">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#4A5A72] mb-3">
                See it live
              </div>
              <Link href="/scanner" className="block mb-3 group">
                <div className="text-[13px] font-semibold text-white group-hover:text-[#F5820A] transition-colors">
                  Open the scanner →
                </div>
                <div className="text-[11px] text-[#7A8BA8] leading-relaxed">
                  Real-time institutional flow with grade A/B filters
                </div>
              </Link>
              <Link href="/methodology" className="block group">
                <div className="text-[13px] font-semibold text-white group-hover:text-[#F5820A] transition-colors">
                  How we process the OPRA tape →
                </div>
                <div className="text-[11px] text-[#7A8BA8] leading-relaxed">
                  Methodology, conventions, and validation
                </div>
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
