// ABOUTME: Pure search/filter utility for the archive page.
// ABOUTME: Tokenized AND query across pre-flattened searchText, OR'd with category filter.

function normalize(s) {
  return (s || "").toString().toLowerCase();
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
        const haystack = item.searchText || "";
        const allTokensHit = tokens.every((tok) => haystack.includes(tok));
        if (!allTokensHit) return null;

        // Record which fields any token matched (for "matched in:" indicator).
        // A field is "hit" if at least one token appears in it.
        for (const [key, value] of Object.entries(fields)) {
          if (!value) continue;
          if (tokens.some((tok) => value.includes(tok))) {
            matches.add(key);
          }
        }
      }

      return { ...item, matches: Array.from(matches) };
    })
    .filter(Boolean);
}

export const __test = { tokenize, normalize };
