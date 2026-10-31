// ABOUTME: The "New files every week. Free." subscribe line has one source; footer, home rail and article box must all render it.
// ABOUTME: Compares each surface's rendered text with the exported constant in EN and ES, so a stray literal in one surface fails.

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));
vi.mock("next/image", () => ({
  default: ({ src, alt }) => <img src={src} alt={alt} />,
}));
vi.mock("@/lib/sanity", () => ({
  urlFor: () => ({
    width() {
      return this;
    },
    height() {
      return this;
    },
    format() {
      return this;
    },
    url: () => "https://cdn.sanity.io/test.webp",
  }),
}));

import Footer from "@/components/Footer";
import HomeRail from "@/components/HomeRail";
import ArticleLayout from "@/components/ArticleLayout";
import { SUBSCRIBE_LINE } from "@/lib/substack";

const PRACTICAL = {
  _type: "practical",
  practicalNumber: 12,
  publishDate: "2026-11-04T10:00:00Z",
};

const surfaces = {
  footer: (locale) => <Footer locale={locale} />,
  rail: (locale) => <HomeRail rail={[]} locale={locale} />,
  article: (locale) => (
    <ArticleLayout
      doc={PRACTICAL}
      locale={locale}
      title="T"
      subtitle="S"
      body={[]}
      minutes={1}
      showSubscribe
    />
  ),
};

describe("subscribe line single source", () => {
  it("exports a non-empty line for each locale", () => {
    expect(SUBSCRIBE_LINE.en).toBeTruthy();
    expect(SUBSCRIBE_LINE.es).toBeTruthy();
  });

  for (const [name, make] of Object.entries(surfaces)) {
    for (const locale of ["en", "es"]) {
      it(`${name} renders the constant in ${locale}`, () => {
        const { container } = render(make(locale));
        expect(container.textContent).toContain(SUBSCRIBE_LINE[locale]);
        expect(screen.getAllByText(SUBSCRIBE_LINE[locale]).length).toBe(1);
      });
    }
  }
});
