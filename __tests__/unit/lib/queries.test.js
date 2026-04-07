// ABOUTME: Unit tests for lib/queries.js — all 9 fetch wrappers.
// ABOUTME: Validates null-client fallback, successful fetch, and error handling for each wrapper.

import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSanityFetch = vi.fn();

vi.mock("@/lib/sanity", () => ({
  sanityFetch: (...args) => mockSanityFetch(...args),
}));

let queries;

beforeEach(async () => {
  vi.resetModules();
  mockSanityFetch.mockReset();
  queries = await import("@/lib/queries");
});

// --- Wrappers that return null on failure ---

const nullFallbackWrappers = [
  { name: "getLatestIssue", fn: () => queries.getLatestIssue() },
  { name: "getIssueBySlug", fn: () => queries.getIssueBySlug("test-slug") },
  { name: "getAboutPage", fn: () => queries.getAboutPage() },
  {
    name: "getCategoryWithStories",
    fn: () => queries.getCategoryWithStories("test-slug"),
  },
  { name: "getLatestColumn", fn: () => queries.getLatestColumn() },
  {
    name: "getColumnBySlug",
    fn: () => queries.getColumnBySlug("test-slug"),
  },
];

// --- Wrappers that return [] on failure ---

const arrayFallbackWrappers = [
  { name: "getAllIssueSlugs", fn: () => queries.getAllIssueSlugs() },
  { name: "getAllIssuesSummary", fn: () => queries.getAllIssuesSummary() },
  {
    name: "getAllIssuesForArchive",
    fn: () => queries.getAllIssuesForArchive(),
  },
  { name: "getAllCategories", fn: () => queries.getAllCategories() },
  { name: "getIssuesForFeed", fn: () => queries.getIssuesForFeed() },
  { name: "getAllColumnSlugs", fn: () => queries.getAllColumnSlugs() },
  {
    name: "getAllColumnsForArchive",
    fn: () => queries.getAllColumnsForArchive(),
  },
  { name: "getColumnsForFeed", fn: () => queries.getColumnsForFeed() },
  { name: "getAllColumnsSummary", fn: () => queries.getAllColumnsSummary() },
];

describe("null-fallback wrappers", () => {
  for (const { name, fn } of nullFallbackWrappers) {
    describe(name, () => {
      it("returns data when sanityFetch resolves", async () => {
        const data = { _id: "test" };
        mockSanityFetch.mockResolvedValueOnce(data);
        expect(await fn()).toEqual(data);
      });

      it("returns null when sanityFetch throws", async () => {
        mockSanityFetch.mockRejectedValueOnce(new Error("Network error"));
        expect(await fn()).toBeNull();
      });
    });
  }
});

describe("array-fallback wrappers", () => {
  for (const { name, fn } of arrayFallbackWrappers) {
    describe(name, () => {
      it("returns data when sanityFetch resolves", async () => {
        const data = [{ _id: "test" }];
        mockSanityFetch.mockResolvedValueOnce(data);
        expect(await fn()).toEqual(data);
      });

      it("returns [] when sanityFetch throws", async () => {
        mockSanityFetch.mockRejectedValueOnce(new Error("Network error"));
        expect(await fn()).toEqual([]);
      });

      it("returns [] when sanityFetch returns null", async () => {
        mockSanityFetch.mockResolvedValueOnce(null);
        expect(await fn()).toEqual([]);
      });
    });
  }
});

describe("parameter passing", () => {
  it("getIssueBySlug passes slug param via sanityFetch", async () => {
    mockSanityFetch.mockResolvedValueOnce(null);
    await queries.getIssueBySlug("my-slug");
    expect(mockSanityFetch).toHaveBeenCalledWith(
      expect.objectContaining({ params: { slug: "my-slug" } })
    );
  });

  it("getCategoryWithStories passes slug param via sanityFetch", async () => {
    mockSanityFetch.mockResolvedValueOnce(null);
    await queries.getCategoryWithStories("tech-slug");
    expect(mockSanityFetch).toHaveBeenCalledWith(
      expect.objectContaining({ params: { slug: "tech-slug" } })
    );
  });

  it("getColumnBySlug passes slug param via sanityFetch", async () => {
    mockSanityFetch.mockResolvedValueOnce(null);
    await queries.getColumnBySlug("2026-03-07");
    expect(mockSanityFetch).toHaveBeenCalledWith(
      expect.objectContaining({ params: { slug: "2026-03-07" } })
    );
  });
});

