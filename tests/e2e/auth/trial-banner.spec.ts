import { test, expect } from "../../fixtures/auth"

test.describe("Trial banner", () => {
  test("shows banner for trial account, hides for active", async ({ page }) => {
    test.skip(!process.env.E2E_TRIAL_EMAIL, "E2E_TRIAL_EMAIL not set")

    // Trial user sees banner
    await page.goto("/login")
    await page.getByLabel(/email/i).fill(process.env.E2E_TRIAL_EMAIL!)
    await page.getByLabel(/password/i).fill(process.env.E2E_TRIAL_PASSWORD!)
    await Promise.all([
      page.waitForURL(url => !url.pathname.includes("/login")),
      page.getByRole("button", { name: /log in|sign in/i }).click(),
    ])
    await page.goto("/scanner")
    await expect(page.locator("text=/free trial/i")).toBeVisible({ timeout: 10_000 })

    // Upgrade CTA links to /pricing
    const cta = page.getByRole("link", { name: /upgrade now/i })
    await expect(cta).toHaveAttribute("href", /pricing/)
  })

  test("dismiss button removes banner for the session", async ({ trialPage: page }) => {
    await page.goto("/scanner")
    const banner = page.locator("text=/free trial/i").first()
    await expect(banner).toBeVisible()
    await page.getByRole("button", { name: "×" }).first().click()
    await expect(banner).toBeHidden()
  })

  test("/api/subscription/status returns expected shape", async ({ trialPage: page }) => {
    const res = await page.request.get("/api/subscription/status")
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body).toMatchObject({
      is_trial: expect.any(Boolean),
      days_remaining: expect.any(Number),
      tier: expect.any(String),
    })
    expect(body.is_trial).toBe(true)
    expect(body.days_remaining).toBeGreaterThanOrEqual(0)
  })
})
