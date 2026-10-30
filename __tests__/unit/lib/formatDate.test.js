// ABOUTME: Unit tests for lib/formatDate: named styles, UTC rendering in any process timezone, never a weekday.
// ABOUTME: Weekday names come from Intl (long names only: short es names collide with month abbreviations like "mar").

import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { formatDate } from "@/lib/formatDate";

describe("formatDate styles", () => {
  const cases = [
    ["2026-10-30T07:00:00Z", "long", "en", "October 30, 2026"],
    ["2026-10-30T07:00:00Z", "long", "es", "30 de octubre de 2026"],
    ["2026-10-30T07:00:00Z", "short", "en", "Oct 30, 2026"],
    ["2026-10-30T07:00:00Z", "short", "es", "30 oct 2026"],
    ["2026-03-01T02:00:00Z", "long", "en", "March 1, 2026"],
    ["2026-03-01T02:00:00Z", "long", "es", "1 de marzo de 2026"],
    ["2026-03-01T02:00:00Z", "short", "en", "Mar 1, 2026"],
    ["2026-03-01T02:00:00Z", "short", "es", "1 mar 2026"],
    ["2026-12-31T23:59:59Z", "long", "en", "December 31, 2026"],
    ["2026-01-01T00:00:00Z", "short", "en", "Jan 1, 2026"],
  ];
  for (const [value, style, locale, expected] of cases) {
    it(`${style} ${locale} ${value} -> ${expected}`, () => {
      expect(formatDate(value, locale, style)).toBe(expected);
    });
  }

  it("returns an empty string for missing or invalid input", () => {
    expect(formatDate(null, "en", "long")).toBe("");
    expect(formatDate(undefined, "en", "long")).toBe("");
    expect(formatDate("not a date", "en", "long")).toBe("");
  });

  it("falls back to English for an unknown locale", () => {
    expect(formatDate("2026-10-30T07:00:00Z", "fr", "long")).toBe(
      "October 30, 2026"
    );
  });

  it("throws on an unknown style", () => {
    expect(() => formatDate("2026-10-30", "en", "weekday")).toThrow();
  });
});

describe("formatDate is UTC regardless of the process timezone", () => {
  for (const tz of ["America/Los_Angeles", "Asia/Tokyo", "UTC"]) {
    it(`TZ=${tz}`, () => {
      const script = `
        import { formatDate } from "./lib/formatDate.js";
        const out = [
          formatDate("2026-10-30T07:00:00Z", "en", "long"),
          formatDate("2026-03-01T02:00:00Z", "en", "short"),
          formatDate("2026-03-01T02:00:00Z", "es", "long"),
        ];
        console.log(JSON.stringify(out));
      `;
      const res = spawnSync(
        process.execPath,
        ["--no-warnings", "--input-type=module", "-e", script],
        {
          cwd: path.resolve(import.meta.dirname, "../../.."),
          env: { ...process.env, TZ: tz },
          encoding: "utf8",
        }
      );
      expect(res.stderr).toBe("");
      expect(JSON.parse(res.stdout)).toEqual([
        "October 30, 2026",
        "Mar 1, 2026",
        "1 de marzo de 2026",
      ]);
    });
  }
});

describe("formatDate never carries a weekday", () => {
  const longNames = (locale) => {
    const fmt = new Intl.DateTimeFormat(locale, {
      weekday: "long",
      timeZone: "UTC",
    });
    return Array.from({ length: 7 }, (_, d) =>
      fmt.format(new Date(Date.UTC(2026, 0, 4 + d)))
    );
  };

  for (const locale of ["en", "es"]) {
    for (const style of ["long", "short"]) {
      it(`${locale} ${style}, 7 consecutive days`, () => {
        const names = longNames(locale);
        expect(names.length).toBe(7);
        for (let d = 0; d < 7; d++) {
          const out = formatDate(
            new Date(Date.UTC(2026, 0, 4 + d)).toISOString(),
            locale,
            style
          );
          expect(out).toMatch(/2026/);
          for (const name of names) {
            expect(out.toLowerCase()).not.toContain(name.toLowerCase());
          }
        }
      });
    }
  }
});
