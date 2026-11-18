// @vitest-environment node
// ABOUTME: Runs the real next/og renderer on cover images: the route's PNG must hold the cover's pixels, or the cream TitleCard.
// ABOUTME: Junk, truncated, CMYK and empty covers must yield the TitleCard; only Sanity, queries, fonts and fetch are stubbed.

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  CREAM,
  COVER_COLOUR,
  solidJpeg,
  cmykJpeg,
  truncatedJpeg,
  junkBytes,
  pixelAt,
  near,
} from "../helpers/ogFixtures";

vi.mock("@/lib/ogFonts", () => ({
  loadOgFonts: vi.fn(async () => {
    throw new Error("fonts unavailable in this test");
  }),
}));
vi.mock("@/lib/sanity", () => ({
  urlFor: (source) => {
    const chain = new Proxy(
      {},
      { get: (_t, prop) => (prop === "url" ? () => source.url : () => chain) }
    );
    return chain;
  },
}));

let current;
vi.mock("@/lib/queries", () => ({
  getIssueBySlug: vi.fn(async () => current),
  getColumnBySlug: vi.fn(async () => current),
  getPracticalBySlug: vi.fn(async () => current),
}));

import IssueOg from "@/app/(site)/[locale]/issue/[slug]/opengraph-image";
import ColumnOg from "@/app/(site)/[locale]/nico/[slug]/opengraph-image";
import PracticalOg from "@/app/(site)/[locale]/practical/[slug]/opengraph-image";

const ROUTES = [
  ["issue", IssueOg],
  ["nico", ColumnOg],
  ["practical", PracticalOg],
];

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  current = {
    _type: "issue",
    issueNumber: 7,
    columnNumber: 7,
    practicalNumber: 7,
    title: { en: "Check the Backups", es: "Revisa las copias" },
    publishDate: "2026-10-30",
    stories: [{}],
    coverImage: { url: "https://cdn.example/cover.jpg" },
  };
});
afterEach(() => vi.unstubAllGlobals());

const reply = (bytes, type = "image/jpeg") =>
  new Response(bytes, { status: 200, headers: { "content-type": type } });

async function render(route, locale) {
  const res = await route({ params: Promise.resolve({ locale, slug: "x" }) });
  expect(res.status).toBe(200);
  expect(res.headers.get("content-type")).toContain("image/png");
  const bytes = Buffer.from(await res.arrayBuffer());
  return bytes;
}

// The TitleCard's frame is cream at the corner; the cover is its own colour everywhere.
async function expectTitleCard(bytes) {
  expect(near(await pixelAt(bytes, 6, 6), CREAM, 2)).toBe(true);
}

describe.each(ROUTES)("%s route with the real renderer", (_name, route) => {
  describe.each(["en", "es"])("%s", (locale) => {
    it("paints the cover's pixels at the centre and the corner", async () => {
      fetchMock.mockResolvedValue(reply(await solidJpeg()));
      const png = await render(route, locale);
      expect(near(await pixelAt(png, 600, 315), COVER_COLOUR)).toBe(true);
      expect(near(await pixelAt(png, 6, 6), COVER_COLOUR)).toBe(true);
    });

    it("renders the cream TitleCard when the doc has no cover", async () => {
      delete current.coverImage;
      await expectTitleCard(await render(route, locale));
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it.each([
      ["junk bytes under an image/jpeg type", async () => junkBytes()],
      ["a truncated JPEG", truncatedJpeg],
      ["a CMYK JPEG", cmykJpeg],
      ["an empty body", async () => Buffer.alloc(0)],
    ])("renders the TitleCard for %s", async (_label, makeBytes) => {
      fetchMock.mockResolvedValue(reply(await makeBytes()));
      await expectTitleCard(await render(route, locale));
    });

    it("renders the TitleCard when the fetch fails", async () => {
      fetchMock.mockRejectedValue(new Error("network down"));
      await expectTitleCard(await render(route, locale));
    });
  });
});
