// ABOUTME: Unit tests for lib/queries.js — all 8 fetch wrappers.
// ABOUTME: Validates null-client fallback, successful fetch, and error handling for each wrapper.

import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFetch = vi.fn();

vi.mock("@/lib/sanity", () => ({
  client: { fetch: (...args) => mockFetch(...args) },
}));

let queries;

beforeEach(async () => {
  vi.resetModules();
  mockFetch.mockReset();
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
  { name: "getAllIssuesForArchive", fn: () => queries.getAllIssuesForArchive() },
  { name: "getAllCategories", fn: () => queries.getAllCategories() },
];

describe("null-fallback wrappers", () => {
  for (const { name, fn } of nullFallbackWrappers) {
    describe(name, () => {
      it("returns data when client.fetch resolves", async () => {
        const data = { _id: "test" };
        mockFetch.mockResolvedValueOnce(data);
        expect(await fn()).toEqual(data);
      });

      it("returns null when client.fetch throws", async () => {
        mockFetch.mockRejectedValueOnce(new Error("Network error"));
        expect(await fn()).toBeNull();
      });
    });
  }
});

describe("array-fallback wrappers", () => {
  for (const { name, fn } of arrayFallbackWrappers) {
    describe(name, () => {
      it("returns data when client.fetch resolves", async () => {
        const data = [{ _id: "test" }];
        mockFetch.mockResolvedValueOnce(data);
        expect(await fn()).toEqual(data);
      });

      it("returns [] when client.fetch throws", async () => {
        mockFetch.mockRejectedValueOnce(new Error("Network error"));
        expect(await fn()).toEqual([]);
      });
    });
  }
});

describe("parameter passing", () => {
  it("getIssueBySlug passes slug param to client.fetch", async () => {
    mockFetch.mockResolvedValueOnce(null);
    await queries.getIssueBySlug("my-slug");
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      { slug: "my-slug" }
    );
  });

  it("getCategoryWithStories passes slug param to client.fetch", async () => {
    mockFetch.mockResolvedValueOnce(null);
    await queries.getCategoryWithStories("tech-slug");
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      { slug: "tech-slug" }
    );
  });
});

describe("null client fallback", () => {
  it("returns null/[] when client is null", async () => {
    vi.resetModules();
    vi.doMock("@/lib/sanity", () => ({ client: null }));
    const q = await import("@/lib/queries");

    expect(await q.getLatestIssue()).toBeNull();
    expect(await q.getIssueBySlug("x")).toBeNull();
    expect(await q.getAboutPage()).toBeNull();
    expect(await q.getCategoryWithStories("x")).toBeNull();
    expect(await q.getAllIssueSlugs()).toEqual([]);
    expect(await q.getAllIssuesSummary()).toEqual([]);
    expect(await q.getAllIssuesForArchive()).toEqual([]);
    expect(await q.getAllCategories()).toEqual([]);
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
  });
});
