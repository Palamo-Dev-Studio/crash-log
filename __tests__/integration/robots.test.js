// ABOUTME: Integration tests for robots.js route handler.
// ABOUTME: Validates user-agent rules, disallowed paths, crawl delays, and sitemap URL.

import { describe, it, expect } from "vitest";
import robots from "@/app/robots";

describe("robots()", () => {
  const result = robots();

  it("returns rules array", () => {
    expect(Array.isArray(result.rules)).toBe(true);
    expect(result.rules.length).toBeGreaterThan(0);
  });

  it("has a wildcard user-agent rule", () => {
    const wildcardRule = result.rules.find((r) => r.userAgent === "*");
    expect(wildcardRule).toBeDefined();
    expect(wildcardRule.allow).toBe("/");
  });

  it("disallows /studio/", () => {
    const wildcardRule = result.rules.find((r) => r.userAgent === "*");
    expect(wildcardRule.disallow).toContain("/studio/");
  });

  it("disallows /_next/", () => {
    const wildcardRule = result.rules.find((r) => r.userAgent === "*");
    expect(wildcardRule.disallow).toContain("/_next/");
  });

  it("disallows /.vercel/", () => {
    const wildcardRule = result.rules.find((r) => r.userAgent === "*");
    expect(wildcardRule.disallow).toContain("/.vercel/");
  });

  it("sets crawl delay for GPTBot", () => {
    const gptRule = result.rules.find((r) => r.userAgent === "GPTBot");
    expect(gptRule).toBeDefined();
    expect(gptRule.crawlDelay).toBe(10);
  });

  it("sets crawl delay for CCBot", () => {
    const ccRule = result.rules.find((r) => r.userAgent === "CCBot");
    expect(ccRule).toBeDefined();
    expect(ccRule.crawlDelay).toBe(10);
  });

  it("sets sitemap to crashlog.ai", () => {
    expect(result.sitemap).toBe("https://crashlog.ai/sitemap.xml");
  });
});
