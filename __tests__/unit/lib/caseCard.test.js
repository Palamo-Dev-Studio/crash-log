// ABOUTME: Unit tests for lib/caseCard.js: verdict fallback, summary fallback, source info.
// ABOUTME: Fixtures differ on purpose: verdict != severity, summary != body, two sources, long vs short body.

import { describe, it, expect } from "vitest";
import {
  getVerdict,
  getCaseSummary,
  hasFullBody,
  getSourceInfo,
  hasOwnSummary,
} from "@/lib/caseCard";

const para = (text) => ({
  _type: "block",
  children: [{ _type: "span", text }],
});
const words = (n, prefix = "w") =>
  Array.from({ length: n }, (_, i) => `${prefix}${i}`).join(" ");

describe("getVerdict", () => {
  it("prefers the localized verdict over severity", () => {
    const s = {
      verdict: { en: "BILLED TO YOU", es: "LA PAGAS TÚ" },
      severity: "ERROR",
    };
    expect(getVerdict(s, "en")).toBe("BILLED TO YOU");
    expect(getVerdict(s, "es")).toBe("LA PAGAS TÚ");
  });
  it("falls back to EN verdict when ES is missing", () => {
    expect(
      getVerdict({ verdict: { en: "SPONSORED" }, severity: "X" }, "es")
    ).toBe("SPONSORED");
  });
  it("falls back to severity when there is no verdict", () => {
    expect(getVerdict({ severity: "OVERRIDE" }, "en")).toBe("OVERRIDE");
    expect(
      getVerdict({ verdict: { en: "  " }, severity: "OVERRIDE" }, "en")
    ).toBe("OVERRIDE");
  });
  it("is empty with neither", () => {
    expect(getVerdict({}, "en")).toBe("");
  });
});

describe("getCaseSummary", () => {
  const body = {
    en: [para("First paragraph of the body."), para("Second one.")],
  };
  it("uses the summary when present", () => {
    expect(
      getCaseSummary({ summary: { en: "The summary." }, body }, "en")
    ).toBe("The summary.");
  });
  it("falls back to the first paragraph, not the whole body", () => {
    expect(getCaseSummary({ body }, "en")).toBe("First paragraph of the body.");
  });
  it("skips empty leading blocks", () => {
    expect(
      getCaseSummary({ body: { en: [para(""), para("Real one.")] } }, "en")
    ).toBe("Real one.");
  });
  it("is empty with neither summary nor body", () => {
    expect(getCaseSummary({}, "en")).toBe("");
  });
  it("returns the whole first paragraph, untruncated, however long", () => {
    const long = `${words(30)}. ${words(30, "X")}. ${words(40, "Y")}.`;
    expect(
      getCaseSummary({ body: { en: [para(long), para("Two.")] } }, "en")
    ).toBe(long);
  });
  it("an authored summary wins over a long body", () => {
    const story = {
      summary: { en: "Mine." },
      body: { en: [para(words(200))] },
    };
    expect(getCaseSummary(story, "en")).toBe("Mine.");
    expect(hasOwnSummary(story, "en")).toBe(true);
    expect(hasOwnSummary({ body: story.body }, "en")).toBe(false);
  });
});

describe("hasFullBody", () => {
  it("is true only when the localized body has text", () => {
    expect(hasFullBody({ body: { en: [para("x")] } }, "en")).toBe(true);
    expect(hasFullBody({ body: { en: [] } }, "en")).toBe(false);
    expect(hasFullBody({}, "en")).toBe(false);
  });
});

describe("getSourceInfo", () => {
  it("returns the first source and the count of the rest", () => {
    const info = getSourceInfo({
      sources: [
        { outlet: "Reuters", url: "https://reuters.com/a" },
        { outlet: "AP", url: "https://ap.org/b" },
      ],
    });
    expect(info).toEqual({
      outlet: "Reuters",
      url: "https://reuters.com/a",
      date: null,
      extra: 1,
    });
  });
  it("carries the first source's date, or null", () => {
    expect(
      getSourceInfo({ sources: [{ outlet: "AP", date: "2026-06-11" }] }).date
    ).toBe("2026-06-11");
    expect(getSourceInfo({ sources: [{ outlet: "AP" }] }).date).toBeNull();
  });
  it("falls back to title, then hostname, for the outlet", () => {
    expect(
      getSourceInfo({ sources: [{ title: "A Title", url: "https://x.com/1" }] })
        .outlet
    ).toBe("A Title");
    expect(
      getSourceInfo({ sources: [{ url: "https://www.example.com/1" }] }).outlet
    ).toBe("example.com");
  });
  it("has a null url when the source has none", () => {
    expect(getSourceInfo({ sources: [{ outlet: "FDA" }] }).url).toBeNull();
  });
  it("is null with no sources", () => {
    expect(getSourceInfo({ sources: [] })).toBeNull();
    expect(getSourceInfo({})).toBeNull();
  });
});
