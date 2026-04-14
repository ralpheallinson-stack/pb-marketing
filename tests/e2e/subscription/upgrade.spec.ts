import { test, expect } from "../../fixtures/auth"

/**
 * Stops at the Stripe-hosted checkout page — NEVER completes a real charge.
 * To complete the flow end-to-end, point the backend at Stripe test mode
 * and run with process.env.STRIPE_TEST_MODE=1 (extend this spec then).
 */
test.describe("Upgrade / pricing", () => {
  test("pricing page lists all tiers with CTAs", async ({ page }) => {
    await page.goto("/pricing")
    await expect(page).toHaveTitle(/pricing|profit builders/i)
    const cards = page.locator('[class*="pricing"], [data-testid="plan-card"]')
    // At least the core tiers — premium, heatmap, pro_bundle
    expect(await cards.count()).toBeGreaterThanOrEqual(2)
    await expect(page.getByRole("button", { name: /start|upgrade|subscribe/i }).first()).toBeVisible()
  })

  test("trial user clicking Upgrade lands on Stripe checkout", async ({ trialPage: page }) => {
    await page.goto("/pricing")
    const upgradeBtn = page.getByRole("button", { name: /upgrade|subscribe|start/i }).first()

    const [checkoutResp] = await Promise.all([
      page.waitForResponse(r => /checkout|stripe/i.test(r.url()) && r.status() < 400, { timeout: 15_000 }),
      upgradeBtn.click(),
    ])

    // Either we get redirected to checkout.stripe.com, or the handler returns a 303 with Location
    await page.waitForURL(/(checkout\.stripe\.com|stripe|\/pricing)/, { timeout: 15_000 })
    const currentUrl = page.url()
    expect(currentUrl).toMatch(/checkout\.stripe\.com|stripe/)

    // Smoke: Stripe page renders a card element or email field
    await expect(
      page.locator('input[type="email"], [data-testid="card-element"], iframe[name*="card"]'),
    ).toBeVisible({ timeout: 15_000 })
  })

  test("unauthenticated upgrade click forces login first", async ({ page }) => {
    await page.goto("/pricing")
    await page.getByRole("button", { name: /upgrade|subscribe|start/i }).first().click()
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 })
  })
})
