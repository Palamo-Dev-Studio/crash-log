// ABOUTME: E2E tests for the site-wide donation prompt above the footer and its /support exclusion.
// ABOUTME: Needs NEXT_PUBLIC_DONATIONS_ENABLED=true, which the dev server reads from .env.local.

import { test, expect } from "@playwright/test";

const prompt = (page, name = "Donate") =>
  page.getByLabel(name, { exact: true });

test.describe("donation prompt", () => {
  test("shows on the home page above the footer", async ({ page }) => {
    await page.goto("/en");
    await expect(prompt(page)).toBeVisible();
    await expect(prompt(page)).toContainText("Support the Log");
    const order = await page.evaluate(() => {
      const card = document.querySelector('section[aria-label="Donate"]');
      const foot = document.querySelector("footer");
      return card.compareDocumentPosition(foot);
    });
    // DOCUMENT_POSITION_FOLLOWING (4): the footer comes after the prompt.
    expect(order & 4).toBe(4);
  });

  test("shows on a Spanish archive page", async ({ page }) => {
    await page.goto("/es/archive");
    await expect(prompt(page, "Donar")).toBeVisible();
  });

  test("shows on an issue page", async ({ page }) => {
    await page.goto("/en/archive");
    const issue = await page
      .locator('a[href*="/issue/"]')
      .first()
      .getAttribute("href");
    await page.goto(issue);
    await expect(prompt(page)).toBeVisible();
  });

  test("is absent on the support page, which is the donation page", async ({
    page,
  }) => {
    await page.goto("/en/support");
    await expect(page.locator("footer")).toBeVisible();
    await expect(page.locator('section[aria-label="Donate"]')).toHaveCount(0);
  });

  test("has no horizontal overflow at 360px", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto("/en");
    await expect(prompt(page)).toBeVisible();
    const width = await page.evaluate(
      () => document.documentElement.scrollWidth
    );
    expect(width).toBeLessThanOrEqual(360);
  });
});
