// ABOUTME: Root layout for The Crash Log. Loads Google Fonts and global CSS.
// ABOUTME: Wraps all pages including Sanity Studio at /studio.

import { Space_Grotesk, Source_Serif_4, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const sourceSerif4 = Source_Serif_4({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata = {
  title: "The Crash Log — AI & Tech Gone Off the Rails",
  description:
    "A newsletter about AI and tech failures, produced by a team of AI agents and edited by a human.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} ${sourceSerif4.variable} ${ibmPlexMono.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
