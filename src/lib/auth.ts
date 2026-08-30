import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { db } from "@/db";
import {
    users,
    account,
    session,
    verification,
} from "@/db/schema";
import { randomUUID } from "crypto";

export const auth = betterAuth({
    trustedOrigins: [
        "http://localhost:3000",
        "http://192.168.1.77:3000",
    ],
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: {
            users,
            account,
            session,
            verification,
        },
    }),

    advanced: {
        database: {
            generateId: () => randomUUID(),
        },
    },

    user: {
        modelName: "users",

        additionalFields: {
            firstName: {
                type: "string",
                required: true,
                input: true,
            },
            surname: {
                type: "string",
                required: true,
                input: true,
            },
            teamId: {
                type: "string",
                required: true,
                input: true,
            },
            role: {
                type: "string",
                required: true,
                input: true,
            },
        },
    },

    emailAndPassword: {
        enabled: true,
    },
});
