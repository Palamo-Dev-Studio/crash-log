// ABOUTME: Viewport sweep: the page-head dek has the same line count, height and distance to the next block with the web font blocked and loaded.
// ABOUTME: Covers the home cover and the three series indexes, ES and EN, stepping the viewport 1px to 1024px and 8px to 1440px; no throttling, home dek text pinned.

import { test, expect } from "@playwright/test";

const PATHS = ["", "/off-the-rails", "/practical", "/nico"];

// Every width from 320 to 1024px (the range where the page head's layout changes most), then every 8px up to 1440.
const WIDTHS = [];
for (let w = 320; w <= 1024; w += 1) WIDTHS.push(w);
for (let w = 1032; w <= 1440; w += 8) WIDTHS.push(w);

// The home dek is the newest file's Sanity subtitle (components/HomeCover.js), so it changes at every publish. The sweep
// replaces it with these strings (today's text) before measuring, so the KNOWN ranges depend only on code and platform
// fonts. The series index deks are static strings in lib/ and need no pinning.
const HOME_DEK = {
  es: "El banco más grande de Estados Unidos acaba de advertirles a los directores ejecutivos sobre los riesgos de la IA y qué hacer al respecto. Aquí va la versión para pequeños negocios.",
  en: "America's biggest bank just warned CEOs about the risks with AI and what to do about it. Here's the version for small businesses.",
};

// Viewport widths where the dek still wraps differently in the fallback face and in Newsreader, per page, as inclusive
// [from, to] ranges over WIDTHS. A single size-adjust cannot make one face match another at every measure, so these
// residue ranges are disclosed rather than fixed: the mismatching widths must EQUAL this list exactly, so the sweep fails
// on a new mismatch and on an entry that stops mismatching (update KNOWN in the same diff). The alternative that removes the residue is
// `display: "optional"` on the Newsreader loader (no swap, so no re-wrap); Hector chose this tuned fallback with the residue
// disclosed instead (#nico 1567926785411256380).
// Measured with macOS Times New Roman as the fallback; a Linux host falls to Tinos or Liberation Serif and the ranges
// may differ there.
const KNOWN = {
  "/es": [[389, 391]],
  "/es/off-the-rails": [[385, 385]],
  "/es/practical": [
    [351, 354],
    [487, 495],
  ],
  "/es/nico": [[379, 379]],
  "/en": [
    [373, 379],
    [532, 535],
  ],
  "/en/off-the-rails": [],
  "/en/practical": [[415, 417]],
  "/en/nico": [[409, 410]],
};

async function open(browser, url, blockFonts, locale) {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  if (blockFonts) await ctx.route(/\.woff2(\?.*)?$/, (route) => route.abort());
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: "load" });
  if (blockFonts) {
    await page.waitForTimeout(500);
  } else {
    await page.waitForFunction(() => document.fonts.status === "loaded");
  }
  if (url === `/${locale}`) {
    await page.evaluate((text) => {
      const dek = document.querySelector('main [class*="dek"]');
      dek.textContent = text;
      dek.getBoundingClientRect(); // flush layout so the new text is laid out
    }, HOME_DEK[locale]);
    await page.evaluate(
      () => new Promise((r) => requestAnimationFrame(() => r()))
    );
  }
  if (!blockFonts) {
    await page.waitForFunction(() => document.fonts.status === "loaded");
    const newsreaderLoaded = await page.evaluate(() =>
      [...document.fonts].some(
        (f) => f.family === "Newsreader" && f.status === "loaded"
      )
    );
    expect(newsreaderLoaded, `${url}: Newsreader face not loaded`).toBe(true);
  }
  return { ctx, page };
}

// Dek line count (distinct line tops of its text), its height, and the distance from the dek's top to the top of the
// next block below it. Distances are relative to the dek: a header that wraps differently moves the whole page and is not the dek's doing.
function measureDek() {
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
  while (node && node !== document.body && !(below = node.nextElementSibling)) {
    node = node.parentElement;
  }
  const dekRect = dek.getBoundingClientRect();
  return {
    lines: lineTops.size,
    height: round(dekRect.height),
    maxWidth: getComputedStyle(dek).maxWidth,
    belowOffset: below
      ? round(below.getBoundingClientRect().top - dekRect.top)
      : null,
  };
}

async function sweep(page) {
  const out = new Map();
  for (const width of WIDTHS) {
    await page.setViewportSize({ width, height: 900 });
    out.set(width, await page.evaluate(measureDek));
  }
  return out;
}

function toRanges(widths) {
  const ranges = [];
  for (const w of widths) {
    const last = ranges[ranges.length - 1];
    const next = WIDTHS[WIDTHS.indexOf(last?.[1]) + 1];
    if (last && w === next) last[1] = w;
    else ranges.push([w, w]);
  }
  return ranges;
}

