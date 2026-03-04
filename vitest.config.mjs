// ABOUTME: Vitest configuration for unit, component, and integration tests.
// ABOUTME: Configures jsdom environment, path aliases, CSS module handling, and coverage.

import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";

// Next.js uses JSX in .js files. This plugin ensures Vite treats them as JSX.
function jsxInJsPlugin() {
  return {
    name: "jsx-in-js",
    enforce: "pre",
    async transform(code, id) {
      if (id.endsWith(".js") && !id.includes("node_modules")) {
        if (code.includes("<") && (code.includes("/>") || code.includes("</"))) {
          const { transformSync } = await import("esbuild");
          const result = transformSync(code, {
            loader: "jsx",
            jsx: "automatic",
            sourcefile: id,
          });
          return { code: result.code, map: result.map };
        }
      }
    },
  };
}

export default defineConfig({
  plugins: [jsxInJsPlugin(), react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname),
    },
  },
  test: {
    environment: "jsdom",
    include: ["__tests__/**/*.test.{js,jsx}"],
    setupFiles: ["__tests__/setup.js"],
    css: {
      modules: {
        classNameStrategy: "stable",
      },
    },
    coverage: {
      provider: "v8",
      include: ["lib/**", "components/**"],
      reporter: ["text", "text-summary"],
    },
  },
});
