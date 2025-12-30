"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";

export function VerifyContent() {
    const [otp, setOtp] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsVerifying(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsVerifying(false);
        // Redirect logic would go here
    };

    return (
        <div className="w-full h-screen lg:grid lg:grid-cols-2 overflow-hidden bg-background">
            {/* Left Side - Hero Image (Consistent with Login) */}
            <div className="hidden lg:block relative h-full w-full bg-brand-dark">
                <Image
                    src="/assets/images/Instagram Photo 509396115.jpg"
                    alt="Prishtina Hackerspace Community"
                    fill
                    className="object-cover opacity-90"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/90 via-brand-dark/20 to-transparent" />
                <div className="absolute bottom-12 left-12 p-6 text-white z-10">
                    <h2 className="text-4xl font-black uppercase tracking-tighter mb-2 leading-none">Identity<br />Verification</h2>
                </div>
            </div>

            {/* Right Side - Verify Form */}
            <div className="flex items-center justify-center h-full w-full p-8">
                <div className="w-full max-w-[400px] space-y-8 text-center">
                    <div className="flex flex-col space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">Check your email</h1>
                        <p className="text-sm text-muted-foreground">
                            We've sent a 6-digit verification code to your email. Enter it below to confirm your account.
                        </p>
                    </div>

                    <form onSubmit={handleVerify} className="space-y-6">
                        <div className="flex justify-center">
                            <InputOTP maxLength={6} value={otp} onChange={(value: string) => setOtp(value)}>
                                <InputOTPGroup>
                                    <InputOTPSlot index={0} />
                                    <InputOTPSlot index={1} />
                                    <InputOTPSlot index={2} />
                                    <InputOTPSlot index={3} />
                                    <InputOTPSlot index={4} />
                                    <InputOTPSlot index={5} />
                                </InputOTPGroup>
                            </InputOTP>
                        </div>

                        <Button
                            className="w-full bg-brand-yellow text-brand-dark hover:bg-brand-yellow/90 font-bold"
                            type="submit"
                            disabled={otp.length < 6 || isVerifying}
                        >
                            {isVerifying ? "Verifying..." : "Verify Email"}
                        </Button>
                    </form>

                    <div className="pt-4 text-center text-sm">
                        Didn&apos;t receive the code?{" "}
                        <button className="font-bold text-foreground hover:text-brand-yellow transition-colors underline underline-offset-4" onClick={() => alert("Resend triggered")}>
                            Resend Code
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
