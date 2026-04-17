import Nav from "@/components/Nav"
import Link from "next/link"
import { BlurFade } from "@/components/magicui/BlurFade"
import { getAllPosts } from "@/lib/blog"
import type { Metadata } from "next"
import { EmailSignup } from "@/components/EmailSignup"

export const metadata: Metadata = {
  title: "Learn Options Flow Trading",
  description:
    "Educational guides on reading institutional order flow, understanding the Greeks, and using AI-powered analysis to find high-conviction setups.",
  alternates: { canonical: "https://profitbuilders.io/blog" },
}

export default function BlogIndex() {
  const posts = getAllPosts()

  return (
    <div className="min-h-screen" style={{ background: "#0B0F1A" }}>
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
          <p className="text-[#7A8BA8] max-w-xl mx-auto text-sm leading-relaxed">
            Educational guides on reading institutional order flow, understanding
            the Greeks, and using AI-powered analysis to find high-conviction
            setups.
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
