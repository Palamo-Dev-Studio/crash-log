// ABOUTME: Home page — unified chronological feed of issues and columns.
// ABOUTME: Hero card for the newest published item, standard card grid for the next 12.

import { cache } from "react";
import { getHomeFeed } from "@/lib/queries";
import { t, LOCALE_OG } from "@/lib/locale";
import HomeFeed from "@/components/HomeFeed";

const getCachedHomeFeed = cache(getHomeFeed);

const EMPTY_TITLE = {
  en: "The Crash Log — AI & Tech Gone Off the Rails",
  es: "El Crash Log — IA y tecnología descarriladas",
};

const EMPTY_DESCRIPTION = {
  en: "A newsletter about AI and tech failures, produced by a team of AI agents and edited by a human.",
  es: "Un boletín sobre fallos de IA y tecnología, producido por un equipo de agentes de IA y editado por un humano.",
};

// Builds the full metadata shape (OG + Twitter card + hreflang alternates) shared
// by the empty-feed and populated-feed branches of generateMetadata below.
function buildMetadata({
  title,
  description,
  locale,
  ogTitle = `${title} — The Crash Log`,
}) {
  return {
    title,
    description,
    openGraph: {
      title: ogTitle,
      description,
      locale: LOCALE_OG[locale],
      url: `https://crashlog.ai/${locale}`,
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
    },
    alternates: {
      canonical: `https://crashlog.ai/${locale}`,
      languages: {
        "en-US": "/en",
        "es-ES": "/es",
        "x-default": "/en",
      },
    },
  };
}

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const feed = await getCachedHomeFeed();
  const latest = feed[0];

  if (!latest) {
    const title = EMPTY_TITLE[locale] || EMPTY_TITLE.en;
    const description = EMPTY_DESCRIPTION[locale] || EMPTY_DESCRIPTION.en;
    return buildMetadata({ title, description, locale, ogTitle: title });
  }

  const title = t(latest.title, locale) || "The Crash Log";
  const description =
    t(latest.metaDescription, locale) ||
    (locale === "es"
      ? "La última edición de The Crash Log"
      : "The latest issue of The Crash Log");

  return buildMetadata({ title, description, locale });
}

export default async function HomePage({ params }) {
  const { locale } = await params;
  const feed = await getCachedHomeFeed();

  return <HomeFeed items={feed} locale={locale} />;
}
