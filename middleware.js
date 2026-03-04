// ABOUTME: Locale detection middleware for EN/ES routing.
// ABOUTME: Checks cookie, then Accept-Language header, then defaults to English.

import { NextResponse } from "next/server";

const LOCALES = ["en", "es"];
const DEFAULT_LOCALE = "en";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Skip static files, API routes, Sanity Studio
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/studio") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Already has locale prefix
  const pathnameHasLocale = LOCALES.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
  if (pathnameHasLocale) return NextResponse.next();

  // Cookie override (set by language toggle) > Accept-Language > default
  const cookieLocale = request.cookies.get("CRASH_LOG_LOCALE")?.value;
  const acceptLang = request.headers.get("accept-language") || "";
  const detectedLocale = acceptLang.includes("es") ? "es" : DEFAULT_LOCALE;

  const locale =
    cookieLocale && LOCALES.includes(cookieLocale)
      ? cookieLocale
      : detectedLocale;

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|api|studio|favicon.ico).*)"],
};
