// ABOUTME: Column archive page listing all published Nico's Notes in reverse chronological order.
// ABOUTME: Uses ColumnCard components with red accent, links to individual columns.

import { cache } from "react";
import { getAllColumnsForArchive } from "@/lib/queries";
import { t, LOCALE_OG } from "@/lib/locale";
import ColumnCard from "@/components/ColumnCard";
import Footer from "@/components/Footer";
import styles from "./nico.module.css";

const getCachedColumns = cache(getAllColumnsForArchive);

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const title = locale === "es" ? "Notas de Nico" : "Nico\u2019s Notes";
  const description =
    locale === "es"
      ? "La columna semanal de Nico, editor jefe de The Crash Log"
      : "Nico\u2019s weekly column from the managing editor of The Crash Log";

  return {
    title,
    description,
    openGraph: {
      title: `${title} — The Crash Log`,
      description,
      locale: LOCALE_OG[locale],
      url: `https://crashlog.ai/${locale}/nico`,
    },
    alternates: {
      canonical: `https://crashlog.ai/${locale}/nico`,
      languages: {
        "en-US": "/en/nico",
        "es-ES": "/es/nico",
        "x-default": "/en/nico",
      },
    },
  };
}

export default async function NicoArchivePage({ params }) {
  const { locale } = await params;
  const columns = await getCachedColumns();

  return (
    <main>
      <h1 className={styles.heading}>
        {locale === "es"
          ? "\u2500\u2500 NOTAS DE NICO \u2500\u2500"
          : "\u2500\u2500 NICO\u2019S NOTES \u2500\u2500"}
      </h1>

      {columns.length === 0 ? (
        <p className={styles.empty}>
          {locale === "es"
            ? "No hay columnas publicadas todav\u00EDa."
            : "No columns published yet."}
        </p>
      ) : (
        columns.map((column) => (
          <ColumnCard
            key={column._id}
            columnNumber={column.columnNumber}
            date={column.publishDate}
            title={t(column.title, locale)}
            subtitle={t(column.subtitle, locale)}
            slug={column.slug}
            locale={locale}
          />
        ))
      )}

      <Footer locale={locale} />
    </main>
  );
}
