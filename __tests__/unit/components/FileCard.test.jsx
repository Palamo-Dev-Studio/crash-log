// ABOUTME: Component tests for the magazine layout: FileCard (lead and card), FileMagazine's lead + grid split, FileCardGrid and RecentFiles' three cards.
// ABOUTME: Covers image alt, chip, date, title, subtitle, byline, one link named by the title, eager lead image, locale fallback and the single-item case.

import { describe, it, expect, vi } from "vitest";
import { readFileSync } from "node:fs";
import { render, screen, within } from "@testing-library/react";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));
vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    preload,
    fetchPriority,
    sizes,
    width,
    height,
    className,
  }) => (
    <img
      src={src}
      alt={alt}
      sizes={sizes}
      width={width}
      height={height}
      className={className}
      data-priority={preload ? "true" : "false"}
      data-fetchpriority={fetchPriority || ""}
    />
  ),
}));
const requested = vi.hoisted(() => ({ widths: [] }));
vi.mock("@/lib/sanity", () => ({
  // Like @sanity/image-url, throw on a source with no asset.
  urlFor: (source) => {
    if (!source?.asset)
      throw new Error("Unable to resolve image URL from source");
    return {
      width(w) {
        requested.widths.push(w);
        return this;
      },
      height() {
        return this;
      },
      format() {
        return this;
      },
      url: () => "https://cdn.sanity.io/test.webp",
    };
  },
}));

import FileCard from "@/components/FileCard";
import FileMagazine from "@/components/FileMagazine";
import RecentFiles from "@/components/RecentFiles";
import SeriesIndex from "@/components/SeriesIndex";
import OffTheRailsIndex from "@/components/OffTheRailsIndex";

const doc = (n, extra = {}) => ({
  _id: `i${n}`,
  _type: "issue",
  slug: `crash-log-${String(n).padStart(3, "0")}`,
  issueNumber: n,
  publishDate: `2026-10-${String(n).padStart(2, "0")}T00:00:00Z`,
  byline: "Hector Luis Alamo",
  title: { en: `Title ${n}`, es: `Título ${n}` },
  subtitle: { en: `Subtitle ${n}`, es: `Subtítulo ${n}` },
  coverImage: { asset: { _ref: `image-${n}` } },
  coverImageAlt: { en: `Alt ${n}`, es: `Alt ES ${n}` },
  ...extra,
});

describe("FileCard", () => {
  it("renders image with alt, chip, date, title, subtitle and byline in one link", () => {
    render(<FileCard doc={doc(28)} locale="en" />);
    const link = screen.getByRole("link", { name: "Title 28" });
    expect(link).toHaveAttribute("href", "/en/issue/crash-log-028");
    expect(within(link).getByAltText("Alt 28")).toBeInTheDocument();
    expect(within(link).getByText("OTR-028")).toBeInTheDocument();
    expect(within(link).getByText("Oct 28, 2026")).toBeInTheDocument();
    expect(
      within(link).getByRole("heading", { level: 3, name: "Title 28" })
    ).toBeInTheDocument();
    expect(within(link).getByText("Subtitle 28")).toBeInTheDocument();
    expect(within(link).getByText("By Hector Luis Alamo")).toBeInTheDocument();
    expect(screen.getAllByRole("link")).toHaveLength(1);
  });

  it("uses Spanish title, subtitle and alt in the es locale", () => {
    render(<FileCard doc={doc(5)} locale="es" />);
    expect(screen.getByRole("link", { name: "Título 5" })).toHaveAttribute(
      "href",
      "/es/issue/crash-log-005"
    );
    expect(screen.getByText("Subtítulo 5")).toBeInTheDocument();
    expect(screen.getByAltText("Alt ES 5")).toBeInTheDocument();
    expect(screen.getByText(/^Por /)).toBeInTheDocument();
  });

  it("renders an empty alt when the cover has none, and no image when there is no cover", () => {
    const { container, rerender } = render(
      <FileCard doc={doc(1, { coverImageAlt: null })} locale="en" />
    );
    expect(container.querySelector("img")).toHaveAttribute("alt", "");
    rerender(<FileCard doc={doc(1, { coverImage: null })} locale="en" />);
    expect(container.querySelector("img")).toBeNull();
  });

  it("omits the subtitle line when the file has none", () => {
    const { container } = render(
      <FileCard doc={doc(1, { subtitle: null })} locale="en" />
    );
    expect(container.querySelector("p[class*='sub']")).toBeNull();
  });

  it("sets image sizes per variant and loads the image eagerly only with priority", () => {
    const { container, rerender } = render(
      <FileCard doc={doc(1)} locale="en" />
    );
    const card = container.querySelector("img");
    expect(card.getAttribute("sizes")).toMatch(/50vw/);
    expect(card.dataset.priority).toBe("false");
    expect(card.dataset.fetchpriority).toBe("");
    rerender(<FileCard doc={doc(1)} locale="en" variant="lead" priority />);
    const lead = container.querySelector("img");
    expect(lead.getAttribute("sizes")).toMatch(/680px/);
    expect(lead.dataset.priority).toBe("true");
    // Next 16's `priority` only adds a preload; the high fetch priority has to be asked for.
    expect(lead.dataset.fetchpriority).toBe("high");
  });
});

