// ABOUTME: Off the Rails series index at /[locale]/off-the-rails: every published issue, newest first.
// ABOUTME: Metadata (title, description, canonical, hreflang) follows the other index pages.

import { getIssuesIndex } from "@/lib/queries";
import { LOCALE_OG } from "@/lib/locale";
import { OTR_LABELS } from "@/lib/offTheRailsLabels";
import OffTheRailsIndex from "@/components/OffTheRailsIndex";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const labels = OTR_LABELS[locale] || OTR_LABELS.en;

  return {
    title: labels.indexTitle,
    description: labels.indexDescription,
    openGraph: {
      title: `${labels.indexTitle} — The Crash Log`,
      description: labels.indexDescription,
      locale: LOCALE_OG[locale],
      url: `https://crashlog.ai/${locale}/off-the-rails`,
    },
    alternates: {
      canonical: `https://crashlog.ai/${locale}/off-the-rails`,
      languages: {
        "en-US": "/en/off-the-rails",
        "es-ES": "/es/off-the-rails",
        "x-default": "/en/off-the-rails",
      },
    },
  };
}

export default async function OffTheRailsPage({ params }) {
  const { locale } = await params;
  const issues = await getIssuesIndex();
  return <OffTheRailsIndex issues={issues} locale={locale} />;
}
