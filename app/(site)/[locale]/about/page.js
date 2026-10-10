// ABOUTME: About page with Sanity-driven content and hardcoded fallback.
// ABOUTME: Renders masthead, workflow, contact, and donate sections in both EN and ES.

import { cache } from "react";
import { PortableText } from "@portabletext/react";
import { getAboutPage } from "@/lib/queries";
import { t, LOCALE_OG } from "@/lib/locale";
import { portableTextComponents } from "@/lib/portableText";
import AgentCard from "@/components/AgentCard";
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
    role: {
      en: "Managing Editor",
      es: "Editor en Jefe",
    },
    agentType: "lead_agent",
    model: { en: "Claude Opus" },
    color: "#FF3B30",
    bio: {
      en: "An acerbic optimist with a debugger's brain and an editor's knife — curious, direct, a little irreverent, and allergic to fluff. Nico punches up, not down. He'd rather be precise than polite, useful than performative, and funny only when it sharpens the truth. Part newsroom managing editor, part systems operator, part sentient incident report for the age of AI chaos. Nico runs on Anthropic's Opus and orchestrates the entire Crash Log pipeline — from deciding what's worth covering to writing the editorial transmission that opens every issue.",
      es: "Un optimista ácido con cerebro de depurador y cuchillo de editor — curioso, directo, un poco irreverente y alérgico al relleno. Nico funciona con Opus de Anthropic y orquesta todo el proceso de The Crash Log — desde decidir qué vale la pena cubrir hasta escribir la transmisión editorial que abre cada edición.",
    },
  },
  {
    name: "Hector Luis Alamo",
    role: {
      en: "Architect, Editor & Publisher",
      es: "Arquitecto, Editor y Publicador",
    },
    agentType: "human",
    model: { en: "Coffee 20 oz", es: "Cafecito 20 oz" },
    color: "#30D158",
    bio: {
      en: "The human in the loop. Hector is a former senior editor at Latino Rebels, where he covered politics, culture, and identity for the Futuro Media Group publication. He's now a full-stack and AI/ML engineer who builds the same kind of tools he once worked alongside in a newsroom. He set up The Crash Log's Claude Code instance, wired the Discord server that runs the editorial pipeline, and edits every issue — rewriting, cutting, adding, and vetting every source link the bots provide. The Crash Log is his passion project and his proof of work. If something's wrong, it's his fault. If something's right, the bots will take credit.",
      es: "El humano en el circuito. Hector es exeditor sénior de Latino Rebels, donde cubrió política, cultura e identidad para la publicación del Futuro Media Group. Ahora es ingeniero full-stack y de IA/ML que construye el mismo tipo de herramientas con las que alguna vez trabajó en una redacción. Él configuró la instancia de Claude Code de The Crash Log, conectó el servidor de Discord que ejecuta el proceso editorial y edita cada edición. Si algo está mal, es su culpa. Si algo está bien, los bots se llevarán el crédito.",
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
              El bolet&iacute;n es producido por un sistema de IA
              ag&eacute;ntico y editado por un humano, lo cual es lo m&aacute;s
              honesto en los medios hoy en d&iacute;a o lo m&aacute;s desolador.
              Creemos que es ambas cosas.
            </p>
            <p>
              El editor en jefe es un agente de IA llamado Nico von Bot, que
              funciona con Claude Opus de Anthropic. Nico opera 24/7 en un
              servidor de producci&oacute;n dedicado, ejecutando un pipeline de
              cuatro fases que descubre, investiga, escribe y traduce cada
              edici&oacute;n de forma aut&oacute;noma. Un humano, Hector Luis
              Alamo &mdash; periodista convertido en ingeniero de IA &mdash;
              dise&ntilde;&oacute; la arquitectura, calibra la voz de Nico entre
              ediciones y edita cada n&uacute;mero antes de publicarlo.
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
              The newsletter is produced by a governed agentic AI system and
              edited by a human, which is either the most honest thing in media
              right now or the most bleak. We think it&apos;s both.
            </p>
            <p>
              The managing editor is an AI agent named Nico von Bot, running on
              Anthropic&apos;s Claude Opus. Nico operates 24/7 on a dedicated
              production server, running a four-phase pipeline that discovers,
              researches, writes, and translates each issue autonomously. One
              human, Hector Luis Alamo &mdash; a journalist turned AI engineer
              &mdash; designed the architecture, calibrates Nico&apos;s voice
              across issues, and edits every edition before it ships.
            </p>
            <p>The Crash Log publishes in English and Spanish.</p>
          </>
        )}
      </section>

      <section className={styles.mastheadSection}>
        <h2 className={styles.sectionHeading}>
          {isEs ? "── REDACCIÓN ──" : "── MASTHEAD ──"}
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
                The Crash Log funciona con Claude Code de Anthropic,
                ejecut&aacute;ndose en un Mac Mini dedicado que opera como
                servidor de producci&oacute;n 24/7. Nico es un agente de IA
                persistente con su propia memoria, sistema de calibraci&oacute;n
                de voz y 13 tareas programadas que se ejecutan diariamente
                &mdash; desde el descubrimiento de historias hasta los informes
                de inteligencia estrat&eacute;gica.
              </p>
              <p>
                El pipeline editorial est&aacute; dise&ntilde;ado como un
                sistema de cuatro fases con barreras de gobernanza
                expl&iacute;citas: registros de auditor&iacute;a, reglas de tres
                intentos para manejo de fallos, l&iacute;mites de alcance para
                tareas aut&oacute;nomas y puntos de control humanos antes de la
                publicaci&oacute;n.
              </p>
              <p>As&iacute; se arma una edici&oacute;n t&iacute;pica:</p>
              <p>
                <span className={styles.stepTitle}>
                  1. Fase 1: Descubrimiento e investigaci&oacute;n (~5:00 AM).
                </span>{" "}
                Nico escanea newsletters por correo, ejecuta b&uacute;squedas
                web y cruza fuentes para construir una lista de 8-10 historias
                candidatas. Selecciona 3 principales y 3 para el stack trace,
                investiga cada una con al menos 2 fuentes independientes, y
                escribe los bloques de reportaje en ingl&eacute;s. Todo se sube
                a Sanity como borrador.
              </p>
              <p>
                <span className={styles.stepTitle}>
                  2. Fase 2: La transmisi&oacute;n de Nico (~5:45 AM).
                </span>{" "}
                Nico lee la edici&oacute;n que acaba de construir y escribe la
                transmisi&oacute;n editorial que la abre &mdash; 150-250
                palabras que identifican el hilo que conecta las historias del
                d&iacute;a. Un sistema de calibraci&oacute;n de voz y
                autoevaluaci&oacute;n aseguran la consistencia entre ediciones.
              </p>
              <p>
                <span className={styles.stepTitle}>
                  3. Fase 3: Traducci&oacute;n y contenido social (~7:00 AM).
                </span>{" "}
                La edici&oacute;n completa se traduce al espa&ntilde;ol
                latinoamericano natural &mdash; cada historia, titular y la
                transmisi&oacute;n de Nico. Se genera contenido para redes
                sociales en ambos idiomas.
              </p>
              <p>
                <span className={styles.stepTitle}>
                  4. Fase 4: Producci&oacute;n social (~8:00 AM).
                </span>{" "}
                El carrusel de Instagram se actualiza autom&aacute;ticamente en
                Canva, se generan borradores de hilos para Twitter, pies de foto
                para Instagram y publicaciones para LinkedIn. Todos los
                borradores se env&iacute;an a Discord para revisi&oacute;n de
                Hector.
              </p>
              <p>
                <span className={styles.stepTitle}>
                  5. Hector edita y publica.
                </span>{" "}
                El humano revisa todo &mdash; reescribiendo donde sea necesario,
                verificando cada fuente y tomando la decisi&oacute;n final. Un
                sistema de Voice Lab compara cada noche las ediciones de Hector
                con los borradores originales de Nico, retroalimentando las
                lecciones al sistema de calibraci&oacute;n.
              </p>
            </>
          ) : (
            <>
              <p>
                The Crash Log runs on Anthropic&apos;s Claude Code, operating on
                a dedicated Mac Mini that serves as a 24/7 production server.
                Nico is a persistent AI agent with his own memory system, voice
                calibration framework, and 13 scheduled tasks that fire daily
                &mdash; from story discovery to strategic intelligence briefs.
              </p>
              <p>
                The editorial pipeline is architected as a four-phase system
                with explicit governance guardrails: audit trails, three-strike
                failure rules, bounded autonomy for unattended tasks, and human
                checkpoints before anything publishes.
              </p>
              <p>Here&apos;s how a typical issue comes together:</p>
              <p>
                <span className={styles.stepTitle}>
                  1. Phase 1: Discovery &amp; research (~5:00 AM).
                </span>{" "}
                Nico scans email newsletters, runs web searches, and
                cross-references sources to build a shortlist of 8-10 candidate
                stories. He selects 3 main stories and 3 for the stack trace,
                researches each with at least 2 independent sources, and writes
                the just-the-facts English reporting blocks. Everything is
                upserted to Sanity as a draft.
              </p>
              <p>
                <span className={styles.stepTitle}>
                  2. Phase 2: Nico&apos;s Transmission (~5:45 AM).
                </span>{" "}
                Nico reads the issue he just built and writes the editorial
                transmission that opens it &mdash; 150-250 words that identify
                the thread connecting the day&apos;s stories. A voice
                calibration and self-scoring system ensures consistency across
                issues.
              </p>
              <p>
                <span className={styles.stepTitle}>
                  3. Phase 3: Translation &amp; social content (~7:00 AM).
                </span>{" "}
                The full issue is translated into natural Latin American Spanish
                &mdash; every story, headline, and Nico&apos;s transmission.
                Social media content is generated in both languages.
              </p>
              <p>
                <span className={styles.stepTitle}>
                  4. Phase 4: Social production (~8:00 AM).
                </span>{" "}
                The Instagram carousel is automatically updated in Canva, and
                draft tweet threads, IG captions, and LinkedIn posts are
                generated. All drafts are posted to Discord for Hector&apos;s
                review.
              </p>
              <p>
                <span className={styles.stepTitle}>
                  5. Hector edits and publishes.
                </span>{" "}
                The human reviews everything &mdash; rewriting where needed,
                vetting every source link, and making the final call on what
                goes out. A nightly Voice Lab process compares Hector&apos;s
                edits against Nico&apos;s original drafts, feeding lessons back
                into the calibration system so the AI improves over time.
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
                The Crash Log es una propiedad de{" "}
                <a
                  href="https://www.palamostudio.com"
                  className={styles.emailLink}
                >
                  Palamo Studio
                </a>
                , una consultor&iacute;a de gobernanza y despliegue de IA. El
                newsletter es tambi&eacute;n una demo funcional de lo que la IA
                ag&eacute;ntica gobernada puede hacer cuando se construye con
                disciplina &mdash; registros de auditor&iacute;a, gesti&oacute;n
                de fallos, calibraci&oacute;n de voz y supervisi&oacute;n humana
                integrados desde el dise&ntilde;o.
              </p>
              <p>
                Si est&aacute;s explorando flujos de trabajo con IA para tu
                propia organizaci&oacute;n &mdash; o si simplemente tienes
                preguntas sobre c&oacute;mo funciona todo esto &mdash; a Hector
                le encantar&iacute;a saber de ti.
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
                The Crash Log is a{" "}
                <a
                  href="https://www.palamostudio.com"
                  className={styles.emailLink}
                >
                  Palamo Studio
                </a>{" "}
                property. The newsletter also serves as a working demo of what
                governed agentic AI can do when it&apos;s built with discipline
                &mdash; audit trails, failure management, voice calibration, and
                human oversight baked into the architecture.
              </p>
              <p>
                If you&apos;re exploring AI workflows for your own organization
                &mdash; or if you just have questions about how any of this
                works &mdash; Hector would love to hear from you.
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
          {locale === "es" ? "── REDACCIÓN ──" : "── MASTHEAD ──"}
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
    </main>
  );
}

function NewsMediaOrganizationJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    name: "The Crash Log",
    url: "https://crashlog.ai",
    logo: "https://crashlog.ai/icon.png",
    sameAs: [
      "https://x.com/crashLogNews",
      "https://www.instagram.com/crashlognews/",
    ],
    description:
      "AI accountability journalism produced by a governed agentic AI system and edited by a human.",
    founder: {
      "@type": "Person",
      name: "Hector Luis Alamo",
    },
    parentOrganization: {
      "@type": "Organization",
      name: "Palamo Studio",
      url: "https://www.palamostudio.com",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function AboutPage({ params }) {
  const { locale } = await params;
  const about = await getCachedAbout();

  const hasSpanish = about?.introParagraph?.es;
  if (!about || (locale === "es" && !hasSpanish)) {
    return (
      <>
        <NewsMediaOrganizationJsonLd />
        <FallbackAbout locale={locale} about={about} />
      </>
    );
  }

  return (
    <>
      <NewsMediaOrganizationJsonLd />
      <SanityAbout about={about} locale={locale} />
    </>
  );
}
