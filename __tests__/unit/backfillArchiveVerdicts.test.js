// ABOUTME: Unit tests for scripts/backfill-archive-verdicts.mjs validation, decision logic and write locking.
// ABOUTME: Pins dry-run default, --expect/draft/drift/missing guards, never-overwrite, _id matching and the real data file.

import { format } from "node:util";
import { describe, it, expect, vi } from "vitest";
import { readFileSync } from "fs";
import {
  QUERY,
  DRAFTS_QUERY,
  DATA_PATH,
  EXPECTED_ENTRIES,
  parseArgs,
  validateEntries,
  planBackfill,
  applyWrites,
  clientOptions,
  draftIdsFor,
  applySummary,
  formatError,
  run,
} from "../../scripts/backfill-archive-verdicts.mjs";

const entry = (n, extra = {}) => ({
  _id: `story-${n}`,
  issueNumber: n,
  headline: `Headline ${n}`,
  severity: "EXPLOIT",
  verdict: { en: `VERDICT ${n}`, es: `VEREDICTO ${n}` },
  ...extra,
});
const doc = (n, extra = {}) => ({
  _id: `story-${n}`,
  _rev: `rev-${n}`,
  headline: `Headline ${n}`,
  ...extra,
});
const entries = [entry(1), entry(2)];
const docs = [doc(1), doc(2)];
const APPLY = { apply: true, expect: 2 };

describe("parseArgs", () => {
  it("is a dry run unless --apply is passed", () => {
    expect(parseArgs([]).apply).toBe(false);
    expect(parseArgs(["--dry"]).apply).toBe(false);
    expect(parseArgs(["--apply"]).apply).toBe(true);
  });
  it("parses --expect, --allow-drafts and --allow-drift", () => {
    expect(parseArgs(["--expect=88"]).expect).toBe(88);
    expect(parseArgs([]).expect).toBeNull();
    expect(parseArgs(["--expect=abc"]).expect).toBeNull();
    expect(parseArgs(["--allow-drafts"]).allowDrafts).toBe(true);
    expect(parseArgs([]).allowDrafts).toBe(false);
    expect(parseArgs(["--allow-drift"]).allowDrift).toBe(true);
    expect(parseArgs([]).allowDrift).toBe(false);
  });
});

describe("validateEntries", () => {
  const valid = (n = 2) => ({
    stories: Array.from({ length: n }, (_, i) => entry(i + 1)),
  });

  it("accepts a well-formed set", () => {
    expect(validateEntries(valid(), 2)).toEqual([]);
  });
  it("rejects a wrong entry count", () => {
    expect(validateEntries(valid(2), 3).join(" ")).toMatch(
      /expected 3.*found 2/
    );
  });
  it("rejects a missing stories array", () => {
    expect(validateEntries({}).join(" ")).toMatch(/stories/);
  });
  it("rejects empty or whitespace verdict text", () => {
    for (const lang of ["en", "es"]) {
      const d = valid();
      d.stories[0].verdict[lang] = "  ";
      expect(validateEntries(d, 2).join(" ")).toContain(`verdict.${lang}`);
    }
  });
  it("rejects a duplicate _id", () => {
    const d = valid();
    d.stories[1]._id = d.stories[0]._id;
    expect(validateEntries(d, 2).join(" ")).toMatch(/duplicate/);
  });
  it("rejects extra and missing fields", () => {
    const extra = valid();
    extra.stories[0].note = "x";
    expect(validateEntries(extra, 2).join(" ")).toMatch(/exactly/);
    const missing = valid();
    delete missing.stories[0].severity;
    expect(validateEntries(missing, 2).join(" ")).toMatch(/exactly/);
    const verdictExtra = valid();
    verdictExtra.stories[0].verdict.fr = "x";
    expect(validateEntries(verdictExtra, 2).join(" ")).toMatch(/verdict/);
  });
  it("rejects an empty headline and non-integer issueNumber", () => {
    const d = valid();
    d.stories[0].headline = "";
    d.stories[1].issueNumber = "2";
    const msg = validateEntries(d, 2).join(" ");
    expect(msg).toMatch(/headline/);
    expect(msg).toMatch(/issueNumber/);
  });
  it("accepts the committed data file", () => {
    const data = JSON.parse(readFileSync(DATA_PATH, "utf-8"));
    expect(EXPECTED_ENTRIES).toBe(88);
    expect(validateEntries(data)).toEqual([]);
  });
});

