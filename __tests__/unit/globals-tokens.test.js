// ABOUTME: Verifies the Field Manual tokens in app/globals.css :root match the mockup source of truth.
// ABOUTME: Also guards that legacy token names remain defined during the transition.

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function rootBlock(css) {
  const start = css.indexOf(":root");
  const open = css.indexOf("{", start);
  const close = css.indexOf("\n}", open);
  return css.slice(open + 1, close);
}

function declarations(block) {
  const out = {};
  for (const m of block.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    out[m[1]] = m[2].trim().toLowerCase(); // hex case is not significant
  }
  return out;
}

const root = process.cwd();
const site = declarations(
  rootBlock(readFileSync(resolve(root, "app/globals.css"), "utf8"))
);
const mockup = declarations(
  rootBlock(
    readFileSync(
      resolve(root, "docs/reference/field-manual/mockups/styles.css"),
      "utf8"
    )
  )
);

const FIELD_MANUAL_TOKENS = [
  "--cream",
  "--card",
  "--ink",
  "--rule",
  "--terra",
  "--terra-ink",
  "--teal",
  "--teal-ink",
  "--muted",
  "--label",
  "--wrap",
  "--gutter",
];

describe("globals.css Field Manual tokens", () => {
  it("parses the mockup :root so the comparison is not vacuous", () => {
    expect(Object.keys(mockup).length).toBeGreaterThanOrEqual(
      FIELD_MANUAL_TOKENS.length
    );
  });

  it.each(FIELD_MANUAL_TOKENS)(
    "%s matches the mockup value exactly",
    (name) => {
      expect(mockup[name]).toBeDefined();
      expect(site[name]).toBe(mockup[name]);
    }
  );

  it.each([
    "--bg",
    "--surface",
    "--border",
    "--text-primary",
    "--text-secondary",
    "--text-muted",
    "--severity-error",
    "--severity-breach",
    "--agent-nico",
    "--agent-hector",
  ])("keeps legacy token %s defined", (name) => {
    expect(site[name]).toBeDefined();
  });

  it("maps the legacy page background onto the cream surface", () => {
    expect(site["--bg"]).toBe(mockup["--cream"]);
  });

  it("maps legacy primary text onto ink", () => {
    expect(site["--text-primary"]).toBe(mockup["--ink"]);
  });
});
