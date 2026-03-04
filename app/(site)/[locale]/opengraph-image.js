// ABOUTME: Default site-level Open Graph image for all locale root pages.
// ABOUTME: Renders a 1200x630 dark-themed editorial card with the site name and tagline.

import { ImageResponse } from "next/og";

export const alt = "The Crash Log — AI & Tech Gone Off the Rails";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

async function fetchFont(url) {
  const res = await fetch(url);
  return res.arrayBuffer();
}

export default async function SiteOgImage() {
  const [interBold, interRegular] = await Promise.all([
    fetchFont(
      "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fAZ9hiJ-Ek-_EeA.woff2"
    ),
    fetchFont(
      "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2"
    ),
  ]);

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundColor: "#0A0A0A",
        position: "relative",
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

      {/* Main content area */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          padding: "64px 80px 56px",
          justifyContent: "space-between",
        }}
      >
        {/* Top section: wordmark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "4px",
              height: "40px",
              backgroundColor: "#FF3B30",
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: "Inter",
              fontWeight: 700,
              fontSize: "20px",
              color: "#8E8E93",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            crashlog.ai
          </span>
        </div>

        {/* Center section: title and tagline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
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
              letterSpacing: "0.01em",
              lineHeight: 1.3,
            }}
          >
            AI &amp; Tech Gone Off the Rails
          </div>
        </div>

        {/* Bottom section: border line + descriptor */}
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
              fontFamily: "Inter",
              fontWeight: 400,
              fontSize: "18px",
              color: "#636366",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            A newsletter about AI and tech failures
          </div>
        </div>
      </div>
    </div>,
    {
      ...size,
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
    }
  );
}
