'use strict';
// Scenario: heatmap-tier user hits the Flow paywall.
// Record:   ./tests/demo/record.sh heatmap-paywall --tier heatmap
// Rehearse: ./tests/demo/record.sh heatmap-paywall --tier heatmap --rehearse
const { runDemo } = require('../demo-helpers.cjs');

runDemo({
  name: 'heatmap-paywall',
  // Heatmap users land on their GEX product via /scanner?view=heatmap.
  story: async (page, h, { baseUrl }) => {
    // Beat 1 — their included product: the GEX heatmap
    await h.goto(`${baseUrl}/scanner?view=heatmap`);
    await h.pause(2600); // let the GEX heatmap render
    await h.subtitle('Heatmap plan — GEX heatmap is included');
    await page.mouse.move(660, 340, { steps: 12 }); await h.pause(700);
    await page.mouse.move(820, 300, { steps: 12 }); await h.pause(900);

    // Beat 2 — click the locked Flow tab → upgrade prompt (not a dead end)
    const flowTab = page.locator('aside button', { hasText: 'Flow' }).first();
    await h.subtitle('Click Flow — not on this plan');
    await h.click(flowTab, 'sidebar Flow tab (locked)', 1200);
    await page.getByText('Upgrade to Pro').first().waitFor({ timeout: 6000 }).catch(() => {});
    await h.subtitle('→ Clear upgrade prompt, no dead end');
    await h.over(page.getByText('Upgrade to Pro').first());
    await h.pause(2600);

    await h.subtitle('');
    await h.pause(800);
  },
});
