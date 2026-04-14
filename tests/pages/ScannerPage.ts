import { Page, Locator, expect } from "@playwright/test"

export class ScannerPage {
  readonly page: Page
  readonly searchInput: Locator
  readonly filtersButton: Locator
  readonly flowTable: Locator
  readonly rows: Locator
  readonly sidebarFlow: Locator
  readonly sidebarGex: Locator
  readonly sidebarWatch: Locator
  readonly sidebarFilters: Locator
  readonly marketStatus: Locator
  readonly trialBanner: Locator

  constructor(page: Page) {
    this.page = page
    this.searchInput = page.getByPlaceholder(/search ticker/i)
    this.filtersButton = page.getByRole("button", { name: /^filters/i }).first()
    this.flowTable = page.locator("table").first()
    this.rows = page.locator("tbody tr")
    this.sidebarFlow = page.getByTitle("Flow Scanner")
    this.sidebarGex = page.locator('button[title*="GEX"], button[title*="Upgrade for GEX"]').first()
    this.sidebarWatch = page.getByTitle("Watchlist")
    this.sidebarFilters = page.getByTitle("Filters")
    this.marketStatus = page.locator('div[title*="Market"]')
    this.trialBanner = page.locator("text=/free trial/i")
  }

  async goto() {
    await this.page.goto("/scanner")
    await this.page.waitForLoadState("networkidle")
  }

  async search(sym: string) {
    await this.searchInput.fill(sym)
    await this.searchInput.press("Enter")
  }

  async clearSearch() {
    await this.searchInput.press("Escape")
  }

  async expectLoaded() {
    await expect(this.flowTable).toBeVisible({ timeout: 15_000 })
  }
}
