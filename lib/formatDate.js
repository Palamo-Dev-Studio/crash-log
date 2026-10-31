// ABOUTME: The one place dates are formatted for display: UTC, never a weekday, en-US / es-ES.
// ABOUTME: ESLint bans date formatting elsewhere (eslint.config.mjs); pass a named style, not Intl options.

const LOCALES = { en: "en-US", es: "es-ES" };

// Named styles. None may include `weekday` or `dateStyle: "full"`.
const STYLES = {
  long: { year: "numeric", month: "long", day: "numeric" },
  short: { year: "numeric", month: "short", day: "numeric" },
  dayMonth: { month: "short", day: "numeric" },
};

// Style names, exported so tests sweep every style rather than a hand-kept list.
export const DATE_STYLES = Object.keys(STYLES);

export function formatDate(value, locale, style) {
  const options = STYLES[style];
  if (!options) throw new Error(`Unknown date style: ${style}`);
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(LOCALES[locale] || LOCALES.en, {
    ...options,
    timeZone: "UTC",
  }).format(date);
}
