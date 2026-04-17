import Nav from "@/components/Nav"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getAllSlugs, getAllPosts, getPost } from "@/lib/blog"
import { CopyLinkButton } from "@/components/CopyLinkButton"
import type { Metadata } from "next"

export const dynamicParams = false
export function generateStaticParams() {
  return getAllSlugs().map(slug => ({ slug }))
}

export async function generateMetadata({
  params,
}: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) return {}
  const url = `https://profitbuilders.org/blog/${slug}`
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      type: "article",
      publishedTime: post.date,
      authors: ["Profit Builders"],
      images: ["/images/og-card.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: ["/images/og-card.png"],
    },
  }
}

export default async function BlogPostPage({
  params,
}: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) notFound()

  const url = `https://profitbuilders.org/blog/${slug}`
  const shareText = encodeURIComponent(post.title + " " + url)

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: { "@type": "Organization", name: "Profit Builders", url: "https://profitbuilders.org" },
    publisher: {
      "@type": "Organization",
      name: "Profit Builders",
      logo: { "@type": "ImageObject", url: "https://profitbuilders.org/images/pb-logo.png" },
    },
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    image: "https://profitbuilders.org/images/og-card.png",
  }

  const allPosts = getAllPosts()
  const related = allPosts.filter(p => p.slug !== slug).slice(0, 3)

  const [y, m, d] = post.date.split("-").map(Number)
  const dateObj = new Date(Date.UTC(y, m - 1, d))
  const dateFormatted = dateObj.toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric", timeZone: "UTC",
  })

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      {/* Reading progress bar */}
      <div id="reading-progress" style={{
        position: "fixed", top: 0, left: 0, height: 2, zIndex: 100, width: "0%",
        background: "linear-gradient(90deg, #F97316, #EC4899)",
        transition: "width 0.1s ease-out",
      }} />
      <script dangerouslySetInnerHTML={{ __html: `(function(){var b=document.getElementById('reading-progress');if(!b)return;window.addEventListener('scroll',function(){var h=document.documentElement.scrollHeight-window.innerHeight;b.style.width=h>0?Math.min(100,window.scrollY/h*100)+'%':'0%'},{passive:true})})()` }} />

      {/* Blog nav — minimal, light */}
      <nav className="border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/pb-monogram.png"
              alt="Profit Builders"
              width={28}
              height={28}
              style={{ filter: "invert(1)", borderRadius: 4 }}
            />
            <span className="text-[13px] font-semibold text-gray-900 tracking-tight">Profit Builders</span>
          </a>
          <div className="flex items-center gap-4">
            <Link href="/blog" className="text-[12px] text-gray-500 hover:text-gray-900 transition-colors">Blog</Link>
            <a href="/free-scanner" className="text-[12px] font-semibold text-[#F97316] hover:text-[#EA580C] transition-colors">Try Scanner</a>
          </div>
        </div>
      </nav>

      <article className="max-w-[680px] mx-auto px-6 pt-12 pb-16">

        {/* Back */}
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-[12px] text-gray-400 hover:text-[#F97316] transition-colors mb-10">
          <span>&larr;</span> All articles
        </Link>

        {/* ── HERO ── */}
        <header className="mb-10">
          <div className="flex items-center gap-2 text-[12px] text-gray-400 mb-4">
            <time>{dateFormatted}</time>
            <span>·</span>
            <span>{post.read_time} min read</span>
          </div>

          <h1 className="text-[36px] md:text-[44px] font-bold text-gray-950 leading-[1.1] tracking-[-0.03em] mb-5" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
            {post.title}
          </h1>

          <p className="text-[17px] text-gray-500 leading-relaxed mb-6" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
            {post.description}
          </p>

          {/* Author + share */}
          <div className="flex items-center justify-between py-4 border-t border-b border-gray-100">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/pb-monogram.png"
                alt=""
                width={32}
                height={32}
                style={{ filter: "invert(1)", borderRadius: 6 }}
              />
              <div>
                <div className="text-[13px] font-semibold text-gray-900">Profit Builders</div>
                <div className="text-[11px] text-gray-400">Institutional flow analysis</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={`https://x.com/intent/tweet?text=${shareText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-gray-900 border border-gray-200 hover:border-gray-300 rounded-md px-3 py-1.5 transition-colors"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                Share
              </a>
              <CopyLinkButton url={url} />
            </div>
          </div>
        </header>

        {/* ── BODY ── */}
        <div
          className="pb-prose"
          dangerouslySetInnerHTML={{ __html: post.content_html }}
        />

        {/* ── EMAIL CTA ── */}
        <div className="my-12 py-7 px-6 rounded-lg border border-gray-200 bg-gray-50">
          <div className="flex items-start gap-4">
            <div className="w-9 h-9 rounded-lg bg-[#F97316] flex items-center justify-center flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </div>
            <div>
              <div className="text-gray-900 font-semibold text-[15px] mb-1">The Flow Brief</div>
              <div className="text-gray-500 text-[13px] mb-3">Yesterday&apos;s top institutional flow, in your inbox before the bell. Free, daily, no spam.</div>
              <a href="/free-scanner" className="text-[12px] font-semibold text-[#F97316] hover:text-[#EA580C] transition-colors">
                Subscribe &rarr;
              </a>
            </div>
          </div>
        </div>

        {/* ── TRIAL CTA ── */}
        <div className="mt-14 py-10 px-8 rounded-xl bg-gray-950 text-center">
          <div className="text-[10px] text-gray-500 uppercase tracking-[3px] font-semibold mb-3">Live Scanner</div>
          <p className="text-white font-bold text-[20px] mb-2" style={{ fontFamily: "Georgia, serif" }}>
            See the prints we can&apos;t publish here.
          </p>
          <p className="text-gray-400 text-[14px] mb-6 max-w-sm mx-auto leading-relaxed">
            Every strike, every expiration, every accumulation pattern — tracked in real time.
          </p>
          <a
            href="/free-scanner"
            className="inline-flex items-center gap-2 bg-[#F97316] text-white font-bold px-7 py-3 rounded-full hover:bg-[#EA580C] transition-colors text-[13px]"
          >
            Start Free 7-Day Trial
          </a>
        </div>
      </article>

      {/* ── RELATED POSTS ── */}
      {related.length > 0 && (
        <section className="max-w-4xl mx-auto px-6 pb-20">
          <div className="border-t border-gray-100 pt-12">
            <h2 className="text-[12px] text-gray-400 uppercase tracking-[3px] font-semibold mb-8">
              Continue reading
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {related.map(p => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="group block p-5 rounded-xl border border-gray-100 hover:border-gray-300 bg-white transition-all hover:-translate-y-0.5 hover:shadow-sm"
                >
                  <div className="text-[11px] text-gray-400 mb-3">
                    {p.date} · {p.read_time} min
                  </div>
                  <div className="text-[15px] font-semibold text-gray-900 group-hover:text-[#F97316] transition-colors leading-snug" style={{ fontFamily: "Georgia, serif" }}>
                    {p.title}
                  </div>
                  <div className="text-[12px] text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                    {p.description}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── PROSE STYLES ── */}
      <style>{`
        .pb-prose {
          color: #1a1a1a;
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 18px;
          line-height: 1.8;
          letter-spacing: -0.003em;
        }
        .pb-prose h2 {
          font-family: -apple-system, 'Segoe UI', sans-serif;
          color: #0a0a0a;
          font-weight: 800;
          font-size: 24px;
          margin-top: 2.2em;
          margin-bottom: 0.6em;
          letter-spacing: -0.02em;
          line-height: 1.3;
        }
        .pb-prose h3 {
          font-family: -apple-system, 'Segoe UI', sans-serif;
          color: #0a0a0a;
          font-weight: 700;
          font-size: 19px;
          margin-top: 1.8em;
          margin-bottom: 0.5em;
          letter-spacing: -0.01em;
        }
        .pb-prose p {
          margin-bottom: 1.3em;
        }
        .pb-prose strong {
          color: #0a0a0a;
          font-weight: 700;
        }
        .pb-prose a {
          color: #F97316;
          text-decoration: underline;
          text-decoration-color: rgba(249,115,22,0.3);
          text-underline-offset: 3px;
          transition: text-decoration-color 0.15s;
        }
        .pb-prose a:hover {
          text-decoration-color: #F97316;
        }
        .pb-prose ul, .pb-prose ol {
          margin: 1.3em 0;
          padding-left: 1.6em;
        }
        .pb-prose li {
          margin-bottom: 0.5em;
          padding-left: 0.2em;
        }
        .pb-prose li::marker {
          color: #F97316;
        }

        /* Pull quotes */
        .pb-prose blockquote {
          border-left: 3px solid #F97316;
          padding: 12px 20px;
          margin: 1.8em 0;
          background: #FFF7ED;
          border-radius: 0 6px 6px 0;
          color: #1a1a1a;
          font-style: normal;
          font-size: 17px;
        }

        /* Data/code */
        .pb-prose code {
          font-family: 'SF Mono', 'Fira Code', monospace;
          color: #F97316;
          background: #FFF7ED;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 15px;
        }
        .pb-prose pre {
          background: #FAFAFA;
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          padding: 16px;
          overflow-x: auto;
          margin: 1.5em 0;
        }
        .pb-prose pre code {
          background: none;
          padding: 0;
          color: #374151;
        }

        /* Dividers */
        .pb-prose hr {
          border: none;
          height: 1px;
          background: #E5E7EB;
          margin: 2.5em 0;
        }

        /* Images */
        .pb-prose img {
          border-radius: 8px;
          margin: 1.5em 0;
        }

        /* Line clamp */
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}
