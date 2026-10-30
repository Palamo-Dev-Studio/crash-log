// ABOUTME: ESLint 9 flat config for The Crash Log.
// ABOUTME: Combines Next.js rules with Prettier compatibility and project-specific ignores.

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import prettier from "eslint-config-prettier/flat";

// Date formatting goes through lib/formatDate.js (UTC, never a weekday).
// `toLocaleString` is banned outright because it formats dates too; number and
// currency formatting should use `Intl.NumberFormat`, which is not banned.
//
// The real guarantee is lib/formatDate.js and its tests. This lint stops habit,
// not intent. Accepted residual risk (deliberately NOT caught; do not re-raise):
//   - `Reflect.get(d, "toLocaleDateString")` and other reflective lookups
//   - keys computed at runtime or built by concatenation (`d[k]`, `d["toLocale" + "DateString"]`)
//   - options objects passed in variables (`Intl` options are never inspected)
//   - string coercion (`${date}`, `String(date)`, `date.toString()`)
//   - any other indirection that never names a banned member or key literally
//     (`const I = Intl; new I.DateTimeFormat()` IS caught by the member selector)
const DATE_MESSAGE = "Format dates with lib/formatDate.js (UTC, no weekday)";
const DATE_METHODS = [
  "toLocaleDateString",
  "toLocaleTimeString",
  "toLocaleString",
  "toDateString",
  "toUTCString",
];
// Selectors match member access (not just calls) so `f = d.toLocaleDateString`,
// `d["toLocaleDateString"]`, d[`toLocaleDateString`] and destructured/aliased
// Intl cannot dodge the rule.
const dateSelectors = (methods) => {
  const banned = `^(${[...methods, "DateTimeFormat"].join("|")})$`;
  return [
    `MemberExpression[property.name=/^(${methods.join("|")})$/]`,
    `MemberExpression[computed=true][property.value=/${banned}/]`,
    `MemberExpression[computed=true] > TemplateLiteral.property[expressions.length=0][quasis.0.value.cooked=/${banned}/]`,
    'MemberExpression[property.name="DateTimeFormat"]',
    `ObjectPattern > Property[key.name=/${banned}/]`,
  ].map((selector) => ({ selector, message: DATE_MESSAGE }));
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
