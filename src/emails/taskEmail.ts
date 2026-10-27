type TaskData = {
    title: string;
    description?: string;
    dueDate?: string;
};

const LOGO_URL = "https://setuformularacing.ie/setu-logo.png";

function escapeHtml(str: string) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

export function taskEmailHtml(
    task: TaskData,
    recipientName?: string,
    taskUrl?: string,
) {
    const title = escapeHtml(task.title);
    const description = escapeHtml(task.description ?? '').replace(/\n/g, "<br>");
    const dueDate = escapeHtml(task.dueDate ?? '');
    const greeting = recipientName ? `Hi ${escapeHtml(recipientName)},` : "Hi,";

    const button = taskUrl
        ? `
                            <a href="${taskUrl}" style="display:block; margin-top:24px; background-color:#29968C; color:#FEFEFE; font-family:'Rajdhani','Arial Narrow',Arial,sans-serif; font-size:14.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.03em; text-align:center; text-decoration:none; padding:12px; border-radius:6px;">
                                View task
                            </a>`
        : "";

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
                                    New task added
                                </h1>

                                <p style="margin:0 0 28px; font-size:13.5px; line-height:1.6; color:#B3B7BB; text-align:center;">
                                    ${greeting} a new task has been added to your team on Formula.lab.
                                </p>

                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td bgcolor="#434758" style="background-color:#434758; border-left:3px solid #29968C; padding:16px;">
                                            <div style="font-family:'Rajdhani','Arial Narrow',Arial,sans-serif; font-size:20px; font-weight:700; text-transform:uppercase; letter-spacing:0.02em; color:#FEFEFE; margin-bottom:8px;">
                                                ${title}
                                            </div>
                                            <div style="font-size:13.5px; line-height:1.6; color:#B3B7BB;">
                                                ${description}
                                            </div>
                                        </td>
                                    </tr>
                                </table>

                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
                                    <tr>
                                        <td bgcolor="#434758" style="background-color:#434758; border-left:3px solid #F7D97B; padding:12px 14px; font-size:13px; line-height:1.5; color:#B3B7BB;">
                                            <strong style="color:#FEFEFE;">Due:</strong> ${dueDate}
                                        </td>
                                    </tr>
                                </table>
${button}
                                <p style="margin:24px 0 0; font-size:12px; line-height:1.5; color:#8ABCB9; text-align:center;">
                                    Sent automatically by Formula.lab. Please don't reply to this email.
                                </p>

                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
</html>`.trim();
}
