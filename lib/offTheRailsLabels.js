// ABOUTME: EN/ES copy for the Off the Rails issue page and series index (placeholder-grade strings).
// ABOUTME: One object so components stay free of locale branching; the legend and index blurb are placeholders.

export const OTR_LABELS = {
  en: {
    seriesName: "Off the Rails",
    kickerFile: "CASE FILE",
    cases: (n) => (n === 1 ? "1 CASE" : `${n} CASES`),
    minRead: (n) => `${n} MIN READ`,
    byPrefix: "By",
    legendStamp: "Verdict",
    legendText: "One ink, one meaning: the stamp is our verdict on the story.",
    caseWord: "Case",
    source: "Source",
    readFile: "Read the file",
    fullFiles: "The full files",
    issueNav: "Issue navigation",
    previous: "← Previous",
    next: "Next →",
    indexTitle: "Off the Rails",
    indexDescription:
      "The week's strangest AI stories, filed and read closely. Every issue, newest first.",
    indexHeading: "All files",
    indexEmpty: "No issues published yet.",
  },
  es: {
    seriesName: "Fuera de las vías",
    kickerFile: "EXPEDIENTE",
    cases: (n) => (n === 1 ? "1 CASO" : `${n} CASOS`),
    minRead: (n) => `${n} MIN DE LECTURA`,
    byPrefix: "Por",
    legendStamp: "Veredicto",
    legendText:
      "Una tinta, un significado: el sello es nuestro veredicto sobre la historia.",
    caseWord: "Caso",
    source: "Fuente",
    readFile: "Leer el expediente",
    fullFiles: "Los expedientes completos",
    issueNav: "Navegación de ediciones",
    previous: "← Anterior",
    next: "Siguiente →",
    indexTitle: "Fuera de las vías",
    indexDescription:
      "Las historias de IA más raras de la semana, archivadas y leídas con atención. Todas las ediciones, de la más reciente a la más antigua.",
    indexHeading: "Todos los expedientes",
    indexEmpty: "Aún no hay ediciones publicadas.",
  },
};

export function caseNumber(index) {
  return String(index + 1).padStart(2, "0");
}
