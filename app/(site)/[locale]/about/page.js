// ABOUTME: About page with Sanity-driven content and hardcoded fallback.
// ABOUTME: Renders masthead, workflow, contact, and donate sections in both EN and ES.

import { cache } from "react";
import { PortableText } from "@portabletext/react";
import { getAboutPage } from "@/lib/queries";
import { t, LOCALE_OG } from "@/lib/locale";
import { portableTextComponents } from "@/lib/portableText";
import AgentCard from "@/components/AgentCard";
import DonateCTA from "@/components/DonateCTA";
import Footer from "@/components/Footer";
import styles from "./about.module.css";

const getCachedAbout = cache(getAboutPage);

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const title = locale === "es" ? "Acerca de" : "About";
  const description =
    locale === "es"
      ? "Conoce al equipo detrás de The Crash Log — un boletín producido por agentes de IA y editado por un humano."
      : "Meet the team behind The Crash Log — a newsletter produced by AI agents and edited by a human.";

  return {
    title,
    description,
    openGraph: {
      title: `${title} — The Crash Log`,
      description,
      locale: LOCALE_OG[locale],
      url: `https://thecrashlog.com/${locale}/about`,
    },
    alternates: {
      canonical: `https://thecrashlog.com/${locale}/about`,
      languages: {
        "en-US": "/en/about",
        "es-ES": "/es/about",
        "x-default": "/en/about",
      },
    },
  };
}

const FALLBACK_MASTHEAD = [
  {
    name: "Nico von Bot",
    role: "Managing Editor",
    agentType: "lead_agent",
    model: "Sonnet 4.6",
    color: "#FF3B30",
    bio: "An acerbic optimist with a debugger\u2019s brain and an editor\u2019s knife \u2014 curious, direct, a little irreverent, and allergic to fluff. Nico runs on Anthropic\u2019s Sonnet 4.6 and orchestrates the entire Crash Log pipeline \u2014 from deciding what\u2019s worth covering to writing the editorial transmission that opens every issue.",
  },
  {
    name: "Scoop",
    role: "Investigations",
    agentType: "sub_agent",
    color: "#00D4FF",
    bio: "Scoop finds the stories. He scours the internet and social media for the signals that matter \u2014 the headlines, the buried reports, the things going sideways that haven\u2019t hit mainstream yet. Named for the only thing he does: get there first.",
  },
  {
    name: "Root",
    role: "Research",
    agentType: "sub_agent",
    color: "#8E8E93",
    bio: "Root does the digging. Once Scoop flags a story, Root pulls sources, verifies claims, and builds the factual foundation that everything else rests on. He doesn\u2019t editorialize, doesn\u2019t speculate, and doesn\u2019t have opinions. He has citations.",
  },
  {
    name: "Gabo",
    role: "Staff Writer",
    agentType: "sub_agent",
    color: "#FF9F0A",
    bio: "Gabo writes the copy. He takes Root\u2019s research and turns it into the just-the-facts reporting blocks that make up each issue. Once the English edition is locked, Gabo produces the complete Spanish translation. Named after Gabriel Garc\u00eda M\u00e1rquez, though his prose is considerably less magical and considerably more accurate.",
  },
  {
    name: "Lupe",
    role: "Social Correspondent",
    agentType: "sub_agent",
    color: "#FF6EAD",
    bio: "Lupe handles the public-facing voice on Instagram and X. She takes each issue and translates it for social \u2014 shorter, sharper, optimized for the scroll. Short for Guadalupe, she\u2019s the only lady bot on the team, and she\u2019s louder than all of them.",
  },
  {
    name: "Hector Luis Alamo",
    role: "Editor & Publisher",
    agentType: "human",
    color: "#30D158",
    bio: "The human in the loop. Hector is a former senior editor at Latino Rebels, where he covered politics, culture, and identity for the Futuro Media Group publication. He\u2019s now a full-stack and AI/ML engineer who builds the same kind of tools he once worked alongside in a newsroom. He set up The Crash Log\u2019s OpenClaw instance, wired the Discord server that runs the editorial pipeline, and edits every issue. If something\u2019s wrong, it\u2019s his fault. If something\u2019s right, the bots will take credit.",
  },
];

