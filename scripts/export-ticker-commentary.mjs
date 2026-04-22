#!/usr/bin/env node
/**
 * Export ticker_spotlight commentary from pb-flow DB into a JSON file that
 * pb-marketing reads at build time. Produces fresh, per-ticker editorial
 * copy for each /options-flow/[TICKER] page — which is rocket fuel for SEO
 * (Google loves pages that update with real content).
 *
 * Reads DATABASE_URL from /opt/pb-flow/.env.local (same role pb-flow uses,
 * read-only on content_pieces).
 *
 * Writes to /opt/pb-marketing/data/ticker-commentary.json with shape:
 *   {
 *     generated_at: ISO,
 *     trade_date: "2026-04-22",
 *     tickers: {
 *       "NVDA": {
 *         stocktwits_post: "...",
 *         x_post: "...",
 *         trade_date: "2026-04-22",
 *         call_pct: 74.9,
 *         bullish_pct: 75.5,
 *         signals: 50,
 *         total_premium: 9560000
 *       },
 *       ...
 *     }
 *   }
 *
 * Only includes the MOST RECENT draft/posted ticker_spotlight per symbol
 * (dismissed pieces skipped). If a ticker has multiple pieces across days,
 * the newest is used.
 *
 * Run: node scripts/export-ticker-commentary.mjs
 */

import { readFile, writeFile, mkdir } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import path from "node:path"
import pg from "pg"

const MARKETING_ROOT = path.resolve(fileURLToPath(import.meta.url), "../../")
const OUT = path.join(MARKETING_ROOT, "data", "ticker-commentary.json")

async function loadDatabaseUrl() {
  // pb-flow owns the content_pieces table; read its .env.local for DATABASE_URL
  const envPath = "/opt/pb-flow/.env.local"
  const text = await readFile(envPath, "utf-8")
  for (const line of text.split("\n")) {
    const m = line.match(/^DATABASE_URL\s*=\s*(.+)$/)
    if (m) return m[1].trim().replace(/^["']|["']$/g, "")
  }
  throw new Error("DATABASE_URL not found in /opt/pb-flow/.env.local")
}

async function main() {
  const DATABASE_URL = await loadDatabaseUrl()
  const client = new pg.Client({ connectionString: DATABASE_URL })
  await client.connect()

  try {
    // Get the most recent ticker_spotlight per symbol, excluding dismissed.
    // Uses DISTINCT ON (symbol) ordered by created_at DESC.
    const { rows } = await client.query(`
      SELECT DISTINCT ON (trigger_data->>'symbol')
        trigger_data->>'symbol' AS symbol,
        generated_content->>'x_post' AS x_post,
        generated_content->>'stocktwits_post' AS stocktwits_post,
        trade_date::text AS trade_date,
        created_at::text AS created_at,
        (trigger_data->>'call_pct')::float8 AS call_pct,
        (trigger_data->>'bullish_pct')::float8 AS bullish_pct,
        (trigger_data->>'signals')::int AS signals,
        (trigger_data->>'totalPremium')::bigint AS total_premium
      FROM content_pieces
      WHERE content_type = 'ticker_spotlight'
        AND status != 'dismissed'
        AND trigger_data->>'symbol' IS NOT NULL
        AND generated_content->>'stocktwits_post' IS NOT NULL
      ORDER BY trigger_data->>'symbol', created_at DESC
    `)

    const tickers = {}
    let latestDate = null
    for (const r of rows) {
      tickers[r.symbol] = {
        stocktwits_post: r.stocktwits_post,
        x_post: r.x_post,
        trade_date: r.trade_date,
        call_pct: r.call_pct,
        bullish_pct: r.bullish_pct,
        signals: r.signals,
        total_premium: r.total_premium,
      }
      if (!latestDate || r.trade_date > latestDate) latestDate = r.trade_date
    }

    const payload = {
      generated_at: new Date().toISOString(),
      trade_date: latestDate,
      total_tickers: Object.keys(tickers).length,
      tickers,
    }

    await mkdir(path.dirname(OUT), { recursive: true })
    await writeFile(OUT, JSON.stringify(payload, null, 2))
    console.log(`[export-commentary] wrote ${Object.keys(tickers).length} tickers · latest ${latestDate} → ${OUT}`)
  } finally {
    await client.end()
  }
}

main().catch((err) => {
  console.error("[export-commentary] failed:", err.message)
  process.exit(1)
})
