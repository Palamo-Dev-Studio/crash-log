// ABOUTME: E2E tests for site navigation.
// ABOUTME: Validates that nav links navigate to correct pages.

import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("Archive link navigates to /en/archive", async ({ page }) => {
    await page.goto("/en");
    await page.click("text=Archive");
    await page.waitForURL("**/en/archive");
    expect(page.url()).toContain("/en/archive");
  });

  test("Beats link navigates to /en/beats", async ({ page }) => {
    await page.goto("/en");
    await page.click("text=Beats");
    await page.waitForURL("**/en/beats");
    expect(page.url()).toContain("/en/beats");
  });

  test("About link navigates to /en/about", async ({ page }) => {
    await page.goto("/en");
    await page.click("text=About");
    await page.waitForURL("**/en/about");
    expect(page.url()).toContain("/en/about");
  });

  test("Latest link navigates to home", async ({ page }) => {
    await page.goto("/en/archive");
    await page.click("text=Latest");
    await page.waitForURL("**/en");
    expect(page.url()).toMatch(/\/en\/?$/);
  });

  test("Wordmark links to home", async ({ page }) => {
    await page.goto("/en/archive");
    await page.click("text=The Crash Log");
    await page.waitForURL("**/en");
    expect(page.url()).toMatch(/\/en\/?$/);
  });
});
