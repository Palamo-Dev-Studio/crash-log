// ABOUTME: Issue document schema — one per newsletter edition, the top-level container.
// ABOUTME: Uses field groups for tabbed EN/ES/Meta editing in Sanity Studio.

export default {
  name: "issue",
  title: "Issue",
  type: "document",
  groups: [
    { name: "english", title: "English", default: true },
    { name: "spanish", title: "Español" },
    { name: "meta", title: "Meta" },
  ],
  fields: [
    // Shared (language-independent)
    {
      name: "issueNumber",
      title: "Issue Number",
      type: "number",
      group: "meta",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "meta",
      options: {
        source: (doc) =>
          `crash-log-${String(doc.issueNumber).padStart(3, "0")}`,
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

    // Localized content — English tab
    {
      name: "title",
      title: "Issue Title",
      type: "localizedString",
      group: "english",
    },
    {
      name: "subtitle",
      title: "Issue Subtitle",
      type: "localizedString",
      group: "english",
    },
    {
      name: "nicosTransmission",
      title: "Nico's Transmission",
      type: "localizedBlockContent",
      group: "english",
    },
    {
      name: "stories",
      title: "Stories",
      type: "array",
      of: [{ type: "reference", to: [{ type: "story" }] }],
      group: "english",
    },
    {
      name: "stackTrace",
      title: "Stack Trace",
      type: "array",
      of: [{ type: "stackTraceHit" }],
      validation: (Rule) => Rule.max(3),
      group: "english",
    },
    {
      name: "metaDescription",
      title: "Meta Description",
      type: "localizedText",
      group: "meta",
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
    select: { title: "title.en", number: "issueNumber", hasEs: "title.es" },
    prepare({ title, number, hasEs }) {
      return {
        title: `#${String(number).padStart(3, "0")} — ${title || "Untitled"}`,
        subtitle: hasEs ? "EN + ES" : "EN only",
      };
    },
  },
  orderings: [
    {
      title: "Issue Number (desc)",
      name: "issueNumberDesc",
      by: [{ field: "issueNumber", direction: "desc" }],
    },
  ],
};
