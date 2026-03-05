// ABOUTME: Color palette for story sections, cycled by position to ensure adjacent contrast.
// ABOUTME: Each key maps to existing --severity-* CSS custom properties in globals.css.

const COLOR_CYCLE = ["error", "breach", "override", "warning", "critical"];

export function getStoryColorKey(index) {
  return COLOR_CYCLE[index % COLOR_CYCLE.length];
}
