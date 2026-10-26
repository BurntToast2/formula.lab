type TaskData = {
    title: string,
    description?: string,
    dueDate?: string
};

// Task titles/descriptions are user-entered, so escape them before putting them in HTML
function escapeHtml(str: string) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

export function taskEmailHtml(task: TaskData, recipientName?: string) {
    const title = escapeHtml(task.title);
    const description = escapeHtml(task.description ?? '').replace(/\n/g, "<br>");
    const dueDate = escapeHtml(task.dueDate ?? '');
    const greeting = recipientName ? `Hi ${escapeHtml(recipientName)},` : "Hi,";

    return `
<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:8px;overflow:hidden;">
            <tr>
              <td style="background:#111827;padding:20px 32px;color:#ffffff;font-size:18px;font-weight:bold;">
                SETU Formula Racing
              </td>
            </tr>
            <tr>
              <td style="padding:32px;color:#111827;font-size:15px;line-height:1.6;">
                <p style="margin:0 0 16px;">${greeting}</p>
                <p style="margin:0 0 24px;">A new task has been added to your team:</p>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;">
                  <tr>
                    <td style="padding:20px;">
                      <div style="font-size:18px;font-weight:bold;margin-bottom:8px;">${title}</div>
                      <div style="color:#374151;margin-bottom:16px;">${description}</div>
                      <div style="font-size:13px;color:#6b7280;">
                        <strong>Due:</strong> ${dueDate}
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px;background:#f9fafb;color:#9ca3af;font-size:12px;">
                Sent automatically by Formula Lab. Please don't reply to this email.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
