// ABOUTME: Open Graph image for the About page, rendered with the shared Field Manual template.
// ABOUTME: 1200x630 cream card with the stamp roundel and the title in Instrument Serif.

import { renderOgImage, TitleCard } from "@/lib/ogTemplate";
import { ABOUT_TITLE } from "@/lib/aboutFallback";

export const alt = "The Crash Log";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function OgImage({ params }) {
  const { locale } = await params;
  const title = ABOUT_TITLE[locale] || ABOUT_TITLE.en;
  return renderOgImage(<TitleCard title={title} />);
}
