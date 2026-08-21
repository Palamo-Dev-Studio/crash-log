// ABOUTME: Integration tests for the archive page's buildArchiveIndex().
// ABOUTME: Validates that the es index omits untranslated documents instead of falling back to English.

import { describe, it, expect } from "vitest";
import { buildArchiveIndex } from "@/app/(site)/[locale]/archive/page";

const plainTextBlock = (text) => [{ _type: "block", children: [{ text }] }];

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
  stories: [],
  severities: ["ERROR"],
};

const untranslatedIssue = {
  _id: "issue-untranslated",
  issueNumber: 2,
  slug: "issue-002",
  publishDate: "2026-04-02",
  title: { en: "English Only Issue" },
  subtitle: { en: "No Spanish here" },
  nicosTransmission: { en: plainTextBlock("English only transmission") },
  stackTrace: [],
  stories: [],
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
  body: { en: plainTextBlock("English only column body") },
};

describe("buildArchiveIndex", () => {
  describe("es locale", () => {
    const ids = buildArchiveIndex(
      [translatedIssue, untranslatedIssue],
      [translatedColumn, untranslatedColumn],
      "es"
    ).map((item) => item.id);

    it("includes the fully-translated issue", () => {
      expect(ids).toContain("issue-translated");
    });

    it("omits the untranslated issue instead of indexing its English fallback", () => {
      expect(ids).not.toContain("issue-untranslated");
    });

    it("includes the fully-translated column", () => {
      expect(ids).toContain("column-translated");
    });

    it("omits the untranslated column instead of indexing its English fallback", () => {
      expect(ids).not.toContain("column-untranslated");
    });
  });

  describe("en locale", () => {
    const ids = buildArchiveIndex(
      [translatedIssue, untranslatedIssue],
      [translatedColumn, untranslatedColumn],
      "en"
    ).map((item) => item.id);

    it("includes every issue and column regardless of Spanish translation status", () => {
      expect(ids.sort()).toEqual(
        [
          "issue-translated",
          "issue-untranslated",
          "column-translated",
          "column-untranslated",
        ].sort()
      );
    });
  });

  it("returns an empty array when issues and columns are both empty", () => {
    expect(buildArchiveIndex([], [], "es")).toEqual([]);
  });

  it("treats missing issues/columns arrays as empty rather than throwing", () => {
    expect(buildArchiveIndex(undefined, undefined, "es")).toEqual([]);
  });
});
