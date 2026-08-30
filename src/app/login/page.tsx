"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import "./page.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await authClient.signIn.email({
      email,
      password,
    });

    if (result.error) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <main className="min-h-screen bg-[var(--color-gray-light)] flex items-center justify-center p-6">
      <div className="w-full max-w-[400px] bg-[var(--color-white)] rounded-2xl p-10 shadow-[0_2px_24px_rgba(49,53,68,0.08)]">
        <img
          src="/setu-logo.png"
          alt="SETU"
          className="w-40 h-40 mx-auto mb-15"
        />

        <h1 className="m-0 mb-1 text-2xl font-semibold text-[var(--color-navy)] text-center tracking-tight">
          Welcome 
        </h1>
        <p className="m-0 mb-7 text-sm text-[var(--color-slate)] text-center">
          Log in to your account to continue.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-[13px] font-semibold text-[var(--color-slate)]"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="login-input w-full rounded-[10px] px-3.5 py-2.5 text-sm text-[var(--color-navy)] bg-[var(--color-white)]"
              placeholder="name@setu.ie"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-[13px] font-semibold text-[var(--color-slate)]"
              >
                Password
              </label>
              <a
                href="/forgot-password"
                className="text-[12.5px] font-medium text-[var(--color-teal-dark)] hover:underline"
              >
                Forgot password?
              </a>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="login-input w-full rounded-[10px] px-3.5 py-2.5 text-sm text-[var(--color-navy)] bg-[var(--color-white)]"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="m-0 text-[13px] text-[var(--color-error)]">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="login-btn w-full mt-2 py-3 text-[14.5px] font-semibold text-[var(--color-white)] border-0 rounded-[10px] cursor-pointer transition-colors"
          >
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="m-0 mt-6 text-[13px] text-[var(--color-slate)] text-center">
          Don&apos;t have an account? Contact C00313383@setu.ie{" "}
        </p>
      </div>
    </main>
  );
}
