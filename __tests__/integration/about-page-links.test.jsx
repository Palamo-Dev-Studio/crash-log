// ABOUTME: Integration tests for the About page's Palamo Studio links and parent-organization JSON-LD.
// ABOUTME: Renders the fallback About page in both locales and checks hrefs point to palamo.ai.

import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";

vi.mock("@/lib/queries", async (importOriginal) => ({
  ...(await importOriginal()),
  getAboutPage: vi.fn(async () => null),
}));

import AboutPage from "@/app/(site)/[locale]/about/page";

async function renderAbout(locale) {
  const ui = await AboutPage({ params: Promise.resolve({ locale }) });
  return render(ui);
}

describe.each(["en", "es"])("About page links [%s]", (locale) => {
  it("links Palamo Studio to https://palamo.ai", async () => {
    const { container } = await renderAbout(locale);
    const links = [...container.querySelectorAll("a")].filter(
      (a) => a.textContent.trim() === "Palamo Studio"
    );
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      expect(link).toHaveAttribute("href", "https://palamo.ai");
    }
  });

  it("has no http(s) link to palamostudio.com", async () => {
    const { container } = await renderAbout(locale);
    const hrefs = [...container.querySelectorAll("a")].map((a) =>
      a.getAttribute("href")
    );
    expect(
      hrefs.filter((h) => /^https?:\/\/([^/]*\.)?palamostudio\.com/.test(h))
    ).toEqual([]);
  });

  it("points parentOrganization.url in the JSON-LD at https://palamo.ai", async () => {
    const { container } = await renderAbout(locale);
    const script = container.querySelector(
      'script[type="application/ld+json"]'
    );
    const jsonLd = JSON.parse(script.textContent);
    expect(jsonLd.parentOrganization.url).toBe("https://palamo.ai");
  });
});
