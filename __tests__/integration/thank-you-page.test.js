// ABOUTME: Integration tests for the subscribe thank-you page route.
// ABOUTME: Validates noindex metadata and correct titles for both locales.

import { describe, it, expect } from "vitest";
import { generateMetadata } from "@/app/(site)/[locale]/subscribe/thank-you/page";

describe("thank-you page generateMetadata", () => {
  it("returns noindex robots for English locale", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "en" }),
    });

    expect(metadata.title).toBe("Subscription Confirmed");
    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(metadata.openGraph.title).toBe(
      "Subscription Confirmed \u2014 The Crash Log"
    );
    expect(metadata.openGraph.locale).toBe("en_US");
  });

  it("returns noindex robots for Spanish locale", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "es" }),
    });

    expect(metadata.title).toBe("Suscripci\u00F3n Confirmada");
    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(metadata.openGraph.title).toBe(
      "Suscripci\u00F3n Confirmada \u2014 The Crash Log"
    );
    expect(metadata.openGraph.locale).toBe("es_ES");
  });
});
