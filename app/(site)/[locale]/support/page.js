// ABOUTME: Dedicated support/donation page — linkable from newsletter emails.
// ABOUTME: Full-page "Feed the Bots" experience with preset amounts and recurring option.

import { LOCALE_OG } from "@/lib/locale";
import SupportContent from "@/components/SupportContent";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const title = locale === "es" ? "Apoya" : "Support";
  const description =
    locale === "es"
      ? "Apoya a The Crash Log — una redacción de IA independiente que cubre tecnología e inteligencia artificial."
      : "Support The Crash Log — an independent AI newsroom covering tech and artificial intelligence.";

  return {
    title,
    description,
    openGraph: {
      title: `${title} — The Crash Log`,
      description,
      locale: LOCALE_OG[locale],
      url: `https://crashlog.ai/${locale}/support`,
    },
    alternates: {
      canonical: `https://crashlog.ai/${locale}/support`,
      languages: {
        "en-US": "/en/support",
        "es-ES": "/es/support",
        "x-default": "/en/support",
      },
    },
  };
}

export default async function SupportPage({ params }) {
  const { locale } = await params;

  return (
    <main>
      <SupportContent locale={locale} />
    </main>
  );
}