describe("planBackfill", () => {
  it("never writes without apply, even with a valid expect", () => {
    const plan = planBackfill(entries, docs, [], { apply: false, expect: 2 });
    expect(plan.writes).toEqual([]);
    expect(plan.candidates).toHaveLength(2);
  });

  it("plans a rev-carrying localizedString set per story", () => {
    const plan = planBackfill(entries, docs, [], APPLY);
    expect(plan.errors).toEqual([]);
    expect(plan.writes[0]).toEqual({
      id: "story-1",
      rev: "rev-1",
      issueNumber: 1,
      headline: "Headline 1",
      severity: "EXPLOIT",
      patch: {
        set: {
          verdict: {
            _type: "localizedString",
            en: "VERDICT 1",
            es: "VEREDICTO 1",
          },
        },
      },
    });
    expect(plan.writes).toHaveLength(2);
  });

  it("never overwrites an existing verdict (skips it and reports it)", () => {
    const withVerdict = [
      doc(1, { verdict: { _type: "localizedString", en: "MINE" } }),
      doc(2),
    ];
    const plan = planBackfill(entries, withVerdict, [], {
      apply: true,
      expect: 1,
    });
    expect(plan.writes.map((w) => w.id)).toEqual(["story-2"]);
    expect(plan.skippedExisting).toEqual(["story-1"]);
  });

  it("treats an es-only existing verdict as existing", () => {
    const plan = planBackfill(
      [entry(1)],
      [doc(1, { verdict: { es: "SOLO ES" } })],
      [],
      { apply: true, expect: 0 }
    );
    expect(plan.writes).toEqual([]);
    expect(plan.skippedExisting).toEqual(["story-1"]);
  });

  it("treats an empty-string verdict as missing", () => {
    const plan = planBackfill(
      [entry(1)],
      [doc(1, { verdict: { en: "", es: "" } })],
      [],
      { apply: true, expect: 1 }
    );
    expect(plan.writes).toHaveLength(1);
  });

  it("matches strictly by _id, never by headline", () => {
    const wrongId = { ...doc(1), _id: "other-id" };
    const plan = planBackfill([entry(1)], [wrongId], [], { apply: false });
    expect(plan.candidates).toEqual([]);
    expect(plan.missing).toEqual(["story-1"]);
  });

  it("reports missing _ids and aborts --apply on them", () => {
    const plan = planBackfill(entries, [doc(1)], [], {
      apply: true,
      expect: 1,
    });
    expect(plan.missing).toEqual(["story-2"]);
    expect(plan.found).toBe(1);
    expect(plan.writes).toEqual([]);
    expect(plan.errors.join(" ")).toContain("story-2");
  });

  it("reports headline drift and aborts --apply unless --allow-drift", () => {
    const drifted = [doc(1, { headline: "Edited headline" }), doc(2)];
    const dry = planBackfill(entries, drifted, [], { apply: false });
    expect(dry.drift).toEqual([
      { id: "story-1", expected: "Headline 1", actual: "Edited headline" },
    ]);
    const blocked = planBackfill(entries, drifted, [], APPLY);
    expect(blocked.writes).toEqual([]);
    expect(blocked.errors.join(" ")).toMatch(/drift.*story-1.*--allow-drift/);
    const allowed = planBackfill(entries, drifted, [], {
      ...APPLY,
      allowDrift: true,
    });
    expect(allowed.errors).toEqual([]);
    expect(allowed.writes).toHaveLength(2);
  });

  it("aborts --apply without --expect", () => {
    const plan = planBackfill(entries, docs, [], { apply: true });
    expect(plan.writes).toEqual([]);
    expect(plan.errors.join(" ")).toMatch(/--expect/);
  });

  it("aborts when expect is below or above the planned writes", () => {
    const high = planBackfill(entries, docs, [], { apply: true, expect: 3 });
    expect(high.writes).toEqual([]);
    expect(high.errors.join(" ")).toMatch(/expected 3.*planned 2/);
    const low = planBackfill(entries, docs, [], { apply: true, expect: 1 });
    expect(low.writes).toEqual([]);
    expect(low.errors.join(" ")).toMatch(/expected 1.*planned 2/);
  });

  it("aborts when a draft exists unless --allow-drafts", () => {
    const blocked = planBackfill(entries, docs, ["drafts.story-1"], APPLY);
    expect(blocked.writes).toEqual([]);
    expect(blocked.errors.join(" ")).toContain("drafts.story-1");
    const allowed = planBackfill(entries, docs, ["drafts.story-1"], {
      ...APPLY,
      allowDrafts: true,
    });
    expect(allowed.errors).toEqual([]);
    expect(allowed.writes).toHaveLength(2);
  });

  it("reports drafts in a dry run without erroring", () => {
    const plan = planBackfill(entries, docs, ["drafts.story-1"], {
      apply: false,
    });
    expect(plan.draftIds).toEqual(["drafts.story-1"]);
    expect(plan.errors).toEqual([]);
  });

  it("aborts when a doc has no _rev", () => {
    const plan = planBackfill(
      [entry(1)],
      [{ _id: "story-1", headline: "Headline 1" }],
      [],
      { apply: true, expect: 1 }
    );
    expect(plan.writes).toEqual([]);
    expect(plan.errors.join(" ")).toMatch(/_rev/);
  });
});

