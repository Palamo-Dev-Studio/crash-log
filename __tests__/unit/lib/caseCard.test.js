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
    const text = `${words(30)}. ${words(30, "X")}. ${words(40, "Y")}.`;
    const out = truncateSummary(text);
    expect(out.endsWith("X29.")).toBe(true);
    expect(out.split(/\s+/).length).toBeLessThanOrEqual(SUMMARY_MAX_WORDS);
  });
  it("cuts at the cap with an ellipsis when there is no sentence end", () => {
    const out = truncateSummary(words(120));
    expect(out.endsWith("…")).toBe(true);
    expect(out.replace("…", "").split(/\s+/)).toHaveLength(SUMMARY_MAX_WORDS);
  });
  it("ignores a sentence end too early to be a useful summary", () => {
    const out = truncateSummary(`${words(5)}. ${words(120, "Z")}`);
    expect(out.endsWith("…")).toBe(true);
  });
});

describe("truncateSummary sentence ends", () => {
  // Filler pushes the interesting token to word ~25 so the >=20-word floor is met.
  const lead = words(24);
  const tail = words(70, "T");
  const cut = (mid) => truncateSummary(`${lead} ${mid} ${tail}`);

  it("does not cut inside 'Doe v. Perplexity AI'", () => {
    const out = cut("the complaint, Doe v. Perplexity AI");
    expect(out).not.toMatch(/v\.$/);
    expect(out.endsWith("…")).toBe(true);
  });
  it("does not cut inside 'the U.S. Department'", () => {
    expect(cut("the U.S. Department")).not.toMatch(/U\.S\.$/);
  });
  it("does not cut inside a decimal like $13.4 billion", () => {
    expect(cut("it raised $13.4 billion")).not.toMatch(/\$13\.4$/);
  });
  it("does not cut at 'Sept. 5, 2026' (next token is a digit)", () => {
    expect(cut("on Sept. 5, 2026 it")).not.toMatch(/Sept\.$/);
  });
  it("does not cut at 'Dr. Smith said'", () => {
    expect(cut("Dr. Smith said")).not.toMatch(/Dr\.$/);
  });
  it("does not cut inside Spanish 'EE. UU.'", () => {
    const out = cut("en EE. UU. el");
    expect(out).not.toMatch(/EE\.$/);
    expect(out).not.toMatch(/UU\.$/);
  });
  it("cuts after a Spanish question ending before an uppercase word", () => {
    const out = truncateSummary(`${lead} ¿Qué? Luego ${tail}`);
    expect(out.endsWith("¿Qué?")).toBe(true);
  });
  it("cuts after a real sentence end followed by an opening quote", () => {
    const out = truncateSummary(`${lead} done here. “Then ${tail}`);
    expect(out.endsWith("done here.")).toBe(true);
  });
  it("still splits a normal two-sentence text", () => {
    const out = truncateSummary(`${lead} ended well. Next ${tail}`);
    expect(out.endsWith("ended well.")).toBe(true);
  });
});

describe("truncateSummary boundaries", () => {
  it("leaves exactly SUMMARY_MAX_WORDS words untouched (no ellipsis)", () => {
    const text = words(SUMMARY_MAX_WORDS);
    expect(truncateSummary(text)).toBe(text);
  });
  it("cuts SUMMARY_MAX_WORDS + 1 words to the cap with an ellipsis", () => {
    const out = truncateSummary(words(SUMMARY_MAX_WORDS + 1));
    expect(out).toBe(`${words(SUMMARY_MAX_WORDS)}…`);
  });
  it("accepts a sentence end at word 20 (the floor)", () => {
    const out = truncateSummary(`${words(19)} endtwenty. ${words(70, "T")}`);
    expect(out.endsWith("endtwenty.")).toBe(true);
    expect(out.split(/\s+/)).toHaveLength(20);
  });
  it("rejects a sentence end at word 19", () => {
    const out = truncateSummary(`${words(18)} endnineteen. ${words(70, "T")}`);
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
