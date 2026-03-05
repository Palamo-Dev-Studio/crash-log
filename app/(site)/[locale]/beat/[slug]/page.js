// ABOUTME: Beat detail page showing all stories in a specific category.
// ABOUTME: Fetches category + stories, renders with BeatStoryCard components.

import { cache } from "react";
import { notFound } from "next/navigation";
import { getCategoryWithStories, getAllCategories } from "@/lib/queries";
import { t, LOCALES, LOCALE_OG } from "@/lib/locale";
import BeatStoryCard from "@/components/BeatStoryCard";
import { getStoryColorKey } from "@/lib/storyColors";
import Footer from "@/components/Footer";
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
  const stories = data?.stories || [];

  if (!category) notFound();

  const name = t(category.name, locale);
  const description = t(category.description, locale);

  return (
    <main>
      <header
        className={styles.header}
        style={{ borderLeftColor: category.color || "var(--severity-error)" }}
      >
        <h2 className={styles.name}>{name}</h2>
        {description && <p className={styles.description}>{description}</p>}
      </header>

      {stories.length === 0 ? (
        <p className={styles.empty}>
          {locale === "es"
            ? "No hay historias en esta sección todavía."
            : "No stories in this beat yet."}
        </p>
      ) : (
        stories.map((story, index) => (
          <BeatStoryCard
            key={story._id}
            severity={story.severity}
            colorKey={getStoryColorKey(index)}
            headline={story.headline}
            issueMeta={{
              number: story.issue?.issueNumber,
              date: story.issue?.publishDate,
              slug: story.issue?.slug,
            }}
            locale={locale}
          />
        ))
      )}

      <Footer />
    </main>
  );
}
