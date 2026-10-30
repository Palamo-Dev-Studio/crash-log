// ABOUTME: ESLint 9 flat config for The Crash Log.
// ABOUTME: Combines Next.js rules with Prettier compatibility and project-specific ignores.

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import prettier from "eslint-config-prettier/flat";

// Date formatting goes through lib/formatDate.js (UTC, never a weekday).
// `toLocaleString` is deliberately NOT banned: the site uses it for numbers and currency.
const DATE_MESSAGE = "Format dates with lib/formatDate.js (UTC, no weekday)";
const dateMethodSelector = (names) => ({
  selector: `CallExpression[callee.property.name=/^(${names.join("|")})$/]`,
  message: DATE_MESSAGE,
});
const intlDateSelector = {
  selector:
    "MemberExpression[object.name='Intl'][property.name='DateTimeFormat']",
  message: DATE_MESSAGE,
};

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
    ".claude/**",
  ]),
  {
    rules: {
      "no-restricted-syntax": [
        "error",
        dateMethodSelector([
          "toLocaleDateString",
          "toLocaleTimeString",
          "toDateString",
          "toUTCString",
        ]),
        intlDateSelector,
      ],
    },
  },
  {
    // The helper itself is the one place Intl.DateTimeFormat is allowed.
    files: ["lib/formatDate.js"],
    rules: { "no-restricted-syntax": "off" },
  },
  {
    // RSS pubDate must be RFC 822, which is exactly what toUTCString emits.
    files: ["app/**/feed.xml/route.js"],
    rules: {
      "no-restricted-syntax": [
        "error",
        dateMethodSelector([
          "toLocaleDateString",
          "toLocaleTimeString",
          "toDateString",
        ]),
        intlDateSelector,
      ],
    },
  },
  {
    // Tests build weekday names from Intl to assert none ever render.
    files: ["__tests__/**/*.{js,jsx}", "e2e/**/*.js"],
    rules: { "no-restricted-syntax": "off" },
  },
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
