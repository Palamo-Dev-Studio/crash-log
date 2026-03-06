// ABOUTME: Integration tests for the POST /api/revalidate webhook endpoint.
// ABOUTME: Validates signature verification, error handling, and cache revalidation.

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockRevalidatePath = vi.fn();
const mockParseBody = vi.fn();

vi.mock("next/cache", () => ({
  revalidatePath: (...args) => mockRevalidatePath(...args),
}));

vi.mock("next-sanity/webhook", () => ({
  parseBody: (...args) => mockParseBody(...args),
}));

let POST;

beforeEach(async () => {
  vi.resetModules();
  mockRevalidatePath.mockReset();
  mockParseBody.mockReset();
  process.env.SANITY_REVALIDATE_SECRET = "test-webhook-secret";

  const mod = await import("@/app/api/revalidate/route.js");
  POST = mod.POST;
});

afterEach(() => {
  delete process.env.SANITY_REVALIDATE_SECRET;
});

function makeRequest() {
  return new Request("https://crashlog.ai/api/revalidate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ _type: "issue", _id: "test-123" }),
  });
}

describe("POST /api/revalidate", () => {
  it("returns 500 when secret env var is missing", async () => {
    delete process.env.SANITY_REVALIDATE_SECRET;

    vi.resetModules();
    const mod = await import("@/app/api/revalidate/route.js");
    const response = await mod.POST(makeRequest());

    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.error).toContain("not configured");
  });

  it("returns 401 on invalid signature", async () => {
    mockParseBody.mockResolvedValueOnce({
      isValidSignature: false,
      body: { _type: "issue" },
    });

    const response = await POST(makeRequest());

    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.error).toContain("Invalid signature");
  });

  it("returns 400 when body is missing _type", async () => {
    mockParseBody.mockResolvedValueOnce({
      isValidSignature: true,
      body: { _id: "test-123" },
    });

    const response = await POST(makeRequest());

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.error).toContain("Missing document type");
  });

  it("returns 200 and revalidates on valid webhook", async () => {
    mockParseBody.mockResolvedValueOnce({
      isValidSignature: true,
      body: { _type: "issue", _id: "test-123" },
    });

    const response = await POST(makeRequest());

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.revalidated).toBe(true);
    expect(json.type).toBe("issue");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/", "layout");
  });

  it("handles story document type", async () => {
    mockParseBody.mockResolvedValueOnce({
      isValidSignature: true,
      body: { _type: "story", _id: "story-456" },
    });

    const response = await POST(makeRequest());

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.type).toBe("story");
  });

  it("handles category document type", async () => {
    mockParseBody.mockResolvedValueOnce({
      isValidSignature: true,
      body: { _type: "category", _id: "cat-789" },
    });

    const response = await POST(makeRequest());

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.type).toBe("category");
  });

  it("returns 500 when parseBody throws", async () => {
    mockParseBody.mockRejectedValueOnce(new Error("Parse error"));

    const response = await POST(makeRequest());

    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.error).toContain("Failed to process");
  });

  it("passes secret to parseBody", async () => {
    mockParseBody.mockResolvedValueOnce({
      isValidSignature: true,
      body: { _type: "issue", _id: "test" },
    });

    await POST(makeRequest());

    expect(mockParseBody).toHaveBeenCalledWith(
      expect.any(Request),
      "test-webhook-secret"
    );
  });
});
