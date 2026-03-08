// ABOUTME: Unit tests for ColumnContent component.
// ABOUTME: Validates column rendering, empty state, locale handling, and fallback banner.

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@portabletext/react", () => ({
  PortableText: ({ value }) => (
    <div data-testid="portable-text">{JSON.stringify(value)}</div>
  ),
}));

vi.mock("@/lib/portableText", () => ({
  portableTextComponents: {},
}));

vi.mock("next/image", () => ({
  // eslint-disable-next-line jsx-a11y/alt-text
  default: (props) => <img {...props} />,
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ replace: vi.fn() }),
}));

import ColumnContent from "@/components/ColumnContent";

const mockColumn = {
  columnNumber: 1,
  slug: "2026-03-07",
  publishDate: "2026-03-07T00:00:00.000Z",
  title: { en: "Week in Review", es: "Semana en Resumen" },
  subtitle: { en: "A busy week", es: "Una semana ocupada" },
  body: {
    en: [{ _type: "block", children: [{ text: "Hello world" }] }],
    es: [{ _type: "block", children: [{ text: "Hola mundo" }] }],
  },
  coverImage: null,
  coverImageAlt: null,
};

describe("ColumnContent", () => {
  it("renders empty state when column is null", () => {
    render(<ColumnContent column={null} locale="en" />);
    expect(screen.getByText("No columns published yet.")).toBeInTheDocument();
  });

  it("renders Spanish empty state", () => {
    render(<ColumnContent column={null} locale="es" />);
    expect(screen.getByText("No hay columnas publicadas.")).toBeInTheDocument();
  });

  it("renders column title", () => {
    render(<ColumnContent column={mockColumn} locale="en" />);
    expect(screen.getByText("Week in Review")).toBeInTheDocument();
  });

  it("renders column number padded to 3 digits", () => {
    render(<ColumnContent column={mockColumn} locale="en" />);
    expect(screen.getByText("#001")).toBeInTheDocument();
  });

  it("renders subtitle", () => {
    render(<ColumnContent column={mockColumn} locale="en" />);
    expect(screen.getByText("A busy week")).toBeInTheDocument();
  });

  it("renders Nico signature", () => {
    render(<ColumnContent column={mockColumn} locale="en" />);
    expect(screen.getByText("\u2014 Nico")).toBeInTheDocument();
  });

  it("renders Nico\u2019s Notes prefix in EN", () => {
    render(<ColumnContent column={mockColumn} locale="en" />);
    expect(screen.getByText("Nico\u2019s Notes")).toBeInTheDocument();
  });

  it("renders Notas de Nico prefix in ES", () => {
    render(<ColumnContent column={mockColumn} locale="es" />);
    expect(screen.getByText("Notas de Nico")).toBeInTheDocument();
  });

  it("renders body via PortableText", () => {
    render(<ColumnContent column={mockColumn} locale="en" />);
    expect(screen.getByTestId("portable-text")).toBeInTheDocument();
  });

  it("renders formatted date", () => {
    render(<ColumnContent column={mockColumn} locale="en" />);
    // Date may render as March 6 or 7 depending on timezone
    expect(screen.getByText(/March \d+, 2026/)).toBeInTheDocument();
  });

  it("does not render FallbackBanner for EN locale", () => {
    render(<ColumnContent column={mockColumn} locale="en" />);
    expect(
      screen.queryByText(/Versi\u00F3n en espa\u00F1ol/)
    ).not.toBeInTheDocument();
  });

  it("does not render FallbackBanner for ES with full translation", () => {
    render(<ColumnContent column={mockColumn} locale="es" />);
    expect(
      screen.queryByText(/Versi\u00F3n en espa\u00F1ol/)
    ).not.toBeInTheDocument();
  });

  it("renders FallbackBanner for ES without full translation", () => {
    const enOnly = {
      ...mockColumn,
      title: { en: "EN Only" },
      body: { en: [{ _type: "block", children: [{ text: "Hello" }] }] },
    };
    render(<ColumnContent column={enOnly} locale="es" />);
    expect(
      screen.getByText(/Versi\u00F3n en espa\u00F1ol/)
    ).toBeInTheDocument();
  });
});
