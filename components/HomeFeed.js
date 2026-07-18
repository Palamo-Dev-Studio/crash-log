// ABOUTME: Home page feed — renders the newest item as a hero card, the rest as a standard card grid.
// ABOUTME: Falls back to an empty-state message when no issues or columns are published yet.

import Link from "next/link";
import FeedCard from "@/components/FeedCard";
import styles from "./HomeFeed.module.css";

const LABELS = {
  en: {
    empty: "No content published yet.",
    archive: "See the full archive",
  },
  es: {
    empty: "Aún no hay contenido publicado.",
    archive: "Ver el archivo completo",
  },
};

export default function HomeFeed({ items, locale }) {
  const labels = LABELS[locale] || LABELS.en;

  if (!items || items.length === 0) {
    return (
      <main className={styles.empty}>
        <p className={styles.emptyText}>{labels.empty}</p>
      </main>
    );
  }

  const [hero, ...rest] = items;

  return (
    <main className={styles.feed}>
      <FeedCard item={hero} locale={locale} variant="hero" />

      {rest.length > 0 && (
        <div className={styles.grid}>
          {rest.map((item) => (
            <FeedCard
              key={item._id}
              item={item}
              locale={locale}
              variant="standard"
            />
          ))}
        </div>
      )}

      <div className={styles.archiveLinkWrap}>
        <Link href={`/${locale}/archive`} className={styles.archiveLink}>
          {labels.archive} &rarr;
        </Link>
      </div>
    </main>
  );
}
