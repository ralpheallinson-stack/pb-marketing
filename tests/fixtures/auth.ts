import { test as base, expect, Page } from "@playwright/test"

/**
 * Credentials pulled from env so secrets never live in the repo.
 *   E2E_EMAIL              — test subscriber email (active tier)
 *   E2E_PASSWORD           — password for E2E_EMAIL
 *   E2E_TRIAL_EMAIL        — account currently in trial (days_remaining > 0)
 *   E2E_TRIAL_PASSWORD
 *   E2E_EXPIRED_EMAIL      — account whose subscription status is expired
 *   E2E_EXPIRED_PASSWORD
 */
type AuthFixtures = {
  loggedInPage: Page
  trialPage: Page
}

export const test = base.extend<AuthFixtures>({
  loggedInPage: async ({ page }, use) => {
    await login(page, process.env.E2E_EMAIL!, process.env.E2E_PASSWORD!)
    await use(page)
  },
  trialPage: async ({ page }, use) => {
    await login(page, process.env.E2E_TRIAL_EMAIL!, process.env.E2E_TRIAL_PASSWORD!)
    await use(page)
  },
})

export { expect }

export async function login(page: Page, email: string, password: string) {
  await page.goto("/login")
  await page.getByLabel(/email/i).fill(email)
  await page.getByLabel(/password/i).fill(password)
  await Promise.all([
    page.waitForURL(url => !url.pathname.includes("/login"), { timeout: 15_000 }),
    page.getByRole("button", { name: /log in|sign in/i }).click(),
  ])
}
