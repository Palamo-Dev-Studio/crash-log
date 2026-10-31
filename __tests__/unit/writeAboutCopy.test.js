// ABOUTME: Unit tests for scripts/write-about-copy.mjs validation, planning guards, write locking and token scrubbing.
// ABOUTME: Pins dry-run default, --expect/draft/already-applied guards, ifRevisionId, raw perspective, CDN-off writes and the real data file.

import { format } from "node:util";
import { describe, it, expect, vi } from "vitest";
import { readFileSync } from "fs";
import {
  QUERY,
  DATA_PATH,
  parseArgs,
  buildTargets,
  validateData,
  hasH2,
  planWrites,
  applyWrites,
  clientOptions,
  draftIdsFor,
  formatError,
  run,
} from "../../scripts/write-about-copy.mjs";

const block = (text, style = "normal") => ({
  _type: "block",
  _key: `k-${text}`,
  style,
  markDefs: [],
  children: [{ _type: "span", _key: `s-${text}`, text, marks: [] }],
});
const loc = (text, style) => ({
  en: [block(`${text} en`, style)],
  es: [block(`${text} es`, style)],
});
const data = () => ({
  aboutPage: {
    _id: "about",
    introParagraph: loc("intro", "h2"),
    workflowSection: loc("workflow"),
    contactCTA: loc("contact"),
  },
  agents: [
    {
      _id: "a1",
      name: "A",
      displayOrder: 1,
      role: { _type: "localizedString", en: "Ed", es: "Ed es" },
    },
    {
      _id: "a2",
      name: "B",
      displayOrder: 2,
      role: { _type: "localizedString", en: "Bot", es: "Bot es" },
    },
  ],
});
const targets = buildTargets(data());
const legacyIntro = { en: [block("old")], es: [block("viejo")] };
const docs = (intro = legacyIntro) => [
  { _id: "about", _type: "aboutPage", _rev: "r-about", introParagraph: intro },
  { _id: "a1", _type: "agent", _rev: "r-a1", displayOrder: 6 },
  { _id: "a2", _type: "agent", _rev: "r-a2", displayOrder: 1 },
];
const APPLY = { apply: true, expect: 3 };

describe("parseArgs", () => {
  it("is a dry run unless --apply is passed", () => {
    expect(parseArgs([]).apply).toBe(false);
    expect(parseArgs(["--apply"]).apply).toBe(true);
  });
  it("parses --expect strictly and the allow flags", () => {
    expect(parseArgs(["--expect=3"]).expect).toBe(3);
    for (const v of ["", "0", "1e1", "-1", " 3"])
      expect(parseArgs([`--expect=${v}`]).expect).toBeNull();
    expect(parseArgs(["--allow-drafts"]).allowDrafts).toBe(true);
    expect(parseArgs(["--force-reapply"]).forceReapply).toBe(true);
    expect(parseArgs([]).forceReapply).toBe(false);
  });
});

describe("validateData / buildTargets", () => {
  it("accepts a well-formed set of 3 targets", () => {
    expect(validateData(data())).toEqual([]);
    expect(targets).toHaveLength(3);
  });
  it("limits each target to its own type's fields", () => {
    expect(Object.keys(targets[0].set)).toEqual([
      "introParagraph",
      "workflowSection",
      "contactCTA",
    ]);
    expect(Object.keys(targets[1].set)).toEqual(["displayOrder", "role"]);
    const extra = data();
    extra.agents[0].bio = "x";
    expect(validateData(extra)).toEqual([]);
    expect(Object.keys(buildTargets(extra)[1].set)).not.toContain("bio");
  });
  it("rejects a wrong count, missing field and bad values", () => {
    const one = data();
    one.agents.pop();
    expect(validateData(one).join(" ")).toMatch(/expected 3.*found 2/);
    const noField = data();
    delete noField.aboutPage.contactCTA;
    expect(validateData(noField).join(" ")).toMatch(/exactly/);
    const bad = data();
    bad.agents[0].displayOrder = "1";
    bad.aboutPage.introParagraph.es = [];
    const msg = validateData(bad).join(" ");
    expect(msg).toMatch(/displayOrder/);
    expect(msg).toMatch(/introParagraph\.es/);
  });
  it("accepts the committed data file", () => {
    const real = JSON.parse(readFileSync(DATA_PATH, "utf-8"));
    expect(validateData(real)).toEqual([]);
    expect(buildTargets(real)).toHaveLength(3);
  });
});

