// ABOUTME: Site navigation bar with links to Latest, Archive, Beats, and About.
// ABOUTME: Highlights the active link based on the current path segment.

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSelectedLayoutSegment } from "next/navigation";
import styles from "./SiteNav.module.css";

const NAV_ITEMS = [
  { key: "latest", href: "" },
  { key: "nico", href: "/nico" },
  { key: "archive", href: "/archive" },
  { key: "beats", href: "/beats" },
  { key: "about", href: "/about" },
];

const LABELS = {
  en: {
    latest: "Latest",
    nico: "Nico\u2019s Notes",
    archive: "Archive",
    beats: "Beats",
    about: "About",
    nav: "Main navigation",
    searchLabel: "Search the archive",
    searchPlaceholder: "Search…",
  },
  es: {
    latest: "Último",
    nico: "Notas de Nico",
    archive: "Archivo",
    beats: "Temas",
    about: "Sobre",
    nav: "Navegación principal",
    searchLabel: "Buscar en el archivo",
    searchPlaceholder: "Buscar…",
  },
};

export default function SiteNav({ locale }) {
  const segment = useSelectedLayoutSegment();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const labels = LABELS[locale] || LABELS.en;

  function handleSearchSubmit(e) {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    const target = trimmed
      ? `/${locale}/archive?q=${encodeURIComponent(trimmed)}`
      : `/${locale}/archive`;
    router.push(target);
  }

  return (
    <nav className={styles.nav} aria-label={labels.nav}>
      {NAV_ITEMS.map((item) => {
        const isActive =
          (item.href === "" && !segment) ||
          (item.href !== "" && segment === item.href.slice(1));
        return (
          <Link
            key={item.key}
            href={`/${locale}${item.href}`}
            className={`${styles.link} ${isActive ? styles.active : ""}`}
          >
            {labels[item.key]}
          </Link>
        );
      })}
      <form
        className={styles.searchForm}
        role="search"
        onSubmit={handleSearchSubmit}
      >
        <input
          type="search"
          className={styles.searchInput}
          aria-label={labels.searchLabel}
          placeholder={labels.searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </form>
    </nav>
  );
}
