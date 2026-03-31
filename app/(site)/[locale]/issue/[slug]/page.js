// ABOUTME: Individual issue page — renders a specific issue by slug.
// ABOUTME: Provides dynamic metadata, JSON-LD schemas, and static params for all issues.

import { cache } from "react";
import { notFound } from "next/navigation";
import { getIssueBySlug, getAllIssueSlugs, getAdjacentIssues } from "@/lib/queries";
import { t, LOCALES, LOCALE_OG } from "@/lib/locale";
import { urlFor } from "@/lib/sanity";
import IssueContent from "@/components/IssueContent";
import IssueNav from "@/components/IssueNav";

const getCachedIssueBySlug = cache(getIssueBySlug);

export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  const issue = await getCachedIssueBySlug(slug);

  if (!issue) {
    return { title: "Issue Not Found" };
  }

  const title = t(issue.title, locale) || `Issue #${issue.issueNumber}`;
  const description =
    t(issue.metaDescription, locale) ||
    `Issue #${String(issue.issueNumber).padStart(3, "0")} of The Crash Log`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} — The Crash Log`,
      description,
      type: "article",
      locale: LOCALE_OG[locale],
      url: `https://crashlog.ai/${locale}/issue/${slug}`,
      publishedTime: issue.publishDate,
    },
    alternates: {
      canonical: `https://crashlog.ai/${locale}/issue/${slug}`,
      languages: {
        "en-US": `/en/issue/${slug}`,
        "es-ES": `/es/issue/${slug}`,
        "x-default": `/en/issue/${slug}`,
      },
    },
  };
}

export async function generateStaticParams() {
  const slugs = await getAllIssueSlugs();
  return slugs.flatMap(({ slug }) =>
    LOCALES.map((locale) => ({ locale, slug }))
  );
}

function NewsArticleJsonLd({ issue, locale, slug }) {
  const canonicalUrl = `https://crashlog.ai/${locale}/issue/${slug}`;
  const imageUrl = issue.coverImage
    ? urlFor(issue.coverImage).width(1200).height(675).format("webp").url()
    : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: t(issue.title, locale),
    description: t(issue.metaDescription, locale),
    datePublished: issue.publishDate,
    ...(issue._updatedAt && { dateModified: issue._updatedAt }),
    ...(imageUrl && { image: imageUrl }),
    url: canonicalUrl,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
    inLanguage: locale === "es" ? "es-ES" : "en-US",
    publisher: {
      "@type": "Organization",
      name: "The Crash Log",
      url: "https://crashlog.ai",
      logo: {
        "@type": "ImageObject",
        url: "https://crashlog.ai/icon.png",
      },
    },
    author: {
      "@type": "Person",
      name: "Hector Luis Alamo",
      url: "https://www.linkedin.com/in/hector-luis-alamo-90432941/",
      jobTitle: "Editor & Publisher",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

function BreadcrumbJsonLd({ issue, locale, slug }) {
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
        name: t(issue.title, locale) || `Issue #${issue.issueNumber}`,
        item: `https://crashlog.ai/${locale}/issue/${slug}`,
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

export default async function IssuePage({ params }) {
  const { locale, slug } = await params;
  const issue = await getCachedIssueBySlug(slug);

  if (!issue) notFound();

  const adjacent = await getAdjacentIssues(issue.issueNumber);

  return (
    <>
      <NewsArticleJsonLd issue={issue} locale={locale} slug={slug} />
      <BreadcrumbJsonLd issue={issue} locale={locale} slug={slug} />
      <IssueContent issue={issue} locale={locale} />
      <IssueNav prev={adjacent?.prev} next={adjacent?.next} locale={locale} />
    </>
  );
}
