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

vi.mock("next/navigation", () => import("../../mocks/next-navigation"));

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
  stackTrace: [
    {
      text: {
        en: [
          {
            _type: "block",
            _key: "st1",
            children: [{ _type: "span", text: "AI hiring surge" }],
          },
        ],
      },
      sources: [
        { outlet: "TechCrunch", url: "https://techcrunch.com/article" },
      ],
    },
  ],
  ...overrides,
});

const storyWith = (id, overrides = {}) => ({
  _id: id,
  severity: "ERROR",
  headline: { en: `Headline ${id}` },
  body: {
    en: [{ _type: "block", children: [{ _type: "span", text: `Body ${id}` }] }],
  },
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

    it("renders the zero-padded OTR file code in the kicker", () => {
      render(<IssueContent issue={makeIssue()} locale="en" />);
      expect(screen.getByText(/CASE FILE OTR-014/)).toBeInTheDocument();
    });

    it("renders the story headline on its card and in the full file", () => {
      render(<IssueContent issue={makeIssue()} locale="en" />);
      expect(screen.getAllByText("Robot Fails")).toHaveLength(2);
    });

    it("stamps the severity on a legacy story with no verdict", () => {
      render(<IssueContent issue={makeIssue()} locale="en" />);
      // card stamp + full-file stamp
      expect(screen.getAllByText("ERROR")).toHaveLength(2);
    });

    it("credits a Hector-bylined issue and not a newsroom one", () => {
      const { rerender } = render(
        <IssueContent issue={makeIssue()} locale="en" />
      );
      expect(screen.getByText("Hector Luis Alamo")).toBeInTheDocument();
      expect(screen.getByText("Reported with Nico")).toBeInTheDocument();
      rerender(
        <IssueContent issue={makeIssue({ byline: "newsroom" })} locale="es" />
      );
      expect(
        screen.getByText("la redacción de The Crash Log")
      ).toBeInTheDocument();
      expect(
        screen.queryByText(/Con reportería de Nico/)
      ).not.toBeInTheDocument();
    });

    it("renders one card per story, with the story count in the kicker", () => {
      const issue = makeIssue({
        stories: [
          storyWith("a", { summary: { en: "Sum A" }, body: undefined }),
          storyWith("b", { summary: { en: "Sum B" }, body: undefined }),
          storyWith("c", { summary: { en: "Sum C" }, body: undefined }),
        ],
      });
      render(<IssueContent issue={issue} locale="en" />);
      expect(screen.getAllByRole("article")).toHaveLength(3);
      expect(screen.getByText("3 CASES")).toBeInTheDocument();
    });

    it("renders the full-files section only when a story has a body", () => {
      const withBody = makeIssue();
      render(<IssueContent issue={withBody} locale="en" />);
      expect(screen.getByText("The full files")).toBeInTheDocument();
      // card summary (first paragraph fallback) + full file body
      expect(screen.getAllByText("Story body")).toHaveLength(2);
    });

    it("renders cards only (no full files) when no story has a body", () => {
      const issue = makeIssue({
        stories: [
          storyWith("a", { summary: { en: "Sum A" }, body: undefined }),
        ],
      });
      render(<IssueContent issue={issue} locale="en" />);
      expect(screen.queryByText("The full files")).not.toBeInTheDocument();
      expect(screen.getAllByRole("article")).toHaveLength(1);
      // the case number is not a link when there is no file to jump to
      expect(
        screen.queryByRole("link", { name: "Case 01" })
      ).not.toBeInTheDocument();
    });

    it("links a card's case number to the full file for stories with a body only", () => {
      const issue = makeIssue({
        stories: [
          storyWith("a", { summary: { en: "Sum A" } }),
          storyWith("b", { summary: { en: "Sum B" }, body: undefined }),
        ],
      });
      render(<IssueContent issue={issue} locale="en" />);
      expect(screen.getByRole("link", { name: "Case 01" })).toHaveAttribute(
        "href",
        "#case-file-01"
      );
      expect(
        screen.queryByRole("link", { name: "Case 02" })
      ).not.toBeInTheDocument();
    });

    it("defines the stamp filter exactly once for the page", () => {
      const { container } = render(
        <IssueContent
          issue={makeIssue({
            stories: [storyWith("a"), storyWith("b"), storyWith("c")],
          })}
          locale="en"
        />
      );
      expect(container.querySelectorAll("filter")).toHaveLength(1);
    });

    it("renders stack trace items", () => {
      render(<IssueContent issue={makeIssue()} locale="en" />);
      expect(screen.getByText("AI hiring surge")).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: "TechCrunch" })
      ).toBeInTheDocument();
    });

    // The Footer is rendered in the layout, not inside IssueContent.
    // See components/Footer.js.
  });

  describe("null story handling", () => {
    it("does not crash when stories array contains null entries", () => {
      const issue = makeIssue({
        stories: [
          null,
          {
            _id: "story-1",
            severity: "ERROR",
            headline: { en: "Robot Fails" },
            tags: { en: "AI / Automation" },
            body: {
              en: [
                {
                  _type: "block",
                  children: [{ _type: "span", text: "Story body" }],
                },
              ],
            },
          },
          null,
        ],
      });
      render(<IssueContent issue={issue} locale="en" />);
      expect(screen.getAllByText("Robot Fails")).toHaveLength(2);
      expect(screen.getAllByRole("article")).toHaveLength(2);
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
