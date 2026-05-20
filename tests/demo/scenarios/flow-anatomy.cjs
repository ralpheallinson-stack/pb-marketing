'use strict';
// Scenario: how to READ institutional flow on a name you're watching.
// Pull up a ticker -> sort by premium -> read the biggest real bet's anatomy.
// Educational ("how to read it"), NOT a trade recommendation. Equity only (no index).
// Record:   ./tests/demo/record.sh flow-anatomy
// Rehearse: ./tests/demo/record.sh flow-anatomy --rehearse
const { runDemo } = require('../demo-helpers.cjs');

const TICKER = process.env.DEMO_TICKER || 'TSLA';

runDemo({
  name: 'flow-anatomy',
  story: async (page, h, { baseUrl, rehearse }) => {
    await h.goto(`${baseUrl}/scanner`);
    await page.locator('.ag-row').first().waitFor({ timeout: 15000 }).catch(() => {});
    await h.pause(1700);
    await h.subtitle('Watching a name? See what institutions are doing in it.');
    await h.pause(1800);

    // Pull up the ticker
    const search = page.locator('input[placeholder="Search ticker..."]');
    await h.subtitle(`Step 1 — pull up ${TICKER}`);
    await h.type(search, TICKER, 'search ticker input');
    await page.keyboard.press('Enter');
    await page.locator('.ag-row').first().waitFor({ timeout: 8000 }).catch(() => {});
    await h.pause(1800);

    // Sort by premium (biggest bet first) — descending via aria-sort
    await h.subtitle('Step 2 — sort by premium: the biggest bet first');
    const premHead = page.locator('.ag-header-cell[col-id="premium"]');
    await h.check(premHead, 'Premium column header');
    for (let i = 0; i < 3; i++) {
      const s = await premHead.getAttribute('aria-sort').catch(() => null);
      if (s === 'descending') break;
      if (!rehearse) { const box = await premHead.boundingBox(); if (box) { await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 10 }); await page.waitForTimeout(250); } }
      await premHead.click();
      await page.waitForTimeout(rehearse ? 1600 : 2300);
    }
    await page.waitForFunction(() => {
      const c = document.querySelector('.ag-row[row-index="0"] .ag-cell[col-id="premium"]');
      return c && /M\b/.test(c.textContent || '');
    }, { timeout: 12000 }).catch(() => {});
    await h.pause(900);

    const top = await page.evaluate(() => {
      const r = document.querySelector('.ag-row[row-index="0"]');
      if (!r) return null;
      const cell = id => { const c = r.querySelector(`.ag-cell[col-id="${id}"]`); return c ? c.textContent.trim() : ''; };
      return { sym: cell('symbol'), cp: cell('cp'), prem: cell('premium'), dte: cell('dte') };
    });
    console.log('TOP ROW:', JSON.stringify(top));
    if (top && top.sym) {
      await h.subtitle(`Biggest ${top.sym} bet today: ${top.cp} · ${top.prem}${top.dte ? ' · ' + top.dte + ' DTE' : ''}`);
    } else {
      await h.subtitle(`The biggest ${TICKER} bet on the tape`);
    }
    await h.pause(2600);

    // Walk the anatomy — cursor on real cells, subtitles teach the read.
    const row0 = '.ag-row[row-index="0"]';
    await h.over(`${row0} .ag-cell[col-id="premium"]`, 700);
    await h.subtitle('Premium — real dollars at risk, not retail lottery tickets');
    await h.pause(1900);
    await h.over(`${row0} .ag-cell[col-id="aggression"]`, 700);
    await h.subtitle('Aggression — Ask/Above = they paid up to get filled, now');
    await h.pause(1900);
    await h.over(`${row0} .ag-cell:last-child`, 700);
    await h.subtitle('Conds — SWEEP (across exchanges), ACCUM (repeat buys), WHALE');
    await h.pause(2100);

    await h.subtitle('Each one graded — MM hedges & spreads filtered out. Fewer alerts, higher conviction.');
    await h.pause(2700);
    await h.subtitle('');
    await h.pause(800);
  },
});
