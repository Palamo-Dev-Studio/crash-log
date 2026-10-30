// ABOUTME: Open Graph image for a issue page, rendered with the shared Field Manual template.
// ABOUTME: Shows the file code chip in the series colour, the title and the date; falls back to the site card.

import { renderOgImage, TitleCard, SiteCard } from "@/lib/ogTemplate";
import { getIssueBySlug } from "@/lib/queries";
import { t } from "@/lib/locale";
import { getFileCode } from "@/lib/series";
import { formatDate } from "@/lib/formatDate";
import { OTR_LABELS } from "@/lib/offTheRailsLabels";

export const alt = "The Crash Log";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function OgImage({ params }) {
  const { locale, slug } = await params;
  const doc = await getIssueBySlug(slug);
  if (!doc) return renderOgImage(<SiteCard locale={locale} />);

  const date = formatDate(doc.publishDate, locale, "long");
  const labels = OTR_LABELS[locale] || OTR_LABELS.en;
  return renderOgImage(
    <TitleCard
      series="offTheRails"
      code={getFileCode(doc)}
      kicker={labels.seriesName}
      title={t(doc.title, locale)}
      meta={[labels.cases(doc.stories?.length ?? 0), date].filter(Boolean)}
    />
  );
}
