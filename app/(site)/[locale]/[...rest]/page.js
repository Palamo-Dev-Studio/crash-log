// ABOUTME: Catch-all for unmatched URLs under a locale. Calls notFound() so the branded 404 renders inside the site layout.
// ABOUTME: Static routes and the other dynamic segments take precedence over this catch-all, so real pages are unaffected.

import { notFound } from "next/navigation";
import { NOT_FOUND_TITLE } from "@/lib/notFoundTitle";

// Known issue (pre-existing): the server response for a 404 is an empty error
// shell with status 404; the branded page appears once client JS runs.
export async function generateMetadata({ params }) {
  const { locale } = await params;
  return { title: NOT_FOUND_TITLE[locale] || NOT_FOUND_TITLE.en };
}

export default function CatchAll() {
  notFound();
}
