import { getInvitationByToken } from "@/app/actions/invitations";
import SignUpForm from "@/app/signup/signup-form";

export default async function SignUp({
    searchParams,
}: {
    searchParams: Promise<{ token?: string }>;
}) {

    const { token } = await searchParams;

    if (!token) {
        return (
            <main>
                <h1>Invalid Invitation</h1>
                <p>You need a valid invitation to sign up.</p>
            </main>
        );
    }

    const invitation = await getInvitationByToken(token);
    if (!invitation) {
        return (
            <main>
                <h1>Invalid Invitation</h1>
                <p>This invitation is invalid or has expired.</p>
            </main>
        );
    }

    return (
        <main>
            <h1>Formula Lab Signup</h1>
            <p>Invitation for: {invitation.email}</p>
            <SignUpForm email={invitation.email} token={invitation.token}/>
        </main>
    );
}
