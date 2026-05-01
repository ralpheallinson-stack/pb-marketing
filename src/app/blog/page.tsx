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

// Slug → category mapping. Cheap rule-based classifier on existing
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
  const featured = posts.find(p => !p.slug.endsWith("-vs-profit-builders")) ?? posts[0]

  // Pre-compute the categorized blog post payload once on the server. The
  // client component merges this with live news fetched at runtime so the
  // grid renders instantly with blog content and news cards stream in.
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
            Blog &amp; Market News
          </h1>
          <p className="text-[#7A8BA8] max-w-xl mx-auto text-sm leading-relaxed mb-6">
            Daily flow recaps, educational guides, and live news on the tickers
            moving institutional options flow today.
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

      <div className="max-w-6xl mx-auto px-6 pb-24">
        {posts.length === 0 ? (
          <div className="text-center py-10 text-[#3D4D63]">No articles yet.</div>
        ) : (
          <>
            {/* Featured post — hero card with image */}
            {featured && (
              <BlurFade>
                <Link
                  href={`/blog/${featured.slug}`}
                  className="group relative block rounded-2xl border border-[#2E3A4D] mb-10 overflow-hidden hover:border-[#F5820A]/40 transition-all"
                  style={{ background: "#0F1520" }}
                >
                  <div className="grid md:grid-cols-[1.2fr_1fr]">
                    {/* Image side — uses the OG card we already render per post */}
                    <div className="relative aspect-[1.91/1] md:aspect-auto md:min-h-[280px] overflow-hidden bg-[#080B12]">
                      <img
                        src={`/blog/${featured.slug}/opengraph-image`}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                        loading="eager"
                      />
                      <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md text-[9px] font-extrabold tracking-[0.14em] uppercase bg-[#F5820A]/90 text-[#0B0F14] backdrop-blur">
                        Featured
                      </div>
                    </div>
                    {/* Body side */}
                    <div className="p-6 md:p-8 flex flex-col justify-center">
                      <div className="flex items-center gap-3 mb-3">
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
                      <h2 className="text-xl md:text-2xl font-extrabold text-white mb-2 leading-tight tracking-tight group-hover:text-[#F5820A] transition-colors">
                        {featured.title}
                      </h2>
                      <p className="text-sm text-[#94A3B8] leading-relaxed mb-4">
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

            {/* Unified feed — blog posts + live news cards interleaved by date */}
            <BlogFeed blogItems={blogItems} />
          </>
        )}
      </div>
    </div>
  )
}
