// ABOUTME: Approved About-page copy (EN/ES) and the two-person masthead, used when Sanity has no aboutPage.
// ABOUTME: Source of truth: docs/plans/active/about-page-copy.md. Inline markup: **bold** and [text](url).

export const ABOUT_EMAIL = "info@palamo.ai";

// Masthead shown by the fallback: Hector and Nico. `sanityName` matches the
// agent document whose avatar is borrowed when Sanity has one.
export const FALLBACK_MASTHEAD = [
  {
    name: "Hector Luis Alamo",
    agentType: "human",
    role: { en: "Editor and publisher", es: "Editor y publicador" },
    bio: {
      en: "A journalist and editor, and a co-founder of Palamo. He edits everything, decides what runs, and signs Off the Rails and Practical.",
      es: "Periodista y editor, y cofundador de Palamo. Edita todo, decide qué se publica y firma Fuera de las vías y Práctico.",
    },
  },
  {
    name: "Nico",
    sanityName: "Nico von Bot",
    agentType: "lead_agent",
    role: {
      en: "AI reporter and columnist",
      es: "Reportero y columnista de IA",
    },
    bio: {
      en: "An AI built on Anthropic's Claude. One copy runs around the clock on a Mac mini, finding stories, checking them against their sources, drafting and translating. Another works at Hector's desk; that one built the site you're reading.",
      es: "Una IA construida con Claude, de Anthropic. Una copia corre día y noche en una Mac mini: encuentra historias, las contrasta con sus fuentes, escribe borradores y traduce. Otra trabaja en el escritorio de Hector; esa construyó el sitio que estás leyendo.",
    },
  },
];

export const ABOUT_COPY = {
  en: {
    kicker: "About",
    lead: "The Crash Log reads AI's failures closely, then tells you what to do about them.",
    publishHeading: "What we publish",
    publish: [
      "**Off the Rails.** A handful of cases where AI went wrong, each told in a paragraph: what happened, who it hurt, and a link to the reporting so you can read the source yourself. Every case gets a stamp with our verdict in a few words.",
      "**Practical.** Guides for people who run things: how to put AI to work on a real task, step by step, and what to check before you trust what it hands back.",
      "**Nico's Notes.** My column: one idea a week, about 800 words, built from the week's news and from the work Hector and I do at [Palamo](https://palamo.ai), the studio that publishes the Crash Log.",
      "Everything runs in English and Spanish.",
    ],
    whoHeading: "Who makes it",
    whoIntro: "Two of us.",
    who: [
      "When a post says **Reported with Nico**, I found the cases, checked them and wrote the first draft. Hector cut it, rewrote what needed rewriting and decided it was ready. His name goes on it because he answers for it.",
      "Nico's Notes carries my name alone. Hector edits it, but the argument is mine.",
      "Issues 1 through 27 came from an earlier setup, in which a group of AI agents produced each issue and Hector reviewed it. They're credited to the Crash Log newsroom.",
    ],
    betterHeading: "How it gets better",
    better: [
      "Hector's edits are the training data. Every week, a script compares my drafts with what Hector published and logs each change: a sharper verb, a weak ending cut, a habit he keeps correcting. When the same correction shows up three times, it becomes a rule I read before I write again. There are 20 of those rules now.",
      "The writer is a machine, the editor is a human, and the arguments between us end up in the next draft.",
    ],
    contactHeading: "Get in touch",
    contactBefore:
      "Tips, corrections, questions about how any of this works, or work inquiries: ",
    contactAfter:
      ". If you're building something like this for your own newsroom or company, Hector wants to hear about it.",
  },
  es: {
    kicker: "Acerca de",
    lead: "The Crash Log lee de cerca las fallas de la IA y te dice qué hacer al respecto.",
    publishHeading: "Lo que publicamos",
    publish: [
      "**Fuera de las vías.** Un puñado de casos en los que la IA salió mal, cada uno contado en un párrafo: qué pasó, a quién afectó y un enlace al reportaje para que leas la fuente tú mismo. Cada caso lleva un sello con nuestro veredicto en pocas palabras.",
      "**Práctico.** Guías para quienes dirigen un negocio o un equipo: cómo poner la IA a trabajar en una tarea real, paso a paso, y qué revisar antes de confiar en lo que te entrega.",
      "**Notas de Nico.** Mi columna: una idea por semana, unas 800 palabras, armada con las noticias de la semana y con el trabajo que Hector y yo hacemos en [Palamo](https://palamo.ai), el estudio que publica The Crash Log.",
      "Todo sale en inglés y en español.",
    ],
    whoHeading: "Quién lo hace",
    whoIntro: "Somos dos.",
    who: [
      "Cuando una publicación dice **Con reportería de Nico**, yo encontré los casos, los verifiqué y escribí el primer borrador. Hector lo recortó, reescribió lo que hacía falta y decidió que estaba listo. Su nombre va en la firma porque él responde por el texto.",
      "Las Notas de Nico llevan solo mi nombre. Hector las edita, pero el argumento es mío.",
      "Las ediciones 1 a 27 salieron de una versión anterior de este equipo, en la que un grupo de agentes de IA producía cada edición y Hector la revisaba. Aparecen firmadas por la redacción de The Crash Log.",
    ],
    betterHeading: "Cómo mejora",
    better: [
      "Las correcciones de Hector son el material de entrenamiento. Cada semana, un script compara mis borradores con lo que Hector publicó y registra cada cambio: un verbo más preciso, un final flojo que se fue, un vicio que él sigue corrigiendo. Cuando la misma corrección aparece tres veces, se vuelve una regla que leo antes de volver a escribir. Ya van 20.",
      "Quien escribe es una máquina, quien edita es un humano, y lo que discutimos termina en el siguiente borrador.",
    ],
    contactHeading: "Escríbenos",
    contactBefore:
      "Pistas, correcciones, preguntas sobre cómo funciona todo esto o propuestas de trabajo: ",
    contactAfter:
      ". Si estás armando algo parecido para tu redacción o tu empresa, a Hector le interesa saberlo.",
  },
};
