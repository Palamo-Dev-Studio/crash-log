// ABOUTME: Individual column page — renders a specific Nico's Notes column by slug.
// ABOUTME: Provides dynamic metadata, JSON-LD schemas, and static params for all columns.

import { cache } from "react";
import { notFound } from "next/navigation";
import { getColumnBySlug, getAllColumnSlugs } from "@/lib/queries";
import { t, LOCALES, LOCALE_OG } from "@/lib/locale";
import { urlFor } from "@/lib/sanity";
import ColumnContent from "@/components/ColumnContent";

const getCachedColumnBySlug = cache(getColumnBySlug);

export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  const column = await getCachedColumnBySlug(slug);

  if (!column) {
    return { title: "Column Not Found" };
  }

  const title =
    t(column.title, locale) || `Nico\u2019s Notes #${column.columnNumber}`;
  const description =
    t(column.metaDescription, locale) ||
    `Nico\u2019s Notes #${String(column.columnNumber).padStart(3, "0")} — The Crash Log`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} — Nico\u2019s Notes`,
      description,
      type: "article",
      locale: LOCALE_OG[locale],
      url: `https://crashlog.ai/${locale}/nico/${slug}`,
      publishedTime: column.publishDate,
    },
    alternates: {
      canonical: `https://crashlog.ai/${locale}/nico/${slug}`,
      languages: {
        "en-US": `/en/nico/${slug}`,
        "es-ES": `/es/nico/${slug}`,
        "x-default": `/en/nico/${slug}`,
      },
    },
  };
}

export async function generateStaticParams() {
  const slugs = await getAllColumnSlugs();
  return slugs.flatMap(({ slug }) =>
    LOCALES.map((locale) => ({ locale, slug }))
  );
}

function ArticleJsonLd({ column, locale, slug }) {
  const canonicalUrl = `https://crashlog.ai/${locale}/nico/${slug}`;
  const imageUrl = column.coverImage
    ? urlFor(column.coverImage).width(1200).height(675).format("webp").url()
    : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: t(column.title, locale),
    description: t(column.metaDescription, locale),
    datePublished: column.publishDate,
    ...(column._updatedAt && { dateModified: column._updatedAt }),
    ...(imageUrl && { image: imageUrl }),
    url: canonicalUrl,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
    inLanguage: locale === "es" ? "es-ES" : "en-US",
    publisher: {
      "@type": "Organization",
      name: "The Crash Log",
      url: "https://crashlog.ai",
    },
    author: {
      "@type": "Person",
      name: "Nico",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

function BreadcrumbJsonLd({ column, locale, slug }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `https://crashlog.ai/${locale}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: locale === "es" ? "Notas de Nico" : "Nico\u2019s Notes",
        item: `https://crashlog.ai/${locale}/nico`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: t(column.title, locale) || `#${column.columnNumber}`,
        item: `https://crashlog.ai/${locale}/nico/${slug}`,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function ColumnPage({ params }) {
  const { locale, slug } = await params;
  const column = await getCachedColumnBySlug(slug);

  if (!column) notFound();

  return (
    <>
      <ArticleJsonLd column={column} locale={locale} slug={slug} />
      <BreadcrumbJsonLd column={column} locale={locale} slug={slug} />
      <ColumnContent column={column} locale={locale} />
    </>
  );
}
