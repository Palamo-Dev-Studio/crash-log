// ABOUTME: Rich text body for Practical articles: standard blocks plus the custom article blocks.
// ABOUTME: Custom blocks (steps, exhibit, callout, pullQuote, codeBlock, replyAsk) are defined in practicalBlocks.js.

import blockContent from "./blockContent";

export default {
  name: "practicalBlockContent",
  title: "Practical Block Content",
  type: "array",
  of: [
    ...blockContent.of,
    { type: "steps" },
    { type: "exhibit" },
    { type: "callout" },
    { type: "pullQuote" },
    { type: "codeBlock" },
    { type: "replyAsk" },
  ],
};
