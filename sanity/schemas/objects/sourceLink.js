// ABOUTME: Source link object type for story attribution.
// ABOUTME: Links to original reporting sources with outlet name and article title.

export default {
  name: "sourceLink",
  title: "Source Link",
  type: "object",
  fields: [
    {
      name: "outlet",
      title: "Outlet",
      type: "string",
      description: 'e.g. "Reuters", "AP", "FDA"',
    },
    {
      name: "title",
      title: "Article Title",
      type: "string",
    },
    {
      name: "url",
      title: "URL",
      type: "url",
    },
  ],
  preview: {
    select: { outlet: "outlet", title: "title" },
    prepare({ outlet, title }) {
      return {
        title: title || "Untitled",
        subtitle: outlet || "",
      };
    },
  },
};
