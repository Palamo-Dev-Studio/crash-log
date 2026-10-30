// ABOUTME: Property tests for Hector's rule that displayed dates never carry a weekday.
// ABOUTME: Weekday names come from Intl (not typed); checks rendered cards for 7 days x en/es. Source-level enforcement is the ESLint rule.

import { describe, it, expect, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { render } from "@testing-library/react";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));
vi.mock("next/image", () => ({
  default: ({ src, alt }) => <img src={src} alt={alt} />,
}));
vi.mock("next/navigation", () => import("../mocks/next-navigation"));
vi.mock("@portabletext/react", () => ({ PortableText: () => null }));
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

import ArchiveCard from "@/components/ArchiveCard";
import ColumnCard from "@/components/ColumnCard";
import BeatStoryCard from "@/components/BeatStoryCard";
import { formatDate } from "@/lib/formatDate";
import HomeCover from "@/components/HomeCover";
import HomeRail from "@/components/HomeRail";
import IssueContent from "@/components/IssueContent";
import ColumnContent from "@/components/ColumnContent";
import RecentFiles from "@/components/RecentFiles";
import FileRow from "@/components/FileRow";

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Every long weekday name Intl knows for en and es, generated (short es names collide with month abbreviations).
function weekdayNames() {
  const names = new Set();
  for (const locale of ["en", "es"]) {
    for (const weekday of ["long"]) {
      const fmt = new Intl.DateTimeFormat(locale, { weekday, timeZone: "UTC" });
      for (let d = 1; d <= 7; d++) {
        names.add(fmt.format(new Date(Date.UTC(2026, 0, d))));
      }
    }
  }
  return [...names];
}

function expectNoWeekday(text) {
  for (const name of weekdayNames()) {
    expect(text, `weekday "${name}"`).not.toMatch(
      new RegExp(`(?<![\\p{L}])${escapeRe(name)}(?![\\p{L}])`, "iu")
    );
  }
}

// 2026-01-04 is a Sunday; walk a full week.
const WEEK = Array.from(
  { length: 7 },
  (_, i) => `2026-01-${String(4 + i).padStart(2, "0")}`
);

const RENDERERS = {
  ArchiveCard: (date, locale) => (
    <ArchiveCard
      issueNumber={1}
      date={date}
      title="T"
      slug="s"
      locale={locale}
    />
  ),
  ColumnCard: (date, locale) => (
    <ColumnCard
      columnNumber={1}
      date={date}
      title="T"
      slug="s"
      locale={locale}
    />
  ),
  BeatStoryCard: (date, locale) => (
    <BeatStoryCard
      severity="x"
      headline="H"
      issueMeta={{ slug: "s", number: 1, date }}
      locale={locale}
    />
  ),
  HomeCover: (date, locale) => (
    <HomeCover
      locale={locale}
      doc={{
        _type: "issue",
        slug: "s",
        issueNumber: 1,
        title: { en: "T", es: "T" },
        publishDate: date,
      }}
    />
  ),
  HomeRail: (date, locale) => (
    <HomeRail
      locale={locale}
      rail={[
        {
          series: "offTheRails",
          onCover: false,
          doc: {
            _id: "i",
            _type: "issue",
            slug: "s",
            issueNumber: 1,
            title: { en: "T", es: "T" },
            publishDate: date,
          },
        },
      ]}
    />
  ),
  IssueContent: (date, locale) => (
    <IssueContent
      locale={locale}
      issue={{
        _id: "i",
        issueNumber: 1,
        slug: "s",
        title: { en: "T", es: "T" },
        publishDate: date,
      }}
    />
  ),
  ColumnContent: (date, locale) => (
    <ColumnContent
      locale={locale}
      column={{
        columnNumber: 1,
        slug: "s",
        title: { en: "T", es: "T" },
        publishDate: date,
      }}
    />
  ),
  FileRow: (date, locale) => (
    <FileRow
      locale={locale}
      doc={{
        _id: "i",
        _type: "issue",
        slug: "s",
        issueNumber: 1,
        title: { en: "T", es: "T" },
        publishDate: date,
      }}
    />
  ),
  RecentFiles: (date, locale) => (
    <RecentFiles
      locale={locale}
      docs={[
        {
          _id: "i",
          _type: "issue",
          slug: "s",
          issueNumber: 1,
          title: { en: "T", es: "T" },
          publishDate: date,
        },
      ]}
    />
  ),
};

// Components that render the year-less dayMonth style.
const YEARLESS = new Set(["HomeRail"]);

describe("displayed dates never carry a weekday", () => {
  it("every component that calls formatDate has a renderer here", () => {
    const dir = path.resolve(import.meta.dirname, "../../components");
    const callers = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".js"))
      .filter((f) =>
        fs.readFileSync(path.join(dir, f), "utf8").includes("formatDate(")
      )
      .map((f) => f.replace(/\.js$/, ""));
    expect(callers.length).toBeGreaterThan(0);
    expect(Object.keys(RENDERERS)).toEqual(expect.arrayContaining(callers));
  });

  it("the generated weekday list is non-trivial", () => {
    expect(weekdayNames().length).toBeGreaterThan(10);
  });

  for (const [name, renderCard] of Object.entries(RENDERERS)) {
    for (const locale of ["en", "es"]) {
      it(`${name} (${locale}) for all 7 days of a week`, () => {
        for (const date of WEEK) {
          const { container, unmount } = render(renderCard(date, locale));
          // A date really rendered (guards against a vacuous pass).
          if (YEARLESS.has(name)) {
            expect(container.textContent).toContain(
              formatDate(date, locale, "dayMonth")
            );
          } else {
            expect(container.textContent).toMatch(/2026/);
          }
          expectNoWeekday(container.textContent);
          unmount();
        }
      });
    }
  }
});