describe("planWrites", () => {
  it("never writes without --apply, even with a valid expect", () => {
    const plan = planWrites(targets, docs(), [], { apply: false, expect: 3 });
    expect(plan.writes).toEqual([]);
    expect(plan.candidates).toHaveLength(3);
    expect(plan.candidates[1].fields[0]).toMatchObject({
      field: "displayOrder",
      current: "6",
      next: "1",
    });
  });
  it("plans rev-carrying sets touching only the target fields", () => {
    const plan = planWrites(targets, docs(), [], APPLY);
    expect(plan.errors).toEqual([]);
    expect(plan.writes.map((w) => [w.id, w.rev])).toEqual([
      ["about", "r-about"],
      ["a1", "r-a1"],
      ["a2", "r-a2"],
    ]);
    expect(Object.keys(plan.writes[0].patch.set)).toEqual([
      "introParagraph",
      "workflowSection",
      "contactCTA",
    ]);
    expect(plan.writes[0].patch.set.introParagraph._type).toBe(
      "localizedBlockContent"
    );
  });
  it("aborts --apply without --expect and on a count mismatch", () => {
    expect(
      planWrites(targets, docs(), [], { apply: true }).errors.join(" ")
    ).toMatch(/--expect/);
    const high = planWrites(targets, docs(), [], { apply: true, expect: 4 });
    expect(high.writes).toEqual([]);
    expect(high.errors.join(" ")).toMatch(/expected 4.*planned 3/);
    const low = planWrites(targets, docs(), [], { apply: true, expect: 2 });
    expect(low.writes).toEqual([]);
  });
  it("refuses --apply when introParagraph already has an h2 unless --force-reapply", () => {
    const applied = docs({ en: [block("Head", "h2")], es: [block("x")] });
    const blocked = planWrites(targets, applied, [], APPLY);
    expect(blocked.alreadyApplied).toBe(true);
    expect(blocked.writes).toEqual([]);
    expect(blocked.errors.join(" ")).toMatch(/h2.*--force-reapply/);
    const forced = planWrites(targets, applied, [], {
      ...APPLY,
      forceReapply: true,
    });
    expect(forced.errors).toEqual([]);
    expect(forced.writes).toHaveLength(3);
  });
  it("detects h2 in either language only", () => {
    expect(hasH2({ en: [block("a")], es: [block("b", "h2")] })).toBe(true);
    expect(hasH2(legacyIntro)).toBe(false);
    expect(hasH2(undefined)).toBe(false);
  });
  it("aborts --apply when a draft exists unless --allow-drafts", () => {
    const blocked = planWrites(targets, docs(), ["drafts.a1"], APPLY);
    expect(blocked.writes).toEqual([]);
    expect(blocked.errors.join(" ")).toContain("drafts.a1");
    const allowed = planWrites(targets, docs(), ["drafts.a1"], {
      ...APPLY,
      allowDrafts: true,
    });
    expect(allowed.errors).toEqual([]);
  });
  it("reports drafts in a dry run without erroring", () => {
    const plan = planWrites(targets, docs(), ["drafts.a1"], { apply: false });
    expect(plan.draftIds).toEqual(["drafts.a1"]);
    expect(plan.errors).toEqual([]);
  });
  it("aborts on a missing doc, wrong type or missing _rev", () => {
    const missing = planWrites(targets, docs().slice(0, 2), [], APPLY);
    expect(missing.writes).toEqual([]);
    expect(missing.errors.join(" ")).toContain("a2");
    const wrong = docs();
    wrong[1]._type = "story";
    expect(planWrites(targets, wrong, [], APPLY).errors.join(" ")).toMatch(
      /a1 is a story/
    );
    const noRev = docs();
    delete noRev[2]._rev;
    expect(planWrites(targets, noRev, [], APPLY).errors.join(" ")).toMatch(
      /_rev/
    );
  });
});

describe("applyWrites", () => {
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
  const writes = planWrites(targets, docs(), [], APPLY).writes;

  it("locks every patch to its fetched revision", async () => {
    const client = fakeClient();
    const failures = await applyWrites(client, writes, () => {});
    expect(failures).toEqual([]);
    expect(client.calls.map((c) => [c.id, c.rev])).toEqual([
      ["about", "r-about"],
      ["a1", "r-a1"],
      ["a2", "r-a2"],
    ]);
    expect(client.calls[1].set).toEqual(targets[1].set);
  });
  it("collects per-doc failures and keeps going", async () => {
    const client = fakeClient(["a1"]);
    const failures = await applyWrites(client, writes, () => {});
    expect(failures).toEqual([{ id: "a1", message: "revision mismatch" }]);
    expect(client.calls).toHaveLength(3);
  });
  it("writes nothing for a dry-run plan", async () => {
    const client = fakeClient();
    const dry = planWrites(targets, docs(), [], { apply: false, expect: 3 });
    await applyWrites(client, dry.writes, () => {});
    expect(client.calls).toEqual([]);
  });
  it("scrubs a bare token from a commit error", async () => {
    const failures = await applyWrites(
      fakeClient(),
      [{ id: "d", rev: "r", patch: { set: {} } }].map((w) => w),
      () => {},
      ["SECRET123"]
    );
    expect(failures).toEqual([]);
    const bad = {
      patch: () => {
        const chain = {
          ifRevisionId: () => chain,
          set: () => chain,
          commit: async () => {
            throw new Error("tok SECRET123");
          },
        };
        return chain;
      },
    };
    const out = await applyWrites(
      bad,
      [{ id: "d", rev: "r", patch: { set: {} } }],
      () => {},
      ["SECRET123"]
    );
    expect(out[0].message).toBe("tok ***");
  });
});

