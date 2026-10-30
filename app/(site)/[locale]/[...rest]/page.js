// ABOUTME: Catch-all for unmatched URLs under a locale. Calls notFound() so the branded 404 renders inside the site layout.
// ABOUTME: Static routes and the other dynamic segments take precedence over this catch-all, so real pages are unaffected.

import { notFound } from "next/navigation";

export default function CatchAll() {
  notFound();
}
