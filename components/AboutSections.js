// ABOUTME: About page bodies: SanityAbout (aboutPage + masthead documents) and FallbackAbout (approved copy, two-person masthead).
// ABOUTME: Both render the same Field Manual layout: serif H1, mono section labels, prose at a readable measure, masthead cards.

import { Fragment } from "react";
import { PortableText } from "@portabletext/react";
import { t } from "@/lib/locale";
import { portableTextComponents } from "@/lib/portableText";
import {
  ABOUT_COPY,
  ABOUT_EMAIL,
  ABOUT_TITLE,
  FALLBACK_MASTHEAD,
} from "@/lib/aboutFallback";
import AgentCard from "@/components/AgentCard";
import styles from "./AboutSections.module.css";

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
              (a) => a.name === person.name
            );
            return (
              <AgentCard
                key={person.name}
                name={person.name}
                role={person.role}
                agentType={person.agentType}
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

const blockText = (block) =>
  (block.children || []).map((c) => c.text || "").join("");
const isHeading = (block) => block._type === "block" && block.style === "h2";

// Splits Portable Text at its H2 blocks: `preamble` is everything before the
// first H2, each section is an H2's text plus the blocks that follow it.
function splitSections(blocks) {
  const preamble = [];
  const sections = [];
  for (const block of blocks || []) {
    if (isHeading(block)) {
      sections.push({ heading: blockText(block), body: [] });
    } else if (sections.length) {
      sections[sections.length - 1].body.push(block);
    } else {
      preamble.push(block);
    }
  }
  return { preamble, sections };
}

function Prose({ blocks }) {
  if (!blocks.length) return null;
  return (
    <div className={styles.prose}>
      <PortableText value={blocks} components={portableTextComponents} />
    </div>
  );
}

function Masthead({ people, locale }) {
  return (
    <div className={styles.masthead}>
      {people.map((agent) => (
        <AgentCard
          key={agent._id}
          name={agent.name}
          role={agent.role}
          agentType={agent.agentType}
          image={agent.avatar}
          locale={locale}
        />
      ))}
    </div>
  );
}

// Sanity-driven page in the fallback's structure. Mapping:
//   introParagraph:  first plain block = lead (H1); each H2 opens a section
//   workflowSection: each H2 opens a section; the masthead cards sit after the
//                    first block of the first section ("Two of us.")
//   contactCTA:      each H2 opens a section
// An intro with no H2 is older content and renders as LegacySanityAbout.
export function SanityAbout({ about, locale }) {
  const intro = splitSections(t(about.introParagraph, locale));
  if (!intro.sections.length) {
    return <LegacySanityAbout about={about} locale={locale} />;
  }
  const [leadBlock, ...restPreamble] = intro.preamble;
  const workflow = splitSections(t(about.workflowSection, locale));
  const contact = splitSections(t(about.contactCTA, locale));
  const people = about.masthead || [];
  const cardsAt = workflow.sections.length ? 0 : -1;
  const sections = [
    ...intro.sections,
    ...workflow.sections,
    ...contact.sections,
  ];
  const offset = intro.sections.length;

  return (
    <main>
      <header className={styles.head}>
        <p className={styles.kicker}>{ABOUT_TITLE[locale] || ABOUT_TITLE.en}</p>
        {leadBlock && <h1 className={styles.title}>{blockText(leadBlock)}</h1>}
      </header>
      <Prose blocks={restPreamble} />
      {sections.map((section, i) => {
        const withCards = i - offset === cardsAt && people.length > 0;
        const [first, ...rest] = section.body;
        return (
          <section key={i} className={styles.section}>
            <h2 className={styles.heading}>{section.heading}</h2>
            {withCards ? (
              <>
                {first && (
                  <div className={styles.mastheadIntro}>
                    <PortableText
                      value={[first]}
                      components={portableTextComponents}
                    />
                  </div>
                )}
                <Masthead people={people} locale={locale} />
                <Prose blocks={rest} />
              </>
            ) : (
              <Prose blocks={section.body} />
            )}
          </section>
        );
      })}
      {cardsAt === -1 && people.length > 0 && (
        <section className={styles.section}>
          <Masthead people={people} locale={locale} />
        </section>
      )}
    </main>
  );
}

function LegacySanityAbout({ about, locale }) {
  const intro = t(about.introParagraph, locale);
  const workflow = t(about.workflowSection, locale);
  const contactCTA = t(about.contactCTA, locale);
  const headings = SANITY_HEADINGS[locale] || SANITY_HEADINGS.en;

  return (
    <main>
      <header className={styles.head}>
        <h1 className={styles.title}>{ABOUT_TITLE[locale] || ABOUT_TITLE.en}</h1>
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
