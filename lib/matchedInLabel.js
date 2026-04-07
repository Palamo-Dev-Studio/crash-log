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

  // Inline-highlighted fields don't need a "matched in" indicator.
  const hidden = matches.filter(
    (m) => m !== "titleSubtitle" && FIELD_LABELS[locale]?.[m]
  );
  if (hidden.length === 0) return null;

  const labels = hidden.map((m) => FIELD_LABELS[locale][m]);
  const prefix = locale === "es" ? "coincide en: " : "matched in: ";
  return prefix + labels.join(", ");
}
