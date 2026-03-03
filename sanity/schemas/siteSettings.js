// ABOUTME: Site settings singleton for site-wide configuration.
// ABOUTME: Stores newsletter name, tagline, CTA copy, donate link, social links, and UI strings.

export default {
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    {
      name: "newsletterName",
      title: "Newsletter Name",
      type: "string",
      initialValue: "The Crash Log",
    },
    {
      name: "tagline",
      title: "Tagline",
      type: "localizedString",
    },
    {
      name: "editorName",
      title: "Editor Name",
      type: "string",
    },
    {
      name: "donateUrl",
      title: "Donate URL",
      type: "url",
    },
    {
      name: "socialLinks",
      title: "Social Links",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "platform", title: "Platform", type: "string" },
            { name: "url", title: "URL", type: "url" },
          ],
          preview: {
            select: { platform: "platform" },
            prepare({ platform }) {
              return { title: platform || "Untitled" };
            },
          },
        },
      ],
    },
    {
      name: "ui",
      title: "UI Strings",
      type: "object",
      fields: [
        {
          name: "subscribeCTA",
          title: "Subscribe Button",
          type: "localizedString",
        },
        {
          name: "donateButtonText",
          title: "Donate Button",
          type: "localizedString",
        },
        {
          name: "donateCTA",
          title: "Donate Copy",
          type: "localizedText",
        },
        {
          name: "contributorCredit",
          title: "Contributor Credit",
          type: "localizedString",
        },
        {
          name: "editorCredit",
          title: "Editor Credit",
          type: "localizedString",
        },
        {
          name: "latestLabel",
          title: "Latest",
          type: "localizedString",
        },
        {
          name: "archiveLabel",
          title: "Archive",
          type: "localizedString",
        },
        {
          name: "beatsLabel",
          title: "Beats",
          type: "localizedString",
        },
        {
          name: "aboutLabel",
          title: "About",
          type: "localizedString",
        },
      ],
    },
  ],
  preview: {
    prepare() {
      return { title: "Site Settings" };
    },
  },
};
