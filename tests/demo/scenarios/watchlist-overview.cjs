'use strict';
// Scenario: watchlist Overview/Flow toggle (Phase 2B step 1).
// Record: ./tests/demo/record.sh watchlist-overview
// Rehearse: ./tests/demo/record.sh watchlist-overview --rehearse
const { runDemo } = require('../demo-helpers.cjs');

runDemo({
  name: 'watchlist-overview',
  seedLocalStorage: {
    pb_watchlist: ['NVDA', 'AAPL', 'SPY', 'TSLA', 'META'],
    pb_watchlist_view_mode: 'flow', // start in the default Flow view
  },
  story: async (page, h, { baseUrl }) => {
    await h.goto(`${baseUrl}/scanner?view=watchlist`);
    await page.getByText('NVDA').first().waitFor({ timeout: 12000 }).catch(() => {});
    await h.pause(1500);

    await h.subtitle('Watchlist — Flow view (default)');
    await h.pause(1600);
    await h.over(page.getByText('NVDA').first());
    await h.over(page.getByText('AAPL').first());
    await h.over(page.getByText('TSLA').first());

    const overview = page.getByRole('button', { name: 'Overview', exact: true });
    await h.subtitle('One click → Overview');
    await h.click(overview, 'Overview toggle', 1400);

    await h.subtitle('IV Rank · Opt Vol · Mkt Cap · 2-Day · Δ$');
    await h.pause(2600); // let the enrichment columns populate from the snapshot endpoint
    await h.over(page.getByText('IV Rank'));
    await h.over(page.getByText('Opt Vol'));
    await h.over(page.getByText('Mkt Cap'));
    await h.over(page.getByText('2-Day'));
    await h.pause(1000);

    const flow = overview.locator('..').getByRole('button', { name: 'Flow', exact: true });
    await h.subtitle('Toggle back to Flow anytime');
    await h.click(flow, 'Flow toggle (scoped to toggle container)', 1400);
    await h.pause(1400);

    await h.subtitle('');
    await h.pause(900);
  },
});
