// ABOUTME: Sanity Studio embed route — renders the full Studio UI at /studio.
// ABOUTME: Uses next-sanity's NextStudio component for seamless integration.

"use client";

import { NextStudio } from "next-sanity/studio";
import config from "../../../sanity.config";

export default function StudioPage() {
  return <NextStudio config={config} />;
}
