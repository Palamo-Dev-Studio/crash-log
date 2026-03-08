// ABOUTME: Custom Sanity Studio document action for sending column newsletters via Beehiiv.
// ABOUTME: Creates draft post(s) in Beehiiv and patches beehiivStatus on the column.

import { useState } from "react";
import { useDocumentOperation } from "sanity";

export function SendColumnNewsletterAction({ id, type, published, draft }) {
  const doc = draft || published;
  const { patch } = useDocumentOperation(id, type);
  const [isSending, setIsSending] = useState(false);
  const [dialogContent, setDialogContent] = useState(null);

  if (type !== "column") return null;

  const beehiivStatus = doc?.beehiivStatus;
  const beehiivPostIds = doc?.beehiivPostIds;
  const columnStatus = doc?.status;
  const slug = doc?.slug?.current;
  const columnNumber = doc?.columnNumber;
  const num = columnNumber ? String(columnNumber).padStart(3, "0") : "???";
  const alreadyHasPostIds = Boolean(beehiivPostIds?.en);

  const isDisabled =
    isSending ||
    beehiivStatus === "queued" ||
    beehiivStatus === "sent" ||
    columnStatus !== "published" ||
    !slug;

  let label = "Send Column Newsletter";
  if (isSending) label = "Sending\u2026";
  else if (beehiivStatus === "queued") label = "Newsletter Queued";
  else if (beehiivStatus === "sent") label = "Newsletter Sent";

  let disabledReason = null;
  if (!slug) disabledReason = "Column must have a slug";
  else if (columnStatus !== "published")
    disabledReason = "Column must be published first";
  else if (beehiivStatus === "queued" || beehiivStatus === "sent")
    disabledReason = "Newsletter already processed";

  return {
    label,
    disabled: isDisabled,
    title: disabledReason,
    onHandle: () => {
      const warning = alreadyHasPostIds
        ? `\n\nWarning: Beehiiv drafts were already created (EN: ${beehiivPostIds.en}). This will create new drafts.`
        : "";
      setDialogContent({
        type: "confirm",
        message: `Create Beehiiv draft(s) for column #${num}?${warning}`,
      });
    },
    dialog: dialogContent && {
      type: "dialog",
      onClose: () => setDialogContent(null),
      header:
        dialogContent.type === "confirm" ? "Send Column Newsletter" : "Result",
      content:
        dialogContent.type === "confirm" ? (
          <ConfirmDialog
            message={dialogContent.message}
            onConfirm={async () => {
              setIsSending(true);
              setDialogContent(null);

              try {
                const response = await fetch("/api/send-column-newsletter", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_SEND_NEWSLETTER_SECRET || ""}`,
                  },
                  body: JSON.stringify({ slug }),
                });

                if (!response.ok) {
                  const text = await response.text().catch(() => "");
                  setDialogContent({
                    type: "result",
                    message: `Server error: ${response.status} ${text}`,
                  });
                  return;
                }

                const data = await response.json();

                if (data.success) {
                  const postIds = { en: data.en?.id || "" };
                  if (data.es?.id) postIds.es = data.es.id;
                  patch.execute([
                    {
                      set: {
                        beehiivStatus: "queued",
                        beehiivPostIds: postIds,
                      },
                    },
                  ]);

                  let message = `EN draft created (ID: ${data.en?.id})`;
                  if (data.es) {
                    message += `\nES draft created (ID: ${data.es.id})`;
                  } else if (data.esError) {
                    message += `\nES draft failed: ${data.esError}`;
                  }

                  setDialogContent({ type: "result", message });
                } else {
                  setDialogContent({
                    type: "result",
                    message: `Failed: ${data.error}`,
                  });
                }
              } catch (err) {
                setDialogContent({
                  type: "result",
                  message: `Network error: ${err.message}`,
                });
              } finally {
                setIsSending(false);
              }
            }}
            onCancel={() => setDialogContent(null)}
          />
        ) : (
          <ResultDialog message={dialogContent.message} />
        ),
    },
  };
}

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div style={{ padding: "16px" }}>
      <p style={{ marginBottom: "16px" }}>{message}</p>
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={onConfirm}
          style={{
            padding: "8px 16px",
            background: "#e8453e",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Create Drafts
        </button>
        <button
          onClick={onCancel}
          style={{
            padding: "8px 16px",
            background: "transparent",
            color: "#999",
            border: "1px solid #444",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function ResultDialog({ message }) {
  return (
    <div style={{ padding: "16px" }}>
      <p style={{ whiteSpace: "pre-line" }}>{message}</p>
    </div>
  );
}
