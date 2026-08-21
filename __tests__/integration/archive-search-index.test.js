// ABOUTME: Integration tests for the archive page's buildArchiveIndex() + searchArchive() pipeline.
// ABOUTME: Validates the search-scoped ruling: untranslated docs stay in the listing, but are excluded from query matches.

import { describe, it, expect } from "vitest";
import { buildArchiveIndex } from "@/app/(site)/[locale]/archive/page";
import { searchArchive } from "@/lib/searchArchive";

const plainTextBlock = (text) => [{ _type: "block", children: [{ text }] }];

const foundationModelsCategory = {
  name: { en: "Foundation Models", es: "Modelos Fundacionales" },
  slug: "foundation-models",
};

const translatedIssue = {
  _id: "issue-translated",
  issueNumber: 1,
  slug: "issue-001",
  publishDate: "2026-04-01",
  title: { en: "Meltdown", es: "Colapso" },
  subtitle: { en: "It broke", es: "Se rompió" },
  nicosTransmission: {
    en: plainTextBlock("English transmission"),
    es: plainTextBlock("Transmisión en español"),
  },
  stackTrace: [],
  stories: [
    {
      headline: { en: "Story headline", es: "Titular de la historia" },
      body: { en: plainTextBlock("body"), es: plainTextBlock("cuerpo") },
      category: foundationModelsCategory,
    },
  ],
  severities: ["ERROR"],
};

// Deliberately untranslated (no `.es` on any field) -- this is the fixture that would
// make the ruling's search-scoping vacuous if it collapsed to a single value like the
// prior round's fixture-degeneracy near-misses. Its English text contains "meltdown"
// too, so a naive unfiltered search would find it via English fallback text.
const untranslatedIssue = {
  _id: "issue-untranslated",
  issueNumber: 2,
  slug: "issue-002",
  publishDate: "2026-04-02",
  title: { en: "English Only Meltdown" },
  subtitle: { en: "No Spanish here" },
  nicosTransmission: { en: plainTextBlock("English only transmission") },
  stackTrace: [],
  stories: [
    {
      headline: { en: "English headline" },
      body: { en: plainTextBlock("english body") },
      category: foundationModelsCategory,
    },
  ],
  severities: ["WARNING"],
};

const translatedColumn = {
  _id: "column-translated",
  columnNumber: 1,
  slug: "2026-04-03",
  publishDate: "2026-04-03",
  title: { en: "The Ledger", es: "El Libro Mayor" },
  subtitle: { en: "On trust", es: "Sobre la confianza" },
  body: {
    en: plainTextBlock("English column body"),
    es: plainTextBlock("Cuerpo de la columna en español"),
  },
};

const untranslatedColumn = {
  _id: "column-untranslated",
  columnNumber: 2,
  slug: "2026-04-04",
  publishDate: "2026-04-04",
  title: { en: "English Only Column" },
  subtitle: { en: "No Spanish here either" },
  body: { en: plainTextBlock("english only meltdown column body") },
};

const issues = [translatedIssue, untranslatedIssue];
const columns = [translatedColumn, untranslatedColumn];

