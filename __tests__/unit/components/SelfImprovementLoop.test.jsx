// ABOUTME: Unit tests for the About page loop graphic: five ordered steps per locale, both About render paths, one-shot play on entering view.
// ABOUTME: IntersectionObserver is stubbed; jsdom has none, which doubles as the no-observer (final state) case.

import { describe, it, expect, vi, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen, within } from "@testing-library/react";

vi.mock("next/image", () => ({
  default: ({ src, alt }) => <img src={src} alt={alt} />,
}));
vi.mock("@/lib/sanity", () => ({
  urlFor: () => ({
    width: () => ({ height: () => ({ url: () => "https://cdn.test/a.png" }) }),
  }),
}));

import SelfImprovementLoop from "@/components/SelfImprovementLoop";
import { FallbackAbout, SanityAbout } from "@/components/AboutSections";
import { LOOP_COPY } from "@/lib/aboutLoop";
import { FALLBACK_MASTHEAD } from "@/lib/aboutFallback";

const LOOP_CSS = readFileSync(
  join(process.cwd(), "components/SelfImprovementLoop.module.css"),
  "utf8"
);
// The declarations of the first rule whose selector list contains `selector` exactly.
const rule = (css, selector) => {
  for (const m of css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selectors = m[1].split(",").map((x) => x.trim());
    if (selectors.includes(selector)) return m[2];
  }
  return null;
};

const STEPS = {
  en: [
    "Nico drafts",
    "Hector edits and publishes",
    "A weekly script logs every change",
    "Three repeats make a rule",
    "Nico reads the rules before writing",
  ],
  es: [
    "Nico escribe el borrador",
    "Hector edita y publica",
    "Un script semanal registra cada cambio",
    "A la tercera, se vuelve regla",
    "Nico lee las reglas antes de escribir",
  ],
};

const stepTexts = (root = document) =>
  within(root)
    .getAllByRole("listitem")
    .map((li) => li.textContent);

const block = (text, style = "normal") => ({
  _type: "block",
  _key: text,
  style,
  markDefs: [],
  children: [{ _type: "span", _key: `${text}-s`, text, marks: [] }],
});

