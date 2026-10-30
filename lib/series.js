// ABOUTME: Pure helpers for the three content series (Off the Rails, Practical, Nico's Notes).
// ABOUTME: Series detection from doc type, file codes, bylines and outbound ref links.

export const SERIES_COLOR_KEYS = {
  offTheRails: "otr",
  practical: "fix",
  nicosNotes: "note",
};

const SERIES_BY_TYPE = {
  issue: "offTheRails",
  practical: "practical",
  column: "nicosNotes",
};

const SERIES_CONFIG = {
  offTheRails: { prefix: "OTR", numberField: "issueNumber" },
  practical: { prefix: "FIX", numberField: "practicalNumber" },
  nicosNotes: { prefix: "NOTE", numberField: "columnNumber" },
};

export function getSeries(doc) {
  if (!doc || typeof doc._type !== "string") return null;
  return Object.prototype.hasOwnProperty.call(SERIES_BY_TYPE, doc._type)
    ? SERIES_BY_TYPE[doc._type]
    : null;
}

export function getFileCode(doc) {
  const series = getSeries(doc);
  if (!series) return null;
  const { prefix, numberField } = SERIES_CONFIG[series];
  const number = doc[numberField];
  if (!Number.isInteger(number) || number < 0) return null;
  return `${prefix}-${String(number).padStart(3, "0")}`;
}

const NEWSROOM = {
  en: "The Crash Log newsroom",
  es: "la redacción de The Crash Log",
};

// The byline value that stands for the newsroom, for issues #1-27 (written by the AI team).
const NEWSROOM_SENTINEL = "newsroom";

const HECTOR = "Hector Luis Alamo";

export function getByline(doc, locale) {
  const series = getSeries(doc);
  if (!series) return null;
  const byline = typeof doc.byline === "string" ? doc.byline.trim() : "";
  if (byline) {
    if (byline.toLowerCase() === NEWSROOM_SENTINEL) {
      return locale === "es" ? NEWSROOM.es : NEWSROOM.en;
    }
    return byline;
  }
  if (series === "nicosNotes") return "Nico von Bot";
  return HECTOR;
}

const CREDIT = {
  en: "Reported with Nico",
  es: "Con reportería de Nico",
};

// Off the Rails and Practical posts bylined to Hector carry the credit line;
// newsroom issues, other named authors and Nico's Notes carry none.
export function getCredit(doc, locale) {
  const series = getSeries(doc);
  if (!series || series === "nicosNotes") return null;
  if (getByline(doc, "en") !== HECTOR) return null;
  return locale === "es" ? CREDIT.es : CREDIT.en;
}

export function withRef(url) {
  if (typeof url !== "string") return url;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return url;
    if (parsed.searchParams.has("ref")) return url;
  } catch {
    return url;
  }
  const hashIndex = url.indexOf("#");
  const base = hashIndex === -1 ? url : url.slice(0, hashIndex);
  const fragment = hashIndex === -1 ? "" : url.slice(hashIndex);
  const separator = base.includes("?") ? (base.endsWith("?") ? "" : "&") : "?";
  return `${base}${separator}ref=crashlog.ai${fragment}`;
}
