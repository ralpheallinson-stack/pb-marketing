'use strict';
// Scenario: HOW TO FIND FLOW — the full discovery funnel (~2:30).
// Clean scanner -> 4-filter funnel -> visual scan (gold/purple row states) ->
// candidate read (8-factor anatomy) -> discriminating close. Educational, not
// advisory. Featured candidate is a SINGLE-NAME EQUITY only (skips indices AND
// ETFs). Sibling to flow-anatomy.cjs (390bfcc), materially expanded.
//
// BEST RECORDED DURING MARKET HOURS (or off a full prior session's data): the
// funnel magnitude and PURPLE/accumulation rows only exist on a populated tape.
//
// Record:   ./tests/demo/record.sh flow-discovery
// Rehearse: ./tests/demo/record.sh flow-discovery --rehearse
// Lock a ticker for a re-record: DEMO_TICKER=NVDA ./tests/demo/record.sh flow-discovery
const { runDemo } = require('../demo-helpers.cjs');

const DEMO_TICKER = process.env.DEMO_TICKER || null;
// Featured candidate must be a single-name equity — skip indices AND ETFs.
// "Hide index symbols" only removes pure indices (SPX/NDX/RUT/VIX), not ETFs.
const NOT_EQUITY = ['SPX','SPXW','NDX','NDXP','RUT','RUTW','VIX','VIXW','XSP',
  'SPY','QQQ','IWM','DIA','GLD','SLV','XLI','XLE','XLF','XLK','XLV','XLY','XLP',
  'XLU','XLB','XLC','SMH','XBI','EEM','EFA','TLT','HYG','LQD','ARKK','KRE','XOP',
  'USO','UNG','VXX','UVXY','SQQQ','TQQQ','SOXL','SOXS','FXI','KWEB','IBIT'];

