// ABOUTME: Integration test for the Practical page generateMetadata title fallback.
// ABOUTME: A Practical with no localized title falls back to its zero-padded file code, the same code the page shows.

import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/queries", () => ({
  getPracticalBySlug: vi.fn(),
  getAllPracticalSlugs: vi.fn(),
}));

import { getPracticalBySlug } from "@/lib/queries";
import { generateMetadata } from "@/app/(site)/[locale]/practical/[slug]/page";

const params = (locale = "en") =>
  Promise.resolve({ locale, slug: "audit-your-agent" });

describe("practical page generateMetadata", () => {
  it("falls back to the padded file code when the title is missing", async () => {
    getPracticalBySlug.mockResolvedValueOnce({
      _type: "practical",
      practicalNumber: 7,
    });
    const metadata = await generateMetadata({ params: params() });
    expect(metadata.title).toBe("FIX-007");
    expect(metadata.openGraph.title).toBe("FIX-007 — Practical");
  });

  it("uses the localized title when there is one", async () => {
    getPracticalBySlug.mockResolvedValueOnce({
      _type: "practical",
      practicalNumber: 7,
      title: { en: "Audit Your Agent", es: "Audita a tu agente" },
    });
    const metadata = await generateMetadata({ params: params("es") });
    expect(metadata.title).toBe("Audita a tu agente");
  });
});
