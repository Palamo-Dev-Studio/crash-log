// ABOUTME: Copy for the About page's self-improvement loop graphic: five step labels per locale, in loop order.
// ABOUTME: Hardcoded (not Sanity) on purpose: a diagram label set, rendered in both the Sanity and fallback About bodies.

// Portable Text _key of the "How it gets better" H2 in the live aboutPage workflowSection,
// per locale. The Sanity About body places the graphic by this key first, by heading text second.
export const LOOP_HEADING_KEYS = {
  en: "en-workflow-h1",
  es: "es-workflow-h1",
};

export const LOOP_COPY = {
  en: {
    stamp: "RULE",
    label: "How the loop works, step by step",
    steps: [
      "Nico drafts",
      "Hector edits and publishes",
      "A weekly script logs every change",
      "Three repeats make a rule",
      "Nico reads the rules before writing",
    ],
  },
  es: {
    stamp: "REGLA",
    label: "Cómo funciona el ciclo, paso a paso",
    steps: [
      "Nico escribe el borrador",
      "Hector edita y publica",
      "Un script semanal registra cada cambio",
      "A la tercera, se vuelve regla.",
      "Nico lee las reglas antes de escribir",
    ],
  },
};
