// ABOUTME: Column detail renderer for Nico's Notes weekly column pages.
// ABOUTME: Displays cover image, column header, body (Portable Text), and signature.

import { PortableText } from "@portabletext/react";
import { t, hasFullTranslation } from "@/lib/locale";
import { portableTextComponents } from "@/lib/portableText";
import CoverImage from "@/components/CoverImage";
import FallbackBanner from "@/components/FallbackBanner";
import DonateCTA from "@/components/DonateCTA";
import Footer from "@/components/Footer";
import styles from "./ColumnContent.module.css";

function formatDate(dateString, locale) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const LABELS = {
  en: { prefix: "Nico\u2019s Notes", empty: "No columns published yet." },
  es: { prefix: "Notas de Nico", empty: "No hay columnas publicadas." },
};

export default function ColumnContent({ column, locale }) {
  const l = LABELS[locale] || LABELS.en;

  if (!column) {
    return (
      <main className={styles.empty}>
        <p className={styles.emptyText}>{l.empty}</p>
      </main>
    );
  }

  const num = String(column.columnNumber).padStart(3, "0");
  const body = t(column.body, locale);

  return (
    <main>
      <CoverImage
        image={column.coverImage}
        alt={t(column.coverImageAlt, locale)}
      />

      <div className={styles.header}>
        <p className={styles.meta}>
          <span className={styles.prefix}>{l.prefix}</span>
          <span className={styles.number}>#{num}</span>
          <span className={styles.date}>
            {formatDate(column.publishDate, locale)}
          </span>
        </p>
        <h1 className={styles.title}>{t(column.title, locale)}</h1>
        {t(column.subtitle, locale) && (
          <p className={styles.subtitle}>{t(column.subtitle, locale)}</p>
        )}
      </div>

      {locale === "es" &&
        !hasFullTranslation(column, locale, { bodyField: "body" }) && (
          <FallbackBanner />
        )}

      {body && (
        <div className={styles.body}>
          <PortableText value={body} components={portableTextComponents} />
        </div>
      )}

      <p className={styles.signature}>{"\u2014 Nico"}</p>

      <DonateCTA locale={locale} />
      <Footer locale={locale} />
    </main>
  );
}
