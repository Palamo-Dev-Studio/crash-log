// ABOUTME: Unit tests for SeverityBadge component.
// ABOUTME: Validates colorKey-to-CSS-class mapping and fallback behavior.

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SeverityBadge from "@/components/SeverityBadge";

describe("SeverityBadge", () => {
  it("renders the severity text", () => {
    render(<SeverityBadge severity="OVERRIDE" />);
    expect(screen.getByText("OVERRIDE")).toBeInTheDocument();
  });

  it("applies badge base class", () => {
    render(<SeverityBadge severity="OVERRIDE" />);
    const badge = screen.getByText("OVERRIDE");
    expect(badge.className).toContain("badge");
  });

  it("renders any free-text severity label", () => {
    render(<SeverityBadge severity="PATCH_FAILED" />);
    expect(screen.getByText("PATCH_FAILED")).toBeInTheDocument();
  });

  it("applies the colorKey class", () => {
    render(<SeverityBadge severity="PATCH_FAILED" colorKey="breach" />);
    expect(screen.getByText("PATCH_FAILED").className).toContain("breach");
  });

  it("applies error class as default colorKey", () => {
    render(<SeverityBadge severity="DEPRECATED" />);
    expect(screen.getByText("DEPRECATED").className).toContain("error");
  });

  it("applies override class when colorKey is override", () => {
    render(<SeverityBadge severity="SOMETHING" colorKey="override" />);
    expect(screen.getByText("SOMETHING").className).toContain("override");
  });

  it("falls back to error class when no colorKey provided", () => {
    render(<SeverityBadge severity="TEST" />);
    expect(screen.getByText("TEST").className).toContain("error");
  });
});
