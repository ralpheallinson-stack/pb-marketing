---
title: "What Is Gamma Exposure (GEX)? A Trader's Guide"
description: "Learn how gamma exposure shapes stock price movement. Understand GEX, gamma walls, zero gamma levels, and how dealers hedge — with real examples from our live scanner."
date: "2026-04-04"
author: "Profit Builders"
read_time: "12"
---

*Part of [The Options Flow Guide](/blog/options-flow-guide) — our complete series on reading institutional options flow.*

If you've ever watched a stock pin to a specific strike at expiration, bounce perfectly off a round number, or suddenly accelerate through a level with no news — gamma exposure is usually the reason.

Gamma exposure (GEX) is one of the most powerful forces in modern markets, and most retail traders have never heard of it. This guide breaks down what it is, why it matters, and how to use it.

## What Is Gamma Exposure?

Gamma exposure measures the total hedging obligation that options dealers carry at each strike price. When you buy a call option from a market maker, they sell it to you and immediately hedge by buying shares of the underlying stock. As the stock price moves, they have to adjust that hedge — buying more shares as it goes up, selling as it goes down.

The rate at which they have to adjust is **gamma**. The total dollar amount of adjusting across all outstanding contracts at a given strike is **gamma exposure** (GEX).

This matters because dealer hedging creates a mechanical force on the stock price itself. It's not sentiment, not fundamentals, not technicals — it's math.

## How GEX Affects Price Movement

GEX creates two distinct regimes:

### Positive GEX (Green Zones) — Price Stalls

When net gamma exposure is positive at a strike, dealers are **long gamma**. As the stock rises, they sell shares to stay hedged. As it falls, they buy shares. They're naturally dampening movement — acting as a wall.

This is why stocks pin to high-OI strikes during expiration week. The dealer hedging [flow](/blog/how-to-read-options-flow) overwhelms directional buying and selling.

**Real-world effect:** SPY sitting at $655 with massive call open interest at the $655 strike will tend to stay near $655. Every move away gets pushed back by dealer hedging.

### Negative GEX (Red Zones) — Price Accelerates

When net gamma is negative, dealers are **short gamma**. Now their hedging works in reverse — as the stock rises, they buy more shares (chasing), and as it falls, they sell (adding pressure). They amplify movement instead of dampening it.

This is why stocks sometimes gap through levels with unusual speed. The dealer hedging is adding fuel to the move.

**Real-world effect:** If SPY drops below a level with heavy put open interest and negative GEX, dealer selling accelerates the decline. The move feeds on itself until it reaches a positive GEX zone.

## Gamma Walls: Support and Resistance From Options Data

A **gamma wall** is a strike price with unusually high open interest that creates a strong hedging force. There are two types:

### Call Walls (Resistance)

The strike with the highest call-side GEX. As the stock approaches this level from below, dealers who sold those calls are buying shares to hedge — but once the stock reaches the wall, their hedging reverses. The wall acts as a ceiling.

### Put Walls (Support)

The strike with the highest put-side GEX. As the stock drops toward this level, dealers who sold puts are selling shares to hedge — creating a floor effect.

**The range between the put wall and call wall defines the expected trading range.** When this range is tight (what we call a "squeeze"), the stock is coiled — a breakout in either direction can be explosive once it clears the wall.

## Zero Gamma: Where the Regime Flips

The **zero gamma level** is the price where net dealer gamma exposure crosses from positive to negative. Above this level, dealers dampen moves. Below it, they amplify moves.

Think of it as the dividing line between calm and chaos:

- **Spot above zero gamma:** Long gamma regime — mean reversion likely, rangebound trading
- **Spot below zero gamma:** Short gamma regime — [volatility](/blog/vol-oi-ratio-explained) expansion, trend moves accelerate

When you see a stock trading right at its zero gamma level, that's a volatility inflection point. Any catalyst can push it into the acceleration zone.

## How to Read a GEX Heatmap

A GEX heatmap shows gamma exposure across two dimensions: **strike price** (vertical) and **expiration date** (horizontal). Each cell represents the net dealer hedging obligation for that specific strike and expiry.

What to look for:

