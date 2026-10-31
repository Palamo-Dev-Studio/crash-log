// ABOUTME: Open Graph image for the Off the Rails index, rendered with the shared Field Manual template.
// ABOUTME: 1200x630 cream card with the stamp roundel and the title in Instrument Serif.

import { renderOgImage, TitleCard } from "@/lib/ogTemplate";
import { OTR_LABELS } from "@/lib/offTheRailsLabels";

export const alt = "The Crash Log";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function OgImage({ params }) {
  const { locale } = await params;
  const labels = OTR_LABELS[locale] || OTR_LABELS.en;
  return renderOgImage(
    <TitleCard
      series="offTheRails"
      kicker={locale === "es" ? "Serie" : "Series"}
      title={labels.seriesName}
    />
  );
}
