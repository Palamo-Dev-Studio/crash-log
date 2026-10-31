// ABOUTME: Unit tests for FileRow, the file row shared by home, series indexes and archive results.
// ABOUTME: Covers series chip and byline, the search-result extras (title node, heading tag, subtitle, matched-in) and every series' route.

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import FileRow from "@/components/FileRow";

const issue = {
  _type: "issue",
  issueNumber: 14,
  slug: "crash-log-014",
  publishDate: "2026-03-03",
  title: { en: "The Machines Are Hiring", es: "Las máquinas contratan" },
};

describe("FileRow", () => {
  it("renders code chip, date, localized title and byline", () => {
    render(<FileRow doc={issue} locale="en" />);
    expect(screen.getByText("OTR-014")).toBeInTheDocument();
    expect(screen.getByText("Mar 3, 2026")).toBeInTheDocument();
    expect(screen.getByText("The Machines Are Hiring")).toBeInTheDocument();
    expect(screen.getByText(/By Hector Luis Alamo/)).toBeInTheDocument();
  });

  it("uses the newsroom byline for the archive sentinel", () => {
    render(<FileRow doc={{ ...issue, byline: "newsroom" }} locale="es" />);
    expect(
      screen.getByText(/la redacción de The Crash Log/)
    ).toBeInTheDocument();
  });

  it.each([
    [{ ...issue }, "/en/issue/crash-log-014", "OTR-014"],
    [
      {
        _type: "column",
        columnNumber: 5,
        slug: "2026-04-04",
        publishDate: "2026-04-04",
      },
      "/en/nico/2026-04-04",
      "NOTE-005",
    ],
    [
      {
        _type: "practical",
        practicalNumber: 1,
        slug: "audit",
        publishDate: "2026-04-05",
      },
      "/en/practical/audit",
      "FIX-001",
    ],
  ])(
    "links %# to its own route with its own series code",
    (doc, href, code) => {
      render(<FileRow doc={{ title: { en: "T" }, ...doc }} locale="en" />);
      expect(screen.getByRole("link")).toHaveAttribute("href", href);
      expect(screen.getByText(code)).toBeInTheDocument();
    }
  );

  it("renders the title as a span by default (home and index rows)", () => {
    render(<FileRow doc={issue} locale="en" />);
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("renders a supplied title node inside the requested heading tag", () => {
    render(
      <FileRow
        doc={issue}
        locale="en"
        title={<mark>Machines</mark>}
        titleTag="h3"
      />
    );
    const heading = screen.getByRole("heading", { level: 3 });
    expect(heading).toHaveTextContent("Machines");
    expect(heading.querySelector("mark")).not.toBeNull();
    // The supplied node replaces the doc title rather than adding to it.
    expect(
      screen.queryByText("The Machines Are Hiring")
    ).not.toBeInTheDocument();
  });

  it("renders subtitle and matched-in only when given", () => {
    const { rerender } = render(<FileRow doc={issue} locale="en" />);
    expect(screen.queryByText("And firing")).not.toBeInTheDocument();
    expect(screen.queryByText(/matched in/)).not.toBeInTheDocument();
    rerender(
      <FileRow
        doc={issue}
        locale="en"
        subtitle="And firing"
        matchedIn="matched in: story body"
      />
    );
    expect(screen.getByText("And firing")).toBeInTheDocument();
    expect(screen.getByText("matched in: story body")).toBeInTheDocument();
  });
});
