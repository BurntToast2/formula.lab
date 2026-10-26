import { Resend } from 'resend';

async function main() {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
        from: "SETU Formula Racing <noreply@setuformularacing.ie>",
        to: ['c00313383@setu.ie'],
        subject: 'New Task Email Test',
        html: '<p>Test</p>'
    });

    console.log({ data, error });
}

main();
