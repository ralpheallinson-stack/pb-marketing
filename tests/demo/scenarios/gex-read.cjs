'use strict';
// Scenario: how to READ the GEX heatmap — dealer gamma positioning.
// Regime (spot vs flip) -> walls -> the one level that flips the tape.
// Educational ("how to read it"), NOT a trade recommendation. Direction-neutral
// by construction (per frameworks/gex-framework.md + ~/.claude/trade-rules.md):
// names levels as conditionals, never buy/sell, states the OI-lag limitation.
// Record:   ./tests/demo/record.sh gex-read --tier pro_bundle
// Rehearse: ./tests/demo/record.sh gex-read --tier pro_bundle --rehearse
const { runDemo } = require('../demo-helpers.cjs');

// Read the live stat-strip values off the rendered heatmap so the reel is
// always grounded in the real product (framework forbids fabricating).
async function readGex(page) {
  return page.evaluate(() => {
    const t = document.body.innerText.replace(/ /g, ' ');
    const m = (re) => { const x = t.match(re); return x ? x.slice(1) : null; };
    const spot = m(/GAMMA EXPOSURE[\s\S]*?\$([\d,]+\.\d+)/);
    return {
      spot: spot ? spot[0] : null,
      regime: m(/(LONG|SHORT)\s*γ/) ? (t.match(/(LONG|SHORT)\s*γ/)[1]) : null,
      flip: m(/GAMMA FLIP\s*\$?([\d,]+\.?\d*)/),
      net: m(/TOTAL NET GEX\s*([+\-−]?\$[\d.]+\s*[BM])/),
      callWall: m(/CALL WALL\s*\$?([\d,]+)\s*([+\-−]?\$[\d.]+\s*[BM])/),
      putWall: m(/PUT WALL\s*\$?([\d,]+)\s*([+\-−]?\$[\d.]+\s*[BM])/),
      estimated: /\bESTIMATED\b/.test(t),
    };
  });
}
const v = (x) => Array.isArray(x) ? x : (x == null ? null : [x]);

runDemo({
  name: 'gex-read',
  story: async (page, h, { baseUrl, rehearse }) => {
    await h.goto(`${baseUrl}/scanner?view=heatmap`);
    // Wait for the GEX strip to render (gamma flip is the master level).
    await page.getByText('GAMMA FLIP').first().waitFor({ timeout: 20000 }).catch(() => {});
    await h.pause(1800);

    await h.subtitle('GEX is a volatility map — not a direction map. Here’s how to read it.');
    await h.pause(2400);

    const g = rehearse ? {} : await readGex(page);
    const spot = g.spot, flip = g.flip && g.flip[0];
    const regime = g.regime;            // LONG γ = positive gamma
    const cw = g.callWall, pw = g.putWall, net = g.net && g.net[0];

    // 1 — REGIME first (spot vs zero-gamma / "gamma flip")
    await h.over(page.getByText('GAMMA FLIP').first(), 800);
    if (spot && flip) {
      await h.subtitle(`Spot $${spot} vs the $${flip} gamma flip — that sign decides everything.`);
    } else {
      await h.subtitle('Start at the gamma flip — spot above it vs below it decides the regime.');
    }
    await h.pause(2600);

    await h.over(page.getByText(/LONG\s*γ|SHORT\s*γ/).first(), 800).catch(() => {});
    if (regime === 'LONG') {
      await h.subtitle('Spot above flip = LONG gamma: dealers buy dips, sell rips → vol suppressed, mean-reverting.');
    } else if (regime === 'SHORT') {
      await h.subtitle('Spot below flip = SHORT gamma: dealers chase → vol expands, trends persist, gaps don’t fill.');
    } else {
      await h.subtitle('Above flip = vol suppressed (pinned). Below flip = vol expands (trending). Read this first.');
    }
    await h.pause(2900);

    // 2 — NET GEX magnitude
    await h.over(page.getByText('TOTAL NET GEX').first(), 700).catch(() => {});
    await h.subtitle(net ? `Net GEX ${net} — how hard dealers push back. Big positive = tight, stabilized tape.`
                         : 'Net GEX = how hard dealer hedging pushes. Big positive = tight, stabilized tape.');
    await h.pause(2600);

    // 3 — THE WALLS (magnets / speed bumps)
    await h.over(page.getByText('CALL WALL').first(), 800).catch(() => {});
    await h.subtitle(cw ? `Call wall $${cw[0]} (${cw[1]}) — the magnet/ceiling. Price stalls into it, doesn’t slice through.`
                        : 'Call wall = the upside magnet/ceiling. Price stalls into it.');
    await h.pause(2700);
    await h.over(page.getByText('PUT WALL').first(), 800).catch(() => {});
    await h.subtitle(pw ? `Put wall $${pw[0]} (${pw[1]}) — the cushion below. Together they box the range.`
                        : 'Put wall = the cushion below. Together the walls box the range.');
    await h.pause(2700);

    // 4 — synthesize + the one level that flips the read
    if (regime === 'LONG' && spot && flip && cw) {
      await h.subtitle(`So: a vol-suppression box, spot pinned near the $${cw[0]} wall, edges faded.`);
      await h.pause(2600);
      await h.subtitle(`The level that matters isn’t a target — it’s $${flip}: lose the flip and the tape stops pinning and starts trending.`);
    } else {
      await h.subtitle('Synthesize the regime, then watch the flip — that single level changes the character of the tape.');
    }
    await h.pause(3000);

    // 5 — the limitation, said on camera (credibility)
    await h.over(page.getByText('ESTIMATED').first(), 700).catch(() => {});
    await h.subtitle('Honest caveat: OI settles overnight, so the map lags intraday — and it’s only this clean on index/ETF, not single names.');
    await h.pause(3000);

    // Soft product close (no profit claims, no calls)
    await h.subtitle('Read dealer positioning every session — GEX heatmap, $39/mo.');
    await h.pause(2600);
    await h.subtitle('');
    await h.pause(800);
  },
});
