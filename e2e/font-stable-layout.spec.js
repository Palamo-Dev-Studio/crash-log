// ABOUTME: Property tests: whether the web fonts load or are blocked, nothing the magazine layout puts in the first viewport moves.
// ABOUTME: No throttling, but it runs on live Sanity data: a new title near a line break can flip a page. The strict heights property is a known failure (test.fixme).

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
      // Offsets from the list heading above the lead, for each article that starts in the first viewport:
      // [article, meta row, title, dek]. The page head's dek (outside this layout) can re-wrap and move the
      // heading, so measure against it. A missing child is -1.
      firstViewport: (() => {
        const h2 = document
          .querySelector("main h2")
          .getBoundingClientRect().top;
        const off = (el) =>
          el ? round(el.getBoundingClientRect().top - h2) : -1;
        return [...document.querySelectorAll("main article")]
          .filter((a) => a.getBoundingClientRect().top < window.innerHeight)
          .map((a) => [
            off(a),
            off(a.querySelector("[class*='__meta']")),
            off(a.querySelector("h3")),
            off(a.querySelector("p[class*='__sub']")),
          ]);
      })(),
    };
  });
  await ctx.close();
  return out;
}

for (const locale of ["en", "es"]) {
  for (const series of SERIES) {
    for (const width of WIDTHS) {
      // /es/practical's lead title takes 3 lines in the fallback face and 2 in Instrument Serif at 390 and 1440, which
      // moves the dek inside the first viewport. This is NOT covered by the strict-heights refusal (that was about
      // cards below the fold). At 390 it shows only with fonts blocked: throttled CLS there is 0 on main and on HEAD.
      // At 1440 it is a measured regression (perf-budget.spec.js: /es/practical HEAD 0.01125 vs main 0.0091).
      // Hector ruled to ship it disclosed (#crash-log 1567702842754736140, 2026-11-05, option A); the pre-existing ES
      // page-head dek re-wrap gets a separate fix. Only clamping, reserving lines or font-display: optional would
      // remove the title re-wrap itself.
      const knownTitleRewrap =
        locale === "es" &&
        series === "practical" &&
        (width === 390 || width === 1440);
      const define = knownTitleRewrap ? test.fixme : test;
      define(
        `/${locale}/${series} @${width}: articles in the first viewport do not move when the web font loads`,
        async ({ browser }) => {
          test.setTimeout(120000);
          const url = `/${locale}/${series}`;
          const diffs = [];
          const fallback = await heights(browser, width, url, true);
          const loaded = await heights(browser, width, url, false);
          expect(
            loaded.firstViewport.length,
            `${url} @${width}`
          ).toBeGreaterThan(0);
          // An article in the first viewport in one render and not in the other is a shift too: compare every index.
          const count = Math.max(
            loaded.firstViewport.length,
            fallback.firstViewport.length
          );
          const parts = ["article", "meta row", "title", "dek"];
          for (let i = 0; i < count; i++) {
            const l = loaded.firstViewport[i];
            const f = fallback.firstViewport[i];
            if (!l || !f) {
              diffs.push(
                `article ${i}: in the first viewport with ${l ? "the font" : "the fallback"} only`
              );
              continue;
            }
            // The lead's meta row and title must exist in both renderings (a dek may be absent on a page without one).
            if (i === 0) {
              for (const [render, name] of [
                [l, "the font"],
                [f, "the fallback"],
              ]) {
                for (const k of [1, 2]) {
                  if (render[k] === -1) {
                    diffs.push(`lead ${parts[k]} missing with ${name}`);
                  }
                }
              }
            }
            l.forEach((offset, k) => {
              // A child present in one rendering and missing in the other is a difference, not a pass.
              if ((offset === -1) !== (f[k] === -1)) {
                diffs.push(
                  `article ${i} ${parts[k]}: present with ${offset === -1 ? "the fallback" : "the font"} only`
                );
                return;
              }
              if (offset === -1) return;
              if (Math.abs(offset - f[k]) > 0.5) {
                diffs.push(
                  `article ${i} ${parts[k]}: ${f[k]} -> ${offset} below the list heading`
                );
              }
            });
          }
          expect(diffs, `${url} @${width}`).toEqual([]);
        }
      );
    }

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
