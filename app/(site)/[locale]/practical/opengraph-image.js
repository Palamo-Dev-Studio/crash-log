// ABOUTME: Open Graph image for the practical series index, rendered with the shared Field Manual template.
// ABOUTME: 1200x630 cream card with the stamp roundel and the title in Instrument Serif.

import { renderOgImage, TitleCard } from "@/lib/ogTemplate";
import { SERIES_INDEX_LABELS } from "@/lib/articleLabels";

export const alt = "The Crash Log";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function OgImage({ params }) {
  const { locale } = await params;
  const labels =
    SERIES_INDEX_LABELS.practical[locale] || SERIES_INDEX_LABELS.practical.en;
  return renderOgImage(
    <TitleCard
      series="practical"
      kicker={locale === "es" ? "Serie" : "Series"}
      title={labels.title}
    />
  );
}
