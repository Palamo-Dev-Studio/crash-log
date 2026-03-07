// ABOUTME: Unit tests for the email template builder.
// ABOUTME: Validates subject line, HTML output structure, and locale variants.

import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/sanity", () => {
  const stub = {
    url: () => "https://cdn.sanity.io/images/test/production/test-image.jpg",
    width: () => stub,
    height: () => stub,
    format: () => stub,
    fit: () => stub,
    quality: () => stub,
    auto: () => stub,
  };
  return {
    urlFor: () => stub,
  };
});

vi.mock("@/lib/portableTextToHtml", () => ({
  portableTextToHtml: vi.fn((blocks) => {
    if (!blocks || (Array.isArray(blocks) && blocks.length === 0)) return "";
    return "<p>Mock portable text content</p>";
  }),
}));

import { buildEmailSubject, buildEmailHtml } from "@/lib/emailTemplate";

const makeIssue = (overrides = {}) => ({
  issueNumber: 1,
  slug: "crash-log-001",
  publishDate: "2026-03-06",
  title: {
    en: "Hallucination Is Now a Feature",
    es: "La alucinación es una función",
  },
  subtitle: {
    en: "Welcome to the new normal.",
    es: "Bienvenido a la nueva normalidad.",
  },
  nicosTransmission: {
    en: [
      {
        _type: "block",
        _key: "a",
        children: [{ _type: "span", text: "Hello" }],
      },
    ],
    es: [
      {
        _type: "block",
        _key: "b",
        children: [{ _type: "span", text: "Hola" }],
      },
    ],
  },
  stories: [
    {
      _id: "story-1",
      severity: { en: "EXPLOIT", es: "EXPLOIT" },
      headline: { en: "AI Goes Rogue", es: "La IA se descontrola" },
      body: {
        en: [
          {
            _type: "block",
            _key: "c",
            children: [{ _type: "span", text: "Story body" }],
          },
        ],
        es: [
          {
            _type: "block",
            _key: "d",
            children: [{ _type: "span", text: "Cuerpo" }],
          },
        ],
      },
      category: {
        name: { en: "Foundation Models", es: "Modelos base" },
        slug: { current: "foundation-models" },
      },
      sources: [
        { sourceOutlet: "Reuters", url: "https://reuters.com/article" },
      ],
    },
  ],
  stackTrace: [
    {
      text: { en: "A quick hit", es: "Un dato rápido" },
      sourceUrl: "https://example.com",
      sourceOutlet: "Example",
    },
  ],
  ...overrides,
});

describe("buildEmailSubject", () => {
  it("formats subject with padded issue number and EN title", () => {
    const subject = buildEmailSubject(makeIssue(), "en");
    expect(subject).toBe("The Crash Log #001: Hallucination Is Now a Feature");
  });

  it("formats subject with ES title for Spanish locale", () => {
    const subject = buildEmailSubject(makeIssue(), "es");
    expect(subject).toBe("The Crash Log #001: La alucinación es una función");
  });

  it("zero-pads issue numbers", () => {
    const subject = buildEmailSubject(makeIssue({ issueNumber: 14 }), "en");
    expect(subject).toBe("The Crash Log #014: Hallucination Is Now a Feature");
  });

  it("defaults to en locale", () => {
    const subject = buildEmailSubject(makeIssue());
    expect(subject).toBe("The Crash Log #001: Hallucination Is Now a Feature");
  });
});

