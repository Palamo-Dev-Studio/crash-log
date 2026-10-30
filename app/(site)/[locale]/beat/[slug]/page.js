// ABOUTME: Beat detail page showing all stories in a specific category as ruled rows.
// ABOUTME: Fetches category + stories, renders with BeatStoryCard components.

import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategoryWithStories, getAllCategories } from "@/lib/queries";
import { t, LOCALES, LOCALE_OG } from "@/lib/locale";
import BeatStoryCard from "@/components/BeatStoryCard";
import { BEAT_LABELS } from "@/lib/beatLabels";
import styles from "./beat.module.css";

const getCachedCategoryWithStories = cache(getCategoryWithStories);

export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  const data = await getCachedCategoryWithStories(slug);
  const category = data?.category;

  if (!category) {
    return { title: "Beat Not Found" };
  }

  const name = t(category.name, locale) || "Beat";
  const description =
    t(category.description, locale) ||
    (locale === "es"
      ? `Historias de la sección ${name}`
      : `Stories from the ${name} beat`);

  return {
    title: name,
    description,
    openGraph: {
      title: `${name} — The Crash Log`,
      description,
      locale: LOCALE_OG[locale],
      url: `https://crashlog.ai/${locale}/beat/${slug}`,
    },
    alternates: {
      canonical: `https://crashlog.ai/${locale}/beat/${slug}`,
      languages: {
        "en-US": `/en/beat/${slug}`,
        "es-ES": `/es/beat/${slug}`,
        "x-default": `/en/beat/${slug}`,
      },
    },
  };
}

export async function generateStaticParams() {
  const categories = await getAllCategories();
  return categories.flatMap(({ slug }) =>
    LOCALES.map((locale) => ({ locale, slug }))
  );
}

export default async function BeatPage({ params }) {
  const { locale, slug } = await params;
  const data = await getCachedCategoryWithStories(slug);
  const category = data?.category;
  // A story with no published issue has nowhere to link, so it is dropped once, here:
  // the kicker count and the rows both read this list.
  const stories = (data?.stories || []).filter((story) => story.issue?.slug);

  if (!category) notFound();

  const name = t(category.name, locale);
  const description = t(category.description, locale);
  const labels = BEAT_LABELS[locale] || BEAT_LABELS.en;

  return (
    <main>
      <section className={styles.head}>
        <p className={styles.kicker}>
          <span>
            {labels.detailKicker} · {labels.storiesCaps(stories.length)}
          </span>
          <Link href={`/${locale}/beats`} className={styles.back}>
            {labels.allBeats}
          </Link>
        </p>
        <h1 className={styles.title}>{name}</h1>
        {description && <p className={styles.dek}>{description}</p>}
      </section>

      {stories.length === 0 ? (
        <p className={styles.empty}>{labels.detailEmpty}</p>
      ) : (
        <div className={styles.list}>
          {stories.map((story) => (
            <BeatStoryCard
              key={story._id}
              severity={story.severity}
              verdict={story.verdict}
              headline={story.headline}
              issueMeta={{
                number: story.issue?.issueNumber,
                date: story.issue?.publishDate,
                slug: story.issue?.slug,
              }}
              locale={locale}
            />
          ))}
        </div>
      )}
    </main>
  );
}
