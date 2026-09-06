"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { validateSignUpCredentials } from "@/app/actions/invitations";
import { createAccount } from "@/app/actions/invitations";

type FieldErrors = {
    firstName?: string;
    surname?: string;
    teamName?: string;
    password?: string;
};

export default function SignUpForm({ token, email }: { token: string; email: string }) {
    const [firstName, setFirstName] = useState("");
    const [surname, setSurname] = useState("");
    const [password, setPassword] = useState("");
    const [team, setTeam] = useState("");
    const [errors, setErrors] = useState<FieldErrors>({});
    const [formError, setFormError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [accountCreated, setAccountCreated] = useState(false);

    async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        setFormError(null);

        const result = await validateSignUpCredentials(
            firstName,
            surname,
            password,
            team,
        );

        if (!result.success) {
            const newErrors: typeof errors = {};
            for (const field in result.errors) {
                const messages = result.errors[field as keyof typeof result.errors];
                if (messages?.[0]) {
                    newErrors[field as keyof typeof newErrors] = messages[0];
                }
            }
            setErrors(newErrors);
            return;
        }
        setErrors({});

        setSubmitting(true);
        const accountResult = await createAccount(token, firstName, surname, password, team);
        setSubmitting(false);

        if (!accountResult.success) {
            if ("errors" in accountResult && accountResult.errors) {
                const newErrors: typeof errors = {};
                for (const field in accountResult.errors) {
                    const messages = accountResult.errors[field as keyof typeof accountResult.errors];
                    if (messages?.[0]) {
                        newErrors[field as keyof typeof newErrors] = messages[0];
                    }
                }
                setErrors(newErrors);
            }
            if ("error" in accountResult && accountResult.error) {
                setFormError(accountResult.error);
            }
            return;
        }

        setAccountCreated(true);
    }

    if (accountCreated) {
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

                    <h1 className="title">Account created</h1>
                    <p className="success-subtitle">
                        Welcome to the {team} team, {firstName}. Your account is ready to go.
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
            <h1 className="title">Create your account</h1>

            {formError && <p className="field-error form-error">{formError}</p>}

            <div className="field-row">
                <div className="field">
                    <label className="label" htmlFor="firstName">First name</label>
                    <input
                        className="input"
                        id="firstName"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        aria-invalid={!!errors.firstName}
                        aria-describedby={errors.firstName ? "firstName-error" : undefined}
                    />
                    {errors.firstName && (
                        <p className="field-error" id="firstName-error">{errors.firstName}</p>
                    )}
                </div>
                <div className="field">
                    <label className="label" htmlFor="surname">Surname</label>
                    <input
                        className="input"
                        id="surname"
                        type="text"
                        value={surname}
                        onChange={(e) => setSurname(e.target.value)}
                        aria-invalid={!!errors.surname}
                        aria-describedby={errors.surname ? "surname-error" : undefined}
                    />
                    {errors.surname && (
                        <p className="field-error" id="surname-error">{errors.surname}</p>
                    )}
                </div>
            </div>

            <div className="field">
                <label className="label" htmlFor="team">Team</label>
                <select
                    className="input select"
                    id="team"
                    value={team}
                    onChange={(e) => setTeam(e.target.value)}
                    aria-invalid={!!errors.teamName}
                    aria-describedby={errors.teamName ? "team-error" : undefined}
                >
                    <option value="" disabled>Select a team</option>
                    <option value="Suspension">Suspension</option>
                    <option value="Chassis">Chassis</option>
                    <option value="Drivetrain">Drivetrain</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Brakes">Brakes</option>
                </select>
                {errors.teamName && <p className="field-error" id="team-error">{errors.teamName}</p>}
            </div>

            <div className="field">
                <label className="label" htmlFor="email">Email</label>
                <input
                className="input input-readonly"
                id="email"
                type="email"
                value={email}
                readOnly
                tabIndex={-1}
                />
            </div>

            <div className="field">
                <label className="label" htmlFor="password">Password</label>
                <input
                    className="input"
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? "password-error" : undefined}
                />
                {errors.password && <p className="field-error" id="password-error">{errors.password}</p>}
            </div>

            <button className="button" type="submit" disabled={submitting}>
                {submitting ? "Creating account..." : "Create account"}
            </button>
        </form>
        </div>
    );
}
