import Email from "../app/actions/taskEmails";

async function main() {
    let email = new Email();

    await email.sendTaskEmails(['8a65cab6-b90e-451e-bb04-fb45bb6882ae'], { title: 'test', description: '', dueDate: '01/01/2000'});

    console.log('sent');
}

main();