describe("FileCard polish", () => {
  const house = { byline: "newsroom" };

  it("hides the byline on a card when it is the series default, keeps it on the lead", () => {
    const { rerender } = render(<FileCard doc={doc(2, house)} locale="en" />);
    expect(screen.queryByText(/The Crash Log newsroom/)).toBeNull();
    rerender(<FileCard doc={doc(2, house)} locale="en" variant="lead" />);
    expect(screen.getByText("By The Crash Log newsroom")).toBeInTheDocument();
  });

  it("hides the default Nico's Notes byline on a card but keeps a guest byline", () => {
    const note = { _type: "column", columnNumber: 3, byline: undefined };
    const { rerender } = render(<FileCard doc={doc(3, note)} locale="en" />);
    expect(screen.queryByText(/Nico von Bot/)).toBeNull();
    rerender(
      <FileCard doc={doc(3, { ...note, byline: "Ana Ruiz" })} locale="en" />
    );
    expect(screen.getByText("By Ana Ruiz")).toBeInTheDocument();
  });

  it("keeps Hector's byline on a card", () => {
    render(<FileCard doc={doc(2)} locale="en" />);
    expect(screen.getByText("By Hector Luis Alamo")).toBeInTheDocument();
  });

  it("requests a 1200px source for cards as well as the lead", () => {
    requested.widths.length = 0;
    render(<FileCard doc={doc(1)} locale="en" />);
    expect(requested.widths).toEqual([1200]);
  });

  it("sizes the home trio by its own breakpoints: full width below 1024px", () => {
    const { container, rerender } = render(
      <FileCard doc={doc(1)} locale="en" layout="trio" />
    );
    expect(container.querySelector("img").getAttribute("sizes")).toBe(
      "(max-width: 1023px) 100vw, 360px"
    );
    rerender(<FileCard doc={doc(1)} locale="en" layout="grid" />);
    expect(container.querySelector("img").getAttribute("sizes")).toMatch(
      /50vw/
    );
  });

  it("does not clamp the card subtitle", () => {
    const css = readFileSync("components/FileCard.module.css", "utf8");
    expect(css).not.toMatch(/line-clamp/);
  });
});

describe("FileCard with a cover that has no asset", () => {
  it.each([
    ["an image object with no asset", { _type: "image" }],
    ["a null asset", { _type: "image", asset: null }],
  ])("renders the card without an image for %s", (_name, coverImage) => {
    const { container } = render(
      <FileCard doc={doc(1, { coverImage })} locale="en" />
    );
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByRole("link", { name: "Title 1" })).toBeInTheDocument();
  });
});

