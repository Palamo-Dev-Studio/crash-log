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
  });
});
