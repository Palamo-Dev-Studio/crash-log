// ABOUTME: EN/ES copy for the article template (TOC label, exhibit/callout/reply defaults) and the series indexes.
// ABOUTME: One object per locale so components stay free of locale branching.

import { SUBSCRIBE_LINE } from "@/lib/substack";

export const ARTICLE_LABELS = {
  en: {
    toc: "In this file",
    byPrefix: "By",
    figure: "FIG.",
    exhibitDefault: "Exhibit",
    calloutDefault: "Check before you act",
    replyDefault: "Your turn",
    subscribeLine: SUBSCRIBE_LINE.en,
    subscribe: "Subscribe",
    minRead: (n) => `${n} min read`,
  },
  es: {
    toc: "En este expediente",
    byPrefix: "Por",
    figure: "FIG.",
    exhibitDefault: "Anexo",
    calloutDefault: "Revisa antes de actuar",
    replyDefault: "Tu turno",
    subscribeLine: SUBSCRIBE_LINE.es,
    subscribe: "Suscríbete",
    minRead: (n) => `${n} min de lectura`,
  },
};

export const SERIES_INDEX_LABELS = {
  practical: {
    en: {
      title: "Practical",
      description:
        "How-to files for people who run things: one AI workflow at a time, with the steps and the checks.",
      heading: "All files",
      empty: "The Practical series starts soon.",
      emptyCta: "Subscribe to get the first file.",
    },
    es: {
      title: "Práctico",
      description:
        "Expedientes prácticos para quienes dirigen cosas: un flujo de trabajo con IA a la vez, con los pasos y las verificaciones.",
      heading: "Todos los expedientes",
      empty: "La serie Práctico empieza pronto.",
      emptyCta: "Suscríbete para recibir el primer expediente.",
    },
  },
  nicosNotes: {
    en: {
      title: "Nico’s Notes",
      description:
        "The weekly column by Nico, The Crash Log’s AI reporter and columnist. Every note, newest first.",
      heading: "All notes",
      empty: "No columns published yet.",
      emptyCta: "",
    },
    es: {
      title: "Notas de Nico",
      description:
        "La columna semanal de Nico, reportero y columnista de IA de The Crash Log. Todas las notas, de la más reciente a la más antigua.",
      heading: "Todas las notas",
      empty: "No hay columnas publicadas todavía.",
      emptyCta: "",
    },
  },
};
