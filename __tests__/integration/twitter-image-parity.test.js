// ABOUTME: Property guard: every opengraph-image.js under app/ has a sibling twitter-image.js re-exporting it.
// ABOUTME: Without the sibling, twitter:image falls back to a parent card while og:image is the page's own.

import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

const APP_ROOT = path.resolve(import.meta.dirname, "../../app");

function findOgImages(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return findOgImages(full);
    return entry.name === "opengraph-image.js" ? [full] : [];
  });
}

const ogImages = findOgImages(APP_ROOT);

describe("twitter-image parity", () => {
  it("finds the opengraph-image routes", () => {
    expect(ogImages.length).toBeGreaterThan(0);
  });

  it.each(ogImages.map((f) => [path.relative(APP_ROOT, f), f]))(
    "%s has a sibling twitter-image.js that re-exports it",
    (_rel, ogFile) => {
      const twitterFile = path.join(path.dirname(ogFile), "twitter-image.js");
      expect(fs.existsSync(twitterFile), "twitter-image.js missing").toBe(true);
      const src = fs.readFileSync(twitterFile, "utf8");
      expect(src).toMatch(
        /export\s*\{\s*default\s*,\s*alt\s*,\s*size\s*,\s*contentType\s*\}\s*from\s*["']\.\/opengraph-image["']/
      );
    }
  );
});
