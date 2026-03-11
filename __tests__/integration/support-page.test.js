// ABOUTME: Integration tests for the support page route.
// ABOUTME: Validates metadata, SEO fields, and hreflang alternates for both locales.

import { describe, it, expect } from "vitest";
import { generateMetadata } from "@/app/(site)/[locale]/support/page";

describe("support page generateMetadata", () => {
  it("returns correct metadata for English locale", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "en" }),
    });

    expect(metadata.title).toBe("Support");
    expect(metadata.description).toMatch(/independent AI newsroom/);
    expect(metadata.openGraph.title).toBe("Support \u2014 The Crash Log");
    expect(metadata.openGraph.locale).toBe("en_US");
    expect(metadata.openGraph.url).toBe("https://crashlog.ai/en/support");
    expect(metadata.alternates.canonical).toBe(
      "https://crashlog.ai/en/support"
    );
    expect(metadata.alternates.languages["en-US"]).toBe("/en/support");
    expect(metadata.alternates.languages["es-ES"]).toBe("/es/support");
    expect(metadata.alternates.languages["x-default"]).toBe("/en/support");
  });

  it("returns correct metadata for Spanish locale", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "es" }),
    });

    expect(metadata.title).toBe("Apoya");
    expect(metadata.description).toMatch(/redacci\u00f3n de IA independiente/);
    expect(metadata.openGraph.title).toBe("Apoya \u2014 The Crash Log");
    expect(metadata.openGraph.locale).toBe("es_ES");
    expect(metadata.openGraph.url).toBe("https://crashlog.ai/es/support");
    expect(metadata.alternates.canonical).toBe(
      "https://crashlog.ai/es/support"
    );
  });
});
