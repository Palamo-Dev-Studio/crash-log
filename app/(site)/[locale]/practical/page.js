// ABOUTME: Practical series index at /[locale]/practical: every published how-to file, newest first.
// ABOUTME: With no posts yet it renders the series' "starts soon" empty state.

import { getPracticalIndex } from "@/lib/queries";
import { LOCALE_OG } from "@/lib/locale";
import { SERIES_INDEX_LABELS } from "@/lib/articleLabels";
import SeriesIndex from "@/components/SeriesIndex";

function labelsFor(locale) {
  return (
    SERIES_INDEX_LABELS.practical[locale] || SERIES_INDEX_LABELS.practical.en
  );
}

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const labels = labelsFor(locale);

  return {
    title: labels.title,
    description: labels.description,
    openGraph: {
      title: `${labels.title} — The Crash Log`,
      description: labels.description,
      locale: LOCALE_OG[locale],
      url: `https://crashlog.ai/${locale}/practical`,
    },
    alternates: {
      canonical: `https://crashlog.ai/${locale}/practical`,
      languages: {
        "en-US": "/en/practical",
        "es-ES": "/es/practical",
        "x-default": "/en/practical",
      },
    },
  };
}

export default async function PracticalIndexPage({ params }) {
  const { locale } = await params;
  const docs = await getPracticalIndex();
  return <SeriesIndex series="practical" docs={docs} locale={locale} />;
}
