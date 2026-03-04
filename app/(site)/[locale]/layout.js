// ABOUTME: Root layout for the public site. Owns <html> with dynamic lang attribute.
// ABOUTME: Loads Google Fonts, global CSS, validates locale, wraps pages in shared chrome.

import { Space_Grotesk, Source_Serif_4, IBM_Plex_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import "@/app/globals.css";
import { LOCALES, LOCALE_LABELS, LOCALE_OG } from "@/lib/locale";
import Header from "@/components/Header";
import LanguageToggle from "@/components/LanguageToggle";
import SiteNav from "@/components/SiteNav";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const sourceSerif4 = Source_Serif_4({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const label = LOCALE_LABELS[locale] || LOCALE_LABELS.en;
  const ogLocale = LOCALE_OG[locale] || LOCALE_OG.en;

  return {
    metadataBase: new URL("https://crashlog.ai"),
    title: {
      template: "%s — The Crash Log",
      default: "The Crash Log — AI & Tech Gone Off the Rails",
    },
    description:
      locale === "es"
        ? "Un boletín sobre fallos de IA y tecnología, producido por un equipo de agentes de IA y editado por un humano."
        : "A newsletter about AI and tech failures, produced by a team of AI agents and edited by a human.",
    keywords: [
      "AI failures",
      "tech failures",
      "artificial intelligence",
      "newsletter",
      "The Crash Log",
    ],
    authors: [{ name: "Hector Luis Alamo", url: "https://crashlog.ai" }],
    openGraph: {
      type: "website",
      locale: ogLocale,
      siteName: "The Crash Log",
      title: "The Crash Log — AI & Tech Gone Off the Rails",
      description:
        locale === "es"
          ? "Un boletín sobre fallos de IA y tecnología, producido por un equipo de agentes de IA y editado por un humano."
          : "A newsletter about AI and tech failures, produced by a team of AI agents and edited by a human.",
      url: `https://crashlog.ai/${locale}`,
    },
    twitter: {
      card: "summary_large_image",
      // TODO: Update with actual Twitter handle before launch
      site: "@thecrashlog",
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      languages: {
        "en-US": "/en",
        "es-ES": "/es",
        "x-default": "/en",
      },
    },
  };
}

export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

function WebSiteJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "The Crash Log",
    alternateName: "The Crash Log — AI & Tech Gone Off the Rails",
    url: "https://crashlog.ai",
    description:
      "A newsletter about AI and tech failures, produced by a team of AI agents and edited by a human.",
    publisher: {
      "@type": "Organization",
      name: "The Crash Log",
      url: "https://crashlog.ai",
      // TODO: Add logo and sameAs social profile URLs before launch
    },
    inLanguage: ["en-US", "es-ES"],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function SiteLayout({ children, params }) {
  const { locale } = await params;
  if (!LOCALES.includes(locale)) notFound();

  return (
    <html lang={locale}>
      <head>
        <WebSiteJsonLd />
      </head>
      <body
        className={`${spaceGrotesk.variable} ${sourceSerif4.variable} ${ibmPlexMono.variable}`}
      >
        <div className="wrapper">
          <Header locale={locale}>
            <LanguageToggle locale={locale} />
          </Header>
          <SiteNav locale={locale} />
          {children}
        </div>
      </body>
    </html>
  );
}
