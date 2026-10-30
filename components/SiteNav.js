// ABOUTME: Primary site navigation: Latest, Off the Rails, Practical, Nico's Notes, Archive, About.
// ABOUTME: Highlights the active link from the current route segment; `issue` counts as Off the Rails.

"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import styles from "./SiteNav.module.css";

// `segments` lists the route segments that mark an item active (null = locale root).
const NAV_ITEMS = [
  { key: "latest", href: "", segments: [null] },
  {
    key: "offTheRails",
    href: "/off-the-rails",
    segments: ["off-the-rails", "issue"],
  },
  { key: "practical", href: "/practical", segments: ["practical"] },
  { key: "nico", href: "/nico", segments: ["nico"] },
  { key: "archive", href: "/archive", segments: ["archive"] },
  { key: "about", href: "/about", segments: ["about"] },
];

const LABELS = {
  en: {
    latest: "Latest",
    offTheRails: "Off the Rails",
    practical: "Practical",
    nico: "Nico’s Notes",
    archive: "Archive",
    about: "About",
    nav: "Sections",
  },
  es: {
    latest: "Lo último",
    offTheRails: "Fuera de las vías",
    practical: "Práctico",
    nico: "Notas de Nico",
    archive: "Archivo",
    about: "Sobre",
    nav: "Secciones",
  },
};

export default function SiteNav({ locale }) {
  const segment = useSelectedLayoutSegment() ?? null;
  const labels = LABELS[locale] || LABELS.en;

  return (
    <nav className={styles.nav} aria-label={labels.nav}>
      {NAV_ITEMS.map((item) => {
        const isActive = item.segments.includes(segment);
        return (
          <Link
            key={item.key}
            href={`/${locale}${item.href}`}
            className={`${styles.link} ${isActive ? styles.active : ""}`}
            aria-current={isActive ? "page" : undefined}
          >
            {labels[item.key]}
          </Link>
        );
      })}
    </nav>
  );
}
