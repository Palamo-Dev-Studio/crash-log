// ABOUTME: Renders text with diacritic-folded, case-insensitive substring matches wrapped in <mark> spans.
// ABOUTME: Used by ArchiveCard and ColumnCard to highlight search query matches in titles and subtitles.

import React from "react";
import { normalize } from "@/lib/searchArchive";

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Fold `text` character-by-character through the same normalize() used to build the
// search index, while recording which ORIGINAL character produced each folded
// character. Matching then happens against the folded string (so a query for
// "critica" finds "Crítica"), but highlighting slices the ORIGINAL text using the
// recovered indices — the accented characters render untouched, never the folded
// stand-ins. Per-character folding (rather than folding the whole string at once)
// keeps the index map correct even if a character's fold produces zero or more than
// one output character (e.g. a lone combining mark folds away to nothing).
function buildFoldedIndex(text) {
  const chars = Array.from(text);
  const foldedChars = [];
  const originalIndex = [];

  chars.forEach((ch, i) => {
    for (const foldedChar of normalize(ch)) {
      foldedChars.push(foldedChar);
      originalIndex.push(i);
    }
  });

  return { folded: foldedChars.join(""), originalIndex, chars };
}

export function highlightMatches(text, query) {
  if (!text) return null;
  if (!query || !query.trim()) return text;

  const tokens = query
    .split(/\s+/)
    .map((t) => normalize(t.trim()))
    .filter(Boolean);

  if (tokens.length === 0) return text;

  const { folded, originalIndex, chars } = buildFoldedIndex(text);

  // Build a single regex matching any token (longest first to prefer longer matches).
  const sorted = [...new Set(tokens)].sort((a, b) => b.length - a.length);
  const pattern = new RegExp(`(${sorted.map(escapeRegExp).join("|")})`, "gi");

  const parts = [];
  let cursor = 0;
  let key = 0;
  let match;
  while ((match = pattern.exec(folded)) !== null) {
    const start = originalIndex[match.index];
    const end = originalIndex[match.index + match[0].length - 1] + 1;

    if (start > cursor) {
      parts.push(chars.slice(cursor, start).join(""));
    }
    parts.push(
      React.createElement(
        "mark",
        { key: key++ },
        chars.slice(start, end).join("")
      )
    );
    cursor = end;
  }

  if (parts.length === 0) return text;
  if (cursor < chars.length) {
    parts.push(chars.slice(cursor).join(""));
  }

  return parts;
}
