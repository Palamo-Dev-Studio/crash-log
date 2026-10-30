// ABOUTME: EN/ES copy for the archive page head (kicker, title, description, empty state).
// ABOUTME: Search-box copy stays with ArchiveSearch; this file is page-level strings only.

export const ARCHIVE_LABELS = {
  en: {
    kicker: "ARCHIVE",
    count: (n) => (n === 1 ? "1 FILE" : `${n} FILES`),
    title: "Archive",
    description:
      "Every file we have published: Off the Rails, Practical and Nico’s Notes. Search it or filter by beat.",
    empty: "No content published yet.",
  },
  es: {
    kicker: "ARCHIVO",
    count: (n) => (n === 1 ? "1 EXPEDIENTE" : `${n} EXPEDIENTES`),
    title: "Archivo",
    description:
      "Todos los expedientes que hemos publicado: Fuera de las vías, Práctico y Notas de Nico. Búscalos o filtra por sección.",
    empty: "No hay contenido publicado todavía.",
  },
};
