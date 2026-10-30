// ABOUTME: Unit tests for CaseCard: stamp text, summary fallback, image + credit, source line, read link with ?ref.
// ABOUTME: Fixtures: verdict != severity, summary != first paragraph, two sources, a story with an image beside one without.

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/image", () => ({
  default: ({ src, alt, priority, ...props }) => (
    <img src={src} alt={alt} {...props} />
  ),
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

import CaseCard from "@/components/CaseCard";

const para = (text) => ({
  _type: "block",
  children: [{ _type: "span", text }],
});

const STORY = {
  _id: "s1",
  severity: "ERROR",
  verdict: { en: "BILLED TO YOU", es: "LA PAGAS TÚ" },
  headline: { en: "Memory gets pricey", es: "La memoria se encarece" },
  summary: { en: "Short summary.", es: "Resumen corto." },
  body: { en: [para("Body first para."), para("Body second para.")] },
  image: { asset: { _ref: "image-1" } },
  imageAlt: { en: "A chip", es: "Un chip" },
  imageCredit: "Image: Anthropic",
  sources: [
    { outlet: "Reuters", url: "https://reuters.com/a" },
    { outlet: "AP", url: "https://ap.org/b" },
  ],
};

describe("CaseCard", () => {
  it("shows the zero-padded case number (EN and ES words)", () => {
    const { rerender } = render(
      <CaseCard story={STORY} index={2} locale="en" />
    );
    expect(screen.getByText("Case 03")).toBeInTheDocument();
    rerender(<CaseCard story={STORY} index={2} locale="es" />);
    expect(screen.getByText("Caso 03")).toBeInTheDocument();
  });

  it("stamps the verdict, not the severity", () => {
    render(<CaseCard story={STORY} index={0} locale="en" />);
    expect(screen.getByText("BILLED TO YOU")).toBeInTheDocument();
    expect(screen.queryByText("ERROR")).not.toBeInTheDocument();
  });

  it("stamps the severity when there is no verdict", () => {
    render(
      <CaseCard
        story={{ ...STORY, verdict: undefined }}
        index={0}
        locale="en"
      />
    );
    expect(screen.getByText("ERROR")).toBeInTheDocument();
  });

  it("renders the localized headline as an h2", () => {
    render(<CaseCard story={STORY} index={0} locale="es" />);
    expect(
      screen.getByRole("heading", { level: 2, name: "La memoria se encarece" })
    ).toBeInTheDocument();
  });

  it("uses the summary, not the body", () => {
    render(<CaseCard story={STORY} index={0} locale="en" />);
    expect(screen.getByText("Short summary.")).toBeInTheDocument();
    expect(screen.queryByText(/Body first para/)).not.toBeInTheDocument();
  });

  it("falls back to the body's first paragraph only", () => {
    render(
      <CaseCard
        story={{ ...STORY, summary: undefined }}
        index={0}
        locale="en"
      />
    );
    expect(screen.getByText("Body first para.")).toBeInTheDocument();
    expect(screen.queryByText(/Body second para/)).not.toBeInTheDocument();
  });

  it("renders the image with alt and credit line when present", () => {
    render(<CaseCard story={STORY} index={0} locale="es" />);
    expect(screen.getByRole("img", { name: "Un chip" })).toBeInTheDocument();
    expect(screen.getByText("Image: Anthropic")).toBeInTheDocument();
  });

  it("renders no image box or credit without an image", () => {
    render(
      <CaseCard story={{ ...STORY, image: undefined }} index={0} locale="en" />
    );
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.queryByText("Image: Anthropic")).not.toBeInTheDocument();
  });

  it("shows the first source's outlet and +N for the others", () => {
    render(<CaseCard story={STORY} index={0} locale="en" />);
    expect(screen.getByText("Source")).toBeInTheDocument();
    expect(screen.getByText("Reuters", { exact: false })).toBeInTheDocument();
    expect(screen.getByText(/\+1/)).toBeInTheDocument();
    expect(screen.queryByText(/AP/)).not.toBeInTheDocument();
  });

  it("omits +N for a single source", () => {
    render(
      <CaseCard
        story={{ ...STORY, sources: [STORY.sources[0]] }}
        index={0}
        locale="en"
      />
    );
    expect(screen.queryByText(/\+\d/)).not.toBeInTheDocument();
  });

  it("links 'Read the file' to the first source URL with ref=crashlog.ai, opening externally", () => {
    render(<CaseCard story={STORY} index={0} locale="en" />);
    const link = screen.getByRole("link", { name: /Read the file/ });
    expect(link).toHaveAttribute(
      "href",
      "https://reuters.com/a?ref=crashlog.ai"
    );
    expect(link).toHaveAttribute("target", "_blank");
    expect(link.getAttribute("rel")).toContain("noopener");
  });

  it("uses the Spanish read label", () => {
    render(<CaseCard story={STORY} index={0} locale="es" />);
    expect(
      screen.getByRole("link", { name: /Leer el expediente/ })
    ).toBeInTheDocument();
  });

  it("renders no read link and no dead anchor when the source has no URL", () => {
    render(
      <CaseCard
        story={{ ...STORY, sources: [{ outlet: "FDA" }] }}
        index={0}
        locale="en"
      />
    );
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText("FDA")).toBeInTheDocument();
  });

  it("renders no source line or link with no sources", () => {
    render(
      <CaseCard story={{ ...STORY, sources: [] }} index={0} locale="en" />
    );
    expect(screen.queryByText("Source")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("links the case number to its full file only when fileId is given", () => {
    const { rerender } = render(
      <CaseCard story={STORY} index={0} locale="en" fileId="case-file-01" />
    );
    expect(screen.getByRole("link", { name: "Case 01" })).toHaveAttribute(
      "href",
      "#case-file-01"
    );
    rerender(<CaseCard story={STORY} index={0} locale="en" />);
    expect(
      screen.queryByRole("link", { name: "Case 01" })
    ).not.toBeInTheDocument();
  });
});
