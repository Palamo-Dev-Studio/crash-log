// ABOUTME: Locale utilities for bilingual field access and translation detection.
// ABOUTME: Exports constants, t() helper, and hasFullTranslation() checker.

export const LOCALES = ["en", "es"];
export const DEFAULT_LOCALE = "en";

export const LOCALE_LABELS = {
  en: "en-US",
  es: "es-ES",
};

export const LOCALE_OG = {
  en: "en_US",
  es: "es_ES",
};

/**
 * Resolve a localized field to the requested locale, falling back to English.
 * @param {object} field — A localized object like { en: "...", es: "..." }
 * @param {string} locale — The desired locale
 * @returns {*} The localized value, or null
 */
export function t(field, locale) {
  return field?.[locale] ?? field?.en ?? null;
}

/**
 * Check whether a document has a full translation in the given locale.
 * Requires both title and body content to have content.
 * @param {object} doc — A Sanity document (issue or column)
 * @param {string} locale — The locale to check
 * @param {object} [options]
 * @param {string} [options.bodyField="nicosTransmission"] — The field name to check for body content
 * @returns {boolean}
 */
export function hasFullTranslation(
  doc,
  locale,
  { bodyField = "nicosTransmission" } = {}
) {
  if (!doc || locale === DEFAULT_LOCALE) return true;

  const hasTitle = Boolean(doc.title?.[locale]);
  const hasBody =
    Array.isArray(doc[bodyField]?.[locale]) &&
    doc[bodyField][locale].length > 0;

  return hasTitle && hasBody;
}
