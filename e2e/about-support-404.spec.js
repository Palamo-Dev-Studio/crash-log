// ABOUTME: E2E tests for the About, Support and 404 pages: copy, branded catch-all 404 status, real routes still 200, no sideways scroll.
// ABOUTME: The overflow crawl covers 320/360/390px in EN and ES.

import { test, expect } from "@playwright/test";

const WIDTHS = [320, 360, 390];

test.describe("branded 404 catch-all", () => {
  for (const [locale, kicker] of [
    ["en", "404 · File not found"],
    ["es", "404 · Archivo no encontrado"],
  ]) {
    test(`/${locale}/nonexistent is a 404 inside the site layout`, async ({
      page,
    }) => {
      const response = await page.goto(`/${locale}/nonexistent`);
      expect(response.status()).toBe(404);
      await expect(page.getByText(kicker)).toBeVisible();
      // Inside the layout: masthead nav and footer are present.
      await expect(page.locator("footer")).toBeVisible();
      await expect(page.locator("nav").first()).toBeVisible();
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
    });
  }

  test("a deep unmatched path is also a branded 404", async ({ page }) => {
    const response = await page.goto("/en/no/such/path");
    expect(response.status()).toBe(404);
    await expect(page.getByText("404 · File not found")).toBeVisible();
  });

  test("the 404 links reach Latest and the Archive", async ({ page }) => {
    await page.goto("/es/nonexistent");
    await expect(
      page.getByRole("link", { name: "Archivo" }).last()
    ).toHaveAttribute("href", "/es/archive");
  });

  for (const path of [
    "/en",
    "/en/about",
    "/en/support",
    "/en/archive",
    "/en/beats",
    "/en/nico",
    "/en/practical",
    "/en/off-the-rails",
    "/en/feed.xml",
    "/es/about",
  ]) {
    test(`real route ${path} still returns 200`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response.status()).toBe(200);
    });
  }

  test("a real issue page still returns 200", async ({ page }) => {
    await page.goto("/en/archive");
    const href = await page
      .locator('a[href*="/issue/"]')
      .first()
      .getAttribute("href");
    const response = await page.goto(href);
    expect(response.status()).toBe(200);
  });
});

test.describe("About page", () => {
  test("EN shows the lead and a two-person masthead", async ({ page }) => {
    await page.goto("/en/about");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const names = await page
      .locator("main h3")
      .evaluateAll((els) => els.map((e) => e.textContent.trim()));
    expect(names.length).toBeLessThanOrEqual(6);
    expect(names).toContain("Hector Luis Alamo");
  });
});

test.describe("Support page", () => {
  test("EN headline", async ({ page }) => {
    await page.goto("/en/support");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Feed the Agents"
    );
  });

  test("ES headline", async ({ page }) => {
    await page.goto("/es/support");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Alimenta a los agentes"
    );
  });

  test("the frequency toggle shows a visible focus ring", async ({ page }) => {
    await page.goto("/en/support");
    await page.getByRole("button", { name: "One-time" }).focus();
    await page.keyboard.press("Tab");
    const outline = await page
      .getByRole("button", { name: "Monthly" })
      .evaluate((el) => getComputedStyle(el).outlineStyle);
    expect(outline).not.toBe("none");
  });
});

test.describe("no horizontal overflow", () => {
  for (const locale of ["en", "es"]) {
    for (const path of ["about", "support", "nonexistent"]) {
      for (const width of WIDTHS) {
        test(`/${locale}/${path} at ${width}px`, async ({ page }) => {
          await page.setViewportSize({ width, height: 800 });
          await page.goto(`/${locale}/${path}`);
          const overflow = await page.evaluate(
            () => document.documentElement.scrollWidth - window.innerWidth
          );
          expect(overflow).toBeLessThanOrEqual(0);
        });
      }
    }
  }
});
