import { getResetByToken } from "@/app/actions/invitations";
import SignUpForm from "@/app/signup/signup-form";

export default async function ResetPassword({
    searchParams,
}: {
    searchParams: Promise<{ token?: string }>;
}) {

    const { token } = await searchParams;

    if (!token) {
        return (
            <main>
                <h1>Invalid Reset Link</h1>
                <p>You need a valid reset link to change your password.</p>
            </main>
        );
    }

    const reset = await getResetByToken(token);
    if (!reset) {
        return (
            <main>
                <h1>Invalid reset link</h1>
                <p>This reset link is invalid or has expired.</p>
            </main>
        );
    }

    return (
        <main>
            <h1>Formula Lab Reset Password</h1>
            <SignUpForm email={reset.userId} token={reset.token}/>
        </main>
    );
}
