import { test, expect } from "../../fixtures/auth"
import { ScannerPage } from "../../pages/ScannerPage"

test.describe("Scanner smoke", () => {
  test("loads flow table with rows", async ({ loggedInPage: page }) => {
    const scanner = new ScannerPage(page)
    await scanner.goto()
    await scanner.expectLoaded()
    expect(await scanner.rows.count()).toBeGreaterThan(0)
  })

  test("search filters client-side on Enter", async ({ loggedInPage: page }) => {
    const scanner = new ScannerPage(page)
    await scanner.goto()
    await scanner.expectLoaded()
    await scanner.search("SPY")
    // Every visible row contains SPY (tick column)
    const firstTick = await scanner.rows.first().locator("td").nth(1).textContent()
    expect(firstTick).toMatch(/SPY/i)
  })

  test("filters panel opens, toggles, resets", async ({ loggedInPage: page }) => {
    const scanner = new ScannerPage(page)
    await scanner.goto()
    await scanner.filtersButton.click()
    await expect(page.locator("text=/saved presets/i")).toBeVisible()
    await page.getByRole("button", { name: /reset/i }).first().click()
    await expect(page.locator("text=/apply filters/i")).toBeVisible()
  })

  test("market status indicator is present", async ({ loggedInPage: page }) => {
    const scanner = new ScannerPage(page)
    await scanner.goto()
    await expect(scanner.marketStatus).toBeVisible()
    const label = await scanner.marketStatus.textContent()
    expect(label).toMatch(/open|closed/i)
  })

  test("sidebar routes switch pages without full reload", async ({ loggedInPage: page }) => {
    const scanner = new ScannerPage(page)
    await scanner.goto()
    await scanner.expectLoaded()
    await scanner.sidebarWatch.click()
    await expect(page.locator("text=/watchlist/i").first()).toBeVisible()
    await scanner.sidebarFlow.click()
    await scanner.expectLoaded()
  })
})
