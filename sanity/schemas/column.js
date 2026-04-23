// ABOUTME: Column document schema — Nico's Notes weekly column entries.
// ABOUTME: Uses field groups for tabbed EN/ES/Meta editing in Sanity Studio.

export default {
  name: "column",
  title: "Column",
  type: "document",
  groups: [
    { name: "english", title: "English", default: true },
    { name: "spanish", title: "Español" },
    { name: "meta", title: "Meta" },
  ],
  fields: [
    {
      name: "columnNumber",
      title: "Column Number",
      type: "number",
      group: "meta",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "meta",
      description: "Use publish date as YYYY-MM-DD",
      options: {
        source: (doc) => {
          if (!doc.publishDate) return "";
          return doc.publishDate.slice(0, 10);
        },
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: "publishDate",
      title: "Publish Date",
      type: "datetime",
      group: "meta",
    },
    {
      name: "status",
      title: "Status",
      type: "string",
      group: "meta",
      options: { list: ["draft", "review", "scheduled", "published"] },
      initialValue: "draft",
    },
    {
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      group: "meta",
      description: "Shared across both languages",
      options: { hotspot: true },
    },
    {
      name: "coverImageAlt",
      title: "Cover Image Alt",
      type: "localizedString",
      group: "meta",
    },
    {
      name: "coverImagePrompt",
      title: "Cover Image Prompt",
      type: "text",
      group: "meta",
      description: "Prompt used to generate the cover image",
    },
    {
      name: "title",
      title: "Column Title",
      type: "localizedString",
      group: "english",
    },
    {
      name: "subtitle",
      title: "Column Subtitle",
      type: "localizedString",
      group: "english",
    },
    {
      name: "body",
      title: "Body",
      type: "localizedBlockContent",
      group: "english",
    },
    {
      name: "metaDescription",
      title: "Meta Description",
      type: "localizedText",
      group: "meta",
    },
    {
      name: "themeFingerprint",
      title: "Theme Fingerprint",
      type: "array",
      of: [{ type: "string" }],
      group: "meta",
      description:
        "3–5 short phrases capturing the central motif of this column, written at draft time. Read by future Transmission/Column drafts to detect persistent themes across the last 3 pieces.",
      validation: (Rule) => Rule.max(5),
    },
    {
      name: "beehiivStatus",
      title: "Beehiiv Status",
      type: "string",
      group: "meta",
      options: { list: ["not_sent", "queued", "sent"] },
      initialValue: "not_sent",
    },
    {
      name: "beehiivPostIds",
      title: "Beehiiv Post IDs",
      type: "object",
      group: "meta",
      readOnly: true,
      description: "Tracks Beehiiv draft post IDs for idempotency",
      fields: [
        { name: "en", title: "EN Post ID", type: "string" },
        { name: "es", title: "ES Post ID", type: "string" },
      ],
    },
  ],
  preview: {
    select: {
      title: "title.en",
      number: "columnNumber",
      hasEs: "title.es",
    },
    prepare({ title, number, hasEs }) {
      return {
        title: `#${String(number).padStart(3, "0")} — ${title || "Untitled"}`,
        subtitle: hasEs ? "EN + ES" : "EN only",
      };
    },
  },
  orderings: [
    {
      title: "Column Number (desc)",
      name: "columnNumberDesc",
      by: [{ field: "columnNumber", direction: "desc" }],
    },
  ],
};
