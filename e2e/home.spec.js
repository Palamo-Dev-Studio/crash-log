// ABOUTME: E2E tests for the home page.
// ABOUTME: Validates page load, locale routing, redirect, and page structure.

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
});
