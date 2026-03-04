// ABOUTME: Mock for next/navigation used in component tests.
// ABOUTME: Provides usePathname and useRouter stubs.

import { vi } from "vitest";

let pathname = "/en";
let push = vi.fn();

export function setMockPathname(p) {
  pathname = p;
}

export function getMockPush() {
  return push;
}

export function resetMocks() {
  pathname = "/en";
  push = vi.fn();
}

export const usePathname = () => pathname;
export const useRouter = () => ({ push, replace: vi.fn(), back: vi.fn() });
