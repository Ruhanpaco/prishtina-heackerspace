import { Suspense } from "react";
import { SignInContent } from "./SignInContent";

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-[#1D1D1B]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-yellow"></div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}
