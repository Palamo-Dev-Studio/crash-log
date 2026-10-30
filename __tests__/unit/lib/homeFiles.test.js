// ABOUTME: Unit tests for selectHomeFiles, the pure cover / rail / recent selection for the home page.
// ABOUTME: Fixtures hold several docs per series with distinct dates so the rules are not degenerate.

import { describe, it, expect } from "vitest";
import { selectHomeFiles } from "@/lib/homeFiles";

const d = (type, id, date) => ({ _type: type, _id: id, publishDate: date });

const DOCS = [
  d("issue", "i1", "2026-11-02"),
  d("column", "c1", "2026-11-06"),
  d("issue", "i2", "2026-10-26"),
  d("column", "c2", "2026-10-30"),
  d("column", "c3", "2026-10-23"),
  d("issue", "i3", "2026-10-19"),
  d("column", "c4", "2026-10-16"),
  d("issue", "i4", "2026-10-12"),
  d("column", "c5", "2026-10-09"),
  d("issue", "i5", "2026-10-05"),
  d("column", "c6", "2026-10-02"),
];

describe("selectHomeFiles", () => {
  it("picks the newest doc across series as the cover, whatever the input order", () => {
    const shuffled = [...DOCS].reverse();
    expect(selectHomeFiles(shuffled).cover._id).toBe("c1");
  });

  it("rail has the latest doc per series that exists, in series order, and flags the cover's series", () => {
    const { rail } = selectHomeFiles(DOCS);
    expect(rail.map((r) => [r.series, r.doc._id, r.onCover])).toEqual([
      ["offTheRails", "i1", false],
      ["nicosNotes", "c1", true],
    ]);
  });

  it("omits series with no docs (no practical slot)", () => {
    const { rail } = selectHomeFiles(DOCS);
    expect(rail.some((r) => r.series === "practical")).toBe(false);
  });

  it("includes practical when one exists, in series order", () => {
    const { rail } = selectHomeFiles([
      ...DOCS,
      d("practical", "p1", "2026-11-04"),
    ]);
    expect(rail.map((r) => r.series)).toEqual([
      "offTheRails",
      "practical",
      "nicosNotes",
    ]);
  });

  it("flags only the cover's series", () => {
    const { rail } = selectHomeFiles([
      ...DOCS,
      d("practical", "p1", "2026-11-09"),
    ]);
    expect(rail.filter((r) => r.onCover).map((r) => r.series)).toEqual([
      "practical",
    ]);
  });

  it("recent excludes the cover and rail docs, newest first, capped at 5", () => {
    const { recent } = selectHomeFiles(DOCS);
    expect(recent.map((x) => x._id)).toEqual(["c2", "i2", "c3", "i3", "c4"]);
  });

  it("handles a single doc: cover only, empty recent", () => {
    const out = selectHomeFiles([d("issue", "only", "2026-11-02")]);
    expect(out.cover._id).toBe("only");
    expect(out.rail).toHaveLength(1);
    expect(out.recent).toEqual([]);
  });

  it("returns an empty selection for no docs", () => {
    expect(selectHomeFiles([])).toEqual({ cover: null, rail: [], recent: [] });
    expect(selectHomeFiles(null)).toEqual({
      cover: null,
      rail: [],
      recent: [],
    });
  });

  it("ignores docs of unknown type", () => {
    const out = selectHomeFiles([d("story", "s", "2026-12-01"), ...DOCS]);
    expect(out.cover._id).toBe("c1");
  });
});
