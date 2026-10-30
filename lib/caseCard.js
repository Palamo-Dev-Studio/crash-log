// ABOUTME: Pure helpers for Off the Rails case cards: verdict text, summary fallback, source line.
// ABOUTME: Summary falls back to the body's first paragraph, whole; the card clamps it visually.

import { t } from "@/lib/locale";
import { portableTextToPlain } from "@/lib/portableTextToPlain";
import { countWords } from "@/lib/readingTime";

// The stamp is a word, not a colour: verdict when set, else the old severity label.
export function getVerdict(story, locale) {
  const verdict = t(story?.verdict, locale);
  if (typeof verdict === "string" && verdict.trim()) return verdict.trim();
  const severity = story?.severity;
  return typeof severity === "string" ? severity.trim() : "";
}

function firstParagraph(blocks) {
  if (!Array.isArray(blocks)) return "";
  for (const block of blocks) {
    if (block?._type !== "block") continue;
    const text = portableTextToPlain([block]);
    if (text) return text;
  }
  return "";
}

export function hasOwnSummary(story, locale) {
  const summary = t(story?.summary, locale);
  return typeof summary === "string" && summary.trim() !== "";
}

export function getCaseSummary(story, locale) {
  if (hasOwnSummary(story, locale)) return t(story.summary, locale).trim();
  return firstParagraph(t(story?.body, locale));
}

export function hasFullBody(story, locale) {
  return countWords(t(story?.body, locale)) > 0;
}

function hostname(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

// First source drives the card; extra counts the rest ("+N").
export function getSourceInfo(story) {
  const sources = Array.isArray(story?.sources)
    ? story.sources.filter(Boolean)
    : [];
  if (sources.length === 0) return null;
  const first = sources[0];
  return {
    outlet: first.outlet || first.title || hostname(first.url) || "",
    url: first.url || null,
    date: first.date || null,
    extra: sources.length - 1,
  };
}
