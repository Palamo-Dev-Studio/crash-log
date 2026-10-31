// ABOUTME: Localized Practical article body (Portable Text with custom article blocks) for EN/ES.
// ABOUTME: English is required, Spanish is optional with fallback behavior.

export default {
  name: "localizedPracticalContent",
  title: "Localized Practical Content",
  type: "object",
  fields: [
    {
      name: "en",
      title: "English",
      type: "practicalBlockContent",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "es",
      title: "Español",
      type: "practicalBlockContent",
    },
  ],
};
