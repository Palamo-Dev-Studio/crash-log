// ABOUTME: Category (beat) schema for recurring coverage verticals.
// ABOUTME: Used to categorize stories and power beat pages (/beat/[slug]).

export default {
  name: "category",
  title: "Category",
  type: "document",
  fields: [
    {
      name: "name",
      title: "Name",
      type: "localizedString",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name.en" },
      validation: (Rule) => Rule.required(),
    },
    {
      name: "description",
      title: "Description",
      type: "localizedText",
    },
    {
      name: "color",
      title: "Accent Color",
      type: "string",
      description: "Hex color for tags and category pages, e.g. #FF3B30",
    },
  ],
  preview: {
    select: { name: "name.en" },
    prepare({ name }) {
      return { title: name || "Untitled" };
    },
  },
};
