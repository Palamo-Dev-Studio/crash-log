// ABOUTME: Beats index page listing all content categories.
// ABOUTME: Shows category name, description, accent color, and story count.

import { cache } from "react";
import Link from "next/link";
import { getAllCategories } from "@/lib/queries";
import { t, LOCALE_OG } from "@/lib/locale";
import Footer from "@/components/Footer";
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
      url: `https://thecrashlog.com/${locale}/beats`,
    },
    alternates: {
      canonical: `https://thecrashlog.com/${locale}/beats`,
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
  const categories = await getCachedCategories();

  return (
    <main>
      <h2 className={styles.heading}>
        {locale === "es" ? "── SECCIONES ──" : "── BEATS ──"}
      </h2>

      {categories.length === 0 ? (
        <p className={styles.empty}>
          {locale === "es"
            ? "No hay secciones configuradas todavía."
            : "No beats configured yet."}
        </p>
      ) : (
        <div className={styles.grid}>
          {categories.map((cat) => (
            <Link
              key={cat._id}
              href={`/${locale}/beat/${cat.slug}`}
              className={styles.card}
              style={{ borderLeftColor: cat.color || "var(--border)" }}
            >
              <h3 className={styles.name}>{t(cat.name, locale)}</h3>
              {t(cat.description, locale) && (
                <p className={styles.description}>
                  {t(cat.description, locale)}
                </p>
              )}
              <span className={styles.count}>
                {cat.storyCount || 0}{" "}
                {locale === "es"
                  ? cat.storyCount === 1 ? "historia" : "historias"
                  : cat.storyCount === 1 ? "story" : "stories"}
              </span>
            </Link>
          ))}
        </div>
      )}

      <Footer />
    </main>
  );
}
