// Regression test for the heatmap tier gate (the 403-vs-session-expiry split,
// activePage flow-fetch gating, sidebar tab locks, and deep-link gating).
// Manual / gated: requires a forged heatmap Flask session cookie. Generate with
// the app's SECRET_KEY via flask.sessions.SecureCookieSessionInterface, then:
//   HEATMAP_COOKIE="<value>" npx playwright test heatmap-gate --project=chromium
// Skips cleanly (CI-safe) when HEATMAP_COOKIE is unset.
import { test, expect, BrowserContext, Page } from '@playwright/test'

const BASE = 'https://profitbuilders.io'
const COOKIE = process.env.HEATMAP_COOKIE || ''
const FLOW_RE = /\/api\/scanner\/(feed|live-flow|stream)/
const PANEL_RE = /Real-time options flow isn.t included/i

test.describe.configure({ mode: 'serial' })

test.describe('heatmap tier gate (forged session)', () => {
  let context: BrowserContext
  let page: Page
  let reqs: { url: string; method: string }[] = []
  let resps: { url: string; status: number }[] = []
  const clearLog = () => { reqs = []; resps = [] }
  const flowReqs = () => reqs.filter(r => FLOW_RE.test(r.url))
  const feedResp = (s: number) => resps.find(r => /\/api\/scanner\/feed/.test(r.url) && r.status === s)

  test.beforeEach(() => {
    test.skip(!COOKIE, 'Set HEATMAP_COOKIE (forged heatmap Flask session) to run this gate regression test')
  })

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext()
    if (COOKIE) {
      await context.addCookies([{
        name: 'session', value: COOKIE, domain: 'profitbuilders.io', path: '/',
        secure: true, httpOnly: true, sameSite: 'Lax',
      }])
    }
    page = await context.newPage()
    page.on('request', r => reqs.push({ url: r.url(), method: r.method() }))
    page.on('response', r => { try { resps.push({ url: r.url(), status: r.status() }) } catch {} })
  })
  test.afterAll(async () => { await context?.close() })

  test('1. /api/me => flow_access:false (foundation)', async () => {
    const r = await context.request.get(BASE + '/api/me')
    expect(r.status()).toBe(200)
    const d = await r.json()
    expect(d.tier).toBe('heatmap')
    expect(d.flow_access).toBe(false)
    expect(d.gamma_wall).toBe(true)
  })

  test('2. login lands on heatmap, no /login bounce', async () => {
    await page.goto(BASE + '/heatmap', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(1500)
    expect(page.url(), 'must not bounce to /login').not.toContain('/login')
    expect(page.url()).toContain('/scanner')
  })

  test('3. /api/scanner/feed => 403 tier_required (not 200/401)', async () => {
    const r = await context.request.get(BASE + '/api/scanner/feed?light=1')
    expect(r.status()).toBe(403)
    expect((await r.json()).error).toBe('tier_required')
  })

  test('4. NO background flow 403 storm on heatmap tab [FLAGGED]', async () => {
    clearLog()
    await page.goto(BASE + '/scanner?view=heatmap', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(6000)
    expect(page.url()).not.toContain('/login')
    expect(flowReqs(), `flow reqs while on heatmap tab: ${JSON.stringify(flowReqs(), null, 2)}`).toHaveLength(0)
  })

  test('5. Flow + Historical tabs visually locked; GEX not', async () => {
    const btn = page.locator('aside nav button')
    await expect(btn.nth(0), 'Flow locked').toHaveClass(/opacity-50/)
    await expect(btn.nth(1), 'GEX unlocked for heatmap').not.toHaveClass(/opacity-50/)
    await expect(btn.nth(3), 'Historical locked').toHaveClass(/opacity-50/)
  })

  test('6. clicking locked Flow opens upgrade modal, no nav', async () => {
    const before = page.url()
    await page.locator('aside nav button').nth(0).click()
    await expect(page.getByText('Upgrade to Pro')).toBeVisible({ timeout: 4000 })
    expect(page.url()).toBe(before)
    await page.keyboard.press('Escape').catch(() => {})
  })

  test('7. direct-nav /scanner => flowLocked panel, no redirect/spinner', async () => {
    clearLog()
    await page.goto(BASE + '/scanner', { waitUntil: 'domcontentloaded' })
    await expect(page.getByText(PANEL_RE)).toBeVisible({ timeout: 9000 })
    expect(page.url()).not.toContain('/login')
    expect(feedResp(403), 'page should consume a feed 403').toBeTruthy()
  })

  test('8. deep-link /scanner?symbol=NVDA respects lock [FLAGGED]', async () => {
    clearLog()
    await page.goto(BASE + '/scanner?symbol=NVDA', { waitUntil: 'domcontentloaded' })
    await expect(page.getByText(PANEL_RE)).toBeVisible({ timeout: 9000 })
    expect(feedResp(200), `LEAK: feed returned 200 -> ${JSON.stringify(feedResp(200))}`).toBeFalsy()
    expect(feedResp(403), 'expected feed 403 on deep link').toBeTruthy()
    expect(page.url()).not.toContain('/login')
  })
})
