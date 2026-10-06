import { Resend } from "resend";
import { users } from "@/db/schema";
import { db } from "@/db";
import { eq } from "drizzle-orm";

export default class Email {
    async sendTaskEmails(usersT: string[]) {
        const resend = new Resend();

        for (let i = 0; i < usersT.length; i++) {
            const email = await db
                .select()
                .from(users)
                .where(eq(users.id, usersT[i]))
                .limit(1);

            try {
                const { error } = await resend.emails.send({
                    from: 'SETU Formula Racing <noreply@setuformularacing.ie>',
                    to: [`${email}`],
                    subject: 'New Task Added',
                    html: ''
                });

                if (error) {
                    throw new Error(
                        `Failed to send email ${email} because ${error.message}`,
                    );
                }
            } catch (error) {
                console.log(`ERROR: failed to send email for ${email}`);
                throw error; 
            }
        }
    }
}
