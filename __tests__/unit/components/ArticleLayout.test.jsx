// ABOUTME: Component tests for ArticleLayout: TOC mirrors the body H2s, TOC only with 2+ H2s, bylines and credit per series.
// ABOUTME: A full Practical fixture (all six custom blocks, duplicate H2 text) is rendered and its DOM checked structurally.

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));
vi.mock("next/image", () => ({
  default: ({ src, alt, width, height }) => (
    <img src={src} alt={alt} width={width} height={height} />
  ),
}));
vi.mock("@/lib/sanity", () => ({
  urlFor: () => ({
    width() {
      return this;
    },
    height() {
      return this;
    },
    format() {
      return this;
    },
    url: () => "https://cdn.sanity.io/test.webp",
  }),
}));

import ArticleLayout from "@/components/ArticleLayout";

const span = (text) => ({ _type: "span", text, marks: [] });
const block = (style, text) => ({
  _type: "block",
  style,
  children: [span(text)],
  markDefs: [],
});

const PRACTICAL = {
  _type: "practical",
  practicalNumber: 12,
  publishDate: "2026-11-04T10:00:00Z",
};

const FULL_BODY = [
  block("normal", "Intro."),
  block("h2", "What you need"),
  block("h2", "The workflow"),
  { _type: "steps", items: [{ title: "One.", text: "a" }] },
  { _type: "codeBlock", code: "$ ls" },
  {
    _type: "exhibit",
    label: "EXHIBIT A",
    rows: [{ lead: "L", text: "T" }],
    caption: "c",
  },
  { _type: "pullQuote", text: "Quote." },
  { _type: "callout", text: "Careful." },
  block("h2", "The workflow"),
  { _type: "replyAsk", title: "Your turn", text: "t" },
];

function renderLayout(props = {}) {
  return render(
    <ArticleLayout
      doc={PRACTICAL}
      locale="en"
      title="Turn your inbox into a brief"
      subtitle="A twenty-minute setup."
      body={FULL_BODY}
      minutes={7}
      {...props}
    />
  );
}

describe("ArticleLayout table of contents", () => {
  it("lists exactly the article's H2s, in order, with matching unique anchors", () => {
    const { container } = renderLayout();
    const tocLinks = [...container.querySelectorAll("aside a")];
    const h2s = [...container.querySelectorAll("article h2")];

    expect(tocLinks.map((a) => a.textContent)).toEqual(
      h2s.map((h) => h.textContent)
    );
    expect(tocLinks.map((a) => a.textContent)).toEqual([
      "What you need",
      "The workflow",
      "The workflow",
      "Your turn",
    ]);

    const ids = h2s.map((h) => h.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(tocLinks.map((a) => a.getAttribute("href"))).toEqual(
      ids.map((id) => `#${id}`)
    );
  });

  it("labels the TOC in the page locale", () => {
    renderLayout({ locale: "es" });
    expect(screen.getByLabelText("En este expediente")).toBeInTheDocument();
  });

  it("omits the TOC column when the body has fewer than two H2s", () => {
    const { container } = renderLayout({
      body: [block("normal", "x"), block("h2", "Only one")],
    });
    expect(container.querySelector("aside")).toBeNull();
    expect(container.querySelector("main").className).toMatch(/noToc/);
  });

  it("keeps the TOC column with exactly two H2s", () => {
    const { container } = renderLayout({
      body: [block("h2", "A"), block("h2", "B")],
    });
    expect(container.querySelector("aside")).not.toBeNull();
    expect(container.querySelector("main").className).not.toMatch(/noToc/);
  });
});

describe("ArticleLayout header", () => {
  it("shows kicker chip, series, date and reading time for a Practical post", () => {
    renderLayout();
    expect(screen.getByText("FIX-012")).toBeInTheDocument();
    expect(screen.getByText("Practical")).toBeInTheDocument();
    expect(screen.getByText("Nov 4, 2026")).toBeInTheDocument();
    expect(screen.getByText("7 min read")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Turn your inbox into a brief",
      })
    ).toBeInTheDocument();
    expect(screen.getByText("A twenty-minute setup.")).toBeInTheDocument();
  });

  it("bylines a Practical post to Hector with the credit line, once", () => {
    const { container } = renderLayout();
    expect(screen.getByText("Hector Luis Alamo").tagName).toBe("STRONG");
    expect(screen.getAllByText("Reported with Nico")).toHaveLength(1);
    expect(container.querySelectorAll("strong").length).toBeGreaterThan(0);
  });

  it("uses Spanish byline and credit labels in ES", () => {
    renderLayout({ locale: "es" });
    expect(screen.getByText(/^Por/)).toBeInTheDocument();
    expect(screen.getByText("Con reportería de Nico")).toBeInTheDocument();
    expect(screen.getByText("Práctico")).toBeInTheDocument();
    expect(screen.getByText("7 min de lectura")).toBeInTheDocument();
  });

  it("bylines a column to Nico von Bot with no credit line and a NOTE chip", () => {
    renderLayout({
      doc: { _type: "column", columnNumber: 22, publishDate: "2026-11-04" },
    });
    expect(screen.getByText("NOTE-022")).toBeInTheDocument();
    expect(screen.getByText("Nico’s Notes")).toBeInTheDocument();
    expect(screen.getByText("Nico von Bot")).toBeInTheDocument();
    expect(screen.queryByText(/Reported with Nico/)).toBeNull();
  });

  it("drops a named author's credit line", () => {
    renderLayout({ doc: { ...PRACTICAL, byline: "Guest Writer" } });
    expect(screen.getByText("Guest Writer")).toBeInTheDocument();
    expect(screen.queryByText("Reported with Nico")).toBeNull();
  });

  it("omits the reading time when unknown", () => {
    renderLayout({ minutes: null });
    expect(screen.queryByText(/min read/)).toBeNull();
  });
});

