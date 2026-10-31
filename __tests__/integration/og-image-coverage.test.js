// ABOUTME: Guards og:image coverage across every public page route under app/(site)/[locale].
// ABOUTME: A page that sets its own openGraph must carry images or sit beside an opengraph-image.js.

import { describe, it, expect, vi } from "vitest";
import fs from "fs";
import path from "path";

// Fixtures cover the populated branch of each dynamic page so generateMetadata
// reaches the code that builds openGraph (the not-found branches return no
// openGraph at all and would hide the defect).
vi.mock("@/lib/queries", async (importOriginal) => ({
  ...(await importOriginal()),
  getHomeFeed: vi.fn(async () => []),
  getIssueBySlug: vi.fn(async () => ({
    issueNumber: 1,
    title: { en: "Issue", es: "Edición" },
    metaDescription: { en: "desc", es: "desc" },
    publishDate: "2026-01-01",
  })),
  getColumnBySlug: vi.fn(async () => ({
    columnNumber: 1,
    title: { en: "Column", es: "Columna" },
    metaDescription: { en: "desc", es: "desc" },
    publishDate: "2026-01-01",
  })),
  getPracticalBySlug: vi.fn(async () => ({
    practicalNumber: 1,
    title: { en: "Practical", es: "Práctico" },
    metaDescription: { en: "desc", es: "desc" },
    publishDate: "2026-01-01",
  })),
  getCategoryWithStories: vi.fn(async () => ({
    category: {
      name: { en: "Beat", es: "Sección" },
      description: { en: "desc", es: "desc" },
    },
    stories: [],
  })),
}));

const APP_ROOT = path.resolve(import.meta.dirname, "../../app");
const PAGE_PREFIX = "/app/(site)/[locale]/";

// `[locale]` is a character class in glob syntax, so glob broadly and filter by prefix.
const allPages = import.meta.glob("/app/**/page.js");
const pageEntries = Object.entries(allPages)
  .filter(([file]) => file.startsWith(PAGE_PREFIX))
  .sort(([a], [b]) => a.localeCompare(b));

function sampleParams(file, locale) {
  const params = { locale };
  if (file.includes("/[slug]/")) params.slug = "sample-slug";
  return params;
}

function hasSiblingOgImage(file) {
  const dir = path.dirname(path.join(APP_ROOT, "..", file));
  return fs.existsSync(path.join(dir, "opengraph-image.js"));
}

describe("og:image coverage for (site)/[locale] pages", () => {
  it("discovers the full set of page routes", () => {
    // Guards against a vacuous pass if the glob silently matches nothing.
    expect(pageEntries.length).toBeGreaterThanOrEqual(9);
  });

  for (const [file, load] of pageEntries) {
    for (const locale of ["en", "es"]) {
      it(`${file.slice(PAGE_PREFIX.length)} [${locale}] has an og:image`, async () => {
        if (hasSiblingOgImage(file)) return;

        const mod = await load();
        const metadata =
          typeof mod.generateMetadata === "function"
            ? await mod.generateMetadata({
                params: Promise.resolve(sampleParams(file, locale)),
              })
            : mod.metadata;

        // A page that sets no openGraph inherits the segment's image untouched.
        if (!metadata?.openGraph) return;

        const images = metadata.openGraph.images;
        expect(
          Array.isArray(images) ? images.length : images ? 1 : 0
        ).toBeGreaterThan(0);
      });
    }
  }
});
