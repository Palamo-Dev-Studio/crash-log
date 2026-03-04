// ABOUTME: Vitest global setup file.
// ABOUTME: Registers jest-dom matchers and automatic DOM cleanup between tests.

import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});
