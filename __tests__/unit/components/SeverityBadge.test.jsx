// ABOUTME: Unit tests for SeverityBadge component.
// ABOUTME: Validates severity-to-CSS-class mapping and fallback behavior.

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SeverityBadge from "@/components/SeverityBadge";

describe("SeverityBadge", () => {
  it("renders the severity text", () => {
    render(<SeverityBadge severity="ERROR" />);
    expect(screen.getByText("ERROR")).toBeInTheDocument();
  });

  it("applies badge base class", () => {
    render(<SeverityBadge severity="ERROR" />);
    const badge = screen.getByText("ERROR");
    expect(badge.className).toContain("badge");
  });

  it("applies error class for ERROR severity", () => {
    render(<SeverityBadge severity="ERROR" />);
    expect(screen.getByText("ERROR").className).toContain("error");
  });

  it("applies override class for OVERRIDE severity", () => {
    render(<SeverityBadge severity="OVERRIDE" />);
    expect(screen.getByText("OVERRIDE").className).toContain("override");
  });

  it("applies terminate class for TERMINATE severity", () => {
    render(<SeverityBadge severity="TERMINATE" />);
    expect(screen.getByText("TERMINATE").className).toContain("terminate");
  });

  it("applies warning class for WARNING severity", () => {
    render(<SeverityBadge severity="WARNING" />);
    expect(screen.getByText("WARNING").className).toContain("warning");
  });

  it("applies critical class for CRITICAL severity", () => {
    render(<SeverityBadge severity="CRITICAL" />);
    expect(screen.getByText("CRITICAL").className).toContain("critical");
  });

  it("applies breach class for BREACH severity", () => {
    render(<SeverityBadge severity="BREACH" />);
    expect(screen.getByText("BREACH").className).toContain("breach");
  });

  it("falls back to error class for unknown severity", () => {
    render(<SeverityBadge severity="UNKNOWN" />);
    expect(screen.getByText("UNKNOWN").className).toContain("error");
  });
});
