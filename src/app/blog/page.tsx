import Nav from "@/components/Nav"
import Link from "next/link"
import { BlurFade } from "@/components/magicui/BlurFade"
import { getAllPosts } from "@/lib/blog"
import type { Metadata } from "next"
import { EmailSignup } from "@/components/EmailSignup"

export const metadata: Metadata = {
  title: "Learn Options Flow Trading",
  description:
    "Educational guides on reading institutional order flow, understanding the Greeks, and using conviction-graded analysis to find high-conviction setups.",
  alternates: { canonical: "https://profitbuilders.io/blog" },
}

export default function BlogIndex() {
  const posts = getAllPosts()

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
      <section className="relative text-center pt-24 pb-12 px-4 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative z-10">
          <div className="text-[11px] font-bold text-[#4A5A72] tracking-[0.2em] uppercase mb-6">
            Learn
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">
            Learn Options Flow Trading
          </h1>
          <div className="mt-8 mb-4 max-w-2xl mx-auto">
            <EmailSignup source="blog-index" variant="banner" />
          </div>
          <div className="text-[12px] text-[#4A5A72] mb-4">
            Prefer a one-page printable reference? <Link href="/cheat-sheet" className="text-[#F5820A] hover:text-white transition-colors font-semibold">Get the free Options Flow Cheat Sheet &rarr;</Link>
          </div>
          <p className="text-[#7A8BA8] max-w-xl mx-auto text-sm leading-relaxed">
            Educational guides on reading institutional order flow, understanding
            the Greeks, and using conviction-graded analysis to find
            high-probability setups.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 pb-24">
        {posts.length === 0 ? (
          <div className="text-center py-10 text-[#3D4D63]">
            No articles yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((p, i) => (
              <BlurFade key={p.slug} delay={i * 0.06} className="flex">
                <Link
                  href={`/blog/${p.slug}`}
                  className="group relative rounded-xl border border-[#1E2A3A] p-6 overflow-hidden hover:border-[#2E3A4D] transition-all hover:bg-[#161B24] flex flex-col flex-1"
                  style={{ background: "#0F1520" }}
                >
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#F5820A]/0 to-transparent group-hover:via-[#F5820A]/50 transition-all duration-500" />
                  <div className="flex items-center gap-2 text-[10px] text-[#4A5A72] uppercase tracking-widest mb-3">
                    <span>{p.date}</span>
                    <span>&middot;</span>
                    <span>{p.read_time} min read</span>
                  </div>
                  <h2 className="text-base font-bold text-white mb-3 leading-snug group-hover:text-[#E8EDF5] transition-colors">
                    {p.title}
                  </h2>
                  <p
                    className="text-sm text-[#7A8BA8] leading-relaxed mb-4"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {p.description}
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#F5820A] group-hover:gap-2 transition-all mt-auto">
                    Read article{" "}
                    <span className="transition-transform group-hover:translate-x-0.5">
                      &rarr;
                    </span>
                  </span>
                </Link>
              </BlurFade>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
