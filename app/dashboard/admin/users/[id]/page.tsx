import { Suspense } from "react";
import { UserDetailsContent } from "./UserDetailsContent";

type Params = Promise<{ id: string }>;

export default async function UserDetailPage(props: { params: Params }) {
    const params = await props.params;
    const id = params.id;

    return (
        <Suspense fallback={
            <div className="flex h-[80vh] items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-yellow"></div>
            </div>
        }>
            <UserDetailsContent userId={id} />
        </Suspense>
    );
}
