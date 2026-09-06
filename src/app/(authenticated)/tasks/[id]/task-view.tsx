"use client";

import { useState } from "react";
import Link from "next/link";
import type { InferSelectModel } from "drizzle-orm";

import { tasks, teams } from "@/db/schema";
import EditTaskForm from "./edit-task-form";
import { markTaskAsDone } from "@/app/actions/tasks";
import "./task-view.css";

type Task = InferSelectModel<typeof tasks>;
type Team = InferSelectModel<typeof teams>;

type User = {
    id: string;
    name: string;
    firstName: string;
    surname: string;
    email: string;
    teamId: string;
};

type Assignee = {
    id: string;
    name: string;
    firstName: string;
    surname: string;
};

function initials(a: { firstName: string; surname: string }) {
    return `${a.firstName.charAt(0)}${a.surname.charAt(0)}`.toUpperCase();
}

export default function TaskView({
    task,
    teams: allTeams,
    assignees,
    users: allUsers,
    canEdit,
    canComplete,
}: {
    task: Task;
    teams: Team[];
    assignees: Assignee[];
    users: User[];
    canEdit: boolean;
    canComplete: boolean;
}) {
    const [editing, setEditing] = useState(false);
    const [completing, setCompleting] = useState(false);
    const [completeError, setCompleteError] = useState("");

    if (editing) {
        return (
            <EditTaskForm
                task={task}
                teams={allTeams}
                assignees={assignees}
                users={allUsers}
                onCancel={() => setEditing(false)}
            />
        );
    }

    const teamName =
        allTeams.find((team) => team.id === task.teamId)?.name ?? "Unknown";

    async function handleMarkAsDone() {
        setCompleting(true);
        setCompleteError("");

        const result = await markTaskAsDone(task.id);

        if (!result.success) {
            setCompleteError(result.error ?? "Something went wrong.");
            setCompleting(false);
            return;
        }

        window.location.reload();
    }

    return (
        <div className="task-view">
            <div className="task-view__badges">
                <span className="task-view__badge task-view__badge--neutral">
                    {task.status.replace("_", " ")}
                </span>

                <span className="task-view__badge task-view__badge--priority">
                    {task.priority}
                </span>

                <span className="task-view__badge task-view__badge--team">
                    {teamName}
                </span>
            </div>

            <h1 className="task-view__title">{task.title}</h1>

            {task.description && (
                <p className="task-view__description">{task.description}</p>
            )}

            <div className="task-view__details">
                <p>
                    <strong>Team:</strong> {teamName}
                </p>
                <p>
                    <strong>Status:</strong> {task.status.replace("_", " ")}
                </p>
                <p>
                    <strong>Priority:</strong> {task.priority}
                </p>
                <p>
                    <strong>Due date:</strong>{" "}
                    {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString()
                        : "No due date"}
                </p>
            </div>

            <div className="task-view__assignees">
                <p className="task-view__section-label">Assignees</p>

                {assignees.length > 0 ? (
                    <div className="task-view__assignee-list">
                        {assignees.map((assignee) => (
                            <div key={assignee.id} className="task-view__assignee">
                                <span className="task-view__assignee-avatar">
                                    {initials(assignee)}
                                </span>
                                <span className="task-view__assignee-name">
                                    {assignee.name}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="task-view__empty">No one assigned</p>
                )}
            </div>

            {completeError && (
                <p className="task-view__error">{completeError}</p>
            )}

            <div className="task-view__actions">
                {canEdit && (
                    <button
                        type="button"
                        onClick={() => setEditing(true)}
                        className="task-view__edit-btn"
                    >
                        Edit task
                    </button>
                )}

                {canEdit || canComplete && task.status !== "completed" && task.status !== "cancelled"? (
                    <button
                        type="button"
                        onClick={handleMarkAsDone}
                        disabled={completing}
                        className="task-view__done-btn"
                    >
                        {completing ? "Marking as done..." : "Done"}
                    </button>
                ) : (
                    <Link href="/tasks" className="task-view__done-btn">
                        Back to tasks
                    </Link>
                )}
            </div>
        </div>
    );
}
