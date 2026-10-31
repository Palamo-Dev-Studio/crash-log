// ABOUTME: Writes the About page copy (3 aboutPage fields + 2 agent role/displayOrder) from docs/plans/active/about-page-sanity.json. Dry run by default.
// ABOUTME: Writes only with --apply --expect=3 (needs SANITY_API_TOKEN). Run: node scripts/write-about-copy.mjs [--apply --expect=3 [--allow-drafts] [--force-reapply]]

import { createClient } from "@sanity/client";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const DATA_PATH = resolve(
  __dirname,
  "../docs/plans/active/about-page-sanity.json"
);
export const EXPECTED_TARGETS = 3;

const ABOUT_FIELDS = ["introParagraph", "workflowSection", "contactCTA"];
const AGENT_FIELDS = ["displayOrder", "role"];

// Published docs only (drafts and release versions carry "drafts." /
// "versions." id prefixes), matched strictly by _id.
export const QUERY = `*[_id in $ids && !(_id in path("drafts.**")) && !(_id in path("versions.**"))] { _id, _type, _rev, introParagraph, workflowSection, contactCTA, displayOrder, role }`;

// Drafts that shadow a target: a pending draft would publish over the new copy.
export const DRAFTS_QUERY = `*[_id in $draftIds]._id`;

// Safe one-line text for an error. Never the error object itself: network
// errors from @sanity/client carry `request`, which holds the raw
// `authorization: Bearer <token>` header. Also scrubs bearer tokens and any
// known secret value that a message might embed.
export function formatError(err, secrets = []) {
  let text;
  try {
    text = String(err?.message ?? err);
  } catch {
    text = "Unknown error";
  }
  text = text.replace(/Bearer\s+\S+/gi, "Bearer ***");
  for (const secret of secrets) {
    if (secret) text = text.split(secret).join("***");
  }
  return text;
}

export function parseArgs(argv) {
  const expectArg = argv.find((a) => a.startsWith("--expect="));
  const expectText = expectArg ? expectArg.slice("--expect=".length) : null;
  return {
    apply: argv.includes("--apply"),
    allowDrafts: argv.includes("--allow-drafts"),
    forceReapply: argv.includes("--force-reapply"),
    // Plain decimal digits only (no "", "1e1", "0x5", "-1"); 0 is rejected.
    expect:
      expectText !== null && /^[1-9][0-9]*$/.test(expectText)
        ? Number(expectText)
        : null,
  };
}

const isText = (v) => typeof v === "string" && v.trim() !== "";
const isBlocks = (v) =>
  Array.isArray(v) && v.length > 0 && v.every((b) => b?._type === "block");

// Turns the JSON file into one target per document:
// { _id, type, set } where `set` holds only the fields to write.
export function buildTargets(data) {
  const targets = [];
  const about = data?.aboutPage;
  if (about) {
    const set = {};
    for (const f of ABOUT_FIELDS) {
      if (about[f] !== undefined)
        set[f] = { _type: "localizedBlockContent", ...about[f] };
    }
    targets.push({ _id: about._id, type: "aboutPage", set });
  }
  for (const a of data?.agents ?? []) {
    const set = {};
    for (const f of AGENT_FIELDS) if (a[f] !== undefined) set[f] = a[f];
    targets.push({ _id: a._id, type: "agent", set });
  }
  return targets;
}

// Returns a list of problems with the loaded JSON; empty means valid.
export function validateData(data, expectedCount = EXPECTED_TARGETS) {
  const errors = [];
  if (!data?.aboutPage) return ["JSON has no `aboutPage` object."];
  if (!Array.isArray(data.agents)) return ["JSON has no `agents` array."];
  const targets = buildTargets(data);
  if (targets.length !== expectedCount)
    errors.push(
      `expected ${expectedCount} targets but found ${targets.length}.`
    );
  const seen = new Set();
  for (const t of targets) {
    const label = `${t.type} ${t._id ?? "(no _id)"}`;
    if (!isText(t._id)) errors.push(`${label}: empty _id.`);
    else if (seen.has(t._id)) errors.push(`${label}: duplicate _id.`);
    else seen.add(t._id);
    const allowed = t.type === "aboutPage" ? ABOUT_FIELDS : AGENT_FIELDS;
    // Property rule: a target carries exactly its type's fields, nothing else.
    const keys = Object.keys(t.set);
    if (
      keys.length !== allowed.length ||
      !allowed.every((k) => keys.includes(k))
    )
      errors.push(`${label}: must set exactly ${allowed.join(", ")}.`);
    if (t.type === "aboutPage") {
      for (const f of ABOUT_FIELDS) {
        for (const lang of ["en", "es"])
          if (!isBlocks(t.set[f]?.[lang]))
            errors.push(
              `${label}: ${f}.${lang} must be a non-empty block array.`
            );
      }
    } else {
      if (!Number.isInteger(t.set.displayOrder))
        errors.push(`${label}: displayOrder must be an integer.`);
      if (!isText(t.set.role?.en) || !isText(t.set.role?.es))
        errors.push(`${label}: role needs non-empty en and es.`);
    }
  }
  return errors;
}

