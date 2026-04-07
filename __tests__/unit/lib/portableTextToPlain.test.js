// ABOUTME: Unit tests for the Portable Text to plain text flattener.
// ABOUTME: Validates child concatenation, non-block skipping, and null/empty handling.

import { describe, it, expect } from "vitest";
import { portableTextToPlain } from "@/lib/portableTextToPlain";

describe("portableTextToPlain", () => {
  it("returns empty string for null", () => {
    expect(portableTextToPlain(null)).toBe("");
  });

  it("returns empty string for undefined", () => {
    expect(portableTextToPlain(undefined)).toBe("");
  });

  it("returns empty string for non-array input", () => {
    expect(portableTextToPlain("hello")).toBe("");
    expect(portableTextToPlain({})).toBe("");
  });

  it("concatenates text spans within a single block", () => {
    const blocks = [
      {
        _type: "block",
        children: [
          { _type: "span", text: "Hello " },
          { _type: "span", text: "world" },
        ],
      },
    ];
    expect(portableTextToPlain(blocks)).toBe("Hello world");
  });

  it("joins multiple blocks with newlines", () => {
    const blocks = [
      { _type: "block", children: [{ _type: "span", text: "First" }] },
      { _type: "block", children: [{ _type: "span", text: "Second" }] },
    ];
    expect(portableTextToPlain(blocks)).toBe("First\nSecond");
  });

  it("skips non-block types like images", () => {
    const blocks = [
      { _type: "block", children: [{ _type: "span", text: "Caption" }] },
      { _type: "image", asset: { _ref: "x" } },
    ];
    expect(portableTextToPlain(blocks)).toBe("Caption");
  });

  it("ignores spans without text", () => {
    const blocks = [
      {
        _type: "block",
        children: [{ _type: "span" }, { _type: "span", text: "ok" }],
      },
    ];
    expect(portableTextToPlain(blocks)).toBe("ok");
  });

  it("returns empty string when blocks contain no text", () => {
    expect(portableTextToPlain([])).toBe("");
    expect(portableTextToPlain([{ _type: "block", children: [] }])).toBe("");
  });
});
