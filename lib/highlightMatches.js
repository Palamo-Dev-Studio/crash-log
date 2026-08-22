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
//
// `originalIndex` must have one entry per UTF-16 CODE UNIT of the folded output, not
// one per code point: `pattern.exec()` below reports `match.index` and match length
// in native string (UTF-16) offsets, and `folded` is built by concatenating strings,
// so any surviving astral character (emoji, rare CJK, math letters) occupies TWO
// units in `folded` while being one iteration of a code-point loop. Indexing
// `originalIndex` per code point instead of per unit desyncs the map by however many
// astral characters precede a match — not a missed highlight but WRONG TEXT: real
// content silently corrupted or dropped when a title contains e.g. an emoji.
function buildFoldedIndex(text) {
  const chars = Array.from(text);
  const foldedChars = [];
  const originalIndex = [];

  chars.forEach((ch, i) => {
    const folded = normalize(ch);
    for (let unit = 0; unit < folded.length; unit++) {
      foldedChars.push(folded[unit]);
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
  // The `i` flag is LOAD-BEARING, not redundant with normalize()'s own lowercasing:
  // normalize() folds per-character here but whole-string in searchArchive.js, and
  // toLowerCase() is not always context-independent between those two (Greek final
  // sigma: "ΛΟΓΟΣ" → "λογος" whole-string vs "λογοσ" per-character). The regex's own
  // Unicode case-insensitive comparison treats σ/ς/Σ as equivalent regardless, which
  // is what keeps a match found by searchArchive still highlightable here.
  const sorted = [...new Set(tokens)].sort((a, b) => b.length - a.length);
  const pattern = new RegExp(`(${sorted.map(escapeRegExp).join("|")})`, "gi");

  const parts = [];
  let cursor = 0;
  let key = 0;
  let match;
  while ((match = pattern.exec(folded)) !== null) {
    const start = originalIndex[match.index];
    const end = originalIndex[match.index + match[0].length - 1] + 1;

    // A later match can land entirely inside an original character already covered
    // by a previous mark (e.g. two tokens matching disjoint parts of one original
    // character's multi-unit fold) -- skip it rather than re-slicing the same
    // original text into a duplicate mark. Clamp `start` for the same reason: it
    // can't retreat before `cursor` even when it doesn't fully overlap.
    if (end <= cursor) continue;
    const clampedStart = Math.max(start, cursor);

    if (clampedStart > cursor) {
      parts.push(chars.slice(cursor, clampedStart).join(""));
    }
    parts.push(
      React.createElement(
        "mark",
        { key: key++ },
        chars.slice(clampedStart, end).join("")
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
