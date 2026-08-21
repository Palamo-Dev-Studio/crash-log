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
// Exported (not just a local helper) so highlightMatches() can fold text through the
// exact same rules used to build the search index \u2014 two independent fold
// implementations would drift the moment one of them changes.
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
      // Category filter (OR within selection, AND with query)
      if (cats.length > 0) {
        const itemSlugs = (item.categories || []).map((c) => c.slug);
        const hit = cats.some((c) => itemSlugs.includes(c));
        if (!hit) return null;
      }

      // Query filter
      const matches = new Set();
      if (tokens.length > 0) {
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
