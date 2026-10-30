// ABOUTME: E2E tests for the global chrome: masthead cursor motion, mobile overflow, nav row, language toggle.
// ABOUTME: Runs against the dev server; no Sanity data needed (chrome renders on every route).

import { test, expect } from "@playwright/test";

const cursorStyle = (page) =>
  page.evaluate(() => {
    const brand = document.querySelector("header a");
    const cursor = Array.from(brand.querySelectorAll("span")).find(
      (el) =>
        el.matches('[aria-hidden="true"]') && el.className.includes("cursor")
    );
    const cs = getComputedStyle(cursor);
    return {
      name: cs.animationName,
      duration: cs.animationDuration,
      timing: cs.animationTimingFunction,
    };
  });

test.describe("cursor motion", () => {
  test("blinks with a 1s animation by default", async ({ page }) => {
    await page.goto("/en");
    const style = await cursorStyle(page);
    expect(style.name).toMatch(/blink/);
    expect(style.duration).toBe("1s");
    // A hard on/off blink, not a fade: steps(1) (Chromium reports it as steps(1)).
    expect(style.timing).toMatch(/^steps\(1(, (end|jump-end))?\)$/);
  });
});

test.describe("cursor motion with reduced motion", () => {
  test("is static under prefers-reduced-motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/en");
    expect((await cursorStyle(page)).name).toBe("none");
  });
});

