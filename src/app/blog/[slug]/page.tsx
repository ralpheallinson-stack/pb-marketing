import Link from "next/link"
import { notFound } from "next/navigation"
import { getAllSlugs, getAllPosts, getPost, tocFromMarkdown } from "@/lib/blog"
import { getAuthor } from "@/lib/authors"
import { CopyLinkButton } from "@/components/CopyLinkButton"
import { EmailSignup } from "@/components/EmailSignup"
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
  const url = `https://profitbuilders.io/blog/${slug}`
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: url, types: { "application/rss+xml": "/rss.xml" } },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      type: "article",
      publishedTime: post.date,
      authors: ["Profit Builders"],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  }
}

export default async function BlogPostPage({
  params,
}: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) notFound()

  const url = `https://profitbuilders.io/blog/${slug}`
  const shareText = encodeURIComponent(post.title + " " + url)

  const author = getAuthor(post.author)
  const modified = post.updated ?? post.date
  const hasBeenUpdated = post.updated && post.updated !== post.date

  // Author schema — Organization when using the default fallback, Person when
  // a human author has been configured (richer E-E-A-T signal for YMYL content).
  const authorSchema = author.name === "Profit Builders"
    ? { "@type": "Organization", name: author.name, url: "https://profitbuilders.io" }
    : {
        "@type": "Person",
        name: author.name,
        url: author.url ? `https://profitbuilders.io${author.url}` : undefined,
        image: author.image?.startsWith("http") ? author.image : author.image ? `https://profitbuilders.io${author.image}` : undefined,
        jobTitle: author.role,
        ...(author.sameAs && author.sameAs.length > 0 ? { sameAs: author.sameAs } : {}),
      }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: modified,
    author: authorSchema,
    publisher: {
      "@type": "Organization",
      name: "Profit Builders",
      logo: { "@type": "ImageObject", url: "https://profitbuilders.io/images/pb-logo.png" },
    },
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    image: "https://profitbuilders.io/images/og-card.png",
  }

  // Build a table of contents from H2 headings for long-form posts.
  // Only surface the TOC when the post has 3+ sections, otherwise it's noise.
  const tocItems = tocFromMarkdown(post.body)
  const showToc = tocItems.length >= 3


  // FAQ schema for comparison/high-intent posts (SEO rich snippets)
  const FAQ_DATA: Record<string, {q: string, a: string}[]> = {
    "best-options-flow-scanner-2026": [
      { q: "What is the best options flow scanner in 2026?", a: "The top options flow scanners in 2026 include Profit Builders, Unusual Whales, CheddarFlow, FlowAlgo, and BlackBoxStocks. Profit Builders is the only scanner that grades every signal by conviction and publishes a public track record of outcomes." },
      { q: "How much does an options flow scanner cost?", a: "Options flow scanners range from $29 to $199 per month. Profit Builders offers a 7-day free trial with real-time flow, conviction grading, and GEX heatmaps." },
      { q: "What is conviction grading in options flow?", a: "Conviction grading uses automated filters to score each options signal by institutional characteristics — premium size, aggressive fill conditions, volume-to-open-interest ratio, and market maker identification. Grade A signals represent the highest conviction institutional flow." },
    ],
    "cheddarflow-vs-profit-builders": [
      { q: "Is CheddarFlow or Profit Builders better for options flow?", a: "CheddarFlow has a clean UI and fast data. Profit Builders adds conviction grading (Grade A/B system), accumulation detection, GEX heatmaps, and a public track record of signal outcomes — features CheddarFlow does not offer." },
      { q: "Does CheddarFlow have conviction grading?", a: "No. CheddarFlow sorts flow by premium, time, or type but does not grade signals by conviction. Profit Builders scores every signal through 9 automated filters before it reaches your screen." },
    ],
    "flowalgo-vs-profit-builders": [
      { q: "Is FlowAlgo or Profit Builders better?", a: "FlowAlgo delivers fast data and clean dark pool tracking. Profit Builders adds conviction grading, accumulation detection, GEX heatmaps, and a public track record. FlowAlgo does not grade signals or publish outcomes." },
      { q: "Does FlowAlgo have a free trial?", a: "FlowAlgo offers limited free access. Profit Builders offers a full 7-day free trial with all features including real-time flow, conviction grading, and GEX heatmaps." },
    ],
    "blackboxstocks-vs-profit-builders": [
      { q: "Is BlackBoxStocks or Profit Builders better for options flow?", a: "BlackBoxStocks combines a flow scanner with a community chat room. Profit Builders focuses on signal quality — conviction grading, accumulation detection, and GEX heatmaps with a public track record of outcomes." },
      { q: "Does BlackBoxStocks have GEX heatmaps?", a: "No. BlackBoxStocks does not offer gamma exposure heatmaps. Profit Builders includes GEX heatmaps by strike and expiry, showing where dealer hedging creates price walls." },
    ],
    "unusual-whales-vs-profit-builders": [
      { q: "Is Unusual Whales or Profit Builders better?", a: "Unusual Whales offers broad coverage at a lower price point. Profit Builders focuses on signal depth — every trade is graded by conviction, accumulation is detected automatically, and outcomes are published publicly at /results." },
      { q: "Does Unusual Whales grade options flow signals?", a: "Unusual Whales does not use a conviction grading system. Profit Builders scores every signal through a institutional-flow filter pipeline including premium thresholds, aggressive fill detection, and market maker identification." },
    ],
    "barchart-vs-profit-builders": [
      { q: "Is Barchart or Profit Builders better for options flow?", a: "Barchart is a broad multi-asset trading platform with options flow as one feature among many — charts, futures, crypto, news. Profit Builders is a focused options flow scanner with conviction grading (Grade A/B), accumulation detection, GEX heatmaps, and a public track record of documented methodology at /results. For traders whose primary edge is reading institutional flow, Profit Builders is more specialized; for traders who need a full platform across asset classes, Barchart has broader coverage." },
      { q: "How much does Barchart cost compared to Profit Builders?", a: "Barchart offers tiered pricing: Premier at $39.95/mo, Plus at $69.95/mo, and Pro at $199.95/mo. Pro is the tier you need for serious options flow analysis. Profit Builders is $99/mo with a 7-day free trial, and every feature is included (real-time flow, conviction grading, accumulation detection, GEX heatmap)." },
      { q: "Does Barchart publish details on how it processes options flow?", a: "Barchart shows you options flow data but does not publish a methodology page describing its processing pipeline. Profit Builders publishes its full data methodology at profitbuilders.io/results — sweep detection per CBOE Rule 6.11, OPRA condition codes, Black-Scholes-Merton Greeks, NBBO aggression classification." },
      { q: "Does Barchart have conviction grading for options flow?", a: "No. Barchart displays unusual options activity and lets you filter by premium, volume, and sentiment, but does not automatically grade signals by conviction. Profit Builders runs every print through a institutional-flow filter pipeline before it reaches your screen, surfacing only Grade A and Grade B institutional-quality flow." },
    ],
    "what-is-options-flow-trading": [
      { q: "What is options flow trading?", a: "Options flow trading is the practice of tracking large, institutional options orders in real time to identify directional bets made by hedge funds, banks, and professional traders. Flow scanners surface sweeps, blocks, and unusual activity as they hit the tape so retail traders can follow informed money." },
      { q: "Is options flow trading profitable?", a: "Options flow is a signal layer, not a complete strategy. On its own, raw flow data has mixed results because most prints include market maker hedging and routine adjustments. The edge — if there is one — comes from filtering: separating directional sweeps and accumulation patterns from MM hedging, multi-leg conditions, and end-of-cycle rolling activity." },
      { q: "What's the difference between a sweep and a block?", a: "A sweep is an order that hits multiple exchanges simultaneously, signaling urgency. A block is a single large fill, often negotiated off-exchange, signaling planned institutional positioning. Both carry signal, but a sweep says 'I need this now' and a block says 'I've been planning this.'" },
    ],
    "what-is-options-accumulation": [
      { q: "What is options accumulation?", a: "Options accumulation is when an institutional trader builds a position by breaking a large order into multiple smaller prints on the same ticker, strike, and expiry over a short window. The pattern signals deliberate position-building rather than a one-off speculative bet." },
      { q: "How do you spot options accumulation?", a: "Look for repeated prints on the exact same contract — same ticker, strike, and expiry — within a tight time window, often with aggressive fills at or above the ask. Profit Builders flags these sequences automatically with RAPID badges so you don't have to cross-reference rows manually." },
      { q: "Why does options accumulation matter?", a: "Single prints can be noise. Accumulation is a pattern — and patterns are harder to fake. When an institution is willing to spend $5M+ across a sequence of prints on the same contract, they have conviction. That's one of the strongest signals in options flow." },
    ],
    "what-is-gamma-exposure-gex": [
      { q: "What is gamma exposure (GEX)?", a: "Gamma exposure measures how much dealers need to buy or sell the underlying stock to stay hedged as price moves. Positive GEX means dealers buy dips and sell rallies (stabilizing). Negative GEX means dealers sell dips and chase rallies (destabilizing). GEX predicts the character of movement, not direction." },
      { q: "What are gamma walls?", a: "Gamma walls are price levels where dealer hedging creates strong buying or selling pressure. Call walls above spot act as resistance because dealers sell into rallies. Put walls below spot act as support because dealers buy into dips. These levels often pin price near expiration." },
      { q: "How do traders use GEX to trade?", a: "Traders use GEX to identify where price is likely to stall (gamma walls), where volatility will spike (zero gamma levels), and where squeezes can accelerate (negative GEX environments). Profit Builders' GEX heatmap visualizes all of this across 220 symbols with real-time options chain data." },
    ],
    "vol-oi-ratio-explained": [
      { q: "What is the volume-to-open-interest ratio?", a: "Vol/OI ratio divides today's trading volume by the open interest going into the day on a given strike and expiry. It measures how much new positioning is happening relative to existing contracts. A Vol/OI of 20x means 20 times more contracts traded today than existed yesterday — a strong sign of fresh money entering." },
      { q: "What is a good Vol/OI ratio?", a: "For flow-following, Vol/OI above 5x is meaningful and above 10x is strong. A ratio of 20x or higher typically indicates institutional-scale new positioning. Anything under 2x usually means routine rolls or adjustments rather than directional conviction." },
      { q: "Why does Vol/OI matter for options flow?", a: "Vol/OI separates opening activity (new directional bets) from closing activity (position unwinds or rolls). A $1M call buy looks bullish, but if Vol/OI is under 1x, it's probably someone closing a prior position rather than building a new one. High Vol/OI confirms fresh money with conviction." },
    ],
    "spotgamma-vs-profit-builders": [
      { q: "Is SpotGamma or Profit Builders better for options traders?", a: "They solve different problems. SpotGamma grades dealer positioning and gamma exposure across indices (SPX, SPY, QQQ). Profit Builders grades individual whale prints across 220+ single-name tickers with a institutional-flow filter pipeline. SpotGamma is best for macro gamma regime traders. Profit Builders is best for directional single-stock flow traders." },
      { q: "How much does SpotGamma cost vs Profit Builders?", a: "SpotGamma Essential is ~$99/mo and SpotGamma Alpha (the meaningful tier) is $299/mo. Profit Builders is $99/mo for Flow Scanner or $129/mo for the Pro Bundle that includes a GEX heatmap. The Pro Bundle is $170/mo cheaper than SpotGamma Alpha and includes both flow and gamma exposure." },
      { q: "Does Profit Builders have a GEX heatmap like SpotGamma?", a: "Yes. Profit Builders includes a gamma exposure heatmap across 220+ symbols in the Pro Bundle at $129/mo — call walls, put walls, zero-gamma levels, and squeeze zones. It's not as deep as SpotGamma's Alpha-tier institutional data, but sufficient for most retail workflows." },
    ],
    "optionstrat-vs-profit-builders": [
      { q: "Is OptionStrat or Profit Builders better?", a: "OptionStrat is a strategy builder — its flagship is a payoff diagram tool for multi-leg positions like iron condors and credit spreads. Profit Builders is a flow scanner with conviction grading on institutional whale prints. OptionStrat is better for thesis-first traders building multi-leg structures. Profit Builders is better for tape-first traders following institutional directional flow." },
      { q: "Does OptionStrat have real-time options flow?", a: "Only on the Live Flow tier at $49.99/mo. Free and Live Tools ($14.99/mo) deliver 15-minute delayed data showing roughly 10% of actual market flow. Even on Live Flow, OptionStrat does not grade signals by conviction — you filter the firehose yourself. Profit Builders pre-grades every print through a 9-filter engine before it reaches your screen." },
      { q: "Is OptionStrat cheaper than Profit Builders?", a: "Yes. OptionStrat Live Flow is $49.99/mo vs Profit Builders Flow Scanner at $99/mo — a $50/mo gap. But they're different products. OptionStrat is primarily a strategy builder with flow as a secondary feature. Profit Builders is a purpose-built flow scanner with conviction grading, accumulation detection, and a public track record. Whether the $50 gap is worth it depends on whether your edge is in strategy construction or reading the tape." },
    ],
    "market-chameleon-vs-profit-builders": [
      { q: "Is Market Chameleon or Profit Builders better?", a: "They serve different workflows. Market Chameleon is a research platform — historical earnings data, volatility studies, backtests, 100+ screeners. Profit Builders is a live flow scanner with real-time institutional whale prints and conviction grading. Market Chameleon is best for earnings strategies and systematic screening. Profit Builders is best for live directional flow execution." },
      { q: "Is Market Chameleon data real-time?", a: "No. Market Chameleon delivers 15-minute delayed data on every tier, including Total Access at $99/mo. For research workflows where you analyze historical earnings reactions or screen for covered-call candidates, delayed data is fine. For reading institutional flow as it happens, 15-minute delay breaks the workflow." },
      { q: "Does Market Chameleon have conviction grading like Profit Builders?", a: "No. Market Chameleon shows unusual options activity but does not grade signals by conviction, filter market maker hedges, or publish per-signal outcomes. Profit Builders runs every print through a institutional-flow filter pipeline and publishes its full data methodology at /results — sweep detection, OPRA condition codes, NBBO aggression classification." },
    ],
  }

  const faqItems = FAQ_DATA[slug] ?? []
  const faqSchema = faqItems.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": { "@type": "Answer", "text": f.a },
    })),
  } : null

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://profitbuilders.io" },
      { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://profitbuilders.io/blog" },
      { "@type": "ListItem", "position": 3, "name": post.title, "item": url },
    ],
  }

  // ── HowTo schema for "how-to-*" posts (rich step display in Google) ──
  const HOWTO_DATA: Record<string, { name: string; description: string; totalTime: string; steps: { name: string; text: string }[] }> = {
    "how-to-read-options-flow": {
      name: "How to Read Institutional Options Flow",
      description: "Step-by-step method for reading institutional options flow signals — direction, premium size, Vol/OI, DTE, flow type, and market maker filtering.",
      totalTime: "PT15M",
      steps: [
        { name: "Check the direction", text: "Identify whether the order was a BUY or SELL on calls or puts. Aggressive buying at the ask on calls is the most bullish single-print signal." },
        { name: "Confirm the size", text: "A $50K print could be anyone; a $2M+ print is almost certainly institutional. Set your premium floor at $175K+ to eliminate retail noise." },
        { name: "Measure Volume-to-Open-Interest", text: "Vol/OI above 10x means fresh money is entering the contract. Under 2x suggests routine rolls or adjustments." },
        { name: "Evaluate DTE", text: "Short DTE (0-7 days) signals urgency; medium DTE (14-45 days) is the sweet spot; long DTE (60+) signals strategic positioning." },
        { name: "Check the flow type", text: "Sweeps signal urgency across multiple exchanges. Blocks are single deliberate fills. Both carry signal but in different ways." },
        { name: "Filter out market maker hedging", text: "When a market maker sells a call, they hedge by buying the underlying. Good scanners filter this at the database level before it reaches your screen." },
        { name: "Watch for accumulation", text: "Multiple prints on the same contract across a session is accumulation — one of the strongest signals in options flow." },
      ],
    },
    "how-to-read-sweep-and-block-trades": {
      name: "How to Read Sweep and Block Trades in Options Flow",
      description: "Identify urgency and institutional intent by reading sweep versus block trade execution.",
      totalTime: "PT10M",
      steps: [
        { name: "Identify the execution type", text: "A sweep hits multiple exchanges simultaneously; a block is a single large negotiated fill, often off-exchange." },
        { name: "Read the aggression", text: "Sweeps signal urgency — the buyer needs in NOW. Blocks signal deliberate, planned positioning." },
        { name: "Check the fill price", text: "Filled at or above the ask means aggressive buying. Filled at the bid means aggressive selling." },
        { name: "Confirm with size", text: "$1M+ blocks and $500K+ sweeps both cross the institutional-conviction threshold." },
        { name: "Rule out hedging", text: "Spread legs and market maker hedges can look directional but aren't. Use a scanner that filters spreads and MM activity automatically." },
      ],
    },
    "how-to-read-unusual-options-activity": {
      name: "How to Read Unusual Options Activity",
      description: "Systematic method for identifying and evaluating unusual options activity for trading signal quality.",
      totalTime: "PT15M",
      steps: [
        { name: "Define the volume threshold", text: "Unusual means volume significantly above the contract's average. Use Vol/OI ratio rather than raw volume." },
        { name: "Look for aggressive execution", text: "At-ask or above-ask fills carry more signal than passive bids. Sweeps outrank blocks for urgency." },
        { name: "Check expiration proximity", text: "1-6 week expirations carry more directional conviction than LEAPs (often hedges) or 0DTE (often scalps)." },
        { name: "Correlate with context", text: "Flow ahead of known catalysts — earnings, FDA decisions, macro events — is more actionable." },
        { name: "Use a conviction grading system", text: "A rule-based engine that scores signals against multiple filters — aggression, premium, Vol/OI, MM activity — dramatically reduces noise." },
      ],
    },
  }

  const howtoData = HOWTO_DATA[slug]
  const howtoSchema = howtoData ? {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": howtoData.name,
    "description": howtoData.description,
    "totalTime": howtoData.totalTime,
    "step": howtoData.steps.map((s, i) => ({
      "@type": "HowToStep",
      "position": i + 1,
      "name": s.name,
      "text": s.text,
      "url": `${url}#step-${i + 1}`,
    })),
  } : null

  const allPosts = getAllPosts()
  const related = allPosts.filter(p => p.slug !== slug).slice(0, 3)

  const fmtDate = (iso: string) => {
    const [yy, mm, dd] = iso.split("-").map(Number)
    return new Date(Date.UTC(yy, mm - 1, dd)).toLocaleDateString("en-US", {
      month: "long", day: "numeric", year: "numeric", timeZone: "UTC",
    })
  }
  const dateFormatted = fmtDate(post.date)
  const updatedFormatted = hasBeenUpdated ? fmtDate(modified) : null

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      {howtoSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howtoSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "url": url,
            "speakable": {
              "@type": "SpeakableSpecification",
              "cssSelector": ["h1", ".blog-subtitle", ".pb-prose h2", ".pb-prose h2 + p"],
            },
          }),
        }}
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

        {/* Visible breadcrumbs (schema already emitted above) */}
        <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-[11px] text-gray-400 font-mono uppercase tracking-[0.12em]">
          <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
          <span className="text-gray-300">/</span>
          <Link href="/blog" className="hover:text-gray-900 transition-colors">Blog</Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-600 truncate">{post.title}</span>
        </nav>

        {/* ── HERO ── */}
        <header className="mb-10">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-gray-400 mb-4">
            <time dateTime={post.date}>Published {dateFormatted}</time>
            {updatedFormatted && (
              <>
                <span>·</span>
                <time dateTime={modified} className="text-gray-700 font-semibold">
                  Updated {updatedFormatted}
                </time>
              </>
            )}
            <span>·</span>
            <span>{post.read_time} min read</span>
          </div>

          <h1 className="text-[34px] md:text-[44px] font-bold text-gray-950 leading-[1.1] tracking-[-0.035em] mb-5 blog-h1">
            {post.title}
          </h1>

          <p className="text-[18px] text-gray-500 leading-relaxed mb-6 font-normal blog-subtitle">
            {post.description}
          </p>

          {/* Author + share */}
          <div className="flex items-center justify-between py-4 border-t border-b border-gray-100">
            {author.url ? (
              <Link href={author.url} className="flex items-center gap-3 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={author.image ?? "/images/pb-monogram.png"}
                  alt={author.name}
                  width={32}
                  height={32}
                  style={{ filter: author.image && !author.image.includes("monogram") ? "none" : "invert(1)", borderRadius: 6 }}
                />
                <div>
                  <div className="text-[13px] font-semibold text-gray-900 group-hover:text-[#F97316] transition-colors">{author.name}</div>
                  <div className="text-[11px] text-gray-400">{author.role}</div>
                </div>
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={author.image ?? "/images/pb-monogram.png"}
                  alt={author.name}
                  width={32}
                  height={32}
                  style={{ filter: author.image && !author.image.includes("monogram") ? "none" : "invert(1)", borderRadius: 6 }}
                />
                <div>
                  <div className="text-[13px] font-semibold text-gray-900">{author.name}</div>
                  <div className="text-[11px] text-gray-400">{author.role}</div>
                </div>
              </div>
            )}
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

          {/* Table of contents for long-form posts (3+ H2 sections) */}
          {showToc && (
            <div className="mt-8 p-5 border border-gray-200 rounded-lg bg-gray-50">
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500 mb-3">In this article</div>
              <ol className="space-y-2 text-[14px] text-gray-700">
                {tocItems.map((item, i) => (
                  <li key={item.slug} className="flex gap-3">
                    <span className="text-gray-400 font-mono text-[12px] tabular-nums pt-[1px]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <a href={`#${item.slug}`} className="hover:text-[#F97316] transition-colors">
                      {item.text}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </header>

        {/* ── BODY ── */}
        <div
          className="pb-prose"
          dangerouslySetInnerHTML={{ __html: post.content_html }}
        />

        {/* ── AUTHOR BIO CARD ── */}
        {author.bio && (
          <aside className="mt-14 p-6 rounded-xl border border-gray-200 bg-gray-50 flex items-start gap-4" aria-label="About the author">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={author.image ?? "/images/pb-monogram.png"}
              alt={author.name}
              width={56}
              height={56}
              style={{ filter: author.image && !author.image.includes("monogram") ? "none" : "invert(1)", borderRadius: 10 }}
              className="flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500 mb-1">About the author</div>
              <div className="text-[16px] font-bold text-gray-950 mb-1">{author.name}</div>
              <div className="text-[12px] text-gray-500 mb-3">{author.role}</div>
              <p className="text-[14px] text-gray-700 leading-relaxed mb-3">{author.bio}</p>
              <div className="flex items-center gap-4 text-[12px]">
                {author.url && (
                  <Link href={author.url} className="text-[#F97316] hover:underline font-semibold">
                    More from {author.name.split(" ")[0]} →
                  </Link>
                )}
                {author.sameAs?.map(s => {
                  let label = "Link"
                  if (/x\.com|twitter\.com/.test(s)) label = "X"
                  else if (/linkedin\.com/.test(s)) label = "LinkedIn"
                  else if (/github\.com/.test(s)) label = "GitHub"
                  return (
                    <a key={s} href={s} target="_blank" rel="noopener noreferrer"
                      className="text-gray-500 hover:text-gray-900 transition-colors">
                      {label} ↗
                    </a>
                  )
                })}
              </div>
            </div>
          </aside>
        )}

        {/* ── EMAIL CTA ── */}
        <div className="my-12">
          <EmailSignup source="blog-course" variant="inline" />
          <EmailSignup source="flow-brief" variant="flow-brief-compact" />
        </div>

        {/* ── TRIAL CTA ── */}
        <div className="mt-14 py-10 px-8 rounded-xl bg-gray-950 text-center">
          <div className="text-[10px] text-gray-500 uppercase tracking-[3px] font-semibold mb-3">Live Scanner</div>
          <p className="text-white font-bold text-[20px] mb-2 tracking-tight">
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
                  <div className="text-[15px] font-semibold text-gray-900 group-hover:text-[#F97316] transition-colors leading-snug tracking-tight">
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
        /* Unified professional typography — Inter throughout */
        .pb-prose,
        .pb-prose h1,
        .pb-prose h2,
        .pb-prose h3,
        .pb-prose h4,
        .pb-prose p,
        .pb-prose li,
        .pb-prose blockquote,
        .pb-prose table,
        .pb-prose thead,
        .pb-prose tbody,
        .pb-prose th,
        .pb-prose td,
        .blog-h1,
        .blog-subtitle,
        .blog-byline {
          font-family: var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
        }

        .pb-prose {
          color: #1a1a1a;
          font-size: 17px;
          line-height: 1.75;
          letter-spacing: -0.006em;
          font-weight: 400;
        }
        .pb-prose h2 {
          color: #0a0a0a;
          font-weight: 700;
          font-size: 26px;
          margin-top: 2.4em;
          margin-bottom: 0.6em;
          letter-spacing: -0.025em;
          line-height: 1.25;
        }
        .pb-prose h3 {
          color: #0a0a0a;
          font-weight: 600;
          font-size: 19px;
          margin-top: 2em;
          margin-bottom: 0.5em;
          letter-spacing: -0.015em;
          line-height: 1.35;
        }
        .pb-prose p {
          margin-bottom: 1.3em;
        }
        .pb-prose strong {
          color: #0a0a0a;
          font-weight: 600;
        }
        .pb-prose a {
          color: #F97316;
          text-decoration: underline;
          text-decoration-color: rgba(249,115,22,0.3);
          text-underline-offset: 3px;
          transition: text-decoration-color 0.15s;
          font-weight: 500;
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
          padding: 14px 22px;
          margin: 1.8em 0;
          background: #FFF7ED;
          border-radius: 0 6px 6px 0;
          color: #1a1a1a;
          font-style: normal;
          font-size: 17px;
          font-weight: 500;
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

        /* Tables — editorial comparison */
        .pb-prose table {
          width: 100%;
          margin: 2em 0;
          border-collapse: collapse;
          font-size: 15px;
          line-height: 1.5;
          border: 1px solid #E5E7EB;
          border-radius: 10px;
          overflow: hidden;
          table-layout: fixed;
        }
        .pb-prose thead {
          background: #FAFAFA;
        }
        .pb-prose thead th {
          padding: 14px 18px;
          text-align: left;
          font-weight: 700;
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #6B7280;
          border-bottom: 1px solid #E5E7EB;
          vertical-align: middle;
        }
        .pb-prose thead th:first-child {
          width: 34%;
        }
        .pb-prose tbody td {
          padding: 14px 18px;
          border-top: 1px solid #F3F4F6;
          vertical-align: middle;
          color: #1a1a1a;
        }
        .pb-prose tbody tr:first-child td {
          border-top: none;
        }
        .pb-prose tbody td:first-child {
          font-weight: 600;
          color: #0a0a0a;
          background: #FAFAFA;
          border-right: 1px solid #F3F4F6;
        }
        .pb-prose tbody td strong {
          color: #0a0a0a;
        }
        /* Highlight the last column (Profit Builders side of comparison) */
        .pb-prose tbody td:last-child strong {
          color: #F97316;
        }
        .pb-prose table a {
          color: #F97316;
        }
        @media (max-width: 640px) {
          .pb-prose table {
            font-size: 13px;
          }
          .pb-prose thead th,
          .pb-prose tbody td {
            padding: 10px 12px;
          }
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