describe("FileCard byline placement", () => {
  it("the lead's byline is in the mono meta row, before the title and subtitle", () => {
    const { container } = render(
      <FileCard doc={doc(2)} locale="en" variant="lead" />
    );
    const meta = container.querySelector("div[class*='meta']");
    const title = container.querySelector("h3");
    const sub = container.querySelector("p[class*='sub']");
    expect(meta).toHaveTextContent("By Hector Luis Alamo");
    expect(meta.compareDocumentPosition(title)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
    // No separate byline paragraph after the subtitle: nothing sits below the late-font text.
    expect(container.querySelector("p[class*='by']")).toBeNull();
    expect(sub.nextElementSibling).toBeNull();
  });

  it("a card keeps its byline as the last line, below the subtitle", () => {
    const { container } = render(<FileCard doc={doc(2)} locale="en" />);
    const sub = container.querySelector("p[class*='sub']");
    const by = container.querySelector("p[class*='by']");
    expect(sub.compareDocumentPosition(by)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
    expect(container.querySelector("div[class*='meta']")).not.toHaveTextContent(
      "By"
    );
  });
});

describe("FileCard text polish", () => {
  it("keeps a spaced dash in the subtitle attached to the word before it", () => {
    const d = doc(2, { subtitle: { en: "my week — showed why", es: "x" } });
    const { rerender } = render(<FileCard doc={d} locale="en" />);
    expect(screen.getByText(/showed why/).textContent).toBe(
      "my week\u00A0\u2014 showed why"
    );
    rerender(<FileCard doc={d} locale="en" variant="lead" />);
    expect(screen.getByText(/showed why/).textContent).toBe(
      "my week\u00A0\u2014 showed why"
    );
  });

  it("balances card titles and sizes the phone lead title at 34px", () => {
    const css = readFileSync("components/FileCard.module.css", "utf8");
    const title = css.match(/\n\.title \{[^}]*\}/)[0];
    expect(title).toMatch(/text-wrap: balance/);
    const phone = css.match(
      /@media \(max-width: 700px\) \{[\s\S]*?\.lead \.title \{([^}]*)\}/
    );
    expect(phone[1]).toMatch(/font-size: 34px/);
  });
});

describe("FileMagazine", () => {
  it("splits the newest file into a lead and the rest into a card grid", () => {
    const docs = [doc(4), doc(3), doc(2), doc(1)];
    const { container } = render(<FileMagazine docs={docs} locale="en" />);
    const imgs = container.querySelectorAll("img");
    expect(imgs).toHaveLength(4);
    expect(imgs[0].dataset.priority).toBe("true");
    for (const img of [...imgs].slice(1)) {
      expect(img.dataset.priority).toBe("false");
    }
    const grid = container.querySelector("[data-file-grid]");
    expect(grid.querySelectorAll("article")).toHaveLength(3);
    expect(within(grid).queryByText("Title 4")).toBeNull();
    expect(screen.getByText("Title 4")).toBeInTheDocument();
  });

  it("shows only the lead, with no empty grid, for a single file", () => {
    const { container } = render(<FileMagazine docs={[doc(1)]} locale="en" />);
    expect(container.querySelectorAll("article")).toHaveLength(1);
    expect(container.querySelector("[data-file-grid]")).toBeNull();
  });

  it("renders nothing for no files", () => {
    const { container } = render(<FileMagazine docs={[]} locale="en" />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("RecentFiles", () => {
  it("renders three cards with images and subtitles, then the archive link", () => {
    const { container } = render(
      <RecentFiles docs={[doc(3), doc(2), doc(1)]} locale="en" />
    );
    expect(container.querySelectorAll("article")).toHaveLength(3);
    expect(container.querySelectorAll("img")).toHaveLength(3);
    for (const img of container.querySelectorAll("img")) {
      expect(img.dataset.priority).toBe("false");
    }
    expect(screen.getByText("Subtitle 2")).toBeInTheDocument();
    expect(screen.getByText(/See the full archive/)).toBeInTheDocument();
    for (const img of container.querySelectorAll("img")) {
      expect(img.getAttribute("sizes")).toBe(
        "(max-width: 1023px) 100vw, 360px"
      );
    }
  });
});

describe("series indexes use the lead + grid layout", () => {
  it("Off the Rails: first issue is the lead, the rest are in the grid", () => {
    const { container } = render(
      <OffTheRailsIndex issues={[doc(3), doc(2), doc(1)]} locale="en" />
    );
    expect(container.querySelectorAll("article")).toHaveLength(3);
    expect(container.querySelectorAll("[data-file-grid] article")).toHaveLength(
      2
    );
  });

  it("Practical with one file shows only the lead", () => {
    const { container } = render(
      <SeriesIndex
        series="practical"
        locale="en"
        docs={[{ ...doc(1), _type: undefined, practicalNumber: 1 }]}
      />
    );
    expect(container.querySelectorAll("article")).toHaveLength(1);
    expect(container.querySelector("[data-file-grid]")).toBeNull();
    expect(screen.getByText("FIX-001")).toBeInTheDocument();
  });
});
