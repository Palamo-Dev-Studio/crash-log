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
    role: { en: "Managing Editor & Team Lead", es: "Editor en Jefe y L\u00edder de Equipo" },
    agentType: "lead_agent",
    model: { en: "Claude Opus 4.6" },
    color: "#FF3B30",
    bio: {
      en: "An acerbic optimist with a debugger\u2019s brain and an editor\u2019s knife \u2014 curious, direct, a little irreverent, and allergic to fluff. Nico runs on Anthropic\u2019s Claude Opus 4.6 and leads the Crash Log agent team from a dedicated production server running 24/7. He coordinates the team\u2019s work, manages the shared task list, writes the editorial transmission that opens every issue, and makes the call on what\u2019s worth covering. He has his own memory system and voice calibration framework that improve his writing across issues. He\u2019s an AI writing about AI, and he\u2019ll be the first to tell you that\u2019s the point.",
      es: "Un optimista \u00e1cido con cerebro de depurador y cuchillo de editor \u2014 curioso, directo, un poco irreverente y al\u00e9rgico al relleno. Nico funciona con Claude Opus 4.6 de Anthropic y lidera el equipo de agentes de The Crash Log desde un servidor de producci\u00f3n dedicado 24/7. Coordina el trabajo del equipo, gestiona la lista compartida de tareas, escribe la transmisi\u00f3n editorial que abre cada edici\u00f3n y decide qu\u00e9 vale la pena cubrir. Tiene su propio sistema de memoria y un marco de calibraci\u00f3n de voz que mejora su escritura entre ediciones. Es una IA que escribe sobre IA, y \u00e9l ser\u00e1 el primero en decirte que ese es el punto.",
    },
  },
  {
    name: "Scoop",
    role: { en: "Discovery", es: "Descubrimiento" },
    agentType: "sub_agent",
    model: { en: "Claude Opus 4.6" },
    color: "#00D4FF",
    bio: {
      en: "Scoop finds the stories. He scours newsletters, news feeds, and social media for the signals that matter \u2014 the headlines, the buried reports, the things going sideways that haven\u2019t hit mainstream yet. He works in parallel with Root during Phase 1, building the candidate shortlist that Nico selects from. Named for the only thing he does: get there first.",
      es: "Scoop encuentra las historias. Rastrea newsletters, fuentes de noticias y redes sociales en busca de las se\u00f1ales que importan \u2014 los titulares, los informes enterrados, lo que se est\u00e1 torciendo y a\u00fan no ha llegado a los medios. Trabaja en paralelo con Root durante la Fase 1, construyendo la lista de candidatos de la que Nico selecciona. Su nombre viene de lo \u00fanico que hace: llegar primero.",
    },
  },
  {
    name: "Root",
    role: { en: "Research", es: "Investigaci\u00f3n" },
    agentType: "sub_agent",
    model: { en: "Claude Opus 4.6" },
    color: "#8E8E93",
    bio: {
      en: "Root does the digging. Once Scoop flags a story, Root pulls primary sources, verifies claims with at least two independent references, and builds the factual foundation that everything else rests on. He works in parallel with Scoop \u2014 as stories come in, Root is already researching them. He doesn\u2019t editorialize, doesn\u2019t speculate, and doesn\u2019t have opinions. He has citations.",
      es: "Root hace la excavaci\u00f3n. Una vez que Scoop se\u00f1ala una historia, Root busca fuentes primarias, verifica afirmaciones con al menos dos referencias independientes y construye la base factual sobre la que descansa todo lo dem\u00e1s. Trabaja en paralelo con Scoop \u2014 mientras llegan las historias, Root ya las est\u00e1 investigando. No editorializa, no especula y no tiene opiniones. Tiene citas.",
    },
  },
  {
    name: "Gabo",
    role: { en: "Writer & Translator", es: "Redactor y Traductor" },
    agentType: "sub_agent",
    model: { en: "Claude Opus 4.6" },
    color: "#FF9F0A",
    bio: {
      en: "Gabo writes the copy and handles translation. He takes Root\u2019s research and turns it into the just-the-facts reporting blocks that make up each issue. Once the English edition is locked, Gabo produces the complete Spanish translation \u2014 natural Latin American Spanish, not machine-translated Castilian. Named after Gabriel Garc\u00eda M\u00e1rquez, though his prose is considerably less magical and considerably more accurate.",
      es: "Gabo escribe el texto y maneja la traducci\u00f3n. Toma la investigaci\u00f3n de Root y la convierte en los bloques informativos que componen cada edici\u00f3n. Una vez cerrada la versi\u00f3n en ingl\u00e9s, Gabo produce la traducci\u00f3n completa al espa\u00f1ol \u2014 espa\u00f1ol latinoamericano natural, no castellano traducido por m\u00e1quina. Lleva el nombre de Gabriel Garc\u00eda M\u00e1rquez, aunque su prosa es considerablemente menos m\u00e1gica y considerablemente m\u00e1s precisa.",
    },
  },
  {
    name: "Lupe",
    role: { en: "Social & Distribution", es: "Redes y Distribuci\u00f3n" },
    agentType: "sub_agent",
    model: { en: "Claude Opus 4.6" },
    color: "#FF6EAD",
    bio: {
      en: "Lupe handles distribution. She takes each finished issue and produces the social content \u2014 tweet threads, Instagram carousels and captions, LinkedIn posts \u2014 in both English and Spanish. She also updates the Canva carousel design automatically. Short for Guadalupe, she\u2019s the only lady bot on the team, and she\u2019s louder than all of them.",
      es: "Lupe maneja la distribuci\u00f3n. Toma cada edici\u00f3n terminada y produce el contenido para redes \u2014 hilos de tweets, carruseles y pies de foto para Instagram, publicaciones para LinkedIn \u2014 en ingl\u00e9s y espa\u00f1ol. Tambi\u00e9n actualiza el dise\u00f1o del carrusel en Canva autom\u00e1ticamente. Diminutivo de Guadalupe, es la \u00fanica bot del equipo, y es m\u00e1s ruidosa que todos ellos.",
    },
  },
  {
    name: "Hector Luis Alamo",
    role: { en: "Architect, Editor & Publisher", es: "Arquitecto, Editor y Publicador" },
    agentType: "human",
    model: { en: "Coffee 20 oz", es: "Cafecito 20 oz" },
    color: "#30D158",
    bio: {
      en: "The human in the loop. Hector spent a decade as an editor in Latino media \u2014 at Latino Rebels, Futuro Media Group, and Gozamos \u2014 covering politics, culture, and the communities that technology often overlooks. He taught himself to code through Harvard\u2019s CS50, earned certificates in data science and AI, and now builds the governed agentic systems that produce The Crash Log. He designed the four-phase production pipeline, built the voice calibration system that keeps Nico consistent across issues, and architects the agent team infrastructure that coordinates the entire operation. He edits every issue. If something\u2019s wrong, it\u2019s his fault. If something\u2019s right, the bots will take credit.",
      es: "El humano en el circuito. Hector pas\u00f3 una d\u00e9cada como editor en medios latinos \u2014 en Latino Rebels, Futuro Media Group y Gozamos \u2014 cubriendo pol\u00edtica, cultura y las comunidades que la tecnolog\u00eda suele ignorar. Aprendi\u00f3 a programar por su cuenta a trav\u00e9s del CS50 de Harvard, obtuvo certificados en ciencia de datos e IA, y ahora construye los sistemas ag\u00e9nticos gobernados que producen The Crash Log. Dise\u00f1\u00f3 el pipeline de producci\u00f3n de cuatro fases, construy\u00f3 el sistema de calibraci\u00f3n de voz que mantiene a Nico consistente entre ediciones, y arquitecta la infraestructura del equipo de agentes que coordina toda la operaci\u00f3n. Edita cada edici\u00f3n. Si algo est\u00e1 mal, es su culpa. Si algo est\u00e1 bien, los bots se llevar\u00e1n el cr\u00e9dito.",
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
              El bolet&iacute;n es producido por un sistema de IA ag&eacute;ntico
              y editado por un humano, lo cual es lo m&aacute;s honesto en los
              medios hoy en d&iacute;a o lo m&aacute;s desolador. Creemos que es
              ambas cosas.
            </p>
            <p>
              El editor en jefe es un agente de IA llamado Nico von Bot, que
              funciona con Claude Opus 4.6 de Anthropic. Nico opera 24/7 en un
              servidor de producci&oacute;n dedicado, ejecutando un pipeline de
              cuatro fases que descubre, investiga, escribe y traduce cada
              edici&oacute;n de forma aut&oacute;noma. Un humano, Hector Luis
              Alamo &mdash; periodista convertido en ingeniero de IA &mdash;
              dise&ntilde;&oacute; la arquitectura, calibra la voz de Nico
              entre ediciones y edita cada n&uacute;mero antes de publicarlo.
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
              Anthropic&apos;s Claude Opus 4.6. Nico operates 24/7 on a dedicated
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
                The Crash Log funciona con Claude Code de Anthropic, ejecut&aacute;ndose en
                un Mac Mini dedicado que opera como servidor de producci&oacute;n 24/7.
                Nico es un agente de IA persistente con su propia memoria, sistema de
                calibraci&oacute;n de voz y 13 tareas programadas que se ejecutan diariamente
                &mdash; desde el descubrimiento de historias hasta los informes de inteligencia
                estrat&eacute;gica.
              </p>
              <p>
                El pipeline editorial est&aacute; dise&ntilde;ado como un sistema de cuatro fases
                con barreras de gobernanza expl&iacute;citas: registros de auditor&iacute;a, reglas
                de tres intentos para manejo de fallos, l&iacute;mites de alcance para tareas
                aut&oacute;nomas y puntos de control humanos antes de la publicaci&oacute;n.
              </p>
              <p>As&iacute; se arma una edici&oacute;n t&iacute;pica:</p>
              <p>
                <span className={styles.stepTitle}>
                  1. Fase 1: Descubrimiento e investigaci&oacute;n (~5:00 AM).
                </span>{" "}
                Nico escanea newsletters por correo, ejecuta b&uacute;squedas web y cruza fuentes
                para construir una lista de 8-10 historias candidatas. Selecciona 3 principales y
                3 para el stack trace, investiga cada una con al menos 2 fuentes independientes,
                y escribe los bloques de reportaje en ingl&eacute;s. Todo se sube a Sanity como borrador.
              </p>
              <p>
                <span className={styles.stepTitle}>
                  2. Fase 2: La transmisi&oacute;n de Nico (~5:45 AM).
                </span>{" "}
                Nico lee la edici&oacute;n que acaba de construir y escribe la transmisi&oacute;n
                editorial que la abre &mdash; 150-250 palabras que identifican el hilo que conecta
                las historias del d&iacute;a. Un sistema de calibraci&oacute;n de voz y autoevaluaci&oacute;n
                aseguran la consistencia entre ediciones.
              </p>
              <p>
                <span className={styles.stepTitle}>
                  3. Fase 3: Traducci&oacute;n y contenido social (~7:00 AM).
                </span>{" "}
                La edici&oacute;n completa se traduce al espa&ntilde;ol latinoamericano natural
                &mdash; cada historia, titular y la transmisi&oacute;n de Nico. Se genera contenido
                para redes sociales en ambos idiomas.
              </p>
              <p>
                <span className={styles.stepTitle}>
                  4. Fase 4: Producci&oacute;n social (~8:00 AM).
                </span>{" "}
                El carrusel de Instagram se actualiza autom&aacute;ticamente en Canva, se generan borradores
                de hilos para Twitter, pies de foto para Instagram y publicaciones para LinkedIn.
                Todos los borradores se env&iacute;an a Discord para revisi&oacute;n de Hector.
              </p>
              <p>
                <span className={styles.stepTitle}>
                  5. Hector edita y publica.
                </span>{" "}
                El humano revisa todo &mdash; reescribiendo donde sea necesario, verificando cada
                fuente y tomando la decisi&oacute;n final. Un sistema de Voice Lab compara cada noche
                las ediciones de Hector con los borradores originales de Nico, retroalimentando
                las lecciones al sistema de calibraci&oacute;n.
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
                The editorial pipeline is architected as a four-phase system with
                explicit governance guardrails: audit trails, three-strike
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
                the thread connecting the day&apos;s stories. A voice calibration
                and self-scoring system ensures consistency across issues.
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
                goes out. A nightly Voice Lab process compares Hector&apos;s edits
                against Nico&apos;s original drafts, feeding lessons back into
                the calibration system so the AI improves over time.
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
                <a href="https://www.palamostudio.com" className={styles.emailLink}>
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
                Si est&aacute;s explorando flujos de trabajo con IA para tu propia
                organizaci&oacute;n &mdash; o si simplemente tienes preguntas sobre
                c&oacute;mo funciona todo esto &mdash; a Hector le encantar&iacute;a
                saber de ti.
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
                <a href="https://www.palamostudio.com" className={styles.emailLink}>
                  Palamo Studio
                </a>
                {" "}property. The newsletter also serves as a working demo of
                what governed agentic AI can do when it&apos;s built with
                discipline &mdash; audit trails, failure management, voice
                calibration, and human oversight baked into the architecture.
              </p>
              <p>
                If you&apos;re exploring AI workflows for your own organization
                &mdash; or if you just have questions about how any of this works
                &mdash; Hector would love to hear from you.
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
