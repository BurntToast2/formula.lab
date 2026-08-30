import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db/index";
import { users, teams } from "@/db/schema";
import { eq } from "drizzle-orm";
import "./page.css";

export default async function Members() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session) redirect("/login");

    const [currentUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, session.user.id))
        .limit(1);
    if (!currentUser) throw new Error("Authenticated user not found in database");

    const members = await db.select().from(users);
    const allTeams = await db.select().from(teams);
    const teamNameById = new Map(allTeams.map((team) => [team.id, team.name]));

    return (
        <main className="members-page">
            <div className="members-page__container">
                <h1 className="members-page__title">Members</h1>

                <div className="members-page__card">
                    <table className="members-page__table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Team</th>
                                <th>Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            {members.map((member) => {
                                const isYou = member.id === currentUser.id;
                                return (
                                    <tr
                                        key={member.id}
                                        className={isYou ? "members-page__row--you" : ""}
                                    >
                                        <td>
                                            {member.firstName} {member.surname}
                                            {isYou && (
                                                <span className="members-page__you-badge">you</span>
                                            )}
                                        </td>
                                        <td className="members-page__email">{member.email}</td>
                                        <td>
                                            <span className="members-page__badge members-page__badge--team">
                                                {teamNameById.get(member.teamId) ?? "Unassigned"}
                                            </span>
                                        </td>
                                        <td>
                                            <span
                                                className={`members-page__badge ${
                                                    member.role === "team_leader"
                                                        ? "members-page__badge--leader"
                                                        : "members-page__badge--member"
                                                }`}
                                            >
                                                {member.role.replace("_", " ")}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}
