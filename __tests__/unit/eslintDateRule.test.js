// ABOUTME: Lints small code strings through the project's ESLint config to prove the date-formatting ban.
// ABOUTME: Banned everywhere except lib/formatDate.js; RSS feed routes may call toUTCString (RFC 822) and nothing else.

import { describe, it, expect } from "vitest";
import { ESLint } from "eslint";

const eslint = new ESLint({ cwd: process.cwd() });

async function dateErrors(code, filePath) {
  const [result] = await eslint.lintText(code, { filePath });
  return result.messages.filter((m) => m.ruleId === "no-restricted-syntax");
}

const COMPONENT = "components/Example.js";
const FEED = "app/(site)/[locale]/feed.xml/route.js";
const NICO_FEED = "app/(site)/[locale]/nico/feed.xml/route.js";
const HELPER = "lib/formatDate.js";

describe("date-formatting lint rule", () => {
  const banned = [
    "export const f = (d) => d.toLocaleDateString('en');",
    "export const f = (d) => d.toLocaleTimeString('en');",
    "export const f = (d) => d.toDateString();",
    "export const f = (d) => d.toUTCString();",
    "export const f = () => new Intl.DateTimeFormat('en').format(new Date());",
  ];

  // Evasions of the original CallExpression-only rule; each must still error once.
  const evasions = [
    "export const f = (d) => d['toLocaleDateString']();",
    "export const f = (d) => { const g = d.toLocaleDateString; return g.call(d); };",
    "const { DateTimeFormat } = Intl;\nexport const f = () => DateTimeFormat;",
    "const { DateTimeFormat } = globalThis.Intl;\nexport const f = () => DateTimeFormat;",
    "export const f = () => new globalThis.Intl.DateTimeFormat('en');",
    "export const f = () => Intl['DateTimeFormat'];",
    "export const f = (d) => d.toLocaleString('en', { weekday: 'long' });",
    "export const f = (d) => d.toLocaleString('en', { dateStyle: 'full' });",
    "export const f = (d) => d.toLocaleString('en', { timeStyle: 'short' });",
  ];

  for (const code of evasions) {
    it(`errors on evasion: ${code}`, async () => {
      const errors = await dateErrors(code, COMPONENT);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe(
        "Format dates with lib/formatDate.js (UTC, no weekday)"
      );
    });
  }

  it("still bans evasions in a feed route (except toUTCString)", async () => {
    for (const code of evasions) {
      expect((await dateErrors(code, FEED)).length).toBeGreaterThan(0);
    }
    expect(
      await dateErrors("export const f = (d) => d['toUTCString']();", FEED)
    ).toHaveLength(0);
    expect(
      await dateErrors(
        "export const f = (d) => { const g = d.toUTCString; return g.call(d); };",
        FEED
      )
    ).toHaveLength(0);
  });

  for (const code of banned) {
    it(`errors in a component: ${code}`, async () => {
      const errors = await dateErrors(code, COMPONENT);
      expect(errors).toHaveLength(1);
      expect(errors[0].severity).toBe(2);
      expect(errors[0].message).toBe(
        "Format dates with lib/formatDate.js (UTC, no weekday)"
      );
    });
  }

  it("allows Intl.DateTimeFormat and toLocaleDateString in lib/formatDate.js", async () => {
    for (const code of banned) {
      expect(await dateErrors(code, HELPER)).toHaveLength(0);
    }
  });

  it("allows toUTCString in both feed routes", async () => {
    const code = "export const f = (d) => new Date(d).toUTCString();";
    expect(await dateErrors(code, FEED)).toHaveLength(0);
    expect(await dateErrors(code, NICO_FEED)).toHaveLength(0);
  });

  it("still bans toLocaleDateString and Intl.DateTimeFormat in a feed route", async () => {
    expect(
      await dateErrors("export const f = (d) => d.toLocaleDateString();", FEED)
    ).toHaveLength(1);
    expect(
      await dateErrors(
        "export const f = () => new Intl.DateTimeFormat();",
        FEED
      )
    ).toHaveLength(1);
  });

  it("allows every evasion form in lib/formatDate.js", async () => {
    for (const code of evasions) {
      expect(await dateErrors(code, HELPER)).toHaveLength(0);
    }
  });

  it("does not ban toLocaleString (reserved for number and currency formatting)", async () => {
    for (const code of [
      "export const f = (n) => n.toLocaleString();",
      "export const f = (n) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });",
    ]) {
      expect(await dateErrors(code, COMPONENT)).toHaveLength(0);
    }
    expect(
      await dateErrors(
        "export const f = (n) => n.toLocaleString('en');",
        COMPONENT
      )
    ).toHaveLength(0);
  });

  it("the real source tree has no violations", async () => {
    const results = await eslint.lintFiles(["app", "components", "lib"]);
    const hits = results.flatMap((r) =>
      r.messages
        .filter((m) => m.ruleId === "no-restricted-syntax")
        .map((m) => `${r.filePath}:${m.line}`)
    );
    expect(hits).toEqual([]);
  });
});
