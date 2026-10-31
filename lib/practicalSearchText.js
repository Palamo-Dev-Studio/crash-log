// ABOUTME: Flattens a Practical body to searchable plain text for the archive index.
// ABOUTME: Covers prose, custom-block text (steps, exhibit, callout, pullQuote, replyAsk), code and image alt text.

import { extractReadableText } from "@/lib/readingTime";
import { portableTextToPlain } from "@/lib/portableTextToPlain";

// extractReadableText skips image alt and code (neither counts toward reading time) but
// both are things a reader may search for, so they are added back here in body order.
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
    }
  }
  return out.filter((s) => s && s.trim()).join("\n");
}
