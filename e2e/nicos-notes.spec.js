// ABOUTME: E2E tests for Nico's Notes column pages.
// ABOUTME: Validates archive page, navigation, locale switching, and empty states.

import { test, expect } from "@playwright/test";

test.describe("Nico's Notes", () => {
  test("archive page loads with correct heading (EN)", async ({ page }) => {
    const response = await page.goto("/en/nico");
    expect(response).not.toBeNull();
    expect(response.status()).toBe(200);
    await expect(page.locator("h1")).toHaveText("Nico\u2019s Notes");
  });

  test("archive page loads with correct heading (ES)", async ({ page }) => {
    const response = await page.goto("/es/nico");
    expect(response).not.toBeNull();
    expect(response.status()).toBe(200);
    await expect(page.locator("h1")).toHaveText("Notas de Nico");
  });

  // Requires live Sanity data (e2e is not run in CI), so an outage that returns []
  // fails here instead of passing as an empty state. The empty state itself is
  // covered by __tests__/unit/components/SeriesIndex.test.jsx.
  for (const [locale, by] of [
    ["en", "By Nico von Bot"],
    ["es", null],
  ]) {
    test(`archive lists at least one NOTE file row (${locale.toUpperCase()})`, async ({
      page,
    }) => {
      await page.goto(`/${locale}/nico`);
      const rows = page.locator(`main a[href^='/${locale}/nico/']`);
      expect(await rows.count()).toBeGreaterThan(0);
      await expect(rows.first()).toContainText(/NOTE-\d{3}/);
      if (by) await expect(rows.first()).toContainText(by);
    });
  }

  test("nav link navigates to /en/nico", async ({ page }) => {
    await page.goto("/en");
    await page.click("text=Nico\u2019s Notes");
    await page.waitForURL("**/en/nico");
    expect(page.url()).toContain("/en/nico");
  });

  test("locale toggle switches from EN to ES on archive page", async ({
    page,
  }) => {
    await page.goto("/en/nico");
    await page
      .locator("header")
      .getByRole("link", { name: "ES", exact: true })
      .click();
    await page.waitForURL("**/es/nico");
    expect(page.url()).toContain("/es/nico");
    await expect(page.locator("h1")).toHaveText("Notas de Nico");
  });

  test("page has header, nav, main, footer structure", async ({ page }) => {
    await page.goto("/en/nico");
    await expect(page.locator("header").first()).toBeVisible();
    await expect(page.locator("nav").first()).toBeVisible();
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();
  });
});
