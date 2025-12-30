"use client";

import { useEffect } from "react";
import { Inter } from "next/font/google"; // Using a standard font to avoid layout shift dependencies that might be broken
import { Button } from "@/components/ui/button";
import { Power, Terminal } from "lucide-react";

// Load font - ensuring we have a backup font
const inter = Inter({ subsets: ["latin"], fallback: ["monospace"] });

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Global Error:", error);
    }, [error]);

    return (
        <html lang="en">
            <body className={inter.className}>
                <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-hidden font-mono selection:bg-red-500/30">
                    {/* Background Static */}
                    <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://media.giphy.com/media/oEI9uBYSzLpBK/giphy.gif')] bg-cover mix-blend-overlay" />

                    <div className="z-10 w-full max-w-2xl space-y-8 animate-in fade-in duration-1000">

                        {/* Panic Header */}
                        <div className="border-l-4 border-red-600 pl-6 py-2">
                            <h1 className="text-4xl sm:text-6xl font-black uppercase text-red-600 tracking-tighter mb-2">
                                KERNEL PANIC
                            </h1>
                            <p className="text-xl text-red-400 font-bold tracking-widest uppercase">
                                FATAL SYSTEM EXCEPTION
                            </p>
                        </div>

                        {/* Error Log Mockup */}
                        <div className="bg-[#0f0f0f] border border-white/10 p-6 rounded-md font-mono text-sm shadow-2xl overflow-hidden relative group">
                            <div className="absolute top-0 right-0 bg-white/5 px-2 py-1 text-[10px] text-white/40">log_dump.txt</div>
                            <div className="space-y-1 text-gray-400">
                                <p><span className="text-blue-500">root@flossk-core</span>:<span className="text-blue-300">~</span>$ initiating_recovery_protocol.sh</p>
                                <p className="text-red-500">&gt; ERROR: CRITICAL_PROCESS_DIED</p>
                                <p>&gt; TRACE: {error.digest || "HASH_UNKNOWN"}</p>
                                <p>&gt; MSG: {error.message}</p>
                                <p className="animate-pulse text-green-500 mt-2">&gt; SYSTEM HALTED. MANUAL RESET REQUIRED_</p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Button
                                onClick={() => reset()}
                                size="lg"
                                className="bg-white text-black hover:bg-gray-200 font-bold uppercase tracking-widest flex-1 h-14 text-lg"
                            >
                                <Power className="mr-3 h-5 w-5" />
                                Hard Reboot
                            </Button>

                            <Button
                                onClick={() => window.location.href = "/"}
                                variant="outline"
                                size="lg"
                                className="border-white/20 text-white hover:bg-white/10 font-bold uppercase tracking-widest flex-1 h-14"
                            >
                                <Terminal className="mr-3 h-5 w-5" />
                                Safe Mode (Home)
                            </Button>
                        </div>

                        <div className="text-center text-[10px] text-white/20 uppercase tracking-[0.5em] mt-12">
                            Prishtina Hackerspace • System Integrity Lost
                        </div>
                    </div>
                </div>
            </body>
        </html>
    );
}
