// ABOUTME: The one gate for outbound hrefs built from CMS data: http(s) and mailto only, nothing else.
// ABOUTME: Returns the trimmed url or null; callers render plain text when it is null. Relative urls only when the caller allows them.

const ALLOWED_PROTOCOLS = new Set(["https:", "http:", "mailto:"]);
// Control characters never belong in a real link; browsers strip some of them
// inside a scheme ("java\tscript:"), so any that survive the trim fail the url.
const CONTROL_CHARS = /[\u0000-\u001F\u007F]/;

export function safeExternalHref(url, { allowRelative = false } = {}) {
  if (typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed || CONTROL_CHARS.test(trimmed)) return null;

  if (allowRelative) {
    // "/path", "#frag" and "?q" stay on this site. "//host" and "/\host" are
    // protocol-relative to a browser, so they are not relative at all.
    if (/^[#?]/.test(trimmed)) return trimmed;
    if (trimmed.startsWith("/") && !/^\/[/\\]/.test(trimmed)) return trimmed;
  }

  try {
    const { protocol } = new URL(trimmed);
    return ALLOWED_PROTOCOLS.has(protocol) ? trimmed : null;
  } catch {
    return null;
  }
}
