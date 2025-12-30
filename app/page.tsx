import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginForm from "@/components/auth/login-form";
import { Suspense } from "react";

export default async function LoginPage() {
    const session = await auth();

    if (session?.user) {
        redirect("/dashboard");
    }

    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center bg-brand-dark">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-yellow"></div>
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}
