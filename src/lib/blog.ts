import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"
import { marked, type Tokens } from "marked"

const BLOG_DIR = path.join(process.cwd(), "content", "blog")

/** Slugify heading text the same way tocFromMarkdown does, so TOC anchor hrefs
 *  (#slug) match the ids rendered into the body HTML. */
function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

// Register a custom heading renderer that attaches an id to H2/H3 so our
// table-of-contents anchors resolve. Safe to register multiple times —
// marked.use replaces prior extensions by field.
marked.use({
  renderer: {
    heading(this: unknown, token: Tokens.Heading) {
      const text = token.text
      const level = token.depth
      if (level === 2 || level === 3) {
        const id = slugifyHeading(text)
        const inner = (marked.parseInline(text, { async: false }) as string)
        return `<h${level} id="${id}">${inner}</h${level}>\n`
      }
      const inner = (marked.parseInline(text, { async: false }) as string)
      return `<h${level}>${inner}</h${level}>\n`
    },
  },
})

export interface PostMeta {
  slug: string
  title: string
  description: string
  date: string
  /** Optional `updated: "YYYY-MM-DD"` frontmatter. Falls back to `date` at
   *  the render layer. Surfacing a distinct modified date is worth real
   *  ranking points on YMYL (finance) content. */
  updated?: string
  author: string
  read_time: string
}

export interface FullPost extends PostMeta {
  content_html: string
  body: string
}

export type TocItem = { slug: string; text: string }

/** Extract H2 headings from markdown for a table of contents. Slugifies
 *  each to match the anchor ids marked emits by default. */
export function tocFromMarkdown(body: string): TocItem[] {
  const items: TocItem[] = []
  for (const line of body.split("\n")) {
    const m = line.match(/^##\s+(.+?)\s*$/)
    if (!m) continue
    const text = m[1].trim()
    const slug = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
    items.push({ slug, text })
  }
  return items
}

function readPostFile(slug: string): { meta: PostMeta; body: string } | null {
  const filepath = path.join(BLOG_DIR, `${slug}.md`)
  if (!fs.existsSync(filepath)) return null
  const raw = fs.readFileSync(filepath, "utf-8")
  const { data, content } = matter(raw)
  const updated = data.updated ? String(data.updated) : undefined
  return {
    meta: {
      slug,
      title: String(data.title ?? slug),
      description: String(data.description ?? ""),
      date: String(data.date ?? ""),
      ...(updated ? { updated } : {}),
      author: String(data.author ?? "Profit Builders"),
      read_time: String(data.read_time ?? "5"),
    },
    body: content,
  }
}

export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return []
  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith(".md") && /^[a-z0-9]/.test(f))
  const posts = files
    .map(f => readPostFile(f.replace(/\.md$/, "")))
    .filter((p): p is { meta: PostMeta; body: string } => p !== null)
    .map(p => p.meta)
  // Newest first
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function getPost(slug: string): FullPost | null {
  const r = readPostFile(slug)
  if (!r) return null
  // marked returns string when async:false (default for sync usage)
  const html = marked.parse(r.body, { async: false }) as string
  return { ...r.meta, content_html: html, body: r.body }
}

export function getAllSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return []
  return fs
    .readdirSync(BLOG_DIR)
    .filter(f => f.endsWith(".md") && /^[a-z0-9]/.test(f))
    .map(f => f.replace(/\.md$/, ""))
}

// Common-ticker allowlist for body extraction. Caps the false-positive rate
// of naive `/\b[A-Z]{2,5}\b/` matches (which would catch "OPRA", "CBOE",
// "ETF", etc.). Anything in this list mentioned in the post title/body
// gets surfaced as a ticker badge in the post header.
const COMMON_TICKERS = new Set([
  // ETFs
  "SPY","QQQ","IWM","DIA","XLF","XLE","XLI","XLK","XLP","XLV","XLY","XLU","XLB","XLC","XLRE","TLT","HYG","LQD","GLD","SLV","USO","UVXY","VXX","ARKK","ARKG","SQQQ","TQQQ","TLT",
  // Mega caps
  "AAPL","MSFT","NVDA","AMZN","GOOGL","GOOG","META","TSLA","BRK.B","BRKB","UNH","JNJ","XOM","V","PG","JPM","HD","MA","CVX","ABBV","BAC","KO","PEP","AVGO","COST","MRK","TMO","CSCO","WMT","DIS","ADBE","CRM","NFLX","ORCL","TXN","CMCSA","ABT","ACN","NKE","DHR","NEE","INTU","QCOM","UNP","HON","WFC","UPS","BMY","RTX","SBUX","LIN","T","INTC","AMD","BA","GS","PYPL","MU",
  // Active flow names
  "PLTR","COIN","GME","AMC","BB","RIVN","LCID","MSTR","SNDK","SMCI","SOXL","SOXS","NIO","XPEV","BABA","JD","PDD","SHOP","SQ","BLOCK","UBER","LYFT","SNAP","PINS","TWTR","X","RBLX","HOOD","SOFI","UPST","AFRM","DKNG","PENN","RIOT","MARA","BITO","BITX","ETHE","GBTC","CLSK","WULF","CRWV",
  // Indices
  "SPX","SPXW","NDX","NDXP","RUT","VIX",
])

export function extractTickers(post: { title: string; body: string }): string[] {
  // Pull all-caps tokens (2-5 chars) from title + first 800 chars of body.
  // Body is searched only at the start to avoid catching tickers cited
  // way down in disclaimers or unrelated examples. Order preserves first-
  // mention; cap at 6 to keep the badge row tight on mobile.
  const text = (post.title + " " + post.body.slice(0, 800)).toUpperCase()
  const matches = text.match(/\b[A-Z]{2,5}(?:\.[A-Z])?\b/g) || []
  const seen: string[] = []
  for (const m of matches) {
    if (COMMON_TICKERS.has(m) && !seen.includes(m)) {
      seen.push(m)
      if (seen.length >= 6) break
    }
  }
  return seen
}

