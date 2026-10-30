// ABOUTME: Unit tests for the reading-time helpers (230 wpm, rounded up, minimum 1).
// ABOUTME: Covers block arrays, plain strings, localized fallback and issue story bodies.

import { describe, it, expect } from "vitest";
import {
  countWords,
  readingMinutes,
  getReadingMinutes,
  extractReadableText,
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

describe("getReadingMinutes for practical articles", () => {
  const w = (n, tag = "w") => Array.from({ length: n }, () => tag).join(" ");
  const span = (text) => ({
    _type: "block",
    style: "normal",
    children: [{ _type: "span", text }],
  });
  const body = (extra) => ({ en: [span(w(1))].concat(extra) });
  const count = (blocks) => extractReadableText(blocks);

  it("counts the text of every custom block, and not code", () => {
    const blocks = [
      span("alpha"),
      { _type: "steps", items: [{ title: "stepTitle", text: "stepText" }] },
      {
        _type: "exhibit",
        label: "exLabel",
        from: "exFrom",
        caption: "exCaption",
        rows: [{ lead: "rowLead", text: "rowText" }],
      },
      { _type: "callout", title: "callTitle", text: "callText" },
      { _type: "pullQuote", text: "quoteText" },
      {
        _type: "replyAsk",
        title: "askTitle",
        text: "askText",
        buttonLabel: "askButton",
      },
      { _type: "codeBlock", language: "js", code: "codeSecret" },
    ];
    const text = count(blocks);
    for (const t of [
      "alpha",
      "stepTitle",
      "stepText",
      "exLabel",
      "exFrom",
      "exCaption",
      "rowLead",
      "rowText",
      "callTitle",
      "callText",
      "quoteText",
      "askTitle",
      "askText",
      "askButton",
    ]) {
      expect(text).toContain(t);
    }
    expect(text).not.toContain("codeSecret");
  });

  it("lengthens the estimate when custom blocks carry the words", () => {
    const doc = {
      _type: "practical",
      body: body([{ _type: "steps", items: [{ title: "t", text: w(460) }] }]),
    };
    expect(getReadingMinutes(doc, "en")).toBe(3);
  });
});

describe("getReadingMinutes: one implementation for the home feed and the article page", () => {
  const w = (n, tag = "w") => Array.from({ length: n }, () => tag).join(" ");
  const prose = (text) => ({
    _type: "block",
    style: "normal",
    children: [{ _type: "span", text }],
  });
  const steps = { _type: "steps", items: [{ title: "t", text: w(460) }] };
  const code = { _type: "codeBlock", language: "js", code: w(900, "c") };
  // Article page: the full document. Home feed: the projection's shape, where
  // `reading` is pt::text (custom blocks dropped) and `body` drops code blocks.
  const article = {
    _type: "practical",
    body: { en: [prose(w(1)), steps, code], es: null },
  };
  const homeFeed = {
    _type: "practical",
    reading: { en: w(1), es: "" },
    body: { en: [prose(w(1)), steps], es: null },
  };

  it("gives a Practical the same minutes on the home cover and its article page", () => {
    expect(getReadingMinutes(homeFeed, "en")).toBe(3);
    expect(getReadingMinutes(homeFeed, "en")).toBe(
      getReadingMinutes(article, "en")
    );
  });

  it("shows why the body is projected: pt::text alone undercounts a Practical", () => {
    const { body, ...withoutBody } = homeFeed;
    expect(getReadingMinutes(withoutBody, "en")).toBe(1);
  });
});

describe("getReadingMinutes for Spanish practical bodies", () => {
  const w = (n) => Array.from({ length: n }, () => "w").join(" ");
  const prose = (text) => ({
    _type: "block",
    style: "normal",
    children: [{ _type: "span", text }],
  });

  it("counts the Spanish body, not the English one, when es is longer", () => {
    const doc = {
      _type: "practical",
      body: { en: [prose(w(230))], es: [prose(w(690))] },
    };
    expect(getReadingMinutes(doc, "en")).toBe(1);
    expect(getReadingMinutes(doc, "es")).toBe(3);
  });

  it("falls back to the English body when es is missing", () => {
    const doc = {
      _type: "practical",
      body: { en: [prose(w(690))], es: null },
    };
    expect(getReadingMinutes(doc, "es")).toBe(3);
  });
});
