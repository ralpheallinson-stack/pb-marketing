---
title: "Scanner Color Guide: What the Row Highlights Mean"
description: "Understand the color-coded row highlights in the Profit Builders scanner — golden sweeps, whale trades, unusual activity, and market maker flags explained."
date: "2026-03-05"
author: "Profit Builders"
read_time: "3"
---

The Profit Builders scanner uses color-coded row highlights to help you instantly identify the most significant trades on the tape. Here's what each color means and why it matters.

## Gold / Yellow — Golden Sweep

**Trigger:** Sweep order + $1M+ premium + filled above the ask price

This is the rarest and highest-conviction highlight in the scanner. A golden sweep means someone routed a million-dollar-plus order across multiple exchanges and paid *more* than the best available offer to get filled. That's maximum urgency — the buyer needed the position immediately and was willing to overpay for speed.

Golden sweeps are extremely rare. Most large sweeps fill at or near the ask. Most above-ask trades are smaller. When all three conditions align — sweep execution, seven-figure premium, and above-ask aggression — it signals genuine institutional urgency.

**What to watch for:** The direction (calls vs puts) and the expiration. A golden sweep on short-dated calls is an aggressive directional bet. On longer-dated puts, it could be portfolio protection at scale.

## Orange — Whale

**Trigger:** Premium >= $10M

Any single trade with $10 million or more in premium gets an orange highlight. At this size, you're looking at major institutional positioning — hedge funds, pension funds, or bank proprietary desks. These trades are too large for most market participants and represent significant capital commitment.

**What to watch for:** Whether it's an opening or closing position. A $10M+ opening trade is a major new bet. A $10M+ closing trade is someone taking profits or cutting losses on an existing position.

## Purple — Unusual Activity

**Trigger:** Any one of these conditions:
- **Volume/OI ratio >= 20x** — Today's trading volume is 20 times the existing open interest. This means the contract is seeing explosive activity relative to its history.
- **Premium >= $5M** — Large but below the whale threshold.
- **Contracts >= 2,000** — High contract count regardless of premium (some contracts trade at low per-unit prices but represent significant notional exposure).

Purple rows flag trades where something abnormal is happening. The V/OI ratio is particularly useful — when a contract that normally trades 50 contracts a day suddenly sees 1,000, that's institutional activity that hasn't shown up in the open interest yet.

**What to watch for:** V/OI spikes on near-term expirations are often the most actionable. Check whether the aggression is at the ask (bullish intent for calls) or at the bid (bearish for puts).

## Dimmed (Lower Opacity) — Market Maker Hedge

**Trigger:** Trade flagged as a suspected market maker hedge

These rows appear at reduced opacity to visually de-emphasize them. Our market maker detection system identifies trades that are likely delta-neutral hedges rather than directional bets — for example, when a call buy and put buy on the same symbol happen within seconds at similar premium levels (a conversion or reversal).

Market maker flow is real volume, but it's not directional. These trades exist to manage risk on existing inventory, not to express a view on where the stock is going. By dimming them, the scanner keeps your focus on trades that represent genuine directional conviction.

**What to watch for:** If you're analyzing total flow for a symbol, you may want to toggle the "No MM" filter to exclude these entirely. They can skew sentiment readings if included.

## No Highlight — Standard Flow

Trades without a highlight are graded signals that passed all quality filters but don't meet the elevated thresholds above. These are still institutional-scale trades (minimum $200K premium) with confirmed direction — they just don't have the extreme size or urgency markers.

---

Understanding these highlights helps you prioritize your attention. When a gold row appears, stop and look. When the tape is full of purple, something is developing. And when rows are dimmed, the market makers are hedging — not betting.


---

## Related Reading

- [Morning Routine: First 15 Minutes](/blog/morning-routine-first-15-minutes)
- [Options Flow Signals Explained](/blog/options-flow-signals-grade-a-b-c)
- [How to Read Unusual Options Activity](/blog/how-to-read-unusual-options-activity)