describe("applyWrites", () => {
  const writes = planBackfill(entries, docs, [], APPLY).writes;

  function fakeClient(failIds = []) {
    const calls = [];
    return {
      calls,
      patch(id) {
        const call = { id, rev: undefined, set: undefined };
        calls.push(call);
        const chain = {
          ifRevisionId(rev) {
            call.rev = rev;
            return chain;
          },
          set(v) {
            call.set = v;
            return chain;
          },
          async commit() {
            if (failIds.includes(id)) throw new Error("revision mismatch");
            return {};
          },
        };
        return chain;
      },
    };
  }

  it("locks every patch to its fetched revision and writes the verdict", async () => {
    const client = fakeClient();
    const failures = await applyWrites(client, writes, () => {});
    expect(failures).toEqual([]);
    expect(client.calls).toEqual([
      {
        id: "story-1",
        rev: "rev-1",
        set: {
          verdict: {
            _type: "localizedString",
            en: "VERDICT 1",
            es: "VEREDICTO 1",
          },
        },
      },
      {
        id: "story-2",
        rev: "rev-2",
        set: {
          verdict: {
            _type: "localizedString",
            en: "VERDICT 2",
            es: "VEREDICTO 2",
          },
        },
      },
    ]);
  });

  it("collects per-doc failures and keeps going", async () => {
    const client = fakeClient(["story-1"]);
    const failures = await applyWrites(client, writes, () => {});
    expect(failures).toEqual([{ id: "story-1", message: "revision mismatch" }]);
    expect(client.calls).toHaveLength(2);
  });

  it("writes nothing when the plan has no writes (no --apply path)", async () => {
    const client = fakeClient();
    const dry = planBackfill(entries, docs, [], { apply: false, expect: 2 });
    await applyWrites(client, dry.writes, () => {});
    expect(client.calls).toEqual([]);
  });
});

describe("clientOptions", () => {
  const base = { projectId: "p", dataset: "d" };

  it("write path bypasses the CDN and carries the token", () => {
    const o = clientOptions({ ...base, apply: true, token: "tok" });
    expect(o.useCdn).toBe(false);
    expect(o.token).toBe("tok");
  });

  it("dry run uses the CDN and carries no token, even if one is supplied", () => {
    const o = clientOptions({ ...base, apply: false, token: "tok" });
    expect(o.useCdn).toBe(true);
    expect(o.token).toBeUndefined();
  });

  it("throws when apply has no token", () => {
    expect(() => clientOptions({ ...base, apply: true, token: null })).toThrow(
      /SANITY_API_TOKEN/
    );
  });
});

describe("draftIdsFor", () => {
  it("maps entry ids to drafts.<id>", () => {
    expect(draftIdsFor(entries)).toEqual(["drafts.story-1", "drafts.story-2"]);
    expect(draftIdsFor([])).toEqual([]);
  });
});

describe("applySummary", () => {
  it("reports counts and no hint when all succeeded", () => {
    expect(applySummary(3, [])).toEqual(["patched 3, failed 0"]);
  });
  it("hints the remaining count after a partial failure", () => {
    const lines = applySummary(3, [{ id: "a", message: "x" }]);
    expect(lines[0]).toBe("patched 2, failed 1");
    expect(lines[1]).toContain("--expect=1");
  });
  it("gives no re-run hint when nothing was patched", () => {
    expect(applySummary(1, [{ id: "a", message: "x" }])).toEqual([
      "patched 0, failed 1",
    ]);
  });
});

describe("queries", () => {
  it("selects published stories by _id and projects _rev, headline.en and verdict", () => {
    expect(QUERY).toContain('_type == "story"');
    expect(QUERY).toContain("_id in $ids");
    expect(QUERY).toContain('!(_id in path("drafts.**"))');
    expect(QUERY).toContain('!(_id in path("versions.**"))');
    expect(QUERY).toContain("_rev");
    expect(QUERY).toContain("headline.en");
    expect(QUERY).toContain("verdict");
  });
  it("looks up drafts by id", () => {
    expect(DRAFTS_QUERY).toContain("_id in $draftIds");
  });
});

