#!/usr/bin/env node
// Cloudflare cache purge — runs after every `npm run build`.
// Non-blocking: logs warnings but never fails the build.
//
// Required env (set in /opt/pb-marketing/.env.local):
//   CLOUDFLARE_API_TOKEN   - Token scoped to "Zone:Cache Purge:Purge"
//   CLOUDFLARE_ZONE_ID     - Zone ID for profitbuilders.io
//
// Optional env:
//   CLOUDFLARE_PURGE_URLS  - Comma-separated URLs for selective purge.
//                            If unset, purges the entire zone.

import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

// Minimal .env loader (avoids adding a dep). Reads KEY=VALUE lines,
// ignores comments and blank lines, doesn't override existing process.env.
function loadEnv(file) {
  if (!existsSync(file)) return
  const text = readFileSync(file, 'utf8')
  for (const line of text.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    // Strip optional surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    if (!(key in process.env)) process.env[key] = value
  }
}

const cwd = process.cwd()
loadEnv(join(cwd, '.env.local'))
loadEnv(join(cwd, '.env'))

const TOKEN = process.env.CLOUDFLARE_API_TOKEN
const ZONE_ID = process.env.CLOUDFLARE_ZONE_ID
const SELECTIVE_URLS = (process.env.CLOUDFLARE_PURGE_URLS || '').trim()

const log = (msg, level = 'info') => {
  const tag = level === 'warn' ? '[cf-purge:WARN]' : level === 'error' ? '[cf-purge:ERR ]' : '[cf-purge]'
  console.log(`${tag} ${msg}`)
}

if (!TOKEN || !ZONE_ID) {
  log('Skipping — CLOUDFLARE_API_TOKEN or CLOUDFLARE_ZONE_ID not set.', 'warn')
  process.exit(0)
}

const apiUrl = `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/purge_cache`
const body = SELECTIVE_URLS
  ? { files: SELECTIVE_URLS.split(',').map(s => s.trim()).filter(Boolean) }
  : { purge_everything: true }

const target = SELECTIVE_URLS
  ? `${SELECTIVE_URLS.split(',').length} URL(s)`
  : 'entire zone'

const start = Date.now()

try {
  const resp = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const data = await resp.json()
  const ms = Date.now() - start

  if (data.success) {
    log(`OK · ${target} · ${ms}ms · zone ${ZONE_ID.slice(0, 8)}…`)
  } else {
    const errs = (data.errors || []).map(e => `${e.code}:${e.message}`).join(', ') || JSON.stringify(data)
    log(`Failed · ${ms}ms · ${errs}`, 'warn')
    // Common errors:
    //   6003  Authentication error    → bad token
    //   1003  Invalid zone identifier  → bad ZONE_ID
    //   10000 too many requests        → rate-limited (free: 5/min)
  }
} catch (e) {
  log(`Network error · ${e.message}`, 'error')
}

// Always exit 0 — never break a build because of a cache-purge hiccup.
process.exit(0)
