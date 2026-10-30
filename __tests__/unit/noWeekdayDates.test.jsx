// ABOUTME: Property tests for Hector's rule that displayed dates never carry a weekday.
// ABOUTME: Weekday names come from Intl (not typed); checks rendered cards for 7 days x en/es. Source-level enforcement is the ESLint rule.

import { describe, it, expect, vi } from "vitest";
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
import HomeCover from "@/components/HomeCover";
import RecentFiles from "@/components/RecentFiles";

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

describe("displayed dates never carry a weekday", () => {
  it("the generated weekday list is non-trivial", () => {
    expect(weekdayNames().length).toBeGreaterThan(10);
  });

  for (const [name, renderCard] of Object.entries(RENDERERS)) {
    for (const locale of ["en", "es"]) {
      it(`${name} (${locale}) for all 7 days of a week`, () => {
        for (const date of WEEK) {
          const { container, unmount } = render(renderCard(date, locale));
          // A date really rendered (guards against a vacuous pass).
          expect(container.textContent).toMatch(/2026/);
          expectNoWeekday(container.textContent);
          unmount();
        }
      });
    }
  }
});
