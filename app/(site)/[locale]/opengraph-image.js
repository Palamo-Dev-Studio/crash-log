// ABOUTME: Default site-level Open Graph image for all locale root pages.
// ABOUTME: Renders the Field Manual site card (roundel, wordmark, tagline) through the shared template.

import { renderOgImage, SiteCard } from "@/lib/ogTemplate";

export const alt = "The Crash Log";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function SiteOgImage({ params } = {}) {
  const { locale } = (await params) ?? {};
  return renderOgImage(<SiteCard locale={locale} />);
}
