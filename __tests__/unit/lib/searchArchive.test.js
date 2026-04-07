// ABOUTME: Unit tests for the archive search/filter utility.
// ABOUTME: Validates tokenization, AND-across-tokens, OR-across-categories, and field match tracking.

import { describe, it, expect } from "vitest";
import { searchArchive } from "@/lib/searchArchive";

const baseIssue = {
  id: "issue-1",
  type: "issue",
  publishDate: "2026-04-01",
  title: "Forty Minutes of Exposure",
  subtitle: "What broke this week",
  searchText:
    "forty minutes of exposure what broke this week perplexity sued stack trace oracle",
  fields: {
    titleSubtitle: "forty minutes of exposure what broke this week",
    transmission: "the transmission text talks about perplexity",
    headlines: "perplexity sued by publishers",
    bodies: "the body mentions oracle and labor",
    stackTrace: "stack trace mentions a vendor outage",
    columnBody: "",
  },
  categories: [
    { name: "Foundation Models", slug: "foundation-models" },
    { name: "Labor & Automation", slug: "labor-and-automation" },
  ],
  raw: { _id: "issue-1" },
};

const column = {
  id: "column-1",
  type: "column",
  publishDate: "2026-04-04",
  title: "The Ledger Economy",
  subtitle: "A note on trust",
  searchText: "the ledger economy a note on trust perplexity",
  fields: {
    titleSubtitle: "the ledger economy a note on trust",
    transmission: "",
    headlines: "",
    bodies: "",
    stackTrace: "",
    columnBody: "the column body talks about perplexity at length",
  },
  categories: [],
  raw: { _id: "column-1" },
};

describe("searchArchive", () => {
  it("returns all items when query and categories are empty", () => {
    const out = searchArchive([baseIssue, column], {});
    expect(out).toHaveLength(2);
  });

  it("returns empty for non-array input", () => {
    expect(searchArchive(null, { query: "x" })).toEqual([]);
  });

  it("matches a single token in title", () => {
    const out = searchArchive([baseIssue, column], { query: "forty" });
    expect(out).toHaveLength(1);
    expect(out[0].id).toBe("issue-1");
    expect(out[0].matches).toContain("titleSubtitle");
  });

  it("AND across tokens", () => {
    // Both "perplexity" and "oracle" only appear together in baseIssue.
    const out = searchArchive([baseIssue, column], {
      query: "perplexity oracle",
    });
    expect(out).toHaveLength(1);
    expect(out[0].id).toBe("issue-1");
  });

  it("matches across columns and issues for a shared token", () => {
    const out = searchArchive([baseIssue, column], { query: "perplexity" });
    expect(out.map((i) => i.id).sort()).toEqual(["column-1", "issue-1"]);
  });

  it("records which fields hit", () => {
    const out = searchArchive([baseIssue], { query: "oracle" });
    expect(out[0].matches).toContain("bodies");
    expect(out[0].matches).not.toContain("titleSubtitle");
  });

  it("filters by category (OR within categories)", () => {
    const out = searchArchive([baseIssue, column], {
      categories: ["foundation-models"],
    });
    expect(out).toHaveLength(1);
    expect(out[0].id).toBe("issue-1");
  });

  it("returns empty when category does not match anything", () => {
    const out = searchArchive([baseIssue, column], {
      categories: ["does-not-exist"],
    });
    expect(out).toHaveLength(0);
  });

  it("combines query AND category filters", () => {
    const out = searchArchive([baseIssue, column], {
      query: "perplexity",
      categories: ["foundation-models"],
    });
    expect(out).toHaveLength(1);
    expect(out[0].id).toBe("issue-1");
  });

  it("is case-insensitive", () => {
    const out = searchArchive([baseIssue], { query: "FORTY" });
    expect(out).toHaveLength(1);
  });

  it("ignores extra whitespace in queries", () => {
    const out = searchArchive([baseIssue], { query: "  forty   minutes  " });
    expect(out).toHaveLength(1);
  });

  it("returns no matches when one token is missing", () => {
    const out = searchArchive([baseIssue], { query: "forty banana" });
    expect(out).toHaveLength(0);
  });
});
