// ABOUTME: Property guard: every opengraph-image file under app/ has a sibling twitter image of the same kind.
// ABOUTME: Code OG routes need a twitter-image re-export; static OG images (png/jpg) need a static twitter image.

import { describe, it, expect } from "vitest";
import fs from "fs";
import os from "os";
import path from "path";

const APP_ROOT = path.resolve(import.meta.dirname, "../../app");

const OG_PATTERN = /^opengraph-image\.(js|jsx|tsx|png|jpg)$/;
const CODE_EXT = new Set(["js", "jsx", "tsx"]);
const REEXPORT =
  /export\s*\{\s*default\s*,\s*alt\s*,\s*size\s*,\s*contentType\s*\}\s*from\s*["']\.\/opengraph-image["']/;

function findOgImages(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return findOgImages(full);
    return OG_PATTERN.test(entry.name) ? [full] : [];
  });
}

// Returns a list of human-readable violations for one opengraph-image file.
function parityViolations(ogFile) {
  const dir = path.dirname(ogFile);
  const ext = path.extname(ogFile).slice(1);
  if (CODE_EXT.has(ext)) {
    const twitter = ["js", "jsx", "tsx"]
      .map((e) => path.join(dir, `twitter-image.${e}`))
      .find((f) => fs.existsSync(f));
    if (!twitter) return ["no sibling twitter-image code file"];
    return REEXPORT.test(fs.readFileSync(twitter, "utf8"))
      ? []
      : ["twitter-image does not re-export ./opengraph-image"];
  }
  // A static OG image cannot be re-exported, so it needs its own static twitter image.
  const hasStatic = ["png", "jpg", "jpeg"].some((e) =>
    fs.existsSync(path.join(dir, `twitter-image.${e}`))
  );
  return hasStatic ? [] : ["no sibling static twitter-image (png/jpg)"];
}

const ogImages = findOgImages(APP_ROOT);

describe("twitter-image parity", () => {
  it("finds the opengraph-image routes", () => {
    expect(ogImages.length).toBeGreaterThan(0);
  });

  it.each(ogImages.map((f) => [path.relative(APP_ROOT, f), f]))(
    "%s has a matching sibling twitter image",
    (_rel, ogFile) => {
      expect(parityViolations(ogFile)).toEqual([]);
    }
  );
});

describe("twitter-image parity checker", () => {
  function fixture(files) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "og-parity-"));
    for (const [name, body] of Object.entries(files)) {
      fs.writeFileSync(path.join(dir, name), body);
    }
    return dir;
  }

  it("discovers every OG extension, not only .js", () => {
    const dir = fixture({
      "opengraph-image.png": "",
      "x.txt": "",
    });
    expect(findOgImages(dir)).toEqual([path.join(dir, "opengraph-image.png")]);
    for (const ext of ["js", "jsx", "tsx", "png", "jpg"]) {
      expect(OG_PATTERN.test(`opengraph-image.${ext}`)).toBe(true);
    }
    expect(OG_PATTERN.test("opengraph-image.gif")).toBe(false);
  });

  it("flags a .png OG image with no twitter image, accepts a .png twitter image", () => {
    const bare = fixture({ "opengraph-image.png": "" });
    expect(
      parityViolations(path.join(bare, "opengraph-image.png"))
    ).not.toEqual([]);
    const paired = fixture({
      "opengraph-image.png": "",
      "twitter-image.png": "",
    });
    expect(parityViolations(path.join(paired, "opengraph-image.png"))).toEqual(
      []
    );
  });

  it("flags a code OG route whose twitter image is missing or not a re-export", () => {
    const missing = fixture({ "opengraph-image.tsx": "" });
    expect(
      parityViolations(path.join(missing, "opengraph-image.tsx"))
    ).not.toEqual([]);
    const wrong = fixture({
      "opengraph-image.js": "",
      "twitter-image.js": "export default function T() {}",
    });
    expect(
      parityViolations(path.join(wrong, "opengraph-image.js"))
    ).not.toEqual([]);
    const ok = fixture({
      "opengraph-image.js": "",
      "twitter-image.js":
        'export { default, alt, size, contentType } from "./opengraph-image";',
    });
    expect(parityViolations(path.join(ok, "opengraph-image.js"))).toEqual([]);
  });
});
