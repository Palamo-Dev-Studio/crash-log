// ABOUTME: Unit tests for the About page loop graphic: five ordered steps per locale, both About render paths, one-shot play on entering view.
// ABOUTME: IntersectionObserver is stubbed; jsdom has none, which doubles as the no-observer (final state) case.

import { describe, it, expect, vi, afterEach } from "vitest";
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
    "Tres repeticiones forman una regla",
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
