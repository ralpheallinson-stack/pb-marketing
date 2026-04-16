---
title: "Options Flow Signals Explained: What Grade A, B, and C Mean"
description: "Understanding conviction grades in options flow trading — how AI analyzes sweep size, delta, DTE, volume ratios, and accumulation to separate high-probability setups from noise."
date: "2026-02-12"
author: "Profit Builders"
read_time: "8"
---

## The Signal-to-Noise Problem in Options Flow

On any given trading day, millions of options contracts change hands across U.S. exchanges. Tens of thousands of individual orders hit the tape — block trades, sweeps, spreads, hedges, rolls, and closing positions all mixed together in one undifferentiated stream. If you have ever tried to trade by watching a raw options flow feed, you already know the problem: **most of it is noise**.

A portfolio manager selling covered calls against a long equity position looks identical to a directional bet at first glance. A market maker adjusting their book generates volume that has nothing to do with informed speculation. An institution rolling an expiring position into the next month creates the appearance of heavy activity on a name — but carries no new directional information at all.

The traders who consistently extract profit from options flow are not the ones watching the most data. They are the ones who have built a systematic framework for deciding which orders matter and which ones to ignore entirely.

That is the problem conviction grading solves.

## Why Grading Matters

Not all flow is created equal. A $2 million sweep on short-dated SPY calls during a pullback tells a fundamentally different story than a $2 million passive fill on deep ITM puts that turns out to be someone closing a hedge. Both show up as large-premium trades. Only one represents an actionable signal.

Without a grading system, traders are left relying on gut instinct and pattern recognition under pressure — exactly the conditions where cognitive biases cause the most damage. You anchor to the biggest number you see. You chase the ticker that just moved. You overtrade because everything looks like a signal when you have no filter.

**A conviction grading system replaces subjective judgment with repeatable, quantifiable analysis.** Every order gets scored against the same criteria. Every signal that reaches you has already passed through a multi-factor evaluation designed to separate informed institutional activity from background noise.

The result is fewer signals, higher quality, and a clear framework for position sizing.

## What Goes Into a Conviction Grade

Our grading engine evaluates six weighted factors for every options order that crosses the tape. Each factor captures a different dimension of what makes institutional flow meaningful. Here is what the system measures and why each factor matters.

### Premium Size

**The dollar amount of the trade is the most intuitive measure of conviction.** When an institution commits $1 million or more to a single options position, they have done their homework. The research budgets, analyst teams, and risk committees behind that capital allocation represent an information advantage that retail traders rarely possess on their own.

Larger premium does not automatically mean a better trade — but it does mean someone with significant resources decided this was worth the risk. The grading system rewards outsized premium relative to normal activity on that name, not just raw dollar amounts. A $500K order on a mid-cap biotech with thin options volume carries more weight than the same premium on AAPL, where that size is routine.

### Sweep vs. Passive Execution

**How an order is filled reveals as much as what was ordered.** A sweep is an aggressive order type that hits multiple exchanges simultaneously to get filled as fast as possible, often lifting through several ask prices. The trader is paying up for speed because they believe timing matters — they expect the underlying to move soon.

Contrast this with a passive fill, where the order sits on the bid and waits to get filled. Passive orders suggest the trader is patient, price-sensitive, and in no particular hurry. That is perfectly rational behavior for hedging or income strategies, but it does not signal the kind of urgency that precedes sharp directional moves.

The grading system treats aggressive sweeps as a strong positive signal and downgrades passive fills significantly. In some cases, passive fills on ITM options trigger an automatic PASS grade regardless of other factors.

### [Volume-to-Open Interest Ratio](/blog/vol-oi-ratio-explained)

**When daily volume on a specific contract dramatically exceeds existing open interest, new positions are being opened.** This is one of the most reliable indicators that the activity represents fresh directional conviction rather than position management.

A contract with 200 open interest that trades 2,000 contracts in a single session is telling a clear story: multiple participants are initiating new positions at this strike and expiration. If that volume merely matched existing open interest, it could easily represent closing activity or rolls.

The grading system measures this ratio and rewards signals where volume significantly outpaces open interest, indicating genuine new positioning.

### Delta

**The delta of the options contract tells you how far out-of-the-money the trade is — and that directly reflects the risk-reward profile the institution is targeting.**

An order on a 0.30 delta call is a bet on a meaningful move higher. The trader is accepting a lower probability of profit in exchange for greater leverage. When large capital makes that choice aggressively, it suggests strong directional conviction.

Conversely, deep in-the-money options with deltas above 0.80 behave almost like stock. They are frequently used for hedging, covered strategies, or synthetic positions that carry little directional signal. The grading system rewards positions in the OTM-to-ATM range where the risk-reward trade-off implies genuine speculation, not portfolio maintenance.

### Days to Expiration (DTE)

**Shorter-dated options carry more urgency.** When an institution buys weekly or near-term options, they are making a time-sensitive bet. They expect the move to happen soon — within days or weeks, not months. That urgency is informative.

Extremely short DTE (under 3 days) can sometimes indicate gamma scalping or event hedging rather than directional bets, so the system does not blindly reward the shortest expirations. The sweet spot is typically in the 5-to-45-day range, where the trader is paying meaningful theta but still expects a relatively near-term catalyst.

Long-dated LEAPS, while potentially representing strong fundamental conviction, generate signals that are harder to trade around and receive a more moderate score on this factor.

