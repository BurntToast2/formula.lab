"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { createResetLink } from "../../actions/invitations";

export default function ForgotForm({ notice }: { notice?: string }) {
    const [email, setEmail] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [sent, setSent] = useState(false);

    async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);

        if (!email.trim()) {
            setError("Enter your email address");
            return;
        }

        setSubmitting(true);
        const result = await createResetLink(email);
        setSubmitting(false);

        if (!result.success) {
            setError(result.error);
            return;
        }

        setSent(true);
    }

    if (sent) {
        return (
            <div className="signup-wrapper">
                <div className="form success-panel">
                    <div className="accent-bar" />
                    <div className="brand">
                        <Image src="/setu-logo.png" alt="SETU" width={32} height={32} className="brand-mark" />
                        <span className="eyebrow">SETU Formula Student</span>
                    </div>

                    <div className="success-icon">
                        <MailCheck size={48} strokeWidth={1.5} />
                    </div>

                    <h1 className="title">Check your email</h1>
                    <p className="success-subtitle">
                        If that email is registered, we&apos;ve sent a link to reset your password.
                        It expires in 30 minutes.
                    </p>

                    <Link href="/login" className="button button-link">
                        Back to login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="signup-wrapper">
            <form className="form" onSubmit={handleSubmit} noValidate>
                <div className="accent-bar" />
                <div className="brand">
                    <Image src="/setu-logo.png" alt="SETU" width={32} height={32} className="brand-mark" />
                    <span className="eyebrow">SETU Formula Student</span>
                </div>
                <h1 className="title">Forgot your password?</h1>
                <p className="success-subtitle">
                    Enter your email and we&apos;ll send you a link to reset it.
                </p>

                {notice && <p className="field-error form-error">{notice}</p>}
                {error && <p className="field-error form-error">{error}</p>}

                <div className="field">
                    <label className="label" htmlFor="email">Email</label>
                    <input
                        className="input"
                        id="email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        aria-invalid={!!error}
                        aria-describedby={error ? "email-error" : undefined}
                    />
                </div>

                <button className="button" type="submit" disabled={submitting}>
                    {submitting ? "Sending link..." : "Send reset link"}
                </button>

                <Link href="/login" className="eyebrow">Back to login</Link>
            </form>
        </div>
    );
}
