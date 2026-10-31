// ABOUTME: Tests lib/safeHref.js and that every outbound link built from Sanity data goes through it.
// ABOUTME: Covers scheme tricks, relative handling, rendered links in all four link surfaces, and a source scan of components/ and lib/.

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PortableText } from "@portabletext/react";
import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";
vi.mock("next/image", () => ({
  default: ({ src, alt, priority, ...props }) => (
    <img src={src} alt={alt} {...props} />
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

import { safeExternalHref } from "@/lib/safeHref";
import { portableTextComponents } from "@/lib/portableText";
import ArticleBody from "@/components/ArticleBody";
import StackTrace from "@/components/StackTrace";
import CaseCard from "@/components/CaseCard";

describe("safeExternalHref", () => {
  it.each([
    "https://example.com/a?b=1#c",
    "http://example.com",
    "mailto:a@b.co",
    "HTTPS://EXAMPLE.COM",
  ])("allows %s", (url) => {
    expect(safeExternalHref(url)).toBe(url);
  });

  it("trims surrounding whitespace", () => {
    expect(safeExternalHref("  https://example.com/x \n")).toBe(
      "https://example.com/x"
    );
  });

  it.each([
    "javascript:alert(1)",
    "JavaScript:alert(1)",
    "  javascript:alert(1)",
    "\u0001javascript:alert(1)",
    "java\tscript:alert(1)",
    "java\nscript:alert(1)",
    "java\rscript:alert(1)",
    "\u0000javascript:alert(1)",
    "jav&#x61;script:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "DATA:text/html;base64,AAAA",
    "vbscript:msgbox(1)",
    "file:///etc/passwd",
    "blob:https://x/abc",
    "ftp://example.com",
    "tel:+15555555555",
    "//evil.example/x",
    "/\\evil.example",
    "/relative/path",
    "#frag",
    "",
    "   ",
    "https://exa\u0000mple.com",
    "\u0001https://example.com",
  ])("rejects %j", (url) => {
    expect(safeExternalHref(url)).toBeNull();
  });

  it("rejects non-strings", () => {
    for (const v of [undefined, null, 5, {}, ["https://x.com"]])
      expect(safeExternalHref(v)).toBeNull();
  });

  describe("with allowRelative (internal links keep working)", () => {
    const opts = { allowRelative: true };
    it.each(["/en/issue/otr-001", "#case-file-01", "?q=1", "/"])(
      "allows %s",
      (url) => {
        expect(safeExternalHref(url, opts)).toBe(url);
      }
    );
    it.each([
      "//evil.example",
      "/\\evil.example",
      "/\t/evil.example",
      "/\n/evil.example",
      "javascript:alert(1)",
      "relative-without-slash",
      "",
    ])("still rejects %j", (url) => {
      expect(safeExternalHref(url, opts)).toBeNull();
    });
  });
});

const BAD = "javascript:alert(1)";
const block = (children, markDefs = []) => ({
  _type: "block",
  _key: "b1",
  style: "normal",
  markDefs,
  children,
});
const linked = (href) =>
  block(
    [{ _type: "span", _key: "s1", text: "click me", marks: ["l1"] }],
    [{ _type: "link", _key: "l1", href }]
  );

describe("rendered link surfaces drop unsafe hrefs and keep the text", () => {
  it("lib/portableText link mark", () => {
    render(
      <PortableText value={[linked(BAD)]} components={portableTextComponents} />
    );
    expect(screen.getByText("click me").closest("a")).toBeNull();
  });
  it("lib/portableText keeps a safe link", () => {
    render(
      <PortableText
        value={[linked("https://example.com/p")]}
        components={portableTextComponents}
      />
    );
    expect(screen.getByText("click me").closest("a")).toHaveAttribute(
      "href",
      "https://example.com/p"
    );
  });
  it("lib/portableText keeps an internal link", () => {
    render(
      <PortableText
        value={[linked("/en/about")]}
        components={portableTextComponents}
      />
    );
    expect(screen.getByText("click me").closest("a")).toHaveAttribute(
      "href",
      "/en/about"
    );
  });
  it("ArticleBody link mark", () => {
    render(<ArticleBody blocks={[linked(BAD)]} locale="en" />);
    expect(screen.getByText("click me").closest("a")).toBeNull();
  });
  it("ArticleBody replyAsk button", () => {
    render(
      <ArticleBody
        blocks={[
          {
            _type: "replyAsk",
            _key: "r1",
            title: "Reply",
            buttonLabel: "Go",
            buttonUrl: BAD,
          },
        ]}
        locale="en"
      />
    );
    expect(screen.queryByRole("link", { name: "Go" })).toBeNull();
  });
  it("StackTrace source link", () => {
    const items = [
      {
        body: [block([{ _type: "span", _key: "x", text: "hit" }])],
        sources: [{ url: BAD, outlet: "Outlet X" }],
      },
    ];
    render(<StackTrace items={items} locale="en" />);
    expect(screen.getByText("Outlet X").closest("a")).toBeNull();
  });
  it("CaseCard source link", () => {
    const story = {
      _id: "s1",
      headline: { en: "Headline" },
      sources: [{ url: BAD, outlet: "Outlet Y" }],
      body: { en: [block([{ _type: "span", _key: "x", text: "body" }])] },
    };
    const { container } = render(
      <CaseCard story={story} index={0} locale="en" />
    );
    expect(container.querySelector('a[href^="javascript"]')).toBeNull();
  });
});

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });

describe("every href built from Sanity data goes through safeExternalHref", () => {
  const files = [...walk("components"), ...walk("lib")].filter((f) =>
    /\.js$/.test(f)
  );
  // The expression forms that never carry Sanity data: internal templates,
  // fixed constants, the file-link helper and the locale switcher.
  const FIXED = [
    /^`[/#]/,
    /^`mailto:/,
    /^`\$\{pathForLocale\(/,
    /^[A-Z][A-Z0-9_]+$/,
    /^fileHref\(/,
    /^tiktokUrl$/, // Footer prop, defaults to a constant
    /^m\[3\]$/, // AboutSections: the repo copy file, not Sanity
    /^href$/, // checked below: must be assigned through the helper
    /^external \? withRef\(href\) : href$/, // same `href`, plus the ref param
  ];
  const exprs = files.flatMap((f) =>
    readFileSync(f, "utf-8")
      .split("\n")
      .flatMap((line) => {
        const out = [];
        for (const m of line.matchAll(/\bhref=\{(.*?)\}(?=\s|>|$)/g))
          out.push({ file: f, expr: m[1] });
        return out;
      })
  );

  it("finds the href expressions (scan is not vacuous)", () => {
    expect(exprs.length).toBeGreaterThan(30);
  });

  it("every href expression is a fixed form or the sanitised `href` variable", () => {
    const loose = exprs.filter(
      ({ expr }) => !FIXED.some((re) => re.test(expr.trim()))
    );
    expect(loose).toEqual([]);
  });

  it("a file using href={href} assigns it only through safeExternalHref/safeButtonHref", () => {
    const users = [
      ...new Set(exprs.filter((e) => e.expr === "href").map((e) => e.file)),
    ];
    expect(users.length).toBeGreaterThanOrEqual(4);
    for (const f of users) {
      const src = readFileSync(f, "utf-8");
      const assigns = [...src.matchAll(/const href = ([^;]*);/g)].map(
        (m) => m[1]
      );
      expect(assigns.length).toBeGreaterThan(0);
      for (const a of assigns)
        expect(a).toMatch(/safeExternalHref\(|safeButtonHref\(/);
    }
  });

  it("withRef is never applied to a raw Sanity url", () => {
    for (const f of files) {
      const src = readFileSync(f, "utf-8");
      if (f.endsWith("lib/series.js")) continue;
      for (const m of src.matchAll(/withRef\(([^)]*)\)/g)) {
        expect(m[1]).toMatch(/safeExternalHref|^href$|^trimmed$/);
      }
    }
  });
});