### Accumulation

**One large order could be anything. The same strike getting hit three, four, or five times in a session is a pattern.**

Accumulation occurs when multiple separate orders target the same symbol, strike price, and expiration over a period of time. This is one of the strongest indicators of informed institutional activity because it suggests multiple participants — or the same participant building a position in pieces to avoid detection — all converging on the same trade.

The grading system tracks [accumulation](/blog/what-is-options-accumulation) hits and premium totals across orders. When a specific contract shows repeated aggressive activity, the conviction score rises substantially. Three or more hits on the same strike with meaningful premium behind each one is one of the hallmarks of a high-grade signal.

## Grade A: Highest Conviction

A **Grade A** signal scores at or above the 80th percentile across the combined weighted factors. In practice, this means the order checks nearly every box:

- **Large premium** — well above average for the name
- **Aggressive sweep execution** — the trader paid up to get filled immediately
- **High volume/OI ratio** — new positions are clearly being opened
- **OTM-to-ATM delta range** — a genuine directional bet, not a hedge
- **Reasonable DTE** — urgency without being a pure lottery ticket
- **Accumulation** — not a one-off; the strike has been hit multiple times

Grade A signals are rare by design. On a typical trading day, the system may produce only a handful across the entire market. That scarcity is the point. These are the setups where multiple independent indicators of institutional conviction align simultaneously.

Historically, **Grade A signals have delivered a win rate above 42%** — and because the average winner in leveraged options significantly outpaces the average loser when entries are well-timed, the overall expectancy is meaningfully positive.

## Grade B: Solid Conviction

A **Grade B** signal scores between the 65th and 80th percentile. These are strong signals that are missing one or two factors that would push them to the top tier.

Common Grade B profiles include:

- Large sweep with strong volume/OI, but the DTE is longer than ideal
- Aggressive fill with good delta positioning, but no accumulation yet (first hit on the strike)
- Solid premium and accumulation, but the volume/OI ratio is moderate rather than exceptional

Grade B signals are **actionable and worth trading**, but the incomplete picture calls for more conservative position sizing. Many of the system's best trades start as Grade B signals that later see follow-through activity confirming the initial thesis.

## Grade C: Moderate Conviction

A **Grade C** signal scores between the 45th and 65th percentile. These orders show enough characteristics of informed flow to warrant attention, but several factors are working against a strong conviction read.

Typical Grade C scenarios:

- Decent premium but passive execution — the urgency is not there
- Aggressive sweep but on a relatively small dollar amount
- Good positioning but low volume/OI, making it unclear if these are new or existing positions

Grade C signals are best treated as **watchlist candidates** rather than immediate trade entries. They can serve as confirmation when combined with your own technical or fundamental analysis, but they should not be the sole basis for committing capital.

## PASS: Filtered Out

Signals that score below the 45th percentile receive a **PASS** grade and are filtered from the standard alert feed entirely. These include:

- **Closing positions** — the trader is exiting, not entering. No new information about future direction.
- **ITM passive fills** — deep in-the-money options filled passively are almost always hedging or portfolio adjustment activity.
- **Low volume/OI with passive execution** — no urgency, no indication of new positioning.

PASS-grade orders are not necessarily bad trades — they simply do not carry enough evidence of informed directional conviction to warrant an alert. The system still logs high-premium PASS signals for internal analysis, but they are deliberately kept out of the alert stream to protect signal quality.

## How to Use Grades in Your Trading

The grading system gives you a built-in framework for **position sizing and risk management**:

**Grade A — Full position size.** These are your highest-conviction entries. Define what a full position means for your account size and risk tolerance, and deploy it here. Grade A signals justify your standard maximum allocation for a single options trade.

**Grade B — Half position size.** The signal is solid but incomplete. Reduce your exposure accordingly. You can always add to the position if follow-through activity upgrades the conviction picture, but starting smaller protects you when the missing factors turn out to matter.

**Grade C — Paper trade or minimal size.** Use these signals as learning opportunities. Track them in a journal. See how they resolve. Over time, you will develop an intuition for which Grade C signals in specific setups tend to outperform. Until you have that data, keep real capital exposure minimal.

**PASS — No action.** Trust the filter. The temptation to override the system and trade a PASS-grade signal because "it feels right" is exactly the kind of subjective decision-making the grading system is designed to eliminate.

## The Discipline Advantage

The real edge in flow trading is not access to data — that has been commoditized. The edge is in **systematic filtering and disciplined execution**. A conviction grading system removes the most dangerous variable in trading: inconsistent human judgment under pressure.

When you know that every Grade A signal has been evaluated against six independent factors, weighted and scored without emotion, you can act with confidence. When you know that every PASS-grade signal has been filtered for a reason, you can ignore it without second-guessing yourself.

Over hundreds of trades, that consistency compounds. Fewer impulsive entries. Better position sizing. More capital allocated to the setups that actually have an edge. That is how a grading system translates into real P&L improvement — not by finding a magic indicator, but by enforcing the discipline that separates profitable traders from everyone else.


---

## Related Reading

- [How to Read Unusual Options Activity](/blog/how-to-read-unusual-options-activity)
- [Sweep vs Block vs Dark Pool](/blog/sweep-vs-block-vs-dark-pool)
- [5 Signals That Looked Great and Went Nowhere](/blog/5-signals-that-looked-great-went-nowhere)
