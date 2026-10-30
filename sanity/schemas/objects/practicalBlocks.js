// ABOUTME: Custom Portable Text block objects for Practical articles (steps, exhibit, callout, etc.).
// ABOUTME: Each export is a Sanity object type rendered by the Practical article template.

export const steps = {
  name: "steps",
  title: "Numbered Steps",
  type: "object",
  fields: [
    {
      name: "items",
      title: "Steps",
      type: "array",
      of: [
        {
          type: "object",
          name: "step",
          fields: [
            { name: "title", title: "Title", type: "string" },
            { name: "text", title: "Text", type: "text" },
          ],
          preview: { select: { title: "title", subtitle: "text" } },
        },
      ],
    },
  ],
  preview: {
    select: { items: "items" },
    prepare({ items }) {
      return { title: `Steps (${(items || []).length})` };
    },
  },
};

export const exhibit = {
  name: "exhibit",
  title: "Exhibit",
  type: "object",
  fields: [
    {
      name: "label",
      title: "Label",
      type: "string",
      description: 'Left header text, e.g. "EXHIBIT A"',
    },
    {
      name: "tag",
      title: "Tag",
      type: "string",
      description: 'Optional right-hand header text, e.g. "WEEK 44"',
    },
    {
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      fields: [{ name: "alt", type: "string", title: "Alt text" }],
    },
    {
      name: "text",
      title: "Rows / Text",
      type: "text",
      description: "One row per line",
    },
    { name: "caption", title: "Caption", type: "string" },
  ],
  preview: {
    select: { title: "label", subtitle: "caption", media: "image" },
  },
};

export const callout = {
  name: "callout",
  title: "Callout",
  type: "object",
  fields: [
    {
      name: "title",
      title: "Title",
      type: "string",
      initialValue: "Check before you act",
    },
    { name: "text", title: "Text", type: "text" },
  ],
  preview: { select: { title: "title", subtitle: "text" } },
};

export const pullQuote = {
  name: "pullQuote",
  title: "Pull Quote",
  type: "object",
  fields: [{ name: "text", title: "Text", type: "text" }],
  preview: { select: { title: "text" } },
};

export const codeBlock = {
  name: "codeBlock",
  title: "Code Block",
  type: "object",
  fields: [
    {
      name: "language",
      title: "Language",
      type: "string",
      description: "Optional, e.g. bash, json",
    },
    { name: "code", title: "Code", type: "text" },
  ],
  preview: { select: { title: "language", subtitle: "code" } },
};

export const replyAsk = {
  name: "replyAsk",
  title: "Reply Ask (Your turn)",
  type: "object",
  fields: [
    {
      name: "title",
      title: "Title",
      type: "string",
      initialValue: "Your turn",
    },
    { name: "text", title: "Text", type: "text" },
    { name: "buttonLabel", title: "Button Label", type: "string" },
  ],
  preview: { select: { title: "title", subtitle: "text" } },
};
