// ABOUTME: E2E check that the Field Manual font aliases (--serif-d, --serif-b, --mono) resolve to the next/font families.
// ABOUTME: Guards against the next/font variable classes living below :root, which leaves the aliases empty.

import { test, expect } from "@playwright/test";

async function computedFamily(page, alias) {
  return page.evaluate((a) => {
    // The parent uses an unrelated family so an undefined alias cannot pass by
    // inheriting a matching family from <body>.
    const host = document.createElement("div");
    host.style.fontFamily = "Arial, sans-serif";
    const el = document.createElement("span");
    el.textContent = "probe";
    el.style.fontFamily = `var(${a})`;
    host.appendChild(el);
    document.body.appendChild(host);
    const family = getComputedStyle(el).fontFamily;
    host.remove();
    return family;
  }, alias);
}

test.describe("font aliases", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/en");
  });

  test("--serif-d resolves to Instrument Serif", async ({ page }) => {
    expect(await computedFamily(page, "--serif-d")).toMatch(
      /^"?Instrument Serif/
    );
  });

  test("--serif-b resolves to Newsreader", async ({ page }) => {
    expect(await computedFamily(page, "--serif-b")).toMatch(/^"?Newsreader/);
  });

  test("--mono resolves to DM Mono", async ({ page }) => {
    expect(await computedFamily(page, "--mono")).toMatch(/^"?DM Mono/);
  });
});
