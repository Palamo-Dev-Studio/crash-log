// ABOUTME: E2E tests for the magazine layout: lead + card grid on the three series indexes (EN and ES), the home "Recent files" trio and the unchanged archive rows.
// ABOUTME: Needs live Sanity data (every published file has a cover and subtitle); checks grid columns at 1440/1024/768/390 and no horizontal overflow at 390.

import { test, expect } from "@playwright/test";

// Counts are read from the page, never pinned to today's data: Off the Rails and Nico's Notes always have several files; Practical may have one or many.
const INDEXES = [
  { path: "off-the-rails", href: "issue", several: true },
  { path: "nico", href: "nico", several: true },
  { path: "practical", href: "practical", several: false },
];

const columnsAt = async (browser, url, width) => {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  await page.goto(url);
  const grid = page.locator("[data-file-grid]").first();
  // No grid at all (a series with a single file) has no columns to count.
  const cols =
    (await grid.count()) === 0
      ? null
      : await grid.evaluate(
          (el) => getComputedStyle(el).gridTemplateColumns.split(" ").length
        );
  await page.close();
  return cols;
};

for (const locale of ["en", "es"]) {
  for (const { path, href, several } of INDEXES) {
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

        if (several) expect(n).toBeGreaterThan(1);
        if (n === 1) {
          // A lone file: the lead stands alone, with no empty grid.
          await expect(page.locator("[data-file-grid]")).toHaveCount(0);
          return;
        }
        // More than one file: the lead plus a grid of the other n - 1.
        const cards = page.locator("[data-file-grid] article");
        expect(await cards.count()).toBe(n - 1);
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

test("grid columns are 3 at 1440 and 1024, 2 at 768 and 1 at 390", async ({
  browser,
}) => {
  for (const { path, several } of INDEXES) {
    const url = `/en/${path}`;
    const wide = await columnsAt(browser, url, 1440);
    // A series with a single file has no grid to measure.
    if (!several && wide === null) continue;
    expect(wide, `${path} @1440`).toBe(3);
    expect(await columnsAt(browser, url, 1024), `${path} @1024`).toBe(3);
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

// A lazy or optimized image can be in the DOM and still be empty: wait for real pixels.
const loaded = (img) =>
  img.evaluate(
    (el) =>
      new Promise((resolve) => {
        const done = () => resolve(el.complete && el.naturalWidth > 0);
        if (el.complete) return done();
        el.addEventListener("load", done, { once: true });
        el.addEventListener("error", done, { once: true });
      })
  );

test("the lead image on each index has really loaded at 1440", async ({
  browser,
}) => {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  for (const { path } of INDEXES) {
    await page.goto(`/en/${path}`);
    const img = page.locator("main article img").first();
    await expect(img, path).toBeVisible();
    expect(await loaded(img), `${path} lead loaded`).toBe(true);
  }
  await page.close();
});

test("card subtitles are not clamped and card bodies fill their card, so bylines can sit on the bottom edge", async ({
  browser,
}) => {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  await page.goto("/en/off-the-rails");
  const cards = page.locator("[data-file-grid] article");
  const rowEnd = await cards.evaluateAll((els) => {
    const firstTop = els[0].getBoundingClientRect().top;
    return els
      .filter((el) => Math.abs(el.getBoundingClientRect().top - firstTop) < 2)
      .map((el) => {
        const card = el.getBoundingClientRect();
        const body = el
          .querySelector("h3")
          .parentElement.getBoundingClientRect();
        const sub = el.querySelector("p");
        return {
          cardBottom: card.bottom,
          bodyBottom: body.bottom,
          clamp: sub ? getComputedStyle(sub).webkitLineClamp : null,
          cut: sub ? sub.scrollHeight > sub.clientHeight : false,
        };
      });
  });
  expect(rowEnd.length).toBe(3);
  for (const c of rowEnd) {
    expect(c.clamp).toBe("none");
    expect(c.cut).toBe(false);
    expect(Math.abs(c.cardBottom - c.bodyBottom)).toBeLessThan(2);
  }
  await page.close();
});

test("cards drop the series-default byline; the lead keeps it", async ({
  page,
}) => {
  await page.goto("/en/off-the-rails");
  await expect(page.locator("main article").first()).toContainText(/By \S/);
  const cards = page.locator("[data-file-grid] article");
  const n = await cards.count();
  for (let i = 0; i < n; i++) {
    await expect(cards.nth(i)).not.toContainText("newsroom");
  }
  await page.goto("/en/nico");
  const notes = page.locator("[data-file-grid] article");
  expect(await notes.count()).toBeGreaterThan(0);
  for (let i = 0; i < (await notes.count()); i++) {
    await expect(notes.nth(i)).not.toContainText("Nico von Bot");
  }
});

test("home trio images are sized full width below 1024px", async ({ page }) => {
  await page.goto("/en");
  const imgs = page
    .locator("section", { hasText: /recent files/i })
    .locator("article img");
  expect(await imgs.count()).toBe(3);
  for (let i = 0; i < 3; i++) {
    await expect(imgs.nth(i)).toHaveAttribute(
      "sizes",
      "(max-width: 1023px) 100vw, 360px"
    );
  }
});

test("a lone lead leaves no extra space below it, a lead with a grid keeps it", async ({
  page,
}) => {
  const pad = (url) =>
    page.goto(url).then(() =>
      page
        .locator("main article")
        .first()
        .evaluate((el) => getComputedStyle(el.parentElement).paddingBottom)
    );
  const fileCount = async (url) => {
    await page.goto(url);
    return page.locator("main article").count();
  };
  // Practical may hold one file or many: the lead's bottom padding follows the count.
  const practicalPad = await pad("/en/practical");
  if ((await fileCount("/en/practical")) === 1) {
    expect(practicalPad).toBe("0px");
  } else {
    expect(practicalPad).not.toBe("0px");
  }
  expect(await pad("/en/off-the-rails")).not.toBe("0px");
});

test("card titles balance their lines; the lead title is 34px on a phone and cards stay 26px", async ({
  browser,
}) => {
  const page = await browser.newPage({ viewport: { width: 390, height: 800 } });
  await page.goto("/en/off-the-rails");
  const sizes = await page.evaluate(() => {
    const lead = document.querySelector("main article h3");
    const card = document.querySelector("[data-file-grid] article h3");
    return {
      lead: getComputedStyle(lead).fontSize,
      card: getComputedStyle(card).fontSize,
      wrap: getComputedStyle(card).textWrap,
    };
  });
  expect(sizes.lead).toBe("34px");
  expect(sizes.card).toBe("26px");
  expect(sizes.wrap).toContain("balance");
  await page.close();
});

test("no subtitle line starts with a dash", async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 390, height: 800 } });
  await page.goto("/en/nico");
  const dashes = await page.evaluate(() => {
    const out = [];
    for (const p of document.querySelectorAll("main article p")) {
      const w = document.createTreeWalker(p, NodeFilter.SHOW_TEXT);
      for (let n = w.nextNode(); n; n = w.nextNode()) {
        const t = n.textContent;
        for (let i = 0; i < t.length; i++) {
          if (t[i] !== "–" && t[i] !== "—") continue;
          const r = document.createRange();
          r.setStart(n, i);
          r.setEnd(n, i + 1);
          const dash = r.getBoundingClientRect();
          const box = p.getBoundingClientRect();
          // A dash that begins a line sits at the paragraph's left edge.
          if (dash.left - box.left < 2)
            out.push(t.slice(Math.max(0, i - 15), i + 10));
        }
      }
    }
    return out;
  });
  expect(dashes).toEqual([]);
  await page.close();
});

test("only the Latin, upright (non-italic) font faces are preloaded, so fonts do not queue ahead of the lead image", async ({
  page,
}) => {
  await page.goto("/en/off-the-rails");
  const fonts = await page.$$eval(
    "link[rel=preload][as=font]",
    (els) => els.length
  );
  // Instrument Serif and Newsreader upright, DM Mono 400 and 500, Latin only.
  expect(fonts).toBeGreaterThan(0);
  expect(fonts).toBeLessThanOrEqual(4);
});

test("article emphasis renders in the real Newsreader italic face (a loaded custom face, not a fallback or a synthesized slant)", async ({
  page,
}) => {
  let found = false;
  for (const slug of ["023", "011", "008", "024"]) {
    await page.goto(`/en/issue/crash-log-${slug}`);
    if ((await page.locator("main em").count()) > 0) {
      found = true;
      break;
    }
  }
  test.skip(!found, "no article with emphasis in the live data");
  await page.waitForFunction(() => document.fonts.status === "loaded");
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("DOM.enable");
  await cdp.send("CSS.enable");
  const { root } = await cdp.send("DOM.getDocument");
  const { nodeId } = await cdp.send("DOM.querySelector", {
    nodeId: root.nodeId,
    selector: "main em",
  });
  const { fonts } = await cdp.send("CSS.getPlatformFontsForNode", { nodeId });
  expect(fonts.length).toBeGreaterThan(0);
  for (const f of fonts) {
    expect(f.isCustomFont).toBe(true);
    expect(f.postScriptName).toMatch(/Newsreader.*Italic/);
  }
});
