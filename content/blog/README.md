# Blog Content — Source of Truth

This directory is the **canonical authorship location** for all blog posts on profitbuilders.org.

## Where things live

- **Authorship** (write here): `/opt/pb-marketing/content/blog/<slug>.md`
- **Static-rendered output** (auto-generated): `/opt/pb-marketing/out/blog/<slug>/index.html` (built by Next.js `generateStaticParams` in `src/app/blog/[slug]/page.tsx`)
- **Legacy** (deprecated, do not write here): `/opt/trading-system/web/blog.legacy.<date>` — moved out of rotation in v7.9.11

The Flask sitemap (`/sitemap.xml`) and the JSON APIs (`/api/blog/posts`, `/api/blog/posts/<slug>`) read from this directory via `BLOG_DIR` in `web/shared.py`.

## Adding a post

1. Create `<slug>.md` here with frontmatter:

```
---
title: "Your Title"
description: "150-character SEO description that becomes meta + OG description."
date: "YYYY-MM-DD"
author: "Profit Builders"
read_time: "8"
---

Body in markdown. Use ## for h2, ### for h3. **bold** and _italic_ supported.
```

2. Build and restart:

```
cd /opt/pb-marketing && npm run build && supervisorctl restart profitbuilders-web
```

3. Verify the post is statically rendered:

```
curl -sI https://profitbuilders.org/blog/<slug>          # → HTTP 200
curl -s  https://profitbuilders.org/blog/<slug> | grep '"@type":"Article"'   # → JSON-LD present
```

## What the build produces

For each `.md` file in this directory, Next.js generates:
- `out/blog/<slug>/index.html` with the full article HTML
- Article JSON-LD baked into `<head>`
- `og:title`, `og:description`, `og:image=/images/og.png`, `twitter:card` meta
- Canonical URL link

The Flask `/blog/<slug>` route serves the matching `index.html`.

## Editing an existing post

Edit the `.md` file in place, then `npm run build` + restart web. The slug stays the same; URL doesn't change. Past links remain valid.

## Deleting a post

Delete the `.md` file, rebuild, restart. The static directory under `out/blog/` will not be regenerated; remove it manually if you want a clean cut: `rm -rf /opt/pb-marketing/out/blog/<slug>`.

The sitemap auto-refreshes on every request from `BLOG_DIR`, so removed posts drop from the sitemap immediately on the next Flask restart.
