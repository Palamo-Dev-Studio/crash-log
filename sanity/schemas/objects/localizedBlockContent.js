// ABOUTME: Reusable localized rich text (Portable Text) type for EN/ES bilingual fields.
// ABOUTME: English is required, Spanish is optional with fallback behavior.

export default {
  name: "localizedBlockContent",
  title: "Localized Block Content",
  type: "object",
  fields: [
    {
      name: "en",
      title: "English",
      type: "blockContent",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "es",
      title: "Español",
      type: "blockContent",
    },
  ],
};
