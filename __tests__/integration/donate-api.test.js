// ABOUTME: Integration tests for the POST /api/donate route handler.
// ABOUTME: Validates amount validation, Stripe session creation, and error handling.

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockCreate = vi.fn();

vi.mock("stripe", () => {
  return {
    default: vi.fn(function () {
      this.checkout = {
        sessions: {
          create: mockCreate,
        },
      };
    }),
  };
});

let POST;

beforeEach(async () => {
  vi.resetModules();
  mockCreate.mockReset();
  process.env.STRIPE_SECRET_KEY = "sk_test_fake";

  const mod = await import("@/app/api/donate/route.js");
  POST = mod.POST;
});

afterEach(() => {
  delete process.env.STRIPE_SECRET_KEY;
});

function makeRequest(body) {
  return new Request("https://crashlog.ai/api/donate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/donate", () => {
  it("returns 503 when STRIPE_SECRET_KEY is missing", async () => {
    delete process.env.STRIPE_SECRET_KEY;

    vi.resetModules();
    const mod = await import("@/app/api/donate/route.js");
    const response = await mod.POST(
      makeRequest({ amount: 500, locale: "en", returnPath: "/en" })
    );

    expect(response.status).toBe(503);
    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.error).toContain("not configured");
  });

  it("returns 400 for invalid JSON body", async () => {
    const request = new Request("https://crashlog.ai/api/donate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not json",
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.success).toBe(false);
  });

  it("returns 400 when amount is missing", async () => {
    const response = await POST(makeRequest({ locale: "en" }));

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.error).toContain("whole number");
  });

  it("returns 400 when amount is not an integer", async () => {
    const response = await POST(
      makeRequest({ amount: 5.5, locale: "en", returnPath: "/en" })
    );

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.error).toContain("whole number");
  });

  it("returns 400 when amount is below minimum ($3 = 300 cents)", async () => {
    const response = await POST(
      makeRequest({ amount: 299, locale: "en", returnPath: "/en" })
    );

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.error).toContain("Minimum");
  });

  it("returns 400 when amount exceeds maximum ($999 = 99900 cents)", async () => {
    const response = await POST(
      makeRequest({ amount: 100000, locale: "en", returnPath: "/en" })
    );

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.error).toContain("Maximum");
  });

  it("returns 400 when amount is a string", async () => {
    const response = await POST(
      makeRequest({ amount: "500", locale: "en", returnPath: "/en" })
    );

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.success).toBe(false);
  });

  it("returns success with checkout URL on valid request", async () => {
    mockCreate.mockResolvedValueOnce({
      url: "https://checkout.stripe.com/c/pay_abc123",
    });

    const response = await POST(
      makeRequest({ amount: 500, locale: "en", returnPath: "/en" })
    );

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.url).toBe("https://checkout.stripe.com/c/pay_abc123");
  });

  it("creates Stripe session with correct parameters", async () => {
    mockCreate.mockResolvedValueOnce({
      url: "https://checkout.stripe.com/c/pay_abc123",
    });

    await POST(
      makeRequest({ amount: 1000, locale: "en", returnPath: "/en/issue/014" })
    );

    expect(mockCreate).toHaveBeenCalledWith({
      mode: "payment",
      submit_type: "donate",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: "Donation to The Crash Log" },
            unit_amount: 1000,
          },
          quantity: 1,
        },
      ],
      success_url: "https://crashlog.ai/en/issue/014?donated=true",
      cancel_url: "https://crashlog.ai/en/issue/014",
    });
  });

  it("uses Spanish product name when locale is es", async () => {
    mockCreate.mockResolvedValueOnce({
      url: "https://checkout.stripe.com/c/pay_abc123",
    });

    await POST(makeRequest({ amount: 500, locale: "es", returnPath: "/es" }));

    const callArgs = mockCreate.mock.calls[0][0];
    expect(callArgs.line_items[0].price_data.product_data.name).toBe(
      "Donación a The Crash Log"
    );
  });

  it("sanitizes returnPath to prevent open redirect", async () => {
    mockCreate.mockResolvedValueOnce({
      url: "https://checkout.stripe.com/c/pay_abc123",
    });

    await POST(
      makeRequest({
        amount: 500,
        locale: "en",
        returnPath: "https://evil.com/steal",
      })
    );

    const callArgs = mockCreate.mock.calls[0][0];
    expect(callArgs.success_url).toBe("https://crashlog.ai/en?donated=true");
    expect(callArgs.cancel_url).toBe("https://crashlog.ai/en");
  });

  it("defaults returnPath to /en when not provided", async () => {
    mockCreate.mockResolvedValueOnce({
      url: "https://checkout.stripe.com/c/pay_abc123",
    });

    await POST(makeRequest({ amount: 500, locale: "en" }));

    const callArgs = mockCreate.mock.calls[0][0];
    expect(callArgs.success_url).toBe("https://crashlog.ai/en?donated=true");
  });

  it("defaults locale to English product name when not provided", async () => {
    mockCreate.mockResolvedValueOnce({
      url: "https://checkout.stripe.com/c/pay_abc123",
    });

    await POST(makeRequest({ amount: 500 }));

    const callArgs = mockCreate.mock.calls[0][0];
    expect(callArgs.line_items[0].price_data.product_data.name).toBe(
      "Donation to The Crash Log"
    );
  });

  it("returns 502 on Stripe API error", async () => {
    mockCreate.mockRejectedValueOnce(new Error("Stripe is down"));

    const response = await POST(
      makeRequest({ amount: 500, locale: "en", returnPath: "/en" })
    );

    expect(response.status).toBe(502);
    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.error).toContain("Payment service");
  });

  it("accepts exact minimum amount (300 cents = $3)", async () => {
    mockCreate.mockResolvedValueOnce({
      url: "https://checkout.stripe.com/c/pay_min",
    });

    const response = await POST(
      makeRequest({ amount: 300, locale: "en", returnPath: "/en" })
    );

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);
  });

  it("accepts exact maximum amount (99900 cents = $999)", async () => {
    mockCreate.mockResolvedValueOnce({
      url: "https://checkout.stripe.com/c/pay_max",
    });

    const response = await POST(
      makeRequest({ amount: 99900, locale: "en", returnPath: "/en" })
    );

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);
  });

  // --- Recurring donation tests ---

  it("creates one-time payment session by default (no frequency param)", async () => {
    mockCreate.mockResolvedValueOnce({
      url: "https://checkout.stripe.com/c/pay_abc123",
    });

    await POST(makeRequest({ amount: 500, locale: "en", returnPath: "/en" }));

    const callArgs = mockCreate.mock.calls[0][0];
    expect(callArgs.mode).toBe("payment");
    expect(callArgs.submit_type).toBe("donate");
  });

  it("creates one-time payment session when frequency is 'once'", async () => {
    mockCreate.mockResolvedValueOnce({
      url: "https://checkout.stripe.com/c/pay_abc123",
    });

    await POST(
      makeRequest({
        amount: 500,
        locale: "en",
        returnPath: "/en",
        frequency: "once",
      })
    );

    const callArgs = mockCreate.mock.calls[0][0];
    expect(callArgs.mode).toBe("payment");
    expect(callArgs.submit_type).toBe("donate");
  });

  it("creates subscription session when frequency is 'monthly'", async () => {
    mockCreate.mockResolvedValueOnce({
      url: "https://checkout.stripe.com/c/pay_sub123",
    });

    await POST(
      makeRequest({
        amount: 1000,
        locale: "en",
        returnPath: "/en",
        frequency: "monthly",
      })
    );

    const callArgs = mockCreate.mock.calls[0][0];
    expect(callArgs.mode).toBe("subscription");
    expect(callArgs.submit_type).toBeUndefined();
    expect(callArgs.line_items[0].price_data.recurring).toEqual({
      interval: "month",
    });
    expect(callArgs.line_items[0].price_data.currency).toBe("usd");
    expect(callArgs.line_items[0].price_data.unit_amount).toBe(1000);
    expect(callArgs.line_items[0].price_data.product_data.name).toBe(
      "Monthly donation to The Crash Log"
    );
    expect(callArgs.success_url).toBe("https://crashlog.ai/en?donated=true");
    expect(callArgs.cancel_url).toBe("https://crashlog.ai/en");
  });

  it("uses Spanish product name for monthly subscription", async () => {
    mockCreate.mockResolvedValueOnce({
      url: "https://checkout.stripe.com/c/pay_sub_es",
    });

    await POST(
      makeRequest({
        amount: 500,
        locale: "es",
        returnPath: "/es",
        frequency: "monthly",
      })
    );

    const callArgs = mockCreate.mock.calls[0][0];
    expect(callArgs.line_items[0].price_data.product_data.name).toBe(
      "Donación mensual a The Crash Log"
    );
  });

  it("returns 400 for invalid frequency value", async () => {
    const response = await POST(
      makeRequest({
        amount: 500,
        locale: "en",
        returnPath: "/en",
        frequency: "yearly",
      })
    );

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.error).toContain("Invalid frequency");
  });
});
