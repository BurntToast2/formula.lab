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
    <main className="login-page">
      <div className="login-page__card">
        <img
          src="/setu-logo.png"
          alt="SETU"
          className="login-page__logo"
        />
        <h1 className="login-page__title">Welcome</h1>
        <p className="login-page__subtitle">
          Log in to your account to continue.
        </p>
        <form onSubmit={handleSubmit} className="login-page__form">
          <div className="login-page__field">
            <label htmlFor="email" className="login-page__label">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="login-input"
              placeholder="name@setu.ie"
            />
          </div>
          <div className="login-page__field">
            <div className="login-page__label-row">
              <label htmlFor="password" className="login-page__label">
                Password
              </label>
              <a href="/forgot-password" className="login-page__forgot">
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
              className="login-input"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="login-page__error">{error}</p>}
          <button type="submit" disabled={loading} className="login-btn">
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>
        <p className="login-page__footer">
          Don&apos;t have an account? Contact c00313383@setu.ie
        </p>
      </div>
    </main>
  );
}
