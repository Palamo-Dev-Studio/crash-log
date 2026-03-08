// ABOUTME: Unit tests for lib/locale.js — t(), hasFullTranslation(), and constants.
// ABOUTME: Validates bilingual field resolution, translation detection, and exported locale data.

import { describe, it, expect } from "vitest";
import {
  LOCALES,
  DEFAULT_LOCALE,
  LOCALE_LABELS,
  LOCALE_OG,
  t,
  hasFullTranslation,
} from "@/lib/locale";

describe("LOCALES constant", () => {
  it("contains en and es", () => {
    expect(LOCALES).toEqual(["en", "es"]);
  });
});

describe("DEFAULT_LOCALE constant", () => {
  it('defaults to "en"', () => {
    expect(DEFAULT_LOCALE).toBe("en");
  });
});

describe("LOCALE_LABELS constant", () => {
  it("maps en → en-US and es → es-ES", () => {
    expect(LOCALE_LABELS).toEqual({ en: "en-US", es: "es-ES" });
  });
});

describe("LOCALE_OG constant", () => {
  it("maps en → en_US and es → es_ES", () => {
    expect(LOCALE_OG).toEqual({ en: "en_US", es: "es_ES" });
  });
});

describe("t()", () => {
  it("returns the locale value when present", () => {
    expect(t({ en: "Hello", es: "Hola" }, "es")).toBe("Hola");
  });

  it("falls back to en when requested locale is missing", () => {
    expect(t({ en: "Hello" }, "es")).toBe("Hello");
  });

  it("returns null when field is null", () => {
    expect(t(null, "en")).toBeNull();
  });

  it("returns null when field is undefined", () => {
    expect(t(undefined, "en")).toBeNull();
  });

  it("returns null when field has no matching keys", () => {
    expect(t({}, "es")).toBeNull();
  });

  it("returns en value for en locale", () => {
    expect(t({ en: "Hello", es: "Hola" }, "en")).toBe("Hello");
  });
});

describe("hasFullTranslation()", () => {
  it("returns true for default locale (en)", () => {
    expect(hasFullTranslation({}, "en")).toBe(true);
  });

  it("returns true when issue is null (defensive guard)", () => {
    expect(hasFullTranslation(null, "es")).toBe(true);
  });

  it("returns false when title.es is missing", () => {
    const issue = {
      title: { en: "Hello" },
      nicosTransmission: { es: [{ _type: "block" }] },
    };
    expect(hasFullTranslation(issue, "es")).toBe(false);
  });

  it("returns false when nicosTransmission.es is missing", () => {
    const issue = {
      title: { en: "Hello", es: "Hola" },
      nicosTransmission: { en: [{ _type: "block" }] },
    };
    expect(hasFullTranslation(issue, "es")).toBe(false);
  });

  it("returns false when nicosTransmission.es is empty array", () => {
    const issue = {
      title: { en: "Hello", es: "Hola" },
      nicosTransmission: { es: [] },
    };
    expect(hasFullTranslation(issue, "es")).toBe(false);
  });

  it("returns true when both title.es and nicosTransmission.es are present", () => {
    const issue = {
      title: { en: "Hello", es: "Hola" },
      nicosTransmission: { es: [{ _type: "block" }] },
    };
    expect(hasFullTranslation(issue, "es")).toBe(true);
  });

  it("checks custom bodyField when option is provided", () => {
    const column = {
      title: { en: "Hello", es: "Hola" },
      body: { es: [{ _type: "block" }] },
    };
    expect(hasFullTranslation(column, "es", { bodyField: "body" })).toBe(true);
  });

  it("returns false when custom bodyField is missing translation", () => {
    const column = {
      title: { en: "Hello", es: "Hola" },
      body: { en: [{ _type: "block" }] },
    };
    expect(hasFullTranslation(column, "es", { bodyField: "body" })).toBe(false);
  });

  it("returns false when custom bodyField is empty array", () => {
    const column = {
      title: { en: "Hello", es: "Hola" },
      body: { es: [] },
    };
    expect(hasFullTranslation(column, "es", { bodyField: "body" })).toBe(false);
  });
});
