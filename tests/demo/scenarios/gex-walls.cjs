'use strict';
// Scenario: READ THE GRID, row by row — and actually SCROLL the matrix so the
// rows being discussed are on screen. The matrix lives in a small inner
// overflow-auto box (~239px tall, ~639px of rows), so we smooth-scroll that
// container down through the strikes, land on the call-wall row and trace it
// ACROSS the expiry columns, then scroll to the put-wall row and do the same.
// Educational, direction-neutral (frameworks/gex-framework.md + trade-rules.md).
// Record:   ./tests/demo/record.sh gex-walls --tier pro_bundle
// Rehearse: ./tests/demo/record.sh gex-walls --tier pro_bundle --rehearse
const { runDemo } = require('../demo-helpers.cjs');

const MO = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const fmtExp = (iso) => { if (!iso) return iso; const [, m, d] = iso.split('-'); return `${MO[+m - 1]} ${+d}`; };

async function readTop(page) {
  return page.evaluate(() => {
    const t = document.body.innerText.replace(/ /g, ' ');
    const m = (re) => { const x = t.match(re); return x ? x[1] : null; };
    return { spot: m(/GAMMA EXPOSURE[\s\S]*?\$([\d,]+\.\d+)/), regime: m(/(LONG|SHORT)\s*γ/), flip: m(/GAMMA FLIP\s*\$?([\d,]+\.?\d*)/) };
  });
}
async function rankStrikes(page) {
  return page.evaluate(() => {
    const cells = [...document.querySelectorAll('[title]')].filter(e => /×/.test(e.getAttribute('title') || '') && /GEX:/.test(e.getAttribute('title') || ''));
    const per = {};
    for (const el of cells) {
      const t = el.getAttribute('title') || '';
      const sk = parseFloat((t.match(/^([\d.,]+)\s*×/) || [])[1]);
      const g = t.match(/GEX:\s*([+\-−]?)\$([\d.]+)\s*([BM])/);
      if (!isFinite(sk) || !g) continue;
      const sign = (g[1] === '-' || g[1] === '−') ? -1 : 1;
      per[sk] = (per[sk] || 0) + sign * parseFloat(g[2]) * (g[3] === 'B' ? 1000 : 1);
    }
    const rows = Object.entries(per).map(([s, n]) => ({ strike: +s, net: n })).sort((a, b) => b.net - a.net);
    return { topPos: rows[0], topNeg: rows[rows.length - 1] };
  });
}
async function readRow(page, strike) {
  return page.evaluate((sk) => {
    const cells = [...document.querySelectorAll(`[title^="${sk} × "]`)];
    return cells.map(el => {
      const t = el.getAttribute('title') || '';
      const exp = (t.match(/×\s*([\d-]+)/) || [])[1];
      const g = t.match(/GEX:\s*([+\-−]?)\$([\d.]+)\s*([BM])/);
      const sign = g && (g[1] === '-' || g[1] === '−') ? -1 : 1;
      const mag = g ? parseFloat(g[2]) * (g[3] === 'B' ? 1000 : 1) : 0;
      return { exp, gex: sign * mag };
    });
  }, strike);
}
// Smooth-scroll the matrix's inner overflow-auto container so a strike row is centered.
async function scrollRowIntoView(page, strike) {
  await page.evaluate((sk) => {
    const cell = document.querySelector(`[title^="${sk} × "]`);
    if (cell) cell.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, strike);
}
// Gentle step-scroll of the matrix container (the "scanning down the rows" feel).
async function scrollMatrixBy(page, dy) {
  await page.evaluate((dy) => {
    const cell = document.querySelector('[title*="× "]');
    let el = cell;
    while (el && el !== document.body) {
      const s = getComputedStyle(el);
      if ((s.overflowY === 'auto' || s.overflowY === 'scroll') && el.scrollHeight > el.clientHeight + 4) { el.scrollBy({ top: dy, behavior: 'smooth' }); return; }
      el = el.parentElement;
    }
  }, dy);
}
const cellNth = (page, sk, i) => page.locator(`[title^="${sk} × "]`).nth(i);

runDemo({
  name: 'gex-walls',
  story: async (page, h, { rehearse }) => {
    await h.goto(`${process.env.PB_BASE_URL || 'https://profitbuilders.io'}/scanner?view=heatmap`);
    await page.getByText('NET GEX HEATMAP').first().waitFor({ timeout: 20000 }).catch(() => {});
    await h.pause(1500);

    await h.subtitle('Let’s read the grid itself. Down the side = strike prices. Across the top = expiration dates.');
    await h.pause(3200);
    await h.subtitle('Each cell = dealer gamma at that strike, that expiry. Green = call-built, red = put-built. Brighter = more.');
    await h.pause(3400);

    const top = rehearse ? {} : await readTop(page);
    const r = rehearse ? {} : await rankStrikes(page);
    const cw = r.topPos, pw = r.topNeg;

    // Visibly scroll DOWN through the rows.
    await h.over(page.getByText('NET GEX HEATMAP').first(), 500).catch(() => {});
    await h.subtitle('Scroll down the strikes — watch for the heaviest rows. Those are the walls.');
    if (!rehearse) { for (let i = 0; i < 3; i++) { await scrollMatrixBy(page, 120); await h.pause(900); } }
    await h.pause(900);

    // ---- CALL WALL ROW: scroll to it, then trace ACROSS the expiries ----
    if (cw) {
      const row = rehearse ? [] : await readRow(page, cw.strike);
      const n = row.length;
      let maxIdx = 0; for (let i = 0; i < n; i++) if (row[i].gex > row[maxIdx].gex) maxIdx = i;
      if (!rehearse) { await scrollRowIntoView(page, cw.strike); await h.pause(1100); }
      await h.over(cellNth(page, cw.strike, 0), 900).catch(() => {});
      await h.subtitle(`Here it is — the ${cw.strike} row, the brightest green on the board. Read it across, left to right: earliest expiry first.`);
      await h.pause(3400);
      if (n > 2) { await h.over(cellNth(page, cw.strike, Math.min(2, n - 1)), 600).catch(() => {}); await h.pause(1300); }
      await h.over(cellNth(page, cw.strike, maxIdx), 900).catch(() => {});
      const me = row[maxIdx];
      await h.subtitle(me && me.exp
        ? `It brightens here — most of ${cw.strike}’s gamma sits in the ${fmtExp(me.exp)} expiry (≈$${Math.round(me.gex)}M). That’s the expiry where this wall actually presses.`
        : `The brightest cell in the row is the expiry holding the gamma — where the wall presses.`);
      await h.pause(3600);
      if (maxIdx < n - 1) {
        await h.over(cellNth(page, cw.strike, n - 1), 700).catch(() => {});
        await h.subtitle(`Out at ${fmtExp(row[n - 1].exp)} the same strike is thin — barely pressure. Same wall, different week, different weight.`);
        await h.pause(3400);
      }
    }

    // ---- PUT WALL ROW: scroll down further, trace across the red ----
    if (pw) {
      const row = rehearse ? [] : await readRow(page, pw.strike);
      const n = row.length;
      let minIdx = 0; for (let i = 0; i < n; i++) if (row[i].gex < row[minIdx].gex) minIdx = i;
      if (!rehearse) { await scrollRowIntoView(page, pw.strike); await h.pause(1100); }
      await h.over(cellNth(page, pw.strike, 0), 800).catch(() => {});
      await h.subtitle(`Scroll down into the red — the ${pw.strike} row, deepest negative below spot. That’s the put wall. Same read, across the expiries.`);
      await h.pause(3400);
      await h.over(cellNth(page, pw.strike, minIdx), 900).catch(() => {});
      const me = row[minIdx];
      await h.subtitle(me && me.exp
        ? `Heaviest red in ${fmtExp(me.exp)} (≈$${Math.round(me.gex)}M) — that’s the expiry the floor is built in.`
        : `The deepest-red cell is the expiry the floor is built in.`);
      await h.pause(3400);
    }

    await h.subtitle('The rule: scroll DOWN for the heaviest rows — biggest green is the call wall, deepest red the put wall. Read ACROSS each for the expiry that owns it.');
    await h.pause(3800);
    if (top.flip) {
      await h.subtitle(`And it all hinges on regime — lose the $${top.flip} flip and the grid inverts: pinning turns into trending.`);
    } else {
      await h.subtitle('And it all hinges on regime — below the gamma flip, pinning turns into trending.');
    }
    await h.pause(3000);
    await h.subtitle('Honest caveat: OI settles overnight (the grid lags intraday), and it’s only this clean on index/ETF — not single names.');
    await h.pause(3200);
    await h.subtitle('Read the grid yourself, every session — GEX heatmap, $39/mo.');
    await h.pause(2600);
    await h.subtitle('');
    await h.pause(800);
  },
});
