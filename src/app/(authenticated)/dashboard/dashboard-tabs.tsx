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

function isOverdue(task: Task) {
    if (!task.dueDate) return false;
    if (task.status === "completed" || task.status === "cancelled") return false;
    return new Date(task.dueDate) < new Date();
}

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
    const overdueCount = allTasks.filter(isOverdue).length;

    const visibleMyTasks = myTasks.filter((task) => task.status === activeStatus);
    const visibleTeamTasks = teamTasks.filter((task) => task.status === activeStatus);
    const activeLabel =
        STATUS_TABS.find((t) => t.value === activeStatus)?.label.toLowerCase() ??
        activeStatus;

    return (
        <>
            <div className="dashboard-page__stats">
                <div className="dashboard-page__stat">
                    <div className="dashboard-page__stat-num dashboard-page__stat-num--todo">
                        {countFor("todo")}
                    </div>
                    <div className="dashboard-page__stat-lbl">To do</div>
                </div>
                <div className="dashboard-page__stat">
                    <div className="dashboard-page__stat-num dashboard-page__stat-num--overdue">
                        {overdueCount}
                    </div>
                    <div className="dashboard-page__stat-lbl">Overdue</div>
                </div>
                <div className="dashboard-page__stat">
                    <div className="dashboard-page__stat-num dashboard-page__stat-num--progress">
                        {countFor("in_progress")}
                    </div>
                    <div className="dashboard-page__stat-lbl">In progress</div>
                </div>
                <div className="dashboard-page__stat">
                    <div className="dashboard-page__stat-num dashboard-page__stat-num--done">
                        {countFor("completed")}
                    </div>
                    <div className="dashboard-page__stat-lbl">Completed</div>
                </div>
            </div>

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

            <section className="dashboard-page__section dashboard-page__section--muted">
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
