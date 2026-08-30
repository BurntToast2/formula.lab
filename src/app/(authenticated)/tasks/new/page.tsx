import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { teams, users } from "@/db/schema";
import CreateTaskForm from "./create-task-form";

export default async function NewTaskPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const allTeams = await db
    .select({
      id: teams.id,
      name: teams.name,
    })
    .from(teams);

  const allUsers = await db
    .select({
      id: users.id,
      name: users.name,
      teamId: users.teamId,
    })
    .from(users);

  return (
    <main className="min-h-screen bg-[#D3DDE0] flex items-center justify-center p-6">
      <CreateTaskForm teams={allTeams} users={allUsers} />
    </main>
  );
}
