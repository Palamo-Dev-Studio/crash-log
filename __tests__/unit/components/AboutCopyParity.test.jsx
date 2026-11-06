// ABOUTME: Property tests tying the About fallback and the Sanity-driven page to the approved copy file.
// ABOUTME: Any drift in a paragraph or heading, or any structural gap between the two renderers, fails here.

import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import fs from "fs";
import path from "path";

vi.mock("next/image", () => ({
  default: ({ src, alt }) => <img src={src} alt={alt} />,
}));
vi.mock("@/lib/sanity", () => ({
  urlFor: () => ({
    width: () => ({ height: () => ({ url: () => "https://cdn.test/a.png" }) }),
  }),
}));

import { FallbackAbout, SanityAbout } from "@/components/AboutSections";
import { ABOUT_COPY } from "@/lib/aboutFallback";

const ROOT = process.cwd();
const COPY = fs.readFileSync(
  path.join(ROOT, "docs/plans/active/about-page-copy.md"),
  "utf8"
);
const PAYLOAD = JSON.parse(
  fs.readFileSync(
    path.join(ROOT, "docs/plans/active/about-page-sanity.json"),
    "utf8"
  )
);

// Approved copy for one locale: ordered list of { kind: "lead"|"heading"|"para", text }.
function approved(locale) {
  const section =
    locale === "en"
      ? COPY.split("## English")[1].split("## Español")[0]
      : COPY.split("## Español")[1];
  return section
    .trim()
    .split(/\n\s*\n/)
    .map((b) => b.replace(/\n/g, " ").trim())
    .map((b, i) => {
      if (b.startsWith("### ")) return { kind: "heading", text: b.slice(4) };
      return { kind: i === 0 ? "lead" : "para", text: b.replace(/\*\*/g, "") };
    });
}

const mastheadDocs = PAYLOAD.agents.map((a) => ({
  _id: a._id,
  name: a.name,
  role: a.role,
  agentType: a.name.startsWith("Hector") ? "human" : "lead_agent",
}));
const payloadAbout = {
  ...PAYLOAD.aboutPage,
  masthead: [...mastheadDocs].sort((a, b) => {
    const order = (x) =>
      PAYLOAD.agents.find((p) => p._id === x._id).displayOrder;
    return order(a) - order(b);
  }),
};

const headings = (container) =>
  [...container.querySelectorAll("h1, h2, h3")].map(
    (h) => `${h.tagName}:${h.textContent}`
  );

describe.each(["en", "es"])("About copy parity [%s]", (locale) => {
  it("fallback renders every approved heading and paragraph verbatim, in order", () => {
    const { container } = render(
      <FallbackAbout locale={locale} about={null} />
    );
    const text = container.textContent;
    let from = 0;
    const items = approved(locale);
    expect(items.length).toBeGreaterThan(15);
    for (const item of items) {
      const at = text.indexOf(item.text, from);
      expect(
        at,
        `missing or out of order: ${item.text}`
      ).toBeGreaterThanOrEqual(from);
      from = at + item.text.length;
    }
  });

  it("the Sanity payload renders the same visible text and headings as the fallback", () => {
    const fb = render(<FallbackAbout locale={locale} about={null} />);
    const fbText = fb.container.textContent;
    const fbHeadings = headings(fb.container);
    fb.unmount();
    const sn = render(<SanityAbout about={payloadAbout} locale={locale} />);
    expect(sn.container.textContent).toBe(fbText);
    expect(headings(sn.container)).toEqual(fbHeadings);
  });

  it("the Sanity payload also reproduces every approved paragraph in order", () => {
    const { container } = render(
      <SanityAbout about={payloadAbout} locale={locale} />
    );
    const text = container.textContent;
    let from = 0;
    for (const item of approved(locale)) {
      const at = text.indexOf(item.text, from);
      expect(
        at,
        `missing or out of order: ${item.text}`
      ).toBeGreaterThanOrEqual(from);
      from = at + item.text.length;
    }
  });
});

