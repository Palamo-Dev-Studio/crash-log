// ABOUTME: Pure reading-time helpers: words / 230 wpm, rounded up, minimum one minute.
// ABOUTME: Accepts plain strings or portable text block arrays; getReadingMinutes reads the home-feed projection.

import { portableTextToPlain } from "@/lib/portableTextToPlain";

const WORDS_PER_MINUTE = 230;

// Everything a reader reads in a Practical body: prose blocks plus the text fields of
// the custom blocks. Code blocks are excluded (skimmed, not read at prose speed), as is
// image alt text.
export function extractReadableText(blocks) {
  const out = [];
  const add = (v) => {
    if (typeof v === "string" && v.trim()) out.push(v);
  };
  const list = Array.isArray(blocks) ? blocks : [];
  for (const b of list) {
    if (!b || typeof b !== "object") continue;
    switch (b._type) {
      case "block":
        add(portableTextToPlain([b]));
        break;
      case "steps":
        for (const item of b.items || []) {
          add(item?.title);
          add(item?.text);
        }
        break;
      case "exhibit":
        add(b.label);
        add(b.from);
        for (const row of b.rows || []) {
          add(row?.lead);
          add(row?.text);
        }
        add(b.caption);
        break;
      case "callout":
      case "replyAsk":
        add(b.title);
        add(b.text);
        add(b.buttonLabel);
        break;
      case "pullQuote":
        add(b.text);
        break;
      default:
        break;
    }
  }
  return out.join("\n");
}

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
  // Practical bodies carry custom blocks that pt::text drops, so read the body itself.
  const parts =
    doc._type === "practical" && doc.body
      ? [extractReadableText(doc.body[locale] || doc.body.en)]
      : [pick(doc.reading)];
  if (Array.isArray(doc.storyReading)) {
    for (const story of doc.storyReading) parts.push(pick(story));
  }
  if (!parts.some((p) => countWords(p) > 0)) return null;
  return readingMinutes(parts);
}
