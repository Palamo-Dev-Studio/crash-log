// ABOUTME: E2E tests for site navigation.
// ABOUTME: Validates that nav links navigate to correct pages.

import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("Archive link navigates to /en/archive", async ({ page }) => {
    await page.goto("/en");
    await page
      .locator("nav[aria-label='Sections']")
      .getByText("Archive")
      .click();
    await page.waitForURL("**/en/archive");
    expect(page.url()).toContain("/en/archive");
  });

  test("Nav no longer offers a Beats link", async ({ page }) => {
    await page.goto("/en");
    await expect(
      page.locator("nav[aria-label='Sections']").getByText("Beats")
    ).toHaveCount(0);
  });

  test("About link navigates to /en/about", async ({ page }) => {
    await page.goto("/en");
    await page.locator("nav[aria-label='Sections']").getByText("About").click();
    await page.waitForURL("**/en/about");
    expect(page.url()).toContain("/en/about");
  });

  test("Latest link navigates to home", async ({ page }) => {
    await page.goto("/en/archive");
    await page
      .locator("nav[aria-label='Sections']")
      .getByText("Latest")
      .click();
    await page.waitForURL("**/en");
    expect(page.url()).toMatch(/\/en\/?$/);
  });

  test("Wordmark links to home", async ({ page }) => {
    await page.goto("/en/archive");
    await page.locator("header").getByText("The Crash Log").click();
    await page.waitForURL("**/en");
    expect(page.url()).toMatch(/\/en\/?$/);
  });
});
