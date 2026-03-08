// ABOUTME: Unit tests for lib/columnEmailTemplate.js — column email subject and HTML builder.
// ABOUTME: Validates email structure, localized labels, and cover image rendering.

import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/portableTextToHtml", () => ({
  portableTextToHtml: vi.fn((blocks) => {
    if (!blocks) return "";
    return "<p>Mock body content</p>";
  }),
}));

vi.mock("@/lib/sanity", () => ({
  urlFor: vi.fn(() => ({
    width: vi.fn().mockReturnThis(),
    format: vi.fn().mockReturnThis(),
    url: vi.fn(() => "https://cdn.sanity.io/mock-cover.jpg"),
  })),
}));

import {
  buildColumnEmailSubject,
  buildColumnEmailHtml,
} from "@/lib/columnEmailTemplate";

const mockColumn = {
  columnNumber: 1,
  slug: "2026-03-07",
  publishDate: "2026-03-07T00:00:00.000Z",
  title: { en: "Week in Review", es: "Semana en Resumen" },
  subtitle: { en: "A busy week", es: "Una semana ocupada" },
  body: {
    en: [{ _type: "block", children: [{ text: "Hello" }] }],
    es: [{ _type: "block", children: [{ text: "Hola" }] }],
  },
  coverImage: { asset: { _ref: "image-123" } },
  coverImageAlt: { en: "Test cover", es: "Portada de prueba" },
};

describe("buildColumnEmailSubject", () => {
  it("formats EN subject with column number and title", () => {
    const subject = buildColumnEmailSubject(mockColumn, "en");
    expect(subject).toBe("Nico\u2019s Notes #001: Week in Review");
  });

  it("formats ES subject with column number and title", () => {
    const subject = buildColumnEmailSubject(mockColumn, "es");
    expect(subject).toBe("Notas de Nico #001: Semana en Resumen");
  });

  it("pads column number to 3 digits", () => {
    const subject = buildColumnEmailSubject(
      { ...mockColumn, columnNumber: 42 },
      "en"
    );
    expect(subject).toContain("#042");
  });
});

describe("buildColumnEmailHtml", () => {
  it("returns valid HTML document", () => {
    const html = buildColumnEmailHtml(mockColumn, "en");
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain('<html lang="en">');
    expect(html).toContain("</html>");
  });

  it("includes THE CRASH LOG header", () => {
    const html = buildColumnEmailHtml(mockColumn, "en");
    expect(html).toContain("THE CRASH LOG");
    expect(html).toContain("AI &amp; Tech Gone Off the Rails");
  });

  it("includes column meta with Nico\u2019s Notes prefix", () => {
    const html = buildColumnEmailHtml(mockColumn, "en");
    expect(html).toContain("Nico\u2019s Notes");
    expect(html).toContain("#001");
    expect(html).toContain("2026-03-07");
  });

  it("includes title and subtitle", () => {
    const html = buildColumnEmailHtml(mockColumn, "en");
    expect(html).toContain("Week in Review");
    expect(html).toContain("A busy week");
  });

  it("includes cover image when present", () => {
    const html = buildColumnEmailHtml(mockColumn, "en");
    expect(html).toContain("https://cdn.sanity.io/mock-cover.jpg");
    expect(html).toContain("Test cover");
  });

  it("omits cover image when absent", () => {
    const column = { ...mockColumn, coverImage: null };
    const html = buildColumnEmailHtml(column, "en");
    expect(html).not.toContain("mock-cover.jpg");
  });

  it("includes body content", () => {
    const html = buildColumnEmailHtml(mockColumn, "en");
    expect(html).toContain("Mock body content");
  });

  it("includes Nico signature", () => {
    const html = buildColumnEmailHtml(mockColumn, "en");
    expect(html).toContain("\u2014 Nico");
  });

  it("includes unsubscribe link", () => {
    const html = buildColumnEmailHtml(mockColumn, "en");
    expect(html).toContain("{unsubscribe_url}");
    expect(html).toContain("Unsubscribe");
  });

  it("includes view in browser link", () => {
    const html = buildColumnEmailHtml(mockColumn, "en");
    expect(html).toContain("https://crashlog.ai/en/nico/2026-03-07");
    expect(html).toContain("View in browser");
  });

  it("renders Spanish labels for es locale", () => {
    const html = buildColumnEmailHtml(mockColumn, "es");
    expect(html).toContain('<html lang="es">');
    expect(html).toContain("Notas de Nico");
    expect(html).toContain("Semana en Resumen");
    expect(html).toContain("Ver en el navegador");
    expect(html).toContain("Cancelar suscripci\u00F3n");
  });

  it("uses Nico accent color for column prefix", () => {
    const html = buildColumnEmailHtml(mockColumn, "en");
    expect(html).toContain("#e8453e");
  });
});
