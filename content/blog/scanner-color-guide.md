---
title: "Scanner Color Guide: What the Row Highlights Mean"
description: "The Profit Builders scanner's OI-status row highlights explained — single- and multi-trade open-interest exceedance, late prints, and market-maker filtering."
date: "2026-03-05"
updated: "2026-05-11"
author: "Profit Builders"
read_time: "3"
---

The Profit Builders scanner uses color-coded row highlights to surface trades whose volume relative to existing open interest is doing something out of the ordinary. The system is BlackBox-style: the highlight tells you that a contract's trading volume has exceeded what's already been positioned in it, and whether that exceedance came from a single print or from accumulated activity. Here is what each color means and how to read it. New to flow tools? Start with our [full scanner comparison](/blog/best-options-flow-scanner-2026).

## Yellow — Single-Trade OI Exceedance

**Trigger:** Volume / open interest ratio > 1.0 (single trade)

A yellow row means a single trade just pushed today's contract volume above the contract's existing open interest. This is genuinely unusual: by definition, every option contract has a pool of existing positions (the open interest), and most days the trading volume stays well below that number. When one print is large enough to single-handedly exceed the OI, the trader on the other side is committing more capital to this contract than the entire prior position book represented.

**What to watch for:** Direction (call vs put) and DTE. Yellow on short-dated calls during a market pullback is informed speculation. Yellow on far-dated puts on a name you don't otherwise see flow on is often portfolio protection at scale.

## Purple — Multi-Trade OI Exceedance with Accumulation

**Trigger:** Volume / open interest ratio > 1.0 AND ≥ 2 accumulated trades on the same contract within the rolling window

Purple is the higher-conviction tier of OI exceedance. The volume / OI threshold is the same as yellow, but purple additionally requires that the exceedance is being built up by multiple prints — at least two trades have hit the same contract recently. That pattern indicates someone is actively accumulating a position rather than placing a single bet and walking away.

Purple rows are the most actionable highlight for trend-following setups. Repeat institutional accumulation across multiple prints is harder to explain away as a hedge or a one-off, and the pattern often precedes meaningful directional movement on the underlying.

**What to watch for:** When purple appears on the same ticker repeatedly within a single session, the cumulative thesis is usually worth a closer look. Cross-reference with the conviction grade (Grade A is the strongest confirmation) and the spot price action on the underlying.

## Orange — Late Print

**Trigger:** Trade flagged as out-of-sequence (late report from the exchange)

Orange highlights trades that arrived on the tape after a more recent print had already been recorded for the same or adjacent contracts. These prints are real institutional trades; they just got reported with a delay due to exchange-side sequencing.

Late prints are not necessarily a directional signal on their own — the delay is a reporting artifact, not a trader behavior. But they are worth knowing about because the actual execution happened earlier than the timestamp suggests. If you're reconstructing intraday context (e.g., "what triggered the move at 10:42?"), an orange print appearing at 10:44 may have actually executed at 10:41.

## Dimmed / Filtered — Market Maker Activity

**Behavior:** MM-suspected trades are filtered out of the default scanner view entirely

The scanner's market-maker detection identifies trades that are likely delta-neutral hedges rather than directional bets — for example, when a call buy and put buy on the same symbol happen within seconds at similar premium levels (a conversion or reversal). Market-maker flow is real volume, but it is not directional information, and including it in the tape skews sentiment readings and clutters the view.

By default, the scanner drops these rows from the rendered table so subscribers focus on flow that actually represents conviction. This is a behavior change from older guides that described MM rows as "dimmed" — the current scanner removes them outright.

**What to watch for:** If you are doing total-volume reconciliation (e.g., comparing PB's surfaced flow to an external feed), be aware that MM-suspected trades are excluded. The grading and OI-exceedance highlights apply only to the directional flow that survives the MM filter.

## No Highlight — Standard Graded Flow

Rows without any highlight color are trades that passed all quality filters but did not exceed the contract's open interest and were not flagged as late prints. They still carry a conviction grade (A, B, or PASS) shown in the dedicated grade column and remain the bulk of what the scanner displays — institutional-scale activity with confirmed direction, just without the additional OI-status badge.

---

Understanding these highlights helps you prioritize your attention on a fast-moving tape. **Yellow** is a single large print exceeding open interest. **Purple** is repeat accumulation pushing the same exceedance through multiple prints — the strongest near-term signal. **Orange** is a delayed report worth knowing about for intraday timing reconstruction. Everything else is the standard graded flow, with conviction labels explaining what the engine thinks of each row.
