// ABOUTME: Unit tests for the SendColumnNewsletterAction Sanity Studio document action.
// ABOUTME: Validates disabled states, label changes, and type filtering.

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { render, screen } from "@testing-library/react";

const mockPatch = { execute: vi.fn(), disabled: false };

vi.mock("sanity", () => ({
  useDocumentOperation: vi.fn(() => ({ patch: mockPatch })),
}));

import { SendColumnNewsletterAction } from "@/sanity/actions/sendColumnNewsletterAction";

beforeEach(() => {
  mockPatch.execute.mockReset();
});

function callAction(props) {
  const { result } = renderHook(() =>
    SendColumnNewsletterAction({
      id: "column-001",
      type: "column",
      published: {
        _id: "column-001",
        columnNumber: 1,
        slug: { current: "2026-03-07" },
        status: "published",
        beehiivStatus: "not_sent",
        ...props?.published,
      },
      draft: props?.draft || null,
      ...props,
    })
  );
  return result;
}

describe("SendColumnNewsletterAction", () => {
  it("returns null for non-column types", () => {
    const { result } = renderHook(() =>
      SendColumnNewsletterAction({
        id: "issue-001",
        type: "issue",
        published: {},
        draft: null,
      })
    );
    expect(result.current).toBeNull();
  });

  it('shows "Send Column Newsletter" label for unsent columns', () => {
    const result = callAction();
    expect(result.current.label).toBe("Send Column Newsletter");
  });

  it('shows "Newsletter Queued" label when status is queued', () => {
    const result = callAction({
      published: { beehiivStatus: "queued" },
    });
    expect(result.current.label).toBe("Newsletter Queued");
  });

  it('shows "Newsletter Sent" label when status is sent', () => {
    const result = callAction({
      published: { beehiivStatus: "sent" },
    });
    expect(result.current.label).toBe("Newsletter Sent");
  });

  it("is disabled when beehiivStatus is queued", () => {
    const result = callAction({
      published: { beehiivStatus: "queued" },
    });
    expect(result.current.disabled).toBe(true);
  });

  it("is disabled when beehiivStatus is sent", () => {
    const result = callAction({
      published: { beehiivStatus: "sent" },
    });
    expect(result.current.disabled).toBe(true);
  });

  it("is disabled when column is not published", () => {
    const result = callAction({
      published: { status: "draft" },
    });
    expect(result.current.disabled).toBe(true);
  });

  it("is disabled when slug is missing", () => {
    const result = callAction({
      published: { slug: null },
    });
    expect(result.current.disabled).toBe(true);
  });

  it("is enabled for published column with not_sent status and slug", () => {
    const result = callAction();
    expect(result.current.disabled).toBe(false);
  });

  it("uses draft data when available", () => {
    const result = callAction({
      draft: {
        _id: "drafts.column-001",
        columnNumber: 1,
        slug: { current: "2026-03-07" },
        status: "published",
        beehiivStatus: "queued",
      },
    });
    expect(result.current.label).toBe("Newsletter Queued");
    expect(result.current.disabled).toBe(true);
  });

  it("opens confirm dialog on handle", () => {
    const result = callAction();
    expect(result.current.dialog).toBeFalsy();

    act(() => {
      result.current.onHandle();
    });

    expect(result.current.dialog).toBeTruthy();
    expect(result.current.dialog.header).toBe("Send Column Newsletter");
  });

  it("warns in confirm dialog when beehiivPostIds already exist", () => {
    const result = callAction({
      published: {
        beehiivStatus: "not_sent",
        beehiivPostIds: { en: "existing-post-id" },
      },
    });

    act(() => {
      result.current.onHandle();
    });

    expect(result.current.dialog).toBeTruthy();
    expect(result.current.dialog.header).toBe("Send Column Newsletter");

    render(result.current.dialog.content);
    expect(
      screen.getByText(/Warning: Beehiiv drafts were already created/)
    ).toBeTruthy();
    expect(screen.getByText(/existing-post-id/)).toBeTruthy();
  });
});
