"use server";

import { db } from "@/db";
import { users, invitations, resets, account, teams, session } from "@/db/schema";
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

        const inviteLink = `${APP_URL}/signup?token=${token}`;

        const { error } = await resend.emails.send({
            from: "SETU Formula Student <noreply@setuformularacing.ie>",
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

export async function createResetLink(email: string) {
    email = email.trim().toLowerCase();

    try {
        const [user] = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        if (!user) {
            return {
                success: false as const,
                error: "Not a registered email"
            }
        }

    const token = randomBytes(32).toString("hex");

    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await db.insert(resets).values({
        userId: user.id,
        token,
        expiresAt
    });

    const resetLink = `${APP_URL}/password?token=${token}`;

    const { error } = await resend.emails.send({
        from: "SETU Formula Racing <noreply@setuformularacing.ie>",
        to: email,
        subject: "Reset your password",
        html: buildResetEmailHtml(resetLink)
    });

    if (error) {
        throw new Error(
            `Reset link saved for ${email}, but the email failed to send. ${error.message}`,
        );
    }

    return { success: true as const };

    } catch (error) {
        console.error("RESET PASSWORD ERROR: ", error);

        throw error;
    }
}

function buildResetEmailHtml(resetLink: string) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&display=swap" />
        </head>
    <body style="margin:0; padding:0; background-color:#313544; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#313544" style="background-color:#313544; padding:32px 16px;">
    <tr>
    <td align="center">
    <table role="presentation" width="400" cellpadding="0" cellspacing="0" bgcolor="#3D4152" style="background-color:#3D4152; border-top:2px solid #29968C; clip-path:polygon(0 0,100% 0,100% 100%,18px 100%,0 calc(100% - 18px)); max-width:400px; width:100%;">
    <tr>
    <td style="padding:40px;">

    <img src="${LOGO_URL}" alt="SETU" width="96" height="96" style="display:block; margin:0 auto 20px;" />

    <h1 style="margin:0 0 6px; font-family:'Rajdhani','Arial Narrow',Arial,sans-serif; font-size:26px; font-weight:700; text-transform:uppercase; letter-spacing:0.02em; color:#FEFEFE; text-align:center;">
    Reset your password
    </h1>

    <p style="margin:0 0 28px; font-size:13.5px; line-height:1.6; color:#B3B7BB; text-align:center;">
    We received a request to reset the password for your Formula.lab account.
            Click the button below to choose a new one.
                </p>

        <a href="${resetLink}" style="display:block; background-color:#29968C; color:#FEFEFE; font-family:'Rajdhani','Arial Narrow',Arial,sans-serif; font-size:14.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.03em; text-align:center; text-decoration:none; padding:12px; border-radius:6px;">
        Reset password
        </a>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
        <tr>
        <td bgcolor="#434758" style="background-color:#434758; border-left:3px solid #F7D97B; padding:12px 14px; font-size:13px; line-height:1.5; color:#B3B7BB;">
        This link expires in 30 minutes and can only be used once.
            </td>
        </tr>
        </table>

        <p style="margin:24px 0 0; font-size:12.5px; line-height:1.5; color:#B3B7BB; text-align:center;">
        If you didn't request this, you can safely ignore this email. Your password won't change.
            </p>

        <p style="margin:14px 0 0; font-size:12px; color:#8ABCB9; text-align:center; word-break:break-all;">
        Or paste this link into your browser: ${resetLink}
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

export async function getResetByToken(token: string) {
    const reset = await db
        .select()
        .from(resets)
        .where(
            and(
                eq(resets.token, token),
                isNull(resets.acceptedAt),
                gt(resets.expiresAt, new Date()),
            ),
        )
        .limit(1);

        return reset[0] ?? null;
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

const passwordOnlySchema = signUpSchema.pick( {password: true});
export async function validatePassword(
    password: string
) {
    const result = passwordOnlySchema.safeParse({ password });

    if (!result.success) {
        return {
            success: false as const,
            errors: z.flattenError(result.error).fieldErrors,
        };
    }

    return { success: true as const, data: result.data };
}

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
            data: z.flattenError(result.error).fieldErrors,
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

export async function resetPassword(
    token: string,
    newPassword: string,
    confirmPassword: string
) {
    try {
        const reset = await getResetByToken(token);
        if (!reset) {
            return { success: false as const, error: "This reset link is invalid or has expired." };
        }

        if (newPassword !== confirmPassword) {
            return { success: false as const, error: "Passwords don't match" };
        }

        const validation = await validatePassword(newPassword);
        if (!validation.success) {
            return {
                success: false as const,
                error: validation.errors.password?.[0] ?? "Password does not meet the requirements.",
            };
        }

        const ctx = await auth.$context;
        const hash = await ctx.password.hash(newPassword);

        const updated = await db
            .update(account)
            .set({ password: hash })
            .where(and(eq(account.userId, reset.userId), eq(account.providerId, "credential")))
            .returning({ id: account.id });

        console.log("ROWS UPDATED:", updated.length);

        if (updated.length === 0) {
            return { success: false as const, error: "Could not find an account to update." };
        }

        await db.update(resets).set({ acceptedAt: new Date() }).where(eq(resets.id, reset.id));

        await db.delete(session).where(eq(session.userId, reset.userId));

        return { success: true as const };

    } catch (error) {
        console.error("RESET PASSWORD ERROR: ", error);
                      return { success: false as const, error: "Something went wrong. Please try again." };
    }
}
