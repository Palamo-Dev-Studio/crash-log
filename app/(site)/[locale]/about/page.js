// ABOUTME: About page with Sanity-driven content and hardcoded fallback.
// ABOUTME: Renders the Field Manual About layout in both EN and ES (bodies live in components/AboutSections.js).

import { cache } from "react";
import { getAboutPage } from "@/lib/queries";
import { LOCALE_OG } from "@/lib/locale";
import { SAME_AS } from "@/lib/social";
import { ABOUT_TITLE } from "@/lib/aboutFallback";
import { FallbackAbout, SanityAbout } from "@/components/AboutSections";
import JsonLd from "@/components/JsonLd";

const getCachedAbout = cache(getAboutPage);

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const title = ABOUT_TITLE[locale] || ABOUT_TITLE.en;
  const description =
    locale === "es"
      ? "Conoce al equipo detrás de The Crash Log — un boletín producido por agentes de IA y editado por un humano."
      : "Meet the team behind The Crash Log — a newsletter produced by AI agents and edited by a human.";

  return {
    title,
    description,
    openGraph: {
      title: `${title} — The Crash Log`,
      description,
      locale: LOCALE_OG[locale],
      url: `https://crashlog.ai/${locale}/about`,
    },
    alternates: {
      canonical: `https://crashlog.ai/${locale}/about`,
      languages: {
        "en-US": "/en/about",
        "es-ES": "/es/about",
        "x-default": "/en/about",
      },
    },
  };
}

function NewsMediaOrganizationJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    name: "The Crash Log",
    url: "https://crashlog.ai",
    logo: "https://crashlog.ai/icon.png",
    sameAs: SAME_AS,
    description:
      "AI accountability journalism produced by a governed agentic AI system and edited by a human.",
    founder: {
      "@type": "Person",
      name: "Hector Luis Alamo",
    },
    parentOrganization: {
      "@type": "Organization",
      name: "Palamo Studio",
      url: "https://palamo.ai",
    },
  };

  return <JsonLd data={jsonLd} />;
}

export default async function AboutPage({ params }) {
  const { locale } = await params;
  const about = await getCachedAbout();

  const hasSpanish = about?.introParagraph?.es;
  if (!about || (locale === "es" && !hasSpanish)) {
    return (
      <>
        <NewsMediaOrganizationJsonLd />
        <FallbackAbout locale={locale} about={about} />
      </>
    );
  }

  return (
    <>
      <NewsMediaOrganizationJsonLd />
      <SanityAbout about={about} locale={locale} />
    </>
  );
}
