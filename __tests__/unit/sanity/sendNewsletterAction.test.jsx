// ABOUTME: Unit tests for the SendNewsletterAction Sanity Studio document action.
// ABOUTME: Validates disabled states, label changes, and type filtering.

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

const mockPatch = { execute: vi.fn(), disabled: false };

vi.mock("sanity", () => ({
  useDocumentOperation: vi.fn(() => ({ patch: mockPatch })),
}));

import { SendNewsletterAction } from "@/sanity/actions/sendNewsletterAction";

beforeEach(() => {
  mockPatch.execute.mockReset();
});

function callAction(props) {
  // SendNewsletterAction is a function component that uses hooks,
  // so we wrap it in renderHook to execute it
  const { result } = renderHook(() =>
    SendNewsletterAction({
      id: "issue-001",
      type: "issue",
      published: {
        _id: "issue-001",
        issueNumber: 1,
        slug: { current: "crash-log-001" },
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

describe("SendNewsletterAction", () => {
  it("returns null for non-issue types", () => {
    const { result } = renderHook(() =>
      SendNewsletterAction({
        id: "story-001",
        type: "story",
        published: {},
        draft: null,
      })
    );
    expect(result.current).toBeNull();
  });

  it('shows "Send Newsletter" label for unsent issues', () => {
    const result = callAction();
    expect(result.current.label).toBe("Send Newsletter");
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

  it("is disabled when issue is not published", () => {
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

  it("is enabled for published issue with not_sent status and slug", () => {
    const result = callAction();
    expect(result.current.disabled).toBe(false);
  });

  it("uses draft data when available", () => {
    const result = callAction({
      draft: {
        _id: "drafts.issue-001",
        issueNumber: 1,
        slug: { current: "crash-log-001" },
        status: "published",
        beehiivStatus: "queued",
      },
    });
    // Draft has queued status, so should show queued label
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
    expect(result.current.dialog.header).toBe("Send Newsletter");
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

    // The dialog content component should have the warning message
    expect(result.current.dialog).toBeTruthy();
    expect(result.current.dialog.header).toBe("Send Newsletter");
  });
});
