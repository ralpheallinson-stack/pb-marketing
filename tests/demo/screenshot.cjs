'use strict';
// Clean static screenshot of a tier-gated pb-marketing surface (no overlays).
// Reuses the forged session cookie from forge-session.py.
//   FILTER_TYPE="Sweeps" FILTER_PREM="$500K+" PB_SESSION_COOKIE=$(...) \
//     node tests/demo/screenshot.cjs /scanner scanner-sweeps
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUTPUT_DIR = path.join(__dirname, 'output');

(async () => {
  const baseUrl = process.env.PB_BASE_URL || 'https://profitbuilders.io';
  const cookie = process.env.PB_SESSION_COOKIE || '';
  const urlPath = process.argv[2] || '/scanner';
  const outName = process.argv[3] || 'scanner-shot';
  const viewport = { width: 1600, height: 900 }; // 16:9, X-friendly

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 2 });
  if (cookie) {
    await ctx.addCookies([{ name: 'session', value: cookie, domain: 'profitbuilders.io', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  }
  const page = await ctx.newPage();
  await page.goto(`${baseUrl}${urlPath}`, { waitUntil: 'domcontentloaded' });
  await page.locator('.ag-row').first().waitFor({ timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(4000);

  // Apply Flow Type + Min Premium in one Filters-dialog pass.
  if (process.env.FILTER_TYPE || process.env.FILTER_PREM) {
    await page.getByRole('button', { name: /filters/i }).first().click();
    await page.waitForTimeout(700);
    if (process.env.FILTER_TYPE) {
      await page.getByText('Flow Type', { exact: false }).first().click();
      await page.waitForTimeout(400);
      await page.getByText(process.env.FILTER_TYPE, { exact: true }).first().click();
      await page.waitForTimeout(500);
    }
    if (process.env.FILTER_PREM) {
      await page.getByText('Min Premium', { exact: false }).first().click();
      await page.waitForTimeout(400);
      await page.getByText(process.env.FILTER_PREM, { exact: true }).first().click();
      await page.waitForTimeout(500);
    }
    await page.keyboard.press('Escape');
    await page.waitForTimeout(3000); // server refetch + client regrid
    console.log('filters: type=%s prem=%s', process.env.FILTER_TYPE || '-', process.env.FILTER_PREM || '-');
  }

  // Filter to a single ticker via the toolbar search box.
  if (process.env.SEARCH) {
    const openBtn = page.locator('[aria-label="Open search"]').first();
    if (await openBtn.isVisible().catch(() => false)) { await openBtn.click(); await page.waitForTimeout(400); }
    const box = page.locator('input[placeholder="Search ticker..."]').first();
    await box.click(); await box.fill(process.env.SEARCH);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2500);
    console.log('searched', process.env.SEARCH);
  }

  // Dump top visible rows (ticker | premium | flow-type) to confirm the shot.
  const top = await page.evaluate(() => {
    const rows = [...document.querySelectorAll('.ag-center-cols-container .ag-row')]
      .sort((a, b) => (+a.getAttribute('row-index')) - (+b.getAttribute('row-index'))).slice(0, 6);
    return rows.map(r => {
      const cell = id => r.querySelector(`[col-id="${id}"]`)?.textContent?.trim() || '';
      return [cell('symbol') || cell('ticker'), cell('premium'), cell('flow_type') || cell('type')].join(' | ');
    });
  }).catch(() => ['(could not read rows)']);
  console.log('TOP ROWS:', JSON.stringify(top));

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const out = path.join(OUTPUT_DIR, `${outName}.png`);
  await page.screenshot({ path: out });
  console.log('screenshot:', out);
  await browser.close();
})();
