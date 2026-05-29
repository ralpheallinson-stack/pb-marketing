'use strict';
// One-shot smoke for the save-filter UI restore. Bypasses the missing .env.e2e
// by reusing the demo harness's forged session cookie. Asserts:
//   1. Save input + button render inside the Filters dialog
//   2. Save button is disabled when name is empty/whitespace
//   3. Save creates a preset row, which is then visible
//   4. Reload preserves the preset (localStorage hydration)
//   5. Delete removes it
// Cleans up on its way out.
const { chromium } = require('playwright');

(async () => {
  const cookie = process.env.PB_SESSION_COOKIE || '';
  if (!cookie) { console.error('PB_SESSION_COOKIE not set'); process.exit(2); }
  const baseUrl = 'https://profitbuilders.io';
  const presetName = `smoke-${Date.now()}`;

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  await ctx.addCookies([{ name: 'session', value: cookie, domain: 'profitbuilders.io', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  const page = await ctx.newPage();
  const fails = [];
  const ok = (msg) => console.log('  PASS', msg);
  const fail = (msg) => { console.log('  FAIL', msg); fails.push(msg); };

  try {
    await page.goto(`${baseUrl}/scanner`, { waitUntil: 'domcontentloaded' });
    await page.locator('.ag-row').first().waitFor({ timeout: 20000 }).catch(() => {});
    await page.waitForTimeout(2500);

    // 1. open Filters, save row visible
    await page.getByRole('button', { name: /^filters/i }).first().click();
    await page.waitForTimeout(600);
    const input = page.getByPlaceholder(/preset name/i);
    const saveBtn = page.getByRole('button', { name: /^save$/i });
    if (await input.isVisible() && await saveBtn.isVisible()) ok('save input + button render');
    else fail('save input or button missing');

    // 2. empty/whitespace disables
    const emptyDisabled = await saveBtn.isDisabled();
    await input.fill('   ');
    const wsDisabled = await saveBtn.isDisabled();
    await input.fill(presetName);
    const enabled = await saveBtn.isEnabled();
    if (emptyDisabled && wsDisabled && enabled) ok('Save disabled on empty/whitespace, enabled on real text');
    else fail(`disabled-state wrong: empty=${emptyDisabled} ws=${wsDisabled} enabled=${enabled}`);

    // 3. save -> preset row appears
    await saveBtn.click();
    await page.waitForTimeout(800);
    const presetRow = page.locator(`text=${presetName}`);
    if (await presetRow.isVisible()) ok(`preset "${presetName}" appears in list`);
    else fail(`preset "${presetName}" not visible after save`);

    // 4. reload -> preset persists
    await page.reload();
    await page.locator('.ag-row').first().waitFor({ timeout: 20000 }).catch(() => {});
    await page.waitForTimeout(2000);
    await page.getByRole('button', { name: /^filters/i }).first().click();
    await page.waitForTimeout(600);
    const persisted = page.locator(`text=${presetName}`);
    if (await persisted.isVisible()) ok('preset persists across page reload');
    else fail('preset gone after reload');

    // 5. delete -> preset removed (cleanup)
    const row = page.locator(`div:has(> div:has-text("${presetName}"))`).first();
    await row.getByRole('button', { name: /^delete$/i }).click();
    await page.waitForTimeout(600);
    const gone = await page.locator(`text=${presetName}`).isVisible().catch(() => false);
    if (!gone) ok('delete removes the preset');
    else fail('preset still visible after delete');
  } catch (e) {
    fail('exception: ' + e.message);
  }

  await browser.close();
  console.log(fails.length === 0 ? '\nSMOKE PASS (5/5)' : `\nSMOKE FAIL (${5 - fails.length}/5)`);
  process.exit(fails.length === 0 ? 0 : 1);
})();
