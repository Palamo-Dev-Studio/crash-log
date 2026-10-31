// ABOUTME: Mock for next/navigation used in component tests.
// ABOUTME: Provides usePathname, useRouter, and useSearchParams stubs.

import { vi } from "vitest";

let pathname = "/en";
let push = vi.fn();
let replace = vi.fn();
let searchParams = new URLSearchParams();

export function setMockPathname(p) {
  pathname = p;
}

export function getMockPush() {
  return push;
}

export function getMockReplace() {
  return replace;
}

export function setMockSearchParams(params) {
  searchParams = new URLSearchParams(params);
}

export function resetMocks() {
  pathname = "/en";
  push = vi.fn();
  replace = vi.fn();
  searchParams = new URLSearchParams();
}

export const usePathname = () => pathname;
export const useRouter = () => ({ push, replace, back: vi.fn() });
export const useSearchParams = () => searchParams;
