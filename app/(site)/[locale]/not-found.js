// ABOUTME: Branded 404 page rendered inside the site layout, with noindex robots directive.
// ABOUTME: Delegates to NotFoundContent, which resolves the locale from params when given, else from the URL.

import NotFoundContent from "@/components/NotFoundContent";
import { NOT_FOUND_TITLE } from "@/lib/notFoundTitle";

export const metadata = {
  title: NOT_FOUND_TITLE.en,
  robots: { index: false, follow: false },
};

export default function NotFound({ params }) {
  return <NotFoundContent locale={params?.locale} />;
}
