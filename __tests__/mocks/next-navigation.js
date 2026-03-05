// ABOUTME: Mock for next/navigation used in component tests.
// ABOUTME: Provides usePathname, useRouter, and useSearchParams stubs.

import { vi } from "vitest";

let pathname = "/en";
let push = vi.fn();
let searchParams = new URLSearchParams();

export function setMockPathname(p) {
  pathname = p;
}

export function getMockPush() {
  return push;
}

export function setMockSearchParams(params) {
  searchParams = new URLSearchParams(params);
}

export function resetMocks() {
  pathname = "/en";
  push = vi.fn();
  searchParams = new URLSearchParams();
}

export const usePathname = () => pathname;
export const useRouter = () => ({ push, replace: vi.fn(), back: vi.fn() });
export const useSearchParams = () => searchParams;
