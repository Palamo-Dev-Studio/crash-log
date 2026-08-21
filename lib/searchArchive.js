// ABOUTME: Pure search/filter utility for the archive page.
// ABOUTME: Tokenized AND query across pre-flattened searchText, OR'd with category filter.

// Fold diacritics before lowercasing: NFD-decompose (splits "í" into "i" + a combining
// acute accent), strip the combining marks (U+0300–U+036F), then lowercase. Without this,
// a reader typing "critica" or "opinion" gets zero results for "crítica" / "opinión" —
// English rarely hits this, but Spanish breaks on ordinary queries.
//
// Tradeoff, intentional: folding maps "año" -> "ano", conflating it with the distinct
// word "ano". That's the standard behavior for forgiving search (Postgres `unaccent`,
// Elasticsearch `asciifolding` both do this) and the right call here for an archive
// search box — just don't "fix" it later without knowing this collapses those two words.
// Exported (not just a local helper) so highlightMatches() folds text through this
// same rule set, rather than a second hand-rolled implementation that could drift.
// "Same rule set" is not "byte-identical output" in every case, though: this function
// folds whole strings, while highlightMatches folds character-by-character (for its
// index map), and toLowerCase() is not always context-independent between those two
// — Greek final sigma (σ vs ς) is the known case. highlightMatches's regex runs
// case-insensitive specifically to reconcile that gap at match time; see the comment
// there before ever treating that flag as redundant with this function's lowercasing.
export function normalize(s) {
  return (s || "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function tokenize(query) {
  return normalize(query)
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

/**
 * Filter a pre-built search index.
 *
 * Each item is expected to have shape:
 *   {
 *     id, type: "issue" | "column",
 *     publishDate, // ISO string
 *     title, subtitle, // already localized strings
 *     searchText, // pre-flattened lowercase haystack
 *     fields: { transmission, headlines, bodies, stackTrace, columnBody }, // each lowercase
 *     categories: [{ name, slug }],
 *     raw, // the original item the page needs to render the card
 *     searchable, // optional bool; false excludes this item from TEXT QUERY matches
 *                 // only (see below) — absent/undefined defaults to searchable, so
 *                 // callers that don't set it (e.g. existing tests) are unaffected.
 *   }
 *
 * @param {Array} items
 * @param {{ query?: string, categories?: string[] }} opts
 * @returns {Array} filtered items, each augmented with `matches` (set of field keys that hit).
 */
export function searchArchive(items, { query = "", categories = [] } = {}) {
  if (!Array.isArray(items)) return [];

  const tokens = tokenize(query);
  const cats = Array.isArray(categories) ? categories.filter(Boolean) : [];

  return items
    .map((item) => {
      // Category filter (OR within selection, AND with query). A browse filter, not a
      // search — it does NOT consult `searchable`, so a category-pill-only filter
      // (no text query) still surfaces items without a real translation, same as the
      // unfiltered listing.
      if (cats.length > 0) {
        const itemSlugs = (item.categories || []).map((c) => c.slug);
        const hit = cats.some((c) => itemSlugs.includes(c));
        if (!hit) return null;
      }

      // Query filter
      const matches = new Set();
      if (tokens.length > 0) {
        // A real text query is where "Spanish search over Spanish content" has to be
        // literally true: exclude items without a real translation in the active
        // locale from MATCHES (not from the listing — that's buildArchiveIndex's job,
        // and it deliberately does NOT filter). Only applies once a query is active;
        // `searchable === false` is explicit opt-out, so items that never set the
        // field (undefined) are treated as searchable.
        if (item.searchable === false) return null;

        const fields = item.fields || {};
        // The index is pre-lowercased but not diacritic-folded, so fold it here too —
        // normalize() must run on both sides of the comparison or it does nothing.
        const haystack = normalize(item.searchText || "");
        const allTokensHit = tokens.every((tok) => haystack.includes(tok));
        if (!allTokensHit) return null;

        // Record which fields any token matched (for "matched in:" indicator).
        // A field is "hit" if at least one token appears in it.
        for (const [key, value] of Object.entries(fields)) {
          if (!value) continue;
          if (tokens.some((tok) => normalize(value).includes(tok))) {
            matches.add(key);
          }
        }
      }

      return { ...item, matches: Array.from(matches) };
    })
    .filter(Boolean);
}

export const __test = { tokenize, normalize };
