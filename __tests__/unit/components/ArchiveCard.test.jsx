// ABOUTME: Unit tests for ArchiveCard component.
// ABOUTME: Validates link vs div rendering, issue number, date, title, and severity badges.

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

import ArchiveCard from "@/components/ArchiveCard";

describe("ArchiveCard", () => {
  const baseProps = {
    issueNumber: 14,
    date: "2026-03-03",
    title: "The Machines Are Hiring",
    subtitle: "And Firing",
    severities: ["ERROR", "OVERRIDE"],
    slug: "crash-log-014",
    locale: "en",
  };

  it("renders as a Link when slug is present", () => {
    render(<ArchiveCard {...baseProps} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/en/issue/crash-log-014");
  });

  it("renders as a div when slug is absent", () => {
    render(<ArchiveCard {...baseProps} slug={undefined} />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("zero-pads issue number", () => {
    render(<ArchiveCard {...baseProps} />);
    expect(screen.getByText("#014")).toBeInTheDocument();
  });

  it("renders title", () => {
    render(<ArchiveCard {...baseProps} />);
    expect(screen.getByText("The Machines Are Hiring")).toBeInTheDocument();
  });

  it("renders subtitle when present", () => {
    render(<ArchiveCard {...baseProps} />);
    expect(screen.getByText("And Firing")).toBeInTheDocument();
  });

  it("omits subtitle when absent", () => {
    render(<ArchiveCard {...baseProps} subtitle={undefined} />);
    expect(screen.queryByText("And Firing")).not.toBeInTheDocument();
  });

  it("renders severity badges", () => {
    render(<ArchiveCard {...baseProps} />);
    expect(screen.getByText("ERROR")).toBeInTheDocument();
    expect(screen.getByText("OVERRIDE")).toBeInTheDocument();
  });

  it("deduplicates severity badges", () => {
    render(<ArchiveCard {...baseProps} severities={["ERROR", "ERROR"]} />);
    expect(screen.getAllByText("ERROR")).toHaveLength(1);
  });

  it("uses es locale for link path", () => {
    render(<ArchiveCard {...baseProps} locale="es" />);
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/es/issue/crash-log-014"
    );
  });
});
