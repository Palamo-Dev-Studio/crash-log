// ABOUTME: E2E checks that article pages advertise a social image that renders (200, image/png, 1200x630) in EN and ES.
// ABOUTME: A practical page with a Sanity cover must share the cover, not the cream TitleCard, measured by the card's cream pixel share.

import { test, expect } from "@playwright/test";
import sharp from "sharp";

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

// Share of pixels within 6 per channel of the TitleCard's cream (#F4ECDD).
async function creamShare(bytes) {
  const { data } = await sharp(bytes)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let cream = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (
      Math.abs(data[i] - 0xf4) <= 6 &&
      Math.abs(data[i + 1] - 0xec) <= 6 &&
      Math.abs(data[i + 2] - 0xdd) <= 6
    )
      cream += 1;
  }
  return cream / (data.length / 4);
}

async function ogBytes(page, request, path) {
  await page.goto(path);
  const og = await page
    .locator('meta[property="og:image"]')
    .first()
    .getAttribute("content");
  const res = await request.get(new URL(og).pathname);
  expect(res.status()).toBe(200);
  return res.body();
}

test.describe("cover image as the social preview", () => {
  test("the practical index card is mostly cream, so the share measure tells a TitleCard apart", async ({
    page,
    request,
  }) => {
    const share = await creamShare(
      await ogBytes(page, request, "/en/practical")
    );
    expect(share).toBeGreaterThan(0.5);
  });

  for (const locale of ["en", "es"]) {
    test(`/${locale}/practical/2026-11-18 (has a cover) shares the cover, not the TitleCard`, async ({
      page,
      request,
    }) => {
      const path = `/${locale}/practical/2026-11-18`;
      await page.goto(path);
      await expect(page.locator("figure[class*='cover'] img")).toHaveCount(1);
      const share = await creamShare(await ogBytes(page, request, path));
      expect(share).toBeLessThan(0.5);
    });
  }
});
