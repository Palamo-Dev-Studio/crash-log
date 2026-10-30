// ABOUTME: About page bodies: SanityAbout (aboutPage + masthead documents) and FallbackAbout (approved copy, two-person masthead).
// ABOUTME: Both render the same Field Manual layout: serif H1, mono section labels, prose at a readable measure, masthead cards.

import { Fragment } from "react";
import { PortableText } from "@portabletext/react";
import { t } from "@/lib/locale";
import { portableTextComponents } from "@/lib/portableText";
import {
  ABOUT_COPY,
  ABOUT_EMAIL,
  FALLBACK_MASTHEAD,
} from "@/lib/aboutFallback";
import AgentCard from "@/components/AgentCard";
import styles from "./AboutSections.module.css";

const TITLES = { en: "About", es: "Acerca de" };
const SANITY_HEADINGS = {
  en: { masthead: "Masthead", workflow: "How it works", contact: "Contact" },
  es: { masthead: "Redacción", workflow: "Cómo funciona", contact: "Contacto" },
};

// Renders the copy file's inline markup: **bold** and [text](url).
const INLINE = /\*\*(.+?)\*\*|\[(.+?)\]\((.+?)\)/g;
function Inline({ text }) {
  const parts = [];
  let last = 0;
  for (const m of text.matchAll(INLINE)) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[1] !== undefined) {
      parts.push(<strong key={m.index}>{m[1]}</strong>);
    } else {
      parts.push(
        <a key={m.index} href={m[3]}>
          {m[2]}
        </a>
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.map((p, i) => <Fragment key={i}>{p}</Fragment>);
}

function Paragraphs({ items }) {
  return items.map((p) => (
    <p key={p}>
      <Inline text={p} />
    </p>
  ));
}

export function FallbackAbout({ locale, about }) {
  const copy = ABOUT_COPY[locale] || ABOUT_COPY.en;
  const lang = ABOUT_COPY[locale] ? locale : "en";

  return (
    <main>
      <header className={styles.head}>
        <p className={styles.kicker}>{copy.kicker}</p>
        <h1 className={styles.title}>{copy.lead}</h1>
      </header>

      <section className={styles.section}>
        <h2 className={styles.heading}>{copy.publishHeading}</h2>
        <div className={styles.prose}>
          <Paragraphs items={copy.publish} />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>{copy.whoHeading}</h2>
        <p className={styles.mastheadIntro}>{copy.whoIntro}</p>
        <div className={styles.masthead}>
          {FALLBACK_MASTHEAD.map((person) => {
            const sanityAgent = about?.masthead?.find(
              (a) => a.name === (person.sanityName || person.name)
            );
            return (
              <AgentCard
                key={person.name}
                name={person.name}
                role={person.role}
                agentType={person.agentType}
                bio={person.bio}
                image={sanityAgent?.avatar}
                locale={lang}
              />
            );
          })}
        </div>
        <div className={styles.prose}>
          <Paragraphs items={copy.who} />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>{copy.betterHeading}</h2>
        <div className={styles.prose}>
          <Paragraphs items={copy.better} />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>{copy.contactHeading}</h2>
        <div className={styles.prose}>
          <p>
            {copy.contactBefore}
            <a href={`mailto:${ABOUT_EMAIL}`}>{ABOUT_EMAIL}</a>
            {copy.contactAfter}
          </p>
        </div>
      </section>
    </main>
  );
}

export function SanityAbout({ about, locale }) {
  const intro = t(about.introParagraph, locale);
  const workflow = t(about.workflowSection, locale);
  const contactCTA = t(about.contactCTA, locale);
  const headings = SANITY_HEADINGS[locale] || SANITY_HEADINGS.en;

  return (
    <main>
      <header className={styles.head}>
        <h1 className={styles.title}>{TITLES[locale] || TITLES.en}</h1>
      </header>
      {intro && (
        <section className={styles.section}>
          <div className={styles.prose}>
            <PortableText value={intro} components={portableTextComponents} />
          </div>
        </section>
      )}

      {about.masthead?.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.heading}>{headings.masthead}</h2>
          <div className={styles.masthead}>
            {about.masthead.map((agent) => (
              <AgentCard
                key={agent._id}
                name={agent.name}
                role={agent.role}
                agentType={agent.agentType}
                model={agent.model}
                bio={agent.bio}
                image={agent.avatar}
                locale={locale}
              />
            ))}
          </div>
        </section>
      )}

      {workflow && (
        <section className={styles.section}>
          <h2 className={styles.heading}>{headings.workflow}</h2>
          <div className={styles.prose}>
            <PortableText
              value={workflow}
              components={portableTextComponents}
            />
          </div>
        </section>
      )}

      {contactCTA && (
        <section className={styles.section}>
          <h2 className={styles.heading}>{headings.contact}</h2>
          <div className={styles.prose}>
            <PortableText
              value={contactCTA}
              components={portableTextComponents}
            />
          </div>
        </section>
      )}
    </main>
  );
}
