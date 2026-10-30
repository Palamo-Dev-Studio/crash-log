// ABOUTME: File code (OTR-044, FIX-012, NOTE-022) in its series colour, as an outlined chip or plain coloured text.
// ABOUTME: Shared by the home page now and by the article and index pages later; series come from the doc type.

import { getFileCode, getSeries, SERIES_COLOR_KEYS } from "@/lib/series";
import styles from "./FileChip.module.css";

export const SERIES_NAMES = {
  en: {
    offTheRails: "Off the Rails",
    practical: "Practical",
    nicosNotes: "Nico’s Notes",
  },
  es: {
    offTheRails: "Fuera de las vías",
    practical: "Práctico",
    nicosNotes: "Notas de Nico",
  },
};

export function seriesName(series, locale) {
  return (SERIES_NAMES[locale] || SERIES_NAMES.en)[series] || "";
}

export default function FileChip({ doc, variant = "chip", className = "" }) {
  const series = getSeries(doc);
  const code = getFileCode(doc);
  if (!series || !code) return null;

  const colorClass = styles[SERIES_COLOR_KEYS[series]];
  const variantClass = variant === "chip" ? styles.chip : styles.plain;
  return (
    <span className={`${variantClass} ${colorClass} ${className}`.trim()}>
      {code}
    </span>
  );
}