describe("ArticleLayout extras", () => {
  it("shows the Substack subscribe prompt only when asked", () => {
    const { rerender } = renderLayout({ showSubscribe: true });
    expect(
      screen.getByRole("link", { name: "Subscribe" }).getAttribute("href")
    ).toMatch(/substack\.com/);
    rerender(<ArticleLayout doc={PRACTICAL} locale="en" title="T" body={[]} />);
    expect(screen.queryByRole("link", { name: "Subscribe" })).toBeNull();
  });

  it("shows the Spanish fallback banner only when asked", () => {
    const { rerender } = renderLayout({ locale: "es", showFallback: true });
    expect(screen.getByText(/pr.ximamente/)).toBeInTheDocument();
    rerender(<ArticleLayout doc={PRACTICAL} locale="es" title="T" body={[]} />);
    expect(screen.queryByText(/pr.ximamente/)).toBeNull();
  });
});

describe("ArticleLayout cover image", () => {
  const COVER = { _type: "image", asset: { _ref: "image-abc-1200x675-png" } };

  it("renders the cover between the byline block and the body, with its alt", () => {
    renderLayout({ coverImage: COVER, coverImageAlt: "A server on fire" });
    const img = screen.getByRole("img", { name: "A server on fire" });
    expect(img.getAttribute("src")).toMatch(/cdn\.sanity\.io/);
    expect(img.getAttribute("width")).toBe("1200");
    expect(img.getAttribute("height")).toBe("675");
    const article = img.closest("article");
    const header = article.querySelector("header");
    const firstBodyNode = screen.getByText("Intro.");
    expect(
      header.compareDocumentPosition(img) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(
      img.compareDocumentPosition(firstBodyNode) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it("uses a decorative empty alt when no alt text exists", () => {
    const { container } = renderLayout({ coverImage: COVER });
    const img = container.querySelector("article img");
    expect(img).not.toBeNull();
    expect(img.getAttribute("alt")).toBe("");
  });

  it("renders no image when there is no cover", () => {
    const { container } = renderLayout();
    expect(container.querySelector("article img")).toBeNull();
  });
});

describe("ArticleLayout subscribe box", () => {
  it("renders exactly once, after the last paragraph, in both locales", () => {
    for (const [locale, line] of [
      ["en", "New files every week. Free."],
      ["es", "Expedientes nuevos cada semana. Gratis."],
    ]) {
      const { container, unmount } = renderLayout({
        locale,
        showSubscribe: true,
        body: [block("normal", "First."), block("normal", "Last.")],
      });
      expect(screen.getAllByText(line)).toHaveLength(1);
      expect(
        container.querySelectorAll("article a[href*='substack.com']")
      ).toHaveLength(1);
      const last = screen.getByText("Last.");
      const box = screen.getByText(line);
      expect(
        last.compareDocumentPosition(box) & Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy();
      unmount();
    }
  });
});
