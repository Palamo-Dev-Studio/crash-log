// ABOUTME: Playwright configuration for end-to-end tests.
// ABOUTME: Auto-starts Next.js on E2E_PORT (default 3000): the dev server, or a production build with E2E_PROD=1.

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

// E2E_PROD=1 runs the suite against `next build && next start`: no on-demand
// compilation, so full runs don't time out under load the way the dev server does.
const PROD = process.env.E2E_PROD === "1";

export default defineConfig({
  testDir: "e2e",
  timeout: PROD ? 60000 : 30000,
  // Production runs are crawl-heavy: two workers keep first-wave timeouts from host load away.
  ...(PROD ? { workers: 2 } : {}),
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
    command: PROD
      ? `npm run build && npm run start -- -p ${PORT}`
      : `npm run dev -- -p ${PORT}`,
    port: PORT,
    // Under E2E_PROD a leftover dev server on the port would be silently tested instead of the build.
    reuseExistingServer: !PROD,
    timeout: PROD ? 600000 : 60000,
  },
});
