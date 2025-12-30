import { Suspense } from "react";
import { SignUpContent } from "./SignUpContent";

export default function SignUpPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center bg-brand-dark">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-yellow"></div>
            </div>
        }>
            <SignUpContent />
        </Suspense>
    );
}