describe("formatError", () => {
  it("returns the message, not the object", () => {
    expect(formatError(new Error("connect ECONNREFUSED"))).toBe(
      "connect ECONNREFUSED"
    );
    expect(formatError("plain")).toBe("plain");
  });
  it("scrubs bearer tokens and known secrets from the message", () => {
    const err = new Error("failed: Bearer SECRET123 at https://x/?t=SECRET123");
    const out = formatError(err, ["SECRET123"]);
    expect(out).not.toContain("SECRET123");
    expect(formatError(new Error("Bearer abc.def"))).toBe("Bearer ***");
  });
});

describe("write-path token scrubbing and total formatError", () => {
  const failingClient = (error) => ({
    patch() {
      const chain = {
        ifRevisionId: () => chain,
        set: () => chain,
        commit: async () => {
          throw error;
        },
      };
      return chain;
    },
  });
  const oneWrite = [{ id: "d1", rev: "r1", patch: { set: { a: 1 } } }];

  it("applyWrites scrubs a bare token from a commit error", async () => {
    const failures = await applyWrites(
      failingClient(new Error("tok SECRET123")),
      oneWrite,
      () => {},
      ["SECRET123"]
    );
    expect(JSON.stringify(failures)).not.toContain("SECRET123");
    expect(failures[0].message).toBe("tok ***");
  });

  it("formatError never throws on odd inputs", () => {
    const bare = Object.create(null);
    expect(() => formatError(bare)).not.toThrow();
    expect(formatError(bare)).toBe("Unknown error");
    expect(formatError({ message: 42 })).toBe("42");
    expect(formatError({ message: { toString: null } })).toBe("Unknown error");
    expect(formatError(null)).toBe("null");
    expect(formatError({ message: "x SECRET123" }, ["SECRET123"])).toBe(
      "x ***"
    );
  });
});

describe("run (top-level failure path)", () => {
  const leakyError = (message) =>
    Object.assign(new Error(message), {
      request: { headers: { authorization: "Bearer SECRET123" } },
    });
  const capture = async (argv, deps) => {
    const out = [];
    const sink = (...a) => out.push(format(...a));
    const e = vi.spyOn(console, "error").mockImplementation(sink);
    const l = vi.spyOn(console, "log").mockImplementation(sink);
    try {
      const code = await run(argv, deps);
      return { code, text: out.join("\n") };
    } finally {
      e.mockRestore();
      l.mockRestore();
    }
  };
  const failingClient = (message) => () => ({
    fetch: vi.fn().mockRejectedValue(leakyError(message)),
  });

  it("never prints the token a rejected fetch carries on err.request", async () => {
    const { code, text } = await capture([], {
      make: failingClient("connect ECONNREFUSED"),
    });
    expect(code).toBe(1);
    expect(text).toContain("connect ECONNREFUSED");
    expect(text).not.toContain("SECRET123");
  });

  it("scrubs a token the message itself mentions when one is passed in options", async () => {
    const { code, text } = await capture(["--apply", "--expect=1"], {
      readToken: () => "SECRET123",
      make: failingClient(
        "GET-request to https://msr24cg4.api.sanity.io/?token=SECRET123 failed"
      ),
    });
    expect(code).toBe(1);
    expect(text).toContain("GET-request to https://msr24cg4.api.sanity.io");
    expect(text).not.toContain("SECRET123");
  });
});

describe("clientOptions perspective", () => {
  it("pins the raw perspective on both read and write paths", () => {
    const base = { projectId: "p", dataset: "d" };
    expect(clientOptions({ ...base, apply: false }).perspective).toBe("raw");
    expect(
      clientOptions({ ...base, apply: true, token: "t" }).perspective
    ).toBe("raw");
  });
});

describe("parseArgs --expect strictness", () => {
  it.each(["", "1e1", "0x5", "-1", "0", "1.5", " 5", "5 ", "+5", "abc"])(
    "rejects %j",
    (v) => {
      expect(parseArgs([`--expect=${v}`]).expect).toBeNull();
    }
  );
  it("accepts plain positive decimals", () => {
    expect(parseArgs(["--expect=1"]).expect).toBe(1);
    expect(parseArgs(["--expect=88"]).expect).toBe(88);
  });
});