describe("buildEmailHtml", () => {
  it("starts with <!DOCTYPE html>", () => {
    const html = buildEmailHtml(makeIssue(), "en");
    expect(html.trimStart()).toMatch(/^<!DOCTYPE html>/);
  });

  it("sets correct lang attribute", () => {
    const htmlEn = buildEmailHtml(makeIssue(), "en");
    expect(htmlEn).toContain('<html lang="en">');

    const htmlEs = buildEmailHtml(makeIssue(), "es");
    expect(htmlEs).toContain('<html lang="es">');
  });

  it("contains the issue title", () => {
    const html = buildEmailHtml(makeIssue(), "en");
    expect(html).toContain("Hallucination Is Now a Feature");
  });

  it("contains the Spanish title for ES locale", () => {
    const html = buildEmailHtml(makeIssue(), "es");
    expect(html).toContain("La alucinaci\u00F3n es una funci\u00F3n");
  });

  it("contains the subtitle", () => {
    const html = buildEmailHtml(makeIssue(), "en");
    expect(html).toContain("Welcome to the new normal.");
  });

  it("renders issue meta with number and date", () => {
    const html = buildEmailHtml(makeIssue(), "en");
    expect(html).toContain("Issue #001");
    expect(html).toContain("2026-03-06");
  });

  it("renders Spanish issue prefix", () => {
    const html = buildEmailHtml(makeIssue(), "es");
    expect(html).toContain("Edici\u00F3n #001");
  });

  it("renders stories with severity badges", () => {
    const html = buildEmailHtml(makeIssue(), "en");
    expect(html).toContain("EXPLOIT");
    expect(html).toContain("AI Goes Rogue");
  });

  it("renders Nico's Transmission section", () => {
    const html = buildEmailHtml(makeIssue(), "en");
    expect(html).toContain("Nico\u2019s Transmission");
    expect(html).toContain("Mock portable text content");
  });

  it("renders Stack Trace section", () => {
    const html = buildEmailHtml(makeIssue(), "en");
    expect(html).toContain("Stack Trace");
    expect(html).toContain("Mock portable text content");
  });

  it("renders Stack Trace source links", () => {
    const html = buildEmailHtml(makeIssue(), "en");
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain("Example");
  });

  it("does not contain CSS var() references", () => {
    const html = buildEmailHtml(makeIssue(), "en");
    expect(html).not.toContain("var(--");
  });

  it("contains {unsubscribe_url} merge tag", () => {
    const html = buildEmailHtml(makeIssue(), "en");
    expect(html).toContain("{unsubscribe_url}");
  });

  it("contains view in browser link with correct locale", () => {
    const htmlEn = buildEmailHtml(makeIssue(), "en");
    expect(htmlEn).toContain("https://crashlog.ai/en/issue/crash-log-001");
    expect(htmlEn).toContain("View in browser");

    const htmlEs = buildEmailHtml(makeIssue(), "es");
    expect(htmlEs).toContain("https://crashlog.ai/es/issue/crash-log-001");
    expect(htmlEs).toContain("Ver en el navegador");
  });

  it("renders cover image when present", () => {
    const issue = makeIssue({
      coverImage: { asset: { _ref: "image-abc-720x405-jpg" } },
      coverImageAlt: { en: "A cover", es: "Una portada" },
    });
    const html = buildEmailHtml(issue, "en");
    expect(html).toContain("https://cdn.sanity.io");
    expect(html).toContain('alt="A cover"');
  });

  it("omits cover image when absent", () => {
    const issue = makeIssue({ coverImage: null });
    const html = buildEmailHtml(issue, "en");
    // No img tag outside of story content
    const headerSection = html.split("Mock portable text")[0];
    expect(headerSection).not.toContain("<img");
  });

  it("renders story source links", () => {
    const html = buildEmailHtml(makeIssue(), "en");
    expect(html).toContain('href="https://reuters.com/article"');
    expect(html).toContain("Reuters");
  });

  it("renders category name", () => {
    const html = buildEmailHtml(makeIssue(), "en");
    expect(html).toContain("Foundation Models");
  });

  it("handles issue with no stories gracefully", () => {
    const html = buildEmailHtml(makeIssue({ stories: [] }), "en");
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("Hallucination Is Now a Feature");
  });

  it("handles issue with no stack trace gracefully", () => {
    const html = buildEmailHtml(makeIssue({ stackTrace: [] }), "en");
    // The Stack Trace section header should not appear
    const stackTraceHeaderPattern = /letter-spacing.*Stack Trace/;
    expect(html).not.toMatch(stackTraceHeaderPattern);
    // Verify no stack trace items rendered
    expect(html).not.toContain("A quick hit");
  });

  it("handles issue with no Nico's Transmission gracefully", () => {
    const html = buildEmailHtml(
      makeIssue({ nicosTransmission: { en: [], es: [] } }),
      "en"
    );
    expect(html).not.toContain("Nico\u2019s Transmission");
  });

  it("includes Google Fonts link", () => {
    const html = buildEmailHtml(makeIssue(), "en");
    expect(html).toContain("fonts.googleapis.com");
    expect(html).toContain("Space+Grotesk");
    expect(html).toContain("IBM+Plex+Mono");
  });

  it("uses THE CRASH LOG as header text", () => {
    const html = buildEmailHtml(makeIssue(), "en");
    expect(html).toContain("THE CRASH LOG");
  });
});
