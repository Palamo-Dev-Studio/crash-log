// ABOUTME: E2E tests for Nico's Notes column pages.
// ABOUTME: Validates archive page, navigation, locale switching, and empty states.

import { test, expect } from "@playwright/test";

test.describe("Nico's Notes", () => {
  test("archive page loads with correct heading (EN)", async ({ page }) => {
    const response = await page.goto("/en/nico");
    expect(response).not.toBeNull();
    expect(response.status()).toBe(200);
    await expect(page.locator("h1")).toContainText("NICO\u2019S NOTES");
  });

  test("archive page loads with correct heading (ES)", async ({ page }) => {
    const response = await page.goto("/es/nico");
    expect(response).not.toBeNull();
    expect(response.status()).toBe(200);
    await expect(page.locator("h1")).toContainText("NOTAS DE NICO");
  });

  test("archive page shows empty state when no columns exist", async ({
    page,
  }) => {
    await page.goto("/en/nico");
    await expect(page.locator("text=No columns published yet.")).toBeVisible();
  });

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
    await page.click("button:has-text('ES')");
    await page.waitForURL("**/es/nico");
    expect(page.url()).toContain("/es/nico");
    await expect(page.locator("h1")).toContainText("NOTAS DE NICO");
  });

  test("page has header, nav, main, footer structure", async ({ page }) => {
    await page.goto("/en/nico");
    await expect(page.locator("header").first()).toBeVisible();
    await expect(page.locator("nav").first()).toBeVisible();
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();
  });
});
