// ABOUTME: Unit tests for the Portable Text to HTML converter.
// ABOUTME: Validates block, mark, and image rendering for email templates.

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/sanity", () => {
  const stub = {
    url: () => "https://cdn.sanity.io/images/test/production/test-image.jpg",
    width: () => stub,
    height: () => stub,
    format: () => stub,
    fit: () => stub,
    quality: () => stub,
    auto: () => stub,
  };
  return {
    urlFor: () => stub,
  };
});

import { portableTextToHtml } from "@/lib/portableTextToHtml";

describe("portableTextToHtml", () => {
  it("returns empty string for null input", () => {
    expect(portableTextToHtml(null)).toBe("");
  });

  it("returns empty string for undefined input", () => {
    expect(portableTextToHtml(undefined)).toBe("");
  });

  it("returns empty string for empty array", () => {
    expect(portableTextToHtml([])).toBe("");
  });

  it("renders a paragraph block", () => {
    const blocks = [
      {
        _type: "block",
        _key: "a",
        style: "normal",
        children: [{ _type: "span", _key: "s1", text: "Hello world" }],
      },
    ];
    const html = portableTextToHtml(blocks);
    expect(html).toContain("<p>");
    expect(html).toContain("Hello world");
    expect(html).toContain("</p>");
  });

  it("renders an h2 block", () => {
    const blocks = [
      {
        _type: "block",
        _key: "a",
        style: "h2",
        children: [{ _type: "span", _key: "s1", text: "Heading Two" }],
      },
    ];
    const html = portableTextToHtml(blocks);
    expect(html).toContain("<h2>");
    expect(html).toContain("Heading Two");
  });

  it("renders an h3 block", () => {
    const blocks = [
      {
        _type: "block",
        _key: "a",
        style: "h3",
        children: [{ _type: "span", _key: "s1", text: "Heading Three" }],
      },
    ];
    const html = portableTextToHtml(blocks);
    expect(html).toContain("<h3>");
    expect(html).toContain("Heading Three");
  });

  it("renders a blockquote", () => {
    const blocks = [
      {
        _type: "block",
        _key: "a",
        style: "blockquote",
        children: [{ _type: "span", _key: "s1", text: "A wise quote" }],
      },
    ];
    const html = portableTextToHtml(blocks);
    expect(html).toContain("<blockquote");
    expect(html).toContain("A wise quote");
    expect(html).toContain("border-left");
  });

  it("renders strong text", () => {
    // Strong is a decorator mark, not a markDef — test with decorator syntax
    const blocks = [
      {
        _type: "block",
        _key: "a",
        style: "normal",
        children: [
          { _type: "span", _key: "s1", text: "bold text", marks: ["strong"] },
        ],
        markDefs: [],
      },
    ];
    const html = portableTextToHtml(blocks);
    expect(html).toContain("<strong>bold text</strong>");
  });

  it("renders emphasis text", () => {
    const blocks = [
      {
        _type: "block",
        _key: "a",
        style: "normal",
        children: [
          { _type: "span", _key: "s1", text: "italic text", marks: ["em"] },
        ],
        markDefs: [],
      },
    ];
    const html = portableTextToHtml(blocks);
    expect(html).toContain("<em>italic text</em>");
  });

  it("renders inline code", () => {
    const blocks = [
      {
        _type: "block",
        _key: "a",
        style: "normal",
        children: [
          { _type: "span", _key: "s1", text: "npm install", marks: ["code"] },
        ],
        markDefs: [],
      },
    ];
    const html = portableTextToHtml(blocks);
    expect(html).toContain("<code");
    expect(html).toContain("npm install");
    expect(html).toContain("IBM Plex Mono");
  });

  it("renders links with target=_blank and rel attributes", () => {
    const blocks = [
      {
        _type: "block",
        _key: "a",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "s1",
            text: "click here",
            marks: ["link1"],
          },
        ],
        markDefs: [
          { _key: "link1", _type: "link", href: "https://example.com" },
        ],
      },
    ];
    const html = portableTextToHtml(blocks);
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain("click here");
  });

  it("renders images with absolute Sanity CDN URLs", () => {
    const blocks = [
      {
        _type: "image",
        _key: "img1",
        asset: { _ref: "image-abc-200x200-jpg" },
        alt: "Test image",
      },
    ];
    const html = portableTextToHtml(blocks);
    expect(html).toContain("<figure");
    expect(html).toContain("<img");
    expect(html).toContain("https://cdn.sanity.io");
    expect(html).toContain('alt="Test image"');
    expect(html).toContain('width="720"');
  });

  it("renders image with fallback alt text", () => {
    const blocks = [
      {
        _type: "image",
        _key: "img1",
        asset: { _ref: "image-abc-200x200-jpg" },
      },
    ];
    const html = portableTextToHtml(blocks);
    expect(html).toContain('alt="Article image"');
  });

  it("skips images without asset", () => {
    const blocks = [
      {
        _type: "image",
        _key: "img1",
      },
    ];
    const html = portableTextToHtml(blocks);
    expect(html).not.toContain("<img");
  });

  it("renders multiple blocks in sequence", () => {
    const blocks = [
      {
        _type: "block",
        _key: "a",
        style: "h2",
        children: [{ _type: "span", _key: "s1", text: "Title" }],
      },
      {
        _type: "block",
        _key: "b",
        style: "normal",
        children: [{ _type: "span", _key: "s2", text: "Paragraph text" }],
      },
    ];
    const html = portableTextToHtml(blocks);
    expect(html).toContain("<h2>");
    expect(html).toContain("Title");
    expect(html).toContain("<p>");
    expect(html).toContain("Paragraph text");
  });
});
