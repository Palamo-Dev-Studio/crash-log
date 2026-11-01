// ABOUTME: E2E tests for the home page.
// ABOUTME: Validates page load, locale routing, redirect, cover / rail / recent-files structure and layout.

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

  test("cover shows a code chip, the H1 and the read cue", async ({ page }) => {
    await page.goto("/en");
    const cover = page.locator("main article").first();
    await expect(cover.locator("h1")).toBeVisible();
    await expect(cover).toContainText(/(OTR|FIX|NOTE)-\d{3}/);
    await expect(cover).toContainText(/read the file/i);
  });

  test("rail lists one entry per series that exists, with the colour key", async ({
    page,
  }) => {
    await page.goto("/en");
    const rail = page.locator("aside");
    await expect(rail).toContainText(/latest files/i);
    for (const name of ["Off the Rails", "Practical", "Nico’s Notes"]) {
      await expect(rail).toContainText(name);
    }
    const series = await rail
      .locator("a[data-series]")
      .evaluateAll((els) => els.map((e) => e.getAttribute("data-series")));
    expect(new Set(series).size).toBe(series.length);
    expect(series.length).toBeGreaterThan(0);
    await expect(rail.getByText(/on the cover/i)).toHaveCount(1);
    await expect(rail.getByRole("link", { name: "Subscribe" })).toHaveAttribute(
      "href",
      /substack\.com/
    );
  });

  for (const locale of ["en", "es"]) {
    test(`/${locale} rail legend sits on one line at desktop width, no prefix`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.goto(`/${locale}`);
      const legend = page.locator("aside ul[aria-label]").first();
      await expect(legend).toBeVisible();
      await expect(legend).not.toContainText(/colou?r\s*=/i);
      const tops = await legend
        .locator("li")
        .evaluateAll((els) => els.map((e) => Math.round(e.offsetTop)));
      expect(new Set(tops).size).toBe(1);
    });
  }

  test("recent files rows carry code, date, title and byline", async ({
    page,
  }) => {
    await page.goto("/en");
    const section = page.locator("section", { hasText: /recent files/i });
    const rows = section.locator("a[href*='/en/']").filter({
      hasText: /(OTR|FIX|NOTE)-\d{3}/,
    });
    expect(await rows.count()).toBeGreaterThan(0);
    await expect(rows.first()).toContainText(/(By|Por) \S/);
    await expect(
      page.getByRole("link", { name: /see the full archive/i })
    ).toBeVisible();
  });

  for (const locale of ["en", "es"]) {
    test(`no horizontal overflow at 360px on /${locale}`, async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 800 });
      await page.goto(`/${locale}`);
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }

  test("at 1440 the hero and the rail end on the same baseline", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    for (const locale of ["en", "es"]) {
      await page.goto(`/${locale}`);
      // A cover without art may legitimately end above the rail.
      test.skip(
        (await page.locator("main article img").count()) === 0,
        "cover has no image; hero may end higher than the rail"
      );
      // Compare the last visible content on each side (the read cue and the
      // subscribe box), not the grid cells: grid stretch equalises those.
      const bottoms = await page.evaluate(() => {
        const cue = document.querySelector("main article a").lastElementChild;
        const box = document.querySelector("main aside").lastElementChild;
        return [
          cue.getBoundingClientRect().bottom,
          box.getBoundingClientRect().bottom,
        ];
      });
      expect(Math.abs(bottoms[0] - bottoms[1])).toBeLessThanOrEqual(2);
    }
  });

  test("the cover marker arrow is ← on desktop and ↑ when stacked", async ({
    page,
  }) => {
    const marker = () =>
      page.evaluate(() => {
        const el = [...document.querySelectorAll("main aside span")].find(
          (s) => /on the cover/i.test(s.textContent) && s.children.length === 0
        );
        return getComputedStyle(el, "::after").content;
      });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/en");
    expect(await marker()).toContain("←");
    await page.setViewportSize({ width: 980, height: 900 });
    expect(await marker()).toContain("↑");
  });

  test("shows a link to the full archive", async ({ page }) => {
    await page.goto("/en");
    await expect(
      page.getByRole("link", { name: /see the full archive/i })
    ).toBeVisible();
  });
});
