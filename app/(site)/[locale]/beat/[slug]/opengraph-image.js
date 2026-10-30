// ABOUTME: Open Graph image for the beat page, rendered with the shared Field Manual template.
// ABOUTME: 1200x630 cream card with the stamp roundel and the title in Instrument Serif.

import { renderOgImage, TitleCard, SiteCard } from "@/lib/ogTemplate";
import { getCategoryWithStories } from "@/lib/queries";
import { t } from "@/lib/locale";

export const alt = "The Crash Log";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function OgImage({ params }) {
  const { locale, slug } = await params;
  const data = await getCategoryWithStories(slug);
  const name = data?.category ? t(data.category.name, locale) : "";
  if (!name) return renderOgImage(<SiteCard locale={locale} />);
  return renderOgImage(
    <TitleCard kicker={locale === "es" ? "Sección" : "Beat"} title={name} />
  );
}
