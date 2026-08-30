"use server";

import { headers } from "next/headers";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { tasks, taskResponsibilities, teams, users } from "@/db/schema";


const createTaskSchema = z.object({
    title: z.string().min(1, "Task title is required").max(100),
    description: z.string().max(1000).optional(),
    teamId: z.string().uuid("Please select a valid team"),
    priority: z.enum(["low", "medium", "high"]),
    dueDate: z.string().optional(),
    assigneeIds: z.array(z.string().uuid()).optional(),
});

const updateTaskSchema = z.object({
    taskId: z.string().uuid(),
    title: z.string().min(1, "Task title is required").max(100),
    description: z.string().max(1000).optional(),
    teamId: z.string().uuid("Please select a valid team"),
    status: z.enum(["todo", "in_progress", "completed", "cancelled"]),
    priority: z.enum(["low", "medium", "high"]),
    dueDate: z.string().optional(),
    assigneeIds: z.array(z.string().uuid()),
});

export async function markTaskAsDone(taskId: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session) {
        return {
            success: false as const,
            error: "You must be logged in to update a task.",
        };
    }
 
    const [task] = await db
        .select()
        .from(tasks)
        .where(eq(tasks.id, taskId))
        .limit(1);
 
    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, session.user.id))
        .limit(1);
 
    if (!user) {
        return {
            success: false as const,
            error: "User not found.",
        };
    }
 
    if (!task) {
        return {
            success: false as const,
            error: "Task not found.",
        };
    }
 
    try {
        await db
            .update(tasks)
            .set({ status: "completed" })
            .where(eq(tasks.id, taskId));
 
        return { success: true as const };
    } catch (error) {
        console.error("markTaskAsDone failed:", error);
        return {
            success: false as const,
            error: "Something went wrong marking the task as done.",
        };
    }
}

export async function createTask(input: {
    title: string;
    description?: string;
    teamId: string;
    priority: "low" | "medium" | "high";
    dueDate?: string;
    assigneeIds?: string[];
}) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return {
            success: false as const,
            error: "You must be logged in to create a task.",
        };
    }

    const result = createTaskSchema.safeParse(input);

    if (!result.success) {
        return {
            success: false as const,
            error: "Please check the task details and try again.",
        };
    }

    const {
        title, 
        description,
        teamId,
        priority,
        dueDate,
        assigneeIds = [],
    } = result.data;

    const [team] = await db
        .select({ id: teams.id })
        .from(teams)
        .where(eq(teams.id, teamId))
        .limit(1);

    if (!team) {
        return {
            success: false as const,
            errors: {
                teamId: ["Team not found"],
            },
        };
    }

    if (assigneeIds.length > 0) {
        const assignedUsers = await db
            .select({ id: users.id })
            .from(users)
            .where(inArray(users.id, assigneeIds));

        if (assignedUsers.length !== assigneeIds.length) {
            return {
                success: false as const,
                errors: {
                    assigneeIds: ["One or more selected users could not be found"],
                },
            };
        }
    }
    try {
        const [createdTask] = await db
        .insert(tasks)
        .values({
            title,
            description: description || null,
            teamId,
            createdById: session.user.id,
            priority,
            dueDate: dueDate ? new Date(dueDate) : null,
        })
        .returning({
            id: tasks.id,
        });

        if (assigneeIds.length > 0) {
            await db.insert(taskResponsibilities).values(
                assigneeIds.map((userId) => ({
                    taskId: createdTask.id,
                    userId,
                }))
            );
        }

        return {
            success: true as const,
            taskId: createdTask.id,
        };
    } catch (error) {
        console.error("createTask failed:", error);

        return {
            success: false as const,
            error: "Something went wrong creating the task.",
        };
    }
}

// Update the tasks please 
export async function updateTask(input: {
    taskId: string;
    title: string;
    description?: string;
    teamId: string;
    status: "todo" | "in_progress" | "completed" | "cancelled";
    priority: "low" | "medium" | "high";
    dueDate?: string;
    assigneeIds: string[];
}) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return {
            success: false as const,
            error: "You must be logged in.",
        };
    }

    const result = updateTaskSchema.safeParse(input);

    if (!result.success) {
        return {
            success: false as const,
            error: "Please check the task details.",
            errors: z.flattenError(result.error).fieldErrors,
        };
    }

    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, session.user.id))
        .limit(1);

    if (!user) {
        return {
            success: false as const,
            error: "User not found.",
        };
    }

    const [task] = await db
        .select()
        .from(tasks)
        .where(eq(tasks.id, result.data.taskId))
        .limit(1);

    if (!task) {
        return {
            success: false as const,
            error: "Task not found.",
        };
    }

    const canEdit =
        user.role === "team_leader" ||
        task.createdById === user.id;

    if (!canEdit) {
        return {
            success: false as const,
            error: "You do not have permission to edit this task.",
        };
    }

    //Remove the existing users and add the new ones 
    try {
        await db
        .delete(taskResponsibilities)
        .where(eq(taskResponsibilities.taskId, result.data.taskId));

        if (result.data.assigneeIds.length > 0) {
            await db.insert(taskResponsibilities).values(
                result.data.assigneeIds.map((userId) => ({
                    taskId: result.data.taskId,
                    userId,
                }))
            );
        }
    } catch (error) {
        console.error("Failed to update task assignees:", error);

        return {
            success: false as const,
            error: "Something went wrong updating the task assignees.",
        };
    }

    try {
        await db
        .update(tasks)
        .set({
            title: result.data.title,
            description: result.data.description || null,
            teamId: result.data.teamId,
                status: result.data.status,
                priority: result.data.priority,
                dueDate: result.data.dueDate
                    ? new Date(result.data.dueDate)
                    : null,
                updatedAt: new Date(),
            })
            .where(eq(tasks.id, result.data.taskId));

        return {
            success: true as const,
        };
    } catch (error) {
        console.error("updateTask failed:", error);

        return {
            success: false as const,
            error: "Something went wrong updating the task.",
        };
    }
}

export async function deleteTask(taskId: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return {
            success: false as const,
            error: "You must be logged in.",
        };
    }

    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, session.user.id))
        .limit(1);

    if (!user) {
        return {
            success: false as const,
            error: "User not found.",
        };
    }

    if (user.role !== "team_leader") {
        return {
            success: false as const,
            error: "Only team leaders can delete tasks.",
        };
    }

    const [task] = await db
        .select({ id: tasks.id })
        .from(tasks)
        .where(eq(tasks.id, taskId))
        .limit(1);

    if (!task) {
        return {
            success: false as const,
            error: "Task not found.",
        };
    }

    try {
        await db
            .delete(taskResponsibilities)
            .where(eq(taskResponsibilities.taskId, taskId));

        await db
            .delete(tasks)
            .where(eq(tasks.id, taskId));

        return {
            success: true as const,
        };
    } catch (error) {
        console.error("deleteTask failed:", error);

        return {
            success: false as const,
            error: "Something went wrong deleting the task.",
        };
    }
}
