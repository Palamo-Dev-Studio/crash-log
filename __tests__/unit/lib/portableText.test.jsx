// ABOUTME: Unit tests for lib/portableText.js — block renderers, mark renderers, and image type.
// ABOUTME: Validates that Portable Text components render correct HTML elements and attributes.

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }) => <img src={src} alt={alt} {...props} />,
}));

vi.mock("@/lib/sanity", () => ({
  urlFor: () => ({
    width: function () {
      return this;
    },
    height: function () {
      return this;
    },
    format: function () {
      return this;
    },
    url: () => "https://example.com/image.webp",
  }),
}));

import { portableTextComponents } from "@/lib/portableText";

const { block, marks, types } = portableTextComponents;

describe("block renderers", () => {
  it("normal renders <p>", () => {
    const Normal = block.normal;
    render(<Normal>Hello world</Normal>);
    expect(screen.getByText("Hello world").tagName).toBe("P");
  });

  it("h2 renders <h2>", () => {
    const H2 = block.h2;
    render(<H2>Heading 2</H2>);
    expect(screen.getByText("Heading 2").tagName).toBe("H2");
  });

  it("h3 renders <h3>", () => {
    const H3 = block.h3;
    render(<H3>Heading 3</H3>);
    expect(screen.getByText("Heading 3").tagName).toBe("H3");
  });

  it("blockquote renders <blockquote>", () => {
    const BQ = block.blockquote;
    render(<BQ>Quoted text</BQ>);
    expect(screen.getByText("Quoted text").tagName).toBe("BLOCKQUOTE");
  });
});

describe("mark renderers", () => {
  it("strong renders <strong>", () => {
    const Strong = marks.strong;
    render(<Strong>Bold text</Strong>);
    expect(screen.getByText("Bold text").tagName).toBe("STRONG");
  });

  it("em renders <em>", () => {
    const Em = marks.em;
    render(<Em>Italic text</Em>);
    expect(screen.getByText("Italic text").tagName).toBe("EM");
  });

  it("code renders <code>", () => {
    const Code = marks.code;
    render(<Code>inline code</Code>);
    expect(screen.getByText("inline code").tagName).toBe("CODE");
  });

  it("external link gets target=_blank and rel=noopener noreferrer", () => {
    const LinkMark = marks.link;
    render(
      <LinkMark value={{ href: "https://example.com" }}>External link</LinkMark>
    );
    const a = screen.getByText("External link");
    expect(a.tagName).toBe("A");
    expect(a).toHaveAttribute("target", "_blank");
    expect(a).toHaveAttribute("rel", "noopener noreferrer");
    expect(a).toHaveAttribute("href", "https://example.com");
  });

  it("internal link does not get target=_blank", () => {
    const LinkMark = marks.link;
    render(<LinkMark value={{ href: "/about" }}>Internal link</LinkMark>);
    const a = screen.getByText("Internal link");
    expect(a).not.toHaveAttribute("target");
    expect(a).not.toHaveAttribute("rel");
    expect(a).toHaveAttribute("href", "/about");
  });

  it("link falls back to # when href is missing", () => {
    const LinkMark = marks.link;
    render(<LinkMark value={{}}>No href</LinkMark>);
    expect(screen.getByText("No href")).toHaveAttribute("href", "#");
  });
});

describe("image type", () => {
  it("returns null when value has no asset", () => {
    const ImageType = types.image;
    const { container } = render(<ImageType value={{}} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders <figure> with <img> when asset is present", () => {
    const ImageType = types.image;
    render(<ImageType value={{ asset: { _ref: "img-123" }, alt: "Test" }} />);
    const figure = document.querySelector("figure");
    expect(figure).toBeInTheDocument();
    const img = figure.querySelector("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://example.com/image.webp");
    expect(img).toHaveAttribute("alt", "Test");
  });
});
