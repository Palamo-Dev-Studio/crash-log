// ABOUTME: Integration test that the Practical page passes the doc's cover image and localized alt text to ArticleLayout.
// ABOUTME: Guards against the cover image being fetched but never rendered on the article page.

import { describe, it, expect, vi } from "vitest";

const coverImage = {
  _type: "image",
  asset: { _ref: "image-abc123-1200x675-jpg", _type: "reference" },
};

vi.mock("@/lib/queries", () => ({
  getPracticalBySlug: vi.fn(async () => ({
    _type: "practical",
    practicalNumber: 1,
    title: { en: "Audit Your Agent", es: "Audita tu agente" },
    publishDate: "2026-11-04",
    coverImage: {
      _type: "image",
      asset: { _ref: "image-abc123-1200x675-jpg", _type: "reference" },
    },
    coverImageAlt: {
      en: "A desk with a laptop",
      es: "Un escritorio con una laptop",
    },
  })),
  getAllPracticalSlugs: vi.fn(),
}));

import PracticalPage from "@/app/(site)/[locale]/practical/[slug]/page";

describe("practical page cover image", () => {
  it.each([
    ["en", "A desk with a laptop"],
    ["es", "Un escritorio con una laptop"],
  ])(
    "passes coverImage and localized coverImageAlt to ArticleLayout (%s)",
    async (locale, alt) => {
      const tree = await PracticalPage({
        params: Promise.resolve({ locale, slug: "2026-11-04" }),
      });
      const layout = tree.props.children[1];
      expect(layout.props.coverImage).toEqual(coverImage);
      expect(layout.props.coverImageAlt).toBe(alt);
    }
  );
});