describe("clientOptions", () => {
  const base = { projectId: "p", dataset: "d" };
  it("write path bypasses the CDN and carries the token", () => {
    const o = clientOptions({ ...base, apply: true, token: "tok" });
    expect(o.useCdn).toBe(false);
    expect(o.token).toBe("tok");
  });
  it("dry run uses the CDN and carries no token even if supplied", () => {
    const o = clientOptions({ ...base, apply: false, token: "tok" });
    expect(o.useCdn).toBe(true);
    expect(o.token).toBeUndefined();
  });
  it("throws when apply has no token", () => {
    expect(() => clientOptions({ ...base, apply: true, token: null })).toThrow(
      /SANITY_API_TOKEN/
    );
  });
  it("pins the raw perspective on both paths", () => {
    expect(clientOptions({ ...base, apply: false }).perspective).toBe("raw");
    expect(
      clientOptions({ ...base, apply: true, token: "t" }).perspective
    ).toBe("raw");
  });
});

describe("queries and drafts", () => {
  it("selects published docs by _id and projects _rev and the target fields", () => {
    expect(QUERY).toContain("_id in $ids");
    expect(QUERY).toContain('!(_id in path("drafts.**"))');
    expect(QUERY).toContain('!(_id in path("versions.**"))');
    for (const f of [
      "_rev",
      "_type",
      "introParagraph",
      "workflowSection",
      "contactCTA",
      "displayOrder",
      "role",
    ])
      expect(QUERY).toContain(f);
  });
  it("maps target ids to drafts.<id>", () => {
    expect(draftIdsFor(targets)).toEqual([
      "drafts.about",
      "drafts.a1",
      "drafts.a2",
    ]);
  });
});

describe("formatError", () => {
  it("returns the message, scrubs bearer tokens and known secrets", () => {
    expect(formatError(new Error("boom"))).toBe("boom");
    expect(formatError(new Error("Bearer abc.def"))).toBe("Bearer ***");
    expect(formatError(new Error("x SECRET123"), ["SECRET123"])).toBe("x ***");
  });
  it("never throws on odd inputs", () => {
    expect(formatError(Object.create(null))).toBe("Unknown error");
    expect(formatError({ message: { toString: null } })).toBe("Unknown error");
    expect(formatError(null)).toBe("null");
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

  it("scrubs a token the message itself mentions on the apply path", async () => {
    const { code, text } = await capture(["--apply", "--expect=3"], {
      readToken: () => "SECRET123",
      make: failingClient(
        "GET https://x.api.sanity.io/?token=SECRET123 failed"
      ),
    });
    expect(code).toBe(1);
    expect(text).toContain("GET https://x.api.sanity.io");
    expect(text).not.toContain("SECRET123");
  });

  it("builds the client with useCdn on a dry run and off on apply", async () => {
    const seen = [];
    const make = (opts) => {
      seen.push(opts);
      return { fetch: vi.fn().mockRejectedValue(new Error("stop")) };
    };
    await capture([], { make });
    await capture(["--apply", "--expect=3"], {
      make,
      readToken: () => "SECRET123",
    });
    expect(seen.map((o) => o.useCdn)).toEqual([true, false]);
    expect(seen.every((o) => o.perspective === "raw")).toBe(true);
  });

  it("writes nothing on a dry run end to end", async () => {
    const commit = vi.fn();
    const make = () => ({
      fetch: vi
        .fn()
        .mockResolvedValueOnce(
          docs().map((d) => ({ ...d, introParagraph: legacyIntro }))
        )
        .mockResolvedValueOnce([]),
      patch: () => ({ commit }),
    });
    const { code } = await capture([], { make });
    expect(code).toBe(0);
    expect(commit).not.toHaveBeenCalled();
  });
});
