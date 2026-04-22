#!/usr/bin/env node
/**
 * Post-build SEO fixes for pb-marketing static export.
 *
 * Context: Next.js is configured `trailingSlash: true` (controls on-disk file
 * layout that Flask routes expect), but the Flask server at
 * /opt/trading-system/web/app.py has a before_request hook that 301s every
 * trailing-slash URL to the no-slash canonical. Result: the static HTML
 * advertises `og:url` / `canonical` with a trailing slash, but the server
 * actually serves no-slash — crawler confusion (Twitterbot drops card
 * previews, Google sees split signals).
 *
 * We keep `trailingSlash: true` and post-process the HTML to:
 *   1. Strip the trailing slash on og:url / canonical / twitter:url so
 *      advertised URL == served URL.
 *   2. Decode HTML entities in <title>, og:title, and twitter:title so
 *      Next.js's over-escaping (e.g. "&#x27;s" for apostrophe) doesn't
 *      bleed into social share cards and occasional SERP displays.
 *
 * Safe to re-run. Idempotent.
 */

import { readFile, writeFile, readdir, stat } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import path from "node:path"

const OUT_ROOT = path.resolve(fileURLToPath(import.meta.url), "../../out")

/* ── URL normalization ─────────────────────────────────────────
 * Strip the FINAL trailing slash on any profitbuilders.io URL, but only when
 * it's the end of the URL (immediately before a closing quote). Path-internal
 * slashes like `/options-flow/LLY/opengraph-image` are untouched because they
 * aren't followed by a quote.
 *
 * Exception: the bare root `https://profitbuilders.io/` MUST keep its slash
 * (HTTP root path). We match paths with at least one character after the /.
 */
const STRIP_TRAILING = /(https:\/\/profitbuilders\.io\/[^\s"'<>]+?)\/(?=["'\\])/g

/* ── HTML entity decode ────────────────────────────────────────
 * Next.js escapes certain characters in Metadata-emitted tags even inside
 * <title>, where they're legal as-is. Decode the common offenders only in
 * tag *contents* / content-attribute values, never in URLs or script bodies.
 */
const ENTITIES = [
  [/&amp;/g, "&"],
  [/&#x27;/g, "'"],
  [/&#39;/g, "'"],
  [/&apos;/g, "'"],
  [/&quot;/g, "\""],
  [/&#34;/g, "\""],
  [/&#x2F;/g, "/"],
  [/&#47;/g, "/"],
]

function decodeEntitiesInString(s) {
  let out = s
  for (const [re, rep] of ENTITIES) out = out.replace(re, rep)
  return out
}

/** Decode entities inside <title>...</title> and content="..." of og:title /
 *  twitter:title meta tags. Surgical — leaves everything else alone. */
function decodeTitleEntities(html) {
  let out = html
  // <title>...</title>
  out = out.replace(/<title([^>]*)>([\s\S]*?)<\/title>/gi, (_m, attrs, inner) => {
    return `<title${attrs}>${decodeEntitiesInString(inner)}</title>`
  })
  // og:title / twitter:title content attributes
  out = out.replace(
    /<meta\s+([^>]*?)(property|name)=(["'])(og:title|twitter:title)\3([^>]*?)content=(["'])([^"']*)\6([^>]*)\/?>/gi,
    (_m, a1, attr, q1, key, a2, q2, content, a3) => {
      const decoded = decodeEntitiesInString(content)
      return `<meta ${a1}${attr}=${q1}${key}${q1}${a2}content=${q2}${decoded}${q2}${a3}/>`
    }
  )
  return out
}

async function* walk(dir) {
  let ents
  try { ents = await readdir(dir, { withFileTypes: true }) } catch { return }
  for (const ent of ents) {
    const full = path.join(dir, ent.name)
    if (ent.isDirectory()) yield* walk(full)
    else if (ent.isFile() && ent.name === "index.html") yield full
  }
}

let files = 0
let urlFixes = 0
let entityFixes = 0

for await (const fp of walk(OUT_ROOT)) {
  const html = await readFile(fp, "utf8")

  let next = html
  let u = 0
  next = next.replace(STRIP_TRAILING, (_m, p1) => { u++; return p1 })

  const beforeEnt = next
  next = decodeTitleEntities(next)
  const e = beforeEnt === next ? 0 : 1

  if (next !== html) {
    await writeFile(fp, next)
    files++
    urlFixes += u
    entityFixes += e
  }
}

console.log(`[fix-og] ${files} files touched · ${urlFixes} URL rewrites · ${entityFixes} title-entity decodes`)
