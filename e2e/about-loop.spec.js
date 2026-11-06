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
    "A la tercera, se vuelve regla",
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
    // Rest transform is the stamp's -6deg tilt at scale 1 (a 1.35 scale would read 1.34).
    await expect(page.getByTestId("loop-stamp")).toHaveCSS(
      "transform",
      /^matrix\(0\.99\d*, -0\.10\d*, 0\.10\d*, 0\.99\d*, 0, 0\)$/
    );
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

for (const width of [1440, 1024]) {
  for (const locale of ["en", "es"]) {
    test(`/${locale}/about at ${width}px: two masthead cards share a row, names on one line, block centred on the text axis`, async ({
      browser,
    }) => {
      const context = await browser.newContext({
        viewport: { width, height: 900 },
      });
      const page = await context.newPage();
      await page.goto(`/${locale}/about`);
      const mast = page.getByTestId("masthead");
      const [a, b] = await mast.locator("> *").all();
      const ba = await a.boundingBox();
      const bb = await b.boundingBox();
      expect(Math.abs(ba.y - bb.y), "cards share one row").toBeLessThanOrEqual(
        1
      );
      expect(bb.x, "second card sits right of the first").toBeGreaterThan(
        ba.x + ba.width - 1
      );
      for (const h3 of await mast.locator("h3").all()) {
        const { h, lh } = await h3.evaluate((e) => ({
          h: e.getBoundingClientRect().height,
          lh: parseFloat(getComputedStyle(e).lineHeight),
        }));
        expect(h, "name wraps").toBeLessThan(lh * 1.5);
      }
      const m = await mast.boundingBox();
      const col = await page.locator("main > section").first().boundingBox();
      expect(m.width, "masthead is wider than the text column").toBeGreaterThan(
        col.width + 100
      );
      expect(
        Math.abs(m.x + m.width / 2 - (col.x + col.width / 2)),
        "masthead centre vs column centre"
      ).toBeLessThanOrEqual(2);
      await context.close();
    });
  }
}

test("at 390px the masthead cards stack inside the text column", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 900 },
  });
  const page = await context.newPage();
  await page.goto("/en/about");
  const mast = page.getByTestId("masthead");
  const [a, b] = await mast.locator("> *").all();
  const ba = await a.boundingBox();
  const bb = await b.boundingBox();
  expect(Math.abs(ba.x - bb.x)).toBeLessThanOrEqual(1);
  expect(bb.y).toBeGreaterThan(ba.y + ba.height - 1);
  const col = await page.locator("main > section").first().boundingBox();
  expect(Math.abs(ba.width - col.width)).toBeLessThanOrEqual(1);
  await context.close();
});

test("the graphic is in the server HTML before any JS runs", async ({
  request,
}) => {
  for (const [locale, word] of [
    ["en", "RULE"],
    ["es", "REGLA"],
  ]) {
    const html = await (await request.get(`/${locale}/about`)).text();
    for (const label of STEPS[locale]) expect(html).toContain(label);
    expect(html).toContain(word);
    expect(html).not.toContain('data-motion="');
  }
});

test("with JavaScript disabled all five steps and the stamp show, in the final state", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  await page.goto("/en/about");
  const loop = page.getByTestId("self-improvement-loop");
  await expect(loop.locator("ol > li")).toHaveText(STEPS.en);
  await expect(page.getByTestId("loop-stamp")).toContainText("RULE");
  await expect(page.getByTestId("loop-stamp")).toHaveCSS("opacity", "1");
  for (const li of await loop.locator("ol > li").all()) {
    await expect(li).toHaveCSS("opacity", "1");
  }
  await context.close();
});

// Every animation in the graphic, pseudo-elements included.
const loopAnimations = (page) =>
  page.evaluate(() =>
    document
      .querySelector('[data-testid="self-improvement-loop"]')
      .getAnimations({ subtree: true })
      .map((a) => ({ state: a.playState, t: a.currentTime }))
  );

test("below the fold the graphic stays parked, plays when scrolled to, and never restarts", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  await page.goto("/en/about");
  const loop = page.getByTestId("self-improvement-loop");
  await expect(loop).toHaveAttribute("data-motion", "ready");
  expect(
    await loop.evaluate((e) => e.getBoundingClientRect().top)
  ).toBeGreaterThan(900);
  await page.waitForTimeout(6500); // longer than the whole ~5.2 s run
  const parked = await loopAnimations(page);
  expect(parked.length, "animations exist").toBeGreaterThan(10);
  for (const a of parked) {
    expect(a.state).toBe("paused");
    expect(a.t).toBe(0);
  }
  await loop.scrollIntoViewIfNeeded();
  await expect(loop).toHaveAttribute("data-motion", "play");
  await expect
    .poll(
      async () =>
        (await loopAnimations(page)).every((a) => a.state === "finished"),
      {
        timeout: 9000,
      }
    )
    .toBe(true);
  await expect(page.getByTestId("loop-stamp")).toHaveCSS("opacity", "1");
  // Away and back: no restart.
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  await loop.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await expect(loop).toHaveAttribute("data-motion", "play");
  for (const a of await loopAnimations(page)) expect(a.state).toBe("finished");
  await context.close();
});

test("with the graphic already in view at load it plays once, to the final state", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 3600 },
  });
  const page = await context.newPage();
  await page.goto("/en/about");
  const loop = page.getByTestId("self-improvement-loop");
  await expect(loop).toHaveAttribute("data-motion", "play");
  await expect
    .poll(
      async () =>
        (await loopAnimations(page)).every((a) => a.state === "finished"),
      {
        timeout: 9000,
      }
    )
    .toBe(true);
  await expect(page.getByTestId("loop-stamp")).toHaveCSS("opacity", "1");
  await context.close();
});

const HEADINGS = {
  en: { who: "Who makes it", better: "How it gets better" },
  es: { who: "Quién lo hace", better: "Cómo mejora" },
};

for (const locale of ["en", "es"]) {
  test(`/${locale}/about opens the masthead section with the cards and the better section with the loop`, async ({
    page,
  }) => {
    await page.goto(`/${locale}/about`);
    const firstAfter = (name) =>
      page
        .getByRole("heading", { level: 2, name, exact: true })
        .locator("xpath=following-sibling::*[1]");
    await expect(firstAfter(HEADINGS[locale].who)).toHaveAttribute(
      "data-testid",
      "masthead"
    );
    await expect(firstAfter(HEADINGS[locale].better)).toHaveAttribute(
      "data-testid",
      "self-improvement-loop"
    );
  });
}
