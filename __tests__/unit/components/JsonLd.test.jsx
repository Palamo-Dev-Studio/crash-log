// ABOUTME: Tests components/JsonLd.js serialisation and that every JSON-LD script in app/ goes through it.
// ABOUTME: Also pins getJsonLdAuthor: Person for named bylines, Organization for the newsroom sentinel.

import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";
import JsonLd, { serializeJsonLd } from "@/components/JsonLd";
import { getJsonLdAuthor } from "@/lib/series";

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });

describe("serializeJsonLd", () => {
  const evil = "</script><script>alert(1)</script> & <b>x</b>";

  it("escapes <, >, & and the JS line separators", () => {
    const out = serializeJsonLd({ a: `${evil}\u2028\u2029` });
    expect(out).not.toMatch(/[<>&\u2028\u2029]/);
    expect(out).toContain("\\u003c");
    expect(out).toContain("\\u003e");
    expect(out).toContain("\\u0026");
    expect(out).toContain("\\u2028");
    expect(out).toContain("\\u2029");
  });

  it("round-trips: JSON.parse of the output equals the input", () => {
    const data = { "@type": "Article", headline: evil, n: [1, { x: "<" }] };
    expect(JSON.parse(serializeJsonLd(data))).toEqual(data);
  });

  it("a hostile title cannot close the script element", () => {
    const { container } = render(
      <JsonLd data={{ headline: "</script><script>alert(1)</script>" }} />
    );
    const scripts = container.querySelectorAll("script");
    expect(scripts).toHaveLength(1);
    expect(scripts[0].getAttribute("type")).toBe("application/ld+json");
    expect(JSON.parse(scripts[0].textContent).headline).toBe(
      "</script><script>alert(1)</script>"
    );
    expect(container.innerHTML.match(/<\/script>/g)).toHaveLength(1);
  });
});

describe("every JSON-LD script in app/ goes through JsonLd", () => {
  const files = walk("app").filter((f) => /\.(js|jsx)$/.test(f));

  it("no file under app/ writes application/ld+json or raw inner HTML itself", () => {
    const offenders = files.filter((f) => {
      const src = readFileSync(f, "utf-8");
      return (
        src.includes("application/ld+json") ||
        src.includes("dangerouslySetInnerHTML")
      );
    });
    expect(offenders).toEqual([]);
  });

  it("the pages that emit structured data import the shared component", () => {
    const users = files.filter((f) =>
      readFileSync(f, "utf-8").includes("<JsonLd")
    );
    expect(users.length).toBeGreaterThanOrEqual(5);
    for (const f of users) {
      expect(readFileSync(f, "utf-8")).toContain(
        'import JsonLd from "@/components/JsonLd"'
      );
    }
  });

  it("no page hardcodes an author name", () => {
    for (const f of files) {
      const src = readFileSync(f, "utf-8");
      if (!src.includes("NewsArticle") && !src.includes('"Article"')) continue;
      expect(src).toContain("getJsonLdAuthor(");
      expect(src).not.toMatch(/author:\s*\{[^}]*name:\s*"/);
    }
  });
});

describe("getJsonLdAuthor", () => {
  it("is a Person for a named byline", () => {
    expect(getJsonLdAuthor({ _type: "issue", byline: "Ada Lovelace" })).toEqual(
      {
        "@type": "Person",
        name: "Ada Lovelace",
      }
    );
  });
  it("defaults an issue to Hector and a column to Nico von Bot", () => {
    expect(getJsonLdAuthor({ _type: "issue" })).toMatchObject({
      "@type": "Person",
      name: "Hector Luis Alamo",
    });
    expect(getJsonLdAuthor({ _type: "column" })).toEqual({
      "@type": "Person",
      name: "Nico von Bot",
    });
  });
  it("is the Organization for the newsroom sentinel, in any case", () => {
    for (const byline of ["newsroom", " Newsroom "]) {
      expect(getJsonLdAuthor({ _type: "issue", byline })).toEqual({
        "@type": "Organization",
        name: "The Crash Log",
        url: "https://crashlog.ai",
      });
    }
  });
  it("is null for a doc outside the series", () => {
    expect(getJsonLdAuthor({ _type: "agent" })).toBeNull();
  });
});
