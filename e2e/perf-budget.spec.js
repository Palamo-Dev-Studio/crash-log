// ABOUTME: Throttled slow-4G budget checks (LCP and CLS) for the home page and the series indexes, in the web-build harness' conditions.
// ABOUTME: Runs only on a production build with one worker (E2E_PROD=1, --workers=1): timings under next dev or parallel workers are noise.

import { test, expect } from "@playwright/test";

test.describe.configure({ mode: "serial" });

test.beforeEach(({}, testInfo) => {
  test.skip(
    process.env.E2E_PROD !== "1" || testInfo.config.workers !== 1,
    "throttled budget checks need E2E_PROD=1 and --workers=1"
  );
});

// 150 ms RTT, 1.6 Mbps down, 750 Kbps up, 4x CPU, DPR 1: the floor harness' network and CPU model.
async function measure(browser, viewport, url) {
  const mobile = viewport.width < 600;
  const ctx = await browser.newContext({
    viewport,
    isMobile: mobile,
    hasTouch: mobile,
    deviceScaleFactor: 1,
  });
  await ctx.addInitScript(() => {
    window.__m = { lcp: 0, lcpTag: "", cls: 0 };
    new PerformanceObserver((l) =>
      l.getEntries().forEach((e) => {
        window.__m.lcp = e.startTime;
        window.__m.lcpTag = e.element ? e.element.tagName : "";
      })
    ).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((l) =>
      l.getEntries().forEach((e) => {
        if (!e.hadRecentInput) window.__m.cls += e.value;
      })
    ).observe({ type: "layout-shift", buffered: true });
  });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 150,
    downloadThroughput: (1.6 * 1024 * 1024) / 8,
    uploadThroughput: (750 * 1024) / 8,
  });
  await page.goto(url, { waitUntil: "load" });
  await page.waitForTimeout(4500);
  const m = await page.evaluate(() => window.__m);
  await ctx.close();
  return m;
}

// A load spike on the machine can inflate one run (a late font, a slow image). A real regression shows in
// every run, so each check takes the better of two runs.
async function best(browser, viewport, url, key) {
  const a = await measure(browser, viewport, url);
  const b = await measure(browser, viewport, url);
  return a[key] <= b[key] ? a : b;
}

const MOBILE = { width: 390, height: 844 };

for (const path of [
  "/en",
  "/en/off-the-rails",
  "/es/off-the-rails",
  "/en/nico",
  "/en/practical",
]) {
  test(`mobile LCP on ${path} is an image and under 2.5 s`, async ({
    browser,
  }) => {
    test.setTimeout(90000);
    const m = await best(browser, MOBILE, path, "lcp");
    expect(m.lcpTag).toBe("IMG");
    expect(m.lcp).toBeLessThan(2500);
  });
}

// CLS limits per page: the web-build harness' origin/main baseline for the page (from the first floor run,
// wb-mag-run1 report.json "baseline") plus 0.00005. The harness rounds CLS to 4 decimals against the baseline with a
// cap of 0, so a page whose baseline is 0 must stay under 0.00005 (a 0.0002 shift is a failure there).
// The article limits come from the same method run on origin/main (a526f14): 0.00196 at 1440, 0 at 390.
const CLS_LIMITS = {
  "/en/nico": { desktop: 0.00021, mobile: 0.00005 },
  "/en/off-the-rails": { desktop: 0.00021, mobile: 0.00005 },
  // /es/off-the-rails has a baseline mobile CLS of 0.0147 (the page head's dek re-wraps in ES, on origin/main too):
  // the limit is the 4-decimal rounding boundary above it, so the branch must not add to it.
  "/es/off-the-rails": { desktop: 0.00021, mobile: 0.01475 },
  "/en/practical": { desktop: 0.00005, mobile: 0.00005 },
  // /es/practical on origin/main (a526f14, 3 runs): mobile 0; desktop 0.0091 at 1440 (0.00897-0.00912), 0.0145 at
  // 1100 (0.01422-0.01448), 0.0158 at 1024 (0.01579). The ES page head's dek re-wraps when Newsreader loads and moves
  // everything below it (the same cause as /es/off-the-rails above). Limits are the 4-decimal rounding boundary above
  // those. HEAD (3 runs): mobile 0; 0.01125 at 1440, 0.01478 at 1100, 0.01582 at 1024.
  "/es/practical": {
    desktop: { 1440: 0.00915, 1100: 0.01455, 1024: 0.01585 },
    mobile: 0.00005,
  },
  "/en/issue/crash-log-023": { desktop: 0.00201, mobile: 0.00005 },
};

// HEAD is above main's baseline on /es/practical at 1440 (+0.0021) and 1100 (+0.0005): the lead adds its own title
// re-wrap shift at 1440 (0.00194: the long ES title takes 3 lines in the fallback face and 2 in Instrument Serif) and
// more content under the page head's dek reflow, which raises the shift's impact area. Not under the strict-heights
// refusal: these are in the first viewport and counted by CLS. Hector ruled to ship it disclosed (#crash-log 1567702842754736140, 2026-11-05, option A); the pre-existing ES page-head dek re-wrap gets a separate fix. Left as fixme until then.
const KNOWN_ABOVE_BASELINE = new Set([
  "/es/practical@1440",
  "/es/practical@1100",
]);

for (const [path, limit] of Object.entries(CLS_LIMITS)) {
  const widths = path.startsWith("/en/issue/") ? [1440] : [1440, 1100, 1024];
  for (const width of widths) {
    const max =
      typeof limit.desktop === "number" ? limit.desktop : limit.desktop[width];
    const define = KNOWN_ABOVE_BASELINE.has(`${path}@${width}`)
      ? test.fixme
      : test;
    define(
      `CLS on ${path} at ${width}px stays under ${max}`,
      async ({ browser }) => {
        test.setTimeout(90000);
        const m = await best(browser, { width, height: 900 }, path, "cls");
        expect(m.cls).toBeLessThan(max);
      }
    );
  }
  test(`CLS on ${path} at 390px stays under ${limit.mobile}`, async ({
    browser,
  }) => {
    test.setTimeout(90000);
    const m = await best(browser, MOBILE, path, "cls");
    expect(m.cls).toBeLessThan(limit.mobile);
  });
}
