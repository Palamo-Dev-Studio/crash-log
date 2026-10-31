// ABOUTME: Unit tests for the Off the Rails index and IssueNav: rows in given (newest-first) order with codes, bylines, links.
// ABOUTME: Fixtures mix a newsroom-bylined archive issue with a Hector-bylined one so byline branches differ.

import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import OffTheRailsIndex from "@/components/OffTheRailsIndex";
import IssueNav from "@/components/IssueNav";

const ISSUES = [
  {
    _id: "i28",
    slug: "crash-log-028",
    issueNumber: 28,
    publishDate: "2026-11-02T00:00:00Z",
    byline: "Hector Luis Alamo",
    title: { en: "Issue twenty-eight", es: "Edición veintiocho" },
  },
  {
    _id: "i27",
    slug: "crash-log-027",
    issueNumber: 27,
    publishDate: "2026-10-26T00:00:00Z",
    byline: "newsroom",
    title: { en: "Issue twenty-seven", es: "Edición veintisiete" },
  },
];

describe("OffTheRailsIndex", () => {
  it("renders the head with title and description", () => {
    render(<OffTheRailsIndex issues={ISSUES} locale="en" />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Off the Rails" })
    ).toBeInTheDocument();
    expect(screen.getByText(/strangest AI stories/)).toBeInTheDocument();
  });

  it("lists rows in the given order with chips, localized titles and links", () => {
    render(<OffTheRailsIndex issues={ISSUES} locale="es" />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute("href", "/es/issue/crash-log-028");
    expect(within(links[0]).getByText("OTR-028")).toBeInTheDocument();
    expect(
      within(links[0]).getByText("Edición veintiocho")
    ).toBeInTheDocument();
    expect(links[1]).toHaveAttribute("href", "/es/issue/crash-log-027");
    expect(within(links[1]).getByText("OTR-027")).toBeInTheDocument();
  });

  it("bylines follow getByline: Hector, or the newsroom name for the sentinel", () => {
    render(<OffTheRailsIndex issues={ISSUES} locale="en" />);
    expect(screen.getByText("By Hector Luis Alamo")).toBeInTheDocument();
    expect(screen.getByText("By The Crash Log newsroom")).toBeInTheDocument();
  });

  it("shows an empty message with no issues", () => {
    render(<OffTheRailsIndex issues={[]} locale="en" />);
    expect(screen.getByText("No issues published yet.")).toBeInTheDocument();
  });
});

describe("IssueNav", () => {
  const prev = {
    issueNumber: 26,
    slug: "crash-log-026",
    title: { en: "Older", es: "Antiguo" },
  };
  const next = {
    issueNumber: 28,
    slug: "crash-log-028",
    title: { en: "Newer", es: "Nuevo" },
  };

  it("links both sides with OTR codes and localized labels", () => {
    render(<IssueNav prev={prev} next={next} locale="es" />);
    expect(screen.getByRole("link", { name: /Anterior/ })).toHaveAttribute(
      "href",
      "/es/issue/crash-log-026"
    );
    expect(screen.getByText("OTR-028 Nuevo")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Siguiente/ })).toBeInTheDocument();
  });

  it("renders only the side that exists, and nothing with neither", () => {
    const { container, rerender } = render(
      <IssueNav prev={prev} next={null} locale="en" />
    );
    expect(screen.getByRole("link", { name: /Previous/ })).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /Next/ })
    ).not.toBeInTheDocument();
    rerender(<IssueNav prev={null} next={null} locale="en" />);
    expect(container).toBeEmptyDOMElement();
  });
});
