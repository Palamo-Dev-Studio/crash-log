// ABOUTME: E2E tests for the About page: centered content column and the self-improvement loop graphic (both locales).
// ABOUTME: Covers labels, reduced-motion final state, play-once on scroll, and column centering at 1440px.

import { test, expect } from "@playwright/test";

const STEPS = {
  en: [
    "Nico drafts",
    "Hector edits and publishes",
    "A weekly script logs every change",
    "Three repeats make a rule",
    "Nico reads the rules before writing",
  ],
  es: [
    "Nico escribe el borrador",
    "Hector edita y publica",
    "Un script semanal registra cada cambio",
    "A la tercera, se vuelve regla.",
    "Nico lee las reglas antes de escribir",
  ],
};

for (const locale of ["en", "es"]) {
  test(`/${locale}/about shows the five loop steps in order`, async ({
    page,
  }) => {
    await page.goto(`/${locale}/about`);
    const items = page.locator('[data-testid="self-improvement-loop"] ol > li');
    await expect(items).toHaveText(STEPS[locale]);
  });

  test(`/${locale}/about with reduced motion shows the final state`, async ({
    browser,
  }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto(`/${locale}/about`);
    const loop = page.getByTestId("self-improvement-loop");
    await loop.scrollIntoViewIfNeeded();
    await expect(loop).not.toHaveAttribute("data-motion", /.*/);
    await expect(page.getByTestId("loop-stamp")).toHaveCSS("opacity", "1");
    await expect(page.getByTestId("loop-stamp")).toHaveCSS("transform", "none");
    for (const li of await loop.locator("ol > li").all()) {
      await expect(li).toHaveCSS("opacity", "1");
    }
    await context.close();
  });
}

test("the loop parks, plays once on entering view, then rests on the final state", async ({
  page,
}) => {
  await page.goto("/en/about");
  const loop = page.getByTestId("self-improvement-loop");
  await expect(loop).toHaveAttribute("data-motion", "ready");
  await expect(page.getByTestId("loop-stamp")).toHaveCSS("opacity", "0");
  await loop.scrollIntoViewIfNeeded();
  await expect(loop).toHaveAttribute("data-motion", "play");
  await expect(page.getByTestId("loop-stamp")).toHaveCSS("opacity", "1", {
    timeout: 8000,
  });
  const lis = loop.locator("ol > li");
  for (const li of await lis.all()) {
    await expect(li).toHaveCSS("opacity", "1");
  }
});

for (const locale of ["en", "es"]) {
  for (const width of [1440, 1024]) {
    test(`/${locale}/about content column is centered at ${width}px`, async ({
      browser,
    }) => {
      const context = await browser.newContext({
        viewport: { width, height: 900 },
      });
      const page = await context.newPage();
      await page.goto(`/${locale}/about`);
      for (const selector of ["main > section", "main > header"]) {
        const box = await page.locator(selector).first().boundingBox();
        const left = box.x;
        const right = width - (box.x + box.width);
        expect(Math.abs(left - right), selector).toBeLessThanOrEqual(3);
        expect(box.width, selector).toBeLessThan(800);
      }
      await context.close();
    });
  }
}

test("section prose lines up with its label and rule", async ({ page }) => {
  await page.goto("/en/about");
  const heading = await page.locator("main > section h2").first().boundingBox();
  const prose = await page.locator("main > section p").first().boundingBox();
  expect(Math.abs(prose.x - heading.x)).toBeLessThanOrEqual(1);
});

test("the step list keeps explicit list semantics", async ({ page }) => {
  await page.goto("/en/about");
  await expect(
    page.locator('[data-testid="self-improvement-loop"] ol')
  ).toHaveAttribute("role", "list");
});

// Pauses every animation in the graphic at t ms into the run, deterministically.
async function seekLoop(page, t) {
  await page.evaluate((ms) => {
    const el = document.querySelector('[data-testid="self-improvement-loop"]');
    for (const a of el.getAnimations({ subtree: true })) {
      a.pause();
      a.currentTime = ms;
    }
  }, t);
}

const RULE_RGB = "rgb(143, 50, 25)";

test("beat before: steps 1-3 wait in muted ink before the run, 4 and 5 are absent", async ({
  page,
}) => {
  await page.goto("/en/about");
  const loop = page.getByTestId("self-improvement-loop");
  await expect(loop).toHaveAttribute("data-motion", "ready");
  const lis = loop.locator("ol > li");
  for (const i of [0, 1, 2]) {
    const o = Number(
      await lis.nth(i).evaluate((e) => getComputedStyle(e).opacity)
    );
    expect(o, `label ${i + 1}`).toBeGreaterThan(0.3);
    expect(o, `label ${i + 1}`).toBeLessThan(1);
    const n = Number(
      await loop
        .locator(`g[data-step="${i + 1}"]`)
        .evaluate((e) => getComputedStyle(e).opacity)
    );
    expect(n, `node ${i + 1}`).toBeGreaterThan(0.3);
    expect(n, `node ${i + 1}`).toBeLessThan(1);
  }
  await expect(lis.nth(3)).toHaveCSS("opacity", "0");
  await expect(lis.nth(4)).toHaveCSS("opacity", "0");
});

test("label 4 turns red with the stamp, not before the ticks land", async ({
  page,
}) => {
  await page.goto("/en/about");
  const loop = page.getByTestId("self-improvement-loop");
  await loop.scrollIntoViewIfNeeded();
  await expect(loop).toHaveAttribute("data-motion", "play");
  const label4 = loop.locator("ol > li").nth(3);
  const colour = () => label4.evaluate((e) => getComputedStyle(e).color);
  await seekLoop(page, 2500); // ticks are landing
  expect(await colour()).not.toBe(RULE_RGB);
  await seekLoop(page, 3600); // stamp has landed
  expect(await colour()).toBe(RULE_RGB);
});

for (const [width, locale, word] of [
  [1440, "en", "RULE"],
  [390, "en", "RULE"],
  [390, "es", "REGLA"],
]) {
  test(`the stamp reads "${word}" and clears step 4 at ${width}px (${locale})`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    await page.goto(`/${locale}/about`);
    const stamp = page.getByTestId("loop-stamp");
    await stamp.scrollIntoViewIfNeeded();
    await expect(stamp).toContainText(word);
    const s = await stamp.boundingBox();
    expect(s.width).toBeGreaterThanOrEqual(50);
    expect(s.height).toBeGreaterThanOrEqual(24);
    for (const step of [1, 2, 3, 4, 5]) {
      const n = await page
        .locator(`[data-testid="self-improvement-loop"] g[data-step="${step}"]`)
        .boundingBox();
      const apart =
        s.x + s.width <= n.x ||
        n.x + n.width <= s.x ||
        s.y + s.height <= n.y ||
        n.y + n.height <= s.y;
      expect(apart, `stamp overlaps node ${step}`).toBe(true);
    }
    await context.close();
  });
}
