// ABOUTME: Dynamic robots.txt generator for search engine crawl directives.
// ABOUTME: Allows public pages, disallows Studio, Next.js internals, and Vercel paths.

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/studio/", "/_next/", "/.vercel/"],
      },
      {
        userAgent: "GPTBot",
        crawlDelay: 10,
      },
      {
        userAgent: "CCBot",
        crawlDelay: 10,
      },
    ],
    sitemap: "https://crashlog.ai/sitemap.xml",
  };
}
