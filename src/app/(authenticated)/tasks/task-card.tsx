import Link from "next/link";
import "./task-card.css";

type Task = {
    id: string;
    title: string;
    description: string | null;
    priority: "low" | "medium" | "high";
    status: "todo" | "in_progress" | "completed" | "cancelled";
    dueDate: Date | string | null;
};

const STATUS_LABELS: Record<Task["status"], string> = {
    todo: "todo",
    in_progress: "in progress",
    completed: "completed",
    cancelled: "cancelled",
};

export default function TaskCard({ task }: { task: Task }) {
    const dueDate = task.dueDate ? new Date(task.dueDate) : null;
    const isOverdue =
        !!dueDate &&
        dueDate < new Date() &&
        task.status !== "completed" &&
        task.status !== "cancelled";

    return (
        <Link
            href={`/tasks/${task.id}`}
            className={`task-card ${isOverdue ? "task-card--overdue" : ""}`}
        >
            <div className="task-card__badges">
                <span className={`task-card__badge task-card__badge--status-${task.status}`}>
                    {STATUS_LABELS[task.status]}
                </span>
                <span className={`task-card__badge task-card__badge--priority-${task.priority}`}>
                    {task.priority}
                </span>
                {isOverdue && (
                    <span className="task-card__badge task-card__badge--overdue">
                        overdue
                    </span>
                )}
            </div>

            <h3 className="task-card__title">{task.title}</h3>

            {task.description && (
                <p className="task-card__description">{task.description}</p>
            )}

            {dueDate && (
                <p className={`task-card__due ${isOverdue ? "task-card__due--overdue" : ""}`}>
                    Due{" "}
                    {dueDate.toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                    })}
                </p>
            )}
        </Link>
    );
}
