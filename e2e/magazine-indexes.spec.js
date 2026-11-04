// ABOUTME: E2E tests for the magazine layout: lead + card grid on the three series indexes (EN and ES), the home "Recent files" trio and the unchanged archive rows.
// ABOUTME: Needs live Sanity data (every published file has a cover and subtitle); checks grid columns at 1440/768/390 and no horizontal overflow at 390.

import { test, expect } from "@playwright/test";

const INDEXES = [
  { path: "off-the-rails", href: "issue", grid: true },
  { path: "nico", href: "nico", grid: true },
  { path: "practical", href: "practical", grid: false },
];

const columnsAt = async (browser, url, width) => {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  await page.goto(url);
  const cols = await page
    .locator("[data-file-grid]")
    .first()
    .evaluate(
      (el) => getComputedStyle(el).gridTemplateColumns.split(" ").length
    );
  await page.close();
  return cols;
};

for (const locale of ["en", "es"]) {
  for (const { path, href, grid } of INDEXES) {
    test.describe(`/${locale}/${path}`, () => {
      test("shows a lead with image and subtitle, and cards with images and subtitles", async ({
        page,
      }) => {
        await page.goto(`/${locale}/${path}`);
        const articles = page.locator("main article");
        const n = await articles.count();
        expect(n).toBeGreaterThan(0);

        const lead = articles.first();
        await expect(lead.locator("img")).toHaveCount(1);
        await expect(lead.locator("img")).toBeVisible();
        await expect(lead.locator("h3")).not.toBeEmpty();
        await expect(lead.locator("p").first()).not.toBeEmpty();
        await expect(
          lead.locator(`a[href^='/${locale}/${href}/']`)
        ).toHaveCount(1);

        if (!grid) {
          // One item today: the lead stands alone, with no empty grid.
          expect(n).toBe(1);
          await expect(page.locator("[data-file-grid]")).toHaveCount(0);
          return;
        }
        const cards = page.locator("[data-file-grid] article");
        expect(await cards.count()).toBe(n - 1);
        expect(n).toBeGreaterThan(1);
        for (let i = 0; i < n - 1; i++) {
          const card = cards.nth(i);
          await expect(card.locator("img")).toHaveCount(1);
          await expect(card.locator("h3")).not.toBeEmpty();
          await expect(card.locator("p").first()).not.toBeEmpty();
        }
      });
    });
  }
}

test("grid columns are 3 at 1440, 2 at 768 and 1 at 390", async ({
  browser,
}) => {
  for (const { path, grid } of INDEXES) {
    if (!grid) continue;
    const url = `/en/${path}`;
    expect(await columnsAt(browser, url, 1440), `${path} @1440`).toBe(3);
    expect(await columnsAt(browser, url, 768), `${path} @768`).toBe(2);
    expect(await columnsAt(browser, url, 390), `${path} @390`).toBe(1);
  }
});

test("no horizontal overflow at 390px on the three indexes and the home page", async ({
  browser,
}) => {
  const page = await browser.newPage({ viewport: { width: 390, height: 800 } });
  for (const url of [
    "/en/off-the-rails",
    "/en/nico",
    "/en/practical",
    "/es/off-the-rails",
    "/en",
  ]) {
    await page.goto(url);
    const over = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth
    );
    expect(over, url).toBeLessThanOrEqual(0);
  }
  await page.close();
});

test("only the lead image on an index is eager; the others lazy", async ({
  page,
}) => {
  await page.goto("/en/off-the-rails");
  const imgs = page.locator("main article img");
  expect(await imgs.count()).toBeGreaterThan(1);
  await expect(imgs.first()).not.toHaveAttribute("loading", "lazy");
  await expect(imgs.nth(1)).toHaveAttribute("loading", "lazy");
});

test.describe("home Recent files", () => {
  test("shows three cards in a row with images and subtitles", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/en");
    const section = page.locator("section", { hasText: /recent files/i });
    const cards = section.locator("article");
    await expect(cards).toHaveCount(3);
    const ys = [];
    for (let i = 0; i < 3; i++) {
      await expect(cards.nth(i).locator("img")).toHaveCount(1);
      await expect(cards.nth(i).locator("p").first()).not.toBeEmpty();
      ys.push((await cards.nth(i).boundingBox()).y);
    }
    expect(Math.max(...ys) - Math.min(...ys)).toBeLessThan(2);
    await expect(
      page.getByRole("link", { name: /see the full archive/i })
    ).toBeVisible();
  });
});

test("archive search results are still rows, not cards", async ({ page }) => {
  await page.goto("/en/archive");
  const rows = page.locator("main a[href*='/en/']").filter({
    hasText: /(OTR|FIX|NOTE)-\d{3}/,
  });
  expect(await rows.count()).toBeGreaterThan(0);
  await expect(page.locator("main article img")).toHaveCount(0);
});
