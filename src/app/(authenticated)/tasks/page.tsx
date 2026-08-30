import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { users, tasks, teams } from "@/db/schema";
import TasksTabs from "./tasks-tabs";
import "./page.css";

export default async function TasksPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session) {
        redirect("/login");
    }

    const [currentUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, session.user.id))
        .limit(1);
    if (!currentUser) {
        throw new Error("Authenticated user not found in database.");
    }

    const allTeams = await db.select().from(teams);
    const allTasks = await db.select().from(tasks);

    const orderedTeams = [...allTeams].sort((a, b) => {
        if (a.id === currentUser?.teamId) return -1;
        if (b.id === currentUser?.teamId) return 1;
        return 0;
    });

    const tasksByTeam = new Map<string, typeof allTasks>();
    for (const task of allTasks) {
        const existing = tasksByTeam.get(task.teamId) ?? [];
        existing.push(task);
        tasksByTeam.set(task.teamId, existing);
    }

    const teamsWithTasks = orderedTeams.map((team) => ({
        team,
        isOwnTeam: team.id === currentUser.teamId,
        tasks: tasksByTeam.get(team.id) ?? [],
    }));

    return (
        <main className="tasks-page">
            <div className="tasks-page__container">
                <h1 className="tasks-page__title">All Tasks</h1>
                <TasksTabs teamsWithTasks={teamsWithTasks} />
            </div>
        </main>
    );
}
