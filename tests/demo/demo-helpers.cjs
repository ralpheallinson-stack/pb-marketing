'use strict';
// Reusable UI-demo harness for pb-marketing (Playwright + cursor/subtitle overlay).
// Records polished WebM, then converts to MP4 (H.264) as the default deliverable.
//
// A scenario file calls runDemo({ name, seedLocalStorage, story }). The `story`
// callback drives the page via the `h` helper object, which is REHEARSE-AWARE:
// run a scenario with `--rehearse` and h.click/h.type/h.over only verify the
// selector is visible (no clicks, fast) so you catch broken selectors before
// wasting a recording. See README.md.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');

const OUTPUT_DIR = path.join(__dirname, 'output');

async function injectOverlays(page) {
  await page.evaluate(() => {
    if (!document.getElementById('demo-cursor')) {
      const c = document.createElement('div');
      c.id = 'demo-cursor';
      c.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 3L19 12L12 13L9 20L5 3Z" fill="white" stroke="black" stroke-width="1.5" stroke-linejoin="round"/></svg>`;
      c.style.cssText = 'position:fixed;z-index:999999;pointer-events:none;width:24px;height:24px;transition:left .1s,top .1s;filter:drop-shadow(1px 1px 2px rgba(0,0,0,.4));left:0;top:0;';
      document.body.appendChild(c);
      document.addEventListener('mousemove', e => { c.style.left = e.clientX + 'px'; c.style.top = e.clientY + 'px'; });
    }
    if (!document.getElementById('demo-subtitle')) {
      const b = document.createElement('div');
      b.id = 'demo-subtitle';
      b.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:999998;text-align:center;padding:12px 24px;background:rgba(0,0,0,.78);color:#fff;font-family:-apple-system,"Segoe UI",sans-serif;font-size:16px;font-weight:500;letter-spacing:.3px;transition:opacity .3s;pointer-events:none;opacity:0;';
      document.body.appendChild(b);
    }
  });
}

async function showSubtitle(page, text) {
  await page.evaluate(t => {
    const b = document.getElementById('demo-subtitle'); if (!b) return;
    if (t) { b.textContent = t; b.style.opacity = '1'; } else { b.style.opacity = '0'; }
  }, text);
  if (text) await page.waitForTimeout(700);
}

function resolve(page, locator) {
  return typeof locator === 'string' ? page.locator(locator).first() : locator;
}

// Rehearse-aware helper set bound to a page. In rehearse mode, actions only
// verify visibility (and record failures into `fails`); pauses are clamped.
function makeHelpers(page, { rehearse }) {
  const fails = [];
  const check = async (locator, label) => {
    const ok = await resolve(page, locator).isVisible().catch(() => false);
    console.log(`${ok ? 'OK  ' : 'FAIL'} ${label}`);
    if (!ok) fails.push(label);
    return ok;
  };
  return {
    fails,
    page,
    overlays: () => injectOverlays(page),
    subtitle: async t => { if (!rehearse) await showSubtitle(page, t); },
    pause: async ms => { await page.waitForTimeout(rehearse ? Math.min(ms, 120) : ms); },
    check,
    goto: async url => { await page.goto(url, { waitUntil: 'domcontentloaded' }); await injectOverlays(page); },
    over: async (locator, ms = 650) => {
      if (rehearse) { await check(locator, `over · ${label(locator)}`); return; }
      const box = await resolve(page, locator).boundingBox().catch(() => null);
      if (box) { await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 10 }); await page.waitForTimeout(ms); }
    },
    click: async (locator, lbl, postDelay = 1000) => {
      // Click in BOTH modes (rehearse too) so state-dependent selectors that
      // only appear AFTER the click can be verified. Rehearse just skips the
      // cosmetic cursor animation + pacing.
      if (!await check(locator, lbl)) return false;
      const el = resolve(page, locator);
      try {
        if (!rehearse) {
          await el.scrollIntoViewIfNeeded(); await page.waitForTimeout(300);
          const box = await el.boundingBox();
          if (box) { await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 14 }); await page.waitForTimeout(450); }
        }
        await el.click();
      } catch (e) { console.error(`WARN click "${lbl}": ${e.message}`); fails.push(lbl); return false; }
      if (!rehearse) await page.waitForTimeout(postDelay);
      return true;
    },
    type: async (locator, text, lbl, delay = 35) => {
      if (!await check(locator, lbl)) return false;
      const el = resolve(page, locator);
      try {
        if (!rehearse) {
          const box = await el.boundingBox().catch(() => null);
          if (box) { await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 10 }); await page.waitForTimeout(300); }
        }
        await el.click(); await el.fill(''); await el.pressSequentially(text, { delay: rehearse ? 0 : delay });
      } catch (e) { console.error(`WARN type "${lbl}": ${e.message}`); fails.push(lbl); return false; }
      if (!rehearse) await page.waitForTimeout(500);
      return true;
    },
  };
}
function label(loc) { return typeof loc === 'string' ? loc : '(locator)'; }

async function runDemo({
  name,
  baseUrl = process.env.PB_BASE_URL || 'https://profitbuilders.io',
  cookie = process.env.PB_SESSION_COOKIE || '',
  cookieDomain = 'profitbuilders.io',
  seedLocalStorage = {},
  viewport = { width: 1280, height: 720 },
  story,
}) {
  const rehearse = process.argv.includes('--rehearse');
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport,
    ...(rehearse ? {} : { recordVideo: { dir: OUTPUT_DIR, size: viewport } }),
  });
  if (cookie) {
    await ctx.addCookies([{ name: 'session', value: cookie, domain: cookieDomain, path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  }
  if (seedLocalStorage && Object.keys(seedLocalStorage).length) {
    await ctx.addInitScript(seed => {
      for (const [k, v] of Object.entries(seed)) {
        localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v));
      }
    }, seedLocalStorage);
  }
  const page = await ctx.newPage();
  const h = makeHelpers(page, { rehearse });
  let err = null;
  try {
    await story(page, h, { baseUrl, rehearse });
  } catch (e) { err = e; console.error('DEMO ERROR:', e.message); }

  await ctx.close(); // finalizes the video file

  if (rehearse) {
    await browser.close();
    const ok = h.fails.length === 0 && !err;
    console.log(ok ? 'REHEARSAL PASSED' : `REHEARSAL FAILED — missing: [${h.fails.join(', ')}]${err ? ' (+ error)' : ''}`);
    process.exit(ok ? 0 : 1);
  }

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const webm = path.join(OUTPUT_DIR, `${name}.webm`);
  const mp4 = path.join(OUTPUT_DIR, `${name}.mp4`);
  const video = page.video();
  if (video) {
    fs.copyFileSync(await video.path(), webm);
    try {
      execFileSync('ffmpeg', ['-y', '-i', webm, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-crf', '23', mp4], { stdio: 'pipe' });
      fs.unlinkSync(webm); // mp4 is the default deliverable
      console.log('Demo saved (mp4):', mp4);
    } catch (e) {
      console.error('ffmpeg conversion failed, keeping webm:', e.message);
      console.log('Demo saved (webm):', webm);
    }
  } else {
    console.error('no video produced');
  }
  await browser.close();
  if (err) process.exit(1);
}

module.exports = { runDemo, makeHelpers, injectOverlays, showSubtitle, OUTPUT_DIR };
