// ABOUTME: Unit tests for lib/caseCard.js: verdict fallback, summary fallback and truncation, source info.
// ABOUTME: Fixtures differ on purpose: verdict != severity, summary != body, two sources, long vs short body.

import { describe, it, expect } from "vitest";
import {
  getVerdict,
  getCaseSummary,
  truncateSummary,
  hasFullBody,
  getSourceInfo,
  SUMMARY_MAX_WORDS,
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
});

describe("truncateSummary", () => {
  it("leaves short text alone", () => {
    expect(truncateSummary("Short one.")).toBe("Short one.");
  });
  it("cuts at the last sentence end within the word cap", () => {
    const text = `${words(30)}. ${words(30, "x")}. ${words(40, "y")}.`;
    const out = truncateSummary(text);
    expect(out.endsWith("x29.")).toBe(true);
    expect(out.split(/\s+/).length).toBeLessThanOrEqual(SUMMARY_MAX_WORDS);
  });
  it("cuts at the cap with an ellipsis when there is no sentence end", () => {
    const out = truncateSummary(words(120));
    expect(out.endsWith("…")).toBe(true);
    expect(out.replace("…", "").split(/\s+/)).toHaveLength(SUMMARY_MAX_WORDS);
  });
  it("ignores a sentence end too early to be a useful summary", () => {
    const out = truncateSummary(`${words(5)}. ${words(120, "z")}`);
    expect(out.endsWith("…")).toBe(true);
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
      extra: 1,
    });
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
