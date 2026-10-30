// ABOUTME: Off the Rails issue renderer: page head, case-file grid, full story files, Nico's Transmission and Stack Trace.
// ABOUTME: Used by the individual issue pages; the full files render only for stories that have a body.

import { PortableText } from "@portabletext/react";
import { t, hasFullTranslation } from "@/lib/locale";
import { portableTextComponents } from "@/lib/portableText";
import { formatDate } from "@/lib/formatDate";
import { getByline, getCredit, getFileCode } from "@/lib/series";
import { readingMinutes } from "@/lib/readingTime";
import { portableTextToPlain } from "@/lib/portableTextToPlain";
import { caseNumber, OTR_LABELS } from "@/lib/offTheRailsLabels";
import { getCaseSummary, getVerdict, hasFullBody } from "@/lib/caseCard";
import IssueHeader from "@/components/IssueHeader";
import CaseCard from "@/components/CaseCard";
import VerdictStamp, { StampFilter } from "@/components/VerdictStamp";
import FallbackBanner from "@/components/FallbackBanner";
import NicosTransmission from "@/components/NicosTransmission";
import StackTrace from "@/components/StackTrace";
import styles from "./IssueContent.module.css";

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

  const labels = OTR_LABELS[locale] || OTR_LABELS.en;
  const doc = { ...issue, _type: "issue" };
  const stories = (issue.stories || []).filter(Boolean);
  const transmission = t(issue.nicosTransmission, locale);
  const stackTraceItems = issue.stackTrace
    ?.map((item) => ({
      body: t(item.text, locale),
      sources: item.sources,
    }))
    .filter((item) => item.body);
  // Only stories with a body get a full file (and a case-number anchor to it).
  const fileId = (story, index) =>
    hasFullBody(story, locale) ? `case-file-${caseNumber(index)}` : undefined;
  const hasFullFiles = stories.some((story) => hasFullBody(story, locale));

  const minutes = (() => {
    const parts = [
      transmission,
      ...stories.flatMap((story) => [
        t(story.body, locale),
        getCaseSummary(story, locale),
      ]),
      ...(stackTraceItems || []).map((item) => item.body),
    ].map((part) =>
      Array.isArray(part) ? portableTextToPlain(part) : part || ""
    );
    return parts.some((p) => p.trim()) ? readingMinutes(parts) : null;
  })();

  return (
    <main>
      <StampFilter />
      <IssueHeader
        locale={locale}
        code={getFileCode(doc)}
        date={formatDate(issue.publishDate, locale, "short")}
        caseCount={stories.length}
        minutes={minutes}
        title={t(issue.title, locale)}
        subtitle={t(issue.subtitle, locale)}
        byline={getByline(doc, locale)}
        credit={getCredit(doc, locale)}
      />

      {locale === "es" && !hasFullTranslation(issue, locale) && (
        <FallbackBanner />
      )}

      {stories.length > 0 && (
        <section className={styles.cases}>
          {stories.map((story, index) => (
            <CaseCard
              key={story._id}
              story={story}
              index={index}
              locale={locale}
              fileId={fileId(story, index)}
            />
          ))}
        </section>
      )}

      {hasFullFiles && (
        <section className={styles.files} aria-labelledby="full-files-heading">
          <h2 id="full-files-heading" className={styles.filesHeading}>
            {labels.fullFiles}
          </h2>
          {stories.map((story, index) => {
            const id = fileId(story, index);
            if (!id) return null;
            const tags = t(story.tags, locale)?.split(" / ");
            return (
              <article key={story._id} id={id} className={styles.file}>
                <div className={styles.fileTop}>
                  <span className={styles.fileNumber}>
                    {labels.caseWord} {caseNumber(index)}
                  </span>
                  <VerdictStamp
                    text={getVerdict(story, locale)}
                    index={index}
                  />
                </div>
                <h3 className={styles.fileTitle}>
                  {t(story.headline, locale)}
                </h3>
                {tags && <p className={styles.fileTags}>{tags.join(" / ")}</p>}
                <div className={styles.prose}>
                  <PortableText
                    value={t(story.body, locale)}
                    components={portableTextComponents}
                  />
                </div>
              </article>
            );
          })}
        </section>
      )}

      {transmission && (
        <NicosTransmission locale={locale}>
          <PortableText
            value={transmission}
            components={portableTextComponents}
          />
        </NicosTransmission>
      )}

      <StackTrace locale={locale} items={stackTraceItems} />
    </main>
  );
}