test.describe("mobile layout", () => {
  for (const path of ["/en", "/es"]) {
    test(`no horizontal page overflow at 360px on ${path}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 360, height: 800 });
      await page.goto(path);
      const width = await page.evaluate(
        () => document.documentElement.scrollWidth
      );
      expect(width).toBeLessThanOrEqual(360);
    });
  }

  test("nav is one row at 390px and scrolls horizontally", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto("/en");
    const nav = page.locator("nav[aria-label='Sections']");
    const tops = await nav
      .locator("a")
      .evaluateAll((els) => els.map((el) => el.offsetTop));
    expect(tops).toHaveLength(6);
    expect(new Set(tops).size).toBe(1);
    const { scrollWidth, clientWidth } = await nav.evaluate((el) => ({
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
    }));
    expect(scrollWidth).toBeGreaterThan(clientWidth);
  });
});

test.describe("mobile nav scroller", () => {
  test.use({ viewport: { width: 390, height: 800 } });

  test("the last link is not faded by the mask when scrolled to the end", async ({
    page,
  }) => {
    await page.goto("/en");
    const nav = page.locator("nav[aria-label='Sections']");
    await nav.evaluate((el) => {
      el.scrollLeft = el.scrollWidth;
    });
    const last = nav.locator("a").last();
    const box = await last.boundingBox();
    const clip = {
      x: box.x - 2,
      y: box.y,
      width: box.width + 4,
      height: box.height,
    };
    const masked = await page.screenshot({ clip });
    await nav.evaluate((el) => {
      el.style.setProperty("mask-image", "none", "important");
      el.style.setProperty("-webkit-mask-image", "none", "important");
    });
    const unmasked = await page.screenshot({ clip });
    expect(masked.equals(unmasked)).toBe(true);
  });

  test("focus rings on the first and last links fit inside the scroller", async ({
    page,
  }) => {
    await page.goto("/en");
    const nav = page.locator("nav[aria-label='Sections']");
    const links = nav.locator("a");
    // 2px outline + 3px offset
    const RING = 5;
    const ringFits = async (link, atEnd) => {
      await nav.evaluate((el, end) => {
        el.scrollLeft = end ? el.scrollWidth : 0;
      }, atEnd);
      await link.focus();
      const [l, n] = await Promise.all([link.boundingBox(), nav.boundingBox()]);
      expect(l.y - RING).toBeGreaterThanOrEqual(n.y);
      expect(l.y + l.height + RING).toBeLessThanOrEqual(n.y + n.height);
      expect(l.x - RING).toBeGreaterThanOrEqual(n.x);
      expect(l.x + l.width + RING).toBeLessThanOrEqual(n.x + n.width);
    };
    await ringFits(links.first(), false);
    await ringFits(links.last(), true);
  });

  test("screenshots: nav scrolled to end with About focused", async ({
    page,
  }) => {
    await page.goto("/en");
    const nav = page.locator("nav[aria-label='Sections']");
    await nav.evaluate((el) => {
      el.scrollLeft = el.scrollWidth;
    });
    await nav.locator("a").last().focus();
    await page.screenshot({
      path: "test-results/nav-390-end-about-focused.png",
      clip: { x: 0, y: 0, width: 390, height: 260 },
    });
  });
});

test.describe("footer fine print at 390px", () => {
  test.use({ viewport: { width: 390, height: 800 } });

  test("copyright and publication share one row, as in the reference render", async ({
    page,
  }) => {
    await page.goto("/en");
    const tops = await page
      .locator("footer span[class*='seg']:not([class*='segs'])")
      .evaluateAll((els) =>
        els.map((el) => Math.round(el.getBoundingClientRect().top))
      );
    expect(tops).toHaveLength(2);
    expect(tops[0]).toBe(tops[1]);
  });
});

test.describe("masthead toggle is never squeezed", () => {
  for (const width of [360, 390]) {
    for (const path of ["/en", "/es"]) {
      test(`EN and ES fully visible at ${width}px on ${path}`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 800 });
        await page.goto(path);
        const toggle = page.locator("header [class*='toggle']");
        const natural = (await toggle.boundingBox()).width;
        // Force pressure: a wide sibling must not be able to squeeze the toggle.
        await page
          .locator("header a[href*='substack']")
          .evaluate((el) => (el.style.paddingInline = "200px"));
        expect((await toggle.boundingBox()).width).toBeCloseTo(natural, 0);
        const { scrollWidth, clientWidth } = await toggle.evaluate((el) => ({
          scrollWidth: el.scrollWidth,
          clientWidth: el.clientWidth,
        }));
        expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
        for (const name of ["EN", "ES"]) {
          const box = await toggle
            .getByRole("link", { name, exact: true })
            .boundingBox();
          const t = await toggle.boundingBox();
          expect(box.x).toBeGreaterThanOrEqual(t.x);
          expect(box.x + box.width).toBeLessThanOrEqual(t.x + t.width + 0.5);
          expect(box.width).toBeGreaterThan(20);
        }
      });
    }
  }
});

test.describe("masthead Subscribe", () => {
  test("is a plain link to Substack", async ({ page }) => {
    await page.goto("/en");
    const link = page
      .locator("header")
      .getByRole("link", { name: "Subscribe" });
    await expect(link).toHaveAttribute(
      "href",
      "https://aicrashlog.substack.com/subscribe"
    );
    await page.goto("/es");
    await expect(
      page.locator("header").getByRole("link", { name: "Suscríbete" })
    ).toBeVisible();
  });
});

test.describe("language toggle", () => {
  test("clicking ES on /en/archive lands on /es/archive", async ({ page }) => {
    await page.goto("/en/archive");
    await page
      .locator("header")
      .getByRole("link", { name: "ES", exact: true })
      .click();
    await page.waitForURL("**/es/archive");
    expect(page.url()).toContain("/es/archive");
  });

  test("clicking ES keeps the query string", async ({ page }) => {
    await page.goto("/en/archive?q=hallucination");
    await page
      .locator("header")
      .getByRole("link", { name: "ES", exact: true })
      .click();
    await page.waitForURL("**/es/archive?q=hallucination");
    expect(new URL(page.url()).searchParams.get("q")).toBe("hallucination");
  });
});

// Hector's rule: no weekday names or MON/WED/FRI labels in the chrome. Names
// come from Intl (long only: short es names collide with month abbreviations).
// Dates are covered by lib/formatDate tests and the ESLint ban.
const weekdayNames = () => {
  const names = new Set();
  for (const locale of ["en", "es"]) {
    const fmt = new Intl.DateTimeFormat(locale, {
      weekday: "long",
      timeZone: "UTC",
    });
    for (let d = 1; d <= 7; d++) {
      names.add(fmt.format(new Date(Date.UTC(2026, 0, d))));
    }
  }
  return [...names];
};

const escapeRe = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

test.describe("no weekday labels in chrome", () => {
  const pages = ["/en", "/es", "/en/archive", "/es/nico"];

  const scan = async (page) => {
    // Join text nodes with spaces so adjacent elements ("ES" + "MON") never
    // fuse into one word and slip past the word-boundary match.
    const texts = await page.evaluate(() =>
      [...document.querySelectorAll("header, nav[aria-label], footer")].map(
        (el) => {
          const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
          const parts = [];
          while (walker.nextNode()) parts.push(walker.currentNode.nodeValue);
          return parts.join(" ");
        }
      )
    );
    const text = texts.join("\n");
    const names = weekdayNames();
    expect(names.length).toBeGreaterThan(10);
    for (const name of names) {
      expect(text, `weekday "${name}"`).not.toMatch(
        new RegExp(`(?<![\\p{L}])${escapeRe(name)}(?![\\p{L}])`, "iu")
      );
    }
    expect(text).not.toMatch(/\b(MON|WED|FRI)\b/);
  };

  for (const path of pages) {
    test(`${path}`, async ({ page }) => {
      await page.goto(path);
      await scan(page);
    });
  }

  test("an issue page and a column page", async ({ page }) => {
    await page.goto("/en/archive");
    const issue = await page
      .locator('a[href*="/issue/"]')
      .first()
      .getAttribute("href");
    await page.goto(issue);
    await scan(page);
    await page.goto("/en/nico");
    const column = await page
      .locator('a[href*="/nico/"]:not([href$="feed.xml"])')
      .first()
      .getAttribute("href");
    await page.goto(column);
    await scan(page);
  });
});

test.describe("masthead buttons", () => {
  for (const width of [1440, 980]) {
    test(`Support and Subscribe match in height and top at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/en");
      const rect = (name) =>
        page
          .locator("header")
          .getByRole("link", { name, exact: true })
          .evaluate((el) => {
            const r = el.getBoundingClientRect();
            return { height: r.height, top: r.top };
          });
      const support = await rect("Support");
      const subscribe = await rect("Subscribe");
      expect(Math.abs(support.height - subscribe.height)).toBeLessThanOrEqual(
        0.5
      );
      expect(Math.abs(support.top - subscribe.top)).toBeLessThanOrEqual(0.5);
    });
  }
});
