import { Resend } from "resend";
import { users } from "@/db/schema";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { taskEmailHtml } from "@/emails/taskEmail";

export default class Email {
    async sendTaskEmails(usersT: string[], taskData: {title: string, description?: string, dueDate?: string}) {
        const resend = new Resend();

        for (let i = 0; i < usersT.length; i++) {
            const [user] = await db
                .select()
                .from(users)
                .where(eq(users.id, usersT[i]))
                .limit(1);
            
            console.log('This is the task', taskData);

            try {
                const { error } = await resend.emails.send({
                    from: 'SETU Formula Racing <noreply@setuformularacing.ie>',
                    to: [`${user.email}`],
                    subject: 'New Task Added',
                    html: taskEmailHtml({ title: taskData.title, description: taskData.description, dueDate: taskData.dueDate }, user.name)
                });

                if (error) {
                    throw new Error(
                        `Failed to send email ${user.email} because ${error.message}`,
                    );
                }
            } catch (error) {
                console.log(`ERROR: failed to send email for ${user.email}`);
                throw error; 
            }
        }
    }
}
