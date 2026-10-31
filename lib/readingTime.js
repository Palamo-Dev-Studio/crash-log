// ABOUTME: Pure reading-time helpers: words / 230 wpm, rounded up, minimum one minute.
// ABOUTME: Accepts plain strings or portable text block arrays; getReadingMinutes reads the home-feed projection.

import { portableTextToPlain } from "@/lib/portableTextToPlain";
import { t } from "@/lib/locale";

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

// Plain text of a field that is either portable text (the full document, as the
// issue page has it) or already plain text (the home feed's pt::text projection).
// Image alt text is never counted: it is not body text.
function toPlain(value) {
  if (typeof value === "string") return value;
  return extractReadableText(value);
}

// The one definition of what an issue's reading time counts, shared by the issue
// page and the home cover: Nico's Transmission, every story body, authored
// summaries (a fallback summary is a slice of the body, so it is not added) and the
// Stack Trace text. Returns the text parts; readingMinutes() turns them into minutes.
export function issueReadingText(issue, locale) {
  const pick = (field) => toPlain(t(field, locale));
  const stories = (issue?.stories || []).filter(Boolean);
  return [
    pick(issue?.nicosTransmission),
    ...stories.flatMap((story) => [pick(story.body), pick(story.summary)]),
    ...(issue?.stackTrace || []).filter(Boolean).map((item) => pick(item.text)),
  ];
}

// `doc.reading` is { en, es } text for a column's or practical's own body. An issue
// is read through issueReadingText (its stories live in separate docs).
export function getReadingMinutes(doc, locale) {
  if (!doc) return null;
  const pick = (field) => field?.[locale] || field?.en || "";
  let parts;
  if (doc._type === "issue") {
    parts = issueReadingText(doc, locale);
  } else if (doc._type === "practical" && doc.body) {
    // Practical bodies carry custom blocks that pt::text drops, so read the body itself.
    parts = [extractReadableText(doc.body[locale] || doc.body.en)];
  } else {
    parts = [pick(doc.reading)];
  }
  if (!parts.some((p) => countWords(p) > 0)) return null;
  return readingMinutes(parts);
}
