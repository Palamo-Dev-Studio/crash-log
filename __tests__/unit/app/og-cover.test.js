// ABOUTME: Guards of the cover OG path, each tested alone: JPEG validation, blank-PNG detection, fetch timeout, eager render.
// ABOUTME: next/og, Sanity, fonts and fetch are mocked here; the real renderer is exercised in integration/og-cover-render.test.js.

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  solidJpeg,
  cmykJpeg,
  truncatedJpeg,
  junkBytes,
  opaquePng,
  transparentPng,
  blackRgbPng,
} from "../../helpers/ogFixtures";

// What the mocked renderer hands back as its PNG, and whether it throws while encoding.
const render = vi.hoisted(() => ({ png: null, throwOnBytes: false }));
const imageResponse = vi.hoisted(() => vi.fn());

vi.mock("next/og", () => ({
  ImageResponse: class {
    constructor(element, options) {
      imageResponse(element, options);
      this.headers = new Headers({ "content-type": "image/png" });
    }
    async arrayBuffer() {
      if (render.throwOnBytes) throw new Error("Invalid JPEG");
      return render.png;
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
const base = {
  publishDate: "2026-10-30",
  stories: [{}],
  title: { en: "Check the Backups", es: "Revisa las copias" },
};
let current;
vi.mock("@/lib/queries", () => ({
  getIssueBySlug: vi.fn(async () => current.issue),
  getColumnBySlug: vi.fn(async () => current.column),
  getPracticalBySlug: vi.fn(async () => current.practical),
}));

import { TitleCard } from "@/lib/ogTemplate";
import { CoverCard, isRenderableJpeg, isBlankPng } from "@/lib/ogCover";
import IssueOg from "@/app/(site)/[locale]/issue/[slug]/opengraph-image";
import ColumnOg from "@/app/(site)/[locale]/nico/[slug]/opengraph-image";
import PracticalOg from "@/app/(site)/[locale]/practical/[slug]/opengraph-image";
import IssueTw from "@/app/(site)/[locale]/issue/[slug]/twitter-image";
import ColumnTw from "@/app/(site)/[locale]/nico/[slug]/twitter-image";
import PracticalTw from "@/app/(site)/[locale]/practical/[slug]/twitter-image";

const ROUTES = [
  ["issue", IssueOg, IssueTw],
  ["column", ColumnOg, ColumnTw],
  ["practical", PracticalOg, PracticalTw],
];

const fetchMock = vi.fn();
let jpeg;
let opaque;

const reply = (bytes, init = {}) =>
  new Response(bytes, {
    status: 200,
    headers: { "content-type": "image/jpeg" },
    ...init,
  });

beforeEach(async () => {
  jpeg ??= await solidJpeg();
  opaque ??= await opaquePng();
  imageResponse.mockClear();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  render.png = opaque;
  render.throwOnBytes = false;
  current = {
    issue: { ...base, _type: "issue", issueNumber: 7, coverImage: COVER },
    column: { ...base, _type: "column", columnNumber: 7, coverImage: COVER },
    practical: {
      ...base,
      _type: "practical",
      practicalNumber: 7,
      coverImage: COVER,
    },
  };
});
afterEach(() => vi.unstubAllGlobals());

const lastElement = () => imageResponse.mock.calls.at(-1)[0];

describe("isRenderableJpeg", () => {
  it("accepts a real baseline JPEG", async () => {
    expect(isRenderableJpeg(await solidJpeg())).toBe(true);
  });
  it("rejects bytes that do not start with the JPEG signature", async () => {
    expect(isRenderableJpeg(junkBytes())).toBe(false);
    const withBadStart = Buffer.from(await solidJpeg());
    withBadStart[0] = 0x00;
    expect(isRenderableJpeg(withBadStart)).toBe(false);
  });
  it("rejects a JPEG missing its end marker", async () => {
    expect(isRenderableJpeg(await truncatedJpeg())).toBe(false);
  });
  it("rejects a CMYK (4 component) JPEG", async () => {
    expect(isRenderableJpeg(await cmykJpeg())).toBe(false);
  });
  it("rejects an empty or tiny body", () => {
    expect(isRenderableJpeg(Buffer.alloc(0))).toBe(false);
    expect(isRenderableJpeg(Buffer.from([0xff, 0xd8, 0xff]))).toBe(false);
  });
  it("rejects a JPEG whose scan starts before any frame header", () => {
    const bytes = Buffer.from([
      0xff, 0xd8, 0xff, 0xda, 0x00, 0x02, 0xff, 0xc0, 0x00, 0x11, 0x08, 0x00,
      0x01, 0x00, 0x01, 0x03, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0xff, 0xd9,
    ]);
    expect(isRenderableJpeg(bytes)).toBe(false);
  });
  it("rejects a frame header with a component count other than 1 or 3", async () => {
    const odd = Buffer.from(await solidJpeg());
    const sof = odd.findIndex(
      (b, i) => b === 0xff && odd[i + 1] >= 0xc0 && odd[i + 1] <= 0xc2
    );
    odd[sof + 9] = 2;
    expect(isRenderableJpeg(odd)).toBe(false);
  });
  it("accepts a 1 component (greyscale) JPEG", async () => {
    const grey = Buffer.from(await solidJpeg());
    const sof = grey.findIndex(
      (b, i) => b === 0xff && grey[i + 1] >= 0xc0 && grey[i + 1] <= 0xc2
    );
    grey[sof + 9] = 1;
    expect(isRenderableJpeg(grey)).toBe(true);
  });
});

describe("isBlankPng", () => {
  it("is true for a fully transparent RGBA PNG", async () => {
    expect(isBlankPng(await transparentPng())).toBe(true);
  });
  it("is false for a PNG with pixels", async () => {
    expect(isBlankPng(await opaquePng())).toBe(false);
  });
  it("is false for bytes that are not a PNG, however short", () => {
    expect(isBlankPng(junkBytes())).toBe(false);
    expect(isBlankPng(Buffer.from("abc"))).toBe(false);
  });
  it("is false for an RGB PNG, a layout it does not inspect, even when every pixel is black", async () => {
    expect(isBlankPng(await blackRgbPng())).toBe(false);
  });
});

describe.each(ROUTES)("%s OG route", (_name, og, tw) => {
  const key = _name;
  describe.each(["en", "es"])("%s", (locale) => {
    const run = () => og({ params: Promise.resolve({ locale, slug: "x" }) });

    it("returns the eagerly rendered cover PNG", async () => {
      fetchMock.mockResolvedValue(reply(jpeg));
      const res = await run();
      expect(res).toBeInstanceOf(Response);
      expect(res.headers.get("content-type")).toBe("image/png");
      expect(Buffer.from(await res.arrayBuffer()).equals(opaque)).toBe(true);
      expect(lastElement().type).toBe(CoverCard);
      expect(lastElement().props.src).toBe(
        `data:image/jpeg;base64,${jpeg.toString("base64")}`
      );
      expect(fetchMock.mock.calls[0][0]).toBe(
        "https://cdn.example/image-abc-2400x1600-png?w=1200&h=630&fit=crop&fm=jpg&q=85"
      );
    });

    it("renders the TitleCard when the doc has no cover", async () => {
      delete current[key].coverImage;
      await run();
      expect(lastElement().type).toBe(TitleCard);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("renders the TitleCard when the fetch throws", async () => {
      fetchMock.mockRejectedValue(new Error("network down"));
      await run();
      expect(lastElement().type).toBe(TitleCard);
    });

    it("renders the TitleCard on an error status that carries image bytes", async () => {
      fetchMock.mockResolvedValue(reply(jpeg, { status: 404 }));
      await run();
      expect(lastElement().type).toBe(TitleCard);
    });

    it("renders the TitleCard when the type is image/png, not the JPEG requested", async () => {
      fetchMock.mockResolvedValue(
        reply(jpeg, { headers: { "content-type": "image/png" } })
      );
      await run();
      expect(lastElement().type).toBe(TitleCard);
    });

    it("renders the TitleCard when the type is not an image", async () => {
      fetchMock.mockResolvedValue(
        reply(jpeg, { headers: { "content-type": "text/html" } })
      );
      await run();
      expect(lastElement().type).toBe(TitleCard);
    });

    it("renders the TitleCard for an empty body", async () => {
      fetchMock.mockResolvedValue(reply(Buffer.alloc(0)));
      await run();
      expect(lastElement().type).toBe(TitleCard);
    });

    it("renders the TitleCard when the renderer throws while encoding", async () => {
      fetchMock.mockResolvedValue(reply(jpeg));
      render.throwOnBytes = true;
      const res = await run();
      expect(lastElement().type).toBe(TitleCard);
    });

    it("renders the TitleCard when the cover renders blank", async () => {
      fetchMock.mockResolvedValue(reply(jpeg));
      render.png = await transparentPng();
      await run();
      expect(lastElement().type).toBe(TitleCard);
    });
  });

  it("twitter image is the same generator as the OG image", () => {
    expect(tw).toBe(og);
  });
});

describe("cover fetch timeout", () => {
  const run = () =>
    IssueOg({ params: Promise.resolve({ locale: "en", slug: "x" }) });

  it("passes an AbortSignal that is still live", async () => {
    fetchMock.mockResolvedValue(reply(jpeg));
    await run();
    const { signal } = fetchMock.mock.calls[0][1];
    expect(signal).toBeInstanceOf(AbortSignal);
    expect(signal.aborted).toBe(false);
  });

  it("asks for a 5 second timeout and falls back to the TitleCard when it fires", async () => {
    const timeout = vi
      .spyOn(AbortSignal, "timeout")
      .mockReturnValue(AbortSignal.abort());
    fetchMock.mockImplementation((_url, { signal }) =>
      signal.aborted
        ? Promise.reject(signal.reason)
        : Promise.resolve(reply(jpeg))
    );
    await run();
    expect(timeout).toHaveBeenCalledWith(5000);
    expect(lastElement().type).toBe(TitleCard);
    timeout.mockRestore();
  });
});
