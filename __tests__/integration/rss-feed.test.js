// ABOUTME: Integration tests for the RSS feed route handler at /[locale]/feed.xml.
// ABOUTME: Validates XML structure, locale handling, and graceful fallback for empty/null states.

import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetIssuesForFeed = vi.fn();

vi.mock("@/lib/queries", () => ({
  getIssuesForFeed: (...args) => mockGetIssuesForFeed(...args),
}));

let GET;

beforeEach(async () => {
  vi.resetModules();
  mockGetIssuesForFeed.mockReset();

  const mod = await import("@/app/(site)/[locale]/feed.xml/route.js");
  GET = mod.GET;
});

const makeRequest = (locale = "en") => {
  const request = new Request(`https://crashlog.ai/${locale}/feed.xml`);
  const params = Promise.resolve({ locale });
  return { request, params };
};

describe("RSS feed route handler", () => {
  it("returns valid RSS XML with correct content type", async () => {
    mockGetIssuesForFeed.mockResolvedValueOnce([
      {
        _id: "issue-1",
        title: { en: "Test Issue", es: "Edición de Prueba" },
        subtitle: { en: "A test subtitle", es: "Un subtítulo de prueba" },
        slug: "test-issue-001",
        publishDate: "2026-03-01",
      },
    ]);

    const { request, params } = makeRequest("en");
    const response = await GET(request, { params });

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe(
      "application/rss+xml; charset=utf-8"
    );

    const xml = await response.text();
    expect(xml).toContain('<?xml version="1.0"');
    expect(xml).toContain('<rss version="2.0"');
    expect(xml).toContain("<title>The Crash Log</title>");
    expect(xml).toContain("<title>Test Issue</title>");
    expect(xml).toContain("/en/issue/test-issue-001");
    expect(xml).toContain('<guid isPermaLink="true">');
  });

  it("uses Spanish content for es locale", async () => {
    mockGetIssuesForFeed.mockResolvedValueOnce([
      {
        _id: "issue-1",
        title: { en: "English Title", es: "Título en Español" },
        subtitle: { en: "English sub", es: "Subtítulo en español" },
        slug: "test-issue",
        publishDate: "2026-03-01",
      },
    ]);

    const { request, params } = makeRequest("es");
    const response = await GET(request, { params });
    const xml = await response.text();

    expect(xml).toContain("<language>es-ES</language>");
    expect(xml).toContain("<title>Título en Español</title>");
    expect(xml).toContain("/es/issue/test-issue");
  });

  it("falls back to English for missing Spanish translations", async () => {
    mockGetIssuesForFeed.mockResolvedValueOnce([
      {
        _id: "issue-1",
        title: { en: "English Only" },
        subtitle: { en: "English sub only" },
        slug: "test-issue",
        publishDate: "2026-03-01",
      },
    ]);

    const { request, params } = makeRequest("es");
    const response = await GET(request, { params });
    const xml = await response.text();

    expect(xml).toContain("<title>English Only</title>");
  });

  it("returns empty feed when no issues exist", async () => {
    mockGetIssuesForFeed.mockResolvedValueOnce([]);

    const { request, params } = makeRequest("en");
    const response = await GET(request, { params });
    const xml = await response.text();

    expect(response.status).toBe(200);
    expect(xml).toContain('<rss version="2.0"');
    expect(xml).toContain("<title>The Crash Log</title>");
    expect(xml).not.toContain("<item>");
  });

  it("returns empty feed when getIssuesForFeed returns null", async () => {
    mockGetIssuesForFeed.mockResolvedValueOnce(null);

    const { request, params } = makeRequest("en");
    const response = await GET(request, { params });
    const xml = await response.text();

    expect(response.status).toBe(200);
    expect(xml).toContain('<rss version="2.0"');
    expect(xml).not.toContain("<item>");
  });

  it("escapes XML special characters in titles", async () => {
    mockGetIssuesForFeed.mockResolvedValueOnce([
      {
        _id: "issue-1",
        title: { en: 'AI & "Robots" <Rise>' },
        subtitle: { en: "Test's subtitle" },
        slug: "test-issue",
        publishDate: "2026-03-01",
      },
    ]);

    const { request, params } = makeRequest("en");
    const response = await GET(request, { params });
    const xml = await response.text();

    expect(xml).toContain("&amp;");
    expect(xml).toContain("&lt;");
    expect(xml).toContain("&gt;");
    expect(xml).toContain("&quot;");
    expect(xml).toContain("&apos;");
  });

  it("includes atom self-link for feed validation", async () => {
    mockGetIssuesForFeed.mockResolvedValueOnce([]);

    const { request, params } = makeRequest("en");
    const response = await GET(request, { params });
    const xml = await response.text();

    expect(xml).toContain('xmlns:atom="http://www.w3.org/2005/Atom"');
    expect(xml).toContain('atom:link href="https://crashlog.ai/en/feed.xml"');
  });

  it("normalizes unknown locales to English", async () => {
    mockGetIssuesForFeed.mockResolvedValueOnce([]);

    const request = new Request("https://crashlog.ai/fr/feed.xml");
    const params = Promise.resolve({ locale: "fr" });
    const response = await GET(request, { params });
    const xml = await response.text();

    expect(xml).toContain("<language>en-US</language>");
  });
});
