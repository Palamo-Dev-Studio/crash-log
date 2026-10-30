// ABOUTME: Unit tests for IssueHeader: kicker with file code, date/cases/minutes, H1, dek, byline, credit, stamp legend.
// ABOUTME: EN and ES copy are both asserted so a missing locale branch fails.

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import IssueHeader from "@/components/IssueHeader";

const defaultProps = {
  locale: "en",
  code: "OTR-014",
  date: "Mar 3, 2026",
  caseCount: 4,
  minutes: 5,
  title: "The Machines Are Hiring",
  subtitle: "And Firing",
  byline: "Hector Luis Alamo",
  credit: "Reported with Nico",
};

describe("IssueHeader", () => {
  it("shows the series and case-file code in the kicker", () => {
    render(<IssueHeader {...defaultProps} />);
    expect(
      screen.getByText("OFF THE RAILS · CASE FILE OTR-014")
    ).toBeInTheDocument();
  });

  it("shows the Spanish kicker", () => {
    render(<IssueHeader {...defaultProps} locale="es" />);
    expect(
      screen.getByText("FUERA DE LAS VÍAS · EXPEDIENTE OTR-014")
    ).toBeInTheDocument();
  });

  it("shows date, case count and reading time", () => {
    render(<IssueHeader {...defaultProps} />);
    expect(screen.getByText("Mar 3, 2026")).toBeInTheDocument();
    expect(screen.getByText("4 CASES")).toBeInTheDocument();
    expect(screen.getByText("5 MIN READ")).toBeInTheDocument();
  });

  it("uses the singular for one case and Spanish units", () => {
    render(<IssueHeader {...defaultProps} caseCount={1} locale="es" />);
    expect(screen.getByText("1 CASO")).toBeInTheDocument();
    expect(screen.getByText("5 MIN DE LECTURA")).toBeInTheDocument();
  });

  it("omits the reading-time segment when there is none", () => {
    render(<IssueHeader {...defaultProps} minutes={null} />);
    expect(screen.queryByText(/MIN READ/)).not.toBeInTheDocument();
  });

  it("renders the title in an h1 and the dek", () => {
    render(<IssueHeader {...defaultProps} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "The Machines Are Hiring"
    );
    expect(screen.getByText("And Firing")).toBeInTheDocument();
  });

  it("omits the dek when there is no subtitle", () => {
    render(<IssueHeader {...defaultProps} subtitle={undefined} />);
    expect(screen.queryByText("And Firing")).not.toBeInTheDocument();
  });

  it("shows byline and credit together", () => {
    render(<IssueHeader {...defaultProps} />);
    expect(screen.getByText("Hector Luis Alamo")).toBeInTheDocument();
    expect(screen.getByText("Reported with Nico")).toBeInTheDocument();
  });

  it("omits the credit when there is none (newsroom issue)", () => {
    render(
      <IssueHeader
        {...defaultProps}
        byline="The Crash Log newsroom"
        credit={null}
      />
    );
    expect(screen.getByText("The Crash Log newsroom")).toBeInTheDocument();
    expect(screen.queryByText(/Reported with Nico/)).not.toBeInTheDocument();
  });

  it("shows the stamp legend in both languages", () => {
    const { rerender } = render(<IssueHeader {...defaultProps} />);
    expect(screen.getByText("Verdict")).toBeInTheDocument();
    expect(screen.getByText(/the stamp is our verdict/)).toBeInTheDocument();
    rerender(<IssueHeader {...defaultProps} locale="es" />);
    expect(screen.getByText("Veredicto")).toBeInTheDocument();
    expect(
      screen.getByText(/el sello es nuestro veredicto/)
    ).toBeInTheDocument();
  });
});
