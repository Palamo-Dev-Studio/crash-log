// ABOUTME: E2E tests for the Off the Rails issue page and series index (EN and ES, desktop and mobile).
// ABOUTME: Covers case-card grid columns, stamps, no horizontal overflow, source links with ?ref, index and active nav.

import { test, expect } from "@playwright/test";

const ISSUE_PATH = (locale) => `/${locale}/issue/crash-log-027`;

test.describe("Off the Rails issue page", () => {
  for (const locale of ["en", "es"]) {
    test(`/${locale} shows one card per case, each with a stamp`, async ({
      page,
    }) => {
      await page.goto(ISSUE_PATH(locale));
      const cards = page.locator("main section").nth(1).locator("article");
      const n = await cards.count();
      expect(n).toBeGreaterThan(0);
      // stamps sit in .top of each card: every card has a non-empty stamp
      for (let i = 0; i < n; i++) {
        const stamp = cards.nth(i).locator("span[style*='--rot']");
        await expect(stamp).toHaveCount(1);
        await expect(stamp).not.toHaveText("");
      }
      await expect(page.locator("h1")).toBeVisible();
    });
  }

  test("grid is two columns at 1440 and one column at 390", async ({
    browser,
  }) => {
    const positions = async (width) => {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      await page.goto(ISSUE_PATH("en"));
      const cards = page.locator("main section").nth(1).locator("article");
      expect(await cards.count()).toBeGreaterThanOrEqual(2);
      const a = await cards.nth(0).boundingBox();
      const b = await cards.nth(1).boundingBox();
      await page.close();
      return { a, b };
    };
    const wide = await positions(1440);
    expect(Math.abs(wide.a.y - wide.b.y)).toBeLessThan(2);
    expect(wide.b.x).toBeGreaterThan(wide.a.x + wide.a.width - 1);
    expect(Math.abs(wide.a.height - wide.b.height)).toBeLessThan(2);
    const narrow = await positions(390);
    expect(narrow.b.y).toBeGreaterThan(narrow.a.y + narrow.a.height - 1);
    expect(Math.abs(narrow.a.x - narrow.b.x)).toBeLessThan(2);
  });

  for (const locale of ["en", "es"]) {
    for (const width of [360, 390]) {
      test(`/${locale} at ${width}px: no horizontal overflow, stamps do not break mid-word`, async ({
        browser,
      }) => {
        const page = await browser.newPage({
          viewport: { width, height: 800 },
        });
        await page.goto(ISSUE_PATH(locale));
        const overflow = await page.evaluate(
          () =>
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth
        );
        expect(overflow).toBeLessThanOrEqual(0);
        // A stamp that wraps is taller than one line (line-height 1.2 * 14px + chrome).
        const wrapped = await page.$$eval("span[style*='--rot']", (els) =>
          els.map((el) => ({
            text: el.textContent,
            wraps:
              el.offsetHeight >
              parseFloat(getComputedStyle(el).lineHeight) * 1.5 + 20,
            nowrap: getComputedStyle(el).whiteSpace === "nowrap",
          }))
        );
        expect(wrapped.length).toBeGreaterThan(0);
        for (const s of wrapped) {
          expect(s.nowrap, s.text).toBe(true);
          expect(s.wraps, s.text).toBe(false);
        }
        await page.close();
      });
    }
  }

  test("'Read the file' opens an external URL carrying ref=crashlog.ai", async ({
    page,
  }) => {
    await page.goto(ISSUE_PATH("en"));
    const link = page.getByRole("link", { name: /read the file/i }).first();
    const href = await link.getAttribute("href");
    expect(href).toMatch(/^https?:\/\//);
    expect(new URL(href).searchParams.get("ref")).toBe("crashlog.ai");
    expect(await link.getAttribute("target")).toBe("_blank");
    expect(await link.getAttribute("rel")).toContain("noopener");
  });

  test("full files follow the grid and the case number jumps to its file", async ({
    page,
  }) => {
    await page.goto(ISSUE_PATH("en"));
    await expect(page.getByText("The full files")).toBeVisible();
    const jump = page.getByRole("link", { name: "Case 01" });
    await expect(jump).toHaveAttribute("href", "#case-file-01");
    await expect(page.locator("#case-file-01")).toHaveCount(1);
  });
});

test.describe("Off the Rails index", () => {
  test("/en/off-the-rails lists issues newest first and marks the nav item active", async ({
    page,
  }) => {
    const response = await page.goto("/en/off-the-rails");
    expect(response.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Off the Rails"
    );
    const rows = page.locator("main a[href*='/en/issue/']");
    const n = await rows.count();
    expect(n).toBeGreaterThan(1);
    const codes = [];
    for (let i = 0; i < n; i++) {
      const text = await rows.nth(i).innerText();
      codes.push(Number(text.match(/OTR-(\d{3})/)[1]));
    }
    expect(codes).toEqual([...codes].sort((a, b) => b - a));
    await expect(
      page.locator("nav[aria-label] a[aria-current='page']")
    ).toHaveText("Off the Rails");
  });

  test("/es/off-the-rails renders in Spanish with the nav item active", async ({
    page,
  }) => {
    const response = await page.goto("/es/off-the-rails");
    expect(response.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Fuera de las vías"
    );
    await expect(
      page.locator("nav[aria-label] a[aria-current='page']")
    ).toHaveText("Fuera de las vías");
  });

  test("an issue page keeps Off the Rails active in the nav", async ({
    page,
  }) => {
    await page.goto(ISSUE_PATH("en"));
    await expect(
      page.locator("nav[aria-label] a[aria-current='page']").first()
    ).toHaveText("Off the Rails");
  });
});
