// ABOUTME: Unit tests for scripts/backfill-newsroom-bylines.mjs pure helpers.
// ABOUTME: Pins the dry-run default, the patch shape and the published-only, #1-27 query.

import { describe, it, expect } from "vitest";
import {
  QUERY,
  buildPatches,
  parseArgs,
} from "../../scripts/backfill-newsroom-bylines.mjs";

describe("backfill-newsroom-bylines", () => {
  it("is a dry run unless --apply is passed", () => {
    expect(parseArgs([]).apply).toBe(false);
    expect(parseArgs(["--dry"]).apply).toBe(false);
    expect(parseArgs(["--apply"]).apply).toBe(true);
  });

  it('builds a set-byline "newsroom" patch per document', () => {
    expect(
      buildPatches([
        { _id: "issue-a", issueNumber: 3 },
        { _id: "issue-b", issueNumber: 9 },
      ])
    ).toEqual([
      { id: "issue-a", issueNumber: 3, patch: { set: { byline: "newsroom" } } },
      { id: "issue-b", issueNumber: 9, patch: { set: { byline: "newsroom" } } },
    ]);
  });

  it("returns no patches for no documents", () => {
    expect(buildPatches([])).toEqual([]);
  });

  it("queries published issues numbered up to the cap with no byline", () => {
    expect(QUERY).toContain('_type == "issue"');
    expect(QUERY).toContain('!(_id in path("drafts.**"))');
    expect(QUERY).toContain("issueNumber <= $max");
    expect(QUERY).toContain("!defined(byline)");
  });
});
