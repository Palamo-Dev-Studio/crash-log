// ABOUTME: E2E tests for the restyled archive, beats index and beat detail pages (EN and ES).
// ABOUTME: Covers the page head, file-row structure, search behaviour in the new DOM, no weekdays, and no sideways overflow at 320/360/390.

import { test, expect } from "@playwright/test";

const WIDTHS = [320, 360, 390];
const WEEKDAYS =
  /\b(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|lunes|martes|miércoles|jueves|viernes|sábado|domingo)\b/i;

// Date lines are short and carry a year; summaries may legitimately mention a weekday.
function dateLines(text) {
  return text
    .split("\n")
    .filter((line) => line.length < 30 && /\b20\d{2}\b/.test(line));
}

async function overflowPx(page) {
  return page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth
  );
}

// First beat slug linked from the beats index, or null when the CMS has none.
async function firstBeatSlug(page) {
  await page.goto("/en/beats");
  const link = page.locator('main a[href^="/en/beat/"]').first();
  if ((await link.count()) === 0) return null;
  return (await link.getAttribute("href")).split("/").pop();
}

test.describe("Archive page", () => {
  for (const locale of ["en", "es"]) {
    test(`/${locale}/archive has a mono kicker, serif H1, description and file rows`, async ({
      page,
    }) => {
      await page.goto(`/${locale}/archive`);
      const head = page.locator("main section").first();
      await expect(head.locator("h1")).toBeVisible();
      await expect(head.locator("p").first()).toHaveText(
        locale === "es" ? /ARCHIVO/ : /ARCHIVE/
      );
      const headFont = await head
        .locator("h1")
        .evaluate((el) => getComputedStyle(el).fontFamily);
      expect(headFont).toMatch(/Instrument|display|serif/i);

      const rows = page.locator("main h3");
      expect(await rows.count()).toBeGreaterThan(0);
      const first = rows.first().locator("xpath=ancestor::a[1]");
      await expect(first).toHaveAttribute("href", new RegExp(`^/${locale}/`));
      // code chip is mono text such as OTR-014 / NOTE-001 / FIX-001
      await expect(first).toContainText(/(OTR|NOTE|FIX)-\d{3}/);
      await expect(first).toContainText(locale === "es" ? /Por / : /By /);
    });
  }

  test("search input has a visible mono label and a visible focus ring", async ({
    page,
  }) => {
    await page.goto("/en/archive");
    const input = page.getByRole("searchbox");
    await expect(
      page.locator("label[for]", { hasText: "Search" })
    ).toBeVisible();
    await input.focus();
    const outline = await input.evaluate(
      (el) => getComputedStyle(el).outlineStyle
    );
    expect(outline).not.toBe("none");
    // Ink outline (Chromium rounds the 1.5px border down to 1px, so assert colour, not width).
    const border = await input.evaluate(
      (el) => getComputedStyle(el).borderTopColor
    );
    expect(border).toBe("rgb(42, 36, 32)");
  });

  test("a matching query keeps the AA-tinted highlight and narrows the rows", async ({
    page,
  }) => {
    await page.goto("/en/archive");
    const rows = page.locator("main h3");
    const before = await rows.count();
    const title = (await rows.first().textContent()).trim();
    const word = title.split(/\s+/).find((w) => w.length > 3) || title;
    await page.getByRole("searchbox").fill(word);
    await expect(page.locator("main mark").first()).toBeVisible();
    expect(await rows.count()).toBeLessThanOrEqual(before);
    const bg = await page
      .locator("main mark")
      .first()
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).not.toBe("rgba(0, 0, 0, 0)");
  });

  test("/es/archive?q=IA seeds the search and shows no weekday names", async ({
    page,
  }) => {
    await page.goto("/es/archive?q=IA");
    await expect(page.getByRole("searchbox")).toHaveValue("IA");
    const text = await page.locator("main").innerText();
    expect(dateLines(text).join("\n")).not.toMatch(WEEKDAYS);
  });

  test("uses no legacy dark-theme severity colours on the page", async ({
    page,
  }) => {
    await page.goto("/en/archive");
    const bg = await page.evaluate(
      () => getComputedStyle(document.body).backgroundColor
    );
    // cream paper (#F4ECDD), not the old near-black
    expect(bg).toBe("rgb(244, 236, 221)");
  });
});

test.describe("Beats pages", () => {
  test("/en/beats and /es/beats use the index head and ruled rows", async ({
    page,
  }) => {
    for (const locale of ["en", "es"]) {
      await page.goto(`/${locale}/beats`);
      await expect(page.locator("main h1")).toHaveText(
        locale === "es" ? "Secciones" : "Beats"
      );
      await expect(page.locator("main section p").first()).toContainText(
        locale === "es" ? "COBERTURA" : "COVERAGE"
      );
      const text = await page.locator("main").innerText();
      expect(dateLines(text).join("\n")).not.toMatch(WEEKDAYS);
    }
  });

  test("beat detail shows the category as H1, a back link and story rows with OTR chips", async ({
    page,
  }) => {
    const slug = await firstBeatSlug(page);
    test.skip(slug === null, "CMS has no beats with stories");
    await page.goto(`/en/beat/${slug}`);
    await expect(page.locator("main h1")).toBeVisible();
    await expect(
      page.getByRole("link", { name: "← All beats" })
    ).toHaveAttribute("href", "/en/beats");
    const rows = page.locator('main a[href^="/en/issue/"]');
    expect(await rows.count()).toBeGreaterThan(0);
    await expect(rows.first()).toContainText(/OTR-\d{3}/);
    const text = await page.locator("main").innerText();
    expect(dateLines(text).join("\n")).not.toMatch(WEEKDAYS);
  });
});

test.describe("No horizontal overflow on archive and beats routes", () => {
  for (const width of WIDTHS) {
    for (const locale of ["en", "es"]) {
      test(`${locale} at ${width}px`, async ({ browser }) => {
        const page = await browser.newPage({
          viewport: { width, height: 800 },
        });
        const routes = [
          `/${locale}/archive`,
          `/${locale}/archive?q=IA`,
          `/${locale}/beats`,
        ];
        await page.goto(`/${locale}/beats`);
        const hrefs = await page
          .locator(`main a[href^="/${locale}/beat/"]`)
          .evaluateAll((els) => els.map((el) => el.getAttribute("href")));
        routes.push(...hrefs);
        for (const route of routes) {
          await page.goto(route);
          expect(
            await overflowPx(page),
            `${route} @${width}`
          ).toBeLessThanOrEqual(0);
        }
        await page.close();
      });
    }
  }
});
