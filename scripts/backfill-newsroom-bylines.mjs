// ABOUTME: Backfills byline "newsroom" on published issues #1-27 that have no byline. Dry run by default.
// ABOUTME: Writes only with --apply --expect=<n> (needs SANITY_API_TOKEN). Run: node scripts/backfill-newsroom-bylines.mjs [--apply --expect=<n> [--allow-drafts]]

import { createClient } from "@sanity/client";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const MAX_ISSUE_NUMBER = 27;
const NEWSROOM_BYLINE = "newsroom";

// Published only (drafts and release versions have "drafts." / "versions." id
// prefixes); byline missing or empty.
export const QUERY = `*[_type == "issue" && !(_id in path("drafts.**")) && !(_id in path("versions.**")) && issueNumber <= $max && (!defined(byline) || byline == "")] | order(issueNumber asc) { _id, _rev, issueNumber, byline }`;

// Drafts that shadow a listed issue: a pending draft would publish without the byline.
export const DRAFTS_QUERY = `*[_type == "issue" && _id in $draftIds]._id`;

// Safe one-line text for an error. Never the error object itself: network
// errors from @sanity/client carry `request`, which holds the raw
// `authorization: Bearer <token>` header. Also scrubs bearer tokens and any
// known secret value that a message might embed.
export function formatError(err, secrets = []) {
  let text = err?.message || String(err);
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
    // Plain decimal digits only (no "", "1e1", "0x5", "-1"); 0 is rejected.
    expect:
      expectText !== null && /^[1-9][0-9]*$/.test(expectText)
        ? Number(expectText)
        : null,
  };
}

// Pure decision function. Returns the candidates, the writes to perform
// (always empty unless apply and error-free) and the reasons it refused.
export function planBackfill(
  docs,
  draftIds = [],
  { apply = false, expect = null, allowDrafts = false } = {}
) {
  const candidates = docs
    .filter(
      (d) =>
        d.issueNumber <= MAX_ISSUE_NUMBER &&
        (d.byline === undefined || d.byline === null || d.byline === "")
    )
    .map((d) => ({
      id: d._id,
      rev: d._rev,
      issueNumber: d.issueNumber,
      patch: { set: { byline: NEWSROOM_BYLINE } },
    }));

  const errors = [];
  if (!apply) return { candidates, writes: [], errors, draftIds };

  if (expect === null) errors.push("--apply requires --expect=<n>.");
  else if (candidates.length !== expect)
    errors.push(`expected ${expect} issue(s) but found ${candidates.length}.`);
  if (draftIds.length > 0 && !allowDrafts)
    errors.push(
      `drafts exist for listed issues (${draftIds.join(", ")}); pass --allow-drafts to proceed.`
    );
  for (const c of candidates) {
    if (!c.rev) errors.push(`${c.id} has no _rev; cannot lock the patch.`);
  }
  return {
    candidates,
    writes: errors.length ? [] : candidates,
    errors,
    draftIds,
  };
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

// Draft IDs that would shadow the given published docs.
export function draftIdsFor(docs) {
  return docs.map((d) => `drafts.${d._id}`);
}

// Summary printed after a write run, with a re-run hint when some failed.
export function applySummary(total, failures) {
  const patched = total - failures.length;
  const lines = [`patched ${patched}, failed ${failures.length}`];
  if (failures.length && patched > 0) {
    lines.push(
      `Re-run with --expect=${failures.length} to retry the remaining issue(s).`
    );
  }
  return lines;
}

// Each patch is locked to the fetched revision: a concurrent edit makes that
// doc's commit fail instead of being overwritten. Returns the failures.
export async function applyWrites(client, writes, log = console.log) {
  const failures = [];
  for (const { id, rev, patch } of writes) {
    try {
      await client.patch(id).ifRevisionId(rev).set(patch.set).commit();
      log(`patched ${id}`);
    } catch (err) {
      failures.push({ id, message: formatError(err) });
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

  // Reads are public, so the dry run needs no token and uses the CDN.
  let options;
  try {
    options = clientOptions({
      apply,
      token: apply ? readToken() : null,
      projectId,
      dataset,
    });
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
  if (options.token) secrets.push(options.token);
  const client = make(options);

  const docs = await client.fetch(QUERY, { max: MAX_ISSUE_NUMBER });
  const draftIds = await client.fetch(DRAFTS_QUERY, {
    draftIds: draftIdsFor(docs),
  });
  const { candidates, writes, errors } = planBackfill(docs, draftIds, opts);

  console.log(`${candidates.length} published issue(s) with no byline`);
  console.log(`IDs: ${candidates.map((p) => p.id).join(", ") || "(none)"}`);
  if (draftIds.length)
    console.log(`WARNING: drafts exist for: ${draftIds.join(", ")}`);
  for (const { id, issueNumber, patch } of candidates) {
    console.log(
      `${apply ? "APPLY" : "WOULD APPLY"} #${issueNumber} ${id}: ${JSON.stringify(patch)}`
    );
  }

  if (!apply) {
    console.log(
      "Dry run. Nothing written. Pass --apply --expect=<n> to write."
    );
    console.log(
      "Dry run reads without a token, so it cannot see drafts; --apply checks for them."
    );
    return;
  }
  if (errors.length) {
    for (const e of errors) console.error(`ABORT: ${e}`);
    process.exit(1);
  }

  const failures = await applyWrites(client, writes);
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
