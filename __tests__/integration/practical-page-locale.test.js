// ABOUTME: Integration test that the Practical page JSON-LD does not throw for a locale outside LOCALES.
// ABOUTME: Series index labels fall back to English, as at every other call site.

import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/queries", () => ({
  getPracticalBySlug: vi.fn(async () => ({
    _type: "practical",
    practicalNumber: 7,
    title: { en: "Audit Your Agent" },
    publishDate: "2026-10-30",
  })),
  getAllPracticalSlugs: vi.fn(),
}));

import PracticalPage from "@/app/(site)/[locale]/practical/[slug]/page";

describe("practical page with an unsupported locale", () => {
  it("builds the JSON-LD with the English index label instead of throwing", async () => {
    const tree = await PracticalPage({
      params: Promise.resolve({ locale: "fr", slug: "audit-your-agent" }),
    });
    const jsonLd = tree.props.children[0];
    expect(() => jsonLd.type(jsonLd.props)).not.toThrow();
  });
});
