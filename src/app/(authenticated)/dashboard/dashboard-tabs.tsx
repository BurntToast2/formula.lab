"use client";

import { useState } from "react";
import TaskCard from "@/app/(authenticated)/tasks/task-card";

type Task = {
    id: string;
    title: string;
    description: string | null;
    priority: "low" | "medium" | "high";
    status: "todo" | "in_progress" | "completed" | "cancelled";
    dueDate: Date | string | null;
};

type Status = Task["status"];

const STATUS_TABS: { value: Status; label: string }[] = [
    { value: "todo", label: "To do" },
    { value: "in_progress", label: "In progress" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
];

export default function DashboardTabs({
    myTasks,
    teamTasks,
    teamName,
}: {
    myTasks: Task[];
    teamTasks: Task[];
    teamName: string;
}) {
    const [activeStatus, setActiveStatus] = useState<Status>("todo");

    const allTasks = [...myTasks, ...teamTasks];
    const countFor = (status: Status) =>
        allTasks.filter((task) => task.status === status).length;

    const visibleMyTasks = myTasks.filter((task) => task.status === activeStatus);
    const visibleTeamTasks = teamTasks.filter((task) => task.status === activeStatus);

    const activeLabel =
        STATUS_TABS.find((t) => t.value === activeStatus)?.label.toLowerCase() ??
        activeStatus;

    return (
        <>
            <div className="dashboard-page__tabs" role="tablist">
                {STATUS_TABS.map((tab) => (
                    <button
                        key={tab.value}
                        type="button"
                        role="tab"
                        aria-selected={activeStatus === tab.value}
                        onClick={() => setActiveStatus(tab.value)}
                        className={`dashboard-page__tab ${
                            activeStatus === tab.value ? "dashboard-page__tab--active" : ""
                        }`}
                    >
                        {tab.label}
                        <span className="dashboard-page__tab-count">
                            {countFor(tab.value)}
                        </span>
                    </button>
                ))}
            </div>

            <section className="dashboard-page__section">
                <h2 className="dashboard-page__section-title">Your Tasks</h2>

                {visibleMyTasks.length === 0 ? (
                    <p className="dashboard-page__empty">No {activeLabel} tasks assigned to you.</p>
                ) : (
                    <div className="dashboard-page__grid">
                        {visibleMyTasks.map((task) => (
                            <TaskCard key={task.id} task={task} />
                        ))}
                    </div>
                )}
            </section>

            <section className="dashboard-page__section">
                <h2 className="dashboard-page__section-title">{teamName}</h2>

                {visibleTeamTasks.length === 0 ? (
                    <p className="dashboard-page__empty">No other {activeLabel} tasks on your team.</p>
                ) : (
                    <div className="dashboard-page__grid">
                        {visibleTeamTasks.map((task) => (
                            <TaskCard key={task.id} task={task} />
                        ))}
                    </div>
                )}
            </section>
        </>
    );
}
