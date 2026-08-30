"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import "./Sidebar.css";

const NAV_ITEMS = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/tasks", label: "Tasks" },
    { href: "/members", label: "Members"},
    { href: "/invitations", label: "Invitations"},
];

export default function Sidebar({
    open,
    onNavigate,
}: {
    open: boolean;
    onNavigate?: () => void;
}) {
    const pathname = usePathname();

    return (
        <aside className={`sidebar ${open ? "sidebar--open" : ""}`}>
            <nav className="sidebar__nav">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onNavigate}
                            className={`sidebar__link ${isActive ? "sidebar__link--active" : ""}`}
                        >
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
            <button
              className="sidebar__signout"
              onClick={async () => {
                await authClient.signOut({
                  fetchOptions: {
                    onSuccess: () => {
                      window.location.href = "/login";
                    },
                  },
                });
              }}
            >
              Sign Out
            </button>
        </aside>
    );
}
