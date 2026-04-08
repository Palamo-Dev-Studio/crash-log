// ABOUTME: Client-side search/filter UI for the archive page.
// ABOUTME: Owns the query and category filter state, runs searchArchive over a server-built index.

"use client";

import { useMemo, useState } from "react";
import ArchiveCard from "@/components/ArchiveCard";
import ColumnCard from "@/components/ColumnCard";
import { searchArchive } from "@/lib/searchArchive";
import styles from "./ArchiveSearch.module.css";

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
  const [query, setQuery] = useState("");
  const [selectedCats, setSelectedCats] = useState([]);
  const copy = COPY[locale] || COPY.en;

  const results = useMemo(
    () => searchArchive(items, { query, categories: selectedCats }),
    [items, query, selectedCats]
  );

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
    <div className={styles.wrapper}>
      <div className={styles.searchRow}>
        <input
          type="search"
          aria-label={copy.label}
          className={styles.input}
          placeholder={copy.placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {hasActiveFilters && (
          <button type="button" className={styles.clearBtn} onClick={clearAll}>
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
                onClick={() => toggleCat(cat.slug)}
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
