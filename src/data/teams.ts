import "server-only";
import { db } from "@/db";
import { teams } from "@/db/schema";

export async function getTeams(){
    return db.select().from(teams);
}
