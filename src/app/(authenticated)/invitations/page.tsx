"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db/index";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import InvitationsPage from "./InvitationsPage";

export default async function Invitations(){
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

    if (currentUser.role !== "admin") return <>
            Can't Access this page unless you're an admin :P
        </>  

    return <InvitationsPage/>;
}
