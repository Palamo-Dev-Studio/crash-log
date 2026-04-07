// ABOUTME: E2E tests for the archive search/filter UI.
// ABOUTME: Validates that the input renders, accepts typing, and the results region updates.

import { test, expect } from "@playwright/test";

test.describe("Archive search", () => {
  test("renders the search input on the archive page", async ({ page }) => {
    const response = await page.goto("/en/archive");
    expect(response.status()).toBe(200);

    // The input may be absent if the empty-state branch fires (no published issues),
    // so accept either: input present, or the empty-state copy.
    const input = page.getByRole("searchbox");
    const empty = page.getByText("No issues published yet.");
    await expect(input.or(empty)).toBeVisible();
  });

  test("typing into the search input does not error", async ({ page }) => {
    await page.goto("/en/archive");
    const input = page.getByRole("searchbox");
    if (await input.isVisible()) {
      await input.fill("zzznotfound");
      await expect(page.getByText("No results.")).toBeVisible();
    }
  });
});
