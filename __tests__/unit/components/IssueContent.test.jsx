// ABOUTME: Unit tests for IssueContent composite component.
// ABOUTME: Validates empty state, locale rendering, FallbackBanner logic, and story rendering.

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }) => <img src={src} alt={alt} {...props} />,
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/lib/sanity", () => ({
  urlFor: () => ({
    width: function () {
      return this;
    },
    height: function () {
      return this;
    },
    format: function () {
      return this;
    },
    url: () => "https://cdn.sanity.io/test.webp",
  }),
}));

import IssueContent from "@/components/IssueContent";

const makeIssue = (overrides = {}) => ({
  issueNumber: 14,
  publishDate: "2026-03-03",
  title: {
    en: "The Machines Are Hiring",
    es: "Las Máquinas Están Contratando",
  },
  subtitle: { en: "And Firing", es: "Y Despidiendo" },
  coverImage: { _ref: "img-123" },
  coverImageAlt: { en: "Cover alt" },
  nicosTransmission: {
    en: [
      {
        _type: "block",
        children: [{ _type: "span", text: "Nico says hello" }],
      },
    ],
    es: [],
  },
  stories: [
    {
      _id: "story-1",
      severity: "ERROR",
      headline: { en: "Robot Fails", es: "Robot Falla" },
      tags: { en: "AI / Automation" },
      body: {
        en: [
          { _type: "block", children: [{ _type: "span", text: "Story body" }] },
        ],
      },
    },
  ],
  stackTrace: [{ sourceOutlet: "TechCrunch", text: { en: "AI hiring surge" } }],
  ...overrides,
});

describe("IssueContent", () => {
  describe("empty state", () => {
    it("renders English empty text when issue is null", () => {
      render(<IssueContent issue={null} locale="en" />);
      expect(screen.getByText("No issues published yet.")).toBeInTheDocument();
    });

    it("renders Spanish empty text when locale is es", () => {
      render(<IssueContent issue={null} locale="es" />);
      expect(
        screen.getByText("No hay ediciones publicadas todavía.")
      ).toBeInTheDocument();
    });
  });

  describe("with issue data", () => {
    it("renders the issue title", () => {
      render(<IssueContent issue={makeIssue()} locale="en" />);
      expect(screen.getByText("The Machines Are Hiring")).toBeInTheDocument();
    });

    it("renders the issue title in Spanish", () => {
      render(<IssueContent issue={makeIssue()} locale="es" />);
      expect(
        screen.getByText("Las Máquinas Están Contratando")
      ).toBeInTheDocument();
    });

    it("renders zero-padded issue number", () => {
      render(<IssueContent issue={makeIssue()} locale="en" />);
      expect(screen.getByText(/Issue #014/)).toBeInTheDocument();
    });

    it("renders story headline", () => {
      render(<IssueContent issue={makeIssue()} locale="en" />);
      expect(screen.getByText("Robot Fails")).toBeInTheDocument();
    });

    it("renders severity badge for story", () => {
      render(<IssueContent issue={makeIssue()} locale="en" />);
      expect(screen.getByText("ERROR")).toBeInTheDocument();
    });

    it("renders stack trace items", () => {
      render(<IssueContent issue={makeIssue()} locale="en" />);
      expect(screen.getByText("TechCrunch")).toBeInTheDocument();
    });

    it("renders DonateCTA", () => {
      render(<IssueContent issue={makeIssue()} locale="en" />);
      expect(screen.getByText("Feed the Bots")).toBeInTheDocument();
    });

    it("renders Footer", () => {
      render(<IssueContent issue={makeIssue()} locale="en" />);
      expect(screen.getByText(/2026 The Crash Log/)).toBeInTheDocument();
    });
  });

  describe("FallbackBanner", () => {
    it("does not show FallbackBanner for en locale", () => {
      render(<IssueContent issue={makeIssue()} locale="en" />);
      expect(
        screen.queryByText(/Versión en español próximamente/)
      ).not.toBeInTheDocument();
    });

    it("shows FallbackBanner for es when translation is incomplete", () => {
      render(<IssueContent issue={makeIssue()} locale="es" />);
      expect(
        screen.getByText(/Versión en español próximamente/)
      ).toBeInTheDocument();
    });

    it("does not show FallbackBanner for es when translation is complete", () => {
      const issue = makeIssue({
        nicosTransmission: {
          en: [{ _type: "block", children: [{ _type: "span", text: "EN" }] }],
          es: [{ _type: "block", children: [{ _type: "span", text: "ES" }] }],
        },
      });
      render(<IssueContent issue={issue} locale="es" />);
      expect(
        screen.queryByText(/Versión en español próximamente/)
      ).not.toBeInTheDocument();
    });
  });
});