// Legacy copy has no section headings; the new copy has h2 blocks. An h2 in
// the live introParagraph therefore means the new copy is already applied.
export function hasH2(localizedBlocks) {
  return ["en", "es"].some(
    (lang) =>
      Array.isArray(localizedBlocks?.[lang]) &&
      localizedBlocks[lang].some((b) => b?.style === "h2")
  );
}

function abbreviate(value, max = 70) {
  if (value === undefined || value === null) return "(empty)";
  if (typeof value === "object" && (value.en || value.es)) {
    const side = (v) =>
      Array.isArray(v)
        ? `${v.length} block(s): "${v
            .flatMap((b) => (b.children ?? []).map((c) => c.text ?? ""))
            .join("")
            .slice(0, max)}"`
        : String(v);
    return `en ${side(value.en)} | es ${side(value.es)}`;
  }
  const text = JSON.stringify(value);
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

// Pure decision function. Matches strictly by _id. Returns the planned
// writes (always empty unless apply and error-free), a field-level report
// and the reasons it refused.
export function planWrites(
  targets,
  docs,
  draftIds = [],
  {
    apply = false,
    expect = null,
    allowDrafts = false,
    forceReapply = false,
  } = {}
) {
  const byId = new Map(docs.map((d) => [d._id, d]));
  const candidates = [];
  const missing = [];
  const wrongType = [];
  let alreadyApplied = false;

  for (const t of targets) {
    const d = byId.get(t._id);
    if (!d) {
      missing.push(t._id);
      continue;
    }
    if (d._type !== t.type) {
      wrongType.push({ id: t._id, expected: t.type, actual: d._type });
      continue;
    }
    if (t.type === "aboutPage" && hasH2(d.introParagraph))
      alreadyApplied = true;
    candidates.push({
      id: t._id,
      type: t.type,
      rev: d._rev,
      fields: Object.keys(t.set).map((f) => ({
        field: f,
        current: abbreviate(d[f]),
        next: abbreviate(t.set[f]),
      })),
      patch: { set: t.set },
    });
  }

  const report = { candidates, missing, wrongType, alreadyApplied, draftIds };
  if (!apply) return { ...report, writes: [], errors: [] };

  const errors = [];
  if (expect === null) errors.push("--apply requires --expect=<n>.");
  else if (candidates.length !== expect)
    errors.push(
      `expected ${expect} write(s) but planned ${candidates.length}.`
    );
  if (missing.length)
    errors.push(
      `${missing.length} _id(s) missing in Sanity: ${missing.join(", ")}.`
    );
  for (const w of wrongType)
    errors.push(`${w.id} is a ${w.actual}, expected ${w.expected}.`);
  if (alreadyApplied && !forceReapply)
    errors.push(
      "introParagraph already contains an h2 block (new copy appears applied); pass --force-reapply to overwrite."
    );
  if (draftIds.length > 0 && !allowDrafts)
    errors.push(
      `drafts exist for target docs (${draftIds.join(", ")}); pass --allow-drafts to proceed.`
    );
  for (const c of candidates) {
    if (!c.rev) errors.push(`${c.id} has no _rev; cannot lock the patch.`);
  }
  return { ...report, writes: errors.length ? [] : candidates, errors };
}

// Client settings for the run. Reads are public, so a dry run needs no token
// and uses the CDN; the write path must bypass the CDN and carry the token.
export function clientOptions({ apply, token, projectId, dataset }) {
  if (apply && !token) {
    throw new Error("--apply needs SANITY_API_TOKEN (env or .env.local).");
  }
  return {
    projectId,
    dataset,
    apiVersion: "2024-03-01",
    // "raw" sees drafts and published docs alike; never "published", which
    // would blind the draft check.
    perspective: "raw",
    useCdn: !apply,
    token: apply ? token : undefined,
  };
}

export function draftIdsFor(targets) {
  return targets.map((t) => `drafts.${t._id}`);
}

export function applySummary(total, failures) {
  const patched = total - failures.length;
  const lines = [`patched ${patched}, failed ${failures.length}`];
  if (failures.length && patched > 0) {
    lines.push(
      "Some docs were written. Check which failed before re-running (a re-run needs --force-reapply)."
    );
  }
  return lines;
}

// Each patch is locked to the fetched revision: a concurrent edit makes that
// doc's commit fail instead of being overwritten. Returns the failures.
export async function applyWrites(
  client,
  writes,
  log = console.log,
  secrets = []
) {
  const failures = [];
  for (const { id, rev, patch } of writes) {
    try {
      await client.patch(id).ifRevisionId(rev).set(patch.set).commit();
      log(`patched ${id}`);
    } catch (err) {
      failures.push({ id, message: formatError(err, secrets) });
    }
  }
  return failures;
}

function loadToken() {
  if (process.env.SANITY_API_TOKEN) return process.env.SANITY_API_TOKEN;
  try {
    const content = readFileSync(resolve(__dirname, "../.env.local"), "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (trimmed.startsWith("SANITY_API_TOKEN=")) {
        return trimmed
          .slice("SANITY_API_TOKEN=".length)
          .replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    // fall through
  }
  return null;
}

// `secrets` collects token values so the top-level handler can scrub them.
export async function main(
  argv = process.argv.slice(2),
  { make = createClient, readToken = loadToken, secrets = [] } = {}
) {
  const opts = parseArgs(argv);
  const { apply } = opts;
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "msr24cg4";
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

  const data = JSON.parse(readFileSync(DATA_PATH, "utf-8"));
  const invalid = validateData(data);
  if (invalid.length) {
    for (const e of invalid) console.error(`ABORT: ${e}`);
    process.exit(1);
  }
  const targets = buildTargets(data);

  let options;
  try {
    options = clientOptions({
      apply,
      token: apply ? readToken() : null,
      projectId,
      dataset,
    });
  } catch (err) {
    console.error(formatError(err, secrets));
    process.exit(1);
  }
  if (options.token) secrets.push(options.token);
  const client = make(options);

  const docs = await client.fetch(QUERY, { ids: targets.map((t) => t._id) });
  const draftIds = await client.fetch(DRAFTS_QUERY, {
    draftIds: draftIdsFor(targets),
  });
  const plan = planWrites(targets, docs, draftIds, opts);
  const { candidates, writes, errors, missing, wrongType } = plan;

  console.log(
    `found ${candidates.length} of ${targets.length} target docs in Sanity`
  );
  console.log(`missing _ids: ${missing.join(", ") || "(none)"}`);
  for (const w of wrongType)
    console.log(`  WRONG TYPE ${w.id}: ${w.actual} (expected ${w.expected})`);
  console.log(
    `introParagraph already has h2 (new copy applied): ${plan.alreadyApplied ? "YES" : "no"}`
  );
  if (draftIds.length)
    console.log(`WARNING: drafts exist for: ${draftIds.join(", ")}`);
  console.log(`${candidates.length} planned write(s):`);
  for (const c of candidates) {
    console.log(`${apply ? "APPLY" : "WOULD APPLY"} ${c.type} ${c.id}`);
    for (const f of c.fields) {
      console.log(`  ${f.field}: ${f.current}  ->  ${f.next}`);
    }
  }

  if (!apply) {
    console.log("Dry run. Nothing written. Pass --apply --expect=3 to write.");
    console.log(
      "Dry run reads without a token, so it cannot see drafts; --apply checks for them."
    );
    return;
  }
  if (errors.length) {
    for (const e of errors) console.error(`ABORT: ${e}`);
    process.exit(1);
  }

  const failures = await applyWrites(client, writes, console.log, secrets);
  for (const f of failures) console.error(`FAILED ${f.id}: ${f.message}`);
  for (const line of applySummary(writes.length, failures)) console.log(line);
  if (failures.length) process.exit(1);
}

// Top-level wrapper: prints only a formatted message, never the error object.
export async function run(argv, deps = {}) {
  const secrets = [];
  try {
    await main(argv, { ...deps, secrets });
    return 0;
  } catch (err) {
    console.error(formatError(err, secrets));
    return 1;
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  run().then((code) => {
    if (code) process.exit(code);
  });
}
