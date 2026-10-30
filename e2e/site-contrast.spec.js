// ABOUTME: Property scan for WCAG AA text contrast: every visible text node against its composited effective background.
// ABOUTME: Also hovers buttons and links and re-checks them; all failures are collected and reported at once.

import { test, expect } from "@playwright/test";

const LOCALES = ["en", "es"];

// Runs in the page. Returns failures for every text node under `scope` (or the whole body).
function scan({ scopeSelector, label }) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  // Any CSS colour syntax (rgb, color(srgb ...), color-mix results) -> [r, g, b, a].
  const toRgba = (css) => {
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = "#000";
    ctx.fillStyle = css;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
    return [r, g, b, a / 255];
  };
  const over = ([r, g, b, a], bg) => [
    r * a + bg[0] * (1 - a),
    g * a + bg[1] * (1 - a),
    b * a + bg[2] * (1 - a),
    1,
  ];
  const lum = ([r, g, b]) => {
    const [R, G, B] = [r, g, b].map((c) => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * R + 0.7152 * G + 0.0722 * B;
  };
  const ratio = (a, b) => {
    const x = lum(a);
    const y = lum(b);
    return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
  };

  const effectiveBackground = (el) => {
    const layers = [];
    for (let n = el; n; n = n.parentElement) {
      const cs = getComputedStyle(n);
      const c = toRgba(cs.backgroundColor);
      if (c[3] > 0) layers.push(c);
      if (c[3] === 1) break;
    }
    let bg = [255, 255, 255, 1];
    for (const layer of layers.reverse()) bg = over(layer, bg);
    return bg;
  };
  const effectiveOpacity = (el) => {
    let o = 1;
    for (let n = el; n; n = n.parentElement) {
      o *= parseFloat(getComputedStyle(n).opacity);
    }
    return o;
  };

  const scope = scopeSelector
    ? document.querySelector(scopeSelector)
    : document.body;
  const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT);
  const seen = new Set();
  const failures = [];
  let checked = 0;
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (!node.nodeValue.trim()) continue;
    const el = node.parentElement;
    if (!el || seen.has(el)) continue;
    if (
      el.closest(
        "script, style, noscript, svg, [aria-hidden='true'], :disabled"
      )
    )
      continue;
    if (!el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }))
      continue;
    const rect = el.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) continue;
    // Off-screen skip-link text and similar.
    if (rect.right < 0 || rect.bottom < 0 || rect.left > innerWidth + 5000)
      continue;
    seen.add(el);
    checked++;
    const cs = getComputedStyle(el);
    const bg = effectiveBackground(el);
    const fgRaw = toRgba(cs.color);
    fgRaw[3] *= effectiveOpacity(el);
    const fg = over(fgRaw, bg);
    const size = parseFloat(cs.fontSize);
    const bold = parseInt(cs.fontWeight, 10) >= 700;
    const large = size >= 24 || (size >= 18.66 && bold);
    const need = large ? 3 : 4.5;
    const got = ratio(fg, bg);
    if (got < need) {
      failures.push({
        label,
        el: `${el.tagName.toLowerCase()}.${String(el.className).split(" ")[0]}`,
        text: node.nodeValue.trim().slice(0, 30),
        ratio: Math.round(got * 100) / 100,
        need,
        fg: cs.color,
      });
    }
  }
  return { failures, checked };
}

const format = (f) =>
  `${f.label} ${f.el} "${f.text}" ${f.ratio}:1 < ${f.need}:1 (fg ${f.fg})`;

async function pickRoutes(request) {
  const res = await request.get("/sitemap.xml");
  const xml = await res.text();
  const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (m) => new URL(m[1]).pathname
  );
  const routes = [];
  for (const locale of LOCALES) {
    const first = (re) => paths.find((p) => re.test(p));
    routes.push(
      `/${locale}`,
      first(new RegExp(`^/${locale}/issue/`)),
      first(new RegExp(`^/${locale}/nico/[^/]+$`)),
      `/${locale}/off-the-rails`,
      `/${locale}/practical`,
      `/${locale}/archive?q=the`,
      `/${locale}/about`,
      `/${locale}/support`,
      `/${locale}/nonexistent`
    );
  }
  return [...new Set(routes.filter(Boolean))];
}

test.describe.configure({ mode: "parallel" });

for (const locale of LOCALES) {
  test(`text meets WCAG AA at rest and on hover (${locale})`, async ({
    browser,
    request,
  }) => {
    test.setTimeout(300000);
    const routes = (await pickRoutes(request)).filter((r) =>
      r.startsWith(`/${locale}`)
    );
    expect(routes.length).toBeGreaterThanOrEqual(8);
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    const failures = [];
    let nodesChecked = 0;
    let elementsChecked = 0;
    for (const route of routes) {
      await page.goto(route, { waitUntil: "load" });
      const rest = await page.evaluate(scan, { label: route });
      failures.push(...rest.failures);
      elementsChecked += rest.checked;
      expect(rest.checked, `${route} had no text to scan`).toBeGreaterThan(5);

      // Hover states: first three of each distinct button/link class.
      const targets = await page.evaluate(() => {
        const perClass = new Map();
        const out = [];
        document
          .querySelectorAll("a[href], button:not(:disabled)")
          .forEach((el, i) => {
            if (!el.checkVisibility()) return;
            const rect = el.getBoundingClientRect();
            if (rect.width < 2 || rect.height < 2 || rect.left < 0) return;
            const key = el.tagName + el.className;
            const n = perClass.get(key) ?? 0;
            if (n >= 3) return;
            perClass.set(key, n + 1);
            el.setAttribute("data-cx", String(i));
            out.push(i);
          });
        return out;
      });
      nodesChecked += targets.length;
      for (const i of targets) {
        const handle = page.locator(`[data-cx="${i}"]`);
        try {
          await handle.scrollIntoViewIfNeeded({ timeout: 2000 });
          await handle.hover({ timeout: 2000 });
        } catch {
          continue; // covered, moved or detached: nothing to hover
        }
        const hovered = await page.evaluate(scan, {
          scopeSelector: `[data-cx="${i}"]`,
          label: `${route} :hover`,
        });
        failures.push(...hovered.failures);
      }
    }
    await context.close();
    const unique = [...new Set(failures.map(format))];
    expect(
      unique,
      `${routes.length} routes, ${elementsChecked} text elements, ${nodesChecked} hover targets`
    ).toEqual([]);
  });
}
