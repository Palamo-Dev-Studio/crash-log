// ABOUTME: Client-side search/filter UI for the archive page.
// ABOUTME: Owns the query and category filter state, runs searchArchive over a server-built index.

"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ArchiveCard from "@/components/ArchiveCard";
import ColumnCard from "@/components/ColumnCard";
import { searchArchive } from "@/lib/searchArchive";
import styles from "./ArchiveSearch.module.css";

// How long to wait after the last keystroke before syncing the `q` param to the URL.
// Keeps a fast typist from generating a router update on every character.
const URL_SYNC_DEBOUNCE_MS = 400;

const COPY = {
  en: {
    placeholder: "Search the archive — titles, stories, columns…",
    clear: "Clear",
    empty: "No results.",
    allCategories: "All beats",
    label: "Search",
  },
  es: {
    placeholder: "Buscar en el archivo — títulos, historias, columnas…",
    clear: "Limpiar",
    empty: "Sin resultados.",
    allCategories: "Todas las áreas",
    label: "Buscar",
  },
};

export default function ArchiveSearch({ items, categories = [], locale }) {
  const copy = COPY[locale] || COPY.en;

  // useSearchParams() forces this subtree to bail out of static rendering (it can't be
  // known at build time), so it needs a Suspense boundary — but `fallback={null}`
  // means the prerendered HTML for /archive contains NOTHING: no input, no pills, no
  // cards, just a BAILOUT_TO_CLIENT_SIDE_RENDERING marker. That's a real SEO/no-JS/
  // first-paint regression on the site's main index surface, not a cosmetic gap.
  //
  // Fix: give the boundary a REAL fallback — the same view, rendered with the default
  // (query="", no category filter) state, using the same searchArchive() call the
  // interactive version uses. It's plain data + JSX with no client-only hooks, so it
  // renders fully at build/request time. Once hydration resolves useSearchParams()
  // client-side, React swaps it for the live, interactive ArchiveSearchInner.
  const fallbackResults = searchArchive(items, {});

  return (
    <Suspense
      fallback={
        <ArchiveSearchView
          categories={categories}
          copy={copy}
          locale={locale}
          query=""
          selectedCats={[]}
          hasActiveFilters={false}
          results={fallbackResults}
          onQueryChange={() => {}}
          onToggleCat={() => {}}
          onClearAll={() => {}}
        />
      }
    >
      <ArchiveSearchInner
        items={items}
        categories={categories}
        locale={locale}
      />
    </Suspense>
  );
}

function ArchiveSearchInner({ items, categories = [], locale }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") || "";

  // Seed from the URL so /es/archive?q=modelo renders already-filtered on first paint.
  const [query, setQuery] = useState(urlQuery);
  const [selectedCats, setSelectedCats] = useState([]);
  const copy = COPY[locale] || COPY.en;

  const results = useMemo(
    () => searchArchive(items, { query, categories: selectedCats }),
    [items, query, selectedCats]
  );

  // The last `q` value WE are responsible for — either the one we seeded from on
  // mount, or the one our own debounced write below just sent to the URL. Comparing
  // against this (rather than reacting to every urlQuery change) is what tells "the
  // header search box navigated here with a new q" apart from "the URL just caught up
  // with our own edit" — only the former should overwrite local state.
  const lastKnownUrlQuery = useRef(urlQuery);

  // The archive page doesn't remount when the header search box pushes a new
  // /{locale}/archive?q=... while already on this page — Next re-renders the same
  // component in place, so a one-time useState seed never sees the change. Sync local
  // state FROM the URL whenever it changes for a reason other than our own write.
  useEffect(() => {
    if (urlQuery !== lastKnownUrlQuery.current) {
      lastKnownUrlQuery.current = urlQuery;
      setQuery(urlQuery);
    }
  }, [urlQuery]);

  // Keep the URL's `q` param in sync as the query changes, so results stay shareable/
  // linkable. Debounced so a fast typist doesn't fire a router update per keystroke,
  // and router.replace (not push) so searching doesn't spam the back-button history
  // with one entry per edit — the query is transient UI state, not a distinct page.
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timer = setTimeout(() => {
      const trimmed = query.trim();
      // Record what we're about to write BEFORE the URL round-trips, so the sync-from-
      // URL effect above recognizes this as our own write (not an external navigation)
      // once router.replace's re-render arrives — even if the user keeps typing in the
      // meantime, in which case `query` has already moved past `trimmed` by then.
      lastKnownUrlQuery.current = trimmed;

      const params = new URLSearchParams(searchParams.toString());
      if (trimmed) {
        params.set("q", trimmed);
      } else {
        params.delete("q");
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }, URL_SYNC_DEBOUNCE_MS);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const toggleCat = (slug) => {
    setSelectedCats((prev) =>
      prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug]
    );
  };

  const clearAll = () => {
    setQuery("");
    setSelectedCats([]);
  };

  const hasActiveFilters = query.trim() !== "" || selectedCats.length > 0;

  return (
    <ArchiveSearchView
      categories={categories}
      copy={copy}
      locale={locale}
      query={query}
      selectedCats={selectedCats}
      hasActiveFilters={hasActiveFilters}
      results={results}
      onQueryChange={setQuery}
      onToggleCat={toggleCat}
      onClearAll={clearAll}
    />
  );
}

// Pure presentational view — no hooks, so it's usable both as the Suspense fallback
// (rendered at build/request time with default state) and as ArchiveSearchInner's own
// output (rendered client-side with live state). Keeping this as the ONE shared
// component is what guarantees the fallback and the live view never drift apart.
function ArchiveSearchView({
  categories,
  copy,
  locale,
  query,
  selectedCats,
  hasActiveFilters,
  results,
  onQueryChange,
  onToggleCat,
  onClearAll,
}) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.searchRow}>
        <input
          type="search"
          aria-label={copy.label}
          className={styles.input}
          placeholder={copy.placeholder}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
        {hasActiveFilters && (
          <button
            type="button"
            className={styles.clearBtn}
            onClick={onClearAll}
          >
            {copy.clear}
          </button>
        )}
      </div>

      {categories.length > 0 && (
        <div className={styles.categoryPills}>
          {categories.map((cat) => {
            const active = selectedCats.includes(cat.slug);
            return (
              <button
                key={cat.slug}
                type="button"
                className={`${styles.pill} ${active ? styles.pillActive : ""}`}
                onClick={() => onToggleCat(cat.slug)}
                aria-pressed={active}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      )}

      {results.length === 0 ? (
        <p className={styles.empty}>{copy.empty}</p>
      ) : (
        <div className={styles.results}>
          {results.map((item) =>
            item.type === "column" ? (
              <ColumnCard
                key={item.id}
                columnNumber={item.raw.columnNumber}
                date={item.publishDate}
                title={item.title}
                subtitle={item.subtitle}
                slug={item.raw.slug}
                locale={locale}
                query={query}
                matches={item.matches}
              />
            ) : (
              <ArchiveCard
                key={item.id}
                issueNumber={item.raw.issueNumber}
                date={item.publishDate}
                title={item.title}
                subtitle={item.subtitle}
                severities={item.raw.severities}
                slug={item.raw.slug}
                locale={locale}
                query={query}
                matches={item.matches}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}

// Test-only backdoor: ArchiveSearchView needs to be checked in isolation (does the
// Suspense fallback shape actually render real content?) without fighting jsdom's
// inability to reproduce Next's real static-rendering CSR bailout.
export const __test = { ArchiveSearchView };
