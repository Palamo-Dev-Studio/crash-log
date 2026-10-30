// ABOUTME: Pure selection of the home page's cover, "Latest files" rail and "Recent files" list.
// ABOUTME: Cover = newest file of any series; rail = latest per series; recent = next files not already shown.

import { getSeries } from "@/lib/series";

const SERIES_ORDER = ["offTheRails", "practical", "nicosNotes"];
export const RECENT_LIMIT = 5;

function time(doc) {
  const t = new Date(doc.publishDate).getTime();
  return Number.isNaN(t) ? 0 : t;
}

export function selectHomeFiles(docs) {
  const sorted = (Array.isArray(docs) ? docs : [])
    .filter((doc) => getSeries(doc))
    .sort((a, b) => time(b) - time(a));
  if (sorted.length === 0) return { cover: null, rail: [], recent: [] };

  const cover = sorted[0];
  const coverSeries = getSeries(cover);

  const rail = [];
  for (const series of SERIES_ORDER) {
    const doc = sorted.find((d) => getSeries(d) === series);
    if (doc) rail.push({ series, doc, onCover: series === coverSeries });
  }

  const shown = new Set([cover._id, ...rail.map((r) => r.doc._id)]);
  const recent = sorted
    .filter((doc) => !shown.has(doc._id))
    .slice(0, RECENT_LIMIT);

  return { cover, rail, recent };
}
