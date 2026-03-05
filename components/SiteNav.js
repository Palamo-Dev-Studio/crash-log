// ABOUTME: Site navigation bar with links to Latest, Archive, Beats, and About.
// ABOUTME: Highlights the active link based on the current path segment.

import Link from "next/link";
import styles from "./SiteNav.module.css";

const NAV_ITEMS = [
  { key: "latest", href: "" },
  { key: "archive", href: "/archive" },
  { key: "beats", href: "/beats" },
  { key: "about", href: "/about" },
];

const LABELS = {
  en: { latest: "Latest", archive: "Archive", beats: "Beats", about: "About" },
  es: { latest: "Último", archive: "Archivo", beats: "Temas", about: "Sobre" },
};

export default function SiteNav({ locale, activeSegment }) {
  const labels = LABELS[locale] || LABELS.en;

  return (
    <nav className={styles.nav}>
      {NAV_ITEMS.map((item) => {
        const isActive =
          (item.href === "" && !activeSegment) ||
          (item.href !== "" && activeSegment === item.href.slice(1));
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
