import { Suspense } from "react";
import { PaymentContent } from "./PaymentContent";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function PaymentInstructionsPage(props: {
    searchParams: SearchParams;
}) {
    const searchParams = await props.searchParams;
    const tier = (searchParams.tier as string) || "ENTHUSIAST";
    const amount = (searchParams.amount as string) || "20";

    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-yellow"></div>
            </div>
        }>
            <PaymentContent tier={tier} amount={amount} />
        </Suspense>
    );
}
