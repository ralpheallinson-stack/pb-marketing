import Nav from "@/components/Nav"
import Link from "next/link"
import { BlurFade } from "@/components/magicui/BlurFade"
import { getAllPosts } from "@/lib/blog"
import type { Metadata } from "next"
import { EmailSignup } from "@/components/EmailSignup"
import BlogFeed from "@/components/BlogFeed"

export const metadata: Metadata = {
  title: "Blog & Market News",
  description:
    "Daily flow recaps, educational guides, methodology breakdowns, and the latest market news affecting institutional options flow — Benzinga headlines on the tickers actually moving today.",
  alternates: { canonical: "https://profitbuilders.io/blog" },
}

// Slug → category mapping. Cheap rule-based classifier on the existing
// filename pattern; lets us add visible category badges without a CMS
// migration. Light-theme palette: muted brand variants of the dark accents
// so badges sit calmly on a white card instead of vibrating against it.
function categoryFor(slug: string): { label: string; color: string; bg: string; border: string } {
  if (slug.startsWith("flow-recap-")) return { label: "Recap", color: "#B45309", bg: "#FEF3C7", border: "#FCD34D" }
  if (slug.endsWith("-vs-profit-builders")) return { label: "Comparison", color: "#6D28D9", bg: "#EDE9FE", border: "#C4B5FD" }
  if (slug.startsWith("how-to-")) return { label: "Guide", color: "#047857", bg: "#D1FAE5", border: "#6EE7B7" }
  if (slug.startsWith("morning-routine") || slug.includes("first-15-minutes")) return { label: "Routine", color: "#047857", bg: "#D1FAE5", border: "#6EE7B7" }
  if (slug.includes("sweep") || slug.includes("block") || slug.includes("ruoa") || slug.includes("accumul")) return { label: "Setup", color: "#1D4ED8", bg: "#DBEAFE", border: "#93C5FD" }
  if (slug.includes("greek") || slug.includes("iv") || slug.includes("gamma")) return { label: "Greeks", color: "#1D4ED8", bg: "#DBEAFE", border: "#93C5FD" }
  if (slug.includes("scanner") || slug.includes("flow-scanner-2026")) return { label: "Tools", color: "#1D4ED8", bg: "#DBEAFE", border: "#93C5FD" }
  return { label: "Article", color: "#4B5563", bg: "#F3F4F6", border: "#D1D5DB" }
}

export default function BlogIndex() {
  const posts = getAllPosts()
  const featured = posts.find(p => !p.slug.endsWith("-vs-profit-builders")) ?? posts[0]

  const blogItems = posts
    .filter(p => p.slug !== (featured?.slug ?? ""))
    .map(p => ({
      kind: "blog" as const,
      slug: p.slug,
      title: p.title,
      description: p.description,
      date: p.date,
      ts: Date.parse(p.date) / 1000 || 0,
      readTime: p.read_time,
      category: categoryFor(p.slug),
      image: `/blog/${p.slug}/opengraph-image`,
    }))

  const itemListSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Profit Builders Options Flow Blog & Market News",
    "description": "Educational guides, daily flow recaps, methodology breakdowns, and live market news on the tickers moving institutional options flow.",
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
    <div className="min-h-screen bg-white text-gray-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: itemListSchema }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbSchema }} />
      <Nav />

      {/* ── Hero — light, calm, editorial ── */}
      <section className="relative text-center pt-28 pb-12 px-4 overflow-hidden border-b border-gray-100">
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: "radial-gradient(circle, #94A3B8 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="relative z-10">
          <div className="text-[11px] font-bold text-gray-400 tracking-[0.22em] uppercase mb-5">
            Profit Builders Blog
          </div>
          <h1 className="text-[40px] md:text-[52px] font-extrabold text-gray-900 mb-4 tracking-tight leading-[1.05]">
            Options flow, in context.
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto text-[15px] leading-relaxed mb-7">
            Daily flow recaps, educational guides, and live news on the tickers
            moving institutional options flow today.
          </p>
          <div className="max-w-xl mx-auto">
            <EmailSignup source="blog-index" variant="banner" />
          </div>
          <div className="text-[12px] text-gray-400 mt-4">
            Prefer a one-page printable reference?{" "}
            <Link href="/cheat-sheet" className="text-[#F5820A] hover:text-[#C2570A] transition-colors font-semibold">
              Get the free Options Flow Cheat Sheet →
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-14">
        {posts.length === 0 ? (
          <div className="text-center py-10 text-gray-400">No articles yet.</div>
        ) : (
          <>
            {/* Featured post — light hero card with soft shadow */}
            {featured && (
              <BlurFade>
                <Link
                  href={`/blog/${featured.slug}`}
                  className="group relative block rounded-2xl border border-gray-200 mb-12 overflow-hidden bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:border-gray-300 transition-all duration-300"
                >
                  <div className="grid md:grid-cols-[1.2fr_1fr]">
                    <div className="relative aspect-[1.91/1] md:aspect-auto md:min-h-[320px] overflow-hidden bg-gray-50">
                      <img
                        src={`/blog/${featured.slug}/opengraph-image`}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                        loading="eager"
                      />
                      <div className="absolute top-4 left-4 px-2.5 py-1 rounded-md text-[9px] font-extrabold tracking-[0.14em] uppercase bg-[#F5820A] text-white shadow-md">
                        Featured
                      </div>
                    </div>
                    <div className="p-7 md:p-9 flex flex-col justify-center">
                      <div className="flex items-center gap-2.5 mb-3 flex-wrap">
                        {(() => {
                          const c = categoryFor(featured.slug)
                          return (
                            <span
                              className="text-[9px] font-extrabold uppercase tracking-[0.14em] px-2 py-0.5 rounded border"
                              style={{ color: c.color, background: c.bg, borderColor: c.border }}
                            >
                              {c.label}
                            </span>
                          )
                        })()}
                        <span className="text-[11px] text-gray-400">{featured.date}</span>
                        <span className="text-[11px] text-gray-300">·</span>
                        <span className="text-[11px] text-gray-400">{featured.read_time} min read</span>
                      </div>
                      <h2 className="text-[24px] md:text-[28px] font-extrabold text-gray-900 mb-3 leading-[1.15] tracking-tight group-hover:text-[#F5820A] transition-colors">
                        {featured.title}
                      </h2>
                      <p className="text-[15px] text-gray-600 leading-relaxed mb-5">
                        {featured.description}
                      </p>
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#F5820A] group-hover:gap-2 transition-all">
                        Read article{" "}
                        <span className="transition-transform group-hover:translate-x-0.5">→</span>
                      </span>
                    </div>
                  </div>
                </Link>
              </BlurFade>
            )}

            {/* Unified feed — blog posts + news interleaved by date */}
            <BlogFeed blogItems={blogItems} />
          </>
        )}
      </div>
    </div>
  )
}
