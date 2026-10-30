// ABOUTME: Beats index page listing all content categories as ruled rows.
// ABOUTME: Shows category name, description and story count; not in the nav, but its route stays live.

import { cache } from "react";
import Link from "next/link";
import { getAllCategories } from "@/lib/queries";
import { t, LOCALE_OG } from "@/lib/locale";
import { BEAT_LABELS } from "@/lib/beatLabels";
import styles from "./beats.module.css";

const getCachedCategories = cache(getAllCategories);

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const title = locale === "es" ? "Secciones" : "Beats";
  const description =
    locale === "es"
      ? "Categorías de cobertura de The Crash Log"
      : "Coverage categories of The Crash Log";

  return {
    title,
    description,
    openGraph: {
      title: `${title} — The Crash Log`,
      description,
      locale: LOCALE_OG[locale],
      url: `https://crashlog.ai/${locale}/beats`,
    },
    alternates: {
      canonical: `https://crashlog.ai/${locale}/beats`,
      languages: {
        "en-US": "/en/beats",
        "es-ES": "/es/beats",
        "x-default": "/en/beats",
      },
    },
  };
}

export default async function BeatsPage({ params }) {
  const { locale } = await params;
  const labels = BEAT_LABELS[locale] || BEAT_LABELS.en;
  const allCategories = await getCachedCategories();
  const categories = allCategories.filter((cat) => (cat.storyCount || 0) > 0);

  return (
    <main>
      <section className={styles.head}>
        <p className={styles.kicker}>
          <span>{labels.indexKicker}</span>
          <span>{labels.beatsCaps(categories.length)}</span>
        </p>
        <h1 className={styles.title}>{labels.indexTitle}</h1>
        <p className={styles.dek}>{labels.indexDescription}</p>
      </section>

      {categories.length === 0 ? (
        <p className={styles.empty}>{labels.indexEmpty}</p>
      ) : (
        <div className={styles.list}>
          {categories.map((cat) => (
            <Link
              key={cat._id}
              href={`/${locale}/beat/${cat.slug}`}
              className={styles.row}
            >
              <h2 className={styles.name}>{t(cat.name, locale)}</h2>
              {t(cat.description, locale) && (
                <p className={styles.description}>
                  {t(cat.description, locale)}
                </p>
              )}
              <span className={styles.count}>
                {labels.stories(cat.storyCount || 0)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
