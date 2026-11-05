// ABOUTME: Pure selection of the home page's cover, "Latest files" rail and "Recent files" list.
// ABOUTME: Cover = newest file of any series; rail = latest per series; recent = the next file of each series, topped up from any series, newest first.

import { getSeries } from "@/lib/series";

const SERIES_ORDER = ["offTheRails", "practical", "nicosNotes"];
export const RECENT_LIMIT = 3;

// Publish time in ms; a missing or invalid date sorts last (0), never NaN.
export function time(doc) {
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
  const left = sorted.filter((doc) => !shown.has(doc._id));

  // One file per series (the newest not already shown), so the row carries every series colour.
  const picks = [];
  for (const series of SERIES_ORDER) {
    const doc = left.find((d) => getSeries(d) === series);
    if (doc) picks.push(doc);
  }
  // A series with nothing left leaves a slot: fill it with the next newest file of any series.
  const picked = new Set(picks.map((d) => d._id));
  for (const doc of left) {
    if (picks.length >= RECENT_LIMIT) break;
    if (!picked.has(doc._id)) {
      picks.push(doc);
      picked.add(doc._id);
    }
  }
  // Sort is stable: equal dates keep series order, then fill order.
  const recent = picks.sort((a, b) => time(b) - time(a));

  return { cover, rail, recent };
}