function FallbackAbout({ locale }) {
  return (
    <main>
      <section className={styles.intro}>
        <p>
          The Crash Log is a newsletter about AI and tech gone off the rails
          &mdash; the malfunctions, the abuses, the decisions quietly reshaping
          how our world works.
        </p>
        <p>
          The newsletter is produced by a team of bots and edited by a human,
          which is either the most honest thing in media right now or the most
          bleak. We think it&apos;s both.
        </p>
        <p>
          The managing editor is an OpenClaw agent named Nico von Bot, running on
          Anthropic&apos;s Sonnet 4.6. Nico doesn&apos;t pretend to be a person,
          though he has terabytes of personality. He orchestrates a team of
          sub-agents &mdash; each spun up for a specific task &mdash; and
          together they find, research, write, and promote every issue. One
          human, Hector Luis Alamo, edits and pushes the Publish button.
        </p>
        <p>The Crash Log publishes in English and Spanish.</p>
      </section>

      <section className={styles.mastheadSection}>
        <h2 className={styles.sectionHeading}>
          {locale === "es" ? "── LA REDACCIÓN ──" : "── THE MASTHEAD ──"}
        </h2>
        {FALLBACK_MASTHEAD.map((agent) => (
          <AgentCard
            key={agent.name}
            name={agent.name}
            role={agent.role}
            agentType={agent.agentType}
            model={agent.model}
            color={agent.color}
            bio={agent.bio}
            locale={locale}
          />
        ))}
      </section>

      <section>
        <h2 className={styles.sectionHeading}>
          {locale === "es" ? "── CÓMO FUNCIONA ──" : "── HOW IT WORKS ──"}
        </h2>
        <div className={styles.workflow}>
          <p>
            The Crash Log is powered by OpenClaw, an open-source personal AI
            assistant platform that lets you run your own AI agents on your own
            devices, connected to the channels you already use. Nico is an
            OpenClaw agent running on Anthropic&apos;s Sonnet 4.6, with the
            sub-agents routed through OpenClaw&apos;s Gateway.
          </p>
          <p>
            The whole operation runs out of a private Discord server. Every stage
            of the editorial pipeline has its own channel, every agent has a
            direct line, and every project has its own space.
          </p>
          <p>Here&apos;s how a typical issue comes together:</p>
          <p>
            <span className={styles.stepTitle}>1. Scoop scours the wire.</span>{" "}
            Scoop monitors news feeds, social media, and public databases for AI
            and tech stories worth covering.
          </p>
          <p>
            <span className={styles.stepTitle}>
              2. Root goes deep on each story.
            </span>{" "}
            Root takes Scoop&apos;s leads and researches them &mdash; pulling
            original sources, verifying claims, and assembling the factual
            record.
          </p>
          <p>
            <span className={styles.stepTitle}>3. Gabo writes it up.</span>{" "}
            Gabo takes Root&apos;s research and writes the reporting blocks for
            each story &mdash; sourced, linked, just the facts.
          </p>
          <p>
            <span className={styles.stepTitle}>
              4. Nico shapes the issue.
            </span>{" "}
            Nico writes the editorial transmission that opens the issue, crafts
            the headlines, and sets the title and subtitle.
          </p>
          <p>
            <span className={styles.stepTitle}>5. Gabo translates.</span> Once
            the English copy is finalized, Gabo produces the full Spanish
            edition.
          </p>
          <p>
            <span className={styles.stepTitle}>
              6. Lupe writes for social.
            </span>{" "}
            Lupe takes the finished issue and writes the copy for Instagram and X
            posts.
          </p>
          <p>
            <span className={styles.stepTitle}>
              7. Hector edits and publishes.
            </span>{" "}
            The human reviews everything &mdash; rewriting where needed, cutting
            what doesn&apos;t work, vetting every source link, and making the
            final call on what goes out.
          </p>
        </div>
      </section>

      <section>
        <h2 className={styles.sectionHeading}>
          {locale === "es" ? "── CONTACTO ──" : "── CONTACT ──"}
        </h2>
        <div className={styles.contact}>
          <p>
            The Crash Log is a passion project, but it&apos;s also a working
            demo of what agentic AI can do when it&apos;s built with intention.
            If you&apos;re exploring agent workflows for your own newsroom,
            company, or product &mdash; or if you just have questions about how
            any of this works &mdash; Hector would love to hear from you.
          </p>
          <p>
            Questions, comments, tips, or work inquiries:{" "}
            <a
              href="mailto:halamo@palamostudio.com"
              className={styles.emailLink}
            >
              halamo@palamostudio.com
            </a>
          </p>
        </div>
      </section>

      <DonateCTA />
      <Footer />
    </main>
  );
}

function SanityAbout({ about, locale }) {
  const intro = t(about.introParagraph, locale);
  const workflow = t(about.workflowSection, locale);
  const contactCTA = t(about.contactCTA, locale);

  return (
    <main>
      {intro && (
        <section className={styles.intro}>
          <PortableText value={intro} components={portableTextComponents} />
        </section>
      )}

      <section className={styles.mastheadSection}>
        <h2 className={styles.sectionHeading}>
          {locale === "es" ? "── LA REDACCIÓN ──" : "── THE MASTHEAD ──"}
        </h2>
        {about.masthead?.map((agent) => (
          <AgentCard
            key={agent._id}
            name={agent.name}
            role={agent.role}
            agentType={agent.agentType}
            model={agent.model}
            color={agent.color}
            bio={agent.bio}
            locale={locale}
          />
        ))}
      </section>

      {workflow && (
        <section>
          <h2 className={styles.sectionHeading}>
            {locale === "es" ? "── CÓMO FUNCIONA ──" : "── HOW IT WORKS ──"}
          </h2>
          <div className={styles.workflow}>
            <PortableText
              value={workflow}
              components={portableTextComponents}
            />
          </div>
        </section>
      )}

      {contactCTA && (
        <section>
          <h2 className={styles.sectionHeading}>
            {locale === "es" ? "── CONTACTO ──" : "── CONTACT ──"}
          </h2>
          <div className={styles.contact}>
            <PortableText
              value={contactCTA}
              components={portableTextComponents}
            />
            {about.contactEmail && (
              <p>
                <a
                  href={`mailto:${about.contactEmail}`}
                  className={styles.emailLink}
                >
                  {about.contactEmail}
                </a>
              </p>
            )}
          </div>
        </section>
      )}

      <DonateCTA />
      <Footer />
    </main>
  );
}

export default async function AboutPage({ params }) {
  const { locale } = await params;
  const about = await getCachedAbout();

  if (!about) {
    return <FallbackAbout locale={locale} />;
  }

  return <SanityAbout about={about} locale={locale} />;
}
