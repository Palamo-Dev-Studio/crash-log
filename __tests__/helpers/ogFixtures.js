// ABOUTME: Image fixtures for the OG cover tests: solid-colour JPEGs, a CMYK JPEG, a truncated JPEG and PNGs.
// ABOUTME: Built with sharp (a devDependency) so the real bytes reach the real decoder; also reads pixels back out of a PNG.

import sharp from "sharp";

export const CREAM = { r: 0xf4, g: 0xec, b: 0xdd };
export const COVER_COLOUR = { r: 200, g: 30, b: 30 };

const solid = (channels, background, width = 1200, height = 630) =>
  sharp({ create: { width, height, channels, background } });

export const solidJpeg = (colour = COVER_COLOUR) =>
  solid(3, colour).jpeg({ quality: 90 }).toBuffer();

export const cmykJpeg = () =>
  solid(3, COVER_COLOUR).toColourspace("cmyk").jpeg().toBuffer();

// A real JPEG with its tail cut off: no EOI marker.
export async function truncatedJpeg() {
  const full = await solidJpeg();
  return full.subarray(0, full.length - 40);
}

export const junkBytes = () => Buffer.from("this is not an image at all");

export const opaquePng = (colour = COVER_COLOUR) =>
  solid(4, { ...colour, alpha: 1 })
    .png()
    .toBuffer();

export const transparentPng = () =>
  solid(4, { r: 0, g: 0, b: 0, alpha: 0 }).png().toBuffer();

export const blackRgbPng = () =>
  solid(3, { r: 0, g: 0, b: 0 }).png().toBuffer();

// Reads one pixel of a PNG (or any image) as {r, g, b, a}.
export async function pixelAt(imageBytes, x, y) {
  const { data, info } = await sharp(Buffer.from(imageBytes))
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const i = (y * info.width + x) * 4;
  return { r: data[i], g: data[i + 1], b: data[i + 2], a: data[i + 3] };
}

export const near = (actual, expected, tolerance = 10) =>
  ["r", "g", "b"].every((k) => Math.abs(actual[k] - expected[k]) <= tolerance);
