"use client";

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { updateTask, deleteTask } from "@/app/actions/tasks";
import "./edit-task-form.css";

type Task = {
    id: string;
    title: string;
    description: string | null;
    teamId: string;
    status: "todo" | "in_progress" | "completed" | "cancelled";
    priority: "low" | "medium" | "high";
    dueDate: Date | null;
};

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

type Team = {
    id: string;
    name: string;
};

function toDateInputValue(date: Date | null) {
    return date ? new Date(date).toISOString().split("T")[0] : "";
}

function initials(a: { firstName: string; surname: string }) {
    return `${a.firstName.charAt(0)}${a.surname.charAt(0)}`.toUpperCase();
}

export default function EditTaskForm({
    task,
    teams,
    assignees,
    users: allUsers,
    onCancel,
    onDeleted,
}: {
    task: Task;
    teams: Team[];
    assignees: Assignee[];
    users: User[];
    onCancel: () => void;
    onDeleted?: () => void;
}) {
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description ?? "");
    const [teamId, setTeamId] = useState(task.teamId);
    const [status, setStatus] = useState(task.status);
    const [priority, setPriority] = useState(task.priority);
    const [dueDate, setDueDate] = useState(toDateInputValue(task.dueDate));

    const [selectedAssignees, setSelectedAssignees] = useState<Assignee[]>(
        assignees
    );
    const [query, setQuery] = useState("");
    const [showResults, setShowResults] = useState(false);
    const searchWrapRef = useRef<HTMLDivElement>(null);

    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    const selectedIds = useMemo(
        () => new Set(selectedAssignees.map((a) => a.id)),
        [selectedAssignees]
    );

    const filteredUsers = useMemo(() => {
        if (!query.trim()) return [];

        const q = query.toLowerCase();

        return allUsers
            .filter((user) => !selectedIds.has(user.id))
            .filter(
                (user) =>
                    user.name.toLowerCase().includes(q) ||
                    user.email.toLowerCase().includes(q)
            )
            .slice(0, 6);
    }, [allUsers, query, selectedIds]);

    function addAssignee(user: User) {
        setSelectedAssignees((current) => [
            ...current,
            {
                id: user.id,
                name: user.name,
                firstName: user.firstName,
                surname: user.surname,
            },
        ]);
        setQuery("");
        setShowResults(false);
    }

    function removeAssignee(userId: string) {
        setSelectedAssignees((current) =>
            current.filter((a) => a.id !== userId)
        );
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        setSaving(true);
        setError("");

        const result = await updateTask({
            taskId: task.id,
            title,
            description,
            teamId,
            status,
            priority,
            dueDate,
            assigneeIds: selectedAssignees.map((a) => a.id),
        });

        if (!result.success) {
            setError(result.error ?? "Something went wrong.");
            setSaving(false);
            return;
        }

        window.location.reload();
    }

    async function handleConfirmDelete() {
        setIsDeleting(true);
        setDeleteError("");

        const result = await deleteTask(task.id);

        if (!result.success) {
            setDeleteError(result.error ?? "Something went wrong deleting the task.");
            setIsDeleting(false);
            return;
        }

        if (onDeleted) {
            onDeleted();
        } else {
            window.location.reload();
        }
    }

    return (
        <motion.form
            onSubmit={handleSubmit}
            className={`edit-task-form ${saving ? "edit-task-form--saving" : ""}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
        >
            <div className="edit-task-form__header">
                <h2 className="edit-task-form__title">Edit task</h2>

                {isConfirmingDelete ? (
                    <div className="edit-task-form__delete-confirm">
                        <span className="edit-task-form__delete-confirm-text">
                            Delete this task?
                        </span>
                        <button
                            type="button"
                            className="edit-task-form__delete-confirm-yes"
                            onClick={handleConfirmDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Deleting…" : "Yes, delete"}
                        </button>
                        <button
                            type="button"
                            className="edit-task-form__delete-confirm-cancel"
                            onClick={() => setIsConfirmingDelete(false)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        className="edit-task-form__delete"
                        onClick={() => setIsConfirmingDelete(true)}
                        disabled={saving}
                    >
                        Delete task
                    </button>
                )}
            </div>

            {deleteError && (
                <p className="edit-task-form__delete-error">{deleteError}</p>
            )}

            <div className="edit-task-form__field">
                <label className="edit-task-form__label">Title</label>
                <input
                    className="edit-task-form__input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
            </div>

            <div className="edit-task-form__field">
                <label className="edit-task-form__label">Description</label>
                <textarea
                    className="edit-task-form__input edit-task-form__input--textarea"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                />
            </div>

            <div className="edit-task-form__field">
                <label className="edit-task-form__label">Team</label>
                <select
                    className="edit-task-form__input"
                    value={teamId}
                    onChange={(e) => setTeamId(e.target.value)}
                >
                    {teams.map((team) => (
                        <option key={team.id} value={team.id}>
                            {team.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="edit-task-form__field">
                <label className="edit-task-form__label">Assignees</label>

                {selectedAssignees.length > 0 && (
                    <div className="edit-task-form__chips">
                        <AnimatePresence initial={false}>
                            {selectedAssignees.map((assignee) => (
                                <motion.span
                                    key={assignee.id}
                                    className="edit-task-form__chip"
                                    layout
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 26 }}
                                >
                                    <span className="edit-task-form__chip-avatar">
                                        {initials(assignee)}
                                    </span>
                                    <span className="edit-task-form__chip-name">
                                        {assignee.name}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => removeAssignee(assignee.id)}
                                        className="edit-task-form__chip-remove"
                                        aria-label={`Remove ${assignee.name}`}
                                    >
                                        ×
                                    </button>
                                </motion.span>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                <div className="edit-task-form__search" ref={searchWrapRef}>
                    <input
                        className="edit-task-form__input"
                        placeholder="Search people by name or email..."
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setShowResults(true);
                        }}
                        onFocus={() => setShowResults(true)}
                        onBlur={() =>
                            // slight delay so the click on a result registers first
                            setTimeout(() => setShowResults(false), 120)
                        }
                    />

                    <AnimatePresence>
                        {showResults && query.trim() && (
                            <motion.div
                                className="edit-task-form__results"
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.15 }}
                            >
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((user) => (
                                        <button
                                            key={user.id}
                                            type="button"
                                            onClick={() => addAssignee(user)}
                                            className="edit-task-form__result"
                                        >
                                            <span className="edit-task-form__result-avatar">
                                                {initials(user)}
                                            </span>
                                            <span className="edit-task-form__result-info">
                                                <span className="edit-task-form__result-name">
                                                    {user.name}
                                                </span>
                                                <span className="edit-task-form__result-email">
                                                    {user.email}
                                                </span>
                                            </span>
                                        </button>
                                    ))
                                ) : (
                                    <p className="edit-task-form__result-empty">
                                        No matches found.
                                    </p>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="edit-task-form__row">
                <div className="edit-task-form__field">
                    <label className="edit-task-form__label">Status</label>
                    <select
                        className="edit-task-form__input"
                        value={status}
                        onChange={(e) =>
                            setStatus(e.target.value as Task["status"])
                        }
                    >
                        <option value="todo">To do</option>
                        <option value="in_progress">In progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                <div className="edit-task-form__field">
                    <label className="edit-task-form__label">Priority</label>
                    <select
                        className="edit-task-form__input"
                        value={priority}
                        onChange={(e) =>
                            setPriority(e.target.value as Task["priority"])
                        }
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>

                <div className="edit-task-form__field">
                    <label className="edit-task-form__label">Due date</label>
                    <input
                        type="date"
                        className="edit-task-form__input"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                    />
                </div>
            </div>

            {error && <p className="edit-task-form__error">{error}</p>}

            <div className="edit-task-form__actions">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={saving}
                    className="edit-task-form__cancel-btn"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    disabled={saving}
                    className="edit-task-form__save-btn"
                >
                    {saving ? "Saving..." : "Save changes"}
                </button>
            </div>
        </motion.form>
    );
}
