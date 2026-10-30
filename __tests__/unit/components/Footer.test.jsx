// ABOUTME: Unit tests for Footer component.
// ABOUTME: Validates the series list, Elsewhere links, fine print and roundel.

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import Footer from "@/components/Footer";
import { SUBSTACK_SUBSCRIBE_URL } from "@/lib/substack";

describe("Footer", () => {
  it("renders a footer element", () => {
    render(<Footer locale="en" />);
    expect(document.querySelector("footer")).toBeInTheDocument();
  });

  it("renders the small roundel", () => {
    render(<Footer locale="en" />);
    const mark = screen.getByRole("img", { name: "Crash Log" });
    expect(mark.querySelector("textPath")).toBeNull();
  });

  it("renders the roundel at 22px, matching the reference render", () => {
    render(<Footer locale="en" />);
    const mark = screen.getByRole("img", { name: "Crash Log" });
    expect(mark).toHaveAttribute("width", "22");
    expect(mark).toHaveAttribute("height", "22");
  });

  it("uses h2 for the column headings (no skipped levels) and no h4", () => {
    const { container } = render(<Footer locale="en" />);
    const headings = screen.getAllByRole("heading");
    expect(headings.map((h) => h.tagName)).toEqual(["H2", "H2", "H2"]);
    expect(container.querySelector("h3, h4, h5, h6")).toBeNull();
  });

  it("gives the language links a group role with its label", () => {
    render(<Footer locale="en" />);
    const group = screen.getByRole("group", { name: "Languages" });
    expect(group.querySelectorAll("a")).toHaveLength(2);
  });

  it("renders the series list with colour-classed codes", () => {
    render(<Footer locale="en" />);
    expect(screen.getByText("OTR").className).toContain("otr");
    expect(screen.getByText("FIX").className).toContain("fix");
    expect(screen.getByText("NOTE").className).toContain("note");
    expect(screen.getByText(/Off the Rails/)).toBeInTheDocument();
    expect(screen.getByText(/Practical/)).toBeInTheDocument();
    expect(screen.getByText(/Nico’s Notes/)).toBeInTheDocument();
  });

  it("renders Spanish series names and headings", () => {
    render(<Footer locale="es" />);
    expect(screen.getByText("Las series")).toBeInTheDocument();
    expect(screen.getByText(/Fuera de las vías/)).toBeInTheDocument();
    expect(screen.getByText("Más")).toBeInTheDocument();
  });

  it("renders Elsewhere links with locale-prefixed hrefs", () => {
    render(<Footer locale="en" />);
    expect(screen.getByText("Archive").closest("a")).toHaveAttribute(
      "href",
      "/en/archive"
    );
    expect(screen.getByText("About").closest("a")).toHaveAttribute(
      "href",
      "/en/about"
    );
    expect(screen.getByText("Support the Log").closest("a")).toHaveAttribute(
      "href",
      "/en/support"
    );
    expect(screen.getByText("RSS").closest("a")).toHaveAttribute(
      "href",
      "/en/feed.xml"
    );
    expect(screen.getByText("Contact").closest("a")).toHaveAttribute(
      "href",
      "mailto:info@palamo.ai"
    );
  });

  it("renders the subscribe line linking to Substack", () => {
    render(<Footer locale="en" />);
    expect(
      screen.getByText(/New files every week\. Free\./)
    ).toBeInTheDocument();
    expect(screen.getByText("Subscribe").closest("a")).toHaveAttribute(
      "href",
      SUBSTACK_SUBSCRIBE_URL
    );
  });

  it("renders the copyright with the current year and Palamo credit", () => {
    render(<Footer locale="en" />);
    expect(
      screen.getByText(
        new RegExp(`© ${new Date().getFullYear()} The Crash Log`)
      )
    ).toBeInTheDocument();
    const bottom =
      document.querySelector("footer").lastElementChild.lastElementChild;
    expect(bottom).toHaveTextContent("A Palamo publication");
  });

  it("links 'A Palamo publication' to palamo.ai from the Elsewhere column", () => {
    render(<Footer locale="en" />);
    const link = screen.getByRole("link", { name: "A Palamo publication" });
    expect(link).toHaveAttribute("href", "https://palamo.ai");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders the Spanish Palamo link", () => {
    render(<Footer locale="es" />);
    expect(
      screen.getByRole("link", { name: "Una publicación de Palamo" })
    ).toHaveAttribute("href", "https://palamo.ai");
  });

  describe("Follow column", () => {
    it("renders the Follow heading and Bluesky and Instagram links", () => {
      render(<Footer locale="en" />);
      expect(screen.getByText("Follow")).toBeInTheDocument();
      const bsky = screen.getByRole("link", { name: "Bluesky" });
      expect(bsky).toHaveAttribute(
        "href",
        "https://bsky.app/profile/hectoralamo.bsky.social"
      );
      expect(bsky).toHaveAttribute("rel", "noopener noreferrer");
      const ig = screen.getByRole("link", { name: "Instagram" });
      expect(ig).toHaveAttribute(
        "href",
        "https://www.instagram.com/hectoralamo.ai"
      );
      expect(ig).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("renders the Spanish heading", () => {
      render(<Footer locale="es" />);
      expect(screen.getByText("Síguenos")).toBeInTheDocument();
    });

    it("renders the TikTok link from the shared constant by default", () => {
      render(<Footer locale="en" />);
      expect(screen.getByRole("link", { name: "TikTok" })).toHaveAttribute(
        "href",
        "https://www.tiktok.com/@hectorluislamo"
      );
    });

    it("omits TikTok when no URL is set", () => {
      render(<Footer locale="en" tiktokUrl={null} />);
      expect(screen.queryByText("TikTok")).toBeNull();
    });

    it("renders TikTok when a URL is set", () => {
      render(
        <Footer locale="en" tiktokUrl="https://www.tiktok.com/@example" />
      );
      expect(screen.getByRole("link", { name: "TikTok" })).toHaveAttribute(
        "href",
        "https://www.tiktok.com/@example"
      );
    });
  });

  it("renders EN and ES links", () => {
    render(<Footer locale="en" />);
    expect(screen.getByText("EN").closest("a")).toHaveAttribute("href", "/en");
    expect(screen.getByText("ES").closest("a")).toHaveAttribute("href", "/es");
  });
});
