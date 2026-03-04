// ABOUTME: Root layout for Sanity Studio. Minimal shell with noindex.
// ABOUTME: Separate route group so Studio gets its own <html> tag.

export const metadata = {
  title: "Studio — The Crash Log",
  robots: { index: false, follow: false },
};

export default function StudioLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
