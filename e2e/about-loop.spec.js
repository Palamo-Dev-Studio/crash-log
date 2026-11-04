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
    "Tres repeticiones forman una regla",
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
  test(`/${locale}/about content column is centered at 1440px`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();
    await page.goto(`/${locale}/about`);
    for (const selector of ["main > section", "main > header"]) {
      const box = await page.locator(selector).first().boundingBox();
      const left = box.x;
      const right = 1440 - (box.x + box.width);
      expect(Math.abs(left - right), selector).toBeLessThanOrEqual(3);
      expect(box.width, selector).toBeLessThan(800);
    }
    await context.close();
  });
}
