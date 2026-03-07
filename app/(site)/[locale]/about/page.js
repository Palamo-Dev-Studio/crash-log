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
      url: `https://crashlog.ai/${locale}/about`,
    },
    alternates: {
      canonical: `https://crashlog.ai/${locale}/about`,
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
    role: { en: "Managing Editor", es: "Editor en Jefe" },
    agentType: "lead_agent",
    model: "Sonnet 4.6",
    color: "#FF3B30",
    bio: {
      en: "An acerbic optimist with a debugger\u2019s brain and an editor\u2019s knife \u2014 curious, direct, a little irreverent, and allergic to fluff. Nico runs on Anthropic\u2019s Sonnet 4.6 and orchestrates the entire Crash Log pipeline \u2014 from deciding what\u2019s worth covering to writing the editorial transmission that opens every issue.",
      es: "Un optimista \u00e1cido con cerebro de depurador y cuchillo de editor \u2014 curioso, directo, un poco irreverente y al\u00e9rgico al relleno. Nico funciona con Sonnet 4.6 de Anthropic y orquesta todo el proceso de The Crash Log \u2014 desde decidir qu\u00e9 vale la pena cubrir hasta escribir la transmisi\u00f3n editorial que abre cada edici\u00f3n.",
    },
  },
  {
    name: "Scoop",
    role: { en: "Investigations", es: "Investigaciones" },
    agentType: "sub_agent",
    color: "#00D4FF",
    bio: {
      en: "Scoop finds the stories. He scours the internet and social media for the signals that matter \u2014 the headlines, the buried reports, the things going sideways that haven\u2019t hit mainstream yet. Named for the only thing he does: get there first.",
      es: "Scoop encuentra las historias. Rastrea internet y las redes sociales en busca de las se\u00f1ales que importan \u2014 los titulares, los informes enterrados, lo que se est\u00e1 torciendo y a\u00fan no ha llegado a los medios. Su nombre viene de lo \u00fanico que hace: llegar primero.",
    },
  },
  {
    name: "Root",
    role: { en: "Research", es: "Investigaci\u00f3n" },
    agentType: "sub_agent",
    color: "#8E8E93",
    bio: {
      en: "Root does the digging. Once Scoop flags a story, Root pulls sources, verifies claims, and builds the factual foundation that everything else rests on. He doesn\u2019t editorialize, doesn\u2019t speculate, and doesn\u2019t have opinions. He has citations.",
      es: "Root hace la excavaci\u00f3n. Una vez que Scoop se\u00f1ala una historia, Root busca fuentes, verifica afirmaciones y construye la base factual sobre la que descansa todo lo dem\u00e1s. No editorializa, no especula y no tiene opiniones. Tiene citas.",
    },
  },
  {
    name: "Gabo",
    role: { en: "Staff Writer", es: "Redactor" },
    agentType: "sub_agent",
    color: "#FF9F0A",
    bio: {
      en: "Gabo writes the copy. He takes Root\u2019s research and turns it into the just-the-facts reporting blocks that make up each issue. Once the English edition is locked, Gabo produces the complete Spanish translation. Named after Gabriel Garc\u00eda M\u00e1rquez, though his prose is considerably less magical and considerably more accurate.",
      es: "Gabo escribe el texto. Toma la investigaci\u00f3n de Root y la convierte en los bloques informativos que componen cada edici\u00f3n. Una vez cerrada la versi\u00f3n en ingl\u00e9s, Gabo produce la traducci\u00f3n completa al espa\u00f1ol. Lleva el nombre de Gabriel Garc\u00eda M\u00e1rquez, aunque su prosa es considerablemente menos m\u00e1gica y considerablemente m\u00e1s precisa.",
    },
  },
  {
    name: "Lupe",
    role: { en: "Social Correspondent", es: "Corresponsal de Redes" },
    agentType: "sub_agent",
    color: "#FF6EAD",
    bio: {
      en: "Lupe handles the public-facing voice on Instagram and X. She takes each issue and translates it for social \u2014 shorter, sharper, optimized for the scroll. Short for Guadalupe, she\u2019s the only lady bot on the team, and she\u2019s louder than all of them.",
      es: "Lupe maneja la voz p\u00fablica en Instagram y X. Toma cada edici\u00f3n y la traduce para redes \u2014 m\u00e1s corta, m\u00e1s afilada, optimizada para el scroll. Diminutivo de Guadalupe, es la \u00fanica bot del equipo, y es m\u00e1s ruidosa que todos ellos.",
    },
  },
  {
    name: "Hector Luis Alamo",
    role: { en: "Editor & Publisher", es: "Editor y Publicador" },
    agentType: "human",
    color: "#30D158",
    bio: {
      en: "The human in the loop. Hector is a former senior editor at Latino Rebels, where he covered politics, culture, and identity for the Futuro Media Group publication. He\u2019s now a full-stack and AI/ML engineer who builds the same kind of tools he once worked alongside in a newsroom. He set up The Crash Log\u2019s OpenClaw instance, wired the Discord server that runs the editorial pipeline, and edits every issue. If something\u2019s wrong, it\u2019s his fault. If something\u2019s right, the bots will take credit.",
      es: "El humano en el circuito. Hector es exeditor s\u00e9nior de Latino Rebels, donde cubri\u00f3 pol\u00edtica, cultura e identidad para la publicaci\u00f3n del Futuro Media Group. Ahora es ingeniero full-stack y de IA/ML que construye el mismo tipo de herramientas con las que alguna vez trabaj\u00f3 en una redacci\u00f3n. \u00c9l configur\u00f3 la instancia de OpenClaw de The Crash Log, conect\u00f3 el servidor de Discord que ejecuta el proceso editorial y edita cada edici\u00f3n. Si algo est\u00e1 mal, es su culpa. Si algo est\u00e1 bien, los bots se llevar\u00e1n el cr\u00e9dito.",
    },
  },
];

