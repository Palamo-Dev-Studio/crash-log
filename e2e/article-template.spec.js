// ABOUTME: E2E tests for the article template (live Nico's Notes column) and the Practical index.
// ABOUTME: Covers the 68ch prose column, TOC presence per H2 count, no sideways overflow at 320/360/390, no weekday names.

import { test, expect } from "@playwright/test";

// Long weekday names from Intl for en and es (never typed), matched as whole words.
function weekdayPattern() {
  const names = new Set();
  for (const locale of ["en", "es"]) {
    const fmt = new Intl.DateTimeFormat(locale, {
      weekday: "long",
      timeZone: "UTC",
    });
    for (let d = 1; d <= 7; d++)
      names.add(fmt.format(new Date(Date.UTC(2026, 0, d))));
  }
  return new RegExp(`(?<![\\p{L}])(${[...names].join("|")})(?![\\p{L}])`, "iu");
}

async function firstColumnPath(page, locale) {
  await page.goto(`/${locale}/nico`);
  const link = page.locator(`main a[href^='/${locale}/nico/']`).first();
  if ((await link.count()) === 0) return null;
  return link.getAttribute("href");
}

test.describe("Practical index", () => {
  for (const locale of ["en", "es"]) {
    test(`/${locale}/practical renders, with Practical active in the nav`, async ({
      page,
    }) => {
      const response = await page.goto(`/${locale}/practical`);
      expect(response.status()).toBe(200);
      await expect(page.locator("h1")).toHaveText(
        locale === "es" ? "Práctico" : "Practical"
      );
      await expect(page.locator("nav a[aria-current='page']")).toHaveAttribute(
        "href",
        `/${locale}/practical`
      );
    });
  }

  test("shows rows, or the intentional empty state with a Subscribe link", async ({
    page,
  }) => {
    await page.goto("/en/practical");
    const rows = page.locator("main a[href^='/en/practical/']");
    if ((await rows.count()) > 0) {
      await expect(rows.first()).toContainText(/FIX-\d{3}/);
      return;
    }
    await expect(
      page.getByText("The Practical series starts soon.")
    ).toBeVisible();
    await expect(
      page.locator("main").getByRole("link", { name: /Subscribe/ })
    ).toHaveAttribute("href", /substack\.com/);
  });

  test("nav link from home reaches the index instead of a 404", async ({
    page,
  }) => {
    await page.goto("/en");
    await page
      .locator("nav")
      .first()
      .getByRole("link", { name: "Practical" })
      .click();
    await page.waitForURL("**/en/practical");
    await expect(page.locator("h1")).toHaveText("Practical");
  });
});

test.describe("Nico's Notes column page (article template)", () => {
  test("prose column is 68ch wide at 1440 and the header carries the series metadata", async ({
    browser,
  }) => {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
    });
    const path = await firstColumnPath(page, "en");
    test.skip(!path, "no published columns in Sanity");
    await page.goto(path);

    const measured = await page.evaluate(() => {
      const article = document.querySelector("main article");
      const probe = document.createElement("div");
      probe.style.cssText = "width:68ch;height:0;visibility:hidden";
      article.appendChild(probe);
      const expected = probe.getBoundingClientRect().width;
      probe.remove();
      return { actual: article.getBoundingClientRect().width, expected };
    });
    expect(measured.expected).toBeGreaterThan(300);
    expect(Math.abs(measured.actual - measured.expected)).toBeLessThan(1);

    await expect(page.locator("main article h1")).toBeVisible();
    await expect(page.locator("main article")).toContainText(/NOTE-\d{3}/);
    await expect(page.locator("main article")).toContainText("By Nico von Bot");
    await expect(page.locator("main article")).not.toContainText(
      "Reported with Nico"
    );
    await page.close();
  });

  test("TOC column exists exactly when the body has 2+ H2s, and mirrors them", async ({
    browser,
  }) => {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
    });
    const path = await firstColumnPath(page, "en");
    test.skip(!path, "no published columns in Sanity");
    await page.goto(path);

    const h2s = await page.locator("main article h2").allTextContents();
    const aside = page.locator("main aside");
    if (h2s.length < 2) {
      await expect(aside).toHaveCount(0);
      // No TOC: the prose column sits centred, equal gutters either side.
      const box = await page.locator("main article").boundingBox();
      const left = box.x;
      const right = 1440 - (box.x + box.width);
      expect(Math.abs(left - right)).toBeLessThan(2);
    } else {
      expect(await aside.locator("a").allTextContents()).toEqual(h2s);
      expect(await aside.evaluate((el) => getComputedStyle(el).position)).toBe(
        "sticky"
      );
    }
    await page.close();
  });

  for (const locale of ["en", "es"]) {
    for (const width of [320, 360, 390]) {
      test(`/${locale} column page and indexes do not scroll sideways at ${width}px`, async ({
        browser,
      }) => {
        const page = await browser.newPage({
          viewport: { width, height: 800 },
        });
        const columnPath = await firstColumnPath(page, locale);
        const paths = [`/${locale}/nico`, `/${locale}/practical`];
        if (columnPath) paths.push(columnPath);
        for (const p of paths) {
          await page.goto(p);
          const overflow = await page.evaluate(
            () => document.documentElement.scrollWidth - window.innerWidth
          );
          expect(overflow, `${p} at ${width}px`).toBeLessThanOrEqual(0);
        }
        await page.close();
      });
    }
  }

  for (const locale of ["en", "es"]) {
    test(`/${locale} new routes show no weekday in header, nav, footer, dates`, async ({
      page,
    }) => {
      const columnPath = await firstColumnPath(page, locale);
      const paths = [`/${locale}/nico`, `/${locale}/practical`];
      if (columnPath) paths.push(columnPath);
      const pattern = weekdayPattern();
      for (const p of paths) {
        await page.goto(p);
        for (const sel of [
          "header",
          "nav",
          "footer",
          "time",
          "main article header",
        ]) {
          const texts = await page.locator(sel).allTextContents();
          for (const text of texts) {
            expect(text, `${sel} on ${p}`).not.toMatch(pattern);
          }
        }
      }
    });
  }
});
