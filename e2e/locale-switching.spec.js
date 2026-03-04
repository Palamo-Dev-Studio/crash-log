// ABOUTME: E2E tests for locale switching behavior.
// ABOUTME: Validates language toggle switches locale and persists across navigation.

import { test, expect } from "@playwright/test";

test.describe("Locale switching", () => {
  test("toggle switches EN to ES", async ({ page }) => {
    await page.goto("/en");
    await page.click("button:has-text('ES')");
    await page.waitForURL("**/es");
    expect(page.url()).toContain("/es");
  });

  test("toggle switches ES to EN", async ({ page }) => {
    await page.goto("/es");
    await page.click("button:has-text('EN')");
    await page.waitForURL("**/en");
    expect(page.url()).toContain("/en");
  });

  test("locale persists across navigation via cookie", async ({ page }) => {
    await page.goto("/en");
    // Switch to ES
    await page.click("button:has-text('ES')");
    await page.waitForURL("**/es");
    // Navigate to archive
    await page.click("text=Archive");
    await page.waitForURL("**/es/archive");
    expect(page.url()).toContain("/es/archive");
  });
});
