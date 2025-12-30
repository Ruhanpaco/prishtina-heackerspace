"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Fingerprint, LifeBuoy, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="relative min-h-screen flex items-center justify-center p-4 bg-[#0a0a0f] text-red-500 font-mono overflow-hidden">

            {/* Background Pulse */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-red-900/10 animate-pulse" />
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)] opacity-80" />
            </div>

            <div className="relative z-10 max-w-lg w-full bg-black/80 border border-red-900/50 p-8 rounded-xl shadow-2xl backdrop-blur-sm animate-in zoom-in-95 duration-300">

                {/* Header Icon */}
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <div className="absolute inset-0 bg-red-500 blur-xl opacity-20 animate-pulse" />
                        <AlertTriangle className="w-16 h-16 text-red-500 relative z-10" />
                    </div>
                </div>

                <div className="text-center space-y-4 mb-8">
                    <h2 className="text-3xl font-black uppercase tracking-widest text-white">System Malfunction</h2>
                    <p className="text-red-400/80 text-sm">
                        Critical error detected in operation sequence.
                    </p>

                    <div className="bg-red-950/30 border border-red-900/30 p-4 rounded text-left mt-4 overflow-hidden">
                        <p className="text-[10px] uppercase tracking-wider text-red-600 mb-1">Error Diagnostic:</p>
                        <code className="text-xs text-red-400 break-words block">
                            {error.message || "Unknown system failure"}
                        </code>
                        {error.digest && (
                            <p className="text-[10px] text-red-700 mt-2 font-mono">Digest: {error.digest}</p>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <Button
                        onClick={reset}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wider h-12"
                    >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Reboot Sequence (Retry)
                    </Button>

                    <div className="grid grid-cols-2 gap-3 mt-2">
                        <Button
                            asChild
                            variant="outline"
                            className="border-red-900/30 text-red-500 hover:bg-red-950/30 hover:text-red-400 uppercase text-xs font-bold"
                        >
                            <Link href="/dashboard">
                                <Fingerprint className="mr-2 h-3 w-3" />
                                Dashboard
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            className="border-red-900/30 text-red-500 hover:bg-red-950/30 hover:text-red-400 uppercase text-xs font-bold"
                        >
                            <Link href="mailto:support@flossk.org">
                                <LifeBuoy className="mr-2 h-3 w-3" />
                                Support
                            </Link>
                        </Button>
                    </div>
                </div>

            </div>

            <div className="absolute bottom-4 left-4 text-[10px] text-red-900/50 uppercase">
                Code: 500 // STATUS: CRITICAL
            </div>
        </div>
    );
}