const fmt = (ranges) =>
  ranges.map(([a, b]) => (a === b ? `${a}` : `${a}-${b}`)).join(", ");

// The platform font(s) that render the dek's text, from the browser itself (CDP), not from the computed font-family.
async function dekPlatformFonts(page) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("DOM.enable");
  await cdp.send("CSS.enable");
  const { root } = await cdp.send("DOM.getDocument");
  const { nodeId } = await cdp.send("DOM.querySelector", {
    nodeId: root.nodeId,
    selector: 'main [class*="dek"]',
  });
  const { fonts } = await cdp.send("CSS.getPlatformFontsForNode", { nodeId });
  await cdp.detach();
  return fonts;
}

for (const locale of ["es", "en"]) {
  for (const path of PATHS) {
    const url = `/${locale}${path}`;

    test(`dek on ${url}: renders in the loaded Newsreader face, and in a non-custom fallback when the font is blocked`, async ({
      browser,
    }) => {
      const loaded = await open(browser, url, false, locale);
      const loadedFonts = await dekPlatformFonts(loaded.page);
      await loaded.ctx.close();
      expect(
        loadedFonts.length,
        `${url} loaded: no platform font`
      ).toBeGreaterThan(0);
      for (const f of loadedFonts) {
        expect(f.isCustomFont, `${url} loaded: ${f.familyName}`).toBe(true);
        expect(f.postScriptName, `${url} loaded`).toMatch(/Newsreader/);
      }

      const blocked = await open(browser, url, true, locale);
      const blockedFonts = await dekPlatformFonts(blocked.page);
      await blocked.ctx.close();
      expect(
        blockedFonts.length,
        `${url} blocked: no platform font`
      ).toBeGreaterThan(0);
      for (const f of blockedFonts) {
        expect(f.isCustomFont, `${url} blocked: ${f.familyName}`).toBe(false);
      }
    });

    test(`dek on ${url}: same line count, height and next-block offset with fonts blocked and loaded, across the sweep (1px steps to 1024px, 8px above)`, async ({
      browser,
    }) => {
      test.setTimeout(180000);
      const fb = await open(browser, url, true, locale);
      const ld = await open(browser, url, false, locale);
      const fallback = await sweep(fb.page);
      const loaded = await sweep(ld.page);
      await fb.ctx.close();
      await ld.ctx.close();

      const mismatching = [];
      const problems = [];
      for (const width of WIDTHS) {
        const f = fallback.get(width);
        const l = loaded.get(width);
        if (!l) {
          problems.push(`@${width}: no dek found with the font loaded`);
          continue;
        }
        if (!f) {
          problems.push(`@${width}: no dek found with the font blocked`);
          continue;
        }
        if (l.belowOffset === null || f.belowOffset === null) {
          problems.push(
            `@${width}: no block below the dek (fallback ${f.belowOffset}, font ${l.belowOffset})`
          );
          continue;
        }
        if (
          l.lines !== f.lines ||
          Math.abs(l.height - f.height) > 0.5 ||
          Math.abs(l.belowOffset - f.belowOffset) > 0.5
        ) {
          mismatching.push(width);
        }
      }
      expect(problems, `${url}: dek not measurable`).toEqual([]);

      // The width half of the fix, independent of the dek text: the dek's max-width is the same in both faces.
      // The home dek has no max-width ("none" in both states); the series deks have a length.
      for (const width of [390, 800]) {
        const fw = fallback.get(width).maxWidth;
        const lw = loaded.get(width).maxWidth;
        const message = `${url} @${width}: dek max-width ${fw} fallback vs ${lw} font`;
        if (fw === "none" || lw === "none") {
          expect(fw, message).toBe(lw);
        } else {
          expect(
            Math.abs(parseFloat(fw) - parseFloat(lw)),
            message
          ).toBeLessThanOrEqual(0.5);
        }
      }

      const known = KNOWN[url];
      const expected = WIDTHS.filter((w) =>
        known.some(([a, b]) => w >= a && w <= b)
      );
      const unexpected = mismatching.filter((w) => !expected.includes(w));
      const gone = expected.filter((w) => !mismatching.includes(w));
      const detail = unexpected.map((w) => {
        const f = fallback.get(w);
        const l = loaded.get(w);
        return `${w}: lines ${f.lines}/${l.lines}, height ${f.height}/${l.height}, offset ${f.belowOffset}/${l.belowOffset}`;
      });
      expect(
        { unexpected: fmt(toRanges(unexpected)), gone: fmt(toRanges(gone)) },
        `${url}: mismatching widths differ from the KNOWN list (fallback/font). The KNOWN ranges were measured with macOS Times New Roman as the fallback; on another platform this may be a platform difference to re-measure, not a regression:\n${detail.join("\n")}\nUpdate KNOWN in the same diff.`
      ).toEqual({ unexpected: "", gone: "" });
    });
  }
}
