// ABOUTME: Site-wide donation slot rendered above the footer; hidden on /support, which is the donation page.
// ABOUTME: Client wrapper around DonateCTA that reads the pathname; the flag gate stays in DonateCTA.

"use client";

import { usePathname } from "next/navigation";
import DonateCTA from "./DonateCTA";

const SUPPORT_PATH = /^\/[a-z]{2}\/support\/?$/;

export default function DonatePrompt({ locale = "en" }) {
  const pathname = usePathname();

  if (SUPPORT_PATH.test(pathname || "")) {
    return null;
  }

  return <DonateCTA locale={locale} />;
}
