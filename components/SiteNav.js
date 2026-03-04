// ABOUTME: Site navigation bar with links to Latest, Archive, Beats, and About.
// ABOUTME: Highlights the active link based on the current path segment.

import Link from "next/link";
import styles from "./SiteNav.module.css";

const NAV_ITEMS = [
  { label: "Latest", href: "" },
  { label: "Archive", href: "/archive" },
  { label: "Beats", href: "/beats" },
  { label: "About", href: "/about" },
];

export default function SiteNav({ locale, activeSegment }) {
  return (
    <nav className={styles.nav}>
      {NAV_ITEMS.map((item) => {
        const isActive =
          (item.href === "" && !activeSegment) ||
          (item.href !== "" && activeSegment === item.href.slice(1));
        return (
          <Link
            key={item.label}
            href={`/${locale}${item.href}`}
            className={`${styles.link} ${isActive ? styles.active : ""}`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
