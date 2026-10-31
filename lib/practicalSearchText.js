// ABOUTME: Flattens a Practical body to searchable plain text for the archive index.
// ABOUTME: Covers prose, custom-block text (steps, exhibit, callout, pullQuote, replyAsk), code and image alt text.

import { extractReadableText } from "@/lib/readingTime";
import { portableTextToPlain } from "@/lib/portableTextToPlain";
import practicalBlockContent from "@/sanity/schemas/objects/practicalBlockContent";

// Body members of schema type `image` arrive with `_type` set to their member name when one
// is given (e.g. "figure"), so the set is derived from the schema rather than hard-coded.
const IMAGE_TYPES = new Set(
  practicalBlockContent.of
    .filter((member) => member.type === "image")
    .map((member) => member.name || "image")
);
IMAGE_TYPES.add("image");

// Rich text nested inside a custom block (e.g. an array of `block` in a callout): extractReadableText
// only knows each custom block's own string fields, so portable-text arrays are found and flattened here.
function nestedBlockText(value, out) {
  if (Array.isArray(value)) {
    if (value.some((v) => v && v._type === "block")) {
      out.push(
        portableTextToPlain(value.filter((v) => v && v._type === "block"))
      );
    }
    for (const item of value) {
      if (item && typeof item === "object" && item._type !== "block") {
        nestedBlockText(item, out);
      }
    }
  } else if (value && typeof value === "object") {
    for (const [key, v] of Object.entries(value)) {
      if (!key.startsWith("_")) nestedBlockText(v, out);
    }
  }
}

// extractReadableText skips image alt, code and the exhibit tag (none count toward reading
// time) but a reader may search for any of them, so they are added back here in body order.
export function practicalSearchText(blocks) {
  if (!Array.isArray(blocks)) return "";
  const out = [];
  for (const block of blocks) {
    if (!block || typeof block !== "object") continue;
    if (IMAGE_TYPES.has(block._type)) {
      // Every text field the image carries (alt, and anything added to its schema later).
      for (const [key, v] of Object.entries(block)) {
        if (!key.startsWith("_") && typeof v === "string") out.push(v);
      }
    } else if (block._type === "codeBlock") {
      if (typeof block.code === "string") out.push(block.code);
    } else {
      out.push(extractReadableText([block]));
      if (block._type !== "block") nestedBlockText(block, out);
      if (block._type === "exhibit") {
        // Header tag and the exhibit's own image alt: searchable, but not reading-time text.
        if (typeof block.tag === "string") out.push(block.tag);
        if (typeof block.image?.alt === "string") out.push(block.image.alt);
      }
    }
  }
  return out.filter((s) => s && s.trim()).join("\n");
}
