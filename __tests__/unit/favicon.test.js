// @vitest-environment node
// ABOUTME: Verifies app/favicon.ico packs 16px and 32px PNGs with a cream disc inside the ink ring.
// ABOUTME: The cream fill keeps the mark visible on dark browser tabs; app/icon.png gets the same treatment.

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import sharp from "sharp";

const root = process.cwd();
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47]);

function icoImages(buf) {
  expect(buf.readUInt16LE(0)).toBe(0);
  expect(buf.readUInt16LE(2)).toBe(1);
  const count = buf.readUInt16LE(4);
  return Array.from({ length: count }, (_, i) => {
    const e = 6 + 16 * i;
    const size = buf.readUInt8(e) || 256;
    const length = buf.readUInt32LE(e + 8);
    const offset = buf.readUInt32LE(e + 12);
    return { size, data: buf.subarray(offset, offset + length) };
  });
}

async function pixel(png, x, y) {
  const { data, info } = await sharp(png)
    .raw()
    .ensureAlpha()
    .toBuffer({ resolveWithObject: true });
  const i = (y * info.width + x) * 4;
  return [...data.subarray(i, i + 4)];
}

describe("favicon assets", () => {
  const ico = icoImages(readFileSync(resolve(root, "app/favicon.ico")));

  it("packs a 16px and a 32px PNG image", () => {
    expect(ico.map((i) => i.size).sort((a, b) => a - b)).toEqual([16, 32]);
    ico.forEach((i) =>
      expect(i.data.subarray(0, 4).equals(PNG_MAGIC)).toBe(true)
    );
  });

  it.each([
    ["ico 16px", () => ico.find((i) => i.size === 16).data, 16],
    ["ico 32px", () => ico.find((i) => i.size === 32).data, 32],
    ["icon.png", () => readFileSync(resolve(root, "app/icon.png")), 32],
  ])(
    "%s has an opaque cream disc inside the ring and transparent corners",
    async (_n, get, size) => {
      const png = get();
      const meta = await sharp(png).metadata();
      expect(meta.width).toBe(size);
      // Inside the ink ring, left of the symbol, on the horizontal centre line.
      const [r, g, b, a] = await pixel(png, Math.round(size * 0.2), size / 2);
      expect([r, g, b, a]).toEqual([0xf4, 0xec, 0xdd, 255]);
      expect((await pixel(png, 0, 0))[3]).toBe(0);
    }
  );
});
