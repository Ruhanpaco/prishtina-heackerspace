"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { TerminalPong } from "@/components/ui/terminal-pong";

export default function NotFound() {
    const [command, setCommand] = useState("");
    const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [bootText, setBootText] = useState("SYSTEM_BOOT_SEQUENCE_INITIATED...");
    const [gameMode, setGameMode] = useState(false);

    // Boot sequence effects for the bottom animation
    useEffect(() => {
        const states = [
            "LOADING_KERNEL_MODULES...",
            "MOUNTING_VIRTUAL_FILESYSTEM...",
            "CHECKING_NETWORK_INTERFACES...",
            "ESTABLISHING_SECURE_LINK...",
            "ERROR: TARGET_SECTOR_NOT_FOUND",
            "WAITING_FOR_ADMIN_INPUT..."
        ];
        let i = 0;
        const interval = setInterval(() => {
            setBootText(states[i % states.length]);
            i++;
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    // Initialize Terminal
    useEffect(() => {
        const bootSequence = async () => {
            const ASCII_404 = [
                "  _  _    ___  _  _   ",
                " | || |  / _ \\| || |  ",
                " | || |_| | | | || |_ ",
                " |__   _| |_| |__   _|",
                "    |_|  \\___/   |_|  ",
            ];

            const systemInfo = [
                " ",
                "--------------------------------------------------",
                "OS:         FLOSSK_SECURE_KERNEL v6.4",
                "HOST:       PRISHTINA_HACKERSPACE_NODE_01",
                "UPTIME:     99.9999%",
                "SHELL:      ZSH 5.9 (x86_64-flossk-linux-gnu)",
                "CPU:        QUANTUM_CORE_i9 @ 128GHz",
                "MEMORY:     256TB ECC RAM",
                "STATUS:     CONNECTION_LOST [ERR_404]",
                "--------------------------------------------------",
                " ",
                ...ASCII_404,
                " ",
                "> ALERT: SIGNATURE VERIFICATION FAILED",
                "> DIAGNOSTIC: THE REQUESTED PAGE DOES NOT EXIST",
                "> TYPE 'help' FOR AVAILABLE COMMANDS...",
            ];

            // Only set system info, logo is now an image
            setTerminalOutput(systemInfo);
        };

        bootSequence();
        inputRef.current?.focus();
    }, []);

    // Auto-scroll to bottom of terminal
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [terminalOutput]);

    const handleCommand = (e: React.FormEvent) => {
        e.preventDefault();
        const cmd = command.trim().toLowerCase();

        // Don't process input if command is empty, just new prompt
        if (!cmd) {
            addOutput("visitor@flossk:~$");
            return;
        }

        addOutput(`visitor@flossk:~$ ${command}`);

        if (cmd === "help") {
            addOutput("AVAILABLE COMMANDS:");
            addOutput("  home         - Warp to command center (Dashboard)");
            addOutput("  back         - Reverse trajectory (Go Back)");
            addOutput("  status       - System status report");
            addOutput("  clear        - Clear terminal buffer");
            addOutput("  pong         - Launch hidden protocol 0x01");
            addOutput("  sudo reboot  - Force system reboot");
        } else if (cmd === "home") {
            addOutput("INITIATING WARP TO HOME...");
            setTimeout(() => router.push("/dashboard"), 800);
        } else if (cmd === "back") {
            addOutput("REVERSING TRAJECTORY...");
            setTimeout(() => router.back(), 800);
        } else if (cmd === "status") {
            addOutput("SYSTEM: ONLINE");
            addOutput("CONNECTION: SECURE");
            addOutput("LOCATION: UNKNOWN_VOID (404)");
        } else if (cmd === "clear") {
            setTerminalOutput([]);
        } else if (cmd === "pong") {
            addOutput("LAUNCHING HIDDEN PROTOCOL...");
            setTimeout(() => setGameMode(true), 800);
        } else if (cmd === "sudo reboot") {
            addOutput("REBOOTING SYSTEM...");
            setTimeout(() => window.location.reload(), 1500);
        } else {
            addOutput(`UNKNOWN COMMAND: ${cmd}. TYPE 'help'.`);
        }
        setCommand("");
    };

    const addOutput = (text: string) => {
        setTerminalOutput(prev => [...prev, text]);
    };

    return (
        <div
            className="min-h-screen bg-[#0a0a0f] text-[#00ff00] font-mono p-4 sm:p-8 flex flex-col overflow-hidden selection:bg-[#00ff00] selection:text-black"
            onClick={() => inputRef.current?.focus()}
        >
            {/* Background Static/Scanlines */}
            <div className="fixed inset-0 pointer-events-none opacity-10">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%]" />
            </div>

            {/* Main Terminal Area - Full Page */}
            <div className="flex-1 w-full max-w-6xl mx-auto relative z-20 flex flex-col">

                {/* Scrollable Output */}
                <div
                    ref={containerRef}
                    className="flex-1 overflow-y-auto scrollbar-none space-y-1 pb-4"
                >
                    {/* SVG LOGO - Unselectable & Copy Protected */}
                    <div className="mb-6 select-none pointer-events-none" onContextMenu={(e) => e.preventDefault()}>
                        <Image
                            src="/assets/images/flossk-ASCII.svg"
                            alt="FLOSSK ASCII Logo"
                            width={800} // Approximate width, responsiveness handled by class
                            height={400} // Approximate height
                            className="w-full max-w-2xl opacity-90 object-contain object-left pointer-events-none select-none"
                            draggable={false}
                        />
                    </div>

                    {terminalOutput.map((line, i) => (
                        <div key={i} className="whitespace-pre-wrap break-all leading-tight">
                            {/* Retro Glow Effect on Text */}
                            <span className="drop-shadow-[0_0_2px_rgba(0,255,0,0.4)] text-[10px] sm:text-xs md:text-sm">
                                {line}
                            </span>
                        </div>
                    ))}

                    {/* Input Line */}
                    <form onSubmit={handleCommand} className="flex items-center gap-2 pt-2">
                        <span className="text-[#00ff00] font-bold drop-shadow-[0_0_2px_rgba(0,255,0,0.8)] text-sm sm:text-base">
                            visitor@flossk:~$
                        </span>
                        <input
                            ref={inputRef}
                            type="text"
                            className="bg-transparent border-none outline-none text-[#00ff00] focus:ring-0 w-full font-mono caret-[#00ff00] text-sm sm:text-base drop-shadow-[0_0_2px_rgba(0,255,0,0.4)]"
                            value={command}
                            onChange={(e) => setCommand(e.target.value)}
                            autoFocus
                            spellCheck={false}
                            autoComplete="off"
                        />
                    </form>
                </div>
            </div>

            {/* Footer Boot Animation */}
            <div className="fixed bottom-0 left-0 w-full bg-black/90 p-2 border-t border-[#00ff00]/20 z-30">
                <div className="max-w-6xl mx-auto flex items-center justify-between text-[10px] sm:text-xs text-[#00ff00]/60 uppercase tracking-widest font-bold">
                    <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                            <span className="animate-pulse">●</span>
                            <span className="animate-pulse delay-75">●</span>
                            <span className="animate-pulse delay-150">●</span>
                        </div>
                        <span>{bootText}</span>
                    </div>
                    <div>
                        MEM: OK | CPU: OK | NET: ERROR
                    </div>
                </div>
                {/* Progress Bar */}
                <div className="h-0.5 w-full bg-[#00ff00]/10 mt-2 overflow-hidden">
                    <div className="h-full bg-[#00ff00]/50 w-2/3 animate-[shimmer_2s_infinite_linear]" />
                </div>
            </div>

            {/* Game Overlay */}
            {gameMode && (
                <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
                    <TerminalPong onClose={() => setGameMode(false)} />
                </div>
            )}

            <style jsx global>{`
        @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }
      `}</style>
        </div>
    );
}
