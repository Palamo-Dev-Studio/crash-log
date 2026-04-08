// ABOUTME: Renders text with case-insensitive substring matches wrapped in <mark> spans.
// ABOUTME: Used by ArchiveCard and ColumnCard to highlight search query matches in titles and subtitles.

import React from "react";

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function highlightMatches(text, query) {
  if (!text) return null;
  if (!query || !query.trim()) return text;

  const tokens = query
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);

  if (tokens.length === 0) return text;

  // Build a single regex matching any token (longest first to prefer longer matches).
  const sorted = [...new Set(tokens)].sort((a, b) => b.length - a.length);
  const pattern = new RegExp(`(${sorted.map(escapeRegExp).join("|")})`, "gi");

  const parts = text.split(pattern);
  return parts.map((part, i) => {
    if (!part) return null;
    if (pattern.test(part) && sorted.includes(part.toLowerCase())) {
      // Reset lastIndex since we're using a global regex with .test()
      pattern.lastIndex = 0;
      return React.createElement("mark", { key: i }, part);
    }
    pattern.lastIndex = 0;
    return part;
  });
}
