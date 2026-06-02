---
title: "Cleaner Scanner Signals: Tighter Institutional Thresholds"
description: "We tightened how the scanner highlights institutional flow. Purple and yellow rows now reflect explicit, auditable open-interest and premium thresholds — no black box."
date: "2026-06-01"
author: "Profit Builders"
read_time: "3"
meta_title: "Scanner Update: Tighter Institutional Flow Thresholds | Profit Builders"
meta_description: "Purple and yellow scanner rows now require sweeps that exceed the day's open interest with explicit premium floors. Here's exactly how the new color logic works."
---

Today's update tightens how the scanner highlights institutional flow. The scanner looks the same — same purple, yellow, and uncolored rows — but the logic underneath is tighter, more honest, and fully auditable.

## What changed

**Purple rows** now mark contracts where **two or more sweep trades have each exceeded the day's open interest**, with combined qualifying premium of at least **$250,000**. A purple row is no longer a single data point — it's multiple institutional sweeps stacking into the same contract on the same day. Real, repeated commitment.

**Yellow rows** now mark a **single sweep that exceeded the day's open interest** and cleared a **$50,000 premium floor**. That size floor is the important part: it blocks small, retail-sized prints from coloring yellow on thin, low-open-interest contracts — the exact noise that makes most flow tools hard to trust.

**Orange "late" tinting** is gone from the row color. Late prints still surface, just not as a full-row tint that competes with the signals that matter.

## Why a sweep "exceeding open interest" matters

Open interest is how many contracts are already outstanding at a strike. When a single sweep trades *more* contracts than the entire existing open interest, that's new positioning being built in real time — not someone trading against an existing book. Requiring that exceedance, plus a real premium floor, plus (for purple) repeated sweeps, means every colored row clears a bar you can actually reason about.

## The thresholds, in the open

Most scanners won't tell you why a row lit up. Here's ours, in full:

- **Qualifying sweep:** trade type is a sweep, contracts traded exceed the day's open interest, and premium is at least **$50,000**.
- **Yellow:** exactly one qualifying sweep on the contract today.
- **Purple:** two or more qualifying sweeps today, with combined qualifying premium of at least **$250,000**.
- **No color:** everything else.

No hidden weighting. No proprietary score deciding the color behind the curtain.

## What's next

The upcoming Apex tier will show the full reasoning behind every colored row — which specific sweeps qualified, premium per trade, the open-interest exceedance ratio, and historical outcomes for matching profiles. The colors tell you *where* to look; Apex will tell you *why*.
