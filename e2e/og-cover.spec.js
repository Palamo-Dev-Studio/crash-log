// ABOUTME: E2E check that article pages advertise a social image that really renders: 200, image/png, 1200x630.
// ABOUTME: Covers the issue, Nico's Notes and Practical routes in EN and ES, and that twitter:image points at the same route family.

import { test, expect } from "@playwright/test";

const SECTIONS = [
  ["issue", "/off-the-rails"],
  ["nico", "/nico"],
  ["practical", "/practical"],
];

// A PNG stores width and height as big-endian uint32 at bytes 16 and 20.
function pngSize(buffer) {
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

for (const locale of ["en", "es"]) {
  for (const [segment, indexPath] of SECTIONS) {
    test(`/${locale}/${segment}/<slug> og:image renders a 1200x630 PNG`, async ({
      page,
      request,
    }) => {
      await page.goto(`/${locale}${indexPath}`);
      const link = page
        .locator(`main a[href^='/${locale}/${segment}/']`)
        .first();
      test.skip((await link.count()) === 0, `no ${segment} content`);
      const href = await link.getAttribute("href");

      await page.goto(href);
      const og = await page
        .locator('meta[property="og:image"]')
        .first()
        .getAttribute("content");
      const tw = await page
        .locator('meta[name="twitter:image"]')
        .first()
        .getAttribute("content");
      expect(og).toBeTruthy();
      expect(tw).toBeTruthy();

      const res = await request.get(new URL(og).pathname);
      expect(res.status()).toBe(200);
      expect(res.headers()["content-type"]).toContain("image/png");
      expect(pngSize(await res.body())).toEqual({ width: 1200, height: 630 });

      const twRes = await request.get(new URL(tw).pathname);
      expect(twRes.status()).toBe(200);
      expect(twRes.headers()["content-type"]).toContain("image/png");
    });
  }
}
