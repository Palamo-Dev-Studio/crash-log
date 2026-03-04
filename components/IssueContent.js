// ABOUTME: Shared issue renderer that composes all Phase 3 components into a full issue page.
// ABOUTME: Used by both the latest issue (home) page and individual issue pages.

import { PortableText } from "@portabletext/react";
import { t, hasFullTranslation } from "@/lib/locale";
import { portableTextComponents } from "@/lib/portableText";
import CoverImage from "@/components/CoverImage";
import IssueHeader from "@/components/IssueHeader";
import FallbackBanner from "@/components/FallbackBanner";
import NicosTransmission from "@/components/NicosTransmission";
import StoryBlock from "@/components/StoryBlock";
import StackTrace from "@/components/StackTrace";
import DonateCTA from "@/components/DonateCTA";
import Footer from "@/components/Footer";
import styles from "./IssueContent.module.css";

function formatDate(dateString, locale) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function IssueContent({ issue, locale }) {
  if (!issue) {
    return (
      <main className={styles.empty}>
        <p className={styles.emptyText}>
          {locale === "es"
            ? "No hay ediciones publicadas todavía."
            : "No issues published yet."}
        </p>
      </main>
    );
  }

  const transmission = t(issue.nicosTransmission, locale);
  const stackTraceItems = issue.stackTrace
    ?.map((item) => ({
      title: item.sourceOutlet,
      description: t(item.text, locale),
    }))
    .filter((item) => item.description);

  return (
    <main>
      <CoverImage image={issue.coverImage} alt={t(issue.coverImageAlt, locale)} />

      <IssueHeader
        issueNumber={issue.issueNumber}
        date={formatDate(issue.publishDate, locale)}
        title={t(issue.title, locale)}
        subtitle={t(issue.subtitle, locale)}
      />

      {locale === "es" && !hasFullTranslation(issue, locale) && (
        <FallbackBanner />
      )}

      {transmission && (
        <NicosTransmission>
          <PortableText value={transmission} components={portableTextComponents} />
        </NicosTransmission>
      )}

      {issue.stories?.map((story) => (
        <StoryBlock
          key={story._id}
          severity={story.severity}
          headline={t(story.headline, locale)}
          tags={t(story.tags, locale)?.split(" / ")}
        >
          <PortableText
            value={t(story.body, locale)}
            components={portableTextComponents}
          />
        </StoryBlock>
      ))}

      <StackTrace items={stackTraceItems} />

      <DonateCTA />
      <Footer />
    </main>
  );
}
