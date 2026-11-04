// ABOUTME: Component tests for the magazine layout: FileCard (lead and card), FileMagazine's lead + grid split, FileCardGrid and RecentFiles' three cards.
// ABOUTME: Covers image alt, chip, date, title, subtitle, byline, one link named by the title, eager lead image, locale fallback and the single-item case.

import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));
vi.mock("next/image", () => ({
  default: ({ src, alt, priority, sizes, width, height, className }) => (
    <img
      src={src}
      alt={alt}
      sizes={sizes}
      width={width}
      height={height}
      className={className}
      data-priority={priority ? "true" : "false"}
    />
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
    rerender(<FileCard doc={doc(1)} locale="en" variant="lead" priority />);
    const lead = container.querySelector("img");
    expect(lead.getAttribute("sizes")).toMatch(/680px/);
    expect(lead.dataset.priority).toBe("true");
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
