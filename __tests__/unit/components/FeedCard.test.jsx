// ABOUTME: Unit tests for FeedCard component.
// ABOUTME: Validates badge label/type per _type, routing, hero vs standard variant, and localized text.

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

import FeedCard from "@/components/FeedCard";

const issueItem = {
  _id: "issue-1",
  _type: "issue",
  slug: "crash-log-027",
  publishDate: "2026-07-10T12:00:00.000Z",
  coverImage: { _ref: "img-1" },
  coverImageAlt: { en: "Robots at a desk" },
  title: { en: "The Machines Are Hiring", es: "Las Máquinas Contratan" },
  subtitle: { en: "And firing.", es: "Y despidiendo." },
  metaDescription: { en: "Meta fallback." },
  number: 27,
};

const columnItem = {
  _id: "column-1",
  _type: "column",
  slug: "2026-07-10",
  publishDate: "2026-07-10T00:00:00.000Z",
  coverImage: null,
  title: { en: "Week in Review", es: "Semana en Resumen" },
  subtitle: { en: "Notes from the desk." },
  metaDescription: null,
  number: 9,
};

describe("FeedCard", () => {
  it("returns nothing when item is null", () => {
    const { container } = render(<FeedCard item={null} locale="en" />);
    expect(container.innerHTML).toBe("");
  });

  it("renders the ISSUE badge with zero-padded number for an issue", () => {
    render(<FeedCard item={issueItem} locale="en" />);
    expect(screen.getByText("Issue #027")).toBeInTheDocument();
  });

  it("renders the Nico's Notes badge with zero-padded number for a column", () => {
    render(<FeedCard item={columnItem} locale="en" />);
    expect(screen.getByText("Nico’s Notes #009")).toBeInTheDocument();
  });

  it("links issues to /locale/issue/slug", () => {
    render(<FeedCard item={issueItem} locale="en" />);
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/en/issue/crash-log-027"
    );
  });

  it("links columns to /locale/nico/slug", () => {
    render(<FeedCard item={columnItem} locale="en" />);
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/en/nico/2026-07-10"
    );
  });

  it("renders localized title", () => {
    render(<FeedCard item={issueItem} locale="es" />);
    expect(screen.getByText("Las Máquinas Contratan")).toBeInTheDocument();
  });

  it("falls back to English title when Spanish is missing", () => {
    const enOnly = { ...columnItem, title: { en: "English Only" } };
    render(<FeedCard item={enOnly} locale="es" />);
    expect(screen.getByText("English Only")).toBeInTheDocument();
  });

  it("renders localized dek from subtitle", () => {
    render(<FeedCard item={issueItem} locale="en" />);
    expect(screen.getByText("And firing.")).toBeInTheDocument();
  });

  it("falls back to metaDescription when subtitle is absent", () => {
    const noSubtitle = { ...issueItem, subtitle: null };
    render(<FeedCard item={noSubtitle} locale="en" />);
    expect(screen.getByText("Meta fallback.")).toBeInTheDocument();
  });

  it("renders the title as an h1 in the hero variant", () => {
    render(<FeedCard item={issueItem} locale="en" variant="hero" />);
    expect(
      screen.getByRole("heading", { level: 1, name: "The Machines Are Hiring" })
    ).toBeInTheDocument();
  });

  it("renders the title as an h2 in the standard variant", () => {
    render(<FeedCard item={issueItem} locale="en" variant="standard" />);
    expect(
      screen.getByRole("heading", { level: 2, name: "The Machines Are Hiring" })
    ).toBeInTheDocument();
  });

  it("renders an image when coverImage is present", () => {
    render(<FeedCard item={issueItem} locale="en" />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "https://cdn.sanity.io/test.webp");
    expect(img).toHaveAttribute("alt", "Robots at a desk");
  });

  it("renders a placeholder when coverImage is absent", () => {
    render(<FeedCard item={columnItem} locale="en" />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("formats the publish date for the locale", () => {
    render(<FeedCard item={issueItem} locale="en" />);
    expect(screen.getByText("July 10, 2026")).toBeInTheDocument();
  });
});
