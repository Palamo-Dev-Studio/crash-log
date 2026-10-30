// ABOUTME: Property tests for Hector's rule that displayed dates never carry a weekday.
// ABOUTME: Weekday names come from Intl (not typed); checks rendered cards for 7 days x en/es plus a source scan of every date-format call.

import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import fs from "node:fs";
import path from "node:path";

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
import FeedCard from "@/components/FeedCard";

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Every weekday name Intl knows for en and es, long and short, generated.
function weekdayNames() {
  const names = new Set();
  for (const locale of ["en", "es"]) {
    for (const weekday of ["long", "short"]) {
      const fmt = new Intl.DateTimeFormat(locale, { weekday, timeZone: "UTC" });
      for (let d = 1; d <= 7; d++) {
        names.add(
          fmt.format(new Date(Date.UTC(2026, 0, d))).replace(/\.$/, "")
        );
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
  FeedCard: (date, locale) => (
    <FeedCard
      locale={locale}
      item={{
        _type: "issue",
        slug: "s",
        number: 1,
        title: { en: "T", es: "T" },
        publishDate: date,
      }}
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

  // Covers every date helper, including the ones whose components need heavy
  // fixtures (IssueContent, ColumnContent, the OG image).
  it("no date-format call in app/, components/ or lib/ asks for a weekday", () => {
    const roots = ["app", "components", "lib"].map((r) =>
      path.join(process.cwd(), r)
    );
    const files = [];
    const walk = (dir) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (/\.(js|jsx|mjs)$/.test(entry.name)) files.push(full);
      }
    };
    roots.forEach(walk);

    const callRe =
      /(toLocale(Date|Time)?String|DateTimeFormat)\s*\(([\s\S]*?)\)\s*;?/g;
    let calls = 0;
    for (const file of files) {
      const src = fs.readFileSync(file, "utf8");
      for (const m of src.matchAll(callRe)) {
        calls += 1;
        const args = m[3];
        expect(args, `${file}`).not.toMatch(/weekday/);
        expect(args, `${file}`).not.toMatch(/dateStyle\s*:\s*["']full["']/);
      }
    }
    expect(calls).toBeGreaterThanOrEqual(7);
  });
});
