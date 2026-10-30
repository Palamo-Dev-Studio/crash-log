// ABOUTME: Practical document schema — the how-to article series (file code FIX).
// ABOUTME: Uses field groups for tabbed EN/ES/Meta editing and a body with custom article blocks.

export default {
  name: "practical",
  title: "Practical",
  type: "document",
  groups: [
    { name: "english", title: "English", default: true },
    { name: "spanish", title: "Español" },
    { name: "meta", title: "Meta" },
  ],
  fields: [
    {
      name: "practicalNumber",
      title: "Practical Number",
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
      name: "byline",
      title: "Byline",
      type: "string",
      group: "meta",
      description: "Author display name, shown after By / Por",
      initialValue: "Hector Luis Alamo",
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
      name: "title",
      title: "Title",
      type: "localizedString",
      group: "english",
    },
    {
      name: "subtitle",
      title: "Subtitle (dek)",
      type: "localizedString",
      group: "english",
    },
    {
      name: "body",
      title: "Body",
      type: "localizedPracticalContent",
      group: "english",
    },
    {
      name: "metaDescription",
      title: "Meta Description",
      type: "localizedText",
      group: "meta",
    },
  ],
  preview: {
    select: {
      title: "title.en",
      number: "practicalNumber",
      hasEs: "title.es",
    },
    prepare({ title, number, hasEs }) {
      return {
        title: `FIX-${String(number).padStart(3, "0")} — ${title || "Untitled"}`,
        subtitle: hasEs ? "EN + ES" : "EN only",
      };
    },
  },
  orderings: [
    {
      title: "Practical Number (desc)",
      name: "practicalNumberDesc",
      by: [{ field: "practicalNumber", direction: "desc" }],
    },
  ],
};
