// ABOUTME: Unit tests for lib/series.js — series detection, file codes, bylines, ref links.
// ABOUTME: Fixtures use values that differ from each fallback so every branch is observable.

import { describe, it, expect } from "vitest";
import {
  SERIES_COLOR_KEYS,
  getSeries,
  getFileCode,
  getByline,
  withRef,
} from "@/lib/series";

describe("getSeries", () => {
  it("maps issue to offTheRails", () => {
    expect(getSeries({ _type: "issue" })).toBe("offTheRails");
  });
  it("maps practical to practical", () => {
    expect(getSeries({ _type: "practical" })).toBe("practical");
  });
  it("maps column to nicosNotes", () => {
    expect(getSeries({ _type: "column" })).toBe("nicosNotes");
  });
  it("returns null for unknown types", () => {
    expect(getSeries({ _type: "story" })).toBeNull();
  });
  it("returns null for missing doc or type", () => {
    expect(getSeries(null)).toBeNull();
    expect(getSeries(undefined)).toBeNull();
    expect(getSeries({})).toBeNull();
  });
});

describe("SERIES_COLOR_KEYS", () => {
  it("maps each series to its colour key", () => {
    expect(SERIES_COLOR_KEYS).toEqual({
      offTheRails: "otr",
      practical: "fix",
      nicosNotes: "note",
    });
  });
});

describe("getFileCode", () => {
  it("prefixes issues with OTR and pads to 3", () => {
    expect(getFileCode({ _type: "issue", issueNumber: 27 })).toBe("OTR-027");
  });
  it("prefixes practicals with FIX", () => {
    expect(getFileCode({ _type: "practical", practicalNumber: 1 })).toBe(
      "FIX-001"
    );
  });
  it("prefixes columns with NOTE", () => {
    expect(getFileCode({ _type: "column", columnNumber: 23 })).toBe("NOTE-023");
  });
  it("pads 999 to 999 and leaves 1000 unpadded", () => {
    expect(getFileCode({ _type: "issue", issueNumber: 999 })).toBe("OTR-999");
    expect(getFileCode({ _type: "issue", issueNumber: 1000 })).toBe("OTR-1000");
  });
  it("reads the number field that belongs to the type", () => {
    // An issue carrying a stray columnNumber must still use issueNumber.
    expect(
      getFileCode({ _type: "issue", issueNumber: 5, columnNumber: 9 })
    ).toBe("OTR-005");
  });
  it("returns null when the number is missing", () => {
    expect(getFileCode({ _type: "issue" })).toBeNull();
    expect(
      getFileCode({ _type: "practical", practicalNumber: null })
    ).toBeNull();
  });
  it("keeps 0 as a valid number", () => {
    expect(getFileCode({ _type: "issue", issueNumber: 0 })).toBe("OTR-000");
  });
  it("returns null for unknown types and missing docs", () => {
    expect(getFileCode({ _type: "story", issueNumber: 1 })).toBeNull();
    expect(getFileCode(null)).toBeNull();
  });
});

describe("getByline", () => {
  it("prefers an explicit byline on an issue", () => {
    expect(getByline({ _type: "issue", byline: "Guest Writer" }, "en")).toBe(
      "Guest Writer"
    );
  });
  it("prefers an explicit byline on a practical", () => {
    expect(
      getByline({ _type: "practical", byline: "Guest Writer" }, "en")
    ).toBe("Guest Writer");
  });
  it("prefers an explicit byline on a column", () => {
    expect(getByline({ _type: "column", byline: "Guest Writer" }, "en")).toBe(
      "Guest Writer"
    );
  });
  it("falls back to Nico von Bot for columns", () => {
    expect(getByline({ _type: "column" }, "en")).toBe("Nico von Bot");
    expect(getByline({ _type: "column" }, "es")).toBe("Nico von Bot");
  });
  it("falls back to Hector Luis Alamo for practicals", () => {
    expect(getByline({ _type: "practical" }, "es")).toBe("Hector Luis Alamo");
  });
  it("falls back to the newsroom for issues without a byline (EN)", () => {
    expect(getByline({ _type: "issue" }, "en")).toBe("The Crash Log newsroom");
  });
  it("falls back to the Spanish newsroom string for issues (ES)", () => {
    expect(getByline({ _type: "issue" }, "es")).toBe(
      "la redacción de The Crash Log"
    );
  });
  it("treats an empty or whitespace byline as unset", () => {
    expect(getByline({ _type: "issue", byline: "" }, "en")).toBe(
      "The Crash Log newsroom"
    );
    expect(getByline({ _type: "practical", byline: "   " }, "en")).toBe(
      "Hector Luis Alamo"
    );
  });
  it("returns null for unknown types without a byline", () => {
    expect(getByline({ _type: "story" }, "en")).toBeNull();
    expect(getByline(null, "en")).toBeNull();
  });
});

describe("withRef", () => {
  it("adds ref to a plain URL", () => {
    expect(withRef("https://example.com/a")).toBe(
      "https://example.com/a?ref=crashlog.ai"
    );
  });
  it("preserves an existing query string", () => {
    expect(withRef("https://example.com/a?x=1")).toBe(
      "https://example.com/a?x=1&ref=crashlog.ai"
    );
  });
  it("puts ref before a fragment", () => {
    expect(withRef("https://example.com/a#sec")).toBe(
      "https://example.com/a?ref=crashlog.ai#sec"
    );
  });
  it("handles query and fragment together", () => {
    expect(withRef("https://example.com/a?x=1#sec")).toBe(
      "https://example.com/a?x=1&ref=crashlog.ai#sec"
    );
  });
  it("does not add ref when one exists", () => {
    expect(withRef("https://example.com/a?ref=other")).toBe(
      "https://example.com/a?ref=other"
    );
  });
  it("works with http", () => {
    expect(withRef("http://example.com/")).toBe(
      "http://example.com/?ref=crashlog.ai"
    );
  });
  it("returns mailto unchanged", () => {
    expect(withRef("mailto:a@b.com")).toBe("mailto:a@b.com");
  });
  it("returns garbage unchanged", () => {
    expect(withRef("not a url")).toBe("not a url");
    expect(withRef("")).toBe("");
  });
  it("returns non-strings unchanged", () => {
    expect(withRef(null)).toBeNull();
    expect(withRef(undefined)).toBeUndefined();
  });
});
