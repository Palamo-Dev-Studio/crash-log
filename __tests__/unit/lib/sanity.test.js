// ABOUTME: Unit tests for lib/sanity.js — client initialization, urlFor stub, and sanityFetch.
// ABOUTME: Uses vi.stubEnv() and dynamic import to test env-dependent module initialization.

import { describe, it, expect, vi, beforeEach } from "vitest";

describe("lib/sanity", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  describe("when NEXT_PUBLIC_SANITY_PROJECT_ID is missing", () => {
    beforeEach(() => {
      vi.stubEnv("NEXT_PUBLIC_SANITY_PROJECT_ID", "");
    });

    it("client is null", async () => {
      const { client } = await import("@/lib/sanity");
      expect(client).toBeNull();
    });

    it("urlFor returns a chainable stub", async () => {
      const { urlFor } = await import("@/lib/sanity");
      const result = urlFor("some-source");
      expect(result).toBeDefined();
      expect(typeof result.url).toBe("function");
    });

    it("stub .url() returns empty string", async () => {
      const { urlFor } = await import("@/lib/sanity");
      expect(urlFor("x").url()).toBe("");
    });

    it("chaining .width().height().format().url() returns empty string", async () => {
      const { urlFor } = await import("@/lib/sanity");
      expect(urlFor("x").width(100).height(100).format("webp").url()).toBe("");
    });

    it("chaining .fit().quality().auto().url() returns empty string", async () => {
      const { urlFor } = await import("@/lib/sanity");
      expect(urlFor("x").fit("max").quality(80).auto("format").url()).toBe("");
    });
  });

  describe("when NEXT_PUBLIC_SANITY_PROJECT_ID is invalid", () => {
    beforeEach(() => {
      vi.stubEnv("NEXT_PUBLIC_SANITY_PROJECT_ID", "!!!INVALID!!!");
    });

    it("client is null for non-alphanumeric project ID", async () => {
      const { client } = await import("@/lib/sanity");
      expect(client).toBeNull();
    });
  });

  describe("exports", () => {
    beforeEach(() => {
      vi.stubEnv("NEXT_PUBLIC_SANITY_PROJECT_ID", "");
    });

    it("exports apiVersion and dataset", async () => {
      const mod = await import("@/lib/sanity");
      expect(mod.apiVersion).toBe("2024-03-01");
      expect(mod.dataset).toBe("production");
    });
  });

  describe("sanityFetch", () => {
    beforeEach(() => {
      vi.stubEnv("NEXT_PUBLIC_SANITY_PROJECT_ID", "");
    });

    it("returns null when client is null", async () => {
      const { sanityFetch } = await import("@/lib/sanity");
      const result = await sanityFetch({ query: "*[_type == 'test']" });
      expect(result).toBeNull();
    });

    it("calls client.fetch with revalidate option", async () => {
      vi.resetModules();
      vi.stubEnv("NEXT_PUBLIC_SANITY_PROJECT_ID", "test-project");

      const mockFetch = vi.fn().mockResolvedValue([{ _id: "1" }]);
      vi.doMock("next-sanity", () => ({
        createClient: () => ({ fetch: mockFetch }),
      }));

      const { sanityFetch } = await import("@/lib/sanity");
      const result = await sanityFetch({ query: "*[_type == 'test']" });

      expect(result).toEqual([{ _id: "1" }]);
      expect(mockFetch).toHaveBeenCalledWith(
        "*[_type == 'test']",
        {},
        { next: { revalidate: 300 } }
      );
    });

    it("accepts custom revalidate value", async () => {
      vi.resetModules();
      vi.stubEnv("NEXT_PUBLIC_SANITY_PROJECT_ID", "test-project");

      const mockFetch = vi.fn().mockResolvedValue(null);
      vi.doMock("next-sanity", () => ({
        createClient: () => ({ fetch: mockFetch }),
      }));

      const { sanityFetch } = await import("@/lib/sanity");
      await sanityFetch({ query: "test", revalidate: 60 });

      expect(mockFetch).toHaveBeenCalledWith(
        "test",
        {},
        { next: { revalidate: 60 } }
      );
    });

    it("passes params through to client.fetch", async () => {
      vi.resetModules();
      vi.stubEnv("NEXT_PUBLIC_SANITY_PROJECT_ID", "test-project");

      const mockFetch = vi.fn().mockResolvedValue(null);
      vi.doMock("next-sanity", () => ({
        createClient: () => ({ fetch: mockFetch }),
      }));

      const { sanityFetch } = await import("@/lib/sanity");
      await sanityFetch({
        query: "test",
        params: { slug: "my-slug" },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "test",
        { slug: "my-slug" },
        { next: { revalidate: 300 } }
      );
    });
  });
});
