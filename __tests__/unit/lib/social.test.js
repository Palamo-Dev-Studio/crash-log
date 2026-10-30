// ABOUTME: Tests that footer links, JSON-LD sameAs and lib/social.js agree, and that no X handle remains.
// ABOUTME: Includes a source scan of app, components and lib for retired social strings.

import { describe, it, expect, vi } from "vitest";
import { readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";
import { render } from "@testing-library/react";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import Footer from "@/components/Footer";
import { BLUESKY_URL, INSTAGRAM_URL, TIKTOK_URL, SAME_AS } from "@/lib/social";

function sourceFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(js|jsx|mjs)$/.test(name) ? [path] : [];
  });
}

describe("social links", () => {
  it("pins the three profile URLs", () => {
    expect(BLUESKY_URL).toBe(
      "https://bsky.app/profile/hectoralamo.bsky.social"
    );
    expect(INSTAGRAM_URL).toBe("https://www.instagram.com/hectoralamo.ai");
    expect(TIKTOK_URL).toBe("https://www.tiktok.com/@hectorluisalamo");
    expect(SAME_AS).toEqual([BLUESKY_URL, INSTAGRAM_URL, TIKTOK_URL]);
  });

  it("footer Follow hrefs equal the sameAs entries, in order", () => {
    const { container } = render(<Footer locale="en" />);
    const hrefs = ["Bluesky", "Instagram", "TikTok"].map((name) =>
      Array.from(container.querySelectorAll("a"))
        .find((a) => a.textContent === name)
        ?.getAttribute("href")
    );
    expect(hrefs).toEqual(SAME_AS);
  });

  it("layout and about JSON-LD take sameAs from the shared constant", () => {
    for (const file of [
      "app/(site)/[locale]/layout.js",
      "app/(site)/[locale]/about/page.js",
    ]) {
      const src = readFileSync(file, "utf-8");
      expect(src).toMatch(/sameAs:\s*SAME_AS/);
      expect(src).toContain('from "@/lib/social"');
    }
  });

  it("leaves no X/Twitter or old Instagram strings in app, components or lib", () => {
    const banned = /\bx\.com\b|\btwitter\.com\b|crashlognews/i;
    const hits = ["app", "components", "lib"]
      .flatMap(sourceFiles)
      .filter((f) => banned.test(readFileSync(f, "utf-8")));
    expect(hits).toEqual([]);
  });

  it("twitter metadata keeps the card type but no site or creator handle", () => {
    const src = readFileSync("app/(site)/[locale]/layout.js", "utf-8");
    expect(src).toContain('card: "summary_large_image"');
    expect(src).not.toMatch(/\b(site|creator):\s*"@/);
  });
});
