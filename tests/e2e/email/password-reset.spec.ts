import { test, expect } from "@playwright/test"

/**
 * Verifies the reset *request* path. Actual email delivery is covered by the
 * email-ops skill (evidence-first mailbox check, not part of Playwright).
 */
test.describe("Password reset request", () => {
  test("valid email gets success confirmation", async ({ page }) => {
    test.skip(!process.env.E2E_RESET_EMAIL, "E2E_RESET_EMAIL not set")
    await page.goto("/login")
    await page.getByRole("link", { name: /forgot|reset/i }).click()
    await page.getByLabel(/email/i).fill(process.env.E2E_RESET_EMAIL!)
    await page.getByRole("button", { name: /send|reset|submit/i }).click()
    await expect(page.locator("text=/check your (email|inbox)|sent|success/i")).toBeVisible({ timeout: 10_000 })
  })

  test("invalid email format surfaces validation", async ({ page }) => {
    await page.goto("/login")
    await page.getByRole("link", { name: /forgot|reset/i }).click()
    await page.getByLabel(/email/i).fill("not-an-email")
    await page.getByRole("button", { name: /send|reset|submit/i }).click()
    // Native browser validation or server-side — either way, no success copy
    await expect(page.locator("text=/sent|success/i")).toHaveCount(0)
  })

  test("non-existent email does not leak user existence", async ({ page }) => {
    await page.goto("/login")
    await page.getByRole("link", { name: /forgot|reset/i }).click()
    await page.getByLabel(/email/i).fill("definitely-not-a-user-xyz@example.com")
    await page.getByRole("button", { name: /send|reset|submit/i }).click()
    // Should still show generic "if the email exists, we sent a link" — NOT "no such user"
    await expect(page.locator("text=/no such|does not exist|not found/i")).toHaveCount(0)
  })
})
