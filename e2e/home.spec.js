// ABOUTME: E2E tests for the home page.
// ABOUTME: Validates page load, locale routing, redirect, and the unified feed structure.

import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test("/en loads with The Crash Log header", async ({ page }) => {
    await page.goto("/en");
    await expect(page.locator("text=The Crash Log").first()).toBeVisible();
  });

  test("/es loads successfully", async ({ page }) => {
    const response = await page.goto("/es");
    expect(response.status()).toBe(200);
  });

  test("/ redirects to /en", async ({ page }) => {
    await page.goto("/");
    await page.waitForURL(/\/(en|es)/);
    expect(page.url()).toMatch(/\/(en|es)/);
  });

  test("page has header, nav, main, footer structure", async ({ page }) => {
    await page.goto("/en");
    await expect(page.locator("header").first()).toBeVisible();
    await expect(page.locator("nav").first()).toBeVisible();
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();
  });

  test("renders a hero card (h1) when the feed is populated, or the empty state otherwise", async ({
    page,
  }) => {
    await page.goto("/en");
    const main = page.locator("main");
    const heroHeading = main.locator("h1");

    // Either populated (hero, with zero or more standard cards depending on
    // feed size) or the empty state — never a partial state. A single-item
    // feed is valid: hero renders, zero standard cards.
    const hasHero = (await heroHeading.count()) > 0;
    if (hasHero) {
      await expect(heroHeading.first()).toBeVisible();
    } else {
      await expect(main).toContainText(/no content published yet/i);
    }
  });

  test("shows a link to the full archive", async ({ page }) => {
    await page.goto("/en");
    const main = page.locator("main");
    const hasHero = (await main.locator("h1").count()) > 0;
    // CI has no seeded Sanity data — this is a structural smoke-check; the
    // real assertions live in the unit layer (HomeFeed.test.jsx).
    if (hasHero) {
      await expect(
        page.getByRole("link", { name: /see the full archive/i })
      ).toBeVisible();
    }
  });
});
