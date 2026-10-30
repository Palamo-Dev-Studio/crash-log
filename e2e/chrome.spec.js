// ABOUTME: E2E tests for the global chrome: masthead cursor motion, mobile overflow, nav row, language toggle.
// ABOUTME: Runs against the dev server; no Sanity data needed (chrome renders on every route).

import { test, expect } from "@playwright/test";

const cursorStyle = (page) =>
  page.evaluate(() => {
    const brand = document.querySelector("header a");
    const cursor = Array.from(brand.querySelectorAll("span")).find(
      (el) =>
        el.matches('[aria-hidden="true"]') && el.className.includes("cursor")
    );
    const cs = getComputedStyle(cursor);
    return { name: cs.animationName, duration: cs.animationDuration };
  });

test.describe("cursor motion", () => {
  test("blinks with a 1s animation by default", async ({ page }) => {
    await page.goto("/en");
    const style = await cursorStyle(page);
    expect(style.name).toMatch(/blink/);
    expect(style.duration).toBe("1s");
  });
});

test.describe("cursor motion with reduced motion", () => {
  test("is static under prefers-reduced-motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/en");
    expect((await cursorStyle(page)).name).toBe("none");
  });
});

test.describe("mobile layout", () => {
  for (const path of ["/en", "/es"]) {
    test(`no horizontal page overflow at 360px on ${path}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 360, height: 800 });
      await page.goto(path);
      const width = await page.evaluate(
        () => document.documentElement.scrollWidth
      );
      expect(width).toBeLessThanOrEqual(360);
    });
  }

  test("nav is one row at 390px and scrolls horizontally", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto("/en");
    const nav = page.locator("nav[aria-label='Sections']");
    const tops = await nav
      .locator("a")
      .evaluateAll((els) => els.map((el) => el.offsetTop));
    expect(tops).toHaveLength(6);
    expect(new Set(tops).size).toBe(1);
    const { scrollWidth, clientWidth } = await nav.evaluate((el) => ({
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
    }));
    expect(scrollWidth).toBeGreaterThan(clientWidth);
  });
});

test.describe("language toggle", () => {
  test("clicking ES on /en/archive lands on /es/archive", async ({ page }) => {
    await page.goto("/en/archive");
    await page
      .locator("header")
      .getByRole("link", { name: "ES", exact: true })
      .click();
    await page.waitForURL("**/es/archive");
    expect(page.url()).toContain("/es/archive");
  });
});
