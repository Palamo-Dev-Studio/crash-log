// ABOUTME: E2E tests for graceful empty states.
// ABOUTME: Validates that pages handle missing content gracefully.

import { test, expect } from "@playwright/test";

test.describe("Empty states", () => {
  test("archive page loads without errors", async ({ page }) => {
    const response = await page.goto("/en/archive");
    expect(response.status()).toBe(200);
  });

  test("beats page loads without errors", async ({ page }) => {
    const response = await page.goto("/en/beats");
    expect(response.status()).toBe(200);
  });
});
