// ABOUTME: Unit tests for IssueHeader component.
// ABOUTME: Validates issue number padding, title rendering, and optional subtitle.

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import IssueHeader from "@/components/IssueHeader";

describe("IssueHeader", () => {
  const defaultProps = {
    issueNumber: 14,
    date: "March 3, 2026",
    title: "The Machines Are Hiring",
    subtitle: "And Firing",
  };

  it("zero-pads issue number to 3 digits", () => {
    render(<IssueHeader {...defaultProps} />);
    expect(screen.getByText(/Issue #014/)).toBeInTheDocument();
  });

  it("renders title in an h1", () => {
    render(<IssueHeader {...defaultProps} />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent("The Machines Are Hiring");
  });

  it("renders subtitle when provided", () => {
    render(<IssueHeader {...defaultProps} />);
    expect(screen.getByText("And Firing")).toBeInTheDocument();
  });

  it("omits subtitle when not provided", () => {
    render(<IssueHeader {...defaultProps} subtitle={undefined} />);
    expect(screen.queryByText("And Firing")).not.toBeInTheDocument();
  });

  it("renders date text", () => {
    render(<IssueHeader {...defaultProps} />);
    expect(screen.getByText(/March 3, 2026/)).toBeInTheDocument();
  });
});
