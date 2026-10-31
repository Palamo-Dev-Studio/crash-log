// ABOUTME: Static WCAG AA guard: every CSS rule whose text colour and background are both known tokens or hex literals.
// ABOUTME: Partial by design; skips @layer, var(--x, fallback), multi-value background shorthand, chained tokens, :focus-within, inherited backgrounds, rgba/color-mix/gradients. e2e/site-contrast.spec.js is the full rendered check.

import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve, join } from "node:path";

const root = process.cwd();
const STATE = /:(hover|focus-visible|focus|active)\b/g;
const AA = 4.5;
let checkedPairs = 0;

const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, "");

function matchingBrace(css, open) {
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}" && --depth === 0) return i;
  }
  throw new Error("Unbalanced braces in CSS");
}

// Flattens nested at-rules (@media, @supports) into [{ ctx, selector, body }] in source order.
// ctx is the at-rule chain the rule sits in ("" for base rules).
function rules(css, out = [], ctx = "") {
  let i = 0;
  while (i < css.length) {
    const open = css.indexOf("{", i);
    if (open === -1) break;
    const prelude = css.slice(i, open).trim();
    const close = matchingBrace(css, open);
    const body = css.slice(open + 1, close);
    if (prelude.startsWith("@media") || prelude.startsWith("@supports")) {
      rules(body, out, ctx ? `${ctx} ${prelude}` : prelude);
    } else if (!prelude.startsWith("@")) {
      out.push({ ctx, selector: prelude, body });
    }
    i = close + 1;
  }
  return out;
}

function cssFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    if (name === "node_modules" || name === ".next" || name.startsWith("."))
      return [];
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return cssFiles(full);
    return name.endsWith(".css") ? [full] : [];
  });
}

const channel = (v) => {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
const luminance = ([r, g, b]) =>
  0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
export function contrastRatio(a, b) {
  const [x, y] = [luminance(a), luminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

function parseHex(value) {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value.trim());
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = [...h].map((c) => c + c).join("");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}

// Resolves a colour value to [r,g,b], or null when it is not a plain token/hex (inherit, gradients, rgba, color-mix...).
function resolveColor(value, tokens) {
  const v = value.replace(/\s*!important$/, "").trim();
  const ref = /^var\(\s*(--[\w-]+)\s*\)$/.exec(v);
  if (ref) return tokens[ref[1]] ? parseHex(tokens[ref[1]]) : null;
  return parseHex(v);
}

function declarations(body) {
  const out = {};
  for (const m of body.matchAll(
    /(?:^|;|\s)(color|background(?:-color)?)\s*:\s*([^;]+)/g
  )) {
    out[m[1] === "color" ? "color" : "background"] = m[2].trim();
  }
  return out;
}

// Returns violations for one stylesheet. Exported shape is exercised by the fixtures below.
export function contrastViolations(source, file, tokens) {
  const flat = rules(stripComments(source));
  const contexts = [...new Set(flat.map((r) => r.ctx))];
  const violations = [];
  // Each at-rule context is evaluated on its own: base rules apply inside it, then its own rules win.
  for (const ctx of contexts) {
    // selector -> merged declarations, later rules winning, so a :hover rule inherits its base rule's colours.
    const bySelector = new Map();
    const inCtx = new Set();
    for (const { ctx: c, selector, body } of flat) {
      if (c !== "" && c !== ctx) continue;
      for (const sel of selector.split(",").map((x) => x.trim())) {
        bySelector.set(sel, { ...bySelector.get(sel), ...declarations(body) });
        if (c === ctx) inCtx.add(sel);
      }
    }
    for (const [sel, own] of bySelector) {
      if (!inCtx.has(sel)) continue;
      // :disabled is skipped only when it is not merely negated by :not(...).
      const unnegated = sel.replace(/:not\([^)]*\)/g, "");
      if (/:disabled|::selection|::placeholder/.test(unnegated)) continue;
      const base = sel.replace(STATE, "");
      const merged = base === sel ? own : { ...bySelector.get(base), ...own };
      if (!merged.color || !merged.background) continue;
      const fg = resolveColor(merged.color, tokens);
      const bg = resolveColor(merged.background, tokens);
      if (!fg || !bg) continue;
      const got = contrastRatio(fg, bg);
      checkedPairs++;
      if (got < AA) {
        const where = ctx ? ` [${ctx}]` : "";
        violations.push(
          `${file}${where} ${sel}: ${merged.color} on ${merged.background} = ${got.toFixed(2)}:1 < ${AA}:1`
        );
      }
    }
  }
  return violations;
}

function rootTokens(globals) {
  const tokens = {};
  for (const { selector, body } of rules(stripComments(globals))) {
    if (selector !== ":root") continue;
    for (const m of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+)(?:;|$)/g)) {
      tokens[m[1]] = m[2].trim();
    }
  }
  return tokens;
}

