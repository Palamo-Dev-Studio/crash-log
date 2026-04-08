// ABOUTME: Maps searchArchive field-match keys into a localized "matched in: ..." line.
// ABOUTME: Skips title/subtitle hits since those are already highlighted inline on the card.

const FIELD_LABELS = {
  en: {
    transmission: "transmission",
    headlines: "story headline",
    bodies: "story body",
    stackTrace: "stack trace",
    columnBody: "column body",
  },
  es: {
    transmission: "transmisión",
    headlines: "titular",
    bodies: "cuerpo de la historia",
    stackTrace: "stack trace",
    columnBody: "cuerpo de la columna",
  },
};

export function matchedInLabel(matches, locale = "en") {
  if (!Array.isArray(matches) || matches.length === 0) return null;

  const localeLabels = FIELD_LABELS[locale] || FIELD_LABELS.en;

  // Inline-highlighted fields don't need a "matched in" indicator.
  // Dedupe in case the caller passes the same field key twice.
  const hidden = Array.from(
    new Set(matches.filter((m) => m !== "titleSubtitle" && localeLabels[m]))
  );
  if (hidden.length === 0) return null;

  const labels = hidden.map((m) => localeLabels[m]);
  const prefix = locale === "es" ? "coincide en: " : "matched in: ";
  return prefix + labels.join(", ");
}