// The first element after a section's H2 (siblings, so prose wrappers count as content).
const afterHeading = (container, text) => {
  const h2 = [...container.querySelectorAll("h2")].find(
    (h) => h.textContent === text
  );
  expect(h2, `no H2 "${text}"`).toBeTruthy();
  return h2.nextElementSibling;
};

// The live Sanity content still opens the masthead section with "Two of us." until it is
// removed; the page must place the cards right after the H2 either way.
const withIntroLine = (about, locale) => {
  const line = {
    _type: "block",
    _key: `${locale}-workflow-intro-line`,
    style: "normal",
    markDefs: [],
    children: [
      {
        _type: "span",
        _key: `${locale}-workflow-intro-line-s`,
        text: locale === "en" ? "Two of us." : "Somos dos.",
        marks: [],
      },
    ],
  };
  const blocks = [...about.workflowSection[locale]];
  blocks.splice(1, 0, line);
  return {
    ...about,
    workflowSection: { ...about.workflowSection, [locale]: blocks },
  };
};

describe.each(["en", "es"])("About page order [%s]", (locale) => {
  const copy = ABOUT_COPY[locale];
  const renders = {
    fallback: () => render(<FallbackAbout locale={locale} about={null} />),
    sanity: () => render(<SanityAbout about={payloadAbout} locale={locale} />),
    "sanity before the intro line is removed": () =>
      render(
        <SanityAbout
          about={withIntroLine(payloadAbout, locale)}
          locale={locale}
        />
      ),
  };

  describe.each(Object.keys(renders))("%s", (name) => {
    it("opens the masthead section with the cards", () => {
      const { container } = renders[name]();
      expect(
        afterHeading(container, copy.whoHeading).getAttribute("data-testid")
      ).toBe("masthead");
    });

    it("opens the better section with the loop graphic", () => {
      const { container } = renders[name]();
      expect(
        afterHeading(container, copy.betterHeading).getAttribute("data-testid")
      ).toBe("self-improvement-loop");
    });
  });

  it.each(["fallback", "sanity"])("shows no 'Two of us.' line [%s]", (name) => {
    const { container } = renders[name]();
    expect(container.textContent).not.toMatch(/Two of us\.|Somos dos\./);
  });
});

describe("About Sanity payload", () => {
  it("orders Hector before Nico", () => {
    const byName = Object.fromEntries(
      PAYLOAD.agents.map((a) => [a.name, a.displayOrder])
    );
    expect(byName["Hector Luis Alamo"]).toBeLessThan(byName["Nico von Bot"]);
  });

  it("types every agent role as a localizedString, matching the stored values", () => {
    for (const agent of PAYLOAD.agents) {
      expect(agent.role._type, agent.name).toBe("localizedString");
      expect(typeof agent.role.en).toBe("string");
      expect(typeof agent.role.es).toBe("string");
    }
  });

  it("gives every block a unique _key", () => {
    const keys = [];
    for (const f of ["introParagraph", "workflowSection", "contactCTA"])
      for (const loc of ["en", "es"])
        for (const b of PAYLOAD.aboutPage[f][loc]) {
          keys.push(b._key, ...b.children.map((c) => c._key));
        }
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe("SanityAbout structure", () => {
  it("falls back to the plain page title for intro content without section headings", () => {
    const about = {
      introParagraph: {
        en: [
          {
            _type: "block",
            _key: "a",
            style: "normal",
            markDefs: [],
            children: [
              { _type: "span", _key: "b", text: "Old intro.", marks: [] },
            ],
          },
        ],
      },
      masthead: [],
    };
    const { container } = render(<SanityAbout about={about} locale="en" />);
    expect(container.querySelector("h1").textContent).toBe("About");
    expect(container.textContent).toContain("Old intro.");
  });
});
