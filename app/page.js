// ABOUTME: Root page that redirects to the locale-prefixed route.
// ABOUTME: The middleware handles locale detection, so this is a fallback.

import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/en");
}
