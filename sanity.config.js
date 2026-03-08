// ABOUTME: Sanity Studio configuration for The Crash Log.
// ABOUTME: Defines project settings and registers all content schemas.

"use client";

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";

// Object types
import blockContent from "./sanity/schemas/objects/blockContent";
import localizedString from "./sanity/schemas/objects/localizedString";
import localizedText from "./sanity/schemas/objects/localizedText";
import localizedBlockContent from "./sanity/schemas/objects/localizedBlockContent";
import stackTraceHit from "./sanity/schemas/objects/stackTraceHit";
import sourceLink from "./sanity/schemas/objects/sourceLink";

// Document types
import issue from "./sanity/schemas/issue";
import story from "./sanity/schemas/story";
import category from "./sanity/schemas/category";
import agent from "./sanity/schemas/agent";
import aboutPage from "./sanity/schemas/aboutPage";
import siteSettings from "./sanity/schemas/siteSettings";
import column from "./sanity/schemas/column";

// Actions
import { SendNewsletterAction } from "./sanity/actions/sendNewsletterAction.jsx";
import { SendColumnNewsletterAction } from "./sanity/actions/sendColumnNewsletterAction.jsx";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export default defineConfig({
  name: "the-crash-log",
  title: "The Crash Log",
  projectId,
  dataset,
  basePath: "/studio",
  plugins: [structureTool(), visionTool()],
  document: {
    actions: (prev, context) => {
      if (context.schemaType === "issue") {
        return [...prev, SendNewsletterAction];
      }
      if (context.schemaType === "column") {
        return [...prev, SendColumnNewsletterAction];
      }
      return prev;
    },
  },
  schema: {
    types: [
      // Objects
      blockContent,
      localizedString,
      localizedText,
      localizedBlockContent,
      stackTraceHit,
      sourceLink,
      // Documents
      issue,
      story,
      category,
      agent,
      aboutPage,
      siteSettings,
      column,
    ],
  },
});
