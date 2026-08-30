"use client";

import { useState } from "react";
import type { InferSelectModel } from "drizzle-orm";
import { tasks, teams } from "@/db/schema";
import TaskCard from "./task-card";

type Task = InferSelectModel<typeof tasks>;
type Team = InferSelectModel<typeof teams>;

type TeamWithTasks = {
    team: Team;
    isOwnTeam: boolean;
    tasks: Task[];
};

type Status = Task["status"];

const STATUS_TABS: { value: Status; label: string }[] = [
    { value: "todo", label: "To do" },
    { value: "in_progress", label: "In progress" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
];

export default function TasksTabs({
    teamsWithTasks,
}: {
    teamsWithTasks: TeamWithTasks[];
}) {
    const [activeStatus, setActiveStatus] = useState<Status>("todo");

    const allTasks = teamsWithTasks.flatMap((t) => t.tasks);
    const countFor = (status: Status) =>
        allTasks.filter((task) => task.status === status).length;

    const visibleTeams = teamsWithTasks
        .map((entry) => ({
            ...entry,
            tasks: entry.tasks.filter((task) => task.status === activeStatus),
        }))
        .filter((entry) => entry.tasks.length > 0 || entry.isOwnTeam);

    const hasAnyTasks = teamsWithTasks.some((entry) =>
        entry.tasks.some((task) => task.status === activeStatus)
    );

    return (
        <>
            <div className="tasks-page__tabs" role="tablist">
                {STATUS_TABS.map((tab) => (
                    <button
                        key={tab.value}
                        type="button"
                        role="tab"
                        aria-selected={activeStatus === tab.value}
                        onClick={() => setActiveStatus(tab.value)}
                        className={`tasks-page__tab ${
                            activeStatus === tab.value ? "tasks-page__tab--active" : ""
                        }`}
                    >
                        {tab.label}
                        <span className="tasks-page__tab-count">{countFor(tab.value)}</span>
                    </button>
                ))}
            </div>

            {!hasAnyTasks ? (
                <p className="tasks-page__empty tasks-page__empty--page">
                    No {STATUS_TABS.find((t) => t.value === activeStatus)?.label.toLowerCase()}{" "}
                    tasks.
                </p>
            ) : (
                <div className="tasks-page__teams">
                    {visibleTeams.map((entry, i) => (
                        <section
                            key={entry.team.id}
                            className="tasks-page__team"
                            style={{ animationDelay: `${i * 0.06}s` }}
                        >
                            <div className="tasks-page__team-header">
                                <h2 className="tasks-page__team-name">
                                    {entry.isOwnTeam ? "Your Team" : entry.team.name}
                                </h2>
                                {entry.isOwnTeam && (
                                    <span className="tasks-page__badge">{entry.team.name}</span>
                                )}
                            </div>

                            {entry.tasks.length === 0 ? (
                                <p className="tasks-page__empty">
                                    No {STATUS_TABS.find((t) => t.value === activeStatus)?.label.toLowerCase()}{" "}
                                    tasks.
                                </p>
                            ) : (
                                <div className="tasks-page__grid">
                                    {entry.tasks.map((task) => (
                                        <TaskCard key={task.id} task={task} />
                                    ))}
                                </div>
                            )}
                        </section>
                    ))}
                </div>
            )}
        </>
    );
}
