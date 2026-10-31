// ABOUTME: Unit tests for practicalSearchText, the Practical body flattener used by the archive search index.
// ABOUTME: Custom-block text, code and image alt must all be searchable; null and non-array input yield an empty string.

import { describe, it, expect } from "vitest";
import { practicalSearchText } from "@/lib/practicalSearchText";

const body = [
  { _type: "block", children: [{ text: "plain prose" }] },
  { _type: "steps", items: [{ title: "Rotate", text: "swapkeys quarterly" }] },
  { _type: "callout", title: "Heads up", text: "calloutword here" },
  { _type: "pullQuote", text: "quotedword" },
  { _type: "exhibit", rows: [{ lead: "exhibitlead", text: "exhibittext" }] },
  { _type: "codeBlock", language: "bash", code: "echo codeword" },
  { _type: "replyAsk", title: "Your turn", text: "replyword" },
  { _type: "image", alt: "diagramalt" },
];

describe("practicalSearchText", () => {
  it("includes prose, every custom block, code and image alt", () => {
    const text = practicalSearchText(body);
    for (const w of [
      "plain prose",
      "swapkeys",
      "calloutword",
      "quotedword",
      "exhibitlead",
      "exhibittext",
      "codeword",
      "replyword",
      "diagramalt",
    ]) {
      expect(text).toContain(w);
    }
  });

  it("returns an empty string for missing or non-array input", () => {
    expect(practicalSearchText(undefined)).toBe("");
    expect(practicalSearchText("text")).toBe("");
    expect(practicalSearchText([null, 3])).toBe("");
  });
});
