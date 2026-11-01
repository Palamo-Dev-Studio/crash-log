// ABOUTME: Tests that every series renders the same plain-text byline: "By <name>" plus the credit, with no avatar or initial.
// ABOUTME: The issue header and the shared article layout are compared structurally, EN and ES.

import { describe, it, expect, vi } from "vitest";
import { readFileSync } from "node:fs";
import { render } from "@testing-library/react";

vi.mock("next/image", () => ({
  default: ({ src, alt }) => <img src={src} alt={alt} />,
}));
vi.mock("@/lib/sanity", () => ({ urlFor: () => ({}) }));

import Byline from "@/components/Byline";
import IssueHeader from "@/components/IssueHeader";
import ArticleLayout from "@/components/ArticleLayout";

const DOCS = {
  issue: { _type: "issue", issueNumber: 27, publishDate: "2026-06-11" },
  practical: {
    _type: "practical",
    practicalNumber: 12,
    publishDate: "2026-06-11",
  },
  column: { _type: "column", columnNumber: 22, publishDate: "2026-06-11" },
};

function renderHeader(type, locale, byline, credit) {
  if (type === "issue") {
    return render(
      <IssueHeader
        locale={locale}
        code="OTR-027"
        title="T"
        byline={byline}
        credit={credit}
      />
    );
  }
  return render(
    <ArticleLayout
      doc={{ ...DOCS[type], ...(byline ? { byline } : {}) }}
      locale={locale}
      title="T"
      body={[]}
    />
  );
}

// Reduces the byline element to its tag/class-free shape: tags and text with the name masked.
function shape(el) {
  return el.outerHTML
    .replace(/ class="[^"]*"/g, "")
    .replace(/<strong>[^<]*<\/strong>/, "<strong>NAME</strong>")
    .replace(/(Reported with Nico|Con reportería de Nico)/, "CREDIT");
}

function findByline(container) {
  return container.querySelector("[data-byline]");
}

describe("Byline", () => {
  it("renders 'By <name>' with the name bold, and the credit when given", () => {
    const { container } = render(
      <Byline
        locale="en"
        byline="Hector Luis Alamo"
        credit="Reported with Nico"
      />
    );
    const el = findByline(container);
    expect(el.textContent).toBe("By Hector Luis Alamo" + "Reported with Nico");
    expect(el.querySelector("strong").textContent).toBe("Hector Luis Alamo");
  });

  it("uses the Spanish prefix", () => {
    const { container } = render(<Byline locale="es" byline="Nico von Bot" />);
    expect(findByline(container).textContent).toBe("Por Nico von Bot");
  });

  it("renders nothing without a byline", () => {
    const { container } = render(<Byline locale="en" byline={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("byline across series", () => {
  it.each(["en", "es"])(
    "issue, practical and column share one byline structure (%s)",
    (locale) => {
      const shapes = ["issue", "practical", "column"].map((type) => {
        const { container } = renderHeader(
          type,
          locale,
          type === "column" ? undefined : "Hector Luis Alamo",
          "Reported with Nico"
        );
        const el = findByline(container);
        expect(el).not.toBeNull();
        return shape(el);
      });
      // The column has no credit by series rule, so compare the shared "By <name>" part.
      const lead = (s) => s.split("</span>")[0];
      expect(lead(shapes[0])).toBe(lead(shapes[1]));
      expect(lead(shapes[1])).toBe(lead(shapes[2]));
      expect(shapes[0]).toBe(shapes[1]);
    }
  );

  it.each(["issue", "practical", "column"])(
    "%s byline has no avatar or initial element",
    (type) => {
      const { container } = renderHeader(
        type,
        "en",
        type === "issue" ? "Hector Luis Alamo" : undefined,
        null
      );
      expect(container.querySelector("[class*='avatar' i]")).toBeNull();
      const el = findByline(container);
      expect(el.querySelector("[aria-hidden]")).toBeNull();
      expect(el.children.length).toBeGreaterThan(0);
      for (const child of el.children) {
        expect(child.textContent.trim().length).toBeGreaterThan(1);
      }
    }
  );

  it("keeps the newsroom credit in the same plain style", () => {
    const { container } = renderHeader(
      "issue",
      "en",
      "The Crash Log newsroom",
      null
    );
    expect(findByline(container).textContent).toBe("By The Crash Log newsroom");
  });

  it("ships no avatar CSS in the article layout", () => {
    const css = readFileSync("components/ArticleLayout.module.css", "utf8");
    expect(css).not.toMatch(/avatar/);
  });
});
