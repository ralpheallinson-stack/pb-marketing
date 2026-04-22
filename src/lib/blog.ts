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
