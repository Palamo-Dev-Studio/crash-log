// ABOUTME: Site navigation bar with links to Latest, Archive, Beats, and About.
// ABOUTME: Highlights the active link based on the current path segment.

"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
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
  },
  es: {
    latest: "Último",
    nico: "Notas de Nico",
    archive: "Archivo",
    beats: "Temas",
    about: "Sobre",
  },
};

export default function SiteNav({ locale }) {
  const segment = useSelectedLayoutSegment();
  const labels = LABELS[locale] || LABELS.en;

  return (
    <nav className={styles.nav}>
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
    </nav>
  );
}
