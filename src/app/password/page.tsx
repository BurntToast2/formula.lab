import { getResetByToken } from "@/app/actions/invitations";
import ResetForm from "@/app/password/reset-form";
import ForgotForm from "@/app/password/forgot-password/page";

export default async function PasswordPage({
    searchParams,
}: {
    searchParams: Promise<{ token?: string }>;
}) {
    const { token } = await searchParams;

    if (!token) {
        return <ForgotForm />;
    }

    const reset = await getResetByToken(token);
    if (!reset) {
        return <ForgotForm notice="This reset link is invalid or has expired. Enter your email to get a new one." />;
    }

    return <ResetForm token={token} />;
}
