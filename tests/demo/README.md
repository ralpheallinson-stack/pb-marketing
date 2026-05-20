# UI demo harness

Records polished demo videos of profitbuilders.io surfaces — public pages or
subscriber-gated ones (scanner, watchlist, GEX heatmap) — with an injected
cursor, subtitles, and natural pacing. Output is **MP4** (H.264, QuickTime/Slack-friendly).

Runs on the trading server (`ssh trading`), where Playwright + chromium + ffmpeg live.

## Record

```bash
cd /opt/pb-marketing/tests/demo
./record.sh watchlist-overview                 # premium session (default)
./record.sh watchlist-overview --tier heatmap  # record as a heatmap-tier user
./record.sh watchlist-overview --rehearse      # verify selectors only, no recording
```

Output: `tests/demo/output/<scenario>.mp4` (gitignored). Copy it off the server with
`scp trading:/opt/pb-marketing/tests/demo/output/<scenario>.mp4 .`

## How it works

- `record.sh` forges a Flask session cookie via `forge-session.py` (uses the
  trading-system venv + `FLASK_SECRET_KEY`; read-only — just lets the demo view
  gated pages as a given tier), exports `PB_SESSION_COOKIE`, and runs the scenario.
- A **scenario** (`scenarios/<name>.cjs`) calls `runDemo({ name, seedLocalStorage, story })`.
  `runDemo` (in `demo-helpers.cjs`) handles the browser/context/video, seeds the
  cookie + localStorage, runs your `story`, then converts the WebM to MP4.
- The `story(page, h, { baseUrl })` callback drives the page through `h`:
  `h.goto(url)`, `h.subtitle(text)`, `h.click(locator, label)`, `h.over(locator)`,
  `h.type(locator, text, label)`, `h.pause(ms)`, `h.check(locator, label)`.
- **Rehearse-aware:** with `--rehearse`, `h.click/h.type/h.over` only verify the
  selector is visible (no clicks, fast) and report any misses — always rehearse
  before recording so a broken selector doesn't waste a take.

## Add a scenario

Create `scenarios/<name>.cjs`:

```js
'use strict';
const { runDemo } = require('../demo-helpers.cjs');
runDemo({
  name: '<name>',
  seedLocalStorage: { /* e.g. pb_watchlist: ['NVDA','SPY'] */ },
  story: async (page, h, { baseUrl }) => {
    await h.goto(`${baseUrl}/scanner`);
    await h.subtitle('Step 1 — …');
    await h.click(page.getByRole('button', { name: '…' }), '… button');
    await h.pause(2000);
  },
});
```

Then `./record.sh <name> --rehearse`, fix any FAILs, then `./record.sh <name>`.

Notes: demos run against **production** (read-only viewing — nothing mutates).
Flow-scanner demos look fullest **during market hours**. Public pages (`/`,
`/results`, `/vs/*`) need no `--tier`/cookie.
