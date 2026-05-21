// Watchlist v3 — spark-card stack (Overview + Flow) + per-field tier gate.
// Manual/gated: needs forged Flask session cookies.
//   PREMIUM_COOKIE=... HEATMAP_COOKIE=... npx playwright test watchlist-overview --project=chromium
// Skips cleanly when the cookies are unset (CI-safe).
import { test, expect, Browser } from '@playwright/test'

const BASE = 'https://profitbuilders.io'
const PREM = process.env.PREMIUM_COOKIE || ''
const HEAT = process.env.HEATMAP_COOKIE || ''

test.describe.configure({ mode: 'serial' })

// Seed only the ticker list on every navigation; NEVER touch
// pb_watchlist_view_mode so the app's own persistence survives reloads.
async function seededContext(browser: Browser, cookie: string) {
  const c = await browser.newContext()
  await c.addCookies([{ name: 'session', value: cookie, domain: 'profitbuilders.io', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }])
  await c.addInitScript((wl: string[]) => {
    localStorage.setItem('pb_watchlist', JSON.stringify(wl))
  }, ['NVDA', 'AAPL', 'SPY'])
  return c
}

test('premium: v3 spark-cards — logos, name, sort, toggle persist, drill-down', async ({ browser }) => {
  test.skip(!PREM, 'set PREMIUM_COOKIE')
  const c = await seededContext(browser, PREM)
  const p = await c.newPage()
  const errors: string[] = []
  p.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  let snapStatus = 0
  p.on('response', r => { if (r.url().includes('/api/watchlist/snapshot')) snapStatus = r.status() })

  await p.goto(BASE + '/scanner?view=watchlist', { waitUntil: 'domcontentloaded' })
  await expect(p.getByText('NVDA').first()).toBeVisible({ timeout: 15000 })
  await p.waitForTimeout(2500) // snapshot + logos

  // Native-color Polygon logos for equities (NVDA/AAPL); SPY → chip (no img).
  expect(await p.locator('img[src*="/api/watchlist/logo"]').count()).toBeGreaterThanOrEqual(2)
  // Company name line + Flow right-zone (NET/BIAS) or quiet-tape fallback.
  await expect(p.locator('text=/Nvidia|Apple/i').first()).toBeVisible()
  await expect(p.locator('text=/NET|No flow today/').first()).toBeVisible()
  // Sort control present (replaces column-header sort in the card layout).
  expect(await p.locator('select').count()).toBeGreaterThanOrEqual(1)

  // Toggle Overview → persists across reload.
  await p.getByRole('button', { name: 'Overview', exact: true }).click()
  await p.waitForTimeout(1200)
  expect(await p.evaluate(() => localStorage.getItem('pb_watchlist_view_mode'))).toBe('overview')
  await p.reload({ waitUntil: 'domcontentloaded' })
  await expect(p.getByText('NVDA').first()).toBeVisible({ timeout: 15000 })
  expect(await p.evaluate(() => localStorage.getItem('pb_watchlist_view_mode'))).toBe('overview')

  // Drill-down still opens on card click.
  await p.getByText('NVDA').first().click()
  await expect(p.locator('text=/top 5 trades on/i').first()).toBeVisible({ timeout: 6000 })

  expect(snapStatus).toBe(200)
  expect(errors, errors.join('\n')).toHaveLength(0)
  await c.close()
})

test('tier gate: heatmap flow_contracts_today=null, premium=number', async ({ browser }) => {
  test.skip(!HEAT || !PREM, 'set HEATMAP_COOKIE + PREMIUM_COOKIE')
  async function snapshotFor(cookie: string): Promise<Record<string, any>> {
    const c = await seededContext(browser, cookie)
    const p = await c.newPage()
    // Deterministic capture: arm waitForResponse BEFORE navigating so we never
    // race the snapshot fetch (a passive handler + fixed sleep was flaky).
    const respP = p.waitForResponse(r => r.url().includes('/api/watchlist/snapshot') && r.status() === 200, { timeout: 20000 })
    await p.goto(BASE + '/scanner?view=watchlist', { waitUntil: 'domcontentloaded' })
    const snap = await (await respP).json().catch(() => ({}))
    await c.close()
    return snap || {}
  }
  const prem = await snapshotFor(PREM)
  const heat = await snapshotFor(HEAT)
  // logo_url + name present in both (subscriber-only fields, no tier check).
  expect(typeof prem['NVDA']?.logo_url).toBe('string')
  expect(typeof prem['NVDA']?.name).toBe('string')
  // flow_contracts_today is tier-gated: number for premium, null for heatmap.
  expect(typeof prem['NVDA']?.flow_contracts_today === 'number' || prem['NVDA']?.flow_contracts_today === 0).toBeTruthy()
  expect(heat['NVDA']?.flow_contracts_today).toBeNull()
})