runDemo({
  name: 'flow-discovery',
  // Clean Act-1 state: reset the persisted filter toggles. (The index + premium
  // filters aren't persisted — they reset to default on load.)
  seedLocalStorage: { pb_exclude_midpoint: '0', pb_curated_grades: '0', pb_exclude_multi_leg: '0' },
  story: async (page, h, { baseUrl, rehearse }) => {
    const rowsReady = () => page.locator('.ag-row').first().waitFor({ timeout: 15000 }).catch(() => {});
    await h.goto(`${baseUrl}/scanner`);
    await rowsReady();
    await h.pause(2000);

    // ───────────────────── ACT 1 — the problem (~25s) ─────────────────────
    await h.subtitle('Every options trade hitting the tape — thousands a day.');
    await h.pause(3200);
    await h.subtitle('The gauges up top tally the day’s flow — thousands of contracts across every name.');
    await h.pause(3400);
    await h.subtitle('Most of it is noise: MM hedges, lottery tickets, mid-prints, small clips.');
    await h.pause(3400);
    await h.subtitle('The job is filtering to real institutional positioning. Without a method, you drown.');
    await h.pause(3600);

    // ─────────────────── ACT 2 — the filter funnel (~55s) ──────────────────
    await h.subtitle('Four filters cut through the noise.');
    await h.pause(2200);
    await h.click(page.getByRole('button', { name: /^Filters$/ }).first(), 'Filters button', 1300);

    // Filter 1 — premium floor
    await h.click(page.getByRole('button', { name: /^Min Premium/ }).first(), 'Min Premium section', 900);
    await h.subtitle('One — premium floor at $500K. Real institutional size starts here; below it is below the line.');
    await h.pause(1500);
    await h.click(page.getByText('$500K+', { exact: true }), '$500K+ option', 1400);

    // Filters 2-4 all live in the Quality section
    await h.click(page.getByRole('button', { name: /^Quality/ }).first(), 'Quality section', 900);
    await h.subtitle('Two — hide index underlyings. Index flow is dealer-driven, not single-name conviction.');
    await h.pause(1500);
    await h.click(page.getByText('Hide index symbols', { exact: true }), 'Hide index symbols', 1300);
    await h.subtitle('Three — curated grades: A and B, the two conviction tiers the scanner already graded.');
    await h.pause(1500);
    await h.click(page.getByText('Curated grades only (A, B)', { exact: true }), 'Curated grades', 1300);
    await h.subtitle('Four — drop midpoint fills. Real conviction pays the ask or hits the bid; mid is uncertain.');
    await h.pause(1500);
    await h.click(page.getByText('Exclude midpoint fills', { exact: true }), 'Exclude midpoint', 1300);

    await h.click(page.getByRole('button', { name: /^Close$/ }).first(), 'Close filters', 1600);
    await rowsReady();
    await h.subtitle('From thousands to a focused set. The funnel IS the method. Now we read what is left.');
    await h.pause(3400);

    // ──────────────────── ACT 3 — the visual scan (~35s) ───────────────────
    await h.subtitle('Sort by premium — largest first.');
    const premHead = page.locator('.ag-header-cell[col-id="premium"]');
    await h.check(premHead, 'Premium header');
    for (let i = 0; i < 2; i++) {
      if (!rehearse) { const box = await premHead.boundingBox(); if (box) { await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 10 }); await page.waitForTimeout(250); } }
      await premHead.click();
      await page.waitForTimeout(rehearse ? 1500 : 2400);
    }
    // Block until the sort lands (top row premium in $…M).
    await page.waitForFunction(() => {
      const r = document.querySelector('.ag-row[row-index="0"]');
      const p = r && r.querySelector('.ag-cell[col-id="premium"]');
      return p && /M\b/.test(p.textContent || '');
    }, null, { timeout: 16000 }).catch(() => {});
    await h.pause(1000);
    await h.subtitle('Now read the row colors — they encode new positioning.');
    await h.pause(2400);

    // Gold + purple are live-data dependent. Pause the cursor on one if present;
    // teach the concept regardless (purple/accumulation rows only build intraday).
    const goldSel = '.ag-row.cf-row-oi-single';
    const purpleSel = '.ag-row.cf-row-oi-multi';
    if (await page.locator(goldSel).first().isVisible().catch(() => false)) await h.over(goldSel, 1000);
    await h.subtitle('Gold — one trade where volume tops existing OI 2x+. A big new bet the book was not positioned for.');
    await h.pause(3800);
    if (await page.locator(purpleSel).first().isVisible().catch(() => false)) await h.over(purpleSel, 1000);
    await h.subtitle('Purple — accumulation: same direction, multiple prints, built over the session vs existing OI.');
    await h.pause(3800);
    await h.subtitle('Both say real new positioning. That is what we are hunting.');
    await h.pause(2800);

    // ─────────────────── ACT 4 — the candidate read (~55s) ──────────────────
    // Pick the top single-name equity (skip indices+ETFs); prefer a gold/purple
    // row; DEMO_TICKER overrides. Never feature an index/ETF as "the equity bet".
    const featured = await page.evaluate(({ exclude, want }) => {
      const cell = (r, id) => { const e = r.querySelector(`.ag-cell[col-id="${id}"]`); return e ? e.textContent.trim() : ''; };
      const all = Array.from(document.querySelectorAll('.ag-row')).map(r => ({
        idx: r.getAttribute('row-index'),
        sym: cell(r, 'symbol'), prem: cell(r, 'premium'), cp: cell(r, 'cp'),
        side: cell(r, 'aggression'), type: cell(r, 'flow_type'), strike: cell(r, 'strike'),
        spot: cell(r, 'spot_fmt'), exp: cell(r, 'expiration'), conds: cell(r, 'badges'),
        gold: /cf-row-oi-single/.test(r.className), purple: /cf-row-oi-multi/.test(r.className),
      })).filter(x => x.sym && !exclude.includes(x.sym));
      if (want) return all.find(x => x.sym === want) || null;
      return all.find(x => (x.gold || x.purple) && /M\b/.test(x.prem))
          || all.find(x => /M\b/.test(x.prem)) || all[0] || null;
    }, { exclude: NOT_EQUITY, want: DEMO_TICKER });
    console.log('FEATURED:', JSON.stringify(featured));

    if (featured && featured.idx != null) {
      const row = `.ag-row[row-index="${featured.idx}"]`;
      await page.locator(row).scrollIntoViewIfNeeded().catch(() => {});
      await h.pause(800);
      const color = featured.gold ? ' (gold — single-print)' : featured.purple ? ' (purple — accumulation)' : '';
      await h.subtitle(`Top single-name read: ${featured.sym} · ${featured.cp} · ${featured.prem}${color}`);
      await h.pause(3000);
      await h.over(`${row} .ag-cell[col-id="premium"]`, 800);
      await h.subtitle(`Size — ${featured.prem} of real premium. Clears the institutional floor.`);
      await h.pause(2900);
      await h.over(`${row} .ag-cell[col-id="aggression"]`, 800);
      await h.subtitle(`Aggression — ${featured.side || 'side'}. ${/Ask|Above/.test(featured.side) ? 'Paid up to get filled, now.' : /Bid|Below/.test(featured.side) ? 'Hit the bid — the urgency is on the sell side.' : 'Read the side for urgency.'}`);
      await h.pause(3000);
      await h.over(`${row} .ag-cell[col-id="flow_type"]`, 800);
      await h.subtitle(`Type — ${featured.type || 'flow'}. ${/SWEEP/.test(featured.type) ? 'Swept multiple exchanges = time-sensitive.' : 'Block = pre-negotiated size.'}`);
      await h.pause(3000);
      await h.over(`${row} .ag-cell[col-id="cp"]`, 800);
      await h.subtitle(`Direction — ${featured.cp} at ${featured.strike}, spot ${featured.spot}. Strike vs spot is the actual bet.`);
      await h.pause(3000);
      await h.over(`${row} .ag-cell[col-id="expiration"]`, 800);
      await h.subtitle(`Expiry — ${featured.exp || 'the date'}. The DTE window tells you the time horizon of the thesis.`);
      await h.pause(3000);
      await h.over(`${row} .ag-cell:last-child`, 800);
      await h.subtitle(`Conds — ${featured.conds || 'the stacked tags'}. The more that align in one direction, the stronger the read.`);
      await h.pause(3000);
      await h.subtitle('Read it as one stack: size, aggression, type, direction, conditions all pointing one way = a thesis being built.');
      await h.pause(3600);
    } else {
      await h.subtitle('Read the top single-name row as one stack: size, aggression, type, direction, conditions.');
      await h.pause(3000);
    }

    // ──────────────── ACT 5 — discriminate + what to do (~30s) ───────────────
    await h.subtitle('Not every gold or purple row is actionable. Cross-check the context.');
    await h.pause(2800);
    await h.subtitle('Earnings today? Catalyst already public? Opposing flow earlier in the session? Any contradiction breaks the read.');
    await h.pause(3800);
    await h.subtitle('Contrast: a large premium tagged CLOSING is an exit, not a new bet — bigger number, opposite meaning.');
    await h.pause(3600);
    await h.subtitle('A clean read → watchlist the name. Track tomorrow’s prints.');
    await h.pause(2800);
    await h.subtitle('Same direction with size = thesis confirming. Reversing, or coming in CLOSING = read broken. Drop it.');
    await h.pause(3800);
    await h.subtitle('Track whether the conviction is still being built — never copy the trade.');
    await h.pause(3200);
    await h.subtitle('');
    await h.pause(800);
  },
});
