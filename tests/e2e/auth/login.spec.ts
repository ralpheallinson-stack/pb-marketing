import { test, expect, login } from "../../fixtures/auth"

test.describe("Login", () => {
  test("blocks empty submit with validation", async ({ page }) => {
    await page.goto("/login")
    await page.getByRole("button", { name: /log in|sign in/i }).click()
    await expect(page).toHaveURL(/\/login/)
  })

  test("rejects invalid credentials", async ({ page }) => {
    await page.goto("/login")
    await page.getByLabel(/email/i).fill("not-a-user@example.com")
    await page.getByLabel(/password/i).fill("wrong-password-xyz")
    await page.getByRole("button", { name: /log in|sign in/i }).click()
    // Stays on /login and surfaces an error (adjust selector if copy differs)
    await expect(page).toHaveURL(/\/login/)
    await expect(page.locator("text=/invalid|incorrect|unauthorized/i")).toBeVisible({ timeout: 10_000 })
  })

  test("logs in with valid subscriber credentials", async ({ page }) => {
    test.skip(!process.env.E2E_EMAIL, "E2E_EMAIL not set")
    await login(page, process.env.E2E_EMAIL!, process.env.E2E_PASSWORD!)
    await expect(page).toHaveURL(/\/(scanner|account|$)/)
  })

  test("redirects /scanner to /login when unauthenticated", async ({ page }) => {
    await page.goto("/scanner")
    await expect(page).toHaveURL(/\/login/)
  })
})
