// ABOUTME: Unit tests for the reading-time helpers (230 wpm, rounded up, minimum 1).
// ABOUTME: Covers block arrays, plain strings, localized fallback and issue story bodies.

import { describe, it, expect } from "vitest";
import {
  countWords,
  readingMinutes,
  getReadingMinutes,
} from "@/lib/readingTime";

const words = (n) => Array.from({ length: n }, () => "word").join(" ");
const block = (text) => ({
  _type: "block",
  children: [{ _type: "span", text }],
});

describe("countWords", () => {
  it("counts words in a string", () => {
    expect(countWords("one two  three\nfour")).toBe(4);
  });
  it("counts words in portable text blocks", () => {
    expect(countWords([block("one two"), block("three")])).toBe(3);
  });
  it("returns 0 for empty or invalid input", () => {
    expect(countWords(null)).toBe(0);
    expect(countWords("")).toBe(0);
    expect(countWords({})).toBe(0);
  });
});

describe("readingMinutes", () => {
  it("is at least 1 minute", () => {
    expect(readingMinutes([""])).toBe(1);
    expect(readingMinutes([words(5)])).toBe(1);
  });
  it("rounds up at 230 wpm", () => {
    expect(readingMinutes([words(230)])).toBe(1);
    expect(readingMinutes([words(231)])).toBe(2);
    expect(readingMinutes([words(1150)])).toBe(5);
  });
  it("sums several parts", () => {
    expect(readingMinutes([words(200), [block(words(100))]])).toBe(2);
  });
});

describe("getReadingMinutes", () => {
  it("uses the locale text of a column and falls back to English", () => {
    const doc = { _type: "column", reading: { en: words(1150), es: null } };
    expect(getReadingMinutes(doc, "en")).toBe(5);
    expect(getReadingMinutes(doc, "es")).toBe(5);
    const es = {
      _type: "column",
      reading: { en: words(1150), es: words(460) },
    };
    expect(getReadingMinutes(es, "es")).toBe(2);
  });
  it("adds issue story bodies to the issue's own text", () => {
    const doc = {
      _type: "issue",
      reading: { en: words(230), es: null },
      storyReading: [
        { en: words(230), es: null },
        { en: words(230), es: null },
      ],
    };
    expect(getReadingMinutes(doc, "en")).toBe(3);
  });
  it("returns null when the doc has no text at all", () => {
    expect(getReadingMinutes({ _type: "column" }, "en")).toBeNull();
  });
});
