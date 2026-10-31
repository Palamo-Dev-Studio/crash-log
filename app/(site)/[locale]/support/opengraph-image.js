// ABOUTME: Open Graph image for the support page, rendered with the shared Field Manual template.
// ABOUTME: 1200x630 cream card with the stamp roundel and the title in Instrument Serif.

import { renderOgImage, TitleCard } from "@/lib/ogTemplate";

export const alt = "The Crash Log";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function OgImage({ params }) {
  const { locale } = await params;
  const title = locale === "es" ? "Apoya el Log" : "Support";
  return renderOgImage(<TitleCard title={title} />);
}
