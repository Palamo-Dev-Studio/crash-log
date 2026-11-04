// ABOUTME: Glues a spaced en or em dash to the word before it, so a wrapped line never starts with the dash.
// ABOUTME: Swaps the plain space before " – " and " — " for a non-breaking space; the space after stays breakable.

export function keepDashAttached(text) {
  if (typeof text !== "string") return text;
  return text.replace(/ ([–—]) /g, " $1 ");
}