1. **Bright green cells** — high positive GEX, strong wall effect. Price stalls here.
2. **Bright red cells** — high negative GEX, acceleration zone. Price moves fast through here.
3. **The spot row** — where the stock is trading now relative to the walls.
4. **Near-term expirations** — these carry the most gamma because options decay fastest near expiry. A wall in the nearest expiry has more hedging force than one 30 days out.
5. **Total column** — aggregated GEX across all expirations for each strike. This is the net force at that level.

## GEX and 0DTE Options

Zero-days-to-expiration (0DTE) options have the highest gamma of any contracts. As expiration approaches, gamma concentrates at the at-the-money strike like a laser. This means:

- 0DTE [open interest](/blog/how-to-read-unusual-options-activity) at a strike creates massive intraday walls
- These walls form and dissolve within hours, making intraday levels shift throughout the session
- Morning gamma walls may be completely different from afternoon gamma walls

This is why intraday [sweep and block flow](/blog/how-to-read-sweep-and-block-trades) near gamma walls is particularly significant — institutions are positioning against or through these mechanical levels.

## Dollar GEX vs Raw OI

Not all open interest is created equal. A strike with 50,000 contracts of put OI sounds impressive, but if those puts are deep out-of-the-money with a gamma of 0.001, the hedging impact is negligible.

**Dollar GEX** weights open interest by actual gamma, contract multiplier, and spot price:

`Dollar GEX = gamma × OI × 100 × spot²`

This gives you the real hedging force in dollar terms. A 10,000-contract position near the money with high gamma can have more impact than 100,000 contracts far out-of-the-money.

## Practical Applications

### Pre-Trade Checklist

Before entering any options trade, check the GEX landscape:

1. **Where are the walls?** If you're buying calls and the call wall is $2 above spot, that's a headwind.
2. **What regime are we in?** Long gamma = mean reversion setups work. Short gamma = trend-following setups work.
3. **Is there a squeeze?** Tight put-call wall range + catalyst = breakout potential.
4. **Where is zero gamma?** If spot is near zero gamma, expect a regime change on any move.

### Combining GEX with Options Flow

GEX tells you where the mechanical forces are. [Options flow](/blog/what-is-options-flow-trading) tells you where institutions are betting. When both align — large aggressive sweeps at a gamma wall — the signal is strongest.

For example: if SPY has a put wall at $650 and you see $5M in aggressive put buying at that strike, institutions are betting the wall breaks. That's a high-conviction signal that combines mechanical positioning with directional intent.

### Key Metrics to Track

- **Net GEX** — overall market regime (positive = calm, negative = volatile)
- **Call wall strike** — resistance level backed by options mechanics
- **Put wall strike** — support level backed by options mechanics
- **Squeeze percentage** — distance between walls as % of spot price
- **Zero gamma level** — regime flip point
- **Wall conviction score** — strength of walls relative to historical average

## Common Misconceptions

**"GEX predicts direction."** No — GEX predicts the character of movement, not which direction. Positive GEX means rangebound. Negative GEX means trending. Direction comes from flow and fundamentals.

**"Gamma walls never break."** They break regularly. Walls define where hedging pressure is strongest, not where price can't go. A strong enough catalyst or enough flow can push through any wall.

**"GEX only matters at expiration."** GEX matters every day, but it's most powerful in the 2-3 days before expiration when gamma is highest. Mid-cycle GEX still creates meaningful levels, just with less force.

## Getting Started

Understanding GEX gives you an edge that most traders don't have. You're not guessing at support and resistance — you're reading the actual mechanical forces that move price.

The [Profit Builders gamma scanner](/#features) calculates GEX in real time across 220 symbols, with wall detection, zero gamma identification, squeeze alerts, and a full strike-level heatmap. Every level you see is backed by live options chain data from the exchange.

Pull up SPY on the heatmap tomorrow before the open. Find the nearest call wall above spot and the nearest put wall below. Watch which level holds price first — that's GEX in motion, not theory.

---

## Related Reading

- [The Options Flow Guide: Reading Institutional Flow in 2026](/blog/options-flow-guide)
- [What Is Options Flow Trading?](/blog/what-is-options-flow-trading)
- [How to Read Unusual Options Activity](/blog/how-to-read-unusual-options-activity)
- [Options Greeks for Flow Trading](/blog/options-greeks-for-flow-trading)
- [Volume/OI Ratio Explained](/blog/vol-oi-ratio-explained)
