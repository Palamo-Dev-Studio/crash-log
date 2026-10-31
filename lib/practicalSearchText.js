// ABOUTME: Flattens a Practical body to searchable plain text for the archive index.
// ABOUTME: Covers prose, custom-block text (steps, exhibit, callout, pullQuote, replyAsk), code and image alt text.

import { extractReadableText } from "@/lib/readingTime";
import { portableTextToPlain } from "@/lib/portableTextToPlain";

// extractReadableText skips image alt, code and the exhibit tag (none count toward reading
// time) but a reader may search for any of them, so they are added back here in body order.
export function practicalSearchText(blocks) {
  if (!Array.isArray(blocks)) return "";
  const out = [];
  for (const block of blocks) {
    if (!block || typeof block !== "object") continue;
    if (block._type === "image") {
      out.push(portableTextToPlain([block]));
    } else if (block._type === "codeBlock") {
      if (typeof block.code === "string") out.push(block.code);
    } else {
      out.push(extractReadableText([block]));
      if (block._type === "exhibit") {
        // Header tag and the exhibit's own image alt: searchable, but not reading-time text.
        if (typeof block.tag === "string") out.push(block.tag);
        if (typeof block.image?.alt === "string") out.push(block.image.alt);
      }
    }
  }
  return out.filter((s) => s && s.trim()).join("\n");
}
