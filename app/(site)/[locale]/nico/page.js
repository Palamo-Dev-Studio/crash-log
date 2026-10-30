// ABOUTME: Nico's Notes series index at /[locale]/nico: every published column as a file row, newest first.
// ABOUTME: Same series-index pattern as Off the Rails and Practical.

import { cache } from "react";
import { getAllColumnsForArchive } from "@/lib/queries";
import { LOCALE_OG } from "@/lib/locale";
import { SERIES_INDEX_LABELS } from "@/lib/articleLabels";
import SeriesIndex from "@/components/SeriesIndex";

const getCachedColumns = cache(getAllColumnsForArchive);

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const { title, description } =
    SERIES_INDEX_LABELS.nicosNotes[locale] || SERIES_INDEX_LABELS.nicosNotes.en;

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
  return <SeriesIndex series="nicosNotes" docs={columns} locale={locale} />;
}
