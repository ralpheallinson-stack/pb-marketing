import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"
import { marked } from "marked"

const BLOG_DIR = path.join(process.cwd(), "content", "blog")

export interface PostMeta {
  slug: string
  title: string
  description: string
  date: string
  author: string
  read_time: string
}

export interface FullPost extends PostMeta {
  content_html: string
}

function readPostFile(slug: string): { meta: PostMeta; body: string } | null {
  const filepath = path.join(BLOG_DIR, `${slug}.md`)
  if (!fs.existsSync(filepath)) return null
  const raw = fs.readFileSync(filepath, "utf-8")
  const { data, content } = matter(raw)
  return {
    meta: {
      slug,
      title: String(data.title ?? slug),
      description: String(data.description ?? ""),
      date: String(data.date ?? ""),
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
  return { ...r.meta, content_html: html }
}

export function getAllSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return []
  return fs
    .readdirSync(BLOG_DIR)
    .filter(f => f.endsWith(".md") && /^[a-z0-9]/.test(f))
    .map(f => f.replace(/\.md$/, ""))
}
