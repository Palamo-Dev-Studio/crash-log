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
  if (typeof number !== "number" || !Number.isFinite(number)) return null;
  return `${prefix}-${String(number).padStart(3, "0")}`;
}

const NEWSROOM = {
  en: "The Crash Log newsroom",
  es: "la redacción de The Crash Log",
};

export function getByline(doc, locale) {
  const series = getSeries(doc);
  if (!series) return null;
  if (typeof doc.byline === "string" && doc.byline.trim()) return doc.byline;
  if (series === "nicosNotes") return "Nico von Bot";
  if (series === "practical") return "Hector Luis Alamo";
  return locale === "es" ? NEWSROOM.es : NEWSROOM.en;
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
