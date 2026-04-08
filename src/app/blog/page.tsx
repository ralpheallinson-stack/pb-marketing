"use client"

import { useState, useEffect } from "react"
import Nav from "@/components/Nav"
import { BlurFade } from "@/components/magicui/BlurFade"

interface Post { slug: string; title: string; description: string; date: string; author: string; read_time: string }
interface FullPost extends Post { content_html: string }

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [post, setPost] = useState<FullPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [slug, setSlug] = useState<string | null>(null)

  // Detect slug from URL path
  useEffect(() => {
    const path = window.location.pathname
    const match = path.match(/^\/blog\/(.+)$/)
    if (match) setSlug(match[1])
  }, [])

  // Fetch post list or individual post
  useEffect(() => {
    if (slug) {
      document.title = "Loading... | Profit Builders"
      fetch(`/api/blog/posts/${slug}`)
        .then(r => r.json())
        .then(d => {
          if (d.error) { setSlug(null); return }
          setPost(d)
          document.title = `${d.title} | Profit Builders`
        })
        .catch(() => setSlug(null))
        .finally(() => setLoading(false))
    } else {
      document.title = "Learn Options Flow Trading | Profit Builders"
      fetch("/api/blog/posts")
        .then(r => r.json())
        .then(setPosts)
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }, [slug])

  // Individual post view
  if (slug && post) return (
    <div className="min-h-screen" style={{ background: "#0B0F1A" }}>
      <Nav />
      <article className="max-w-2xl mx-auto px-6 pt-24 pb-24">
        <a href="/blog" className="text-[10px] text-[#4A5A72] hover:text-[#7A8BA8] transition-colors uppercase tracking-widest">&larr; All Articles</a>
        <div className="flex items-center gap-2 text-[10px] text-[#4A5A72] uppercase tracking-widest mt-6 mb-6">
          <span>{post.date}</span><span>&middot;</span><span>{post.read_time} min read</span><span>&middot;</span><span>{post.author}</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white mb-8 leading-tight tracking-tight">{post.title}</h1>
        <div
          className="prose-custom"
          dangerouslySetInnerHTML={{ __html: post.content_html }}
        />
        <style>{`
          .prose-custom { color: #8A9AB5; font-size: 15px; line-height: 1.8; }
          .prose-custom h2 { color: white; font-weight: 700; font-size: 22px; margin-top: 2em; margin-bottom: 0.5em; }
          .prose-custom h3 { color: white; font-weight: 600; font-size: 18px; margin-top: 1.5em; margin-bottom: 0.5em; }
          .prose-custom p { margin-bottom: 1em; }
          .prose-custom strong { color: white; font-weight: 600; }
          .prose-custom a { color: #F5820A; text-decoration: none; }
          .prose-custom a:hover { text-decoration: underline; }
          .prose-custom ul, .prose-custom ol { margin: 1em 0; padding-left: 1.5em; }
          .prose-custom li { margin-bottom: 0.5em; }
          .prose-custom code { color: #A78BFA; background: rgba(167,139,250,0.1); padding: 2px 6px; border-radius: 4px; font-size: 13px; }
          .prose-custom pre { background: #0F1520; border: 1px solid #1E2A3A; border-radius: 8px; padding: 16px; overflow-x: auto; margin: 1.5em 0; }
          .prose-custom pre code { background: none; padding: 0; color: #C4CDD9; }
          .prose-custom blockquote { border-left: 3px solid #F5820A; padding-left: 16px; color: #7A8BA8; font-style: italic; margin: 1.5em 0; }
        `}</style>
        <div className="mt-16 border-t border-[#1E2A3A] pt-10 text-center">
          <div className="text-sm text-[#7A8BA8] mb-4">See these signals live in real time</div>
          <a href="/free-scanner" className="inline-block bg-[#F5820A] text-black font-bold px-6 py-3 rounded-lg hover:bg-[#e57309] transition-colors text-sm">
            Try the Free Scanner &rarr;
          </a>
        </div>
      </article>
    </div>
  )

  // Blog index
  return (
    <div className="min-h-screen" style={{ background: "#0B0F1A" }}>
      <Nav />
      <section className="relative text-center pt-24 pb-12 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="relative z-10"><div className="text-[11px] font-bold text-[#4A5A72] tracking-[0.2em] uppercase mb-6">Learn</div>
        <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Learn Options Flow Trading</h1>
        <p className="text-[#7A8BA8] max-w-xl mx-auto text-sm leading-relaxed">
          Educational guides on reading institutional order flow, understanding the Greeks, and using AI-powered analysis to find high-conviction setups.
        </p>
        </div>
      </section>
      <div className="max-w-5xl mx-auto px-6 pb-24">
        {loading ? (
          <div className="text-center py-10 text-[#3D4D63]">Loading articles...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-10 text-[#3D4D63]">No articles yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((p, i) => (
              <BlurFade key={p.slug} delay={i * 0.08} className="flex">
                <a href={`/blog/${p.slug}`}
                  className="group relative rounded-xl border border-[#1E2A3A] p-6 overflow-hidden hover:border-[#2E3A4D] transition-all hover:bg-[#161B24] flex flex-col flex-1" style={{ background: "#0F1520" }}>
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#F5820A]/0 to-transparent group-hover:via-[#F5820A]/50 transition-all duration-500" />
                  <div className="flex items-center gap-2 text-[10px] text-[#4A5A72] uppercase tracking-widest mb-3">
                    <span>{p.date}</span><span>&middot;</span><span>{p.read_time} min read</span>
                  </div>
                  <h2 className="text-base font-bold text-white mb-3 leading-snug group-hover:text-[#E8EDF5] transition-colors">{p.title}</h2>
                  <p className="text-sm text-[#7A8BA8] leading-relaxed mb-4" style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.description}</p>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#F5820A] group-hover:gap-2 transition-all mt-auto">Read article <span className="transition-transform group-hover:translate-x-0.5">&rarr;</span></span>
                </a>
              </BlurFade>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
