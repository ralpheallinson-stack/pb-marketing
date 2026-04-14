# ProfitBuilders E2E Tests

Playwright suite covering auth, trial banner, subscription/upgrade, password reset, and scanner smoke.

## Setup

```bash
# One-time
npm install -D @playwright/test
npx playwright install --with-deps
```

## Env vars

Put in `.env.e2e` (loaded by `dotenv -e .env.e2e --`) — never commit:

```
BASE_URL=https://profitbuilders.org          # or a staging URL

# Active paid subscriber (used by loggedInPage fixture)
E2E_EMAIL=...
E2E_PASSWORD=...

# Account currently in trial (is_trial=true, days_remaining>0)
E2E_TRIAL_EMAIL=...
E2E_TRIAL_PASSWORD=...

# Account eligible for password reset
E2E_RESET_EMAIL=...
```

## Run

```bash
# All tests
npx playwright test

# One file
npx playwright test tests/e2e/auth/login.spec.ts

# Headed / debug
npx playwright test --headed --debug
npx playwright test --ui

# Single project
npx playwright test --project=chromium
```

## What's covered

| Area           | Spec                              | Notes |
|----------------|-----------------------------------|-------|
| Login          | auth/login.spec.ts                | validation, invalid creds, happy path, /scanner gate |
| Logout         | auth/logout.spec.ts               | redirect, session cookie cleared |
| Trial banner   | auth/trial-banner.spec.ts         | visible for trial, dismiss, API shape |
| Upgrade        | subscription/upgrade.spec.ts      | pricing CTAs, Stripe redirect (stops before payment) |
| Password reset | email/password-reset.spec.ts      | request path only — actual delivery via email-ops skill |
| Scanner smoke  | scanner/smoke.spec.ts             | table loads, search, filters panel, sidebar nav, market status |

## Out of scope here

- **Real Stripe charges** — checkout spec stops at the hosted Stripe page. For full payment coverage, switch backend to Stripe test mode and extend `subscription/upgrade.spec.ts` with test card `4242 4242 4242 4242`.
- **Email delivery verification** — use the `email-ops` skill to confirm receipts / reset links actually land.
- **Load / perf** — separate concern.
