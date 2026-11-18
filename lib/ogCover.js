// ABOUTME: Cover-image variant of the Open Graph card: the article's Sanity cover, full-bleed at 1200x630.
// ABOUTME: renderCoverImage returns null on any fetch, decode or render problem, so callers fall back to the TitleCard.

import { inflateSync } from "node:zlib";
import { urlFor } from "@/lib/sanity";
import { OG_SIZE, renderOgImage } from "@/lib/ogTemplate";

const FETCH_TIMEOUT_MS = 5000;
const COVER_TYPE = "image/jpeg";

// Sanity builds the crop rect and hotspot into the URL; fit("crop") applies them at 1200x630.
// JPEG, because the OG renderer does not decode WebP.
export function coverOgUrl(coverImage) {
  return urlFor(coverImage)
    .width(OG_SIZE.width)
    .height(OG_SIZE.height)
    .fit("crop")
    .format("jpg")
    .quality(85)
    .url();
}

export function CoverCard({ src }) {
  return (
    <div style={{ display: "flex", width: "100%", height: "100%" }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- the OG renderer takes a plain img, not next/image */}
      <img
        src={src}
        alt=""
        width={OG_SIZE.width}
        height={OG_SIZE.height}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </div>
  );
}

// A JPEG the OG renderer can decode: SOI marker, EOI marker, and a start-of-frame
// header that declares 1 (grey) or 3 (YCbCr) colour components. The renderer throws on
// non-JPEG bytes and paints a transparent image for CMYK (4 components) and truncated files.
export function isRenderableJpeg(bytes) {
  const n = bytes.length;
  if (n < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes[2] !== 0xff)
    return false;
  if (bytes[n - 2] !== 0xff || bytes[n - 1] !== 0xd9) return false;
  let pos = 2;
  while (pos + 4 <= n) {
    if (bytes[pos] !== 0xff) return false;
    const marker = bytes[pos + 1];
    if (marker === 0xff) {
      pos += 1; // fill byte
      continue;
    }
    if (marker === 0xda || marker === 0xd9) return false; // scan or end before any frame header
    const isFrame =
      marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker);
    if (isFrame) {
      const components = bytes[pos + 9];
      return components === 1 || components === 3;
    }
    pos += 2 + ((bytes[pos + 2] << 8) | bytes[pos + 3]);
  }
  return false;
}

// True when an 8-bit RGBA PNG carries no pixel data at all, the blank canvas the renderer
// leaves when it cannot paint an image. Every pixel byte of a zeroed canvas is zero under
// any PNG row filter, so only the one filter-type byte per row is skipped. Any other PNG
// layout is reported as not blank: this check can miss a blank image, never reject a real one.
export function isBlankPng(png) {
  const buf = Buffer.from(png);
  if (buf.length < 33 || buf.toString("latin1", 1, 4) !== "PNG") return false;
  const width = buf.readUInt32BE(16);
  if (buf[24] !== 8 || buf[25] !== 6) return false;
  const idat = [];
  for (let pos = 8; pos + 8 <= buf.length; ) {
    const length = buf.readUInt32BE(pos);
    const type = buf.toString("latin1", pos + 4, pos + 8);
    if (type === "IDAT") idat.push(buf.subarray(pos + 8, pos + 8 + length));
    pos += 12 + length;
  }
  if (idat.length === 0) return false;
  let raw;
  try {
    raw = inflateSync(Buffer.concat(idat));
  } catch {
    return false;
  }
  const rowLength = 1 + width * 4;
  for (let i = 0; i < raw.length; i++) {
    if (i % rowLength !== 0 && raw[i] !== 0) return false;
  }
  return true;
}

async function fetchCoverJpeg(coverImage) {
  const res = await fetch(coverOgUrl(coverImage), {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) return null;
  if (res.headers.get("content-type") !== COVER_TYPE) return null;
  const bytes = Buffer.from(await res.arrayBuffer());
  return isRenderableJpeg(bytes) ? bytes : null;
}

// Renders the cover card to a finished Response, or returns null. The renderer decodes the
// image lazily while the response streams, after the route has already returned it, so a
// bad image would escape any fallback. Rendering to bytes here, inside the try, keeps every
// failure on the caller's side: null means "render the TitleCard instead".
export async function renderCoverImage(doc) {
  if (!doc?.coverImage) return null;
  try {
    const jpeg = await fetchCoverJpeg(doc.coverImage);
    if (!jpeg) return null;
    const src = `data:${COVER_TYPE};base64,${jpeg.toString("base64")}`;
    const rendered = await renderOgImage(<CoverCard src={src} />);
    const png = await rendered.arrayBuffer();
    if (isBlankPng(png)) return null;
    return new Response(png, { status: 200, headers: rendered.headers });
  } catch {
    return null;
  }
}
