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

test.describe("footer fine print on narrow screens", () => {
  for (const width of [360, 390]) {
    for (const path of ["/en", "/es"]) {
      test(`copyright and languages share one row at ${width}px on ${path}`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 800 });
        await page.goto(path);
        const fine = page.locator("footer div[class*='fine']");
        const copyright = fine.locator(
          "span[class*='seg']:not([class*='segs'])"
        );
        const langs = fine.locator("[role='group']");
        await expect(copyright).toHaveCount(1);
        await expect(copyright).toContainText("The Crash Log");

        // Copyright stays on a single line.
        const lineHeight = await copyright.evaluate((el) =>
          parseFloat(getComputedStyle(el).lineHeight)
        );
        const c = await copyright.boundingBox();
        expect(c.height).toBeLessThan(lineHeight * 1.5);

        // Copyright and EN · ES links sit on one row, and the row fits.
        const l = await langs.boundingBox();
        expect(Math.abs(c.y - l.y)).toBeLessThan(lineHeight / 2);
        const { scrollWidth, clientWidth } = await fine.evaluate((el) => ({
          scrollWidth: el.scrollWidth,
          clientWidth: el.clientWidth,
        }));
        expect(scrollWidth).toBeLessThanOrEqual(clientWidth);

        // The publication credit lives in the Elsewhere column, not here.
        await expect(fine).not.toContainText(/Palamo/i);
      });
    }
  }
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

// Hector's rule: no weekday names or weekday abbreviations in the chrome. Names
// come from Intl. Short names that equal a month abbreviation in either locale
// (es "mar" is Tuesday and March) are dropped, so a date label cannot trip the scan.
// Dates are covered by lib/formatDate tests and the ESLint ban.
const intlNames = (kind, style, count, start) => {
  const names = new Set();
  for (const locale of ["en", "es"]) {
    const fmt = new Intl.DateTimeFormat(locale, {
      [kind]: style,
      timeZone: "UTC",
    });
    for (let i = 0; i < count; i++) {
      const date =
        kind === "weekday"
          ? new Date(Date.UTC(2026, 0, start + i))
          : new Date(Date.UTC(2026, i, 1));
      names.add(fmt.format(date).replace(/\.$/, ""));
    }
  }
  return [...names];
};
const weekdayNames = () => intlNames("weekday", "long", 7, 1);
const shortWeekdayNames = () => {
  const months = new Set(
    intlNames("month", "short", 12, 0).map((m) => m.toLowerCase())
  );
  return intlNames("weekday", "short", 7, 1).filter(
    (name) => !months.has(name.toLowerCase())
  );
};

const escapeRe = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const wordRe = (name) =>
  new RegExp(`(?<![\\p{L}])${escapeRe(name)}(?![\\p{L}])`, "iu");

test.describe("no weekday labels in chrome", () => {
  const pages = [
    "/en",
    "/es",
    "/en/archive",
    "/es/nico",
    "/en/off-the-rails",
    "/es/off-the-rails",
    "/en/issue/crash-log-027",
    "/es/issue/crash-log-027",
  ];

  const scan = async (page) => {
    // Join text nodes with spaces so adjacent elements ("ES" + "MON") never
    // fuse into one word and slip past the word-boundary match.
    // `rendered` is innerText: what the reader sees after text-transform
    // (so "Mon" in the source shows as "MON"). Matching is case-insensitive on both.
    const texts = await page.evaluate(() =>
      [...document.querySelectorAll("header, nav[aria-label], footer")].map(
        (el) => {
          const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
          const parts = [];
          while (walker.nextNode()) parts.push(walker.currentNode.nodeValue);
          return { source: parts.join(" "), rendered: el.innerText };
        }
      )
    );
    const text = texts.map((t) => `${t.source}\n${t.rendered}`).join("\n");
    const names = weekdayNames();
    expect(names.length).toBeGreaterThan(10);
    for (const name of names) {
      expect(text, `weekday "${name}"`).not.toMatch(wordRe(name));
    }
    const shortNames = shortWeekdayNames();
    expect(shortNames.length).toBeGreaterThan(8);
    for (const name of shortNames) {
      expect(text, `short weekday "${name}"`).not.toMatch(wordRe(name));
    }
  };

  test("the short-name matcher sees uppercased and lowercased labels", () => {
    const names = shortWeekdayNames();
    for (const probe of ["MON", "mon", "Wed", "FRI", "vie", "SÁB", "jue"]) {
      expect(
        names.some((n) => wordRe(n).test(`ES ${probe} 12`)),
        probe
      ).toBe(true);
    }
    expect(names.some((n) => wordRe(n).test("MAR 12"))).toBe(false);
  });

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
