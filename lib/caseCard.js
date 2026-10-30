// ABOUTME: Pure helpers for Off the Rails case cards: verdict text, summary fallback, source line.
// ABOUTME: Summary falls back to the body's first paragraph, cut at a sentence boundary past ~75 words.

import { t } from "@/lib/locale";
import { portableTextToPlain } from "@/lib/portableTextToPlain";
import { countWords } from "@/lib/readingTime";

export const SUMMARY_MAX_WORDS = 75;
const SUMMARY_MIN_WORDS = 20;

// The stamp is a word, not a colour: verdict when set, else the old severity label.
export function getVerdict(story, locale) {
  const verdict = t(story?.verdict, locale);
  if (typeof verdict === "string" && verdict.trim()) return verdict.trim();
  const severity = story?.severity;
  return typeof severity === "string" ? severity.trim() : "";
}

// A token ends a sentence by shape, with no abbreviation list: it ends in . ! or ?
// (optionally closed by a quote or paren), carries at least two lowercase letters or
// digits before that mark (rules out "v.", "U.S.", "Dr.", "EE. UU."), and the next
// token opens like a sentence: uppercase, an opening quote or paren, or ¿ / ¡.
// Digits do not qualify as openers, so "Sept. 5" is not a boundary.
const END_SHAPE = /^(.*?)[.!?]+["”’')»\]]*$/u;
const SENTENCE_OPENER = /^["“‘'«(\[¿¡]*\p{Lu}|^["“‘'«(\[¿¡]/u;

function endsSentence(token, next) {
  const match = END_SHAPE.exec(token);
  if (!match || !next) return false;
  const lowerOrDigit = match[1].match(/[\p{Ll}\d]/gu);
  return (lowerOrDigit?.length ?? 0) >= 2 && SENTENCE_OPENER.test(next);
}

// Truncation rule: longer than SUMMARY_MAX_WORDS -> cut after the last sentence end
// that leaves at least SUMMARY_MIN_WORDS words; with no such boundary, cut at
// SUMMARY_MAX_WORDS words and add an ellipsis.
export function truncateSummary(text) {
  const words = text.trim().split(/\s+/);
  if (words.length <= SUMMARY_MAX_WORDS) return text.trim();
  const head = words.slice(0, SUMMARY_MAX_WORDS);
  for (let i = head.length - 1; i >= SUMMARY_MIN_WORDS - 1; i--) {
    if (endsSentence(head[i], words[i + 1]))
      return head.slice(0, i + 1).join(" ");
  }
  return `${head.join(" ").replace(/[,;:\s]+$/, "")}…`;
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

export function getCaseSummary(story, locale) {
  const summary = t(story?.summary, locale);
  if (typeof summary === "string" && summary.trim()) return summary.trim();
  return truncateSummary(firstParagraph(t(story?.body, locale)));
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
    extra: sources.length - 1,
  };
}
