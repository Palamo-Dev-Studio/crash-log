// ABOUTME: Cover-image variant of the Open Graph card: the article's Sanity cover, full-bleed at 1200x630.
// ABOUTME: getCoverCard returns null when there is no cover or it cannot be fetched, so callers fall back to the TitleCard.

import { urlFor } from "@/lib/sanity";
import { OG_SIZE } from "@/lib/ogTemplate";

const FETCH_TIMEOUT_MS = 5000;

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

export function CoverCard({ src, alt }) {
  return (
    <div style={{ display: "flex", width: "100%", height: "100%" }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- the OG renderer takes a plain img, not next/image */}
      <img
        src={src}
        alt={alt}
        width={OG_SIZE.width}
        height={OG_SIZE.height}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </div>
  );
}

// The image is fetched here rather than left to the renderer, so a missing or failing
// cover is caught now and the caller can render the TitleCard instead of a broken image.
export async function getCoverCard(doc, alt = "") {
  if (!doc?.coverImage) return null;
  try {
    const url = coverOgUrl(doc.coverImage);
    if (!url) return null;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const type = res.headers.get("content-type") || "";
    if (!type.startsWith("image/")) return null;
    const bytes = Buffer.from(await res.arrayBuffer());
    if (bytes.length === 0) return null;
    return (
      <CoverCard
        src={`data:${type};base64,${bytes.toString("base64")}`}
        alt={alt}
      />
    );
  } catch {
    return null;
  }
}
