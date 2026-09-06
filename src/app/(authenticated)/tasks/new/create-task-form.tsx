"use client";

import { FormEvent, useState } from "react";
import { createTask } from "@/app/actions/tasks";
import "./create-task-form.css";

type Team = {
  id: string;
  name: string;
};

type User = {
  id: string;
  name: string;
  teamId: string;
};

const PRIORITY_TEXT_STYLES: Record<string, string> = {
  low: "text-[var(--color-teal-soft)]",
  medium: "text-[var(--color-yellow)]",
  high: "text-[var(--color-error)]",
};

export default function CreateTaskForm({
  teams,
  users,
}: {
  teams: Team[];
  users: User[];
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [teamId, setTeamId] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState("");
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [assigneeSearch, setAssigneeSearch] = useState("");

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(assigneeSearch.trim().toLowerCase())
  );
  const selectedUsers = users.filter((user) => assigneeIds.includes(user.id));

  function toggleAssignee(userId: string) {
    setAssigneeIds((current) =>
      current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId]
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSubmitting(true);
    setError("");

    const result = await createTask({
      title,
      description,
      teamId,
      priority,
      dueDate,
      assigneeIds,
    });

    setSubmitting(false);

    if (!result.success) {
      if (result.error) {
        setError(result.error);
      } else {
        setError("Please check the form.");
      }

      return;
    }

    setTitle("");
    setDescription("");
    setTeamId("");
    setPriority("medium");
    setDueDate("");
    setAssigneeIds([]);
    setAssigneeSearch("");

    alert("Task created successfully.");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="task-panel w-full max-w-[520px] bg-[var(--color-slate)] p-8 flex flex-col gap-5"
    >
      <div>
        <h2 className="m-0 font-[family-name:var(--font-cond)] text-2xl font-bold uppercase tracking-wide text-[var(--color-white)]">
          New task
        </h2>
        <p className="m-0 mt-1 text-[13px] text-[var(--color-gray)]">
          Fill in the details and assign it to your team.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="title"
          className="font-[family-name:var(--font-cond)] text-[13px] font-bold uppercase tracking-wide text-[var(--color-gray)]"
        >
          Task title
        </label>
        <input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="task-field w-full px-3.5 py-2.5 text-sm"
          placeholder="e.g. Finalize suspension geometry"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="description"
          className="font-[family-name:var(--font-cond)] text-[13px] font-bold uppercase tracking-wide text-[var(--color-gray)]"
        >
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="task-field w-full px-3.5 py-2.5 text-sm resize-none"
          placeholder="Any extra context for the team"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="team"
            className="font-[family-name:var(--font-cond)] text-[13px] font-bold uppercase tracking-wide text-[var(--color-gray)]"
          >
            Team
          </label>
          <select
            id="team"
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            required
            className="task-field w-full px-3.5 py-2.5 text-sm"
          >
            <option value="">Select a team</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="priority"
            className="font-[family-name:var(--font-cond)] text-[13px] font-bold uppercase tracking-wide text-[var(--color-gray)]"
          >
            Priority
          </label>
          <select
            id="priority"
            value={priority}
            onChange={(e) =>
              setPriority(e.target.value as "low" | "medium" | "high")
            }
            className="task-field w-full px-3.5 py-2.5 text-sm"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={`font-[family-name:var(--font-cond)] text-[12px] font-bold uppercase tracking-wide ${PRIORITY_TEXT_STYLES[priority]}`}
        >
          {priority} priority
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="dueDate"
          className="font-[family-name:var(--font-cond)] text-[13px] font-bold uppercase tracking-wide text-[var(--color-gray)]"
        >
          Deadline (optional)
        </label>
        <input
          id="dueDate"
          type="datetime-local"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="task-field w-full px-3.5 py-2.5 text-sm"
        />
      </div>

      <fieldset className="border-0 p-0 m-0">
        <div className="flex items-center justify-between mb-2">
          <legend className="font-[family-name:var(--font-cond)] text-[13px] font-bold uppercase tracking-wide text-[var(--color-gray)] p-0">
            Assign to (optional)
          </legend>
          {selectedUsers.length > 0 && (
            <span className="text-[12px] font-medium text-[var(--color-teal-soft)]">
              {selectedUsers.length} selected
            </span>
          )}
        </div>

        {selectedUsers.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {selectedUsers.map((user) => (
              <span
                key={user.id}
                className="flex items-center gap-1.5 bg-[var(--color-chip-bg)] text-[var(--color-teal-soft)] text-[12.5px] font-medium pl-2.5 pr-1.5 py-1"
              >
                {user.name}
                <button
                  type="button"
                  onClick={() => toggleAssignee(user.id)}
                  aria-label={`Remove ${user.name}`}
                  className="border-0 bg-transparent cursor-pointer text-[15px] leading-none px-0.5 opacity-70 hover:opacity-100"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        <input
          type="text"
          value={assigneeSearch}
          onChange={(e) => setAssigneeSearch(e.target.value)}
          placeholder="Search people…"
          className="task-field w-full px-3.5 py-2 text-sm mb-2"
        />

        <div className="border-[1.5px] border-[var(--color-gray)]/25 max-h-[180px] overflow-y-auto">
          {filteredUsers.length === 0 && (
            <p className="m-0 px-3.5 py-3 text-[13px] text-[var(--color-gray)]">
              No one matches "{assigneeSearch}".
            </p>
          )}
          {filteredUsers.map((user, i) => (
            <label
              key={user.id}
              className={`task-assignee-row flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-[var(--color-white)] cursor-pointer ${
                i !== filteredUsers.length - 1
                  ? "border-b border-[var(--color-gray-light)]/15"
                  : ""
              }`}
            >
              <input
                type="checkbox"
                checked={assigneeIds.includes(user.id)}
                onChange={() => toggleAssignee(user.id)}
                className="task-checkbox w-4 h-4"
              />
              {user.name}
            </label>
          ))}
        </div>
      </fieldset>

      {error && (
        <p className="m-0 text-[13px] text-[var(--color-error)]">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="task-submit-btn w-full py-3 font-[family-name:var(--font-cond)] text-[14.5px] font-bold uppercase tracking-wide border-0 cursor-pointer transition-colors"
      >
        {submitting ? "Creating…" : "Create task"}
      </button>
    </form>
  );
}
