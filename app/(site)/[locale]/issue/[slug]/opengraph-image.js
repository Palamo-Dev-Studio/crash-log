// ABOUTME: Per-issue Open Graph image for social sharing on issue pages.
// ABOUTME: Fetches issue data from Sanity and renders a 1200x630 editorial card with issue details.

import { ImageResponse } from "next/og";
import { getIssueBySlug } from "@/lib/queries";
import { t } from "@/lib/locale";

export const alt = "The Crash Log — Issue";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

async function fetchFont(url) {
  const res = await fetch(url);
  return res.arrayBuffer();
}

function formatPublishDate(dateStr, locale) {
  if (!dateStr) return null;
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    });
  } catch {
    return null;
  }
}

export default async function IssueOgImage({ params }) {
  const { locale, slug } = await params;

  const [interBold, interRegular, issue] = await Promise.all([
    fetchFont(
      "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fAZ9hiJ-Ek-_EeA.woff2"
    ),
    fetchFont(
      "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2"
    ),
    getIssueBySlug(slug),
  ]);

  const fontConfig = {
    fonts: [
      {
        name: "Inter",
        data: interBold,
        style: "normal",
        weight: 700,
      },
      {
        name: "Inter",
        data: interRegular,
        style: "normal",
        weight: 400,
      },
    ],
  };

  // If no issue found, render a generic fallback that mirrors the site OG
  if (!issue) {
    return new ImageResponse(
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          backgroundColor: "#0A0A0A",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "8px",
            backgroundColor: "#FF3B30",
            flexShrink: 0,
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            padding: "64px 80px 56px",
            justifyContent: "center",
            gap: "24px",
          }}
        >
          <div
            style={{
              fontFamily: "Inter",
              fontWeight: 700,
              fontSize: "96px",
              color: "#FAFAFA",
              letterSpacing: "-0.03em",
              lineHeight: 1,
            }}
          >
            THE CRASH LOG
          </div>
          <div
            style={{
              fontFamily: "Inter",
              fontWeight: 400,
              fontSize: "32px",
              color: "#8E8E93",
            }}
          >
            AI &amp; Tech Gone Off the Rails
          </div>
        </div>
      </div>,
      { ...size, ...fontConfig }
    );
  }

  const issueLabel = `ISSUE #${String(issue.issueNumber).padStart(3, "0")}`;
  const title = t(issue.title, locale) || issueLabel;
  const subtitle = t(issue.subtitle, locale) || null;
  const publishDate = formatPublishDate(issue.publishDate, locale);

  // Clamp title to a reasonable display length to avoid overflow
  const displayTitle = title.length > 80 ? title.slice(0, 77) + "..." : title;
  const displaySubtitle =
    subtitle && subtitle.length > 100
      ? subtitle.slice(0, 97) + "..."
      : subtitle;

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundColor: "#0A0A0A",
      }}
    >
      {/* Red accent bar at top */}
      <div
        style={{
          width: "100%",
          height: "8px",
          backgroundColor: "#FF3B30",
          flexShrink: 0,
        }}
      />

      {/* Main content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          padding: "52px 80px 52px",
          justifyContent: "space-between",
        }}
      >
        {/* Top row: issue label + site domain */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "4px",
                height: "32px",
                backgroundColor: "#FF3B30",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: "Inter",
                fontWeight: 700,
                fontSize: "18px",
                color: "#FF3B30",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              {issueLabel}
            </span>
          </div>
          <span
            style={{
              fontFamily: "Inter",
              fontWeight: 400,
              fontSize: "18px",
              color: "#8E8E93",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            crashlog.ai
          </span>
        </div>

        {/* Center: title and optional subtitle */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <div
            style={{
              fontFamily: "Inter",
              fontWeight: 700,
              fontSize: displayTitle.length > 50 ? "56px" : "72px",
              color: "#FAFAFA",
              letterSpacing: "-0.025em",
              lineHeight: 1.05,
            }}
          >
            {displayTitle}
          </div>
          {displaySubtitle && (
            <div
              style={{
                fontFamily: "Inter",
                fontWeight: 400,
                fontSize: "26px",
                color: "#8E8E93",
                lineHeight: 1.3,
              }}
            >
              {displaySubtitle}
            </div>
          )}
        </div>

        {/* Bottom: separator + publish date + masthead */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "100%",
              height: "1px",
              backgroundColor: "#2C2C2E",
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {publishDate ? (
              <span
                style={{
                  fontFamily: "Inter",
                  fontWeight: 400,
                  fontSize: "18px",
                  color: "#636366",
                  letterSpacing: "0.02em",
                }}
              >
                {publishDate}
              </span>
            ) : (
              <span />
            )}
            <span
              style={{
                fontFamily: "Inter",
                fontWeight: 400,
                fontSize: "18px",
                color: "#636366",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              The Crash Log
            </span>
          </div>
        </div>
      </div>
    </div>,
    { ...size, ...fontConfig }
  );
}
