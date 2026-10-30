// ABOUTME: Pure reading-time helpers: words / 230 wpm, rounded up, minimum one minute.
// ABOUTME: Accepts plain strings or portable text block arrays; getReadingMinutes reads the home-feed projection.

import { portableTextToPlain } from "@/lib/portableTextToPlain";

const WORDS_PER_MINUTE = 230;

export function countWords(input) {
  const text = Array.isArray(input) ? portableTextToPlain(input) : input;
  if (typeof text !== "string") return 0;
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

export function readingMinutes(parts) {
  const total = (parts || []).reduce((sum, p) => sum + countWords(p), 0);
  return Math.max(1, Math.ceil(total / WORDS_PER_MINUTE));
}

// `doc.reading` is { en, es } text for the doc's own body; issues also carry
// `storyReading` ([{ en, es }]) because their stories live in separate docs.
export function getReadingMinutes(doc, locale) {
  if (!doc) return null;
  const pick = (field) => field?.[locale] || field?.en || "";
  const parts = [pick(doc.reading)];
  if (Array.isArray(doc.storyReading)) {
    for (const story of doc.storyReading) parts.push(pick(story));
  }
  if (!parts.some((p) => countWords(p) > 0)) return null;
  return readingMinutes(parts);
}
