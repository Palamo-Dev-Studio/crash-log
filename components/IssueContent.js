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
import { getStoryColorKey } from "@/lib/storyColors";
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
      body: t(item.text, locale),
      sources: item.sources,
    }))
    .filter((item) => item.body);

  return (
    <main>
      <CoverImage
        image={issue.coverImage}
        alt={t(issue.coverImageAlt, locale)}
      />

      <IssueHeader
        locale={locale}
        issueNumber={issue.issueNumber}
        date={formatDate(issue.publishDate, locale)}
        title={t(issue.title, locale)}
        subtitle={t(issue.subtitle, locale)}
      />

      {locale === "es" && !hasFullTranslation(issue, locale) && (
        <FallbackBanner />
      )}

      {transmission && (
        <NicosTransmission locale={locale}>
          <PortableText
            value={transmission}
            components={portableTextComponents}
          />
        </NicosTransmission>
      )}

      {issue.stories?.filter(Boolean).map((story, index) => {
        const body = t(story.body, locale);
        return (
          <StoryBlock
            key={story._id}
            severity={story.severity}
            colorKey={getStoryColorKey(index)}
            headline={t(story.headline, locale)}
            tags={t(story.tags, locale)?.split(" / ")}
          >
            {body && (
              <PortableText value={body} components={portableTextComponents} />
            )}
          </StoryBlock>
        );
      })}

      <StackTrace locale={locale} items={stackTraceItems} />

      <DonateCTA locale={locale} />

      <div style={{textAlign:'center',padding:'32px 0',borderTop:'1px solid var(--border)',marginTop:'32px'}}>
        <p style={{fontFamily:'var(--font-mono)',fontSize:'13px',letterSpacing:'1.5px',textTransform:'uppercase',color:'var(--text-tertiary)',marginBottom:'12px'}}>
          {locale === 'es' ? 'No te pierdas la próxima edición' : "Don't miss the next issue"}
        </p>
        <a href={`/${locale}`} style={{fontFamily:'var(--font-mono)',fontSize:'12px',letterSpacing:'1.5px',textTransform:'uppercase',color:'var(--severity-error)',textDecoration:'none',border:'1.5px solid var(--severity-error)',padding:'10px 24px',borderRadius:'2px'}}>
          {locale === 'es' ? 'Suscríbete' : 'Subscribe'}
        </a>
      </div>

      <Footer locale={locale} />
    </main>
  );
}
