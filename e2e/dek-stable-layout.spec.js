// ABOUTME: Property test: the page-head dek has the same line count, height and distance to the next block whether the web font loads or is blocked.
// ABOUTME: Covers the home cover and the three series indexes, ES and EN, at 390, 1024, 1100 and 1440px; no throttling, live Sanity data.

import { test, expect } from "@playwright/test";

const PATHS = ["", "/off-the-rails", "/practical", "/nico"];
const WIDTHS = [390, 1024, 1100, 1440];

// Dek line count (distinct line tops of its text), its height, and the distance from the dek's top to the top of the
// next block below it. Distances are relative to the dek: a header that wraps differently moves the whole page and is not the dek's doing.
async function dekMetrics(browser, width, url, blockFonts) {
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
    const dek = document.querySelector('main [class*="dek"]');
    if (!dek) return null;
    const range = document.createRange();
    range.selectNodeContents(dek);
    const lineTops = new Set(
      [...range.getClientRects()].map((r) => Math.round(r.top))
    );
    let node = dek;
    let below = null;
    while (
      node &&
      node !== document.body &&
      !(below = node.nextElementSibling)
    ) {
      node = node.parentElement;
    }
    const dekRect = dek.getBoundingClientRect();
    return {
      lines: lineTops.size,
      height: round(dekRect.height),
      belowOffset: below
        ? round(below.getBoundingClientRect().top - dekRect.top)
        : null,
    };
  });
  await ctx.close();
  return out;
}

for (const locale of ["es", "en"]) {
  for (const path of PATHS) {
    const url = `/${locale}${path}`;
    test(`dek on ${url}: same line count, height and next-block offset with fonts blocked and loaded`, async ({
      browser,
    }) => {
      test.setTimeout(120000);
      const diffs = [];
      for (const width of WIDTHS) {
        const fallback = await dekMetrics(browser, width, url, true);
        const loaded = await dekMetrics(browser, width, url, false);
        expect(loaded, `${url} @${width}: no dek found`).not.toBeNull();
        if (loaded.lines !== fallback.lines) {
          diffs.push(
            `@${width} dek lines: fallback ${fallback.lines} vs font ${loaded.lines}`
          );
        }
        if (Math.abs(loaded.height - fallback.height) > 0.5) {
          diffs.push(
            `@${width} dek height: fallback ${fallback.height} vs font ${loaded.height}`
          );
        }
        if (Math.abs(loaded.belowOffset - fallback.belowOffset) > 0.5) {
          diffs.push(
            `@${width} next block offset: fallback ${fallback.belowOffset} vs font ${loaded.belowOffset}`
          );
        }
      }
      expect(diffs, url).toEqual([]);
    });
  }
}