describe("SelfImprovementLoop", () => {
  it.each(["en", "es"])("lists the five steps in order [%s]", (locale) => {
    render(<SelfImprovementLoop locale={locale} />);
    expect(stepTexts()).toEqual(STEPS[locale]);
    expect(LOOP_COPY[locale].steps).toEqual(STEPS[locale]);
  });

  it.each([
    ["en", "RULE"],
    ["es", "REGLA"],
  ])("carries the stamp word in the locale's language [%s]", (locale, word) => {
    render(<SelfImprovementLoop locale={locale} />);
    expect(screen.getByTestId("loop-stamp")).toHaveTextContent(word);
  });

  it("rests on three ticks crossed by one stamp that sits beside step 4, not at the ring centre", () => {
    const { container } = render(<SelfImprovementLoop locale="en" />);
    const svg = container.querySelector("svg");
    const ticks = [...svg.querySelectorAll("line")];
    expect(ticks).toHaveLength(3);
    const stamp = screen.getByTestId("loop-stamp").querySelector("rect");
    const sx = +stamp.getAttribute("x") + +stamp.getAttribute("width") / 2;
    const sy = +stamp.getAttribute("y") + +stamp.getAttribute("height") / 2;
    expect(
      Math.hypot(sx - 150, sy - 150),
      "stamp off the ring centre"
    ).toBeGreaterThan(40);
    // Each tick runs past both the top and the bottom edge of the stamp.
    const top = +stamp.getAttribute("y");
    const bottom = top + +stamp.getAttribute("height");
    for (const t of ticks) {
      expect(Math.min(t.getAttribute("y1"), t.getAttribute("y2"))).toBeLessThan(
        top
      );
      expect(
        Math.max(t.getAttribute("y1"), t.getAttribute("y2"))
      ).toBeGreaterThan(bottom);
    }
  });

  it("draws the stamp as a tilted outline, not a filled chip", () => {
    const box = rule(LOOP_CSS, ".stamp rect");
    expect(box).toMatch(/fill:\s*var\(--card\)/);
    expect(box).toMatch(/stroke:\s*var\(--terra-ink\)/);
    expect(box).not.toMatch(/fill:\s*var\(--terra/);
    expect(rule(LOOP_CSS, ".stamp text")).toMatch(/fill:\s*var\(--terra-ink\)/);
    expect(rule(LOOP_CSS, ".stamp")).toMatch(/rotate\(-6deg\)/);
  });

  it("makes step 1 a solid disc so it reads as settled", () => {
    expect(rule(LOOP_CSS, '.node[data-step="1"] .disc')).toMatch(
      /fill:\s*var\(--ink\)/
    );
  });

  it("parks pseudo-element animations along with the rest while ready", () => {
    for (const sel of [
      '.loop[data-motion="ready"] *',
      '.loop[data-motion="ready"] *::before',
      '.loop[data-motion="ready"] *::after',
    ]) {
      expect(rule(LOOP_CSS, sel), sel).toMatch(
        /animation-play-state:\s*paused/
      );
    }
  });

  it("shows the final state in print", () => {
    const print = LOOP_CSS.match(/@media[^{]*print[^{]*\{([\s\S]*?)\n\}/);
    expect(print).not.toBeNull();
    expect(print[1]).toMatch(/animation:\s*none\s*!important/);
  });

  it("keeps list semantics explicit for VoiceOver", () => {
    render(<SelfImprovementLoop locale="en" />);
    expect(screen.getByRole("list")).toHaveAttribute("role", "list");
  });

  it("keeps the ring and tally in aria-hidden SVG", () => {
    const { container } = render(<SelfImprovementLoop locale="en" />);
    expect(container.querySelector("svg")).toHaveAttribute(
      "aria-hidden",
      "true"
    );
  });

  it("shows the final state with no motion attribute when nothing observes", () => {
    render(<SelfImprovementLoop locale="en" />);
    expect(screen.getByTestId("self-improvement-loop").dataset.motion).toBe(
      undefined
    );
  });
});

describe("SelfImprovementLoop motion trigger", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function stubObserver({ reduced = false } = {}) {
    const instances = [];
    class FakeObserver {
      constructor(cb) {
        this.cb = cb;
        this.disconnect = vi.fn();
        this.observe = vi.fn();
        instances.push(this);
      }
    }
    vi.stubGlobal("IntersectionObserver", FakeObserver);
    vi.stubGlobal("matchMedia", (q) => ({
      matches: reduced && q.includes("reduce"),
    }));
    return instances;
  }

  it("parks at the first frame, plays once on entering view, then disconnects", () => {
    const instances = stubObserver();
    render(<SelfImprovementLoop locale="en" />);
    const el = screen.getByTestId("self-improvement-loop");
    expect(el.dataset.motion).toBe("ready");
    const [obs] = instances;
    obs.cb([{ isIntersecting: false }]);
    expect(el.dataset.motion).toBe("ready");
    obs.cb([{ isIntersecting: true }]);
    expect(el.dataset.motion).toBe("play");
    expect(obs.disconnect).toHaveBeenCalled();
  });

  it("triggers on a small visible share so tall or zoomed graphics still play", () => {
    const seen = [];
    class Spy {
      constructor(cb, options) {
        seen.push(options);
        this.observe = vi.fn();
        this.disconnect = vi.fn();
      }
    }
    vi.stubGlobal("IntersectionObserver", Spy);
    vi.stubGlobal("matchMedia", () => ({ matches: false }));
    render(<SelfImprovementLoop locale="en" />);
    expect(seen[0].threshold).toBeLessThanOrEqual(0.2);
  });

  it("never starts the motion under prefers-reduced-motion", () => {
    const instances = stubObserver({ reduced: true });
    render(<SelfImprovementLoop locale="en" />);
    expect(screen.getByTestId("self-improvement-loop").dataset.motion).toBe(
      undefined
    );
    expect(instances).toHaveLength(0);
  });
});

describe("loop graphic in both About render paths", () => {
  it.each(["en", "es"])("fallback path renders it [%s]", (locale) => {
    render(<FallbackAbout locale={locale} about={null} />);
    expect(stepTexts(screen.getByTestId("self-improvement-loop"))).toEqual(
      STEPS[locale]
    );
  });

  it.each([
    ["en", "How it gets better"],
    ["es", "Cómo mejora"],
  ])("Sanity path renders it under the matching H2 [%s]", (locale, heading) => {
    const about = {
      introParagraph: {
        [locale]: [
          block("Lead"),
          block("What we publish", "h2"),
          block("Body"),
          block(heading, "h2"),
          block("Prose"),
        ],
      },
      masthead: [],
    };
    render(<SanityAbout about={about} locale={locale} />);
    expect(stepTexts(screen.getByTestId("self-improvement-loop"))).toEqual(
      STEPS[locale]
    );
  });

  it.each([
    ["en", "en-workflow-h1"],
    ["es", "es-workflow-h1"],
  ])(
    "Sanity path places it by the H2 block key even if the heading text changed [%s]",
    (locale, key) => {
      const renamed = { ...block("Some renamed heading", "h2"), _key: key };
      const about = {
        introParagraph: {
          [locale]: [block("Lead"), block("What we publish", "h2"), block("A")],
        },
        workflowSection: { [locale]: [renamed, block("Prose")] },
        masthead: [],
      };
      render(<SanityAbout about={about} locale={locale} />);
      expect(stepTexts(screen.getByTestId("self-improvement-loop"))).toEqual(
        STEPS[locale]
      );
    }
  );

  it("Sanity path places it on a Spanish page whose content fell back to the English key", () => {
    const about = {
      introParagraph: {
        es: [block("Lead"), block("Lo que publicamos", "h2"), block("A")],
      },
      workflowSection: {
        es: [
          { ...block("Titular cambiado", "h2"), _key: "en-workflow-h1" },
          block("Prose"),
        ],
      },
      masthead: [],
    };
    render(<SanityAbout about={about} locale="es" />);
    expect(stepTexts(screen.getByTestId("self-improvement-loop"))).toEqual(
      STEPS.es
    );
  });

  it("Sanity path keeps prose before the first heading in the text column", () => {
    const about = {
      introParagraph: {
        en: [
          block("Lead"),
          block("Before the first heading"),
          block("What we publish", "h2"),
          block("A"),
        ],
      },
      masthead: [],
    };
    render(<SanityAbout about={about} locale="en" />);
    const heading = screen.getByRole("heading", { name: "What we publish" });
    const pre = screen.getByText("Before the first heading");
    expect(pre.closest("section, div[class*='section']")).not.toBeNull();
    expect(pre.closest("[class*='section']").className).toBe(
      heading.closest("section").className
    );
  });

  it("ES fallback masthead role fits one line beside the photo", () => {
    const nico = FALLBACK_MASTHEAD.find((p) => p.name === "Nico von Bot");
    expect(nico.role.es).toBe("Reportero y columnista");
    expect(nico.role.en).toBe("AI reporter and columnist");
  });

  it("Sanity path does not place it under an unrelated heading with another key", () => {
    const other = { ...block("Some other heading", "h2"), _key: "x-h9" };
    const about = {
      introParagraph: {
        en: [block("Lead"), block("What we publish", "h2"), block("A")],
      },
      workflowSection: { en: [other, block("Prose")] },
      masthead: [],
    };
    render(<SanityAbout about={about} locale="en" />);
    expect(screen.queryByTestId("self-improvement-loop")).toBeNull();
  });

  it("Sanity path shows no graphic when the section is absent", () => {
    const about = {
      introParagraph: {
        en: [block("Lead"), block("What we publish", "h2"), block("Body")],
      },
      masthead: [],
    };
    render(<SanityAbout about={about} locale="en" />);
    expect(screen.queryByTestId("self-improvement-loop")).toBeNull();
  });
});
