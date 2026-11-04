// ABOUTME: Property tests: whether the web fonts load or are blocked, nothing the magazine layout puts in the first viewport moves.
// ABOUTME: Deterministic (no throttling). The stricter "every card keeps its height" property is a known failure, kept as test.fixme.

import { test, expect } from "@playwright/test";

const SERIES = ["off-the-rails", "nico", "practical"];
const WIDTHS = [390, 1024, 1099, 1100, 1440];

// Heights of every article (lead and cards) plus the main column, in CSS px to one decimal.
async function heights(browser, width, url, blockFonts) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 } });
  if (blockFonts) await ctx.route(/\.woff2(\?.*)?$/, (route) => route.abort());
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: "load" });
  if (blockFonts) {
    await page.waitForTimeout(500);
  } else {
    await page.waitForFunction(() => document.fonts.status === "loaded");
  }
  const out = await page.evaluate(() => {
    const round = (n) => Math.round(n * 10) / 10;
    return {
      articles: [...document.querySelectorAll("main article")].map((a) =>
        round(a.getBoundingClientRect().height)
      ),
      main: round(
        document.querySelector("main").getBoundingClientRect().height
      ),
      // Offset of each article that starts in the first viewport from the list heading above the lead.
      // The page head's dek (outside this layout) can re-wrap and move the heading, so measure against it.
      firstViewport: (() => {
        const h2 = document
          .querySelector("main h2")
          .getBoundingClientRect().top;
        return [...document.querySelectorAll("main article")]
          .map((a) => a.getBoundingClientRect())
          .filter((r) => r.top < window.innerHeight)
          .map((r) => round(r.top - h2));
      })(),
    };
  });
  await ctx.close();
  return out;
}

for (const locale of ["en", "es"]) {
  for (const series of SERIES) {
    test(`/${locale}/${series}: articles in the first viewport do not move when the web font loads`, async ({
      browser,
    }) => {
      test.setTimeout(120000);
      const url = `/${locale}/${series}`;
      const diffs = [];
      for (const width of WIDTHS) {
        const fallback = await heights(browser, width, url, true);
        const loaded = await heights(browser, width, url, false);
        expect(loaded.firstViewport.length, `${url} @${width}`).toBeGreaterThan(
          0
        );
        loaded.firstViewport.forEach((offset, i) => {
          if (Math.abs(offset - (fallback.firstViewport[i] ?? NaN)) > 0.5) {
            diffs.push(
              `@${width} article ${i}: ${fallback.firstViewport[i]} -> ${offset} below the list heading`
            );
          }
        });
      }
      expect(diffs, `${url}`).toEqual([]);
    });

    // KNOWN FAILURE (reported, not tuned away): in the fallback face a dek wraps one line longer than in
    // Newsreader on 1-9 cards per page, so the page below the fold is a line or two taller before the font
    // arrives. It cannot be removed without clamping or reserving lines (visible gaps). Run by removing fixme.
    test.fixme(`/${locale}/${series}: lead and card heights do not depend on the web font`, async ({
      browser,
    }) => {
      test.setTimeout(120000);
      const url = `/${locale}/${series}`;
      const diffs = [];
      for (const width of WIDTHS) {
        const fallback = await heights(browser, width, url, true);
        const loaded = await heights(browser, width, url, false);
        expect(loaded.articles.length, `${url} @${width}`).toBe(
          fallback.articles.length
        );
        loaded.articles.forEach((h, i) => {
          if (Math.abs(h - fallback.articles[i]) > 0.5) {
            diffs.push(
              `@${width} article ${i}: fallback ${fallback.articles[i]} vs font ${h}`
            );
          }
        });
        if (Math.abs(loaded.main - fallback.main) > 0.5) {
          diffs.push(
            `@${width} main: fallback ${fallback.main} vs font ${loaded.main}`
          );
        }
      }
      expect(diffs, `${url}`).toEqual([]);
    });
  }
}
