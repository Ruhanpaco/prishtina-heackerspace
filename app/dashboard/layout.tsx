import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isModuleEnabled } from "@/lib/feature-flags";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session?.user) {
        redirect("/");
    }

    const showIdentityPrompt =
        isModuleEnabled("Identification_Module") &&
        session.user.identificationStatus !== 'VERIFIED';

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header user={session.user} />
                <main className="flex-1 overflow-y-auto p-6">
                    {showIdentityPrompt && (
                        <div className="mb-6 p-4 rounded-lg border-2 border-yellow-500/20 bg-yellow-500/5 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-yellow-500/10 rounded-full">
                                    <ShieldCheck className="h-5 w-5 text-yellow-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold">Identity Verification Required</p>
                                    <p className="text-xs text-muted-foreground">
                                        Please complete your identity verification to enable full membership benefits.
                                    </p>
                                </div>
                            </div>
                            <Button size="sm" variant="outline" asChild>
                                <a href="/dashboard/settings?tab=identity">Verify Now</a>
                            </Button>
                        </div>
                    )}
                    {children}
                </main>
            </div>
        </div>
    );
}
