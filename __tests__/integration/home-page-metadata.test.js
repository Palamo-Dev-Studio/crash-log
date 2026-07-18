// ABOUTME: Integration tests for the home page (unified feed) generateMetadata.
// ABOUTME: Validates OG, Twitter card, and hreflang alternates for both the empty and populated feed states.

import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/queries", () => ({
  getHomeFeed: vi.fn(),
}));

import { getHomeFeed } from "@/lib/queries";
import { generateMetadata } from "@/app/(site)/[locale]/page";

describe("home page generateMetadata", () => {
  describe("empty feed", () => {
    it("returns complete metadata for English locale", async () => {
      getHomeFeed.mockResolvedValueOnce([]);

      const metadata = await generateMetadata({
        params: Promise.resolve({ locale: "en" }),
      });

      expect(metadata.title).toBe(
        "The Crash Log — AI & Tech Gone Off the Rails"
      );
      expect(metadata.description).toMatch(
        /newsletter about AI and tech failures/
      );
      expect(metadata.openGraph.title).toBe(metadata.title);
      expect(metadata.openGraph.description).toBe(metadata.description);
      expect(metadata.openGraph.locale).toBe("en_US");
      expect(metadata.openGraph.url).toBe("https://crashlog.ai/en");
      expect(metadata.twitter.card).toBe("summary_large_image");
      expect(metadata.twitter.title).toBe(metadata.title);
      expect(metadata.twitter.description).toBe(metadata.description);
      expect(metadata.alternates.canonical).toBe("https://crashlog.ai/en");
      expect(metadata.alternates.languages["en-US"]).toBe("/en");
      expect(metadata.alternates.languages["es-ES"]).toBe("/es");
      expect(metadata.alternates.languages["x-default"]).toBe("/en");
    });

    it("returns complete metadata for Spanish locale", async () => {
      getHomeFeed.mockResolvedValueOnce([]);

      const metadata = await generateMetadata({
        params: Promise.resolve({ locale: "es" }),
      });

      expect(metadata.title).toBe(
        "El Crash Log — IA y tecnología descarriladas"
      );
      expect(metadata.description).toMatch(/boletín sobre fallos de IA/);
      expect(metadata.openGraph.title).toBe(metadata.title);
      expect(metadata.openGraph.locale).toBe("es_ES");
      expect(metadata.openGraph.url).toBe("https://crashlog.ai/es");
      expect(metadata.twitter.card).toBe("summary_large_image");
      expect(metadata.twitter.title).toBe(metadata.title);
      expect(metadata.alternates.canonical).toBe("https://crashlog.ai/es");
    });
  });

  describe("populated feed", () => {
    const feed = [
      {
        _id: "issue-1",
        title: { en: "GPT-5 Meltdown", es: "El Colapso de GPT-5" },
        metaDescription: {
          en: "The latest models keep failing in new ways.",
          es: "Los modelos más nuevos siguen fallando de formas nuevas.",
        },
      },
    ];

    it("returns complete metadata (incl. Twitter card) for English locale", async () => {
      getHomeFeed.mockResolvedValueOnce(feed);

      const metadata = await generateMetadata({
        params: Promise.resolve({ locale: "en" }),
      });

      expect(metadata.title).toBe("GPT-5 Meltdown");
      expect(metadata.description).toBe(
        "The latest models keep failing in new ways."
      );
      expect(metadata.openGraph.title).toBe("GPT-5 Meltdown — The Crash Log");
      expect(metadata.openGraph.description).toBe(metadata.description);
      expect(metadata.openGraph.locale).toBe("en_US");
      expect(metadata.openGraph.url).toBe("https://crashlog.ai/en");
      expect(metadata.twitter.card).toBe("summary_large_image");
      expect(metadata.twitter.title).toBe("GPT-5 Meltdown — The Crash Log");
      expect(metadata.twitter.description).toBe(metadata.description);
      expect(metadata.alternates.canonical).toBe("https://crashlog.ai/en");
      expect(metadata.alternates.languages["en-US"]).toBe("/en");
      expect(metadata.alternates.languages["es-ES"]).toBe("/es");
      expect(metadata.alternates.languages["x-default"]).toBe("/en");
    });

    it("returns complete metadata (incl. Twitter card) for Spanish locale", async () => {
      getHomeFeed.mockResolvedValueOnce(feed);

      const metadata = await generateMetadata({
        params: Promise.resolve({ locale: "es" }),
      });

      expect(metadata.title).toBe("El Colapso de GPT-5");
      expect(metadata.description).toBe(
        "Los modelos más nuevos siguen fallando de formas nuevas."
      );
      expect(metadata.openGraph.title).toBe(
        "El Colapso de GPT-5 — The Crash Log"
      );
      expect(metadata.openGraph.locale).toBe("es_ES");
      expect(metadata.twitter.card).toBe("summary_large_image");
      expect(metadata.twitter.title).toBe(
        "El Colapso de GPT-5 — The Crash Log"
      );
      expect(metadata.alternates.canonical).toBe("https://crashlog.ai/es");
    });
  });
});
