// ABOUTME: Schema tests for the Field Manual additions (story, issue, practical).
// ABOUTME: Asserts new fields, additive-only changes, registration and allowed body block types.

import { describe, it, expect } from "vitest";
import story from "@/sanity/schemas/story";
import issue from "@/sanity/schemas/issue";
import practical from "@/sanity/schemas/practical";
import practicalBlockContent from "@/sanity/schemas/objects/practicalBlockContent";
import localizedPracticalContent from "@/sanity/schemas/objects/localizedPracticalContent";
import * as practicalBlocks from "@/sanity/schemas/objects/practicalBlocks";
import config from "@/sanity.config";

const field = (doc, name) => doc.fields.find((f) => f.name === name);
const registered = config.schema.types.map((t) => t.name);

describe("story schema", () => {
  it("adds verdict as localizedString", () => {
    expect(field(story, "verdict").type).toBe("localizedString");
  });
  it("adds summary as localizedText, not required", () => {
    expect(field(story, "summary").type).toBe("localizedText");
    expect(field(story, "summary").validation).toBeUndefined();
  });
  it("adds image with hotspot, imageAlt and imageCredit", () => {
    expect(field(story, "image").type).toBe("image");
    expect(field(story, "image").options.hotspot).toBe(true);
    expect(field(story, "imageAlt").type).toBe("localizedString");
    expect(field(story, "imageCredit").type).toBe("string");
  });
  it("keeps every pre-existing field", () => {
    for (const name of [
      "slug",
      "severity",
      "category",
      "sources",
      "headline",
      "tags",
      "body",
    ]) {
      expect(field(story, name), name).toBeDefined();
    }
  });
});

describe("issue schema", () => {
  it("has an optional byline defaulting to Hector Luis Alamo", () => {
    const f = field(issue, "byline");
    expect(f.type).toBe("string");
    expect(f.initialValue).toBe("Hector Luis Alamo");
    expect(f.validation).toBeUndefined();
  });
});

describe("practical schema", () => {
  it("is a document named practical", () => {
    expect(practical.name).toBe("practical");
    expect(practical.type).toBe("document");
  });
  it("has the required fields with the right types", () => {
    expect(field(practical, "practicalNumber").type).toBe("number");
    expect(field(practical, "practicalNumber").validation).toBeDefined();
    expect(field(practical, "slug").type).toBe("slug");
    expect(field(practical, "publishDate").type).toBe("datetime");
    expect(field(practical, "title").type).toBe("localizedString");
    expect(field(practical, "subtitle").type).toBe("localizedString");
    expect(field(practical, "coverImage").type).toBe("image");
    expect(field(practical, "coverImageAlt").type).toBe("localizedString");
    expect(field(practical, "metaDescription").type).toBe("localizedText");
    expect(field(practical, "body").type).toBe("localizedPracticalContent");
  });
  it("defaults byline to Hector Luis Alamo", () => {
    expect(field(practical, "byline").initialValue).toBe("Hector Luis Alamo");
  });
  it("uses english/spanish/meta groups", () => {
    expect(practical.groups.map((g) => g.name)).toEqual([
      "english",
      "spanish",
      "meta",
    ]);
  });
  it("is registered with the Studio", () => {
    expect(registered).toContain("practical");
  });
});

describe("practical body", () => {
  const customTypes = [
    "steps",
    "exhibit",
    "callout",
    "pullQuote",
    "codeBlock",
    "replyAsk",
  ];

  it("localizes the body into en (required) and es", () => {
    const en = localizedPracticalContent.fields.find((f) => f.name === "en");
    const es = localizedPracticalContent.fields.find((f) => f.name === "es");
    expect(en.type).toBe("practicalBlockContent");
    expect(en.validation).toBeDefined();
    expect(es.type).toBe("practicalBlockContent");
    expect(es.validation).toBeUndefined();
  });

  it.each(customTypes)("allows the %s block in the body", (name) => {
    expect(practicalBlockContent.of.map((m) => m.type)).toContain(name);
  });

  it.each(customTypes)("defines and registers the %s object type", (name) => {
    expect(practicalBlocks[name].name).toBe(name);
    expect(practicalBlocks[name].type).toBe("object");
    expect(registered).toContain(name);
  });

  it("keeps the standard blocks (h2, h3, blockquote, lists, link)", () => {
    const block = practicalBlockContent.of.find((m) => m.type === "block");
    const styles = block.styles.map((s) => s.value);
    expect(styles).toEqual(expect.arrayContaining(["h2", "h3", "blockquote"]));
    expect(block.lists.map((l) => l.value)).toEqual(["bullet", "number"]);
    expect(block.marks.annotations.map((a) => a.name)).toContain("link");
  });

  it("registers both practical body types", () => {
    expect(registered).toContain("practicalBlockContent");
    expect(registered).toContain("localizedPracticalContent");
  });

  it("gives callout and replyAsk their default titles", () => {
    const initial = (obj) =>
      obj.fields.find((f) => f.name === "title").initialValue;
    expect(initial(practicalBlocks.callout)).toBe("Check before you act");
    expect(initial(practicalBlocks.replyAsk)).toBe("Your turn");
  });

  it("models steps as items of {title, text} and exhibit with label, tag, image, text, caption", () => {
    const stepFields = field(practicalBlocks.steps, "items").of[0].fields.map(
      (f) => f.name
    );
    expect(stepFields).toEqual(["title", "text"]);
    expect(practicalBlocks.exhibit.fields.map((f) => f.name)).toEqual([
      "label",
      "tag",
      "image",
      "text",
      "caption",
    ]);
  });
});
