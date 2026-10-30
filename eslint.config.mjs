// ABOUTME: ESLint 9 flat config for The Crash Log.
// ABOUTME: Combines Next.js rules with Prettier compatibility and project-specific ignores.

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import prettier from "eslint-config-prettier/flat";

// Date formatting goes through lib/formatDate.js (UTC, never a weekday).
// `toLocaleString` is reserved for number and currency formatting, so it is only
// banned when its options ask for date or time parts.
// Accepted residual risk: string coercion (`${date}`, `date.toString()`) is not caught.
const DATE_MESSAGE = "Format dates with lib/formatDate.js (UTC, no weekday)";
const DATE_METHODS = [
  "toLocaleDateString",
  "toLocaleTimeString",
  "toDateString",
  "toUTCString",
];
// Selectors match member access (not just calls) so `f = d.toLocaleDateString`,
// `d["toLocaleDateString"]` and destructured/aliased Intl cannot dodge the rule.
const dateSelectors = (methods) =>
  [
    `MemberExpression[property.name=/^(${methods.join("|")})$/]`,
    `MemberExpression[computed=true][property.value=/^(${[...methods, "DateTimeFormat"].join("|")})$/]`,
    'MemberExpression[property.name="DateTimeFormat"]',
    'VariableDeclarator[init.name="Intl"] Property[key.name="DateTimeFormat"]',
    'VariableDeclarator[init.property.name="Intl"] Property[key.name="DateTimeFormat"]',
    'CallExpression[callee.property.name="toLocaleString"] ObjectExpression > Property[key.name=/^(weekday|dateStyle|timeStyle)$/]',
  ].map((selector) => ({ selector, message: DATE_MESSAGE }));

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
      "no-restricted-syntax": ["error", ...dateSelectors(DATE_METHODS)],
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
        ...dateSelectors(DATE_METHODS.filter((m) => m !== "toUTCString")),
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
