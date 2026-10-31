// ABOUTME: Property-rule tests tying app/globals.css to the Field Manual mockup and to every var() the site uses.
// ABOUTME: Mockup custom properties must match per media context; every referenced var() must be declared.

import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve, join } from "node:path";

const root = process.cwd();
const read = (p) => readFileSync(resolve(root, p), "utf8");

function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

// Index of the "}" closing the block whose "{" is at `open`.
function matchingBrace(css, open) {
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}" && --depth === 0) return i;
  }
  throw new Error("Unbalanced braces in CSS");
}

// Collects custom properties declared in :root blocks, keyed by media context
// ("" for top level, otherwise the @media prelude with whitespace removed).
function rootProperties(css, media = "", out = {}) {
  let i = 0;
  while (i < css.length) {
    const open = css.indexOf("{", i);
    if (open === -1) break;
    const prelude = css.slice(i, open).trim();
    const close = matchingBrace(css, open);
    const body = css.slice(open + 1, close);
    if (prelude.startsWith("@media")) {
      rootProperties(body, prelude.replace(/\s+/g, ""), out);
    } else if (prelude === ":root") {
      for (const m of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+)(?:;|$)/g)) {
        out[`${media}|${m[1]}`] = m[2].trim().toLowerCase();
      }
    }
    i = close + 1;
  }
  return out;
}

const globalsCss = stripComments(read("app/globals.css"));
const mockupCss = stripComments(
  read("docs/reference/field-manual/mockups/styles.css")
);
const site = rootProperties(globalsCss);
const mockup = rootProperties(mockupCss);

// The mockup writes literal font names; the site resolves them through the
// next/font variables, so these three differ by design.
const FONT_ALIASES = ["--serif-d", "--serif-b", "--mono"];

describe("globals.css mirrors the mockup custom properties", () => {
  const entries = Object.entries(mockup).filter(
    ([key]) => !FONT_ALIASES.includes(key.split("|")[1])
  );

  it("parses the mockup top-level and mobile :root so the comparison is not vacuous", () => {
    expect(entries.length).toBeGreaterThanOrEqual(12);
    expect(entries.some(([key]) => key.startsWith("@media"))).toBe(true);
  });

  it.each(entries)("%s has the same value in globals.css", (key, value) => {
    expect(site[key]).toBe(value);
  });

  it("defines the three font aliases at top level through the next/font variables", () => {
    for (const alias of FONT_ALIASES) {
      expect(site[`|${alias}`]).toMatch(/^var\(--font-(display|body|mono)\)/);
    }
  });
});

function filesWithSuffix(dir, suffixes) {
  const found = [];
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".next") continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory())
      found.push(...filesWithSuffix(full, suffixes));
    else if (suffixes.some((s) => name.endsWith(s))) found.push(full);
  }
  return found;
}

const cssModules = (dir) => filesWithSuffix(dir, [".module.css"]);

describe("every var() reference is declared", () => {
  const declared = new Set(
    [...globalsCss.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1])
  );
  const layout = read("app/(site)/[locale]/layout.js");
  const nextFontVars = [...layout.matchAll(/variable:\s*"(--[\w-]+)"/g)].map(
    (m) => m[1]
  );

  // Custom properties a component sets at runtime through an inline style,
  // e.g. style={{ "--severity-color": value }}; their CSS reads carry a fallback.
  const inlineStyleVars = new Set(
    [
      ...filesWithSuffix(resolve(root, "components"), [".js"]),
      ...filesWithSuffix(resolve(root, "app"), [".js"]),
    ].flatMap((f) =>
      [...readFileSync(f, "utf8").matchAll(/["'](--[\w-]+)["']\s*:/g)].map(
        (m) => m[1]
      )
    )
  );

  it("treats exactly --font-display, --font-body and --font-mono as next/font-provided", () => {
    expect([...nextFontVars].sort()).toEqual([
      "--font-body",
      "--font-display",
      "--font-mono",
    ]);
  });

  const files = [
    "app/globals.css",
    ...[
      ...cssModules(resolve(root, "components")),
      ...cssModules(resolve(root, "app")),
    ].map((f) => f.slice(root.length + 1)),
  ];

  it("finds the module stylesheets so the scan is not vacuous", () => {
    expect(files.length).toBeGreaterThan(10);
  });

  it.each(files)("%s references only declared custom properties", (file) => {
    const css = stripComments(read(file));
    // Matches var(--x) and var(--x, fallback): only the name is captured.
    const used = new Set(
      [...css.matchAll(/var\(\s*(--[\w-]+)/g)].map((m) => m[1])
    );
    const undeclared = [...used].filter(
      (name) =>
        !declared.has(name) &&
        !nextFontVars.includes(name) &&
        !inlineStyleVars.has(name)
    );
    expect(undeclared).toEqual([]);
  });
});
