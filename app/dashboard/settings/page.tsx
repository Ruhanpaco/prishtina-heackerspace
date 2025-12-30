import { Suspense } from "react";
import { SettingsContent } from "./SettingsContent";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function SettingsPage(props: {
    searchParams: SearchParams;
}) {
    const searchParams = await props.searchParams;
    const defaultTab = (searchParams.tab as string) || "general";

    return (
        <Suspense fallback={
            <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-yellow"></div>
            </div>
        }>
            <SettingsContent defaultTab={defaultTab} />
        </Suspense>
    );
}
