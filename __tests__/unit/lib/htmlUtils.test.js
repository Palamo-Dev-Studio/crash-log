// ABOUTME: Unit tests for HTML escaping and URL sanitization utilities.
// ABOUTME: Validates XSS prevention in email template output.

import { describe, it, expect } from "vitest";
import { escapeHtml, sanitizeHref } from "@/lib/htmlUtils";

describe("escapeHtml", () => {
  it("escapes ampersands", () => {
    expect(escapeHtml("AT&T")).toBe("AT&amp;T");
  });

  it("escapes angle brackets", () => {
    expect(escapeHtml("<script>")).toBe("&lt;script&gt;");
  });

  it("escapes double quotes", () => {
    expect(escapeHtml('"hello"')).toBe("&quot;hello&quot;");
  });

  it("escapes single quotes", () => {
    expect(escapeHtml("it's")).toBe("it&#39;s");
  });

  it("handles all special characters together", () => {
    expect(escapeHtml('<a href="x">&')).toBe(
      "&lt;a href=&quot;x&quot;&gt;&amp;"
    );
  });

  it("returns empty string for null", () => {
    expect(escapeHtml(null)).toBe("");
  });

  it("returns empty string for undefined", () => {
    expect(escapeHtml(undefined)).toBe("");
  });

  it("returns empty string for non-string types", () => {
    expect(escapeHtml(123)).toBe("");
  });

  it("passes through safe strings unchanged", () => {
    expect(escapeHtml("Hello World")).toBe("Hello World");
  });
});

describe("sanitizeHref", () => {
  it("passes through https URLs", () => {
    expect(sanitizeHref("https://example.com")).toBe("https://example.com");
  });

  it("passes through http URLs", () => {
    expect(sanitizeHref("http://example.com")).toBe("http://example.com");
  });

  it("blocks javascript: URLs", () => {
    expect(sanitizeHref("javascript:alert(1)")).toBe("#");
  });

  it("blocks JavaScript: URLs (case insensitive)", () => {
    expect(sanitizeHref("JavaScript:alert(1)")).toBe("#");
  });

  it("blocks data: URLs", () => {
    expect(sanitizeHref("data:text/html,<h1>XSS</h1>")).toBe("#");
  });

  it("blocks vbscript: URLs", () => {
    expect(sanitizeHref("vbscript:MsgBox")).toBe("#");
  });

  it("returns # for null input", () => {
    expect(sanitizeHref(null)).toBe("#");
  });

  it("returns # for undefined input", () => {
    expect(sanitizeHref(undefined)).toBe("#");
  });

  it("escapes HTML special chars in URLs", () => {
    expect(sanitizeHref('https://example.com?a="b"')).toBe(
      "https://example.com?a=&quot;b&quot;"
    );
  });

  it("trims whitespace", () => {
    expect(sanitizeHref("  https://example.com  ")).toBe("https://example.com");
  });
});
