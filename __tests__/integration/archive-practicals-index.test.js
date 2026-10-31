// ABOUTME: Integration tests for buildArchiveIndex() + searchArchive() with Practical files included.
// ABOUTME: Covers listing order across all three series, practicalBody search and the es search-scoping ruling for practicals.

import { describe, it, expect } from "vitest";
import { buildArchiveIndex } from "@/app/(site)/[locale]/archive/page";
import { searchArchive } from "@/lib/searchArchive";

const plainTextBlock = (text) => [{ _type: "block", children: [{ text }] }];

const issue = {
  _id: "issue-1",
  issueNumber: 1,
  slug: "issue-001",
  publishDate: "2026-04-01",
  title: { en: "Meltdown", es: "Colapso" },
  stories: [],
  stackTrace: [],
};
const column = {
  _id: "column-1",
  columnNumber: 1,
  slug: "2026-04-03",
  publishDate: "2026-04-03",
  title: { en: "The Ledger", es: "El Libro Mayor" },
  body: { en: plainTextBlock("ledger"), es: plainTextBlock("libro") },
};
const practical = {
  _id: "practical-1",
  practicalNumber: 1,
  slug: "audit-your-agent",
  publishDate: "2026-04-05",
  byline: "Ada Lovelace",
  title: { en: "Audit Your Agent", es: "Audita a tu agente" },
  subtitle: { en: "Five checks", es: "Cinco verificaciones" },
  body: {
    en: plainTextBlock("rotate the keys quarterly"),
    es: plainTextBlock("rota las claves cada trimestre"),
  },
};
const untranslatedPractical = {
  _id: "practical-2",
  practicalNumber: 2,
  slug: "english-only",
  publishDate: "2026-04-06",
  title: { en: "English Only Practical" },
  body: { en: plainTextBlock("rotate the keys quarterly") },
};

describe("buildArchiveIndex with Practicals", () => {
  it("lists practicals alongside issues and columns, newest first", () => {
    const index = buildArchiveIndex([issue], [column], "en", [
      practical,
      untranslatedPractical,
    ]);
    expect(index.map((i) => i.id)).toEqual([
      "practical-2",
      "practical-1",
      "column-1",
      "issue-1",
    ]);
    const entry = index.find((i) => i.id === "practical-1");
    expect(entry.type).toBe("practical");
    expect(entry.raw).toEqual({
      practicalNumber: 1,
      slug: "audit-your-agent",
      byline: "Ada Lovelace",
    });
  });

  it("still works with the original three-argument call", () => {
    expect(buildArchiveIndex([issue], [column], "en")).toHaveLength(2);
  });

  it("searches the practical body and reports the match as practicalBody", () => {
    const index = buildArchiveIndex([], [], "en", [practical]);
    const [hit] = searchArchive(index, { query: "rotate keys" });
    expect(hit.id).toBe("practical-1");
    expect(hit.matches).toEqual(["practicalBody"]);
  });

  it("es: keeps an untranslated practical in the listing but out of query matches", () => {
    const index = buildArchiveIndex([], [], "es", [
      practical,
      untranslatedPractical,
    ]);
    expect(index).toHaveLength(2);
    expect(searchArchive(index, { query: "rotate" }).map((r) => r.id)).toEqual(
      []
    );
    expect(searchArchive(index, { query: "rota" }).map((r) => r.id)).toEqual([
      "practical-1",
    ]);
  });
});
