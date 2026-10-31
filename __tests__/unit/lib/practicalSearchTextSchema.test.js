// ABOUTME: Property test: every reader-visible text field in the Practical body schema must reach practicalSearchText.
// ABOUTME: Walks the real Sanity schema files, plants a unique token in each text field, and fails naming any field the search text drops.

import { describe, it, expect } from "vitest";
import { practicalSearchText } from "@/lib/practicalSearchText";
import practicalBlockContent from "@/sanity/schemas/objects/practicalBlockContent";
import * as practicalBlocks from "@/sanity/schemas/objects/practicalBlocks";

// Fields that are not reader-visible text. Key: "<owning type>.<field>".
const EXCLUDED = {
  "codeBlock.language":
    "syntax-highlighter hint (e.g. bash), an option value rather than text a reader sees",
};
// Field types that never hold reader-visible text.
const NON_TEXT_TYPES = new Set([
  "url", // link targets, not text
  "boolean",
  "number",
  "date",
  "datetime",
  "reference", // pointer to another document
  "slug",
]);

const registry = Object.fromEntries(
  Object.values(practicalBlocks).map((def) => [def.name, def])
);

// Plants a token in every text field of `def`, recording token -> schema path.
function fixtureFor(def, owner, path, tokens) {
  const fields = def.fields || [];
  const value = { _type: def.name || def.type };
  for (const field of fields) {
    const fieldPath = `${path}.${field.name}`;
    if (EXCLUDED[`${owner}.${field.name}`]) continue;
    value[field.name] = valueFor(field, owner, fieldPath, tokens);
  }
  return value;
}

function valueFor(field, owner, path, tokens) {
  if (NON_TEXT_TYPES.has(field.type)) return undefined;
  if (field.type === "string" || field.type === "text") {
    const token = `tok${tokens.size}x`;
    tokens.set(token, path);
    return token;
  }
  if (field.type === "image") {
    return {
      _type: "image",
      asset: { _ref: "image-abc-1x1-png" },
      ...Object.fromEntries(
        (field.fields || [])
          .filter((f) => !EXCLUDED[`${owner}.${field.name}.${f.name}`])
          .map((f) => [f.name, valueFor(f, owner, `${path}.${f.name}`, tokens)])
      ),
    };
  }
  if (field.type === "array") {
    return (field.of || [])
      .map((member, i) => memberFixture(member, `${path}[${i}]`, tokens))
      .filter((v) => v !== undefined);
  }
  if (field.type === "object") {
    return fixtureFor(field, owner, path, tokens);
  }
  throw new Error(
    `Unhandled field type "${field.type}" at ${path}: classify it as text or add it to NON_TEXT_TYPES`
  );
}

function memberFixture(member, path, tokens) {
  if (member.type === "string" || member.type === "text") {
    return valueFor(member, member.name, path, tokens);
  }
  if (NON_TEXT_TYPES.has(member.type)) return undefined;
  if (member.type === "image") {
    return valueFor(member, member.name || "image", path, tokens);
  }
  const def = registry[member.type];
  if (!def && member.type !== "object") {
    throw new Error(
      `Unhandled array member type "${member.type}" at ${path}: classify it as text or add it to NON_TEXT_TYPES`
    );
  }
  const resolved = def || member;
  return fixtureFor(resolved, resolved.name || member.name, path, tokens);
}

// Builds a portable-text block that carries a token in its text, in every annotation
// field (as a mark definition) and in every inline `of` member, as the schema defines them.
function blockFixture(member, tokens) {
  const textToken = `tok${tokens.size}x`;
  tokens.set(textToken, "block.children.text");
  const markDefs = [];
  const marks = [];
  for (const annotation of member.marks?.annotations || []) {
    const key = `mark${markDefs.length}`;
    markDefs.push({
      _key: key,
      ...fixtureFor(
        annotation,
        annotation.name,
        `block.annotations.${annotation.name}`,
        tokens
      ),
      _type: annotation.name,
    });
    marks.push(key);
  }
  const children = [{ _type: "span", text: textToken, marks }];
  for (const [i, inline] of (member.of || []).entries()) {
    const fixture = memberFixture(inline, `block.of[${i}]`, tokens);
    if (fixture !== undefined) children.push(fixture);
  }
  return { _type: "block", style: "normal", markDefs, children };
}

// Builds the whole-body fixture from the real schema's `of` list.
function buildBodyFixture() {
  const tokens = new Map();
  const body = [];
  for (const member of practicalBlockContent.of) {
    if (member.type === "block") {
      body.push(blockFixture(member, tokens));
    } else if (member.type === "image") {
      // Walk the body image's real schema fields (alt, and anything added later).
      body.push(valueFor(member, "image", "image", tokens));
    } else {
      if (!registry[member.type]) {
        throw new Error(
          `Body member "${member.type}" is not defined in practicalBlocks.js`
        );
      }
      body.push(memberFixture(member, member.type, tokens));
    }
  }
  return { body, tokens };
}

describe("practicalSearchText covers the Practical body schema", () => {
  const { body, tokens } = buildBodyFixture();
  const text = practicalSearchText(body);

  it("plants tokens in the fields this test exists to guard", () => {
    const paths = [...tokens.values()];
    for (const p of [
      "exhibit.image.alt",
      "exhibit.tag",
      "exhibit.rows[0].lead",
      "steps.items[0].title",
      "replyAsk.buttonLabel",
      "codeBlock.code",
      "image.alt",
    ]) {
      expect(paths).toContain(p);
    }
  });

  it("finds every planted token in the search text", () => {
    const missing = [...tokens]
      .filter(([token]) => !text.includes(token))
      .map(([, path]) => path);
    expect(missing).toEqual([]);
  });
});
