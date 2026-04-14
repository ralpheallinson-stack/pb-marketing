import { test, expect } from "../../fixtures/auth"

test.describe("Logout", () => {
  test("logs out from scanner and blocks protected routes", async ({ loggedInPage: page }) => {
    await page.goto("/scanner")
    // Account link sits in the header
    await page.getByRole("link", { name: /logout/i }).first().click()
    await page.waitForURL(/\/(login|$)/)

    // Session should be cleared — scanner now bounces
    await page.goto("/scanner")
    await expect(page).toHaveURL(/\/login/)
  })

  test("logout invalidates session cookie", async ({ loggedInPage: page, context }) => {
    await page.goto("/scanner")
    const before = await context.cookies()
    const sessionBefore = before.find(c => /session|sid/i.test(c.name))
    expect(sessionBefore).toBeDefined()

    await page.getByRole("link", { name: /logout/i }).first().click()
    await page.waitForURL(/\/(login|$)/)

    const after = await context.cookies()
    const sessionAfter = after.find(c => c.name === sessionBefore!.name)
    // Cookie either cleared or rotated to a new anonymous value
    expect(sessionAfter?.value ?? "").not.toBe(sessionBefore!.value)
  })
})
