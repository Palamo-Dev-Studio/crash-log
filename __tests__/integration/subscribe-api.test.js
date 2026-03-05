// ABOUTME: Integration tests for the POST /api/subscribe route handler.
// ABOUTME: Validates email validation, Beehiiv API proxy behavior, and error handling.

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

let POST;
const originalFetch = global.fetch;

beforeEach(async () => {
  vi.resetModules();
  global.fetch = vi.fn();
  process.env.BEEHIIV_API_KEY = "test-api-key";
  process.env.BEEHIIV_PUBLICATION_ID = "test-pub-id";

  const mod = await import("@/app/api/subscribe/route.js");
  POST = mod.POST;
});

afterEach(() => {
  global.fetch = originalFetch;
  delete process.env.BEEHIIV_API_KEY;
  delete process.env.BEEHIIV_PUBLICATION_ID;
});

function makeRequest(body) {
  return new Request("https://crashlog.ai/api/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/subscribe", () => {
  it("returns 503 when env vars are missing", async () => {
    delete process.env.BEEHIIV_API_KEY;
    delete process.env.BEEHIIV_PUBLICATION_ID;

    vi.resetModules();
    const mod = await import("@/app/api/subscribe/route.js");
    const response = await mod.POST(makeRequest({ email: "a@b.com" }));

    expect(response.status).toBe(503);
    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.error).toContain("not configured");
  });

  it("returns 400 when email is missing", async () => {
    const response = await POST(makeRequest({}));

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.error).toContain("required");
  });

  it("returns 400 for invalid email format", async () => {
    const response = await POST(makeRequest({ email: "not-an-email" }));

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.error).toContain("Invalid email");
  });

  it("returns 400 for invalid JSON body", async () => {
    const request = new Request("https://crashlog.ai/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not json",
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.success).toBe(false);
  });

  it("returns success on valid subscription", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
    });

    const response = await POST(makeRequest({ email: "test@example.com" }));

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.alreadySubscribed).toBeUndefined();
  });

  it("sends correct payload to Beehiiv", async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, status: 200 });

    await POST(makeRequest({ email: "test@example.com" }));

    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.beehiiv.com/v2/publications/test-pub-id/subscriptions",
      expect.objectContaining({
        method: "POST",
        headers: {
          Authorization: "Bearer test-api-key",
          "Content-Type": "application/json",
        },
      })
    );

    const callBody = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(callBody.email).toBe("test@example.com");
    expect(callBody.utm_source).toBe("crashlog.ai");
    expect(callBody.utm_medium).toBe("website");
  });

  it("treats 409 (already subscribed) as success", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 409,
    });

    const response = await POST(makeRequest({ email: "test@example.com" }));

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.alreadySubscribed).toBe(true);
  });

  it("returns 502 for other Beehiiv errors", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: () => Promise.resolve("Internal Server Error"),
    });

    const response = await POST(makeRequest({ email: "test@example.com" }));

    expect(response.status).toBe(502);
    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.error).toContain("Failed to subscribe");
  });

  it("returns 503 for network failures", async () => {
    global.fetch.mockRejectedValueOnce(new Error("Network unreachable"));

    const response = await POST(makeRequest({ email: "test@example.com" }));

    expect(response.status).toBe(503);
    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.error).toContain("temporarily unavailable");
  });
});
