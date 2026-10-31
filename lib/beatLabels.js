// ABOUTME: EN/ES copy for the Beats index and beat detail pages (kickers, titles, counts, empty states).
// ABOUTME: Beats left the nav but stay live, so these pages keep their own labels.

export const BEAT_LABELS = {
  en: {
    indexKicker: "COVERAGE",
    indexTitle: "Beats",
    indexDescription:
      "The topics we cover, from model failures to broken deployments. Pick a beat to see every story filed under it.",
    indexEmpty: "No beats configured yet.",
    stories: (n) => (n === 1 ? "1 story" : `${n} stories`),
    beatsCaps: (n) => (n === 1 ? "1 BEAT" : `${n} BEATS`),
    storiesCaps: (n) => (n === 1 ? "1 STORY" : `${n} STORIES`),
    detailKicker: "BEAT",
    allBeats: "← All beats",
    detailEmpty: "No stories in this beat yet.",
  },
  es: {
    indexKicker: "COBERTURA",
    indexTitle: "Secciones",
    indexDescription:
      "Los temas que cubrimos, desde fallos de modelos hasta despliegues fallidos. Elige una sección para ver todas las historias archivadas en ella.",
    indexEmpty: "No hay secciones configuradas todavía.",
    stories: (n) => (n === 1 ? "1 historia" : `${n} historias`),
    beatsCaps: (n) => (n === 1 ? "1 SECCIÓN" : `${n} SECCIONES`),
    storiesCaps: (n) => (n === 1 ? "1 HISTORIA" : `${n} HISTORIAS`),
    detailKicker: "SECCIÓN",
    allBeats: "← Todas las secciones",
    detailEmpty: "No hay historias en esta sección todavía.",
  },
};
