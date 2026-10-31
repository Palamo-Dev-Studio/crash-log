// ABOUTME: Open Graph image for a Practical file page, rendered with the shared Field Manual template.
// ABOUTME: Shows the file code chip in the series colour, the title and the date; falls back to the site card.

import { renderOgImage, TitleCard, SiteCard } from "@/lib/ogTemplate";
import { getPracticalBySlug } from "@/lib/queries";
import { t } from "@/lib/locale";
import { getFileCode } from "@/lib/series";
import { formatDate } from "@/lib/formatDate";
import { SERIES_INDEX_LABELS } from "@/lib/articleLabels";

export const alt = "The Crash Log";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function OgImage({ params }) {
  const { locale, slug } = await params;
  const doc = await getPracticalBySlug(slug);
  if (!doc) return renderOgImage(<SiteCard locale={locale} />);

  const date = formatDate(doc.publishDate, locale, "long");
  const labels =
    SERIES_INDEX_LABELS.practical[locale] || SERIES_INDEX_LABELS.practical.en;
  return renderOgImage(
    <TitleCard
      series="practical"
      code={getFileCode(doc)}
      kicker={labels.title}
      title={t(doc.title, locale)}
      meta={[date].filter(Boolean)}
    />
  );
}
