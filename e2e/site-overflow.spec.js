// ABOUTME: Crawls every sitemap route (plus 404s) at 320/360/390px and asserts no horizontal overflow.
// ABOUTME: Failures are collected across all routes and reported together as route x width x overflow px.

import { test, expect } from "@playwright/test";

const WIDTHS = [320, 360, 390];
const EXTRA_ROUTES = ["/en/nonexistent", "/es/nonexistent"];

async function crawlRoutes(request) {
  const res = await request.get("/sitemap.xml");
  expect(res.ok()).toBe(true);
  const xml = await res.text();
  const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (m) => new URL(m[1]).pathname
  );
  return [...new Set([...paths, ...EXTRA_ROUTES])];
}

test.describe.configure({ mode: "parallel" });

for (const width of WIDTHS) {
  test(`no horizontal overflow at ${width}px on every route`, async ({
    browser,
    request,
  }) => {
    test.setTimeout(600000);
    const routes = await crawlRoutes(request);
    expect(routes.length).toBeGreaterThan(10);
    const context = await browser.newContext({
      viewport: { width, height: 800 },
    });
    const page = await context.newPage();
    const failures = [];
    for (const route of routes) {
      await page.goto(route, { waitUntil: "load" });
      const { scrollWidth, innerWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
      }));
      if (scrollWidth > innerWidth) {
        failures.push(`${route} @${width}: +${scrollWidth - innerWidth}px`);
      }
    }
    await context.close();
    expect(failures, `${routes.length} routes crawled`).toEqual([]);
  });
}
