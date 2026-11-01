// ABOUTME: Unit tests for Header component.
// ABOUTME: Validates roundel, wordmark, blinking cursor, tagline, tools (toggle slot, Support, Subscribe).

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import fs from "node:fs";
import path from "node:path";
import { SUBSTACK_SUBSCRIBE_URL } from "@/lib/substack";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import Header from "@/components/Header";

describe("Header", () => {
  it("renders The Crash Log wordmark", () => {
    render(<Header locale="en" />);
    expect(screen.getByText("The Crash Log")).toBeInTheDocument();
  });

  it("marks both roundels decorative so the brand link is named once", () => {
    render(<Header locale="en" />);
    expect(screen.queryAllByRole("img")).toHaveLength(0);
    expect(screen.getByRole("link", { name: /^The Crash Log/ })).toBeVisible();
    const link = screen.getByRole("link", { name: /^The Crash Log/ });
    expect(link).not.toHaveAccessibleName(/Crash Log\s+The Crash Log/);
    link.querySelectorAll("svg").forEach((svg) => {
      expect(svg).toHaveAttribute("aria-hidden", "true");
      expect(svg).not.toHaveAttribute("role");
      expect(svg).not.toHaveAttribute("aria-label");
    });
  });

  it("renders the stamp roundel at masthead size (ring legend present)", () => {
    const { container } = render(<Header locale="en" />);
    expect(container.querySelector("textPath")).not.toBeNull();
  });

  it("renders a decorative small mark hidden from assistive tech", () => {
    const { container } = render(<Header locale="en" />);
    const hidden = container.querySelector('span[aria-hidden="true"] svg');
    expect(hidden).not.toBeNull();
  });

  it("renders the blinking cursor as an aria-hidden element after the wordmark", () => {
    render(<Header locale="en" />);
    const name = screen.getByText("The Crash Log");
    const cursor = name.querySelector('[aria-hidden="true"]');
    expect(cursor).not.toBeNull();
    expect(cursor.className).toContain("cursor");
  });

  it("no longer uses the old logo image", () => {
    const { container } = render(<Header locale="en" />);
    expect(container.querySelector("img")).toBeNull();
  });

  it("renders the English tagline", () => {
    render(<Header locale="en" />);
    expect(
      screen.getByText("Incident reports on AI and what to do next")
    ).toBeInTheDocument();
  });

  it("renders the Spanish tagline for es locale", () => {
    render(<Header locale="es" />);
    expect(
      screen.getByText("Informes de incidentes de IA y qué hacer después")
    ).toBeInTheDocument();
  });

  it("renders Subscribe as a plain link to Substack, not a form or button", () => {
    const { container } = render(<Header locale="en" />);
    const link = screen.getByRole("link", { name: "Subscribe" });
    expect(link).toHaveAttribute("href", SUBSTACK_SUBSCRIBE_URL);
    expect(link.className).toContain("subscribe");
    expect(container.querySelector("form, input, button")).toBeNull();
  });

  it("renders Suscríbete for the Spanish locale", () => {
    render(<Header locale="es" />);
    expect(screen.getByRole("link", { name: "Suscríbete" })).toHaveAttribute(
      "href",
      SUBSTACK_SUBSCRIBE_URL
    );
  });

  it("wordmark links to locale home", () => {
    render(<Header locale="es" />);
    expect(screen.getByText("The Crash Log").closest("a")).toHaveAttribute(
      "href",
      "/es"
    );
  });

  it("renders children first in the tools group", () => {
    render(
      <Header locale="en">
        <button>Toggle</button>
      </Header>
    );
    const tools = screen.getByText("Toggle").parentElement;
    expect(tools.firstElementChild).toBe(screen.getByText("Toggle"));
  });

  it("renders a Support link to the support page", () => {
    render(<Header locale="en" />);
    expect(screen.getByText("Support").closest("a")).toHaveAttribute(
      "href",
      "/en/support"
    );
  });

  it("renders Apoyar for the Spanish locale", () => {
    render(<Header locale="es" />);
    expect(screen.getByText("Apoyar").closest("a")).toHaveAttribute(
      "href",
      "/es/support"
    );
  });

  it("does not render the old Fund button", () => {
    render(<Header locale="en" />);
    expect(screen.queryByText("Fund")).toBeNull();
  });

  it("orders tools: Support before Subscribe", () => {
    render(<Header locale="en" />);
    const subscribe = screen.getByRole("link", { name: "Subscribe" });
    const kids = Array.from(subscribe.parentElement.children);
    const supportIdx = kids.findIndex((el) => el.textContent === "Support");
    expect(supportIdx).toBeGreaterThanOrEqual(0);
    expect(supportIdx).toBeLessThan(kids.indexOf(subscribe));
  });

  it("styles Support as the terracotta outline box link", () => {
    render(<Header locale="en" />);
    const support = screen.getByRole("link", { name: "Support" });
    expect(support.className).toContain("support");
    expect(support).toHaveAttribute("href", "/en/support");
  });
});

describe("Header masthead button styles", () => {
  const css = fs.readFileSync(
    path.join(process.cwd(), "components/Header.module.css"),
    "utf8"
  );
  const tokens = fs.readFileSync(
    path.join(process.cwd(), "app/globals.css"),
    "utf8"
  );
  const rule = (selector) => {
    const m = css.match(
      new RegExp(
        `(?:^|\\n)${selector.replace(/[.:]/g, "\\$&")}\\s*\\{([^}]*)\\}`
      )
    );
    return m ? m[1] : "";
  };
  const token = (name) =>
    tokens.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`))[1];
  const luminance = (hex) => {
    const [r, g, b] = [1, 3, 5]
      .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const contrast = (a, b) => {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  };

  it("Support has a 1.5px terracotta border, 2px radius, terra-ink mono label text", () => {
    const r = rule(".support");
    expect(r).toMatch(/border:\s*1\.5px solid var\(--terra\)/);
    expect(r).toMatch(/border-radius:\s*2px/);
    expect(r).toMatch(/color:\s*var\(--terra-ink\)/);
    expect(r).toMatch(/font-family:\s*var\(--mono\)/);
    expect(r).toMatch(/font-size:\s*var\(--label\)/);
  });

  it("Support fills terra-ink with cream text on hover and has a focus ring", () => {
    const h = rule(".support:hover");
    expect(h).toMatch(/background:\s*var\(--terra-ink\)/);
    expect(h).toMatch(/color:\s*var\(--cream\)/);
    expect(css).toMatch(/\.support:focus-visible/);
    expect(css).toMatch(/\.subscribe:focus-visible/);
  });

  it("Support text and hover pair meet WCAG AA (4.5:1)", () => {
    expect(contrast(token("terra-ink"), token("cream"))).toBeGreaterThanOrEqual(
      4.5
    );
  });

  it("Subscribe is the ink button: cream on ink, terra-ink on hover", () => {
    const r = rule(".subscribe");
    expect(r).toMatch(/background:\s*var\(--ink\)/);
    expect(r).toMatch(/color:\s*var\(--cream\)/);
    expect(rule(".subscribe:hover")).toMatch(
      /background:\s*var\(--terra-ink\)/
    );
    expect(contrast(token("cream"), token("ink"))).toBeGreaterThanOrEqual(4.5);
  });

  it("Support stays hidden on mobile", () => {
    expect(css).toMatch(
      /@media \(max-width: 700px\)[\s\S]*\.support\s*\{\s*display:\s*none/
    );
  });
});