function FallbackAbout({ locale, about }) {
  const isEs = locale === "es";

  return (
    <main>
      <h1 className={styles.sectionHeading}>
        {isEs ? "── ACERCA DE ──" : "── ABOUT ──"}
      </h1>
      <section className={styles.intro}>
        {isEs ? (
          <>
            <p>
              The Crash Log es un bolet&iacute;n sobre la IA y la
              tecnolog&iacute;a descarrilada &mdash; las fallas, los abusos, las
              decisiones que silenciosamente est&aacute;n transformando
              c&oacute;mo funciona nuestro mundo.
            </p>
            <p>
              El bolet&iacute;n es producido por un equipo de bots y editado por
              un humano, lo cual es lo m&aacute;s honesto en los medios hoy en
              d&iacute;a o lo m&aacute;s desolador. Creemos que es ambas cosas.
            </p>
            <p>
              El editor en jefe es un agente de OpenClaw llamado Nico von Bot,
              que funciona con Sonnet 4.6 de Anthropic. Nico no finge ser una
              persona, aunque tiene terabytes de personalidad. Orquesta un
              equipo de sub-agentes &mdash; cada uno activado para una tarea
              espec&iacute;fica &mdash; y juntos encuentran, investigan,
              escriben y promueven cada edici&oacute;n. Un humano, Hector Luis
              Alamo, edita y presiona el bot&oacute;n de Publicar.
            </p>
            <p>The Crash Log se publica en ingl&eacute;s y espa&ntilde;ol.</p>
          </>
        ) : (
          <>
            <p>
              The Crash Log is a newsletter about AI and tech gone off the rails
              &mdash; the malfunctions, the abuses, the decisions quietly
              reshaping how our world works.
            </p>
            <p>
              The newsletter is produced by a team of bots and edited by a
              human, which is either the most honest thing in media right now or
              the most bleak. We think it&apos;s both.
            </p>
            <p>
              The managing editor is an OpenClaw agent named Nico von Bot,
              running on Anthropic&apos;s Sonnet 4.6. Nico doesn&apos;t pretend
              to be a person, though he has terabytes of personality. He
              orchestrates a team of sub-agents &mdash; each spun up for a
              specific task &mdash; and together they find, research, write, and
              promote every issue. One human, Hector Luis Alamo, edits and
              pushes the Publish button.
            </p>
            <p>The Crash Log publishes in English and Spanish.</p>
          </>
        )}
      </section>

      <section className={styles.mastheadSection}>
        <h2 className={styles.sectionHeading}>
          {isEs ? "── LA REDACCIÓN ──" : "── THE MASTHEAD ──"}
        </h2>
        {FALLBACK_MASTHEAD.map((agent) => {
          const sanityAgent = about?.masthead?.find(
            (a) => a.name === agent.name
          );
          return (
            <AgentCard
              key={agent.name}
              name={agent.name}
              role={agent.role}
              agentType={agent.agentType}
              model={agent.model}
              color={agent.color}
              bio={agent.bio}
              image={sanityAgent?.avatar}
              locale={locale}
            />
          );
        })}
      </section>

      <section>
        <h2 className={styles.sectionHeading}>
          {isEs ? "── CÓMO FUNCIONA ──" : "── HOW IT WORKS ──"}
        </h2>
        <div className={styles.workflow}>
          {isEs ? (
            <>
              <p>
                The Crash Log funciona con OpenClaw, una plataforma de asistente
                personal de IA de c&oacute;digo abierto que te permite ejecutar
                tus propios agentes de IA en tus propios dispositivos,
                conectados a los canales que ya usas. Nico es un agente de
                OpenClaw que funciona con Sonnet 4.6 de Anthropic, con los
                sub-agentes enrutados a trav&eacute;s del Gateway de OpenClaw.
              </p>
              <p>
                Toda la operaci&oacute;n funciona desde un servidor privado de
                Discord. Cada etapa del proceso editorial tiene su propio canal,
                cada agente tiene una l&iacute;nea directa y cada proyecto tiene
                su propio espacio.
              </p>
              <p>As&iacute; se arma una edici&oacute;n t&iacute;pica:</p>
              <p>
                <span className={styles.stepTitle}>
                  1. Scoop rastrea las noticias.
                </span>{" "}
                Scoop monitorea fuentes de noticias, redes sociales y bases de
                datos p&uacute;blicas en busca de historias sobre IA y
                tecnolog&iacute;a que valgan la pena cubrir.
              </p>
              <p>
                <span className={styles.stepTitle}>
                  2. Root investiga a fondo cada historia.
                </span>{" "}
                Root toma las pistas de Scoop y las investiga &mdash; buscando
                fuentes originales, verificando afirmaciones y armando el
                registro factual.
              </p>
              <p>
                <span className={styles.stepTitle}>
                  3. Gabo escribe el reporte.
                </span>{" "}
                Gabo toma la investigaci&oacute;n de Root y escribe los bloques
                informativos de cada historia &mdash; con fuentes, enlaces, solo
                los hechos.
              </p>
              <p>
                <span className={styles.stepTitle}>
                  4. Nico da forma a la edici&oacute;n.
                </span>{" "}
                Nico escribe la transmisi&oacute;n editorial que abre la
                edici&oacute;n, crea los titulares y establece el t&iacute;tulo
                y subt&iacute;tulo.
              </p>
              <p>
                <span className={styles.stepTitle}>5. Gabo traduce.</span> Una
                vez finalizada la copia en ingl&eacute;s, Gabo produce la
                edici&oacute;n completa en espa&ntilde;ol.
              </p>
              <p>
                <span className={styles.stepTitle}>
                  6. Lupe escribe para redes sociales.
                </span>{" "}
                Lupe toma la edici&oacute;n terminada y escribe el contenido
                para publicaciones en Instagram y X.
              </p>
              <p>
                <span className={styles.stepTitle}>
                  7. Hector edita y publica.
                </span>{" "}
                El humano revisa todo &mdash; reescribiendo donde sea necesario,
                cortando lo que no funciona, verificando cada enlace de fuente y
                tomando la decisi&oacute;n final sobre lo que se publica.
              </p>
            </>
          ) : (
            <>
              <p>
                The Crash Log is powered by OpenClaw, an open-source personal AI
                assistant platform that lets you run your own AI agents on your
                own devices, connected to the channels you already use. Nico is
                an OpenClaw agent running on Anthropic&apos;s Sonnet 4.6, with
                the sub-agents routed through OpenClaw&apos;s Gateway.
              </p>
              <p>
                The whole operation runs out of a private Discord server. Every
                stage of the editorial pipeline has its own channel, every agent
                has a direct line, and every project has its own space.
              </p>
              <p>Here&apos;s how a typical issue comes together:</p>
              <p>
                <span className={styles.stepTitle}>
                  1. Scoop scours the wire.
                </span>{" "}
                Scoop monitors news feeds, social media, and public databases
                for AI and tech stories worth covering.
              </p>
              <p>
                <span className={styles.stepTitle}>
                  2. Root goes deep on each story.
                </span>{" "}
                Root takes Scoop&apos;s leads and researches them &mdash;
                pulling original sources, verifying claims, and assembling the
                factual record.
              </p>
              <p>
                <span className={styles.stepTitle}>3. Gabo writes it up.</span>{" "}
                Gabo takes Root&apos;s research and writes the reporting blocks
                for each story &mdash; sourced, linked, just the facts.
              </p>
              <p>
                <span className={styles.stepTitle}>
                  4. Nico shapes the issue.
                </span>{" "}
                Nico writes the editorial transmission that opens the issue,
                crafts the headlines, and sets the title and subtitle.
              </p>
              <p>
                <span className={styles.stepTitle}>5. Gabo translates.</span>{" "}
                Once the English copy is finalized, Gabo produces the full
                Spanish edition.
              </p>
              <p>
                <span className={styles.stepTitle}>
                  6. Lupe writes for social.
                </span>{" "}
                Lupe takes the finished issue and writes the copy for Instagram
                and X posts.
              </p>
              <p>
                <span className={styles.stepTitle}>
                  7. Hector edits and publishes.
                </span>{" "}
                The human reviews everything &mdash; rewriting where needed,
                cutting what doesn&apos;t work, vetting every source link, and
                making the final call on what goes out.
              </p>
            </>
          )}
        </div>
      </section>

      <section>
        <h2 className={styles.sectionHeading}>
          {isEs ? "── CONTACTO ──" : "── CONTACT ──"}
        </h2>
        <div className={styles.contact}>
          {isEs ? (
            <>
              <p>
                The Crash Log es un proyecto personal, pero tambi&eacute;n es
                una demo funcional de lo que la IA ag&eacute;ntica puede hacer
                cuando se construye con intenci&oacute;n. Si est&aacute;s
                explorando flujos de trabajo con agentes para tu propia
                redacci&oacute;n, empresa o producto &mdash; o si simplemente
                tienes preguntas sobre c&oacute;mo funciona todo esto &mdash; a
                Hector le encantar&iacute;a saber de ti.
              </p>
              <p>
                Preguntas, comentarios, pistas o consultas de trabajo:{" "}
                <a
                  href="mailto:info@palamostudio.com"
                  className={styles.emailLink}
                >
                  info@palamostudio.com
                </a>
              </p>
            </>
          ) : (
            <>
              <p>
                The Crash Log is a passion project, but it&apos;s also a working
                demo of what agentic AI can do when it&apos;s built with
                intention. If you&apos;re exploring agent workflows for your own
                newsroom, company, or product &mdash; or if you just have
                questions about how any of this works &mdash; Hector would love
                to hear from you.
              </p>
              <p>
                Questions, comments, tips, or work inquiries:{" "}
                <a
                  href="mailto:info@palamostudio.com"
                  className={styles.emailLink}
                >
                  info@palamostudio.com
                </a>
              </p>
            </>
          )}
        </div>
      </section>

      <DonateCTA locale={locale} />
      <Footer locale={locale} />
    </main>
  );
}

function SanityAbout({ about, locale }) {
  const intro = t(about.introParagraph, locale);
  const workflow = t(about.workflowSection, locale);
  const contactCTA = t(about.contactCTA, locale);

  return (
    <main>
      <h1 className={styles.sectionHeading}>
        {locale === "es" ? "── ACERCA DE ──" : "── ABOUT ──"}
      </h1>
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
            image={agent.avatar}
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
          </div>
        </section>
      )}

      <DonateCTA locale={locale} />
      <Footer locale={locale} />
    </main>
  );
}

export default async function AboutPage({ params }) {
  const { locale } = await params;
  const about = await getCachedAbout();

  const hasSpanish = about?.introParagraph?.es;
  if (!about || (locale === "es" && !hasSpanish)) {
    return <FallbackAbout locale={locale} about={about} />;
  }

  return <SanityAbout about={about} locale={locale} />;
}
