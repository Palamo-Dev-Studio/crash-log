// ABOUTME: E2E tests for the Stripe-return thank-you toast (DonationThanks in the site layout).
// ABOUTME: Needs NEXT_PUBLIC_DONATIONS_ENABLED=true, which the dev server reads from .env.local.

import { test, expect } from "@playwright/test";

test.describe("donation thank-you toast", () => {
  test("shows on /en/support?donated=true and cleans the URL on close", async ({
    page,
  }) => {
    await page.goto("/en/support?donated=true");
    const toast = page.getByRole("status");
    await expect(toast).toContainText("Thank you for your donation!");
    await page.getByRole("button", { name: "Close" }).click();
    await expect(toast).toBeEmpty();
    await expect(page.locator("#main-content")).toBeFocused();
    await page.waitForURL((url) => !url.searchParams.has("donated"));
    expect(page.url()).toMatch(/\/en\/support$/);
  });

  test("closing does not scroll the page", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/en/support?donated=true");
    await expect(page.getByRole("status")).toContainText("Thank you");
    // Scrolled past the top of #main-content: focusing it without
    // preventScroll would pull the page back up to it.
    const before = await page.evaluate(() => {
      window.scrollTo(0, 300);
      return window.scrollY;
    });
    expect(before).toBeGreaterThan(50);
    await page.getByRole("button", { name: "Close" }).click();
    await expect(page.getByRole("status")).toBeEmpty();
    await expect(page.locator("#main-content")).toBeFocused();
    await page.waitForURL((url) => !url.searchParams.has("donated"));
    const after = await page.evaluate(() => window.scrollY);
    expect(Math.abs(after - before)).toBeLessThanOrEqual(2);
  });

  test("shows on a page that is not the support page (Spanish copy)", async ({
    page,
  }) => {
    await page.goto("/es/archive?donated=true");
    await expect(page.getByRole("status")).toContainText(
      "Gracias por tu donaci\u00f3n"
    );
  });

  test("does not show without the param", async ({ page }) => {
    await page.goto("/en/support");
    await expect(page.getByRole("status")).toBeEmpty();
  });
});
