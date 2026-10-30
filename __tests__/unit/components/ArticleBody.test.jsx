// ABOUTME: Component tests for ArticleBody: every Practical custom block renders, with and without its optional parts.
// ABOUTME: Uses the real PortableText renderer; next/image and the Sanity URL builder are stubbed.

import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";

vi.mock("next/image", () => ({
  default: ({ src, alt }) => <img src={src} alt={alt} />,
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

import ArticleBody, { safeButtonHref } from "@/components/ArticleBody";
import { prepareArticleBody } from "@/lib/articleBody";

const span = (text, marks = []) => ({ _type: "span", text, marks });
const block = (style, text) => ({
  _type: "block",
  style,
  children: [span(text)],
  markDefs: [],
});

function renderBody(body, locale = "en") {
  const { blocks } = prepareArticleBody(body, locale);
  return render(<ArticleBody blocks={blocks} locale={locale} />);
}

const FULL = [
  block("h2", "What you need"),
  block("h3", "The one rule"),
  block("normal", "Plain paragraph."),
  {
    _type: "steps",
    items: [
      { title: "Collect the week.", text: "Export it." },
      { title: "Clean it.", text: "Delete footers." },
    ],
  },
  { _type: "codeBlock", language: "bash", code: "$ wc -w file.txt\n4212" },
  {
    _type: "exhibit",
    label: "EXHIBIT A",
    tag: "WEEK 44",
    from: "Customer brief · 07:30",
    rows: [
      { lead: "Delivery windows confuse people.", text: "Six messages." },
      { lead: "Refunds are up.", text: "Nine messages." },
    ],
    caption: "The brief as it lands.",
  },
  {
    _type: "pullQuote",
    text: "If you cannot say what you would change, it is not finished.",
  },
  { _type: "callout", title: "Check before you act", text: "Open two quotes." },
  {
    _type: "replyAsk",
    title: "Your turn",
    text: "Send me the question.",
    buttonLabel: "Reply to this file",
    buttonUrl: "mailto:info@palamo.ai",
  },
];

describe("ArticleBody custom blocks", () => {
  it("renders headings with their anchor ids", () => {
    const { container } = renderBody(FULL);
    expect(container.querySelector("h2#what-you-need")).not.toBeNull();
    expect(container.querySelector("h3").textContent).toBe("The one rule");
  });

  it("renders steps as an ordered list with bold titles", () => {
    const { container } = renderBody(FULL);
    const items = container.querySelectorAll("ol > li");
    expect(items).toHaveLength(2);
    expect(items[0].querySelector("strong").textContent).toBe(
      "Collect the week."
    );
    expect(items[0].textContent).toContain("Export it.");
  });

  it("renders the exhibit: label, tag, from, numbered rows and a FIG caption", () => {
    renderBody(FULL);
    expect(screen.getByText("EXHIBIT A")).toBeInTheDocument();
    expect(screen.getByText("WEEK 44")).toBeInTheDocument();
    expect(screen.getByText("Customer brief · 07:30")).toBeInTheDocument();
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("02")).toBeInTheDocument();
    expect(screen.getByText("Delivery windows confuse people.").tagName).toBe(
      "B"
    );
    expect(
      screen.getByText("FIG. 1 · The brief as it lands.")
    ).toBeInTheDocument();
  });

  it("omits the exhibit's from line, tag and caption when absent", () => {
    const { container } = renderBody([
      {
        _type: "exhibit",
        label: "EXHIBIT B",
        rows: [{ lead: "L", text: "T" }],
      },
    ]);
    expect(screen.getByText("EXHIBIT B")).toBeInTheDocument();
    expect(container.querySelector("figcaption")).toBeNull();
    expect(screen.queryByText(/Customer brief/)).toBeNull();
  });

  it("numbers a second exhibit FIG. 2", () => {
    renderBody([
      { _type: "exhibit", label: "A", caption: "first" },
      { _type: "exhibit", label: "B", caption: "second" },
    ]);
    expect(screen.getByText("FIG. 2 · second")).toBeInTheDocument();
  });

  it("renders the callout with its title, and the localized default when untitled", () => {
    renderBody(FULL);
    expect(screen.getByText("Check before you act")).toBeInTheDocument();
    expect(screen.getByText("Open two quotes.")).toBeInTheDocument();
  });

  it("uses the Spanish callout default when no title is set", () => {
    renderBody([{ _type: "callout", text: "x" }], "es");
    expect(screen.getByText("Revisa antes de actuar")).toBeInTheDocument();
  });

  it("renders the pull quote as a blockquote", () => {
    const { container } = renderBody(FULL);
    expect(container.querySelector("blockquote").textContent).toContain(
      "it is not finished"
    );
  });

  it("renders the code block in a focusable pre, preserving line breaks", () => {
    const { container } = renderBody(FULL);
    const pre = container.querySelector("pre");
    expect(pre.getAttribute("tabindex")).toBe("0");
    expect(pre.textContent).toBe("$ wc -w file.txt\n4212");
  });

  it("renders replyAsk as an h2 with its button when buttonUrl is set", () => {
    const { container } = renderBody(FULL);
    const section = container.querySelector("section");
    expect(within(section).getByRole("heading", { level: 2 }).id).toBe(
      "your-turn"
    );
    expect(
      within(section).getByRole("link", { name: "Reply to this file" })
    ).toHaveAttribute("href", "mailto:info@palamo.ai");
  });

  it("renders replyAsk with no button when buttonUrl is absent", () => {
    renderBody([
      { _type: "replyAsk", title: "Your turn", text: "t", buttonLabel: "Go" },
    ]);
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.queryByText("Go")).toBeNull();
  });

  it("drops a button whose URL uses an unsafe scheme", () => {
    renderBody([
      {
        _type: "replyAsk",
        title: "x",
        buttonLabel: "Go",
        buttonUrl: "javascript:alert(1)",
      },
    ]);
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.queryByText("Go")).toBeNull();
  });

  it("adds ?ref=crashlog.ai to http(s) button URLs only", () => {
    expect(safeButtonHref("https://example.com/a")).toBe(
      "https://example.com/a?ref=crashlog.ai"
    );
    expect(safeButtonHref("mailto:a@b.co")).toBe("mailto:a@b.co");
    expect(safeButtonHref("data:text/html,x")).toBeNull();
    expect(safeButtonHref(undefined)).toBeNull();
  });

  it("adds ?ref to outbound body links and opens them safely", () => {
    renderBody([
      {
        _type: "block",
        style: "normal",
        markDefs: [{ _key: "k", _type: "link", href: "https://example.com/x" }],
        children: [span("read this", ["k"])],
      },
    ]);
    const link = screen.getByRole("link", { name: "read this" });
    expect(link).toHaveAttribute(
      "href",
      "https://example.com/x?ref=crashlog.ai"
    );
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
