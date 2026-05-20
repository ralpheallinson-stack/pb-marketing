// Phase 2B step 1 — watchlist Overview/Flow toggle + enrichment columns.
// Manual/gated: needs PREMIUM_COOKIE + HEATMAP_COOKIE (forged Flask sessions).
//   PREMIUM_COOKIE=... HEATMAP_COOKIE=... npx playwright test watchlist-overview --project=chromium
// Skips cleanly when the cookies are unset (CI-safe).
import { test, expect, Browser } from '@playwright/test'

const BASE = 'https://profitbuilders.io'
const PREM = process.env.PREMIUM_COOKIE || ''
const HEAT = process.env.HEATMAP_COOKIE || ''

test.describe.configure({ mode: 'serial' })

async function seededContext(browser: Browser, cookie: string, viewMode: string | null) {
  const c = await browser.newContext()
  await c.addCookies([{ name: 'session', value: cookie, domain: 'profitbuilders.io', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }])
  await c.addInitScript(([wl, vm]: [string[], string | null]) => {
    localStorage.setItem('pb_watchlist', JSON.stringify(wl))
    if (vm) localStorage.setItem('pb_watchlist_view_mode', vm)
    // when vm is null, leave pb_watchlist_view_mode untouched so the app's own
    // persistence survives reloads (this initScript runs on every navigation)
  }, [['NVDA', 'AAPL', 'SPY'], viewMode])
  return c
}

test('premium: toggle swaps Flow<->Overview columns + persists', async ({ browser }) => {
  test.skip(!PREM, 'set PREMIUM_COOKIE')
  const c = await seededContext(browser, PREM, null)        // default = flow
  const p = await c.newPage()
  await p.goto(BASE + '/scanner?view=watchlist', { waitUntil: 'domcontentloaded' })
  await expect(p.getByText('NVDA').first()).toBeVisible({ timeout: 12000 })

  // default Flow: Flow-only header present, Overview-only header absent
  await expect(p.getByText('Call $')).toBeVisible()
  await expect(p.getByText('IV Rank')).toHaveCount(0)

  // click Overview -> columns swap
  await p.getByRole('button', { name: 'Overview', exact: true }).click()
  await expect(p.getByText('IV Rank')).toBeVisible({ timeout: 8000 })
  await expect(p.getByText('Opt Vol')).toBeVisible()
  await expect(p.getByText('Mkt Cap')).toBeVisible()
  await expect(p.getByText('Call $')).toHaveCount(0)        // Flow column gone — no regression bleed

  // real enrichment data rendered (NVDA/AAPL have T/B market caps)
  await expect(p.locator('body')).toContainText(/\$\d+(\.\d+)?[TB]\b/, { timeout: 8000 })

  // persistence: reload stays in Overview
  await p.reload({ waitUntil: 'domcontentloaded' })
  await expect(p.getByText('IV Rank')).toBeVisible({ timeout: 12000 })
  await c.close()
})

test('tier gate: heatmap flow_contracts_today=null, premium=number', async ({ browser }) => {
  test.skip(!HEAT || !PREM, 'set HEATMAP_COOKIE + PREMIUM_COOKIE')
  async function snapshotFor(cookie: string): Promise<Record<string, any>> {
    const c = await seededContext(browser, cookie, 'overview')   // land directly in Overview
    const p = await c.newPage()
    let snap: Record<string, any> | null = null
    p.on('response', async r => {
      if (r.url().includes('/api/watchlist/snapshot')) { try { snap = await r.json() } catch {} }
    })
    await p.goto(BASE + '/scanner?view=watchlist', { waitUntil: 'domcontentloaded' })
    await expect(p.getByText('IV Rank')).toBeVisible({ timeout: 12000 })
    await p.waitForTimeout(1500)
    await c.close()
    expect(snap, 'snapshot response captured').toBeTruthy()
    return snap as Record<string, any>
  }
  const heat = await snapshotFor(HEAT)
  for (const s of Object.values(heat)) {
    expect(s.flow_contracts_today, 'heatmap flow gated to null').toBeNull()
    expect(s).toHaveProperty('market_cap')   // other fields still present
  }
  const prem = await snapshotFor(PREM)
  for (const s of Object.values(prem)) {
    expect(typeof s.flow_contracts_today, 'premium flow is a number').toBe('number')
  }
})
