// ABOUTME: A series name (Off the Rails, Practical, Nico's Notes) shown as a label, in its series colour.
// ABOUTME: The one place that pairs a series with its text colour; kickers use it so the rest of the row keeps its own colour.

import { seriesName } from "@/components/FileChip";
import { SERIES_COLOR_KEYS } from "@/lib/series";
import styles from "./SeriesName.module.css";

export default function SeriesName({ series, locale, className = "" }) {
  const name = seriesName(series, locale);
  const colorKey = SERIES_COLOR_KEYS[series];
  if (!name || !colorKey) return null;
  return (
    <span
      className={`${styles[colorKey]} ${className}`.trim()}
      data-series-name={series}
    >
      {name}
    </span>
  );
}
