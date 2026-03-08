// ABOUTME: Unit tests for NicosNotesWidget component.
// ABOUTME: Validates widget rendering, empty state, links, and locale handling.

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@portabletext/react", () => ({
  PortableText: ({ value }) => <div>{JSON.stringify(value)}</div>,
  toPlainText: (blocks) => {
    if (!blocks || !Array.isArray(blocks)) return "";
    return blocks
      .map((b) =>
        b.children ? b.children.map((c) => c.text || "").join("") : ""
      )
      .join("\n");
  },
}));

import NicosNotesWidget from "@/components/NicosNotesWidget";

const mockColumn = {
  columnNumber: 1,
  slug: "2026-03-07",
  publishDate: "2026-03-07T00:00:00.000Z",
  title: { en: "Week in Review", es: "Semana en Resumen" },
  body: {
    en: [
      {
        _type: "block",
        children: [
          { _type: "span", text: "This is a test excerpt of the column body." },
        ],
      },
    ],
  },
};

describe("NicosNotesWidget", () => {
  it("renders nothing when column is null", () => {
    const { container } = render(
      <NicosNotesWidget column={null} locale="en" />
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders heading in EN", () => {
    render(<NicosNotesWidget column={mockColumn} locale="en" />);
    expect(screen.getByText("Nico\u2019s Notes")).toBeInTheDocument();
  });

  it("renders heading in ES", () => {
    render(<NicosNotesWidget column={mockColumn} locale="es" />);
    expect(screen.getByText("Notas de Nico")).toBeInTheDocument();
  });

  it("renders column number", () => {
    render(<NicosNotesWidget column={mockColumn} locale="en" />);
    expect(screen.getByText(/#001/)).toBeInTheDocument();
  });

  it("renders column title as link", () => {
    render(<NicosNotesWidget column={mockColumn} locale="en" />);
    const titleLink = screen.getByText("Week in Review").closest("a");
    expect(titleLink).toHaveAttribute("href", "/en/nico/2026-03-07");
  });

  it("renders excerpt from body", () => {
    render(<NicosNotesWidget column={mockColumn} locale="en" />);
    expect(screen.getByText(/This is a test excerpt/)).toBeInTheDocument();
  });

  it("renders Read link", () => {
    render(<NicosNotesWidget column={mockColumn} locale="en" />);
    const readLink = screen.getByText(/Read/).closest("a");
    expect(readLink).toHaveAttribute("href", "/en/nico/2026-03-07");
  });

  it("renders See all link to archive", () => {
    render(<NicosNotesWidget column={mockColumn} locale="en" />);
    const seeAllLink = screen.getByText("See all").closest("a");
    expect(seeAllLink).toHaveAttribute("href", "/en/nico");
  });

  it("renders Spanish labels for es locale", () => {
    render(<NicosNotesWidget column={mockColumn} locale="es" />);
    expect(screen.getByText(/Leer/)).toBeInTheDocument();
    expect(screen.getByText("Ver todas")).toBeInTheDocument();
  });

  it("has aria-label on aside", () => {
    render(<NicosNotesWidget column={mockColumn} locale="en" />);
    expect(screen.getByLabelText("Nico\u2019s Notes")).toBeInTheDocument();
  });
});
