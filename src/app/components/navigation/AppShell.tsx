"use client";

import { useState } from "react";
import Link from "next/link";
import Sidebar from "./SideBar";
import "./AppShell.css";

export default function AppShell({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="app-shell">
            <header className="app-shell__header">
                <button
                    type="button"
                    className="app-shell__toggle"
                    onClick={() => setSidebarOpen((v) => !v)}
                    aria-label="Toggle navigation"
                    aria-expanded={sidebarOpen}
                >
                    <span className={`app-shell__toggle-bar ${sidebarOpen ? "app-shell__toggle-bar--top-open" : ""}`} />
                    <span className={`app-shell__toggle-bar ${sidebarOpen ? "app-shell__toggle-bar--mid-open" : ""}`} />
                    <span className={`app-shell__toggle-bar ${sidebarOpen ? "app-shell__toggle-bar--bottom-open" : ""}`} />
                </button>

                <div className="app-shell__brand">
                    <span className="app-shell__brand-mark" />
                    <span className="app-shell__brand-name">Formula Lab</span>
                </div>
            </header>

            {sidebarOpen && (
                <div
                    className="app-shell__backdrop"
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}

            <Sidebar open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />

            <main className="app-shell__main">{children}</main>

            <Link
                href="/tasks/new"
                className="app-shell__fab"
                aria-label="Create new task"
            >
                <svg
                    className="app-shell__fab-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
            </Link>
        </div>
    );
}
