// ABOUTME: EN/ES copy for the home page (cover cue, rail, recent files, empty state) and the file route builder.
// ABOUTME: Placeholder-grade strings live here so components stay free of locale branching.

import { SUBSCRIBE_LINE } from "@/lib/substack";

export const HOME_LABELS = {
  en: {
    empty: "No content published yet.",
    byPrefix: "By",
    minRead: (n) => `${n} min read`,
    readFile: "Read the file",
    railHeading: "Latest files",
    railKey: "Series colours",
    onCover: "On the cover",
    subscribeLine: SUBSCRIBE_LINE.en,
    subscribe: "Subscribe",
    recentHeading: "Recent files",
    archive: "See the full archive",
  },
  es: {
    empty: "Aún no hay contenido publicado.",
    byPrefix: "Por",
    minRead: (n) => `${n} min de lectura`,
    readFile: "Leer el expediente",
    railHeading: "Últimos expedientes",
    railKey: "Colores por serie",
    onCover: "En la portada",
    subscribeLine: SUBSCRIBE_LINE.es,
    subscribe: "Suscríbete",
    recentHeading: "Expedientes recientes",
    archive: "Ver el archivo completo",
  },
};

const ROUTE_BY_TYPE = {
  issue: "issue",
  column: "nico",
  practical: "practical",
};

export function fileHref(doc, locale) {
  return `/${locale}/${ROUTE_BY_TYPE[doc._type]}/${doc.slug}`;
}