const globals = readFileSync(resolve(root, "app/globals.css"), "utf8");
const tokens = rootTokens(globals);
const files = [
  join(root, "app/globals.css"),
  ...cssFiles(join(root, "components")),
  ...cssFiles(join(root, "app")).filter((f) => f.endsWith(".module.css")),
];

describe("static CSS contrast (partial guard)", () => {
  it("resolves the Field Manual tokens from :root", () => {
    expect(tokens["--cream"]).toBe("#f4ecdd");
    expect(tokens["--ink"]).toBeDefined();
  });

  it("evaluates a meaningful number of pairs", () => {
    checkedPairs = 0;
    for (const f of files) {
      contrastViolations(readFileSync(f, "utf8"), f, tokens);
    }
    expect(checkedPairs).toBeGreaterThan(30);
  });

  it("scans globals.css and every CSS module", () => {
    expect(files.length).toBeGreaterThan(20);
  });

  it.each(files.map((f) => [f.replace(`${root}/`, ""), f]))(
    "%s: same-rule colour pairs meet AA, hover and focus included",
    (rel, file) => {
      expect(
        contrastViolations(readFileSync(file, "utf8"), rel, tokens)
      ).toEqual([]);
    }
  );
});

describe("static CSS contrast checker", () => {
  const t = { "--cream": "#f4ecdd", "--ink": "#2a2420", "--rule": "#cfc3ae" };

  it("flags a hover rule that sets only a background against the base text colour", () => {
    const css = `.b { color: var(--cream); background: var(--ink); }
      .b:hover { background: var(--rule); }`;
    const v = contrastViolations(css, "f.css", t);
    expect(v).toHaveLength(1);
    expect(v[0]).toContain(".b:hover");
  });

  it("flags a same-rule token pair and a hex literal pair", () => {
    expect(
      contrastViolations(".a { color: #ccc; background: #fff; }", "f.css", t)
    ).toHaveLength(1);
    expect(
      contrastViolations(
        ".a { color: var(--cream); background: var(--rule); }",
        "f.css",
        t
      )
    ).toHaveLength(1);
  });

  it("checks :hover:not(:disabled) rules", () => {
    const v = contrastViolations(
      ".btn:hover:not(:disabled){color:#fff;background:var(--rule)}",
      "f.css",
      t
    );
    expect(v).toHaveLength(1);
  });

  it("does not let a passing @media override hide a failing desktop hover", () => {
    const css = `.b { color: var(--cream); background: var(--ink); }
      .b:hover { background: var(--rule); }
      @media (max-width:700px) { .b:hover { background: var(--ink); } }`;
    const v = contrastViolations(css, "f.css", t);
    expect(v).toHaveLength(1);
    expect(v[0]).not.toContain("@media");
  });

  it("evaluates @media rules against inherited base colours", () => {
    const css = `.b { color: var(--cream); background: var(--ink); }
      @media (max-width:700px) { .b:hover { background: var(--rule); } }`;
    const v = contrastViolations(css, "f.css", t);
    expect(v).toHaveLength(1);
    expect(v[0]).toContain("@media");
  });

  it("passes good pairs, skips unresolvable values and disabled states", () => {
    const css = `.ok { color: var(--cream); background: var(--ink); }
      .skip { color: inherit; background: var(--rule); }
      .grad { color: var(--cream); background: linear-gradient(red, blue); }
      .b:disabled { color: var(--cream); background: var(--rule); }
      @media (max-width: 700px) { .ok:hover { background: var(--ink); } }`;
    expect(contrastViolations(css, "f.css", t)).toEqual([]);
  });
});
