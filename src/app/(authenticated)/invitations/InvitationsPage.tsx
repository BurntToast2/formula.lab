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
    <main className="min-h-screen bg-[var(--color-gray-light)] flex items-center justify-center p-6">
      <div className="w-full max-w-[480px] bg-[var(--color-white)] rounded-2xl p-10 shadow-[0_2px_24px_rgba(49,53,68,0.08)]">
        <div className="flex items-center gap-2.5 mb-2">
          <h1 className="m-0 text-2xl font-semibold text-[var(--color-navy)] tracking-tight">
            Send invitations
          </h1>
          {emails.length > 0 && (
            <span className="bg-[var(--color-yellow)] text-[#5b4a16] text-xs font-bold rounded-full px-2.5 py-0.5 leading-[18px]">
              {emails.length}
            </span>
          )}
        </div>
        <p className="m-0 mb-7 text-sm text-[var(--color-slate)] leading-relaxed">
          Add one or more email addresses, then send their invitations.
        </p>

        <label className="block text-[13px] font-semibold text-[var(--color-slate)] mb-2">
          Email addresses
        </label>

        <div
          onClick={() => inputRef.current?.focus()}
          className={`flex flex-wrap gap-2 p-2.5 min-h-[48px] bg-[var(--color-white)] border-[1.5px] rounded-[10px] cursor-text transition-colors ${
            invalidDraft ? "border-[var(--color-error)]" : "border-[var(--color-gray)]"
          }`}
        >
          {emails.map((email) => (
            <span
              key={email}
              className="flex items-center gap-1.5 bg-[var(--color-chip-bg)] text-[var(--color-teal-dark)] text-[13px] font-medium rounded-md pl-2.5 pr-1.5 py-1"
            >
              {email}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeEmail(email);
                }}
                aria-label={`Remove ${email}`}
                className="invite-chip-remove border-0 bg-transparent cursor-pointer text-[15px] leading-none px-0.5"
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
            className="flex-1 min-w-[160px] border-0 outline-none text-sm px-1 py-1.5 bg-transparent text-[var(--color-navy)]"
          />
        </div>

        {invalidDraft && (
          <p className="mt-2 text-[12.5px] text-[var(--color-error)]">
            Enter a valid email address, then press Enter.
          </p>
        )}

        {status === "error" && (
          <p className="mt-3 text-[13px] text-[var(--color-error)]">{errorMessage}</p>
        )}
        {status === "success" && (
          <p className="mt-3 text-[13px] text-[var(--color-teal-dark)]">
            Invitations sent.
          </p>
        )}

        <button
          type="button"
          onClick={handleSend}
          disabled={status === "sending"}
          className="invite-send-btn w-full mt-6 py-3.5 text-[14.5px] font-semibold text-[var(--color-white)] border-0 rounded-[10px] cursor-pointer transition-colors"
        >
          {status === "sending"
            ? "Sending…"
            : `Send invitation${emails.length !== 1 ? "s" : ""}`}
        </button>
      </div>
    </main>
  );
}
