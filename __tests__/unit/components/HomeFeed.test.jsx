// ABOUTME: Unit tests for HomeFeed component.
// ABOUTME: Validates hero + standard card grid rendering, archive link, and empty state.

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
    url: () => "https://cdn.sanity.io/test.webp",
  }),
}));

import HomeFeed from "@/components/HomeFeed";

function makeItem(overrides) {
  return {
    _id: "id",
    _type: "issue",
    slug: "slug",
    publishDate: "2026-07-10T00:00:00.000Z",
    coverImage: null,
    coverImageAlt: null,
    title: { en: "Title" },
    subtitle: { en: "Dek" },
    metaDescription: null,
    number: 1,
    ...overrides,
  };
}

const thirteenItems = Array.from({ length: 13 }, (_, i) =>
  makeItem({
    _id: `item-${i}`,
    slug: `slug-${i}`,
    title: { en: `Item ${i}` },
    number: i + 1,
    _type: i === 5 ? "column" : "issue",
  })
);

describe("HomeFeed", () => {
  it("renders the empty state when items is an empty array", () => {
    render(<HomeFeed items={[]} locale="en" />);
    expect(screen.getByText("No content published yet.")).toBeInTheDocument();
  });

  it("renders the localized empty state for es", () => {
    render(<HomeFeed items={[]} locale="es" />);
    expect(
      screen.getByText("Aún no hay contenido publicado.")
    ).toBeInTheDocument();
  });

  it("renders items[0] as the hero (h1 heading)", () => {
    render(<HomeFeed items={thirteenItems} locale="en" />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Item 0" })
    ).toBeInTheDocument();
  });

  it("renders the remaining items as standard cards (h2 headings)", () => {
    render(<HomeFeed items={thirteenItems} locale="en" />);
    const standardHeadings = screen.getAllByRole("heading", { level: 2 });
    expect(standardHeadings).toHaveLength(12);
  });

  it("renders exactly 14 total links for hero + 12 standard cards + archive", () => {
    render(<HomeFeed items={thirteenItems} locale="en" />);
    // 13 cards + 1 archive link
    expect(screen.getAllByRole("link")).toHaveLength(14);
  });

  it("renders the archive link pointing to /locale/archive", () => {
    render(<HomeFeed items={thirteenItems} locale="en" />);
    const archiveLink = screen.getByText(/See the full archive/).closest("a");
    expect(archiveLink).toHaveAttribute("href", "/en/archive");
  });

  it("renders the localized archive link for es", () => {
    render(<HomeFeed items={thirteenItems} locale="es" />);
    const archiveLink = screen
      .getByText(/Ver el archivo completo/)
      .closest("a");
    expect(archiveLink).toBeInTheDocument();
    expect(archiveLink).toHaveAttribute("href", "/es/archive");
  });

  it("renders no standard grid when only one item is present", () => {
    render(<HomeFeed items={[makeItem({})]} locale="en" />);
    expect(screen.queryAllByRole("heading", { level: 2 })).toHaveLength(0);
  });
});
