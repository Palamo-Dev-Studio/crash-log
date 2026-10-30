// ABOUTME: Every opengraph/twitter image route returns a 1200x630 ImageResponse built from the shared Field Manual template.
// ABOUTME: Fonts and Sanity are mocked; the captured element tree proves which template each route renders and with what content.

import { describe, it, expect, vi, beforeEach } from "vitest";

const { imageResponse } = vi.hoisted(() => ({ imageResponse: vi.fn() }));

vi.mock("next/og", () => ({
  ImageResponse: class {
    constructor(element, options) {
      imageResponse(element, options);
    }
  },
}));
vi.mock("@/lib/ogFonts", () => ({
  loadOgFonts: vi.fn(async () => [
    new ArrayBuffer(1),
    new ArrayBuffer(2),
    new ArrayBuffer(3),
  ]),
}));
vi.mock("@/lib/queries", () => ({
  getIssueBySlug: vi.fn(async (slug) =>
    slug === "missing"
      ? null
      : {
          _type: "issue",
          issueNumber: 27,
          title: {
            en: "Cutting Humans Out of the Loop",
            es: "Sacar al humano",
          },
          publishDate: "2026-06-11",
          stories: [{}, {}, {}],
        }
  ),
  getColumnBySlug: vi.fn(async () => ({
    _type: "column",
    columnNumber: 22,
    title: { en: "All the Powers", es: "Todos los poderes" },
    publishDate: "2026-10-23",
  })),
  getPracticalBySlug: vi.fn(async () => ({
    _type: "practical",
    practicalNumber: 12,
    title: { en: "Check the Backups", es: "Revisa las copias" },
    publishDate: "2026-10-30",
  })),
  getCategoryWithStories: vi.fn(async (slug) =>
    slug === "missing"
      ? null
      : { category: { name: { en: "Security", es: "Seguridad" } }, stories: [] }
  ),
}));

import { SiteCard, TitleCard } from "@/lib/ogTemplate";

// `[locale]` is a character class in glob syntax, so glob broadly and filter by prefix.
const ROUTES = Object.fromEntries(
  Object.entries(import.meta.glob("/app/**/opengraph-image.js")).filter(
    ([file]) => file.startsWith("/app/(site)/[locale]/")
  )
);

const params = (locale, slug) => Promise.resolve({ locale, slug });

async function render(file, locale, slug) {
  imageResponse.mockClear();
  const mod = await ROUTES[file]();
  await mod.default({ params: params(locale, slug) });
  expect(imageResponse).toHaveBeenCalledTimes(1);
  const [element, options] = imageResponse.mock.calls[0];
  return { mod, element, options };
}

const R = "/app/(site)/[locale]";

beforeEach(() => imageResponse.mockClear());

