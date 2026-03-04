// ABOUTME: Unit tests for lib/sanity.js — client initialization and urlFor stub behavior.
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
});
