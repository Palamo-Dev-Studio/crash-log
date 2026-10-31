// ABOUTME: Locks the user-facing wording of the "matched in" line and the beats index copy.
// ABOUTME: The Practical series is called "practical", never "file", in English labels.

import { describe, it, expect } from "vitest";
import { matchedInLabel } from "@/lib/matchedInLabel";
import { BEAT_LABELS } from "@/lib/beatLabels";

describe("matchedInLabel wording", () => {
  it("calls a Practical body match 'practical body' in English", () => {
    expect(matchedInLabel(["practicalBody"], "en")).toBe(
      "matched in: practical body"
    );
  });

  it("keeps the Spanish 'cuerpo de …' form for a Practical body match", () => {
    expect(matchedInLabel(["practicalBody"], "es")).toBe(
      "coincide en: cuerpo del expediente"
    );
  });
});

describe("beats index copy", () => {
  it("uses 'despliegues fallidos', not 'despliegues rotos', in Spanish", () => {
    const text = JSON.stringify(BEAT_LABELS.es);
    expect(text).toContain("despliegues fallidos");
    expect(text).not.toContain("despliegues rotos");
  });
});
