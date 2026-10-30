// ABOUTME: Guards the OG generators' font fallback: a font-loading failure must not break the image.
// ABOUTME: When loadOgFonts rejects, ImageResponse is built without a fonts option (built-in font).

import { describe, it, expect, vi, beforeEach } from "vitest";

const { imageResponse, loadOgFonts } = vi.hoisted(() => ({
  imageResponse: vi.fn(),
  loadOgFonts: vi.fn(),
}));

vi.mock("next/og", () => ({
  ImageResponse: class {
    constructor(element, options) {
      imageResponse(element, options);
    }
  },
}));
vi.mock("@/lib/ogFonts", () => ({ loadOgFonts }));
vi.mock("@/lib/queries", () => ({
  getIssueBySlug: vi.fn(async () => ({
    issueNumber: 1,
    title: { en: "Issue", es: "Edición" },
    publishDate: "2026-01-01",
  })),
}));

import SiteOgImage from "@/app/(site)/[locale]/opengraph-image";
import IssueOgImage from "@/app/(site)/[locale]/issue/[slug]/opengraph-image";

const generators = [
  ["site", () => SiteOgImage()],
  [
    "issue",
    () =>
      IssueOgImage({ params: Promise.resolve({ locale: "en", slug: "x" }) }),
  ],
];

beforeEach(() => {
  imageResponse.mockClear();
  loadOgFonts.mockReset();
});

describe.each(generators)("%s OG generator", (_name, run) => {
  it("still renders an image, without a fonts option, when font loading rejects", async () => {
    loadOgFonts.mockRejectedValue(new Error("network down"));
    await run();
    expect(imageResponse).toHaveBeenCalledTimes(1);
    const options = imageResponse.mock.calls[0][1];
    expect(options).toMatchObject({ width: 1200, height: 630 });
    expect(options).not.toHaveProperty("fonts");
  });

  it("passes Instrument Serif 400 and DM Mono 400/500 when font loading succeeds", async () => {
    loadOgFonts.mockResolvedValue([
      new ArrayBuffer(1),
      new ArrayBuffer(2),
      new ArrayBuffer(3),
    ]);
    await run();
    const { fonts } = imageResponse.mock.calls[0][1];
    expect(fonts.map((f) => [f.name, f.weight, f.data.byteLength])).toEqual([
      ["Instrument Serif", 400, 1],
      ["DM Mono", 400, 2],
      ["DM Mono", 500, 3],
    ]);
  });
});
