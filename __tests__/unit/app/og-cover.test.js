// ABOUTME: The issue, Nico's Notes and Practical OG/twitter image routes render the article's cover when it has one.
// ABOUTME: No cover, a failed fetch or a non-image reply all fall back to the TitleCard; Sanity, fonts and fetch are mocked.

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const { imageResponse } = vi.hoisted(() => ({ imageResponse: vi.fn() }));

vi.mock("next/og", () => ({
  ImageResponse: class {
    constructor(element, options) {
      imageResponse(element, options);
    }
  },
}));
vi.mock("@/lib/ogFonts", () => ({
  loadOgFonts: vi.fn(async () => [new ArrayBuffer(1)]),
}));

// urlFor records the builder calls in the URL, so the test can read crop, size and format back.
vi.mock("@/lib/sanity", () => ({
  urlFor: (source) => {
    const parts = [];
    const chain = {
      width: (n) => (parts.push(`w=${n}`), chain),
      height: (n) => (parts.push(`h=${n}`), chain),
      fit: (v) => (parts.push(`fit=${v}`), chain),
      format: (v) => (parts.push(`fm=${v}`), chain),
      quality: (n) => (parts.push(`q=${n}`), chain),
      url: () =>
        `https://cdn.example/${source?.asset?._ref ?? "none"}?${parts.join("&")}`,
    };
    return chain;
  },
}));

const COVER = { asset: { _ref: "image-abc-2400x1600-png" } };

// Cover docs and cover-less docs differ in coverImage only; titles stay the same so the
// assertions can tell the cover card from the TitleCard by element type, not by text.
const base = {
  publishDate: "2026-10-30",
  stories: [{}],
  title: { en: "Check the Backups", es: "Revisa las copias" },
  coverImageAlt: { en: "A backup tape", es: "Una cinta" },
};
const docs = {
  issue: { ...base, _type: "issue", issueNumber: 7 },
  column: { ...base, _type: "column", columnNumber: 7 },
  practical: { ...base, _type: "practical", practicalNumber: 7 },
};
let current;

vi.mock("@/lib/queries", () => ({
  getIssueBySlug: vi.fn(async () => current.issue),
  getColumnBySlug: vi.fn(async () => current.column),
  getPracticalBySlug: vi.fn(async () => current.practical),
}));

import { TitleCard } from "@/lib/ogTemplate";
import { CoverCard } from "@/lib/ogCover";
import IssueOg from "@/app/(site)/[locale]/issue/[slug]/opengraph-image";
import ColumnOg from "@/app/(site)/[locale]/nico/[slug]/opengraph-image";
import PracticalOg from "@/app/(site)/[locale]/practical/[slug]/opengraph-image";
import IssueTw from "@/app/(site)/[locale]/issue/[slug]/twitter-image";
import ColumnTw from "@/app/(site)/[locale]/nico/[slug]/twitter-image";
import PracticalTw from "@/app/(site)/[locale]/practical/[slug]/twitter-image";

const ROUTES = [
  ["issue", "issue", IssueOg, IssueTw],
  ["column", "column", ColumnOg, ColumnTw],
  ["practical", "practical", PracticalOg, PracticalTw],
];

const JPEG_BYTES = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3, 4]);
const EXPECTED_SRC = `data:image/jpeg;base64,${JPEG_BYTES.toString("base64")}`;

function okImage() {
  return new Response(JPEG_BYTES, {
    status: 200,
    headers: { "content-type": "image/jpeg" },
  });
}

const fetchMock = vi.fn();

beforeEach(() => {
  imageResponse.mockClear();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  current = {
    issue: { ...docs.issue, coverImage: COVER },
    column: { ...docs.column, coverImage: COVER },
    practical: { ...docs.practical, coverImage: COVER },
  };
});
afterEach(() => vi.unstubAllGlobals());

async function render(route, locale) {
  await route({ params: Promise.resolve({ locale, slug: "x" }) });
  expect(imageResponse).toHaveBeenCalledTimes(1);
  return imageResponse.mock.calls[0];
}

describe.each(ROUTES)("%s OG route", (_name, key, og, tw) => {
  describe.each(["en", "es"])("%s", (locale) => {
    it("renders the cover full-bleed when the doc has one", async () => {
      fetchMock.mockResolvedValue(okImage());
      const [element, options] = await render(og, locale);
      expect(element.type).toBe(CoverCard);
      expect(element.props.src).toBe(EXPECTED_SRC);
      expect(element.props.alt).toBe(base.title[locale]);
      expect(options).toMatchObject({ width: 1200, height: 630 });
      const url = fetchMock.mock.calls[0][0];
      expect(url).toBe(
        "https://cdn.example/image-abc-2400x1600-png?w=1200&h=630&fit=crop&fm=jpg&q=85"
      );
    });

    it("renders the TitleCard when the doc has no cover", async () => {
      current[key] = { ...docs[key] };
      const [element] = await render(og, locale);
      expect(element.type).toBe(TitleCard);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("renders the TitleCard when the cover fetch throws", async () => {
      fetchMock.mockRejectedValue(new Error("network down"));
      const [element] = await render(og, locale);
      expect(element.type).toBe(TitleCard);
    });

    it("renders the TitleCard when the cover fetch returns an error status", async () => {
      // An image content type with a 404 status isolates the status check from the type check.
      fetchMock.mockResolvedValue(
        new Response(JPEG_BYTES, {
          status: 404,
          headers: { "content-type": "image/jpeg" },
        })
      );
      const [element] = await render(og, locale);
      expect(element.type).toBe(TitleCard);
    });

    it("renders the TitleCard when the reply is not an image", async () => {
      fetchMock.mockResolvedValue(
        new Response("<html>", {
          status: 200,
          headers: { "content-type": "text/html" },
        })
      );
      const [element] = await render(og, locale);
      expect(element.type).toBe(TitleCard);
    });
  });

  it("twitter image is the same generator as the OG image", () => {
    expect(tw).toBe(og);
  });
});
