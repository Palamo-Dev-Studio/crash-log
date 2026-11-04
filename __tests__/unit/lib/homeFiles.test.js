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

  it("recent holds the next file of each series, not already on the cover or rail, newest first", () => {
    const { recent } = selectHomeFiles([
      ...DOCS,
      d("practical", "p1", "2026-10-28"),
      d("practical", "p2", "2026-10-21"),
    ]);
    // Cover c1 (column), rail i1, p1, c1. Next per series: c2 (10-30), i2 (10-26), p2 (10-21).
    expect(recent.map((x) => x._id)).toEqual(["c2", "i2", "p2"]);
  });

  it("a series with nothing left is filled by the next newest file of any series", () => {
    // Practical's only file is the cover. The issue pick (i2) is older than three columns,
    // so a plain newest-first list would be c2, c3, c4; one-per-series gives i2 and c2, then fills with c3.
    const docs = [
      d("practical", "p1", "2026-11-09"),
      d("column", "c1", "2026-11-06"),
      d("issue", "i1", "2026-11-02"),
      d("column", "c2", "2026-10-30"),
      d("column", "c3", "2026-10-29"),
      d("column", "c4", "2026-10-28"),
      d("issue", "i2", "2026-10-01"),
    ];
    const { recent } = selectHomeFiles(docs);
    expect(recent.map((x) => x._id)).toEqual(["c2", "c3", "i2"]);
  });

  it("recent order is newest first and stable whatever the input order", () => {
    const docs = [...DOCS, d("practical", "p1", "2026-10-28")];
    const a = selectHomeFiles(docs).recent.map((x) => x._id);
    const b = selectHomeFiles([...docs].reverse()).recent.map((x) => x._id);
    expect(b).toEqual(a);
  });

  it("recent never repeats a file and never exceeds three", () => {
    const { recent } = selectHomeFiles(DOCS);
    expect(new Set(recent.map((x) => x._id)).size).toBe(recent.length);
    expect(recent.length).toBeLessThanOrEqual(3);
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
