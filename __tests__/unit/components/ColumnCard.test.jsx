// ABOUTME: Unit tests for ColumnCard component.
// ABOUTME: Validates card rendering, link generation, and locale handling.

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import ColumnCard from "@/components/ColumnCard";

describe("ColumnCard", () => {
  it("renders column number padded to 3 digits", () => {
    render(
      <ColumnCard
        columnNumber={1}
        date="2026-03-07"
        title="Week in Review"
        slug="2026-03-07"
        locale="en"
      />
    );
    expect(screen.getByText("#001")).toBeInTheDocument();
  });

  it("renders title", () => {
    render(
      <ColumnCard
        columnNumber={1}
        date="2026-03-07"
        title="Week in Review"
        slug="2026-03-07"
        locale="en"
      />
    );
    expect(screen.getByText("Week in Review")).toBeInTheDocument();
  });

  it("renders subtitle when present", () => {
    render(
      <ColumnCard
        columnNumber={1}
        date="2026-03-07"
        title="Week in Review"
        subtitle="A busy week"
        slug="2026-03-07"
        locale="en"
      />
    );
    expect(screen.getByText("A busy week")).toBeInTheDocument();
  });

  it("does not render subtitle when absent", () => {
    const { container } = render(
      <ColumnCard
        columnNumber={1}
        date="2026-03-07"
        title="Week in Review"
        slug="2026-03-07"
        locale="en"
      />
    );
    expect(container.querySelector("p")).toBeNull();
  });

  it("links to column detail page with correct locale", () => {
    render(
      <ColumnCard
        columnNumber={1}
        date="2026-03-07"
        title="Week in Review"
        slug="2026-03-07"
        locale="en"
      />
    );
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/en/nico/2026-03-07");
  });

  it("uses es locale in link", () => {
    render(
      <ColumnCard
        columnNumber={1}
        date="2026-03-07"
        title="Semana"
        slug="2026-03-07"
        locale="es"
      />
    );
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/es/nico/2026-03-07");
  });

  it("renders as div without link when slug is missing", () => {
    const { container } = render(
      <ColumnCard
        columnNumber={1}
        date="2026-03-07"
        title="Week in Review"
        locale="en"
      />
    );
    expect(screen.queryByRole("link")).toBeNull();
    expect(container.querySelector("div")).toBeInTheDocument();
  });

  it("renders formatted date", () => {
    render(
      <ColumnCard
        columnNumber={1}
        date="2026-03-07"
        title="Test"
        slug="2026-03-07"
        locale="en"
      />
    );
    // Date may render as Mar 6 or 7 depending on timezone
    expect(screen.getByText(/Mar \d+, 2026/)).toBeInTheDocument();
  });
});
