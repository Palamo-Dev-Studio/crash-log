// ABOUTME: Individual Practical article at /[locale]/practical/[slug], rendered with the shared article template.
// ABOUTME: Provides metadata, JSON-LD schemas and static params for every published practical post.

import { cache } from "react";
import { notFound } from "next/navigation";
import { getPracticalBySlug, getAllPracticalSlugs } from "@/lib/queries";
import { t, LOCALES, LOCALE_OG, hasFullTranslation } from "@/lib/locale";
import { urlFor } from "@/lib/sanity";
import { getByline, getJsonLdAuthor } from "@/lib/series";
import { getReadingMinutes } from "@/lib/readingTime";
import { SERIES_INDEX_LABELS } from "@/lib/articleLabels";
import ArticleLayout from "@/components/ArticleLayout";
import JsonLd from "@/components/JsonLd";

const getCachedPracticalBySlug = cache(getPracticalBySlug);

export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  const doc = await getCachedPracticalBySlug(slug);

  if (!doc) {
    return { title: "Practical Not Found" };
  }

  const title = t(doc.title, locale) || `FIX-${doc.practicalNumber}`;
  const description =
    t(doc.metaDescription, locale) ||
    t(doc.subtitle, locale) ||
    "Practical — The Crash Log";

  return {
    title,
    description,
    openGraph: {
      title: `${title} — Practical`,
      description,
      type: "article",
      locale: LOCALE_OG[locale],
      url: `https://crashlog.ai/${locale}/practical/${slug}`,
      publishedTime: doc.publishDate,
    },
    alternates: {
      canonical: `https://crashlog.ai/${locale}/practical/${slug}`,
      languages: {
        "en-US": `/en/practical/${slug}`,
        "es-ES": `/es/practical/${slug}`,
        "x-default": `/en/practical/${slug}`,
      },
    },
  };
}

export async function generateStaticParams() {
  const slugs = await getAllPracticalSlugs();
  return slugs.flatMap(({ slug }) =>
    LOCALES.map((locale) => ({ locale, slug }))
  );
}

function PracticalJsonLd({ doc, locale, slug }) {
  const canonicalUrl = `https://crashlog.ai/${locale}/practical/${slug}`;
  const title = t(doc.title, locale);
  const imageUrl = doc.coverImage
    ? urlFor(doc.coverImage).width(1200).height(675).format("webp").url()
    : undefined;
  const indexLabel = SERIES_INDEX_LABELS.practical[locale].title;

  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: t(doc.metaDescription, locale) || t(doc.subtitle, locale),
    datePublished: doc.publishDate,
    ...(doc._updatedAt && { dateModified: doc._updatedAt }),
    ...(imageUrl && { image: imageUrl }),
    url: canonicalUrl,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
    inLanguage: locale === "es" ? "es-ES" : "en-US",
    publisher: {
      "@type": "Organization",
      name: "The Crash Log",
      url: "https://crashlog.ai",
    },
    author: getJsonLdAuthor(doc),
  };

  const breadcrumb = {
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
        name: indexLabel,
        item: `https://crashlog.ai/${locale}/practical`,
      },
      { "@type": "ListItem", position: 3, name: title, item: canonicalUrl },
    ],
  };

  return (
    <>
      <JsonLd data={article} />
      <JsonLd data={breadcrumb} />
    </>
  );
}

export default async function PracticalPage({ params }) {
  const { locale, slug } = await params;
  const doc = await getCachedPracticalBySlug(slug);

  if (!doc) notFound();

  return (
    <>
      <PracticalJsonLd doc={doc} locale={locale} slug={slug} />
      <ArticleLayout
        doc={doc}
        locale={locale}
        title={t(doc.title, locale)}
        subtitle={t(doc.subtitle, locale)}
        body={t(doc.body, locale)}
        minutes={getReadingMinutes(doc, locale)}
        showFallback={
          locale === "es" &&
          !hasFullTranslation(doc, locale, { bodyField: "body" })
        }
        showSubscribe
      />
    </>
  );
}
