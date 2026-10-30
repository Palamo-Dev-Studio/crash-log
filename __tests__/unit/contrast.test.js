// ABOUTME: WCAG AA contrast checks computed from the real CSS: text tokens on their glows, mark highlights, hover buttons.
// ABOUTME: Resolves var(), hex, rgba() and color-mix(..., transparent) so a token change that drops below 4.5:1 fails.

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const read = (p) => readFileSync(resolve(root, p), "utf8");
const globals = read("app/globals.css");

const tokens = {};
const rootStart = globals.indexOf(":root");
const rootBlock = globals.slice(
  globals.indexOf("{", rootStart) + 1,
  globals.indexOf("\n}", rootStart)
);
for (const m of rootBlock.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
  tokens[m[1]] = m[2].trim();
}

// Resolves a CSS colour to [r, g, b, a].
function parseColor(value) {
  const v = value.trim();
  let m = v.match(/^var\((--[\w-]+)\)$/);
  if (m) return parseColor(tokens[m[1]]);
  m = v.match(/^#([0-9a-f]{6})$/i);
  if (m) {
    const n = parseInt(m[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 1];
  }
  m = v.match(/^rgba\(\s*(\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\s*\)$/);
  if (m) return [+m[1], +m[2], +m[3], +m[4]];
  m = v.match(/^color-mix\(in srgb,\s*(.+?)\s+(\d+)%,\s*transparent\)$/);
  if (m) {
    const [r, g, b, a] = parseColor(m[1]);
    return [r, g, b, a * (+m[2] / 100)];
  }
  throw new Error(`Cannot resolve colour: ${value}`);
}

function over([r, g, b, a], bg) {
  return [
    r * a + bg[0] * (1 - a),
    g * a + bg[1] * (1 - a),
    b * a + bg[2] * (1 - a),
    1,
  ];
}

function luminance([r, g, b]) {
  const [R, G, B] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function ratio(fg, bg) {
  const a = luminance(fg);
  const b = luminance(bg);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

const CREAM = parseColor("var(--cream)");
const CARD = parseColor("var(--card)");

function ruleBody(css, selectorPattern) {
  const m = css.match(new RegExp(`${selectorPattern}\\s*\\{([^}]*)\\}`));
  if (!m) throw new Error(`No rule matching ${selectorPattern}`);
  return m[1];
}

function prop(body, name) {
  const m = body.match(new RegExp(`(?:^|[\\s;])${name}\\s*:\\s*([^;]+);`));
  return m ? m[1].trim() : null;
}

describe("text token contrast on glows", () => {
  const severities = [
    "error",
    "override",
    "terminate",
    "warning",
    "critical",
    "breach",
  ];

  describe.each([
    ["cream", CREAM],
    ["card", CARD],
  ])("over %s", (_name, surface) => {
    it.each(severities)("--severity-%s clears 4.5:1 on its own glow", (sev) => {
      const glow = over(parseColor(tokens[`--severity-${sev}-glow`]), surface);
      const text = parseColor(tokens[`--severity-${sev}`]);
      expect(ratio(text, glow)).toBeGreaterThanOrEqual(4.5);
    });

    it.each(["nico", "scoop", "root", "gabo", "lupe", "hector"])(
      "--agent-%s clears 4.5:1 on the surface",
      (agent) => {
        expect(
          ratio(parseColor(tokens[`--agent-${agent}`]), surface)
        ).toBeGreaterThanOrEqual(4.5);
      }
    );
  });
});

describe("search highlight (mark) contrast", () => {
  it.each(["components/FileRow.module.css"])(
    "%s mark text clears 4.5:1 on its background",
    (file) => {
      const body = ruleBody(read(file), "\\.row mark");
      const bgValue = prop(body, "background");
      const colorValue = prop(body, "color");
      expect(colorValue).not.toBe("inherit");
      for (const surface of [CREAM, CARD]) {
        const bg = over(parseColor(bgValue), surface);
        expect(ratio(parseColor(colorValue), bg)).toBeGreaterThanOrEqual(4.5);
      }
    }
  );
});

describe("donate button hover contrast", () => {
  it.each([
    ["components/DonateCTA.module.css", "\\.button:hover", "\\.button"],
    [
      "components/SupportContent.module.css",
      "\\.submitButton:hover",
      "\\.submitButton",
    ],
  ])("%s hover state keeps cream text readable", (file, hoverSel, baseSel) => {
    const css = read(file);
    const hover = ruleBody(css, hoverSel);
    const base = ruleBody(css, `${baseSel}(?![\\w:-])`);
    const bg = parseColor(prop(hover, "background"));
    const text = parseColor(prop(base, "color"));
    expect(ratio(text, over(bg, CREAM))).toBeGreaterThanOrEqual(4.5);
  });
});
