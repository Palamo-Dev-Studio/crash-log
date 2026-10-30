// ABOUTME: Playwright configuration for end-to-end tests.
// ABOUTME: Uses webServer to auto-start the Next.js dev server on E2E_PORT (default 3000).

import { defineConfig } from "@playwright/test";

// reuseExistingServer attaches to whatever already listens on this port, so a
// second checkout (e.g. an agent worktree) must pick its own E2E_PORT or it
// will silently test the other checkout's code.
const rawPort = process.env.E2E_PORT;
const PORT = rawPort === undefined ? 3000 : Number(rawPort);
if (!Number.isInteger(PORT) || PORT < 1024 || PORT > 65535) {
  throw new Error(
    `E2E_PORT must be an integer from 1024 to 65535, got "${rawPort}"`
  );
}

export default defineConfig({
  testDir: "e2e",
  timeout: 30000,
  retries: 0,
  use: {
    baseURL: `http://localhost:${PORT}`,
    headless: true,
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
  webServer: {
    command: `npm run dev -- -p ${PORT}`,
    port: PORT,
    reuseExistingServer: true,
    timeout: 60000,
  },
});
