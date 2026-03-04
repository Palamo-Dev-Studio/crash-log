// ABOUTME: Unit tests for CoverImage component.
// ABOUTME: Validates placeholder rendering, image URL building, and alt text.

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }) => <img src={src} alt={alt} {...props} />,
}));

vi.mock("@/lib/sanity", () => ({
  urlFor: () => ({
    width: function () { return this; },
    height: function () { return this; },
    format: function () { return this; },
    url: () => "https://cdn.sanity.io/test.webp",
  }),
}));

import CoverImage from "@/components/CoverImage";

describe("CoverImage", () => {
  it("renders placeholder when image is null", () => {
    render(<CoverImage image={null} alt="" />);
    expect(screen.getByText("[ Cover Image ]")).toBeInTheDocument();
  });

  it("renders placeholder when image is undefined", () => {
    render(<CoverImage alt="" />);
    expect(screen.getByText("[ Cover Image ]")).toBeInTheDocument();
  });

  it("renders an img when image is provided", () => {
    render(<CoverImage image={{ _ref: "img-123" }} alt="Test cover" />);
    const img = screen.getByRole("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("alt", "Test cover");
  });

  it("uses urlFor to build image src", () => {
    render(<CoverImage image={{ _ref: "img-123" }} alt="Test" />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "https://cdn.sanity.io/test.webp");
  });

  it("defaults alt to 'Cover image' when not provided", () => {
    render(<CoverImage image={{ _ref: "img-123" }} />);
    expect(screen.getByRole("img")).toHaveAttribute("alt", "Cover image");
  });
});
