// ABOUTME: Integration tests for the POST /api/send-column-newsletter route handler.
// ABOUTME: Validates auth, column fetching, Beehiiv draft creation, and error handling.

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockFetch = vi.fn();
const originalFetch = global.fetch;

const mockColumn = {
  _id: "column-001",
  columnNumber: 1,
  slug: "2026-03-07",
  publishDate: "2026-03-07T00:00:00.000Z",
  status: "published",
  title: {
    en: "Week in Review",
    es: "Semana en Resumen",
  },
  subtitle: { en: "A busy week", es: "Una semana ocupada" },
  body: {
    en: [
      {
        _type: "block",
        _key: "a",
        children: [{ _type: "span", text: "Hello" }],
      },
    ],
    es: [
      {
        _type: "block",
        _key: "b",
        children: [{ _type: "span", text: "Hola" }],
      },
    ],
  },
};

const mockColumnEnOnly = {
  ...mockColumn,
  title: { en: "EN Only Column" },
  body: {
    en: [
      {
        _type: "block",
        _key: "a",
        children: [{ _type: "span", text: "Hello" }],
      },
    ],
  },
};

vi.mock("@/lib/sanity", () => {
  const stub = {
    url: () => "https://cdn.sanity.io/images/test/production/test.jpg",
    width: () => stub,
    height: () => stub,
    format: () => stub,
    fit: () => stub,
    quality: () => stub,
    auto: () => stub,
  };
  return {
    client: { fetch: vi.fn() },
    urlFor: () => stub,
  };
});

let POST;
let sanityClient;

beforeEach(async () => {
  vi.resetModules();
  global.fetch = mockFetch;
  mockFetch.mockReset();
  process.env.BEEHIIV_API_KEY = "test-api-key";
  process.env.BEEHIIV_PUBLICATION_ID = "test-pub-id";
  process.env.SEND_NEWSLETTER_SECRET = "test-secret";

  const mod = await import("@/app/api/send-column-newsletter/route.js");
  POST = mod.POST;

  const sanityMod = await import("@/lib/sanity");
  sanityClient = sanityMod.client;
});

afterEach(() => {
  global.fetch = originalFetch;
  delete process.env.BEEHIIV_API_KEY;
  delete process.env.BEEHIIV_PUBLICATION_ID;
  delete process.env.SEND_NEWSLETTER_SECRET;
});

function makeRequest(body, { withAuth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (withAuth) headers.Authorization = "Bearer test-secret";
  return new Request("https://crashlog.ai/api/send-column-newsletter", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

describe("POST /api/send-column-newsletter", () => {
  it("returns 503 when env vars are missing", async () => {
    delete process.env.BEEHIIV_API_KEY;
    delete process.env.BEEHIIV_PUBLICATION_ID;
    delete process.env.SEND_NEWSLETTER_SECRET;

    vi.resetModules();
    const mod = await import("@/app/api/send-column-newsletter/route.js");
    const response = await mod.POST(makeRequest({ slug: "test" }));

    expect(response.status).toBe(503);
    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.error).toContain("not configured");
  });

  it("returns 401 when Authorization header is missing", async () => {
    const response = await POST(
      makeRequest({ slug: "test" }, { withAuth: false })
    );

    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.error).toContain("Unauthorized");
  });

  it("returns 400 when slug is missing", async () => {
    const response = await POST(makeRequest({}));

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.error).toContain("Slug is required");
  });

  it("returns 400 for invalid JSON body", async () => {
    const request = new Request(
      "https://crashlog.ai/api/send-column-newsletter",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-secret",
        },
        body: "not json",
      }
    );

    const response = await POST(request);

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.success).toBe(false);
  });

  it("returns 404 when column not found in Sanity", async () => {
    sanityClient.fetch.mockResolvedValueOnce(null);

    const response = await POST(makeRequest({ slug: "nonexistent" }));

    expect(response.status).toBe(404);
    const json = await response.json();
    expect(json.error).toContain("not found");
  });

  it("returns 502 when Sanity fetch fails", async () => {
    sanityClient.fetch.mockRejectedValueOnce(new Error("Sanity down"));

    const response = await POST(makeRequest({ slug: "2026-03-07" }));

    expect(response.status).toBe(502);
    const json = await response.json();
    expect(json.error).toContain("Failed to fetch");
  });

  it("creates EN-only draft when no ES translation exists", async () => {
    sanityClient.fetch.mockResolvedValueOnce(mockColumnEnOnly);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: { id: "beehiiv-en-123" } }),
    });

    const response = await POST(makeRequest({ slug: "2026-03-07" }));

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.en).toEqual({ id: "beehiiv-en-123" });
    expect(json.es).toBeNull();
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("creates both EN and ES drafts when full translation exists", async () => {
    sanityClient.fetch.mockResolvedValueOnce(mockColumn);
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: { id: "beehiiv-en-456" } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: { id: "beehiiv-es-789" } }),
      });

    const response = await POST(makeRequest({ slug: "2026-03-07" }));

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.en).toEqual({ id: "beehiiv-en-456" });
    expect(json.es).toEqual({ id: "beehiiv-es-789" });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("sends correct payload to Beehiiv", async () => {
    sanityClient.fetch.mockResolvedValueOnce(mockColumnEnOnly);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: { id: "beehiiv-en-100" } }),
    });

    await POST(makeRequest({ slug: "2026-03-07" }));

    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.beehiiv.com/v2/publications/test-pub-id/posts",
      expect.objectContaining({
        method: "POST",
      })
    );

    const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(callBody.title).toContain("Nico\u2019s Notes #001");
    expect(callBody.status).toBe("draft");
    expect(callBody.content_html).toContain("<!DOCTYPE html>");
  });

  it("returns 502 when Beehiiv EN draft creation fails", async () => {
    sanityClient.fetch.mockResolvedValueOnce(mockColumn);
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: () => Promise.resolve("Internal Server Error"),
    });

    const response = await POST(makeRequest({ slug: "2026-03-07" }));

    expect(response.status).toBe(502);
    const json = await response.json();
    expect(json.error).toContain("EN draft");
  });

  it("returns partial success when EN works but ES fails", async () => {
    sanityClient.fetch.mockResolvedValueOnce(mockColumn);
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: { id: "beehiiv-en-ok" } }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: () => Promise.resolve("Server Error"),
      });

    const response = await POST(makeRequest({ slug: "2026-03-07" }));

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.en).toEqual({ id: "beehiiv-en-ok" });
    expect(json.es).toBeNull();
    expect(json.esError).toContain("Failed to create ES draft");
  });
});