describe("null client fallback", () => {
  it("returns null/[] when sanityFetch returns null", async () => {
    mockSanityFetch.mockResolvedValue(null);

    expect(await queries.getLatestIssue()).toBeNull();
    expect(await queries.getIssueBySlug("x")).toBeNull();
    expect(await queries.getAboutPage()).toBeNull();
    expect(await queries.getCategoryWithStories("x")).toBeNull();
    expect(await queries.getAllIssueSlugs()).toEqual([]);
    expect(await queries.getAllIssuesSummary()).toEqual([]);
    expect(await queries.getAllIssuesForArchive()).toEqual([]);
    expect(await queries.getAllCategories()).toEqual([]);
    expect(await queries.getIssuesForFeed()).toEqual([]);
    expect(await queries.getLatestColumn()).toBeNull();
    expect(await queries.getColumnBySlug("x")).toBeNull();
    expect(await queries.getAllColumnSlugs()).toEqual([]);
    expect(await queries.getAllColumnsForArchive()).toEqual([]);
    expect(await queries.getColumnsForFeed()).toEqual([]);
    expect(await queries.getAllColumnsSummary()).toEqual([]);
    expect(await queries.getAllColumnsForArchiveSearch()).toEqual([]);
  });

  it("getAllColumnsForArchiveSearch returns wrapped value when present", async () => {
    mockSanityFetch.mockResolvedValueOnce([
      { _id: "c1", columnNumber: 1, slug: "2026-04-04" },
    ]);
    const result = await queries.getAllColumnsForArchiveSearch();
    expect(result).toEqual([
      { _id: "c1", columnNumber: 1, slug: "2026-04-04" },
    ]);
    expect(mockSanityFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        query: queries.ALL_COLUMNS_FOR_ARCHIVE_SEARCH_QUERY,
      })
    );
  });
});

describe("query string exports", () => {
  it("exports all query constants", () => {
    expect(queries.LATEST_ISSUE_QUERY).toContain('_type == "issue"');
    expect(queries.ISSUE_BY_SLUG_QUERY).toContain("$slug");
    expect(queries.ALL_ISSUE_SLUGS_QUERY).toContain("slug");
    expect(queries.ALL_ISSUES_SUMMARY_QUERY).toContain("publishDate");
    expect(queries.ALL_ISSUES_FOR_ARCHIVE_QUERY).toContain("severities");
    expect(queries.ABOUT_PAGE_QUERY).toContain("aboutPage");
    expect(queries.ALL_CATEGORIES_QUERY).toContain("category");
    expect(queries.CATEGORY_WITH_STORIES_QUERY).toContain("$slug");
    expect(queries.ISSUES_FOR_FEED_QUERY).toContain("publishDate");
    expect(queries.LATEST_COLUMN_QUERY).toContain('_type == "column"');
    expect(queries.COLUMN_BY_SLUG_QUERY).toContain("$slug");
    expect(queries.ALL_COLUMN_SLUGS_QUERY).toContain("slug");
    expect(queries.ALL_COLUMNS_FOR_ARCHIVE_QUERY).toContain("columnNumber");
    expect(queries.COLUMNS_FOR_FEED_QUERY).toContain("publishDate");
    expect(queries.ALL_COLUMNS_SUMMARY_QUERY).toContain("publishDate");
    expect(queries.ALL_COLUMNS_FOR_ARCHIVE_SEARCH_QUERY).toContain("body");
    expect(queries.ALL_ISSUES_FOR_ARCHIVE_QUERY).toContain("nicosTransmission");
    expect(queries.ALL_ISSUES_FOR_ARCHIVE_QUERY).toContain("category");
  });
});