describe("buildArchiveIndex", () => {
  describe("es locale", () => {
    const index = buildArchiveIndex(issues, columns, "es");
    const byId = (id) => index.find((item) => item.id === id);

    it("includes the untranslated issue in the LISTING (not filtered out)", () => {
      expect(byId("issue-untranslated")).toBeDefined();
    });

    it("includes the untranslated column in the LISTING (not filtered out)", () => {
      expect(byId("column-untranslated")).toBeDefined();
    });

    it("marks the fully-translated issue and column searchable", () => {
      expect(byId("issue-translated").searchable).toBe(true);
      expect(byId("column-translated").searchable).toBe(true);
    });

    it("marks the untranslated issue and column NOT searchable", () => {
      expect(byId("issue-untranslated").searchable).toBe(false);
      expect(byId("column-untranslated").searchable).toBe(false);
    });

    it("carries the untranslated issue's category, so pills still reflect it", () => {
      // page.js's category-pill list is built by scanning every item's `categories` --
      // an untranslated issue that stays in the listing must still contribute its
      // category, or its pill silently disappears from an unfiltered browse.
      expect(byId("issue-untranslated").categories).toContainEqual(
        expect.objectContaining({ slug: "foundation-models" })
      );
    });
  });

  describe("en locale", () => {
    it("marks every issue and column searchable regardless of es translation status", () => {
      const index = buildArchiveIndex(issues, columns, "en");
      expect(index.every((item) => item.searchable === true)).toBe(true);
    });
  });

  it("es and en indexes have the same length -- the listing itself is not locale-filtered", () => {
    const esIndex = buildArchiveIndex(issues, columns, "es");
    const enIndex = buildArchiveIndex(issues, columns, "en");
    expect(esIndex).toHaveLength(enIndex.length);
    expect(esIndex).toHaveLength(4);
  });

  it("returns an empty array when issues and columns are both empty", () => {
    expect(buildArchiveIndex([], [], "es")).toEqual([]);
  });

  it("treats missing issues/columns arrays as empty rather than throwing", () => {
    expect(buildArchiveIndex(undefined, undefined, "es")).toEqual([]);
  });
});

describe("archive listing + search pipeline (buildArchiveIndex -> searchArchive)", () => {
  describe("no query (the browse listing)", () => {
    it("es: shows everything, including untranslated docs -- DIRECTION 1 of the ruling", () => {
      // This is the assertion that fails against a listing-scoped build (one that
      // filters translatedIssues/translatedColumns before mapping, as task 3 shipped
      // in the prior round): the untranslated doc would be missing from the index
      // entirely, and this would fail before ever reaching searchArchive.
      const index = buildArchiveIndex(issues, columns, "es");
      const results = searchArchive(index, {});
      const ids = results.map((r) => r.id);
      expect(ids).toContain("issue-untranslated");
      expect(ids).toContain("column-untranslated");
      expect(ids).toContain("issue-translated");
      expect(ids).toContain("column-translated");
    });
  });

  describe("text query active", () => {
    it("es: excludes the untranslated issue from matches even though its English text matches -- DIRECTION 2 of the ruling", () => {
      // This is the assertion that fails if searchArchive's `searchable === false`
      // exclusion were removed (a "no filter at all" mutant): "meltdown" appears in
      // the untranslated issue's English title, so an unfiltered search would return
      // it on /es/ even though the reader can't read a word of it.
      const index = buildArchiveIndex(issues, columns, "es");
      const results = searchArchive(index, { query: "meltdown" });
      expect(results.map((r) => r.id)).not.toContain("issue-untranslated");
    });

    it("es: excludes the untranslated column from matches for the same reason", () => {
      const index = buildArchiveIndex(issues, columns, "es");
      const results = searchArchive(index, { query: "meltdown" });
      expect(results.map((r) => r.id)).not.toContain("column-untranslated");
    });

    it("es: still matches the translated issue's real Spanish content", () => {
      const index = buildArchiveIndex(issues, columns, "es");
      const results = searchArchive(index, { query: "colapso" });
      expect(results.map((r) => r.id)).toContain("issue-translated");
    });

    it("en: the SAME query matches the untranslated issue, since en is always searchable", () => {
      const index = buildArchiveIndex(issues, columns, "en");
      const results = searchArchive(index, { query: "meltdown" });
      expect(results.map((r) => r.id)).toContain("issue-untranslated");
    });
  });

  describe("category pill only, no text query", () => {
    it("es: still includes the untranslated issue -- pills are a browse filter, not a search", () => {
      const index = buildArchiveIndex(issues, columns, "es");
      const results = searchArchive(index, {
        categories: ["foundation-models"],
      });
      expect(results.map((r) => r.id)).toContain("issue-untranslated");
    });
  });
});
