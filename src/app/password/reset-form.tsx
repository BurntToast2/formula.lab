"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { validatePassword, resetPassword } from "@/app/actions/invitations";
import "@/app/signup/signup-form.css";

type FieldErrors = {
    password?: string;
    confirmPassword?: string;
};

export default function ResetForm({ token }: { token: string }) {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState<FieldErrors>({});
    const [formError, setFormError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [passwordReset, setPasswordReset] = useState(false);

    async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        setFormError(null);

        const newErrors: FieldErrors = {};

        const validation = await validatePassword(password);
        console.log("validation result:", validation.success);
        if (!validation.success) {
            console.log("VALIDATION RESULT:", validation);
            const messages = validation.errors.password;
            setErrors({ password: messages?.[0] ?? "Password does not meet the requirements."});
            return;
        }

        if (password !== confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        if (!validation.success || Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        setErrors({});

        setSubmitting(true);
        const result = await resetPassword(token, password, confirmPassword);
        setSubmitting(false);

        if (!result.success) {
            setFormError(result.error);
            return;
        }

        setPasswordReset(true);
    }

    if (passwordReset) {
        return (
            <div className="signup-wrapper">
            <div className="form success-panel">
            <div className="accent-bar" />
            <div className="brand">
            <Image src="/setu-logo.png" alt="SETU" width={32} height={32} className="brand-mark" />
            <span className="eyebrow">SETU Formula Student</span>
            </div>

            <div className="success-icon">
            <CheckCircle2 size={48} strokeWidth={1.5} />
            </div>

            <h1 className="title">Password updated</h1>
            <p className="success-subtitle">
            Your password has been changed. You can now log in with your new password.
                </p>

            <Link href="/login" className="button button-link">
            Go to login
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
        <h1 className="title">Reset your password</h1>

        {formError && <p className="field-error form-error">{formError}</p>}

        <div className="field">
        <label className="label" htmlFor="password">New password</label>
        <input
        className="input"
        id="password"
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        aria-invalid={!!errors.password}
        aria-describedby={errors.password ? "password-error" : undefined}
        />
        {errors.password && (
            <p className="field-error" id="password-error">{errors.password}</p>
        )}
        </div>

        <div className="field">
        <label className="label" htmlFor="confirmPassword">Confirm password</label>
        <input
        className="input"
        id="confirmPassword"
        type="password"
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        aria-invalid={!!errors.confirmPassword}
                        aria-describedby={errors.confirmPassword ? "confirm-error" : undefined}
                    />
                    {errors.confirmPassword && (
                        <p className="field-error" id="confirm-error">{errors.confirmPassword}</p>
                    )}
                </div>

                <button className="button" type="submit" disabled={submitting}>
                    {submitting ? "Updating password..." : "Update password"}
                </button>
            </form>
        </div>
    );
}
