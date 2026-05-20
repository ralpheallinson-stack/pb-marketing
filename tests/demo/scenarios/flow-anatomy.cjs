'use strict';
// Scenario: how to READ institutional flow — sort to the biggest conviction,
// then walk the anatomy of a REAL signal (premium · aggression · Conds · grade).
// Educational ("how to read it"), NOT a trade recommendation.
// Record:   ./tests/demo/record.sh flow-anatomy
// Rehearse: ./tests/demo/record.sh flow-anatomy --rehearse
const { runDemo } = require('../demo-helpers.cjs');

runDemo({
  name: 'flow-anatomy',
  story: async (page, h, { baseUrl, rehearse }) => {
    await h.goto(`${baseUrl}/scanner`);
    await page.locator('.ag-row').first().waitFor({ timeout: 15000 }).catch(() => {});
    await h.pause(1800);
    await h.subtitle('7,000+ institutional options trades today — which ones matter?');
    await h.pause(1900);

    // Step 1 — surface conviction: sort premium descending (server refetch).
    await h.subtitle('Step 1 — sort by premium: the heaviest bets first');
    const premHead = page.locator('.ag-header-cell[col-id="premium"]');
    await h.check(premHead, 'Premium column header');
    for (let i = 0; i < 3; i++) {
      const s = await premHead.getAttribute('aria-sort').catch(() => null);
      if (s === 'descending') break;
      if (!rehearse) {
        const box = await premHead.boundingBox();
        if (box) { await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 10 }); await page.waitForTimeout(250); }
      }
      await premHead.click();
      await page.waitForTimeout(rehearse ? 1500 : 2200);
    }
    // wait for the refetched top-premium data to actually land (top row shows $…M)
    await page.waitForFunction(() => {
      const c = document.querySelector('.ag-row[row-index="0"] .ag-cell[col-id="premium"]');
      return c && /M\b/.test(c.textContent || '');
    }, { timeout: 12000 }).catch(() => {});
    await h.pause(900);

    // Read the real top signal so the callout is concrete + accurate.
    const top = await page.evaluate(() => {
      const r = document.querySelector('.ag-row[row-index="0"]');
      if (!r) return null;
      const cell = id => { const c = r.querySelector(`.ag-cell[col-id="${id}"]`); return c ? c.textContent.trim() : ''; };
      return { sym: cell('symbol'), cp: cell('cp'), agg: cell('aggression'), prem: cell('premium') };
    });
    console.log('TOP ROW:', JSON.stringify(top));
    if (top && top.sym) {
      const a = (top.agg || '').toLowerCase();
      const phrase = /above/.test(a) ? 'paid ABOVE the ask — maximally aggressive'
        : /ask/.test(a) ? 'lifted at the ASK — aggressive buyer'
        : /below/.test(a) ? 'sold BELOW the bid — aggressive seller'
        : /bid/.test(a) ? 'hit the BID — aggressive seller'
        : 'at mid-market';
      await h.subtitle(`Top of the tape: ${top.sym} ${top.cp} · ${top.prem} · ${phrase}`);
    } else {
      await h.subtitle('The heaviest institutional bet on the tape');
    }
    await h.pause(2600);

    // Walk the anatomy — cursor to the real cells, subtitles teach the read.
    const row0 = '.ag-row[row-index="0"]';
    await h.over(`${row0} .ag-cell[col-id="premium"]`, 700);
    await h.subtitle('Premium — real dollars at risk, not retail lottery tickets');
    await h.pause(1900);
    await h.over(`${row0} .ag-cell[col-id="aggression"]`, 700);
    await h.subtitle('Aggression — Ask/Above means they paid up to get filled, now');
    await h.pause(1900);
    await h.over(`${row0} .ag-cell:last-child`, 700);
    await h.subtitle('Conds — SWEEP (across exchanges), ACCUM (repeat buys), WHALE');
    await h.pause(2100);

    await h.subtitle('Graded A/B — MM hedges & spreads stripped out. Fewer alerts, higher conviction.');
    await h.pause(2700);
    await h.subtitle('');
    await h.pause(800);
  },
});
