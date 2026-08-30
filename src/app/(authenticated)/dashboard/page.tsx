import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { users, tasks, teams, taskResponsibilities } from "@/db/schema";
import DashboardTabs from "./dashboard-tabs";
import "./page.css";

export default async function DashboardPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session) {
        redirect("/login");
    }

    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, session.user.id))
        .limit(1);

    if (!user) {
        return (
            <main className="dashboard-page">
                <div className="dashboard-page__container">
                    <h1 className="dashboard-page__title">User not found</h1>
                    <p className="dashboard-page__lead">
                        Your authentication session exists, but your user account
                        could not be found.
                    </p>
                </div>
            </main>
        );
    }

    const [team] = await db
        .select()
        .from(teams)
        .where(eq(teams.id, user.teamId))
        .limit(1);

    const myTasks = await db
        .select({
            id: tasks.id,
            title: tasks.title,
            description: tasks.description,
            priority: tasks.priority,
            status: tasks.status,
            dueDate: tasks.dueDate,
        })
        .from(taskResponsibilities)
        .innerJoin(tasks, eq(taskResponsibilities.taskId, tasks.id))
        .where(eq(taskResponsibilities.userId, user.id))
        .orderBy(asc(tasks.dueDate));

    const myTaskIds = new Set(myTasks.map((t) => t.id));

    const teamTasksRaw = await db
        .select()
        .from(tasks)
        .where(eq(tasks.teamId, user.teamId))
        .orderBy(asc(tasks.dueDate));

    // tasks already shown under "Your Tasks" don't need to repeat here
    const teamTasks = teamTasksRaw.filter((t) => !myTaskIds.has(t.id));

    return (
        <main className="dashboard-page">
            <div className="dashboard-page__container">
                <h1 className="dashboard-page__title">
                    Welcome, {user.firstName}
                </h1>

                <DashboardTabs
                    myTasks={myTasks}
                    teamTasks={teamTasks}
                    teamName={team ? team.name : "Your Team"}
                />
            </div>
        </main>
    );
}
