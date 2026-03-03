// ABOUTME: Locale-scoped layout that validates the locale parameter.
// ABOUTME: Wraps all locale-prefixed pages (/en/*, /es/*).

import { notFound } from "next/navigation";

const LOCALES = ["en", "es"];

export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;
  if (!LOCALES.includes(locale)) notFound();

  return <div className="wrapper">{children}</div>;
}
