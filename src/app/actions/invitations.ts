"use server";

import { db } from "@/db";
import { users, invitations, teams } from "@/db/schema";
import { and, eq, gt, isNull } from "drizzle-orm";
import { z } from "zod";
import { randomBytes } from "crypto";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { Resend } from "resend";

const emailSchema = z.email().endsWith("@setu.ie");

const resend = new Resend(process.env.RESEND_API_KEY);

const APP_URL =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const LOGO_URL = `${APP_URL}/setu-logo.png`;

export async function createInvitation(email: string) {
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
        throw new Error("Authenticated user not found in database");
    }

    if (currentUser.role !== "admin") {
        throw new Error("Imposter!");
    }

    const result = emailSchema.safeParse(email);

    if (!result.success) {
        throw new Error("Only @setu.ie email addresses can be invited.");
    }

    const token = randomBytes(32).toString("hex");

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    try {
        await db.insert(invitations).values({
            email,
            token,
            expiresAt,
        });

        const inviteLink = `${APP_URL}/invite/${token}`;

        const { error } = await resend.emails.send({
            from: "SETU Formula Student <onboarding@resend.dev>",
            to: email,
            subject: "You're invited to join the team",
            html: buildInviteEmailHtml(inviteLink),
        });

        if (error) {
            throw new Error(
                `Invitation saved for ${email}, but the email failed to send. ${error.message}`,
            );
        }

        return true;
    } catch (error) {
        console.error("CREATE INVITATION ERROR:", error);

        throw error;
    }
}

function buildInviteEmailHtml(inviteLink: string) {
    return `
    <!DOCTYPE html>
    <html>
    <body style="margin:0; padding:0; background-color:#D3DDE0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#D3DDE0; padding:32px 16px;">
    <tr>
    <td align="center">
    <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#FEFEFE; border-radius:16px; overflow:hidden; max-width:480px; width:100%;">
    <tr>
    <td align="center" style="padding:36px 40px 8px;">
    <img src="${LOGO_URL}" alt="SETU" width="72" height="72" style="display:block;" />
    </td>
    </tr>

    <tr>
    <td style="padding:12px 40px 0;">
    <h1 style="margin:0; font-size:22px; font-weight:600; color:#313544; text-align:center;">
    You're invited
    </h1>

    <p style="margin:12px 0 0; font-size:14px; line-height:1.6; color:#51535D; text-align:center;">
    You've been invited to join the SETU Formula Student team workspace.
    This invite expires in 7 days.
    </p>
    </td>
    </tr>

    <tr>
    <td align="center" style="padding:28px 40px 40px;">
    <a href="${inviteLink}" style="display:inline-block; background-color:#29968C; color:#FEFEFE; font-size:14.5px; font-weight:600; text-decoration:none; padding:13px 28px; border-radius:10px;">
    Accept invitation
    </a>

    <p style="margin:20px 0 0; font-size:12px; color:#B3B7BB; word-break:break-all;">
    Or paste this link into your browser: ${inviteLink}
    </p>
    </td>
    </tr>

    </table>
    </td>
    </tr>
    </table>
    </body>
    </html>
    `.trim();
}

export async function getInvitationByToken(token: string) {
    const invitation = await db
        .select()
        .from(invitations)
        .where(
            and(
                eq(invitations.token, token),
                isNull(invitations.acceptedAt),
                gt(invitations.expiresAt, new Date()),
            ),
        )
        .limit(1);

    return invitation[0] ?? null;
}

const signUpSchema = z.object({
    firstName: z.string().min(2).max(30),
    surname: z.string().min(2).max(30),
    password: z.string().min(7).max(30),
    teamName: z.string().min(1, "Please select a team"),
});

export async function validateSignUpCredentials(
    firstName: string,
    surname: string,
    password: string,
    teamName: string,
) {
    const result = signUpSchema.safeParse({
        firstName,
        surname,
        password,
        teamName,
    });

    if (!result.success) {
        return {
            success: false as const,
            errors: z.flattenError(result.error).fieldErrors,
        };
    }

    return {
        success: true as const,
        data: result.data,
    };
}

export async function createAccount(
    token: string,
    firstName: string,
    surname: string,
    password: string,
    teamName: string,
) {
    try {
        const invitation = await getInvitationByToken(token);

        if (!invitation) {
            return {
                success: false as const,
                error: "Invalid or expired invitation",
            };
        }

        const [team] = await db
            .select({ id: teams.id })
            .from(teams)
            .where(eq(teams.name, teamName))
            .limit(1);

        if (!team) {
            return {
                success: false as const,
                errors: {
                    teamName: ["Team not found"],
                },
            };
        }

        const result = await auth.api.signUpEmail({
            body: {
                name: `${firstName} ${surname}`,
                email: invitation.email,
                password,
                firstName,
                surname,
                teamId: team.id,
                role: "member",
            },
        });

        if (!result) {
            return {
                success: false as const,
                error: "Something went wrong creating your account. Please try again.",
            };
        }

        await db
            .update(invitations)
            .set({
                acceptedAt: new Date(),
            })
            .where(eq(invitations.token, token));

        return {
            success: true as const,
        };
    } catch (error) {
        console.error("CREATE ACCOUNT ERROR:", error);

        if (error instanceof Error) {
            return {
                success: false as const,
                error: error.message,
            };
        }

        return {
            success: false as const,
            error: "Something went wrong creating your account.",
        };
    }
}

