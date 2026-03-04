// ABOUTME: Integration tests for locale detection middleware.
// ABOUTME: Validates passthrough rules, redirect logic, cookie/header priority.

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock next/server — NextResponse and NextRequest are not available in jsdom
const mockNext = vi.fn(() => ({ type: "next" }));
const mockRedirect = vi.fn((url) => ({ type: "redirect", url: url.toString() }));

vi.mock("next/server", () => ({
  NextResponse: {
    next: () => mockNext(),
    redirect: (url) => mockRedirect(url),
  },
}));

let middleware;

beforeEach(async () => {
  vi.resetModules();
  mockNext.mockClear();
  mockRedirect.mockClear();
  const mod = await import("@/middleware");
  middleware = mod.middleware;
});

function makeRequest(pathname, { cookies = {}, acceptLanguage = "" } = {}) {
  return {
    nextUrl: {
      pathname,
      clone() {
        return { pathname: this.pathname };
      },
    },
    cookies: {
      get(name) {
        return cookies[name] ? { value: cookies[name] } : undefined;
      },
    },
    headers: {
      get(name) {
        if (name === "accept-language") return acceptLanguage;
        return null;
      },
    },
  };
}

describe("middleware passthrough", () => {
  it("passes through /_next/* paths", () => {
    middleware(makeRequest("/_next/static/chunk.js"));
    expect(mockNext).toHaveBeenCalled();
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("passes through /api/* paths", () => {
    middleware(makeRequest("/api/revalidate"));
    expect(mockNext).toHaveBeenCalled();
  });

  it("passes through /studio/* paths", () => {
    middleware(makeRequest("/studio/desk"));
    expect(mockNext).toHaveBeenCalled();
  });

  it("passes through file extension paths", () => {
    middleware(makeRequest("/favicon.ico"));
    expect(mockNext).toHaveBeenCalled();
  });

  it("passes through paths with existing locale prefix /en", () => {
    middleware(makeRequest("/en"));
    expect(mockNext).toHaveBeenCalled();
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("passes through paths with existing locale prefix /es/archive", () => {
    middleware(makeRequest("/es/archive"));
    expect(mockNext).toHaveBeenCalled();
    expect(mockRedirect).not.toHaveBeenCalled();
  });
});

describe("middleware redirect", () => {
  it("redirects / to /en by default", () => {
    middleware(makeRequest("/"));
    expect(mockRedirect).toHaveBeenCalled();
    const url = mockRedirect.mock.calls[0][0];
    expect(url.pathname).toBe("/en/");
  });

  it("redirects / to /es when Accept-Language includes es", () => {
    middleware(makeRequest("/", { acceptLanguage: "es-ES,es;q=0.9" }));
    expect(mockRedirect).toHaveBeenCalled();
    const url = mockRedirect.mock.calls[0][0];
    expect(url.pathname).toBe("/es/");
  });

  it("respects CRASH_LOG_LOCALE cookie over Accept-Language", () => {
    middleware(
      makeRequest("/", {
        cookies: { CRASH_LOG_LOCALE: "es" },
        acceptLanguage: "en-US",
      })
    );
    const url = mockRedirect.mock.calls[0][0];
    expect(url.pathname).toBe("/es/");
  });

  it("ignores invalid cookie value", () => {
    middleware(
      makeRequest("/", {
        cookies: { CRASH_LOG_LOCALE: "fr" },
        acceptLanguage: "es",
      })
    );
    const url = mockRedirect.mock.calls[0][0];
    expect(url.pathname).toBe("/es/");
  });

  it("redirects /archive to /en/archive by default", () => {
    middleware(makeRequest("/archive"));
    const url = mockRedirect.mock.calls[0][0];
    expect(url.pathname).toBe("/en/archive");
  });
});

describe("middleware config", () => {
  it("exports a matcher config", async () => {
    const mod = await import("@/middleware");
    expect(mod.config).toBeDefined();
    expect(mod.config.matcher).toBeDefined();
  });
});
