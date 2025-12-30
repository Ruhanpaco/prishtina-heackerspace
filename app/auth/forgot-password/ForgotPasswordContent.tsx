"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordContent() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/v2/POST/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(true);
            } else {
                setError(data.error || "Failed to send reset email");
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="relative min-h-screen flex items-center justify-center p-4 font-sans selection:bg-brand-yellow/30 overflow-hidden">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/assets/images/background/image.png"
                        alt="Background"
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-[#1D1D1B]/80 backdrop-blur-[2px]" />
                </div>

                {/* Main Content Card */}
                <div className="relative z-10 w-full max-w-[480px] group">
                    {/* Glow effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-brand-yellow/20 rounded-[2rem] blur-xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>

                    <div className="relative flex flex-col items-center bg-[#1D1D1B] border border-white/10 rounded-[2rem] p-8 sm:p-12 shadow-2xl overflow-hidden text-center">
                        <div className="mb-6 w-20 h-20 bg-brand-yellow/10 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-10 h-10 text-brand-yellow" />
                        </div>

                        <h2 className="text-2xl font-black text-brand-light uppercase tracking-tighter mb-4">
                            Check Your Email
                        </h2>

                        <p className="text-gray-400 text-sm font-medium tracking-wide mb-8">
                            We've sent password reset instructions to <strong className="text-brand-light">{email}</strong>.
                            The link will expire in 1 hour.
                        </p>

                        <div className="space-y-4 w-full">
                            <button
                                onClick={() => {
                                    setSuccess(false);
                                    setEmail("");
                                }}
                                className="block w-full py-4 rounded-2xl border border-white/10 hover:bg-white/[0.03] text-gray-400 hover:text-white transition-all text-xs font-bold uppercase tracking-[2px]"
                            >
                                Try Another Email
                            </button>

                            <button
                                onClick={() => router.push("/auth/login")}
                                className="block w-full py-4 bg-brand-yellow hover:bg-brand-yellow/90 text-black font-black uppercase tracking-wider rounded-2xl transition-all shadow-[0_0_20px_rgba(253,197,0,0.2)] hover:shadow-[0_0_30px_rgba(253,197,0,0.3)] text-xs"
                            >
                                Back to Login
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen flex items-center justify-center p-4 font-sans selection:bg-brand-yellow/30 overflow-hidden">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/assets/images/background/image.png"
                    alt="Background"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-[#1D1D1B]/80 backdrop-blur-[2px]" />
            </div>

            {/* Main Content Card */}
            <div className="relative z-10 w-full max-w-[480px] group">
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-brand-yellow/20 rounded-[2rem] blur-xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>

                <div className="relative flex flex-col items-center bg-[#1D1D1B] border border-white/10 rounded-[2rem] p-8 sm:p-12 shadow-2xl overflow-hidden">

                    {/* Top Logo Section */}
                    <div className="mb-10 transform hover:scale-105 transition-transform duration-500">
                        <Image
                            src="/assets/images/logos/FLOSSK Hub Logo.png"
                            alt="FLOSSK Logo"
                            width={100}
                            height={100}
                            className="drop-shadow-2xl brightness-110"
                            priority
                        />
                    </div>

                    {/* Header */}
                    <div className="w-full text-center mb-10">
                        <h1 className="text-3xl font-black text-brand-light uppercase tracking-tighter mb-2">
                            Reset Password
                        </h1>
                        <p className="text-gray-400 text-sm font-medium tracking-wide">
                            Enter your email to receive a secure reset link.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="w-full space-y-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-500 ml-1 uppercase tracking-[3px]">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-brand-yellow transition-colors">
                                    <Mail size={14} />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    className="block w-full pl-11 pr-4 py-4 bg-white/[0.03] border border-white/5 rounded-2xl focus:ring-1 focus:ring-brand-yellow/50 focus:border-brand-yellow/50 focus:outline-none transition-all placeholder:text-gray-600 text-brand-light text-sm"
                                    placeholder="your.email@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="text-red-500 text-xs font-bold text-center uppercase tracking-wide bg-red-500/10 p-2 rounded">
                                {error}
                            </div>
                        )}

                        <div className="space-y-3 pt-2">
                            <button
                                type="submit"
                                disabled={isLoading || !email}
                                className="block w-full py-4 bg-brand-yellow hover:bg-brand-yellow/90 text-black font-black uppercase tracking-wider rounded-2xl transition-all shadow-[0_0_20px_rgba(253,197,0,0.2)] hover:shadow-[0_0_30px_rgba(253,197,0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        SENDING...
                                    </>
                                ) : (
                                    "SEND RESET LINK"
                                )}
                            </button>

                            <Link
                                href="/auth/login"
                                className="block w-full py-4 text-center rounded-2xl border border-white/10 hover:bg-white/[0.03] text-gray-400 hover:text-white transition-all text-xs font-bold uppercase tracking-[2px]"
                            >
                                Back to Login
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
