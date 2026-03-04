// ABOUTME: ESLint 9 flat config for The Crash Log.
// ABOUTME: Combines Next.js rules with Prettier compatibility and project-specific ignores.

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import prettier from "eslint-config-prettier/flat";

const eslintConfig = defineConfig([
  ...nextVitals,
  prettier,
  globalIgnores([
    "node_modules/**",
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    ".sanity/**",
    "playwright-report/**",
    "next-env.d.ts",
    "docs/reference/**",
  ]),
  {
    files: ["sanity/**/*.js"],
    rules: {
      "import/no-anonymous-default-export": "off",
    },
  },
  {
    files: ["__tests__/**/*.{js,jsx}"],
    rules: {
      "@next/next/no-img-element": "off",
    },
  },
]);

export default eslintConfig;