describe("OG image routes", () => {
  it("discovers all twelve opengraph-image routes", () => {
    expect(Object.keys(ROUTES)).toHaveLength(12);
  });

  it("every route declares a 1200x630 PNG", async () => {
    for (const load of Object.values(ROUTES)) {
      const mod = await load();
      expect(mod.size).toEqual({ width: 1200, height: 630 });
      expect(mod.contentType).toBe("image/png");
      expect(typeof mod.alt).toBe("string");
    }
  });

  it.each(Object.keys(ROUTES))(
    "%s renders through the shared template at 1200x630 with the Field Manual fonts",
    async (file) => {
      const { element, options } = await render(file, "en", "sample");
      expect([SiteCard, TitleCard]).toContain(element.type);
      expect(options).toMatchObject({ width: 1200, height: 630 });
      expect(options.fonts.map((f) => [f.name, f.weight])).toEqual([
        ["Instrument Serif", 400],
        ["DM Mono", 400],
        ["DM Mono", 500],
      ]);
    }
  );

  it("site route renders the site card in both locales", async () => {
    for (const locale of ["en", "es"]) {
      const { element } = await render(`${R}/opengraph-image.js`, locale);
      expect(element.type).toBe(SiteCard);
      expect(element.props.locale).toBe(locale);
    }
  });

  it("issue route carries OTR code, series, case count and date", async () => {
    const { element } = await render(
      `${R}/issue/[slug]/opengraph-image.js`,
      "en",
      "x"
    );
    expect(element.type).toBe(TitleCard);
    expect(element.props).toMatchObject({
      series: "offTheRails",
      code: "OTR-027",
      kicker: "Off the Rails",
      title: "Cutting Humans Out of the Loop",
    });
    expect(element.props.meta).toEqual(["3 CASES", "June 11, 2026"]);
  });

  it("issue route renders Spanish copy", async () => {
    const { element } = await render(
      `${R}/issue/[slug]/opengraph-image.js`,
      "es",
      "x"
    );
    expect(element.props.title).toBe("Sacar al humano");
    expect(element.props.kicker).toBe("Fuera de las vías");
    expect(element.props.meta[0]).toBe("3 CASOS");
    expect(element.props.meta[1]).toBe("11 de junio de 2026");
  });

  it("issue route falls back to the site card when the issue is missing", async () => {
    const { element } = await render(
      `${R}/issue/[slug]/opengraph-image.js`,
      "en",
      "missing"
    );
    expect(element.type).toBe(SiteCard);
  });

  it("column route carries NOTE code in the ink series", async () => {
    const { element } = await render(
      `${R}/nico/[slug]/opengraph-image.js`,
      "en",
      "x"
    );
    expect(element.props).toMatchObject({
      series: "nicosNotes",
      code: "NOTE-022",
      title: "All the Powers",
    });
  });

  it("practical route carries FIX code in the teal series", async () => {
    const { element } = await render(
      `${R}/practical/[slug]/opengraph-image.js`,
      "es",
      "x"
    );
    expect(element.props).toMatchObject({
      series: "practical",
      code: "FIX-012",
      title: "Revisa las copias",
    });
  });

  it.each([
    [
      "offTheRails",
      `${R}/off-the-rails/opengraph-image.js`,
      "Off the Rails",
      "Fuera de las vías",
    ],
    ["practical", `${R}/practical/opengraph-image.js`, "Practical", "Práctico"],
    [
      "nicosNotes",
      `${R}/nico/opengraph-image.js`,
      "Nico’s Notes",
      "Notas de Nico",
    ],
  ])(
    "%s index titles the series by name in EN and ES",
    async (series, file, en, es) => {
      const a = await render(file, "en");
      expect(a.element.props).toMatchObject({ series, title: en });
      expect(a.element.props.code).toBeUndefined();
      const b = await render(file, "es");
      expect(b.element.props.title).toBe(es);
    }
  );

  it.each([
    ["about", "About", "Acerca de"],
    ["support", "Support", "Apoya"],
    ["archive", "Archive", "Archivo"],
    ["beats", "Beats", "Secciones"],
  ])("%s page uses its page title in EN and ES", async (dir, en, es) => {
    const file = `${R}/${dir}/opengraph-image.js`;
    expect((await render(file, "en")).element.props.title).toBe(en);
    expect((await render(file, "es")).element.props.title).toBe(es);
  });

  it("beat route uses the category name, or the site card when missing", async () => {
    const file = `${R}/beat/[slug]/opengraph-image.js`;
    const ok = await render(file, "es", "security");
    expect(ok.element.props).toMatchObject({
      title: "Seguridad",
      kicker: "Sección",
    });
    const missing = await render(file, "en", "missing");
    expect(missing.element.type).toBe(SiteCard);
  });

  it("twitter-image routes re-export the matching opengraph image", async () => {
    const siteTwitter = await import("@/app/(site)/[locale]/twitter-image");
    const siteOg = await import("@/app/(site)/[locale]/opengraph-image");
    expect(siteTwitter.default).toBe(siteOg.default);
    const issueTwitter =
      await import("@/app/(site)/[locale]/issue/[slug]/twitter-image");
    const issueOg =
      await import("@/app/(site)/[locale]/issue/[slug]/opengraph-image");
    expect(issueTwitter.default).toBe(issueOg.default);
  });
});
