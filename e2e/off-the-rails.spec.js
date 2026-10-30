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

  test("grid is two columns at 1440 and one column at 800 and 390", async ({
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
    for (const width of [800, 390]) {
      const narrow = await positions(width);
      expect(narrow.b.y, `${width}px`).toBeGreaterThan(
        narrow.a.y + narrow.a.height - 1
      );
      expect(Math.abs(narrow.a.x - narrow.b.x), `${width}px`).toBeLessThan(2);
    }
  });

  for (const locale of ["en", "es"]) {
    for (const width of [1440, 390]) {
      test(`/${locale} at ${width}px: fallback summaries clamp to 5 lines`, async ({
        browser,
      }) => {
        const page = await browser.newPage({
          viewport: { width, height: 900 },
        });
        await page.goto(`/${locale}/issue/crash-log-011`);
        const metrics = await page.$$eval("[class*='summaryClamped']", (els) =>
          els.map((el) => ({
            height: el.getBoundingClientRect().height,
            lineHeight: parseFloat(getComputedStyle(el).lineHeight),
            overflowing: el.scrollHeight > el.clientHeight,
          }))
        );
        expect(metrics.length).toBeGreaterThan(0);
        for (const m of metrics) {
          expect(m.height).toBeLessThanOrEqual(5 * m.lineHeight + 2);
        }
        // At least one paragraph is long enough that the clamp is doing work.
        expect(metrics.some((m) => m.overflowing)).toBe(true);
        await page.close();
      });
    }
  }

  // Counts the line fragments of every space-separated word in every stamp.
  // A word broken mid-word spans two line boxes, so it yields two client rects.
  const brokenStampWords = (page) =>
    page.$$eval("span[style*='--rot']", (els) => {
      const broken = [];
      for (const el of els) {
        const node = el.firstChild;
        if (!node || node.nodeType !== Node.TEXT_NODE) continue;
        const text = node.textContent;
        for (const m of text.matchAll(/\S+/g)) {
          const range = document.createRange();
          range.setStart(node, m.index);
          range.setEnd(node, m.index + m[0].length);
          if (range.getClientRects().length > 1) broken.push(m[0]);
        }
      }
      return broken;
    });
  const horizontalOverflow = (page) =>
    page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth
    );

  for (const locale of ["en", "es"]) {
    for (const width of [360, 390]) {
      test(`/${locale} at ${width}px: no horizontal overflow and no stamp word broken mid-word, even with a long verdict`, async ({
        browser,
      }) => {
        const page = await browser.newPage({
          viewport: { width, height: 800 },
        });
        await page.goto(ISSUE_PATH(locale));
        expect(
          await page.locator("span[style*='--rot']").count()
        ).toBeGreaterThan(0);
        expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
        expect(await brokenStampWords(page)).toEqual([]);

        // Inject a 33+ character verdict into the first card's stamp.
        await page.evaluate(() => {
          const stamp = document.querySelector("article span[style*='--rot']");
          stamp.firstChild.textContent =
            "BILLED TO YOUR GRANDMOTHER TWICE OVER";
        });
        expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
        expect(await brokenStampWords(page)).toEqual([]);
        await page.close();
      });

      test(`/${locale} at ${width}px: no kicker separator dot starts a line`, async ({
        browser,
      }) => {
        const page = await browser.newPage({
          viewport: { width, height: 800 },
        });
        await page.goto(ISSUE_PATH(locale));
        const result = await page.evaluate(() => {
          const kicker = document
            .querySelector("h1")
            .closest("section").firstElementChild;
          const walker = document.createTreeWalker(
            kicker,
            NodeFilter.SHOW_TEXT
          );
          const glyphs = [];
          for (let n = walker.nextNode(); n; n = walker.nextNode()) {
            for (let i = 0; i < n.textContent.length; i++) {
              const ch = n.textContent[i];
              if (!ch.trim()) continue;
              const r = document.createRange();
              r.setStart(n, i);
              r.setEnd(n, i + 1);
              const rect = r.getBoundingClientRect();
              glyphs.push({ ch, top: rect.top, left: rect.left });
            }
          }
          const stranded = glyphs.filter(
            (g) =>
              g.ch === "·" &&
              !glyphs.some(
                (o) => o !== g && Math.abs(o.top - g.top) < 4 && o.left < g.left
              )
          );
          const dots = [...kicker.children[1].children].slice(1);
          return {
            stranded: stranded.length,
            pseudoDisplays: dots.map(
              (el) => getComputedStyle(el, "::before").display
            ),
          };
        });
        expect(result.stranded).toBe(0);
        // The separator pseudo-elements between kicker segments are hidden.
        for (const d of result.pseudoDisplays) expect(d).toBe("none");
        await page.close();
      });
    }
  }

  test("the source label renders uppercase", async ({ page }) => {
    await page.goto(ISSUE_PATH("en"));
    const label = page.getByText("Source", { exact: true }).first();
    expect(
      await label.evaluate((el) => getComputedStyle(el).textTransform)
    ).toBe("uppercase");
  });

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
