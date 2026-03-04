// ABOUTME: Latest issue page — the homepage for each locale.
// ABOUTME: Fetches and renders the most recently published issue from Sanity.

import { cache } from "react";
import { getLatestIssue } from "@/lib/queries";
import { t, LOCALE_OG } from "@/lib/locale";
import IssueContent from "@/components/IssueContent";

const getCachedLatestIssue = cache(getLatestIssue);

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const issue = await getCachedLatestIssue();

  if (!issue) {
    return {
      title: locale === "es"
        ? "El Crash Log — IA y tecnología descarriladas"
        : "The Crash Log — AI & Tech Gone Off the Rails",
    };
  }

  const title = t(issue.title, locale) || "The Crash Log";
  const description =
    t(issue.metaDescription, locale) ||
    (locale === "es"
      ? "La última edición de The Crash Log"
      : "The latest issue of The Crash Log");

  return {
    title,
    description,
    openGraph: {
      title: `${title} — The Crash Log`,
      description,
      locale: LOCALE_OG[locale],
      url: `https://thecrashlog.com/${locale}`,
    },
  };
}

export default async function HomePage({ params }) {
  const { locale } = await params;
  const issue = await getCachedLatestIssue();

  return <IssueContent issue={issue} locale={locale} />;
}
