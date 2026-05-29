import { test, expect } from "../../fixtures/auth"
import { ScannerPage } from "../../pages/ScannerPage"

// Unique per-run prefix so concurrent runs / re-runs don't collide on the same
// account. afterEach does best-effort cleanup; if a test crashes mid-way, the
// next run with a new prefix won't see the orphan.
const TEST_PREFIX = `pwtest-${Date.now()}`
const presetName = (label: string) => `${TEST_PREFIX}-${label}`

test.describe("Scanner save-filter", () => {
  test.afterEach(async ({ loggedInPage: page }) => {
    // Best-effort: delete any presets carrying our prefix. Errors swallowed.
    try {
      const scanner = new ScannerPage(page)
      await scanner.goto()
      await scanner.expectLoaded()
      await scanner.filtersButton.click()
      await expect(page.getByPlaceholder(/preset name/i)).toBeVisible({ timeout: 5_000 })
      // Loop: delete rows until none with our prefix remain
      for (let i = 0; i < 10; i++) {
        const row = page.locator(`div:has(> div:has-text("${TEST_PREFIX}"))`).first()
        if (!(await row.isVisible().catch(() => false))) break
        await row.getByRole("button", { name: /^delete$/i }).click()
        await page.waitForTimeout(150)
      }
    } catch {
      // ignore — cleanup is best-effort
    }
  })

  test("1. Filters dialog shows save input + button", async ({ loggedInPage: page }) => {
    const scanner = new ScannerPage(page)
    await scanner.goto()
    await scanner.expectLoaded()
    await scanner.filtersButton.click()
    await expect(page.getByPlaceholder(/preset name/i)).toBeVisible()
    await expect(page.getByRole("button", { name: /^save$/i })).toBeVisible()
  })

  test("2. Save a preset → appears in Saved presets list", async ({ loggedInPage: page }) => {
    const scanner = new ScannerPage(page)
    await scanner.goto()
    await scanner.expectLoaded()
    await scanner.filtersButton.click()
    const name = presetName("save")
    await page.getByPlaceholder(/preset name/i).fill(name)
    await page.getByRole("button", { name: /^save$/i }).click()
    await expect(page.locator(`text=${name}`)).toBeVisible()
    // The "Saved presets" section header should be present (also asserted by smoke.spec)
    await expect(page.locator("text=/saved presets/i")).toBeVisible()
  })

  test("3. Load preset reapplies filters", async ({ loggedInPage: page }) => {
    const scanner = new ScannerPage(page)
    await scanner.goto()
    await scanner.expectLoaded()
    await scanner.filtersButton.click()
    // Set Direction = Calls
    await page.getByRole("button", { name: /direction/i }).click()
    await page.getByRole("radio", { name: /^calls$/i }).click()
    // Confirm pill flipped
    await expect(page.getByRole("button", { name: /direction.*calls/i })).toBeVisible()
    // Save it
    const name = presetName("load")
    await page.getByPlaceholder(/preset name/i).fill(name)
    await page.getByRole("button", { name: /^save$/i }).click()
    await expect(page.locator(`text=${name}`)).toBeVisible()
    // Reset all filters
    await page.getByRole("button", { name: /reset all filters/i }).click()
    await expect(page.getByRole("button", { name: /direction.*both/i })).toBeVisible()
    // Load the preset back — find the Load button in the row whose label matches our preset name
    const row = page.locator(`div:has(> div:has-text("${name}"))`).first()
    await row.getByRole("button", { name: /^load$/i }).click()
    // Pill back to Calls
    await expect(page.getByRole("button", { name: /direction.*calls/i })).toBeVisible()
  })

  test("4. Delete preset removes it from the list", async ({ loggedInPage: page }) => {
    const scanner = new ScannerPage(page)
    await scanner.goto()
    await scanner.expectLoaded()
    await scanner.filtersButton.click()
    const name = presetName("delete")
    await page.getByPlaceholder(/preset name/i).fill(name)
    await page.getByRole("button", { name: /^save$/i }).click()
    await expect(page.locator(`text=${name}`)).toBeVisible()
    const row = page.locator(`div:has(> div:has-text("${name}"))`).first()
    await row.getByRole("button", { name: /^delete$/i }).click()
    await expect(page.locator(`text=${name}`)).not.toBeVisible()
  })

  test("5. Preset persists across page reload (localStorage hydration)", async ({ loggedInPage: page }) => {
    const scanner = new ScannerPage(page)
    await scanner.goto()
    await scanner.expectLoaded()
    await scanner.filtersButton.click()
    const name = presetName("persist")
    await page.getByPlaceholder(/preset name/i).fill(name)
    await page.getByRole("button", { name: /^save$/i }).click()
    await expect(page.locator(`text=${name}`)).toBeVisible()
    // Reload — session cookie persists, localStorage persists, server sync should hydrate
    await page.reload()
    await scanner.expectLoaded()
    await scanner.filtersButton.click()
    await expect(page.locator(`text=${name}`)).toBeVisible()
  })

  test("6. Empty / whitespace name disables Save", async ({ loggedInPage: page }) => {
    const scanner = new ScannerPage(page)
    await scanner.goto()
    await scanner.expectLoaded()
    await scanner.filtersButton.click()
    const input = page.getByPlaceholder(/preset name/i)
    const saveButton = page.getByRole("button", { name: /^save$/i })
    // Empty input → disabled
    await expect(saveButton).toBeDisabled()
    // Whitespace only → still disabled (.trim() guard)
    await input.fill("   ")
    await expect(saveButton).toBeDisabled()
    // Real content → enabled
    await input.fill(presetName("disable"))
    await expect(saveButton).toBeEnabled()
  })
})
