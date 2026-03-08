// ABOUTME: Integration tests for the RSS feed route handler at /[locale]/nico/feed.xml.
// ABOUTME: Validates XML structure, locale handling, and graceful fallback for empty/null states.

import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetColumnsForFeed = vi.fn();

vi.mock("@/lib/queries", () => ({
  getColumnsForFeed: (...args) => mockGetColumnsForFeed(...args),
}));

let GET;

beforeEach(async () => {
  vi.resetModules();
  mockGetColumnsForFeed.mockReset();

  const mod = await import("@/app/(site)/[locale]/nico/feed.xml/route.js");
  GET = mod.GET;
});

const makeRequest = (locale = "en") => {
  const request = new Request(`https://crashlog.ai/${locale}/nico/feed.xml`);
  const params = Promise.resolve({ locale });
  return { request, params };
};

describe("Column RSS feed route handler", () => {
  it("returns valid RSS XML with correct content type", async () => {
    mockGetColumnsForFeed.mockResolvedValueOnce([
      {
        _id: "column-1",
        title: { en: "Week in Review", es: "Semana en Resumen" },
        subtitle: { en: "A busy week", es: "Una semana ocupada" },
        slug: "2026-03-07",
        publishDate: "2026-03-07",
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
    expect(xml).toContain("Nico");
    expect(xml).toContain("<title>Week in Review</title>");
    expect(xml).toContain("/en/nico/2026-03-07");
  });

  it("uses Spanish content for es locale", async () => {
    mockGetColumnsForFeed.mockResolvedValueOnce([
      {
        _id: "column-1",
        title: { en: "English Title", es: "T\u00EDtulo en Espa\u00F1ol" },
        subtitle: { en: "English sub", es: "Subt\u00EDtulo" },
        slug: "2026-03-07",
        publishDate: "2026-03-07",
      },
    ]);

    const { request, params } = makeRequest("es");
    const response = await GET(request, { params });
    const xml = await response.text();

    expect(xml).toContain("<language>es-es</language>");
    expect(xml).toContain("T\u00EDtulo en Espa\u00F1ol");
    expect(xml).toContain("/es/nico/2026-03-07");
  });

  it("returns empty feed when no columns exist", async () => {
    mockGetColumnsForFeed.mockResolvedValueOnce([]);

    const { request, params } = makeRequest("en");
    const response = await GET(request, { params });
    const xml = await response.text();

    expect(response.status).toBe(200);
    expect(xml).toContain('<rss version="2.0"');
    expect(xml).toContain("Nico");
    expect(xml).not.toContain("<item>");
  });

  it("returns empty feed when getColumnsForFeed returns null", async () => {
    mockGetColumnsForFeed.mockResolvedValueOnce(null);

    const { request, params } = makeRequest("en");
    const response = await GET(request, { params });
    const xml = await response.text();

    expect(response.status).toBe(200);
    expect(xml).not.toContain("<item>");
  });

  it("includes atom self-link for feed validation", async () => {
    mockGetColumnsForFeed.mockResolvedValueOnce([]);

    const { request, params } = makeRequest("en");
    const response = await GET(request, { params });
    const xml = await response.text();

    expect(xml).toContain('xmlns:atom="http://www.w3.org/2005/Atom"');
    expect(xml).toContain(
      'atom:link href="https://crashlog.ai/en/nico/feed.xml"'
    );
  });

  it("escapes XML special characters", async () => {
    mockGetColumnsForFeed.mockResolvedValueOnce([
      {
        _id: "column-1",
        title: { en: 'AI & "Robots"' },
        subtitle: { en: "Test's subtitle" },
        slug: "2026-03-07",
        publishDate: "2026-03-07",
      },
    ]);

    const { request, params } = makeRequest("en");
    const response = await GET(request, { params });
    const xml = await response.text();

    expect(xml).toContain("&amp;");
    expect(xml).toContain("&quot;");
    expect(xml).toContain("&apos;");
  });
});
