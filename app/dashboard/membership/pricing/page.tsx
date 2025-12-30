import { Suspense } from "react";
import { PricingContent } from "./PricingContent";

export default function PricingPage() {
    return (
        <Suspense fallback={
            <div className="flex h-[80vh] items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-yellow"></div>
            </div>
        }>
            <PricingContent />
        </Suspense>
    );
}
