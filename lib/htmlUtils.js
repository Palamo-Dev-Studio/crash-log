// ABOUTME: HTML escaping and URL sanitization utilities for email templates.
// ABOUTME: Prevents XSS by escaping special characters and rejecting dangerous URL schemes.

const UNSAFE_SCHEMES = /^(javascript|data|vbscript):/i;

export function escapeHtml(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function sanitizeHref(href) {
  if (typeof href !== "string") return "#";
  const trimmed = href.trim();
  if (UNSAFE_SCHEMES.test(trimmed)) return "#";
  return escapeHtml(trimmed);
}
