// ABOUTME: Tests that a series name carries its series colour class in every place it is shown as a label.
// ABOUTME: Covers the component, its CSS tokens, and the issue, article and home-cover kickers for all three series.

import { describe, it, expect, vi } from "vitest";
import { readFileSync } from "node:fs";
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

import SeriesName from "@/components/SeriesName";
import IssueHeader from "@/components/IssueHeader";
import ArticleLayout from "@/components/ArticleLayout";
import HomeCover from "@/components/HomeCover";

const SERIES = [
  ["offTheRails", "otr", "Off the Rails", "Fuera de las vías"],
  ["practical", "fix", "Practical", "Práctico"],
  ["nicosNotes", "note", "Nico’s Notes", "Notas de Nico"],
];

const DOCS = {
  offTheRails: { _type: "issue", issueNumber: 27, publishDate: "2026-06-11" },
  practical: {
    _type: "practical",
    practicalNumber: 12,
    publishDate: "2026-06-11",
  },
  nicosNotes: { _type: "column", columnNumber: 22, publishDate: "2026-06-11" },
};

describe("SeriesName", () => {
  it.each(SERIES)(
    "%s carries the %s colour class, EN and ES",
    (series, key, en, es) => {
      const { rerender } = render(<SeriesName series={series} locale="en" />);
      const el = screen.getByText(en);
      expect(el.className).toMatch(new RegExp(key));
      rerender(<SeriesName series={series} locale="es" />);
      expect(screen.getByText(es).className).toMatch(new RegExp(key));
    }
  );

  it("maps each class to a text-safe token", () => {
    const css = readFileSync("components/SeriesName.module.css", "utf8");
    expect(css).toMatch(/\.otr\s*\{\s*color:\s*var\(--terra-ink\)/);
    expect(css).toMatch(/\.fix\s*\{\s*color:\s*var\(--teal-ink\)/);
    expect(css).toMatch(/\.note\s*\{\s*color:\s*var\(--ink\)/);
  });

  it("renders nothing for an unknown series", () => {
    const { container } = render(<SeriesName series="nope" locale="en" />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("series name in kickers", () => {
  it("colours the series name in the issue kicker and leaves the code plain", () => {
    render(
      <IssueHeader
        locale="en"
        code="OTR-027"
        title="T"
        byline="Hector Luis Alamo"
      />
    );
    const name = screen.getByText("Off the Rails");
    expect(name.className).toMatch(/otr/);
    expect(name.parentElement.textContent).toBe(
      "Off the Rails · CASE FILE OTR-027"
    );
    expect(name.parentElement.className).not.toMatch(/otr/);
  });

  it.each(["practical", "nicosNotes"])(
    "colours the series name in the %s article kicker",
    (series) => {
      const [, key, en] = SERIES.find(([s]) => s === series);
      render(
        <ArticleLayout doc={DOCS[series]} locale="en" title="T" body={[]} />
      );
      expect(screen.getByText(en).className).toMatch(new RegExp(key));
    }
  );

  it.each(SERIES)(
    "colours the series name in the %s home cover kicker",
    (series, key, en) => {
      render(
        <HomeCover doc={{ ...DOCS[series], title: { en: "T" } }} locale="en" />
      );
      expect(screen.getByText(en).className).toMatch(new RegExp(key));
    }
  );
});
