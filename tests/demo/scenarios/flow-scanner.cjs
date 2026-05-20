'use strict';
// Scenario: live options-flow scanner walkthrough (premium tier).
// Record:   ./tests/demo/record.sh flow-scanner
// Rehearse: ./tests/demo/record.sh flow-scanner --rehearse
const { runDemo } = require('../demo-helpers.cjs');

runDemo({
  name: 'flow-scanner',
  story: async (page, h, { baseUrl }) => {
    await h.goto(`${baseUrl}/scanner`);
    await page.locator('.ag-row').first().waitFor({ timeout: 15000 }).catch(() => {});
    await h.pause(2000);

    await h.subtitle('Real-time options flow scanner');
    await h.pause(1700);
    // pan the dashboard / stat strip across the top
    await page.mouse.move(320, 108, { steps: 12 }); await h.pause(650);
    await page.mouse.move(640, 108, { steps: 12 }); await h.pause(650);
    await page.mouse.move(980, 108, { steps: 12 }); await h.pause(650);
    await h.subtitle('Sentiment · call/put flow · totals');
    await h.pause(1500);

    // pan the live rows
    await page.mouse.move(620, 320, { steps: 12 }); await h.pause(700);
    await page.mouse.move(620, 470, { steps: 12 }); await h.pause(900);
    await h.subtitle('Sweeps & blocks — AI-graded, MM/spread filtered');
    await h.pause(1700);
    await page.mouse.wheel(0, 520); await h.pause(1400); // scroll the grid

    // filter to a ticker
    const search = page.locator('input[placeholder="Search ticker..."]');
    await h.subtitle('Filter to any ticker');
    await h.type(search, 'NVDA', 'search ticker input');
    await page.keyboard.press('Enter');
    await h.pause(2600);

    await h.subtitle('');
    await h.pause(800);
  },
});
