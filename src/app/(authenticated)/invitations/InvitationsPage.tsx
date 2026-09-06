"use client";

import { useState, useRef, KeyboardEvent, ClipboardEvent } from "react";
import { createInvitation } from "@/app/actions/invitations";
import "./InvitationsPage.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Status = "idle" | "sending" | "success" | "error";

export default function InvitationsPage() {
  const [emails, setEmails] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [invalidDraft, setInvalidDraft] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function addEmail(raw: string) {
    const value = raw.trim().replace(/,$/, "");
    if (!value) return;

    if (!EMAIL_RE.test(value)) {
      setInvalidDraft(true);
      return;
    }
    if (emails.includes(value)) {
      setDraft("");
      setInvalidDraft(false);
      return;
    }

    setEmails((prev) => [...prev, value]);
    setDraft("");
    setInvalidDraft(false);
  }

  function removeEmail(target: string) {
    setEmails((prev) => prev.filter((e) => e !== target));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === "," || e.key === "Tab") {
      if (draft.trim()) {
        e.preventDefault();
        addEmail(draft);
      }
    } else if (e.key === "Backspace" && !draft && emails.length > 0) {
      setEmails((prev) => prev.slice(0, -1));
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    const text = e.clipboardData.getData("text");
    if (text.includes(",") || text.includes("\n") || text.includes(" ")) {
      e.preventDefault();
      const parts = text.split(/[\s,]+/).filter(Boolean);
      parts.forEach(addEmail);
    }
  }

  async function handleSend() {
    if (draft.trim()) addEmail(draft);

    if (emails.length === 0) {
      setInvalidDraft(true);
      inputRef.current?.focus();
      return;
    }

    setStatus("sending");
    setErrorMessage("");

    const results = await Promise.allSettled(
      emails.map((email) => createInvitation(email))
    );

    const failed = emails.filter((_, i) => results[i].status === "rejected");

    if (failed.length === 0) {
      setStatus("success");
      setEmails([]);
    } else {
      setStatus("error");
      setEmails(failed);
      const firstError = results.find((r) => r.status === "rejected") as
        | PromiseRejectedResult
        | undefined;
      const reason = firstError?.reason;
      const detail = reason instanceof Error ? reason.message : String(reason ?? "");
      setErrorMessage(
        failed.length === emails.length
          ? `Couldn't send any invitations.${detail ? ` ${detail}` : ""}`
          : `Sent ${emails.length - failed.length} of ${emails.length}. ${failed.length} failed — check the address${failed.length !== 1 ? "es" : ""} below.`
      );
    }
  }

  return (
    <main className="invite-page">
      <div className="invite-page__card">
        <div className="invite-page__heading-row">
          <h1 className="invite-page__title">Send invitations</h1>
          {emails.length > 0 && (
            <span className="invite-page__count">{emails.length}</span>
          )}
        </div>
        <p className="invite-page__subtitle">
          Add one or more email addresses, then send their invitations.
        </p>

        <label className="invite-page__label">Email addresses</label>

        <div
          onClick={() => inputRef.current?.focus()}
          className={`invite-page__input-box ${
            invalidDraft ? "invite-page__input-box--error" : ""
          }`}
        >
          {emails.map((email) => (
            <span key={email} className="invite-chip">
              {email}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeEmail(email);
                }}
                aria-label={`Remove ${email}`}
                className="invite-chip-remove"
              >
                ×
              </button>
            </span>
          ))}
          <input
            ref={inputRef}
            type="text"
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              if (invalidDraft) setInvalidDraft(false);
            }}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onBlur={() => draft.trim() && addEmail(draft)}
            placeholder={emails.length === 0 ? "name@company.com" : ""}
            className="invite-page__input"
          />
        </div>

        {invalidDraft && (
          <p className="invite-page__error">
            Enter a valid email address, then press Enter.
          </p>
        )}

        {status === "error" && (
          <p className="invite-page__error">{errorMessage}</p>
        )}
        {status === "success" && (
          <p className="invite-page__success">Invitations sent.</p>
        )}

        <button
          type="button"
          onClick={handleSend}
          disabled={status === "sending"}
          className="invite-send-btn"
        >
          {status === "sending"
            ? "Sending…"
            : `Send invitation${emails.length !== 1 ? "s" : ""}`}
        </button>
      </div>
    </main>
  );
}
