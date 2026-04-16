import Nav from "@/components/Nav"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getAllSlugs, getPost } from "@/lib/blog"
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
      images: ["/images/og.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: ["/images/og.png"],
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
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Organization",
      name: "Profit Builders",
      url: "https://profitbuilders.org",
    },
    publisher: {
      "@type": "Organization",
      name: "Profit Builders",
      logo: {
        "@type": "ImageObject",
        url: "https://profitbuilders.org/images/pb-logo.png",
      },
    },
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    image: "https://profitbuilders.org/images/og.png",
  }

  return (
    <div className="min-h-screen" style={{ background: "#0B0F1A" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <Nav />
      <article className="max-w-2xl mx-auto px-6 pt-24 pb-24">
        <Link
          href="/blog"
          className="text-[10px] text-[#4A5A72] hover:text-[#7A8BA8] transition-colors uppercase tracking-widest"
        >
          &larr; All Articles
        </Link>
        <div className="flex items-center gap-2 text-[10px] text-[#4A5A72] uppercase tracking-widest mt-6 mb-6">
          <span>{post.date}</span>
          <span>&middot;</span>
          <span>{post.read_time} min read</span>
          <span>&middot;</span>
          <span>{post.author}</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white mb-8 leading-tight tracking-tight">
          {post.title}
        </h1>
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
        <div className="mt-12 rounded-xl border border-[#F97316]/20 bg-[#F97316]/5 p-8 text-center">
          <p className="text-white font-bold text-xl mb-2">
            Try Profit Builders Free for 7 Days
          </p>
          <p className="text-white/50 text-sm mb-6">
            Real-time flow. Conviction grading. Public track record.
          </p>
          <a
            href="https://buy.stripe.com/7sYdRbcs8bqTfC21j50RG07"
            className="inline-flex items-center gap-2 bg-[#F97316] text-white font-bold px-8 py-3 rounded-full hover:bg-[#F97316]/90 transition-colors"
          >
            Start Free Trial
          </a>
        </div>
      </article>
    </div>
  )
}
