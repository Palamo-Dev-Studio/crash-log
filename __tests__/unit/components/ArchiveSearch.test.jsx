// ABOUTME: Component tests for ArchiveSearch — query input, category pills, empty state, clear button.
// ABOUTME: Verifies filter state changes update the rendered result list.

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import ArchiveSearch from "@/components/ArchiveSearch";

const issueItem = {
  id: "issue-1",
  type: "issue",
  publishDate: "2026-04-01",
  title: "Forty Minutes of Exposure",
  subtitle: "What broke this week",
  searchText:
    "forty minutes of exposure what broke this week perplexity oracle",
  fields: {
    titleSubtitle: "forty minutes of exposure what broke this week",
    transmission: "perplexity sued",
    headlines: "perplexity sued by publishers",
    bodies: "oracle settled",
    stackTrace: "",
    columnBody: "",
  },
  categories: [{ slug: "foundation-models", name: "Foundation Models" }],
  raw: {
    issueNumber: 14,
    slug: "issue-014",
    severities: ["ERROR"],
  },
};

const columnItem = {
  id: "column-1",
  type: "column",
  publishDate: "2026-04-04",
  title: "The Ledger Economy",
  subtitle: "On trust",
  searchText: "the ledger economy on trust",
  fields: {
    titleSubtitle: "the ledger economy on trust",
    transmission: "",
    headlines: "",
    bodies: "",
    stackTrace: "",
    columnBody: "the ledger economy is a phrase",
  },
  categories: [],
  raw: {
    columnNumber: 5,
    slug: "2026-04-04",
  },
};

describe("ArchiveSearch", () => {
  const baseProps = {
    items: [columnItem, issueItem],
    categories: [{ slug: "foundation-models", name: "Foundation Models" }],
    locale: "en",
  };

  it("renders all items by default", () => {
    render(<ArchiveSearch {...baseProps} />);
    expect(screen.getByText("Forty Minutes of Exposure")).toBeInTheDocument();
    expect(screen.getByText("The Ledger Economy")).toBeInTheDocument();
  });

  it("filters by query input", () => {
    const { container } = render(<ArchiveSearch {...baseProps} />);
    const input = screen.getByLabelText("Search");
    fireEvent.change(input, { target: { value: "ledger" } });
    // Title gets wrapped with <mark> spans, so query the heading by text content.
    const headings = Array.from(container.querySelectorAll("h3")).map(
      (h) => h.textContent
    );
    expect(headings).toContain("The Ledger Economy");
    expect(headings).not.toContain("Forty Minutes of Exposure");
  });

  it("filters by category pill", () => {
    render(<ArchiveSearch {...baseProps} />);
    const pill = screen.getByRole("button", { name: "Foundation Models" });
    fireEvent.click(pill);
    expect(screen.getByText("Forty Minutes of Exposure")).toBeInTheDocument();
    expect(screen.queryByText("The Ledger Economy")).not.toBeInTheDocument();
  });

  it("shows empty state when query has no matches", () => {
    render(<ArchiveSearch {...baseProps} />);
    fireEvent.change(screen.getByLabelText("Search"), {
      target: { value: "zzznotfound" },
    });
    expect(screen.getByText("No results.")).toBeInTheDocument();
  });

  it("clear button resets filters", () => {
    const { container } = render(<ArchiveSearch {...baseProps} />);
    fireEvent.change(screen.getByLabelText("Search"), {
      target: { value: "ledger" },
    });
    let headings = Array.from(container.querySelectorAll("h3")).map(
      (h) => h.textContent
    );
    expect(headings).not.toContain("Forty Minutes of Exposure");

    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    headings = Array.from(container.querySelectorAll("h3")).map(
      (h) => h.textContent
    );
    expect(headings).toContain("Forty Minutes of Exposure");
    expect(headings).toContain("The Ledger Economy");
  });

  it("renders Spanish copy when locale=es", () => {
    render(<ArchiveSearch {...baseProps} locale="es" />);
    expect(screen.getByLabelText("Buscar")).toBeInTheDocument();
  });
});
