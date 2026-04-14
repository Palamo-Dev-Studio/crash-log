// ABOUTME: Post-subscribe thank-you page with noindex metadata.
// ABOUTME: Transactional page confirming newsletter subscription, excluded from search engines.

import { LOCALE_OG } from "@/lib/locale";
import ThankYouContent from "@/components/ThankYouContent";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const title =
    locale === "es" ? "Suscripci\u00F3n Confirmada" : "Subscription Confirmed";

  return {
    title,
    robots: { index: false, follow: false },
    openGraph: {
      title: `${title} \u2014 The Crash Log`,
      locale: LOCALE_OG[locale],
    },
  };
}

export default async function ThankYouPage({ params }) {
  const { locale } = await params;

  return (
    <main>
      <ThankYouContent locale={locale} />
    </main>
  );
}
