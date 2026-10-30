// ABOUTME: EN/ES copy for the home page (cover cue, rail, recent files, empty state) and the file route builder.
// ABOUTME: Placeholder-grade strings live here so components stay free of locale branching.

export const HOME_LABELS = {
  en: {
    empty: "No content published yet.",
    byPrefix: "By",
    minRead: (n) => `${n} min read`,
    readFile: "Read the file",
    railHeading: "Latest files",
    railKey: "Colour = series:",
    onCover: "On the cover",
    subscribeLine: "New files every week. Free.",
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
    railKey: "Color = serie:",
    onCover: "En la portada",
    subscribeLine: "Expedientes nuevos cada semana. Gratis.",
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
