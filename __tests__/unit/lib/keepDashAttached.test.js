// ABOUTME: Unit tests for keepDashAttached: the space before a spaced en or em dash becomes non-breaking.
// ABOUTME: Covers both dashes, several dashes, unspaced dashes and hyphens left alone, and non-string input.

import { describe, it, expect } from "vitest";
import { keepDashAttached } from "@/lib/keepDashAttached";

describe("keepDashAttached", () => {
  it("makes the space before a spaced em dash non-breaking and keeps the one after", () => {
    expect(keepDashAttached("nobody — showed why")).toBe("nobody — showed why");
  });

  it("handles a spaced en dash", () => {
    expect(keepDashAttached("a – b")).toBe("a – b");
  });

  it("handles every spaced dash in the text", () => {
    expect(keepDashAttached("a — b — c")).toBe("a — b — c");
  });

  it("leaves unspaced dashes, hyphens and plain text alone", () => {
    expect(keepDashAttached("well-known 2020–2021 and—more")).toBe(
      "well-known 2020–2021 and—more"
    );
  });

  it("returns non-strings unchanged", () => {
    expect(keepDashAttached(null)).toBeNull();
    expect(keepDashAttached(undefined)).toBeUndefined();
  });
});
