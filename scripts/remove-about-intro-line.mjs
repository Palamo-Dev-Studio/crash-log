// ABOUTME: Removes the "Two of us." / "Somos dos." intro block from the published aboutPage workflowSection (both locales). Dry run by default.
// ABOUTME: Writes only with --apply --expect=<blocks to remove> (needs SANITY_API_TOKEN). Run: node scripts/remove-about-intro-line.mjs [--apply --expect=2 [--allow-drafts]]

import { createClient } from "@sanity/client";
import { readFileSync } from "fs";
import { pathToFileURL } from "url";
import {
  DATA_PATH,
  parseArgs,
  clientOptions,
  formatError,
  loadToken,
} from "./write-about-copy.mjs";

// The block to remove, per locale: its Portable Text _key and exact text. Both must match,
// and it must be the first block after the first H2, or the script refuses to touch it.
export const INTRO_LINES = {
  en: { key: "en-workflow-h0p0", text: "Two of us." },
  es: { key: "es-workflow-h0p0", text: "Somos dos." },
};

// Published doc only: a strict _id match never returns the drafts. prefixed copy.
export const QUERY = `*[_id == $id] { _id, _type, _rev, workflowSection }`;
export const DRAFT_QUERY = `*[_id == $draftId]._id`;

const blockText = (b) => (b?.children ?? []).map((c) => c.text ?? "").join("");

// Pure decision function. Per locale the outcome is one of:
//   remove  - the block is where the copy put it and says exactly what we expect
//   absent  - no block with that key or that text: nothing to do
//   anomaly - the key or text exists but not as expected: never guess, refuse
export function planRemoval(
  doc,
  draftIds = [],
  { apply = false, expect = null, allowDrafts = false } = {}
) {
  const locales = [];
  if (doc) {
    for (const [lang, line] of Object.entries(INTRO_LINES)) {
      const blocks = doc.workflowSection?.[lang] ?? [];
      const firstH2 = blocks.findIndex(
        (b) => b?._type === "block" && b.style === "h2"
      );
      const after = firstH2 >= 0 ? blocks[firstH2 + 1] : undefined;
      const matches = blocks.filter(
        (b) => b?._key === line.key || blockText(b).trim() === line.text
      ).length;
      const present = matches > 0;
      let outcome;
      if (
        matches === 1 &&
        after?._key === line.key &&
        after.style === "normal" &&
        blockText(after) === line.text
      )
        outcome = "remove";
      else outcome = present ? "anomaly" : "absent";
      locales.push({
        lang,
        outcome,
        path: `workflowSection.${lang}[_key=="${line.key}"]`,
      });
    }
  }
  const removals = locales.filter((l) => l.outcome === "remove");
  const report = { locales, draftIds, removals: removals.length };
  if (!apply) return { ...report, unset: [], errors: [] };

  const errors = [];
  if (!doc) errors.push("aboutPage document not found.");
  if (expect === null) errors.push("--apply requires --expect=<n>.");
  else if (removals.length !== expect)
    errors.push(
      `expected ${expect} removal(s) but planned ${removals.length}.`
    );
  for (const l of locales)
    if (l.outcome === "anomaly")
      errors.push(
        `${l.lang}: a block with the intro key or text is not the first block after the first h2; refusing to guess.`
      );
  if (doc?._type !== "aboutPage" && doc)
    errors.push(`${doc._id} is a ${doc._type}, expected aboutPage.`);
  if (draftIds.length > 0 && !allowDrafts)
    errors.push(
      `drafts exist for the target doc (${draftIds.join(", ")}); pass --allow-drafts to proceed.`
    );
  if (doc && !doc._rev)
    errors.push("document has no _rev; cannot lock the patch.");
  const ok = errors.length === 0;
  return {
    ...report,
    rev: doc?._rev,
    unset: ok ? removals.map((l) => l.path) : [],
    errors,
  };
}

// The patch is locked to the fetched revision: a concurrent edit fails the commit.
export async function applyRemoval(client, id, rev, unset, secrets = []) {
  if (unset.length === 0) return null;
  try {
    await client.patch(id).ifRevisionId(rev).unset(unset).commit();
    return null;
  } catch (err) {
    return formatError(err, secrets);
  }
}

export async function main(
  argv = process.argv.slice(2),
  { make = createClient, readToken = loadToken, secrets = [] } = {}
) {
  const opts = parseArgs(argv);
  const { apply } = opts;
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "msr24cg4";
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
  const id = JSON.parse(readFileSync(DATA_PATH, "utf-8")).aboutPage?._id;
  if (!id) {
    console.error("ABORT: JSON has no aboutPage._id.");
    process.exit(1);
  }

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

  const [doc] = await client.fetch(QUERY, { id });
  const draftIds = await client.fetch(DRAFT_QUERY, { draftId: `drafts.${id}` });
  const plan = planRemoval(doc, draftIds, opts);

  console.log(`aboutPage ${id}: ${doc ? "found" : "NOT FOUND"}`);
  if (draftIds.length) console.log(`WARNING: drafts exist for: ${draftIds}`);
  for (const l of plan.locales)
    console.log(`  ${l.lang}: ${l.outcome} (${l.path})`);
  console.log(`${plan.removals} planned removal(s).`);

  if (!apply) {
    console.log("Dry run. Nothing written. Pass --apply --expect=2 to write.");
    console.log(
      "Dry run reads without a token, so it cannot see drafts; --apply checks for them."
    );
    return;
  }
  if (plan.errors.length) {
    for (const e of plan.errors) console.error(`ABORT: ${e}`);
    process.exit(1);
  }
  const failure = await applyRemoval(client, id, plan.rev, plan.unset, secrets);
  if (failure) {
    console.error(`FAILED ${id}: ${failure}`);
    process.exit(1);
  }
  console.log(`patched ${id}: removed ${plan.unset.length} block(s)`);
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
