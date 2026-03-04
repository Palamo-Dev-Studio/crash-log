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
 * Check whether an issue has a full translation in the given locale.
 * Requires both title and nicosTransmission to have content.
 * @param {object} issue — A Sanity issue document
 * @param {string} locale — The locale to check
 * @returns {boolean}
 */
export function hasFullTranslation(issue, locale) {
  if (!issue || locale === DEFAULT_LOCALE) return true;

  const hasTitle = Boolean(issue.title?.[locale]);
  const hasTransmission =
    Array.isArray(issue.nicosTransmission?.[locale]) &&
    issue.nicosTransmission[locale].length > 0;

  return hasTitle && hasTransmission;
}
